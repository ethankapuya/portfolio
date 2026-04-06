import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <div className="main">{children}</div>
      </div>
    </div>
  );
}
