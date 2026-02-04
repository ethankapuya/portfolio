"use client";

import Image from "next/image";

export default function Header() {
    return (
        <header className="header">
            <Image
                src="/pfp-round.png"
                alt="Profile Picture"
                width={150}
                height={150}
            />

            <div className="headerRight">
                <h1>Ethan Kapuya</h1>

                <div className="link-groups">
                    <div className="link-group">
                        <span className="group-title">Social:</span>
                        <a className="link-item" href="https://github.com/ethankapuya" target="_blank">
                            GitHub
                        </a>
                        <span>,  </span>
                        <a
                            className="link-item"
                            href="https://linkedin.com/in/ethankapuya"
                            target="_blank"
                        >
                            LinkedIn
                        </a>
                        <span>,</span>
                        <a
                            className="link-item"
                            href="https://instagram.com/ethankapuya"
                            target="_blank"
                        >
                            Instagram
                        </a>
                    </div>

                    <div className="link-group">
                        <span className="group-title">Contact:</span>
                        <a className="link-item" href="mailto:ethankapuya@gmail.com">
                            ethankapuya@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
