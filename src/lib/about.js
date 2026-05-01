import { sql } from "@/lib/db";

export const ABOUT_DEFAULTS = {
  about: "- Based in Palo Alto",
  currently:
    "On a gap year working on several SWE and engineering projects and an incoming Computer Engineering major at the University of Maryland.",
  previous_education: "Homestead High School",
  interests:
    "Software Development, Agentic AI, machine learning, physical AI, robotics, embedded systems.",
};

export const ABOUT_FIELDS = [
  "about",
  "currently",
  "previous_education",
  "interests",
];

export async function getAbout() {
  const { rows } = await sql`
    SELECT content FROM site_content WHERE key = 'about'
  `;
  const stored = rows[0]?.content || {};
  return { ...ABOUT_DEFAULTS, ...stored };
}
