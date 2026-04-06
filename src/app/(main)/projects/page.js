import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Projects() {
  const { rows: projects } = await sql`
    SELECT id, title, description, tags, github_url, website_url, demo_url, year
    FROM projects
    WHERE is_published = true
    ORDER BY sort_order ASC, created_at DESC
  `;

  return (
    <div className="cards">
      {projects.map((project) => (
        <div className="card" key={project.id}>
          <div className="card-header">
            <h3>{project.title}</h3>
            <div className="card-header-tags">
              {project.tags.map((tag) => (
                <span className="card-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <p className="card-description">{project.description}</p>

          <div className="card-meta">
            <a href={project.github_url} target="_blank">GitHub</a>
            {project.website_url ? (
              <a href={project.website_url} target="_blank">Website</a>
            ) : (
              <span className="card-meta-disabled">Website</span>
            )}
            {project.demo_url ? (
              <a href={project.demo_url} target="_blank">Demo</a>
            ) : (
              <span className="card-meta-disabled">Demo</span>
            )}
            <span className="card-meta-year">{project.year}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
