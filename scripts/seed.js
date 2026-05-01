import "dotenv/config";
import { sql } from "@vercel/postgres";

async function seed() {
  // Create the projects table
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      tags TEXT[] NOT NULL,
      github_url VARCHAR(500) NOT NULL UNIQUE,
      website_url VARCHAR(500),
      demo_url VARCHAR(500),
      year VARCHAR(20) NOT NULL,
      last_commit_sha VARCHAR(40),
      is_published BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Created projects table");

  await sql`
    CREATE TABLE IF NOT EXISTS project_history (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      tags TEXT[] NOT NULL,
      github_url VARCHAR(500) NOT NULL,
      website_url VARCHAR(500),
      demo_url VARCHAR(500),
      year VARCHAR(20) NOT NULL,
      last_commit_sha VARCHAR(40),
      saved_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Created project_history table");

  await sql`
    CREATE TABLE IF NOT EXISTS site_assets (
      key TEXT PRIMARY KEY,
      content BYTEA NOT NULL,
      mime TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Created site_assets table");

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      content JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Created site_content table");

  await sql`
    CREATE TABLE IF NOT EXISTS experiences (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      description TEXT NOT NULL,
      period VARCHAR(100),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Created experiences table");

  // Seed the existing Bearing AI experience if the table is empty
  const { rows: existingExp } = await sql`SELECT COUNT(*)::int AS n FROM experiences`;
  if (existingExp[0].n === 0) {
    await sql`
      INSERT INTO experiences (title, tags, description, period, sort_order)
      VALUES (
        'SWE Internship @ Bearing AI',
        ${["Jupyter Notebook", "Python", "NumPy", "MatPlotLib"]},
        ${"A 4-week full-time collaborative programming experience with a data science assignment in a startup environment. I helped develop Bearing AI's port-to-port nautical distance calculation service in Python designed to pass criteria such as compatibility to use-case, accuracy, and configurability, now in use in Bearing AI's maritime ML platforms. Assisted in comparing various external API distances to a pipeline of benchmark distance datasets based on customer data, and integrated these APIs to the maritime ML platforms for a more accurate and complete port-to-port distance service."},
        'Summer 2024',
        1
      )
    `;
    console.log("Seeded Bearing AI experience");
  }

  // Seed existing projects
  const existing = [
    {
      title: "React Streaming App",
      description:
        "A web application for discovering and searching information on movies from a huge database of movies.",
      tags: ["Vite", "Node", "JS", "React", "Firebase", "Appwrite", "Git"],
      github_url: "https://github.com/ethankapuya/react-streaming-app",
      website_url: "https://ethan-kapuya-streaming.vercel.app/",
      demo_url:
        "https://www.loom.com/share/f4db3bf2e2744b43b2a922f21c608d86",
      year: "2025-2026",
      sort_order: 1,
    },
    {
      title: "Tensorflow Facemesh App",
      description:
        "A web application that displays users' webcam video feed, detects face positions and expressions, and maps a triangulated mesh over the faces visible in the feed.",
      tags: ["CRA", "Node", "JS", "React", "Git", "Tensorflow.js"],
      github_url: "https://github.com/ethankapuya/tensorflow-facemesh-app",
      website_url: "https://ethankapuya.github.io/tensorflow-facemesh-app",
      demo_url:
        "https://www.loom.com/share/6d33691924464f79a9fda96bfaf44363",
      year: "2026",
      sort_order: 2,
    },
    {
      title: "Simple Social",
      description:
        "A minimalistic end-to-end social media web app that lets users globally create and share posts with captions and media.",
      tags: ["FastAPI", "Python", "SQLite", "Streamlit", "ImageKit"],
      github_url: "https://github.com/ethankapuya/simplesocial",
      website_url: "https://simplesocialweb.streamlit.app",
      demo_url:
        "https://www.loom.com/share/6bdb605ccce74858ae6a3a7765f30b81",
      year: "2026",
      sort_order: 3,
    },
    {
      title: "Portfolio Website",
      description:
        "Personal portfolio built with Next.js, with a custom layout system and responsive web design.",
      tags: ["Next.js", "Node", "JS", "React", "Git"],
      github_url: "https://github.com/ethankapuya/portfolio",
      website_url: "https://ethankapuya.vercel.app",
      demo_url:
        "https://www.loom.com/share/4fdfb7ee5e074944b157e2bf68fca0c1",
      year: "2026",
      sort_order: 4,
    },
  ];

  for (const p of existing) {
    await sql`
      INSERT INTO projects (title, description, tags, github_url, website_url, demo_url, year, sort_order)
      VALUES (${p.title}, ${p.description}, ${p.tags}, ${p.github_url}, ${p.website_url}, ${p.demo_url}, ${p.year}, ${p.sort_order})
      ON CONFLICT (github_url) DO NOTHING
    `;
    console.log(`Seeded: ${p.title}`);
  }

  console.log("Done seeding!");
}

seed().catch(console.error);
