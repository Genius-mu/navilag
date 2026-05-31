/**
 * NaviLag — App icon (favicon)
 *
 * Next.js generates the favicon from this file at build time. The output
 * is a 32×32 PNG that browsers use in tabs, bookmarks, history, etc.
 *
 * To change the design, edit the JSX below — Next handles the rest.
 *
 * Note: keep this file as small/simple as possible. Browsers render the
 * favicon at tiny sizes (16px in tabs), so detail is wasted.
 */

import { ImageResponse } from "next/og";

// Tell Next this is a static asset (cached forever after first build)
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#3b9eff",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0a0a0c",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          lineHeight: 1,
          letterSpacing: -1,
        }}
      >
        N
      </div>
    ),
    { ...size }
  );
}