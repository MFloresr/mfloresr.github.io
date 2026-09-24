// Contenido del CV en PDF (castellano e inglés). Lo lee plantilla.html y lo convierte
// a PDF scripts/generar-cv.mjs. Sale del portfolio (content/) y del perfil de LinkedIn;
// no se publica NIF, fecha de nacimiento ni dirección.
window.CV = {
  es: {
    titulo: "Currículum · Mario Flores Rodríguez",
    nombre: "Mario Flores Rodríguez",
    rol: "Desarrollador <em>full-stack</em>",
    rolExtra: "Sistemas y redes",
    ubicacion: "Barcelona",
    contacto: [
      { etiqueta: "Email", valor: "mrsitofull@gmail.com", href: "mailto:mrsitofull@gmail.com" },
      { etiqueta: "Teléfono", valor: "699 490 441", href: "tel:+34699490441" },
      { etiqueta: "Portfolio", valor: "mfloresr-portfolio.vercel.app", href: "https://mfloresr-portfolio.vercel.app/es" },
      { etiqueta: "GitHub", valor: "github.com/MFloresr", href: "https://github.com/MFloresr" },
      { etiqueta: "LinkedIn", valor: "linkedin.com/in/mario-its-me", href: "https://www.linkedin.com/in/mario-its-me" },
    ],
    secciones: {
      perfil: "Perfil",
      experiencia: "Experiencia",
      formacion: "Formación",
      certificaciones: "Certificaciones",
      habilidades: "Habilidades",
      idiomas: "Idiomas",
      otros: "Otros",
    },
    perfil:
      "Desarrollador full-stack, Técnico Superior en Desarrollo de Aplicaciones Web (DAW) y en Administración de Sistemas Informáticos en Red (ASIR). Mi perfil combina infraestructura y desarrollo, lo que me permite comprender el ciclo completo de una solución informática: de los equipos y la conectividad a los servidores, las bases de datos, el backend, el frontend y el despliegue.",
    experiencia: [
      {
        puesto: "Desarrollador web full-stack",
        empresa: "Proyectos propios",
        fechas: "2017 – actualidad",
        lugar: "Barcelona · en remoto",
        intro: "Desarrollo por cuenta propia de aplicaciones web completas, publicadas y en producción:",
        proyectos: [
          {
            nombre: "Mi Jornada",
            texto: "registro de jornadas laborales con cálculo de horas e importe, y asistente con IA que convierte frases como «ayer de 8 a 14 en la obra» en registros.",
            stack: "Django REST Framework · Vue · PostgreSQL (Supabase) · Vercel",
          },
          {
            nombre: "Sudokus",
            texto: "juego web con cuentas y estadísticas; motor propio que genera los sudokus y califica su dificultad con técnicas humanas; cada jugada se valida en el servidor.",
            stack: "Django · Alpine.js · Tailwind · PostgreSQL",
          },
          {
            nombre: "AgroClima Consultores",
            nota: "proyecto académico",
            texto: "web corporativa con panel de datos climáticos y gestor de contenidos para un cliente no técnico. Lighthouse en móvil: 100.",
            stack: "Astro · Svelte · Sanity · Supabase",
          },
        ],
      },
      {
        puesto: "Programador web",
        empresa: "Sistemes Informàtics ICON S.L.",
        tipo: "Prácticas",
        fechas: "ene. 2016 – jun. 2016",
        lugar: "Figueres",
        tareas: [
          "Gestioné servidores de aplicaciones para desplegar aplicaciones web.",
          "Desarrollé aplicaciones web conectadas a bases de datos según las especificaciones del proyecto.",
          "Instalé, configuré y mantuve WordPress, Joomla y Moodle.",
        ],
      },
      {
        puesto: "Administrador de sistemas",
        empresa: "Fundació Salut Empordà (Hospital de Figueres)",
        tipo: "Prácticas",
        fechas: "dic. 2014 – may. 2015",
        lugar: "Figueres",
        tareas: [
          "Administré sistemas operativos de servidor y configuré software y servicios de red.",
          "Proporcioné soporte técnico remoto y presencial.",
          "Diagnostiqué incidencias y apliqué medidas correctivas.",
        ],
      },
      {
        puesto: "Administrador de equipos informáticos",
        empresa: "La Salle Figueres",
        tipo: "Prácticas",
        fechas: "nov. 2011 – mar. 2012",
        lugar: "Figueres",
        tareas: [
          "Instalé y configuré aplicaciones, equipos y redes locales.",
          "Realicé el mantenimiento de hardware y periféricos.",
          "Elaboré documentación técnica, presupuestos y asesoramiento.",
        ],
      },
    ],
    formacion: [
      { titulo: "Técnico Superior en Desarrollo de Aplicaciones Web (DAW)", centro: "IES Cendrassos, Figueres", fechas: "2015 – 2016" },
      { titulo: "Técnico Superior en Administración de Sistemas Informáticos en Red (ASIR)", centro: "IES Cendrassos, Figueres", fechas: "2013 – 2015" },
      { titulo: "Técnico en Explotación de Sistemas Informáticos", centro: "IES Cendrassos, Figueres", fechas: "2010 – 2012" },
    ],
    certificaciones: [
      { titulo: "CCNA1 · Introduction to Networks", centro: "Cisco Networking Academy", fechas: "2014" },
      { titulo: "CCNA2 · Switching, Routing, and Wireless Essentials", centro: "Cisco Networking Academy", fechas: "2014" },
      { titulo: "CCNA3 · Enterprise Networking, Security, and Automation", centro: "Cisco Networking Academy", fechas: "2015" },
    ],
    habilidades: [
      { grupo: "Backend", items: ["Python", "Django", "Django REST Framework", "APIs REST", "PHP", "Laravel"] },
      { grupo: "Frontend", items: ["JavaScript", "TypeScript", "Vue 3", "Astro", "Svelte", "Alpine.js", "HTML", "CSS", "Tailwind CSS"] },
      { grupo: "Datos", items: ["PostgreSQL", "MySQL", "SQLite", "Supabase", "Sanity (CMS)"] },
      { grupo: "Herramientas", items: ["Git", "GitHub", "Vercel", "VS Code", "npm", "WSL"] },
      { grupo: "Sistemas", items: ["Windows y Windows Server", "Linux", "Directorio Activo", "Redes (Cisco, VLAN, Wi-Fi)", "Soporte técnico"] },
    ],
    idiomas: [
      { idioma: "Español", nivel: "Nativo" },
      { idioma: "Catalán", nivel: "Nivel profesional" },
      { idioma: "Inglés", nivel: "Lectura intermedia, conversación básica" },
    ],
    otros: ["Carnet de conducir B"],
    pie: "Proyectos con demo y código en mfloresr-portfolio.vercel.app",
  },

  en: {
    titulo: "CV · Mario Flores Rodríguez",
    nombre: "Mario Flores Rodríguez",
    rol: "<em>Full-stack</em> developer",
    rolExtra: "Systems & networking",
    ubicacion: "Barcelona, Spain",
    contacto: [
      { etiqueta: "Email", valor: "mrsitofull@gmail.com", href: "mailto:mrsitofull@gmail.com" },
      { etiqueta: "Phone", valor: "+34 699 490 441", href: "tel:+34699490441" },
      { etiqueta: "Portfolio", valor: "mfloresr-portfolio.vercel.app", href: "https://mfloresr-portfolio.vercel.app/en" },
      { etiqueta: "GitHub", valor: "github.com/MFloresr", href: "https://github.com/MFloresr" },
      { etiqueta: "LinkedIn", valor: "linkedin.com/in/mario-its-me", href: "https://www.linkedin.com/in/mario-its-me" },
    ],
    secciones: {
      perfil: "Profile",
      experiencia: "Experience",
      formacion: "Education",
      certificaciones: "Certifications",
      habilidades: "Skills",
      idiomas: "Languages",
      otros: "Other",
    },
    perfil:
      "Full-stack developer with Higher Technician diplomas in Web Application Development (DAW) and Networked Computer Systems Administration (ASIR). My profile combines infrastructure and development, which lets me understand the full lifecycle of an IT solution: from computers and connectivity to servers, databases, backend, frontend and deployment.",
    experiencia: [
      {
        puesto: "Full-stack web developer",
        empresa: "Own projects",
        fechas: "2017 – present",
        lugar: "Barcelona · remote",
        intro: "Independent development of complete web applications, published and running in production:",
        proyectos: [
          {
            nombre: "Mi Jornada",
            texto: "work-hours tracker that calculates hours and pay, with an AI assistant that turns sentences like “yesterday from 8 to 2 at the site” into entries.",
            stack: "Django REST Framework · Vue · PostgreSQL (Supabase) · Vercel",
          },
          {
            nombre: "Sudokus",
            texto: "web game with accounts and stats; in-house engine that generates the puzzles and grades their difficulty with human techniques; every move is validated on the server.",
            stack: "Django · Alpine.js · Tailwind · PostgreSQL",
          },
          {
            nombre: "AgroClima Consultores",
            nota: "academic project",
            texto: "company website with a climate data dashboard and a content manager for a non-technical client. Mobile Lighthouse: 100.",
            stack: "Astro · Svelte · Sanity · Supabase",
          },
        ],
      },
      {
        puesto: "Web developer",
        empresa: "Sistemes Informàtics ICON S.L.",
        tipo: "Internship",
        fechas: "Jan 2016 – Jun 2016",
        lugar: "Figueres",
        tareas: [
          "Managed application servers to deploy web applications.",
          "Developed database-backed web applications to project specifications.",
          "Installed, configured and maintained WordPress, Joomla and Moodle.",
        ],
      },
      {
        puesto: "Systems administrator",
        empresa: "Fundació Salut Empordà (Figueres Hospital)",
        tipo: "Internship",
        fechas: "Dec 2014 – May 2015",
        lugar: "Figueres",
        tareas: [
          "Administered server operating systems and configured software and network services.",
          "Provided remote and on-site technical support.",
          "Diagnosed incidents and applied corrective measures.",
        ],
      },
      {
        puesto: "IT equipment administrator",
        empresa: "La Salle Figueres",
        tipo: "Internship",
        fechas: "Nov 2011 – Mar 2012",
        lugar: "Figueres",
        tareas: [
          "Installed and configured applications, computers and local networks.",
          "Maintained hardware and peripherals.",
          "Prepared technical documentation and quotes, and gave technical advice.",
        ],
      },
    ],
    formacion: [
      { titulo: "Higher Technician in Web Application Development (DAW)", centro: "IES Cendrassos, Figueres", fechas: "2015 – 2016" },
      { titulo: "Higher Technician in Networked Computer Systems Administration (ASIR)", centro: "IES Cendrassos, Figueres", fechas: "2013 – 2015" },
      { titulo: "Technician in Computer Systems Operation", centro: "IES Cendrassos, Figueres", fechas: "2010 – 2012" },
    ],
    certificaciones: [
      { titulo: "CCNA1 · Introduction to Networks", centro: "Cisco Networking Academy", fechas: "2014" },
      { titulo: "CCNA2 · Switching, Routing, and Wireless Essentials", centro: "Cisco Networking Academy", fechas: "2014" },
      { titulo: "CCNA3 · Enterprise Networking, Security, and Automation", centro: "Cisco Networking Academy", fechas: "2015" },
    ],
    habilidades: [
      { grupo: "Backend", items: ["Python", "Django", "Django REST Framework", "REST APIs", "PHP", "Laravel"] },
      { grupo: "Frontend", items: ["JavaScript", "TypeScript", "Vue 3", "Astro", "Svelte", "Alpine.js", "HTML", "CSS", "Tailwind CSS"] },
      { grupo: "Data", items: ["PostgreSQL", "MySQL", "SQLite", "Supabase", "Sanity (CMS)"] },
      { grupo: "Tools", items: ["Git", "GitHub", "Vercel", "VS Code", "npm", "WSL"] },
      { grupo: "Systems", items: ["Windows & Windows Server", "Linux", "Active Directory", "Networking (Cisco, VLAN, Wi-Fi)", "Technical support"] },
    ],
    idiomas: [
      { idioma: "Spanish", nivel: "Native" },
      { idioma: "Catalan", nivel: "Professional working proficiency" },
      { idioma: "English", nivel: "Intermediate reading, basic conversation" },
    ],
    otros: ["Driving licence (B)"],
    pie: "Projects with demos and code at mfloresr-portfolio.vercel.app",
  },
};
