import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Experience() {
    const { rows: experiences } = await sql`
        SELECT id, title, tags, description, period
        FROM experiences
        ORDER BY sort_order ASC, id ASC
    `;

    return (
        <div>
            {experiences.map((e) => (
                <div className="card" key={e.id}>
                    <div className="card-header">
                        <h3>{e.title}</h3>
                        <div className="card-header-tags">
                            {(e.tags || []).map((tag, i) => (
                                <span className="card-tag" key={i}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="card-description">{e.description}</p>
                    <div className="card-meta">
                        <span></span>
                        <span>{e.period}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
