import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = [
        { id: "home", min: 0 },
        { id: "about" },
        { id: "services" },
        { id: "doctors" },
        { id: "contact" },
        { id: "blog" },
      ];
      const scrollY = window.scrollY || window.pageYOffset;
      const buffer = 120; // adjust for sticky nav height
      let current = "home";
      for (let i = 1; i < sections.length; i++) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const top = section.getBoundingClientRect().top + scrollY - buffer;
          if (scrollY >= top) {
            current = sections[i].id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScrollSpy);
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans flex flex-col min-h-screen">
      <Header activeSection={activeSection} />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;