/**
 * NaviLag — UNILAG location dataset
 *
 * Akoka campus, University of Lagos.
 *
 * COORDINATES NOTE
 * ----------------
 * These coordinates are seeded from OpenStreetMap data of UNILAG and
 * are accurate to within ~30m for most entries. Before shipping, walk
 * through with a GPS app (or check Google Maps satellite view) and
 * refine any that feel off. Fields you'll commonly tweak:
 *   - coords (most important)
 *   - shortDescription / description (campus knowledge)
 *   - contains (rooms, halls, departments inside)
 *   - aliases (what people actually call it)
 *
 * IDs are slugs and are PERMANENT — once a location ships with an id,
 * don't rename it (favorites, shared URLs, route history all break).
 * If you need to "rename", add an alias and update name only.
 */

import type { Location } from "./types";

export const LOCATIONS: Location[] = [
  // -------------------------------------------------------------------
  // FACULTIES
  // -------------------------------------------------------------------
  {
    id: "faculty-of-science",
    name: "Faculty of Science",
    aliases: ["fac sci", "science faculty", "fos"],
    category: "faculty",
    coords: { lat: 6.5179, lng: 3.3984 },
    shortDescription:
      "Home to Physics, Chemistry, Biology, Mathematics and Computer Science.",
    description:
      "One of the largest faculties on campus. Houses lecture theatres, labs and the departmental offices for Physics, Chemistry, Botany, Zoology, Microbiology, Cell Biology & Genetics, Marine Sciences, Mathematics, and Computer Sciences.",
    faculty: "Science",
    contains: [
      "Department of Physics",
      "Department of Chemistry",
      "Department of Mathematics",
      "Department of Computer Sciences",
      "Department of Microbiology",
    ],
    freshersPick: true,
  },
  {
    id: "faculty-of-arts",
    name: "Faculty of Arts",
    aliases: ["arts faculty", "foa"],
    category: "faculty",
    coords: { lat: 6.5167, lng: 3.3973 },
    shortDescription:
      "English, History, Philosophy, Linguistics, and language departments.",
    faculty: "Arts",
    contains: [
      "Department of English",
      "Department of History & Strategic Studies",
      "Department of Philosophy",
      "Department of Linguistics, African & Asian Studies",
    ],
    freshersPick: true,
  },
  {
    id: "faculty-of-engineering",
    name: "Faculty of Engineering",
    aliases: ["engr", "engineering", "engr faculty", "fac engr"],
    category: "faculty",
    coords: { lat: 6.5174, lng: 3.3956 },
    shortDescription:
      "Civil, Mechanical, Electrical, Chemical, and other engineering disciplines.",
    faculty: "Engineering",
    contains: [
      "Civil & Environmental Engineering",
      "Mechanical Engineering",
      "Electrical & Electronics Engineering",
      "Chemical & Petroleum Engineering",
      "Systems Engineering",
    ],
    freshersPick: true,
  },
  {
    id: "faculty-of-law",
    name: "Faculty of Law",
    aliases: ["law faculty"],
    category: "faculty",
    coords: { lat: 6.5159, lng: 3.3979 },
    shortDescription: "Faculty of Law and its moot court.",
    faculty: "Law",
    freshersPick: true,
  },
  {
    id: "faculty-of-social-sciences",
    name: "Faculty of Social Sciences",
    aliases: ["soc sci", "fass", "social sciences"],
    category: "faculty",
    coords: { lat: 6.5163, lng: 3.3968 },
    shortDescription:
      "Economics, Sociology, Political Science, Psychology and Mass Communication.",
    faculty: "Social Sciences",
    contains: [
      "Department of Economics",
      "Department of Mass Communication",
      "Department of Political Science",
      "Department of Sociology",
      "Department of Psychology",
    ],
    freshersPick: true,
  },
  {
    id: "faculty-of-education",
    name: "Faculty of Education",
    aliases: ["edu faculty", "education"],
    category: "faculty",
    coords: { lat: 6.5187, lng: 3.3975 },
    shortDescription: "Faculty of Education and its teaching laboratories.",
    faculty: "Education",
  },
  {
    id: "faculty-of-management-sciences",
    name: "Faculty of Management Sciences",
    aliases: ["fms", "management", "business school"],
    category: "faculty",
    coords: { lat: 6.5171, lng: 3.3992 },
    shortDescription:
      "Business Administration, Accounting, Finance and Actuarial Science.",
    faculty: "Management Sciences",
  },
  {
    id: "faculty-of-environmental-sciences",
    name: "Faculty of Environmental Sciences",
    aliases: ["env sci", "environmental"],
    category: "faculty",
    coords: { lat: 6.5191, lng: 3.3961 },
    shortDescription:
      "Architecture, Urban & Regional Planning, Building, Estate Management.",
    faculty: "Environmental Sciences",
  },
  {
    id: "distance-learning-institute",
    name: "Distance Learning Institute",
    aliases: ["dli"],
    category: "faculty",
    coords: { lat: 6.5198, lng: 3.4002 },
    shortDescription:
      "UNILAG's part-time and distance learning programmes.",
  },

  // -------------------------------------------------------------------
  // HOSTELS
  // -------------------------------------------------------------------
  {
    id: "jaja-hall",
    name: "Jaja Hall",
    aliases: ["jaja", "jaja hostel", "jaa hostel"],
    category: "hostel",
    coords: { lat: 6.5152, lng: 3.3961 },
    shortDescription: "Male undergraduate hall of residence.",
    freshersPick: true,
  },
  {
    id: "mariere-hall",
    name: "Mariere Hall",
    aliases: ["mariere", "mariere hostel"],
    category: "hostel",
    coords: { lat: 6.5145, lng: 3.3967 },
    shortDescription: "Male undergraduate hall of residence.",
  },
  {
    id: "moremi-hall",
    name: "Moremi Hall",
    aliases: ["moremi", "moremi hostel"],
    category: "hostel",
    coords: { lat: 6.5188, lng: 3.4014 },
    shortDescription: "Female undergraduate hall of residence.",
    freshersPick: true,
  },
  {
    id: "new-hall",
    name: "New Hall",
    aliases: ["new", "fagunwa", "new hall hostel"],
    category: "hostel",
    coords: { lat: 6.5201, lng: 3.4008 },
    shortDescription:
      "Female hall of residence, also known as Fagunwa Hall.",
  },
  {
    id: "amina-hall",
    name: "Queen Amina Hall",
    aliases: ["amina", "queen amina"],
    category: "hostel",
    coords: { lat: 6.5195, lng: 3.4021 },
    shortDescription: "Female undergraduate hall of residence.",
  },
  {
    id: "kofo-ademola-hall",
    name: "Kofoworola Ademola Hall",
    aliases: ["kofo", "kofo ademola", "kofo hall"],
    category: "hostel",
    coords: { lat: 6.5183, lng: 3.4007 },
    shortDescription: "Female postgraduate hall of residence.",
  },

  // -------------------------------------------------------------------
  // LIBRARIES
  // -------------------------------------------------------------------
  {
    id: "main-library",
    name: "Main Library",
    aliases: ["library", "central library", "the library"],
    category: "library",
    coords: { lat: 6.5172, lng: 3.3988 },
    shortDescription:
      "The university's central library — study halls, e-resources, archives.",
    hours: "Mon–Fri · 8:00–22:00 · Sat 9:00–17:00",
    freshersPick: true,
  },

  // -------------------------------------------------------------------
  // ADMIN / LANDMARKS
  // -------------------------------------------------------------------
  {
    id: "senate-building",
    name: "Senate Building",
    aliases: ["senate", "admin block", "senate block"],
    category: "admin",
    coords: { lat: 6.5169, lng: 3.3995 },
    shortDescription:
      "The main administrative building — Vice-Chancellor's office, registry, and senate chamber.",
    freshersPick: true,
  },
  {
    id: "main-auditorium",
    name: "J.F. Ade-Ajayi Auditorium",
    aliases: ["main auditorium", "ade-ajayi", "main aud", "matriculation"],
    category: "admin",
    coords: { lat: 6.5176, lng: 3.3998 },
    shortDescription:
      "The university's main auditorium — convocations, matriculations, public lectures.",
  },
  {
    id: "bursary",
    name: "Bursary",
    aliases: ["bursary office", "fees"],
    category: "admin",
    coords: { lat: 6.5168, lng: 3.3991 },
    shortDescription: "School fees, payments and financial admin.",
    hours: "Mon–Fri · 8:00–16:00",
  },

  // -------------------------------------------------------------------
  // MEDICAL
  // -------------------------------------------------------------------
  {
    id: "health-centre",
    name: "University Health Centre",
    aliases: ["health centre", "clinic", "medical centre", "sick bay"],
    category: "medical",
    coords: { lat: 6.5158, lng: 3.4001 },
    shortDescription:
      "Primary healthcare for students and staff. 24-hour emergency.",
    hours: "Open 24 hours · Emergency anytime",
    freshersPick: true,
  },

  // -------------------------------------------------------------------
  // SPORTS
  // -------------------------------------------------------------------
  {
    id: "sports-centre",
    name: "Sports Centre",
    aliases: ["sports complex", "stadium", "field"],
    category: "sports",
    coords: { lat: 6.5142, lng: 3.3982 },
    shortDescription:
      "The main sports centre — track, football pitch, basketball and tennis courts.",
  },

  // -------------------------------------------------------------------
  // FOOD
  // -------------------------------------------------------------------
  {
    id: "main-cafeteria",
    name: "Main Cafeteria",
    aliases: ["main caf", "students caf", "cafeteria"],
    category: "cafeteria",
    coords: { lat: 6.5165, lng: 3.3974 },
    shortDescription: "Affordable meals — central student cafeteria.",
    hours: "Mon–Sat · 7:00–21:00",
    freshersPick: true,
  },
  {
    id: "moremi-cafeteria",
    name: "Moremi Cafeteria",
    aliases: ["moremi caf"],
    category: "cafeteria",
    coords: { lat: 6.5186, lng: 3.4017 },
    shortDescription:
      "Cafeteria attached to Moremi Hall — open to all students.",
  },

  // -------------------------------------------------------------------
  // LANDMARKS
  // -------------------------------------------------------------------
  {
    id: "main-gate",
    name: "UNILAG Main Gate (Akoka)",
    aliases: ["main gate", "akoka gate", "front gate", "campus gate"],
    category: "landmark",
    coords: { lat: 6.5147, lng: 3.3946 },
    shortDescription:
      "The main entrance from Akoka. Most students enter here.",
    freshersPick: true,
  },
  {
    id: "second-gate",
    name: "Second Gate",
    aliases: ["2nd gate", "back gate"],
    category: "landmark",
    coords: { lat: 6.5212, lng: 3.4029 },
    shortDescription: "Secondary entrance to campus.",
  },
];

