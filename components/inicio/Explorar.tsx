"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Flecha } from "@/components/ui/Iconos";
import { Link } from "@/i18n/navigation";

/*
 * Parte interactiva del inicio: panel de conexiones, lista de proyectos y consola.
 * Comparten estado (qué proyecto o tecnología está en foco y el filtro), por eso viven en un proveedor.
 * Todo el contenido llega ya preparado desde el servidor, con los textos del idioma actual.
 */

export type ProyectoInicio = {
  slug: string;
  titulo: string;
  estado: string;
  estadoClave: string;
  anio: number;
  resumen: string | null;
  contexto: string | null;
  tecnologias: string[];
  demo: string | null;
  repositorio: string | null;
  captura: { src: string; alt: string } | null;
};
export type TecnologiaInicio = { id: string; nombre: string };
type Ordenes = "help" | "projects" | "stack" | "use" | "path" | "contact" | "cv" | "clear";
export type DatosInicio = {
  proyectos: ProyectoInicio[];
  tecnologias: TecnologiaInicio[];
  textos: Record<string, string>;
  ordenes: Record<Ordenes, string>;
  etiquetas: { verFicha: string; codigo: string; demo: string };
  recorrido: string[];
  contacto: { email: string | null; linkedin: string | null; github: string | null };
  cv: string;
};

type Foco = { tipo: "proyecto" | "tecnologia"; id: string };
type Estado = {
  datos: DatosInicio;
  foco: Foco;
  filtro: string | null;
  abiertas: Set<string>;
  enfocar: (foco: Foco) => void;
  filtrar: (id: string | null) => void;
  alternarFicha: (slug: string, abierta: boolean) => void;
  abrirFicha: (slug: string) => void;
};

const Contexto = createContext<Estado | null>(null);
function useExplorar() {
  const c = useContext(Contexto);
  if (!c) throw new Error("Falta ProveedorExplorar");
  return c;
}

const plantilla = (texto: string, valores: Record<string, string | number>) =>
  texto.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));

const usuarios = (datos: DatosInicio, tecnologia: string) => datos.proyectos.filter((p) => p.tecnologias.includes(tecnologia));
const nombreTec = (datos: DatosInicio, id: string) => datos.tecnologias.find((t) => t.id === id)?.nombre ?? id;

