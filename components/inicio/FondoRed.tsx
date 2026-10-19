/**
 * Fondo de la portada: resplandores que derivan despacio, rejilla que se desvanece y una red de cables
 * por los que circulan datos. Todo es decorativo (aria-hidden) y se detiene con «reducir movimiento».
 */
const RUTAS = [
  "M-40 120 C 260 40, 420 260, 720 150 S 1180 40, 1500 180",
  "M-40 420 C 220 320, 480 560, 800 430 S 1200 300, 1500 460",
  "M-40 700 C 300 640, 520 820, 860 700 S 1220 600, 1500 740",
  "M300 -40 C 340 200, 180 360, 360 560 S 300 780, 420 940",
  "M1100 -40 C 1040 220, 1240 340, 1120 560 S 1180 780, 1060 940",
];

export default function FondoRed() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="fondo-resplandor fondo-resplandor-a" />
      <div className="fondo-resplandor fondo-resplandor-b" />
      <div className="fondo-rejilla" />
      <svg className="fondo-cables" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        {RUTAS.map((d, i) => (
          <g key={d}>
            <path d={d} className="fondo-cable" />
            <path d={d} className="fondo-datos" style={{ animationDelay: `${-i * 2.3}s`, animationDuration: `${9 + i * 1.7}s` }} />
          </g>
        ))}
      </svg>
    </div>
  );
}