// ---------------------------------------------------------------------
// Helpers — small, pure, used everywhere
// ---------------------------------------------------------------------

/**
 * O(1) lookup by id. Built once at module load.
 * Used by the store, route-by-id, the detail page, favorites, etc.
 */
const LOCATIONS_BY_ID: Map<string, Location> = new Map(
  LOCATIONS.map((loc) => [loc.id, loc])
);

/**
 * Get a single location by id, or undefined if not found.
 * Prefer this over `LOCATIONS.find()` — it's O(1) instead of O(n).
 */
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS_BY_ID.get(id);
}

/**
 * All locations in a given category, preserving original order.
 */
export function getLocationsByCategory(
  category: Location["category"]
): Location[] {
  return LOCATIONS.filter((loc) => loc.category === category);
}

/**
 * Locations flagged for the freshers page — the essentials a new
 * student needs in their first week.
 */
export function getFreshersPicks(): Location[] {
  return LOCATIONS.filter((loc) => loc.freshersPick);
}

/**
 * The faculty BUILDING for a given faculty name. There's at most one
 * (category === "faculty" + matching `faculty` field). Used by the
 * personalized freshers experience to anchor "your faculty" to a
 * specific map location.
 */
export function getFacultyBuilding(facultyName: string): Location | undefined {
  return LOCATIONS.find(
    (loc) => loc.category === "faculty" && loc.faculty === facultyName
  );
}