export function ProveedorExplorar({ datos, children }: { datos: DatosInicio; children: React.ReactNode }) {
  const [foco, setFoco] = useState<Foco>({ tipo: "proyecto", id: datos.proyectos[0].slug });
  const [filtro, setFiltro] = useState<string | null>(null);
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set([datos.proyectos[0].slug]));

  const valor = useMemo<Estado>(
    () => ({
      datos,
      foco,
      filtro,
      abiertas,
      enfocar: setFoco,
      filtrar: (id) => {
        setFiltro(id);
        setFoco(id ? { tipo: "tecnologia", id } : { tipo: "proyecto", id: datos.proyectos[0].slug });
      },
      alternarFicha: (slug, abierta) =>
        setAbiertas((previas) => {
          if (previas.has(slug) === abierta) return previas;
          const nuevas = new Set(previas);
          if (abierta) nuevas.add(slug);
          else nuevas.delete(slug);
          return nuevas;
        }),
      abrirFicha: (slug) => setAbiertas((previas) => new Set(previas).add(slug)),
    }),
    [datos, foco, filtro, abiertas],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

// ---------------------------------------------------------------- Panel de conexiones

export function PanelConexiones() {
  const { datos, foco, enfocar, filtro, filtrar, abrirFicha } = useExplorar();
  const { proyectos, tecnologias, textos } = datos;
  const [vista, setVista] = useState<string | null>(null);
  const [anima, setAnima] = useState(false);
  const [cables, setCables] = useState<{ d: string; largo: number }[]>([]);
  const [ancho, setAncho] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const hueco = useRef<HTMLDivElement>(null);
  const tomas = useRef(new Map<string, HTMLElement>());
  const puertos = useRef(new Map<string, HTMLElement>());
  const [sinMovimiento, setSinMovimiento] = useState(true);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setSinMovimiento(m.matches);
    leer();
    m.addEventListener("change", leer);
    return () => m.removeEventListener("change", leer);
  }, []);

  // Qué se enlaza con qué: un proyecto con sus tecnologías, o una tecnología con los proyectos que la usan
  const tecnologiaEnFoco = vista ?? (foco.tipo === "tecnologia" ? foco.id : null);
  const proyectoEnFoco = foco.tipo === "proyecto" ? proyectos.find((p) => p.slug === foco.id)! : null;
  const desde = tecnologiaEnFoco ? usuarios(datos, tecnologiaEnFoco).map((p) => p.slug) : [proyectoEnFoco!.slug];
  const hasta = tecnologiaEnFoco ? [tecnologiaEnFoco] : proyectoEnFoco!.tecnologias;
  const clave = `${desde.join(",")}>${hasta.join(",")}`;

  const dibujar = useCallback(() => {
    const caja = hueco.current?.getBoundingClientRect();
    if (!caja || caja.width === 0) {
      setCables([]);
      return;
    }
    setAncho(caja.width);
    const nuevos: { d: string; largo: number }[] = [];
    for (const slug of desde) {
      const toma = tomas.current.get(slug)?.getBoundingClientRect();
      if (!toma) continue;
      const y1 = toma.top + toma.height / 2 - caja.top;
      for (const id of hasta) {
        const p = puertos.current.get(id)?.getBoundingClientRect();
        if (!p) continue;
        const y2 = p.top + p.height / 2 - caja.top;
        const mitad = caja.width / 2;
        nuevos.push({ d: `M0 ${y1} C${mitad} ${y1} ${mitad} ${y2} ${caja.width} ${y2}`, largo: Math.ceil(caja.width * 1.5 + Math.abs(y2 - y1)) });
      }
    }
    setCables(nuevos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useLayoutEffect(dibujar, [dibujar]);
  useEffect(() => {
    const alCambiar = () => {
      setAnima(false);
      dibujar();
    };
    window.addEventListener("resize", alCambiar);
    document.fonts?.ready.then(alCambiar);
    return () => window.removeEventListener("resize", alCambiar);
  }, [dibujar]);

  const usadas = new Set(hasta);
  const nombresUsadas = tecnologias.filter((t) => usadas.has(t.id)).map((t) => t.nombre);
  const resumen = tecnologiaEnFoco
    ? plantilla(textos.panelTech, { tecnologia: nombreTec(datos, tecnologiaEnFoco), proyectos: usuarios(datos, tecnologiaEnFoco).map((p) => p.titulo).join(", ") })
    : plantilla(textos.panelUses, { proyecto: proyectoEnFoco!.titulo, tecnologias: nombresUsadas.join(", ") });

  function elegir(slug: string) {
    setAnima(true);
    filtrar(null);
    enfocar({ tipo: "proyecto", id: slug });
  }

  return (
    <div
      ref={panel}
      role="region"
      aria-label={textos.panelRegion}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className="cuadro grid gap-4 rounded-xl border border-linea bg-superficie p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_clamp(60px,12vw,170px)_minmax(0,15rem)] lg:gap-0 lg:p-8"
    >
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13px] text-tenue lg:col-span-full lg:mb-5">
        <strong className="font-semibold text-texto">{textos.panelTitle}</strong>
        <span>{textos.panelHint}</span>
      </div>

      <div className="grid content-between gap-3">
        {proyectos.map((p) => {
          const elegido = proyectoEnFoco?.slug === p.slug;
          const toca = !!tecnologiaEnFoco && p.tecnologias.includes(tecnologiaEnFoco);
          return (
            <button
              key={p.slug}
              type="button"
              aria-pressed={elegido}
              onClick={() => elegir(p.slug)}
              onKeyDown={(e) => {
                const i = proyectos.findIndex((x) => x.slug === p.slug);
                const n = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : -1;
                if (n < 0 || n >= proyectos.length) return;
                e.preventDefault();
                (e.currentTarget.parentElement?.children[n] as HTMLElement).focus();
                elegir(proyectos[n].slug);
              }}
              className={`grid min-h-11 cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 rounded-md border bg-superficie/80 px-4 py-3 text-left transition-[transform,border-color,box-shadow,opacity] hover:translate-x-1 hover:border-cable motion-reduce:transition-none motion-reduce:hover:translate-x-0 ${
                elegido ? "border-cable bg-seleccion shadow-[0_0_18px_-6px_var(--brillo)]" : toca ? "border-cable-relleno shadow-[0_0_18px_-4px_var(--brillo)]" : "border-borde-control"
              } ${tecnologiaEnFoco && !toca ? "opacity-45" : ""}`}
            >
              <span className="text-lg font-semibold">{p.titulo}</span>
              <span
                ref={(el) => {
                  if (el) tomas.current.set(p.slug, el);
                }}
                aria-hidden="true"
                className="col-start-2 row-span-2 row-start-1 grid size-4.5 place-items-center rounded-full border-2 border-current"
              >
                <span className={`size-2 rounded-full ${elegido || toca ? "bg-cable-relleno" : "bg-transparent"}`} />
              </span>
              <span className="text-[13px] text-tenue">
                {p.estado} · {p.anio}
              </span>
            </button>
          );
        })}
      </div>

      <div ref={hueco} aria-hidden="true" className="relative hidden lg:block">
        <svg className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id="degradado-cable" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={ancho || 1} y2="0">
              <stop offset="0" stopColor="var(--cable-2)" />
              <stop offset="1" stopColor="var(--cable)" />
            </linearGradient>
          </defs>
          {cables.map((c, i) => (
            <g key={`${clave}-${i}`}>
              <path d={c.d} className={anima && !sinMovimiento ? "cable cable-anima" : "cable"} style={{ "--largo": c.largo } as React.CSSProperties} />
              {!sinMovimiento && (
                <circle r="3" className="pulso">
                  <animateMotion path={c.d} dur={`${(2 + (i % 7) / 7).toFixed(2)}s`} repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}
        </svg>
      </div>

      <ul className="flex flex-wrap gap-1.5 text-sm lg:grid lg:gap-1">
        {tecnologias.map((t) => {
          const activa = usadas.has(t.id);
          const fijada = filtro === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                ref={(el) => {
                  if (el) puertos.current.set(t.id, el);
                }}
                aria-pressed={fijada}
                onPointerEnter={() => setVista(t.id)}
                onPointerLeave={() => setVista(null)}
                onFocus={() => setVista(t.id)}
                onBlur={() => setVista(null)}
                onClick={() => {
                  setAnima(true);
                  filtrar(fijada ? null : t.id);
                }}
                className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-sm border px-2.5 text-left transition-colors lg:min-h-7 ${
                  activa ? "border-cable-relleno bg-cable-relleno font-semibold text-sobre-cable" : "border-borde-control text-tenue hover:border-cable hover:text-texto lg:border-transparent"
                } ${fijada ? "outline-2 outline-offset-1 outline-cable-2" : ""}`}
              >
                <i aria-hidden="true" className={`size-2.5 flex-none rounded-xs border-2 ${activa ? "border-sobre-cable bg-sobre-cable" : "border-linea"}`} />
                {t.nombre}
              </button>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[13px] text-tenue lg:col-span-full lg:mt-5">
        <span>{resumen}</span>
        <a
          href="#proyectos"
          onClick={() => proyectoEnFoco && abrirFicha(proyectoEnFoco.slug)}
          className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-acento"
        >
          {proyectoEnFoco ? plantilla(textos.panelOpen, { proyecto: proyectoEnFoco.titulo }) : textos.panelOpenAll}
          <Flecha />
        </a>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------- Lista de proyectos (fichas desplegables)

export function ListaProyectos() {
  const { datos, filtro, filtrar, abiertas, alternarFicha, enfocar } = useExplorar();
  const { proyectos, textos, etiquetas } = datos;
  const visibles = filtro ? usuarios(datos, filtro) : proyectos;

  return (
    <div>
      <div aria-live="polite" className="mb-4 flex min-h-11 flex-wrap items-center gap-3 text-[15px] text-tenue">
        <span>{filtro ? plantilla(textos.listFilter, { tecnologia: nombreTec(datos, filtro), n: visibles.length, total: proyectos.length }) : textos.listIdle}</span>
        {filtro && (
          <button
            type="button"
            onClick={() => filtrar(null)}
            className="min-h-11 cursor-pointer rounded-full bg-cable-relleno px-4 font-semibold text-sobre-cable"
          >
            {textos.listClear}
          </button>
        )}
      </div>

      <ul className="border-t border-cable">
        {proyectos.map((p) => {
          const abierta = abiertas.has(p.slug);
          return (
            <li key={p.slug} hidden={!visibles.includes(p)} className="border-b border-linea">
              <details
                open={abierta}
                onToggle={(e) => {
                  alternarFicha(p.slug, e.currentTarget.open);
                  if (e.currentTarget.open) enfocar({ tipo: "proyecto", id: p.slug });
                }}
              >
                <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 py-5 transition-colors hover:bg-cable/5 md:grid-cols-[11rem_minmax(0,1fr)_auto] [&::-webkit-details-marker]:hidden">
                  <span className="col-span-full flex gap-4 text-[13px] text-tenue md:col-span-1 md:grid md:gap-1">
                    <span>{p.anio}</span>
                    <span className="inline-flex items-center gap-2 text-texto">
                      <span aria-hidden="true" className={`size-2.25 rounded-full ${p.estadoClave === "produccion" ? "bg-exito" : "border-2 border-tenue"}`} />
                      {p.estado}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <h3 className="text-2xl font-semibold tracking-tight">{p.titulo}</h3>
                    {p.contexto && <span className="block text-[15px] text-tenue">{p.contexto}</span>}
                  </span>
                  <span aria-hidden="true" className={`grid size-8 place-items-center rounded-full border-2 transition-transform ${abierta ? "rotate-45 border-cable" : "border-borde-control"}`}>
                    +
                  </span>
                </summary>

                <div className={`grid gap-4 pb-6 md:grid-cols-[11rem_minmax(0,1fr)_15rem] md:gap-x-6 ${abierta ? "ficha-abierta" : ""}`}>
                  <div className="hidden md:block" />
                  <div className="flex min-w-0 flex-col gap-4">
                    {p.resumen && <p className="max-w-[40em] leading-relaxed">{p.resumen}</p>}
                    <ul className="flex flex-wrap gap-1.5">
                      {p.tecnologias.map((id) => (
                        <li key={id}>
                          <button
                            type="button"
                            aria-pressed={filtro === id}
                            onClick={() => filtrar(filtro === id ? null : id)}
                            className="min-h-11 cursor-pointer rounded-full border border-borde-control px-3 text-[13px] md:min-h-8 transition-colors hover:border-cable hover:bg-cable/10 aria-pressed:border-cable-relleno aria-pressed:bg-cable-relleno aria-pressed:font-semibold aria-pressed:text-sobre-cable"
                          >
                            {nombreTec(datos, id)}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] font-semibold">
                      <Link href={`/projects/${p.slug}`} className="inline-flex min-h-11 items-center gap-1.5 text-acento">
                        {etiquetas.verFicha}
                        <Flecha />
                      </Link>
                      {p.demo && (
                        <a href={p.demo} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center hover:underline">
                          {etiquetas.demo}
                        </a>
                      )}
                      {p.repositorio && (
                        <a href={p.repositorio} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center hover:underline">
                          {etiquetas.codigo}
                        </a>
                      )}
                    </div>
                  </div>
                  {p.captura && (
                    <div className="relative hidden h-36 overflow-hidden rounded-xl border border-linea bg-chip md:block">
                      <Image src={p.captura.src} alt={p.captura.alt} fill sizes="240px" className="object-cover object-top" />
                    </div>
                  )}
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- Consola

type Linea = { texto: string; clase?: "orden" | "error"; href?: string };

export function Consola() {
  const { datos, filtrar } = useExplorar();
  const { textos, ordenes, tecnologias, proyectos } = datos;
  const salida = useRef<HTMLDivElement>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [texto, setTexto] = useState("");
  const historial = useRef<string[]>([]);
  const posicion = useRef(0);

  const listaOrdenes = (Object.keys(ordenes) as Ordenes[]).map((k) => (k === "use" ? `${ordenes.use} <tec>` : ordenes[k])).join(", ");
  const ejemplo = `${ordenes.use} ${tecnologias.find((t) => t.id === "django")?.nombre.toLowerCase() ?? tecnologias[0].nombre.toLowerCase()}`;

  // Sinónimos en cualquier idioma, para que "help" funcione igual que "ayuda"
  const alias = useMemo(() => {
    const m = new Map<string, Ordenes>();
    for (const k of Object.keys(ordenes) as Ordenes[]) {
      m.set(ordenes[k].toLowerCase(), k);
      m.set(k, k);
    }
    return m;
  }, [ordenes]);

  const inicio = useRef(false);
  const ejecutar = (entrada: string, mostrar = true) => {
      const partes = entrada.trim().split(/\s+/);
      const nombre = (partes[0] ?? "").toLowerCase();
      const arg = partes.slice(1).join(" ").toLowerCase().trim();
      if (!nombre) return;
      const nuevas: Linea[] = mostrar ? [{ texto: `$ ${entrada}`, clase: "orden" }] : [];
      const orden = alias.get(nombre);
      const tec = (q: string) => tecnologias.find((t) => t.id === q || t.nombre.toLowerCase() === q) ?? tecnologias.find((t) => t.nombre.toLowerCase().startsWith(q));

      if (orden === "help") nuevas.push({ texto: plantilla(textos.conHelp, { lista: listaOrdenes }) });
      else if (orden === "projects") proyectos.forEach((p) => nuevas.push({ texto: `• ${p.titulo} — ${p.estado} · ${p.anio}` }));
      else if (orden === "stack") nuevas.push({ texto: tecnologias.map((t) => t.nombre).join(", ") });
      else if (orden === "use") {
        if (!arg) nuevas.push({ texto: plantilla(textos.conNeedTech, { ejemplo }), clase: "error" });
        else {
          const t = tec(arg);
          if (!t) nuevas.push({ texto: plantilla(textos.conNoTech, { q: arg }), clase: "error" });
          else {
            filtrar(t.id);
            nuevas.push({ texto: plantilla(textos.conUseOk, { tecnologia: t.nombre, proyectos: usuarios(datos, t.id).map((p) => p.titulo).join(", ") || textos.conNoProjects }) });
          }
        }
      } else if (orden === "path") datos.recorrido.forEach((l) => nuevas.push({ texto: l }));
      else if (orden === "contact") {
        const { email, linkedin, github } = datos.contacto;
        if (email) nuevas.push({ texto: `Email: ${email}`, href: `mailto:${email}` });
        if (linkedin) nuevas.push({ texto: `LinkedIn: ${linkedin.replace("https://www.", "")}`, href: linkedin });
        if (github) nuevas.push({ texto: `GitHub: ${github.replace("https://", "")}`, href: github });
      } else if (orden === "cv") nuevas.push({ texto: plantilla(textos.conCv, { url: datos.cv }), href: datos.cv });
      else if (orden === "clear") {
        setLineas([]);
        return;
      } else nuevas.push({ texto: plantilla(textos.conUnknown, { cmd: nombre, ayuda: ordenes.help }), clase: "error" });
      setLineas((previas) => [...previas, ...nuevas]);
  };

  // Saludo y ayuda al cargar (la consola se ve con contenido desde el primer momento)
  useEffect(() => {
    if (inicio.current) return;
    inicio.current = true;
    setLineas([{ texto: textos.conGreeting }, { texto: plantilla(textos.conHelp, { lista: listaOrdenes }) }]);
  }, [textos, listaOrdenes]);

  useEffect(() => {
    salida.current?.scrollTo({ top: salida.current.scrollHeight });
  }, [lineas]);

  return (
    <div id="consola" role="group" aria-label={textos.conTitle} className="overflow-hidden rounded-xl border border-linea bg-terminal font-codigo text-[14px] leading-relaxed text-[#e8eeff] shadow-[0_0_40px_-18px_var(--brillo)]">
      <div className="flex items-center gap-2 border-b border-[#1b2a6b] px-4 py-2.5 text-xs text-[#a9b8f0]">
        <i aria-hidden="true" className="size-2.5 rounded-full bg-[#b97bff]" />
        <i aria-hidden="true" className="size-2.5 rounded-full bg-[#f2b726]" />
        <i aria-hidden="true" className="size-2.5 rounded-full bg-[#5be7b0]" />
        <span>mario@portfolio · {textos.conTitle}</span>
      </div>
      <div ref={salida} role="log" aria-live="polite" tabIndex={0} aria-label={textos.conOut} className="h-64 overflow-y-auto p-4 wrap-anywhere whitespace-pre-wrap">
        {lineas.map((l, i) => (
          <div key={i} className={l.clase === "orden" ? "text-[#6c9bff]" : l.clase === "error" ? "text-[#ff9ad8]" : undefined}>
            {l.href ? (
              <a href={l.href} {...(l.href.startsWith("http") && { target: "_blank", rel: "noopener" })} className="text-[#6c9bff] underline">
                {l.texto}
              </a>
            ) : (
              l.texto
            )}
          </div>
        ))}
      </div>
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (texto.trim()) {
            historial.current.push(texto);
            posicion.current = historial.current.length;
          }
          ejecutar(texto);
          setTexto("");
        }}
        className="flex items-center gap-2.5 px-4 pb-3"
      >
        <label htmlFor="consola-orden" className="whitespace-nowrap text-[#6c9bff]">
          mario@portfolio ~ $
        </label>
        <input
          id="consola-orden"
          name="orden"
          autoComplete="off"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            const h = historial.current;
            if (e.key === "ArrowUp" && h.length) {
              e.preventDefault();
              posicion.current = Math.max(0, posicion.current - 1);
              setTexto(h[posicion.current]);
            }
            if (e.key === "ArrowDown" && h.length) {
              e.preventDefault();
              posicion.current = Math.min(h.length, posicion.current + 1);
              setTexto(h[posicion.current] ?? "");
            }
          }}
          spellCheck={false}
          autoCapitalize="off"
          placeholder={textos.conPlaceholder}
          className="min-h-11 min-w-0 flex-1 border-b border-[#7087e6] bg-transparent px-1 text-white outline-none placeholder:text-[#a9b8f0]/60 focus:border-[#6c9bff] focus:shadow-[0_2px_0_0_#6c9bff]"
        />
      </form>
      <div className="flex flex-wrap gap-1.5 px-4 pb-4">
        {(["help", "projects", "stack", "path", "contact", "cv", "clear"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => ejecutar(ordenes[k])}
            className="min-h-11 cursor-pointer rounded-md border border-[#7087e6] px-3 text-[13px] md:min-h-9 hover:border-[#6c9bff] hover:text-[#6c9bff]"
          >
            {ordenes[k]}
          </button>
        ))}
      </div>
    </div>
  );
}
