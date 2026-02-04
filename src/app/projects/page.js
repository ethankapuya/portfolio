export default function Projects() {
    return (
        <div className="cards">
            <div className="card">
                <div className="card-header">
                    <h3>Portfolio Website</h3>
                    <div className="card-header-tags">
                        <span className="card-tag">Next.js</span>
                        <span className="card-tag">Node</span>
                        <span className="card-tag">JS</span>
                        <span className="card-tag">React</span>
                        <span className="card-tag">Git</span>
                    </div>
                </div>

                <p className="card-description">
                    Personal portfolio built with Next.js, with a custom layout system and responsive web design.
                </p>

                <div className="card-meta">
                    <a href="https://github.com/ethankapuya/portfolio" target="_blank">
                        GitHub
                    </a>
                    <span>2026</span>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h3>React Streaming App</h3>
                    <div className="card-header-tags">
                        <span className="card-tag">Vite</span>
                        <span className="card-tag">Node</span>
                        <span className="card-tag">JS</span>
                        <span className="card-tag">React</span>
                        <span className="card-tag">Firebase</span>
                        <span className="card-tag">Appwrite</span>
                        <span className="card-tag">Git</span>
                    </div>
                </div>

                <p className="card-description">
                    A web application for discovering and searching
                    information on movies from a huge database of movies.
                </p>

                <div className="card-meta">
                    <a href="https://github.com/ethankapuya/react-streaming-app" target="_blank">
                        GitHub
                    </a>
                    <span>2025-2026</span>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h3>Tensorflow Facemesh App</h3>
                    <div className="card-header-tags">
                        <span className="card-tag">Create React App</span>
                        <span className="card-tag">Node</span>
                        <span className="card-tag">JS</span>
                        <span className="card-tag">React</span>
                        <span className="card-tag">Git</span>
                        <span className="card-tag">Tensorflow.js</span>
                    </div>
                </div>

                <p className="card-description">
                    A web application that displays users' webcam video feed, detects face positions and expressions,
                    and maps a triangulated mesh over the faces visible in the feed.
                </p>

                <div className="card-meta">
                    <a href="https://github.com/ethankapuya/tensorflow-facemesh-app" target="_blank">
                        GitHub
                    </a>
                    <a href="https://ethankapuya.github.io/tensorflow-facemesh-app" target="_blank">
                        Website
                    </a>
                    <span>2026</span>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h3>Spotify Clone</h3>
                    <div className="card-header-tags">
                        <span className="card-tag">Fast API</span>
                        <span className="card-tag">Python</span>
                        <span className="card-tag">Flutter</span>
                        <span className="card-tag">PostgreSQL</span>
                        <span className="card-tag">Riverpod</span>
                        <span className="card-tag">Cloudinary</span>
                        <span className="card-tag">Hive</span>
                    </div>
                </div>

                <p className="card-description">
                    An emulation of the Spotify app on Android, with near-identical functionality. Still in the works :)
                </p>

                <div className="card-meta">
                    <a href="https://github.com/ethankapuya/spotify-clone" target="_blank">
                        GitHub
                    </a>
                    <span>TBD</span>
                </div>
            </div>
        </div>
    );
}