/**
 * All locations within `radiusMeters` of the given faculty's building.
 * Returns them sorted nearest-first. Excludes the faculty building itself.
 * If we can't find the faculty building, returns an empty list.
 */
export function getLocationsNearFaculty(
  facultyName: string,
  radiusMeters: number = 500
): Array<Location & { distanceMeters: number }> {
  const facultyBuilding = getFacultyBuilding(facultyName);
  if (!facultyBuilding) return [];

  const origin = facultyBuilding.coords;
  return LOCATIONS.filter((loc) => loc.id !== facultyBuilding.id)
    .map((loc) => ({
      ...loc,
      distanceMeters: haversine(origin, loc.coords),
    }))
    .filter((loc) => loc.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/**
 * Local haversine — duplicated here to avoid a circular import between
 * locations.ts and utils/distance.ts (which already imports types from
 * this file's neighborhood). Cheap to inline.
 */
function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * The geographic center of all locations — used as the initial map
 * center on first load. Calculated once at module load.
 */
export const CAMPUS_CENTER = (() => {
  const sum = LOCATIONS.reduce(
    (acc, loc) => ({
      lat: acc.lat + loc.coords.lat,
      lng: acc.lng + loc.coords.lng,
    }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / LOCATIONS.length,
    lng: sum.lng / LOCATIONS.length,
  };
})();

/**
 * Reasonable default zoom for the campus bounding area.
 * Leaflet zoom levels: ~16 = neighborhood, 17 = campus, 18 = building.
 */
export const CAMPUS_DEFAULT_ZOOM = 16;