import { getAbout } from "@/lib/about";

export const dynamic = "force-dynamic";

export default async function About() {
    const content = await getAbout();
    return (
        <div>
            <h2>About Me</h2>
            <p className="about-text">{content.about}</p>
            <h3>Currently</h3>
            <p className="about-text">{content.currently}</p>
            <h3>Previous Education</h3>
            <p className="about-text">{content.previous_education}</p>
            <h3>Interests</h3>
            <p className="about-text">{content.interests}</p>
        </div>
    );
}
