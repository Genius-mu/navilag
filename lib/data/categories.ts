/**
 * NaviLag — Category catalog
 *
 * One source of truth for all eight place categories.
 * Markers, filter chips, the freshers grid, and the legend all read
 * from CATEGORIES below. To add a new type of place, you:
 *   1. Add its id to `CategoryId` in types.ts
 *   2. Add a CSS var in globals.css (--cat-newthing)
 *   3. Add an entry here
 */

import type { Category, CategoryId } from "./types";

export const CATEGORIES: Record<CategoryId, Category> = {
  faculty: {
    id: "faculty",
    label: "Faculties",
    singular: "Faculty",
    colorVar: "--cat-faculty",
    icon: "Building2",
    description: "Academic faculties and their departments.",
  },
  hostel: {
    id: "hostel",
    label: "Hostels",
    singular: "Hostel",
    colorVar: "--cat-hostel",
    icon: "BedDouble",
    description: "On-campus halls of residence.",
  },
  library: {
    id: "library",
    label: "Libraries",
    singular: "Library",
    colorVar: "--cat-library",
    icon: "BookOpen",
    description: "Main library and faculty reading rooms.",
  },
  cafeteria: {
    id: "cafeteria",
    label: "Food",
    singular: "Cafeteria",
    colorVar: "--cat-cafeteria",
    icon: "Coffee",
    description: "Cafeterias, food courts, and kiosks.",
  },
  admin: {
    id: "admin",
    label: "Admin",
    singular: "Admin building",
    colorVar: "--cat-admin",
    icon: "Landmark",
    description: "Senate, Bursary, Registry and other admin offices.",
  },
  sports: {
    id: "sports",
    label: "Sports",
    singular: "Sports facility",
    colorVar: "--cat-sports",
    icon: "Dumbbell",
    description: "Sports centre, fields, courts and gym.",
  },
  medical: {
    id: "medical",
    label: "Medical",
    singular: "Medical",
    colorVar: "--cat-medical",
    icon: "Stethoscope",
    description: "Health centre and clinics on campus.",
  },
  landmark: {
    id: "landmark",
    label: "Landmarks",
    singular: "Landmark",
    colorVar: "--cat-landmark",
    icon: "MapPin",
    description: "Gates, parks, monuments and lagoon front.",
  },
};

/**
 * Stable order for rendering — the order categories appear in chip rows,
 * the freshers grid, the filter UI, and the map legend.
 */
export const CATEGORY_ORDER: CategoryId[] = [
  "faculty",
  "hostel",
  "library",
  "cafeteria",
  "admin",
  "sports",
  "medical",
  "landmark",
];

/**
 * Array form — handy for `.map()` over categories in JSX without losing order.
 */
export const CATEGORY_LIST: Category[] = CATEGORY_ORDER.map(
  (id) => CATEGORIES[id],
);

/**
 * Tiny helper. Throws if you ask for an unknown id, which is intentional —
 * it means the dataset is referencing a category that no longer exists.
 */
export function getCategory(id: CategoryId): Category {
  const category = CATEGORIES[id];
  if (!category) {
    throw new Error(`Unknown category: ${id}`);
  }
  return category;
}

/**
 * Returns the CSS color string for a category, e.g. "var(--cat-faculty)".
 * Use this in inline styles when you can't reach Tailwind utility classes
 * (e.g. setting marker fill on dynamically-generated SVGs).
 */
export function getCategoryColor(id: CategoryId): string {
  return `var(${CATEGORIES[id].colorVar})`;
}
