import { Analytics } from "@vercel/analytics/next"
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../styles/layout.css"; // main CSS

export const metadata = {
    title: "Ethan Kapuya – Portfolio",
};

export default function RootLayout({ children }) {
    const tabs = ["About Me", "Page", "Projects", "Resume", "Contact Me"];

    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <div className="layout">
                    <Header />
                    <div className="content-wrapper">
                        <Sidebar/>
                        <div className="main">
                            {/* Main content text box */}
                            {children}
                        </div>
                    </div>
                </div>
                <Analytics />
            </body>
        </html>
    );
}
