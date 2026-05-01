import { getContact } from "@/lib/contact";

export const dynamic = "force-dynamic";

export default async function Contact() {
    const content = await getContact();
    return (
        <div>
            <h2>Contact Me</h2>
            <p className="contact-text">{content.body}</p>
        </div>
    );
}
