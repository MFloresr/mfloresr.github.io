const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
    });
  });
}

const header = document.querySelector(".site-header");

if (header) {
  const updateHeader = () => {
    header.style.borderBottomColor =
      window.scrollY > 20 ? "rgba(255, 255, 255, 0.1)" : "transparent";
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

const revealElements = document.querySelectorAll(
  ".section, .tech-card, .project-card, .contact-box"
);

if ("IntersectionObserver" in window && revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
    }
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}
