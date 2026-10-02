"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

/*
 * Paleta de búsqueda y comandos (Ctrl+K o «/»). Busca páginas, proyectos, artículos y tecnologías,
 * y ejecuta acciones: cambiar tema o idioma, copiar el email, abrir GitHub o descargar el CV.
 * Usa un <dialog> nativo, que ya atrapa el foco y se cierra con Esc.
 */

export type ElementoPaleta = { id: string; grupo: "pages" | "projects" | "articles" | "technologies"; titulo: string; detalle?: string; href: string };
export type DatosPaleta = {
  elementos: ElementoPaleta[];
  idiomas: { codigo: string; nombre: string }[];
  contacto: { email: string | null; github: string | null; linkedin: string | null };
  cv: string;
  textos: Record<string, string>;
};

type Resultado = ElementoPaleta | { id: string; grupo: "actions"; titulo: string; detalle?: string; href?: undefined; ejecutar: () => void };

const plantilla = (texto: string, valores: Record<string, string>) => texto.replace(/\{(\w+)\}/g, (_, k: string) => valores[k] ?? "");
const normalizar = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function Paleta({ datos }: { datos: DatosPaleta }) {
  const { textos, elementos, idiomas, contacto, cv } = datos;
  const router = useRouter();
  const ruta = usePathname();
  const idioma = useLocale();
  const id = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const [abierta, setAbierta] = useState(false);
  const [consulta, setConsulta] = useState("");
  const [activo, setActivo] = useState(0);
  const [aviso, setAviso] = useState("");

  // Abrir y cerrar: atajos de teclado y el botón de la cabecera
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const escribiendo = /^(input|textarea|select)$/i.test((e.target as HTMLElement)?.tagName ?? "") || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setAbierta((a) => !a);
      } else if (e.key === "/" && !escribiendo && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setAbierta(true);
      }
    };
    const alAbrir = () => setAbierta(true);
    document.addEventListener("keydown", alPulsar);
    window.addEventListener("paleta:abrir", alAbrir);
    return () => {
      document.removeEventListener("keydown", alPulsar);
      window.removeEventListener("paleta:abrir", alAbrir);
    };
  }, []);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierta && !d.open) {
      d.showModal();
      campo.current?.focus();
    } else if (!abierta && d.open) d.close();
  }, [abierta]);

  const acciones = useMemo<Resultado[]>(() => {
    const acc: Resultado[] = [];
    const oscuro = () => document.documentElement.dataset.theme === "dark";
    acc.push({
      id: "tema",
      grupo: "actions",
      titulo: "",
      ejecutar: () => {
        const nuevo = oscuro() ? "light" : "dark";
        document.documentElement.dataset.theme = nuevo;
        try {
          localStorage.setItem("tema", nuevo);
        } catch {
          // Sin almacenamiento el tema dura solo esta visita
        }
      },
    });
    for (const i of idiomas.filter((x) => x.codigo !== idioma)) {
      acc.push({
        id: `idioma-${i.codigo}`,
        grupo: "actions",
        titulo: plantilla(textos.language, { idioma: i.nombre }),
        detalle: i.codigo,
        ejecutar: () => router.replace(`${ruta}${window.location.search}` as never, { locale: i.codigo as "es" | "en" | "ca" | "fr" }),
      });
    }
    acc.push({ id: "cv", grupo: "actions", titulo: textos.cv, ejecutar: () => window.open(cv, "_blank", "noopener") });
    if (contacto.email) {
      const email = contacto.email;
      acc.push({
        id: "email",
        grupo: "actions",
        titulo: textos.copyEmail,
        detalle: email,
        ejecutar: () => {
          navigator.clipboard
            ?.writeText(email)
            .then(() => setAviso(plantilla(textos.emailCopied, { email })))
            .catch(() => setAviso(plantilla(textos.emailFailed, { email })));
        },
      });
    }
    if (contacto.github) {
      const url = contacto.github;
      acc.push({ id: "github", grupo: "actions", titulo: textos.github, ejecutar: () => window.open(url, "_blank", "noopener") });
    }
    if (contacto.linkedin) {
      const url = contacto.linkedin;
      acc.push({ id: "linkedin", grupo: "actions", titulo: textos.linkedin, ejecutar: () => window.open(url, "_blank", "noopener") });
    }
    return acc;
  }, [idiomas, idioma, textos, cv, contacto, router, ruta]);

  const resultados = useMemo(() => {
    const oscuroAhora = abierta ? document.documentElement.dataset.theme === "dark" : true;
    const todas: Resultado[] = [...elementos, ...acciones.map((a) => (a.id === "tema" ? { ...a, titulo: oscuroAhora ? textos.themeLight : textos.themeDark } : a))];
    const verbos = new Set(textos.verbs.split(",").map(normalizar));
    const palabras = normalizar(consulta).split(/\s+/).filter(Boolean).filter((p, i) => !(i === 0 && verbos.has(p) && normalizar(consulta).split(/\s+/).length > 1));
    if (palabras.length === 0) {
      // Sin escribir: páginas y acciones
      return todas.filter((r) => r.grupo === "pages" || r.grupo === "actions");
    }
    const puntuar = (r: Resultado) => {
      const texto = normalizar(`${r.titulo} ${r.detalle ?? ""}`);
      if (!palabras.every((p) => texto.includes(p))) return -1;
      return normalizar(r.titulo).startsWith(palabras[0]) ? 2 : 1;
    };
    return todas
      .map((r) => ({ r, p: puntuar(r) }))
      .filter((x) => x.p > 0)
      .sort((a, b) => b.p - a.p)
      .map((x) => x.r)
      .slice(0, 30);
  }, [consulta, elementos, acciones, abierta, textos]);

  useEffect(() => {
    document.getElementById(`${id}-opcion-${activo}`)?.scrollIntoView({ block: "nearest" });
  }, [activo, id]);

  function cerrar() {
    setAbierta(false);
    setConsulta("");
    setActivo(0);
    setAviso("");
  }

  function elegir(r: Resultado | undefined) {
    if (!r) return;
    if (r.grupo === "actions") {
      r.ejecutar();
      if (r.id !== "email") cerrar();
    } else {
      router.push(r.href as never);
      cerrar();
    }
  }

  const gruposEtiqueta: Record<string, string> = {
    pages: textos.groupPages,
    projects: textos.groupProjects,
    articles: textos.groupArticles,
    technologies: textos.groupTechnologies,
    actions: textos.groupActions,
  };

  return (
    <dialog
      ref={dialogo}
      onClose={() => {
        setAbierta(false);
        setConsulta("");
        setActivo(0);
        setAviso("");
      }}
      onClick={(e) => {
        if (e.target === dialogo.current) cerrar();
      }}
      aria-label={textos.title}
      className="m-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-linea bg-superficie p-0 text-texto shadow-[0_0_60px_-10px_var(--brillo)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col">
        <input
          ref={campo}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${id}-lista`}
          aria-activedescendant={resultados.length ? `${id}-opcion-${activo}` : undefined}
          aria-autocomplete="list"
          aria-label={textos.title}
          name="paleta"
          autoComplete="off"
          spellCheck={false}
          value={consulta}
          placeholder={textos.placeholder}
          onChange={(e) => {
            setConsulta(e.target.value);
            setActivo(0);
            setAviso("");
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActivo((a) => Math.min(resultados.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActivo((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              elegir(resultados[activo]);
            }
          }}
          className="min-h-14 w-full border-b border-linea bg-transparent px-5 text-[17px] outline-none placeholder:text-tenue focus:border-cable"
        />
        <ul ref={lista} id={`${id}-lista`} role="listbox" aria-label={textos.title} className="max-h-[50vh] overflow-y-auto p-2">
          {resultados.map((r, i) => (
            <li key={r.id} role="presentation">
              {(i === 0 || resultados[i - 1].grupo !== r.grupo) && (
                <div role="presentation" className="px-3 pt-3 pb-1 text-xs font-semibold text-tenue">
                  {gruposEtiqueta[r.grupo]}
                </div>
              )}
              <div
                id={`${id}-opcion-${i}`}
                role="option"
                aria-selected={i === activo}
                onPointerMove={() => setActivo(i)}
                onClick={() => elegir(r)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2 ${i === activo ? "bg-cable-relleno text-sobre-cable" : ""}`}
              >
                <span className="min-w-0 truncate font-medium">{r.titulo}</span>
                {r.detalle && <span className={`truncate text-sm ${i === activo ? "" : "text-tenue"}`}>{r.detalle}</span>}
              </div>
            </li>
          ))}
        </ul>
        {resultados.length === 0 && <p className="px-5 py-6 text-[15px] text-tenue">{plantilla(textos.empty, { q: consulta })}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linea px-5 py-2.5 text-[13px] text-tenue">
          <span>{textos.hint}</span>
          <span aria-live="polite">{aviso || (consulta ? plantilla(textos.count, { n: String(resultados.length) }) : "")}</span>
        </div>
      </div>
    </dialog>
  );
}

/** Botón de la cabecera que abre la paleta. */
export function BotonPaleta({ etiqueta }: { etiqueta: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("paleta:abrir"))}
      aria-label={etiqueta}
      title={`${etiqueta} (Ctrl+K)`}
      className="flex size-11 cursor-pointer items-center justify-center rounded-lg hover:bg-cable-relleno/15"
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </button>
  );
}
