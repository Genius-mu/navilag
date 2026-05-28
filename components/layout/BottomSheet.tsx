"use client";

/**
 * NaviLag — Bottom Sheet (mobile) / Side Panel (desktop)
 *
 * Mobile: sheet anchored to the bottom of the screen at a chosen
 *   snap height. The sheet itself doesn't change height when
 *   snapping — its top edge moves. Drag the handle up/down to
 *   change snap. Drag past peek to dismiss.
 *
 * Desktop: fixed side panel on the left, no drag.
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";

// ---------------------------------------------------------------------------
// Snap points — expressed as the visible HEIGHT of the sheet
// ---------------------------------------------------------------------------

type Snap = "peek" | "half" | "full";
type SheetSnaps = Record<Snap, number>;

function computeSnaps(viewportHeight: number): SheetSnaps {
  return {
    peek: Math.round(viewportHeight * 0.18), // ~header only
    half: Math.round(viewportHeight * 0.55), // default
    full: Math.round(viewportHeight * 0.92), // nearly full screen
  };
}

const DISMISS_THRESHOLD = 60; // px below peek that counts as dismiss
const FLICK_VELOCITY = 500; // px/s flick threshold

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  initialSnap?: Snap;
  children: React.ReactNode;
};

// ---------------------------------------------------------------------------
// Mobile detection
// ---------------------------------------------------------------------------

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () =>
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ---------------------------------------------------------------------------
// Top-level switch
// ---------------------------------------------------------------------------

export default function BottomSheet({
  open,
  onClose,
  initialSnap = "half",
  children,
}: BottomSheetProps) {
  const isMobile = useIsMobile();

  // Wait for client-side mobile detection before rendering anything.
  // Prevents both versions briefly flashing on hydration.
  if (isMobile === null) return null;

  return (
    <AnimatePresence>
      {open &&
        (isMobile ? (
          <MobileSheet key="mobile" onClose={onClose} initialSnap={initialSnap}>
            {children}
          </MobileSheet>
        ) : (
          <DesktopPanel key="desktop" onClose={onClose}>
            {children}
          </DesktopPanel>
        ))}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Mobile sheet
// ---------------------------------------------------------------------------

function MobileSheet({
  onClose,
  initialSnap = "half",
  children,
}: {
  onClose: () => void;
  initialSnap?: Snap;
  children: React.ReactNode;
}) {
  // Default to a reasonable viewport height server-side / before mount
  const [viewport, setViewport] = useState<number>(() =>
    typeof window === "undefined" ? 800 : window.innerHeight,
  );

  // Track viewport changes (orientation, keyboard show/hide)
  useEffect(() => {
    const update = () => setViewport(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const snaps = computeSnaps(viewport);
  const [currentSnap, setCurrentSnap] = useState<Snap>(initialSnap);

  // The sheet's height = snap value. Animated via motion value.
  const sheetHeight = useMotionValue(snaps[initialSnap]);
  const draggingRef = useRef(false);

  // Animate height when snap changes (and not while dragging)
  useEffect(() => {
    if (draggingRef.current) return;
    const controls = animate(sheetHeight, snaps[currentSnap], {
      type: "spring",
      damping: 32,
      stiffness: 340,
      mass: 0.8,
    });
    return () => controls.stop();
  }, [currentSnap, snaps, sheetHeight]);

  // Backdrop opacity is a function of how open the sheet is
  const backdropOpacity = useTransform(
    sheetHeight,
    [snaps.peek, snaps.full],
    [0.3, 0.6],
  );

  // ---- Drag handlers ---------------------------------------------------

  const handleDragStart = () => {
    draggingRef.current = true;
  };

  const handleDrag = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    // Dragging up (delta y negative) → grow sheet, and vice versa
    const next = sheetHeight.get() - info.delta.y;
    sheetHeight.set(Math.max(40, Math.min(snaps.full + 40, next)));
  };

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    draggingRef.current = false;
    const currentHeight = sheetHeight.get();
    const velocity = info.velocity.y;

    // Strong downward flick from peek → dismiss
    if (currentSnap === "peek" && velocity > FLICK_VELOCITY) {
      onClose();
      return;
    }

    // Dragged below peek - threshold → dismiss
    if (currentHeight < snaps.peek - DISMISS_THRESHOLD) {
      onClose();
      return;
    }

    // Flick changes snap direction
    if (Math.abs(velocity) > FLICK_VELOCITY) {
      const order: Snap[] = ["peek", "half", "full"];
      const idx = order.indexOf(currentSnap);
      // Flick UP (negative velocity) → grow
      if (velocity < 0 && idx < order.length - 1) {
        setCurrentSnap(order[idx + 1]);
        return;
      }
      // Flick DOWN (positive velocity) → shrink
      if (velocity > 0 && idx > 0) {
        setCurrentSnap(order[idx - 1]);
        return;
      }
    }

    // Otherwise snap to nearest
    const distances = (Object.keys(snaps) as Snap[]).map((s) => ({
      snap: s,
      d: Math.abs(snaps[s] - currentHeight),
    }));
    distances.sort((a, b) => a.d - b.d);
    setCurrentSnap(distances[0].snap);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-30 bg-black"
        style={{ opacity: backdropOpacity }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 34, stiffness: 320 }}
        style={{ height: sheetHeight }}
        className="
          fixed inset-x-0 bottom-0 z-40 flex flex-col
          rounded-t-2xl border-t border-border-default bg-bg-overlay/95
          backdrop-blur-xl
          shadow-[0_-12px_32px_rgba(0,0,0,0.6)]
        "
      >
        {/* Drag handle — only this part is draggable */}
        <motion.div
          drag="y"
          dragMomentum={false}
          dragElastic={0}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="flex shrink-0 cursor-grab justify-center pt-2.5 pb-2 active:cursor-grabbing touch-none"
          onClick={() => {
            // Tap handle → cycle to next snap
            const order: Snap[] = ["peek", "half", "full"];
            const idx = order.indexOf(currentSnap);
            setCurrentSnap(order[(idx + 1) % order.length]);
          }}
        >
          <div className="h-1 w-10 rounded-full bg-border-strong" />
        </motion.div>

        {/* Content area — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Desktop side panel
// ---------------------------------------------------------------------------

function DesktopPanel({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="false"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="
        fixed bottom-5 left-5 top-[120px] z-30
        flex w-[380px] flex-col
        overflow-hidden rounded-2xl
        border border-border-default bg-bg-overlay/95
        shadow-[0_12px_32px_rgba(0,0,0,0.6)]
        backdrop-blur-xl
      "
    >
      <div className="flex-1 overflow-y-auto">{children}</div>
    </motion.div>
  );
}
