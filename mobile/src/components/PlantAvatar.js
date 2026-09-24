import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

// Botanische Feder-Skizzen im Stil von Vintage-Pflanzen-Illustrationen:
// duenne Tuschlinien, verzweigte Blattadern, spitze Blattformen, volle
// Buendel statt symmetrischer Faecher, dazu ein niedliches, dick gezeichnetes
// Gesicht als Kontrast obendrauf. Jede Art besteht aus einem Blaetter-Buendel
// (die meisten Arten) oder einer der drei Sonderformen (Bambus, Bonsai,
// Kaktus). Der Topf ist eine von fuenf Stil-Varianten (band/ribbed/hatch/
// basket/legs/bowl), damit die Sammlung nicht wie ein einziger Topf mit
// vielen Pflanzen wirkt.
const INK = '#1D2418';
const PAPER = '#FFFDF7';

const SPECIES = {
  begonia: { form: 'fan', count: 4, w: 0.24, h: 0.34, spread: 40, vein: 'mid', spots: 4, pot: 'band', stemHeight: 0.2 },
  kingbegonia: { form: 'fan', count: 4, w: 0.27, h: 0.3, spread: 44, vein: 'fan', spots: 3, pot: 'hatch', stemHeight: 0.2 },
  pilea: { form: 'fan', count: 5, w: 0.22, h: 0.22, spread: 46, round: true, vein: 'fan', pot: 'basket', stemMul: 2.4, lift: 0.14 },
  monstera: { form: 'fan', count: 3, w: 0.34, h: 0.38, spread: 46, droop: 6, vein: 'mid', slits: 3, pot: 'band', stemHeight: 0.24 },
  strelitzia: { form: 'fan', count: 4, w: 0.19, h: 0.46, spread: 30, vein: 'mid', pot: 'ribbed', stemMul: 2.2, lift: 0.16 },
  pothos: { form: 'fan', count: 5, w: 0.23, h: 0.25, spread: 74, droop: 22, vein: 'mid', pot: 'basket', stemHeight: 0.14 },
  sansevieria: { form: 'fan', count: 7, w: 0.075, h: 0.62, spread: 22, straight: true, potScale: 0.86, pot: 'legs' },
  coffee: { form: 'fan', count: 5, w: 0.17, h: 0.3, spread: 46, vein: 'mid', berries: true, pot: 'band', stemHeight: 0.16 },
  rubber: { form: 'fan', count: 4, w: 0.24, h: 0.38, spread: 34, vein: 'mid', pot: 'hatch', stemHeight: 0.2 },
  fern: { form: 'fan', count: 5, w: 0.11, h: 0.48, spread: 50, vein: 'mid', comb: 3, pot: 'legs' },
  bamboo: { form: 'bamboo', potScale: 0.82, pot: 'ribbed' },
  bonsai: { form: 'bonsai', potScale: 1.06, pot: 'band' },
  cactus: { form: 'cactus', potScale: 0.9, pot: 'bowl' },
  fiddleleaf: { form: 'fan', count: 3, w: 0.34, h: 0.4, spread: 34, vein: 'mid', pot: 'band' },
  aloe: { form: 'fan', count: 5, w: 0.14, h: 0.5, spread: 26, straight: true, pot: 'bowl' },
  ivy: { form: 'fan', count: 6, w: 0.15, h: 0.16, spread: 60, round: true, droop: 14, pot: 'basket', stemHeight: 0.22, stemMul: 1.6 },
  orchid: { form: 'fan', count: 4, w: 0.16, h: 0.4, spread: 30, straight: true, pot: 'band', bloom: true },
  calathea: { form: 'fan', count: 3, w: 0.3, h: 0.32, spread: 40, vein: 'fan', pot: 'basket' },
  alocasia: { form: 'fan', count: 3, w: 0.34, h: 0.4, spread: 38, vein: 'mid', pot: 'hatch', stemMul: 1.8, lift: 0.12 },
  philodendron: { form: 'fan', count: 5, w: 0.2, h: 0.22, spread: 70, droop: 20, vein: 'mid', pot: 'basket', stemHeight: 0.1 },
  yucca: { form: 'fan', count: 8, w: 0.065, h: 0.58, spread: 26, straight: true, potScale: 0.9, pot: 'hatch' },
  dracaena: { form: 'fan', count: 6, w: 0.09, h: 0.5, spread: 36, vein: 'mid', pot: 'ribbed' },
  areca: { form: 'fan', count: 5, w: 0.13, h: 0.5, spread: 46, vein: 'mid', comb: 4, pot: 'legs' },
  zz: { form: 'fan', count: 5, w: 0.16, h: 0.28, spread: 44, vein: 'mid', pot: 'band' },
  fittonia: { form: 'fan', count: 6, w: 0.14, h: 0.14, spread: 55, round: true, vein: 'fan', pot: 'bowl' },
  peacelily: { form: 'fan', count: 4, w: 0.2, h: 0.36, spread: 34, vein: 'mid', pot: 'band' },
  anthurium: { form: 'fan', count: 3, w: 0.26, h: 0.32, spread: 34, vein: 'mid', pot: 'hatch' },
  umbrella: { form: 'fan', count: 6, w: 0.14, h: 0.22, spread: 50, vein: 'fan', pot: 'ribbed', stemMul: 2.2, lift: 0.12 },
  spiderplant: { form: 'fan', count: 8, w: 0.065, h: 0.46, spread: 42, vein: 'mid', pot: 'legs' },
  jade: { form: 'fan', count: 5, w: 0.14, h: 0.16, spread: 50, round: true, pot: 'bowl', stemHeight: 0.14 },
  chainheart: { form: 'fan', count: 6, w: 0.1, h: 0.11, spread: 65, round: true, droop: 26, pot: 'basket', lift: 0.18 },
  generic: { form: 'fan', count: 3, w: 0.27, h: 0.42, spread: 36, vein: 'mid', pot: 'band' }
};

// Deterministischer, sanfter "Handzeichnungs"-Jitter je Blattindex - keine
// echte Zufallszahl, damit dieselbe Art bei jedem Rendern gleich aussieht.
function jitter(i, amp) {
  return Math.sin(i * 2.61 + 0.7) * amp;
}

// Jedes Blatt/Rohr bekommt sein eigenes, leicht phasenverschobenes Wackeln
// statt dass die ganze Pflanze als ein starrer Block kippt - Dauer und
// Startverzoegerung sind deterministisch aus `seed` abgeleitet (kein
// Math.random()), damit sich zwei Blaetter nie exakt synchron bewegen.
function useSway(seed, enabled, baseDuration = 2200) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) return undefined;
    const delay = Math.abs(jitter(seed, 1)) * 700;
    const duration = baseDuration + jitter(seed + 11, 1) * 450;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: false })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enabled, seed, baseDuration, anim]);
  return anim;
}

// Ovale Teilkontur aus vier Quadratic-Kurven - Baustein fuer die
// Fenster-Locher im Monstera-Blatt.
function ovalSub(cx, cy, rx, ry) {
  return [
    `M ${cx - rx} ${cy}`,
    `Q ${cx - rx} ${cy - ry} ${cx} ${cy - ry}`,
    `Q ${cx + rx} ${cy - ry} ${cx + rx} ${cy}`,
    `Q ${cx + rx} ${cy + ry} ${cx} ${cy + ry}`,
    `Q ${cx - rx} ${cy + ry} ${cx - rx} ${cy}`,
    'Z'
  ].join(' ');
}

// Fensterblatt-Kontur wie bei Monstera: eine glatte, ovale/herzfoermige
// Silhouette (KEIN gelapptes/gezacktes Randmuster - echte Monstera-
// Illustrationen zeigen einen ruhigen Rand) mit einer Kerbe an der Basis,
// und mehreren echten Lochreihen entlang der Mittelrippe - genau das macht
// das Blatt erkennbar, nicht die Randform. Die Locher sind ein zweiter
// Teilpfad im selben <Path>, der per fillRule="evenodd" transparent bleibt
// und sich dadurch an jeden Hintergrund anpasst.
function monsteraLeafPath(rx, ry) {
  const notchY = ry * 0.68;
  const outline = [
    `M 0 ${notchY}`,
    `Q ${rx * 0.16} ${ry * 1.06} ${rx * 0.56} ${ry * 0.9}`,
    `Q ${rx * 1.08} ${ry * 0.68} ${rx * 0.94} ${ry * 0.02}`,
    `Q ${rx * 0.84} ${-ry * 0.55} ${rx * 0.4} ${-ry * 0.93}`,
    `Q ${rx * 0.16} ${-ry * 1.07} 0 ${-ry}`,
    `Q ${-rx * 0.16} ${-ry * 1.07} ${-rx * 0.4} ${-ry * 0.93}`,
    `Q ${-rx * 0.84} ${-ry * 0.55} ${-rx * 0.94} ${ry * 0.02}`,
    `Q ${-rx * 1.08} ${ry * 0.68} ${-rx * 0.56} ${ry * 0.9}`,
    `Q ${-rx * 0.16} ${ry * 1.06} 0 ${notchY}`,
    'Z'
  ].join(' ');

  // Vier gestaffelte Hoehen, an jeder ein Lochpaar links/rechts der
  // Mittelrippe (leicht versetzt fuer eine natuerlichere, asymmetrische
  // Anordnung) - so wie bei einer echten Monstera.
  const rows = [0.58, 0.28, -0.05, -0.4];
  const holes = rows.flatMap((t, idx) => {
    const y = ry * t;
    const shrink = 1 - idx * 0.12;
    const hw = rx * 0.26 * shrink, hh = ry * 0.19 * shrink;
    const xOff = rx * (0.4 + (idx % 2) * 0.04);
    return [ovalSub(xOff, y, hw, hh), ovalSub(-xOff, y - ry * 0.09, hw * 0.9, hh * 0.9)];
  }).join(' ');

  return `${outline} ${holes}`;
}

function Leaf({ s, angle, w, h, stemLen, sp, i, sway }) {
  const rx = w / 2, ry = h / 2;
  const leafAmp = sp.round ? 4 : 3.2;
  const swayAnim = useSway(i, sway, 2000);
  const swayTransform = swayAnim.interpolate({ inputRange: [0, 1], outputRange: [`rotate(${angle - leafAmp})`, `rotate(${angle + leafAmp})`] });
  const lineW = Math.max(0.7, s * 0.008);
  const inner = [];

  if (!sp.round) {
    // Mittelrippe
    inner.push(<Path key="rib" d={`M 0 ${ry * 0.86} L 0 ${-ry * 0.9}`} stroke={INK} strokeWidth={lineW} strokeLinecap="round" />);
  }
  if (sp.vein === 'mid') {
    const count = h > s * 0.32 ? 4 : 3;
    for (let k = 1; k <= count; k++) {
      const t = k / (count + 1);
      const y = ry * 0.68 - t * ry * 1.5;
      const len = rx * (0.62 - t * 0.16);
      [-1, 1].forEach((dir) => inner.push(
        <Path key={`v${k}${dir}`} d={`M 0 ${y} L ${dir * len} ${y - ry * 0.22}`} stroke={INK} strokeWidth={lineW * 0.85} strokeLinecap="round" />
      ));
    }
  }
  if (sp.vein === 'fan') {
    [-30, -12, 12, 30].forEach((va, vi) => inner.push(
      <Line key={'v' + vi} x1={0} y1={ry * 0.82} x2={ry * 0.68 * Math.sin((va * Math.PI) / 180)} y2={ry * 0.82 - ry * 0.68 * Math.cos((va * Math.PI) / 180)}
        stroke={INK} strokeWidth={lineW * 0.8} strokeLinecap="round" />
    ));
  }
  if (sp.straight) {
    // Schwertblatt: Mittelrippe + 2 duenne Seitenadern
    [-1, 1].forEach((dir) => inner.push(
      <Path key={'sw' + dir} d={`M 0 ${ry * 0.7} L ${dir * rx * 0.35} ${-ry * 0.7}`} stroke={INK} strokeWidth={lineW * 0.7} strokeLinecap="round" opacity={0.7} />
    ));
  }
  if (sp.comb) {
    // Kurz und duenn halten - zu lange/zu viele Fiederadern auf mehreren
    // ueberlappenden Blaettern liessen die Pflanze "zerstueckelt" wirken.
    for (let k = 0; k < sp.comb; k++) {
      const y = -ry * 0.7 + k * (ry * 1.3 / sp.comb);
      [-1, 1].forEach((dir) => inner.push(
        <Line key={'c' + k + dir} x1={0} y1={y} x2={dir * rx * 0.55} y2={y + ry * 0.08}
          stroke={INK} strokeWidth={lineW * 0.6} strokeLinecap="round" opacity={0.75} />
      ));
    }
  }
  if (sp.spots) {
    for (let k = 0; k < sp.spots; k++) {
      inner.push(<Circle key={'sp' + k} cx={(k % 2 ? 1 : -1) * rx * 0.32} cy={-ry * 0.3 + k * ry * 0.28} r={Math.max(1, w * 0.045)} fill={INK} opacity={0.85} />);
    }
  }
  if (sp.berries && i === 1) {
    inner.push(<Circle key="berry" cx={rx * 0.5} cy={ry * 0.6} r={Math.max(1.4, w * 0.06)} fill={PAPER} stroke={INK} strokeWidth={lineW} />);
  }

  // Ganz leichte Asymmetrie statt spiegelgleicher Kurven - echte Blaetter
  // sind nie perfekt symmetrisch, aber zu viel Verzug wirkt schnell wie
  // abgebrochen statt organisch. Schwertblaetter (straight) behalten eine
  // mittige Spitze, damit sie zu ihren geraden Seitenadern passen.
  const asym = jitter(i, 0.07);
  const tip = sp.straight ? 0 : jitter(i + 3, 0.06) * rx;

  const shape = sp.round
    ? <Circle cx={jitter(i, 0.04) * rx} cy={0} r={rx} fill={PAPER} stroke={INK} strokeWidth={lineW * 1.3} />
    : sp.straight
      ? <Path d={`M ${-rx * 0.62} ${ry} Q ${-rx * (1 - asym)} ${ry * 0.1} 0 ${-ry} Q ${rx * (1 + asym)} ${ry * 0.1} ${rx * 0.62} ${ry} Z`} fill={PAPER} stroke={INK} strokeWidth={lineW * 1.3} strokeLinejoin="round" />
      : sp.slits
        ? <Path d={monsteraLeafPath(rx, ry)} fill={PAPER} stroke={INK} strokeWidth={lineW * 1.3} strokeLinejoin="round" fillRule="evenodd" />
        : <Path
            d={`M 0 ${ry} C ${-rx * (1.18 + asym)} ${ry * 0.4}, ${-rx * (0.82 + asym * 0.5)} ${-ry * 0.82}, ${tip} ${-ry} C ${rx * (0.82 - asym * 0.5)} ${-ry * 0.82}, ${rx * (1.18 - asym)} ${ry * 0.4}, 0 ${ry} Z`}
            fill={PAPER} stroke={INK} strokeWidth={lineW * 1.3} strokeLinejoin="round"
          />;

  const stemBend = jitter(i + 7, 0.15) * (stemLen || 1);

  return (
    <AnimatedG transform={swayTransform}>
      {stemLen > 0 && <Path d={`M 0 0 Q ${stemBend} ${-stemLen * 0.5} 0 ${-stemLen}`} stroke={INK} strokeWidth={lineW * 1.2} strokeLinecap="round" fill="none" />}
      <G transform={`translate(0 ${-(stemLen + ry)})`}>{shape}{inner}</G>
    </AnimatedG>
  );
}

function Fan({ s, sp, sway }) {
  const n = sp.count;
  const angles = n === 1 ? [0] : Array.from({ length: n }, (_, i) => -sp.spread + (2 * sp.spread * i) / (n - 1));
  return angles.map((a, i) => {
    const mid = n % 2 === 1 && i === Math.floor(n / 2);
    const edge = Math.abs(a) > sp.spread * 0.8;
    const grow = (mid ? 1.12 : edge ? 0.86 : 1) + jitter(i, 0.05);
    const w = s * sp.w * grow, h = s * sp.h * grow * (1 + jitter(i + 5, 0.06));
    const stemLen = s * 0.05 * grow * (sp.stemMul || 1);
    const rot = a + (sp.droop ? (a / sp.spread) * sp.droop : 0) + jitter(i, 2.4);
    return <Leaf key={i} s={s} i={i} angle={rot} w={w} h={h} stemLen={stemLen} sp={sp} sway={sway} />;
  });
}

function Cane({ s, c, i, sway }) {
  const lineW = Math.max(0.7, s * 0.008);
  const cw = Math.max(2, s * 0.038);
  const swayAnim = useSway(i, sway, 2600);
  const swayTransform = swayAnim.interpolate({ inputRange: [0, 1], outputRange: [`translate(${c.x} 0) rotate(${c.rot - 2.4})`, `translate(${c.x} 0) rotate(${c.rot + 2.4})`] });
  const nodes = [1, 2, 3].map((k) => <Line key={k} x1={-cw / 2} y1={-c.h * (k / 4)} x2={cw / 2} y2={-c.h * (k / 4)} stroke={INK} strokeWidth={lineW} />);
  const leaves = [0.34, 0.62].map((at, li) => {
    const dir = (i + li) % 2 ? 1 : -1;
    const y = -c.h * at;
    return (
      <Path key={li} d={`M 0 ${y} Q ${dir * s * 0.11} ${y - s * 0.02} ${dir * s * 0.13} ${y + s * 0.015}`} stroke={INK} strokeWidth={lineW} fill="none" strokeLinecap="round" />
    );
  });
  return (
    <AnimatedG transform={swayTransform}>
      <Line x1={0} y1={0} x2={0} y2={-c.h} stroke={INK} strokeWidth={cw} strokeLinecap="round" />
      <Line x1={0} y1={0} x2={0} y2={-c.h} stroke={PAPER} strokeWidth={cw - s * 0.015} strokeLinecap="round" />
      {nodes}{leaves}
    </AnimatedG>
  );
}

function Bamboo({ s, sway }) {
  const canes = [
    { x: -s * 0.11, h: s * 0.5, rot: -5 },
    { x: 0, h: s * 0.6, rot: 0 },
    { x: s * 0.11, h: s * 0.44, rot: 6 }
  ];
  return canes.map((c, i) => <Cane key={i} s={s} c={c} i={i} sway={sway} />);
}

function BonsaiCanopy({ s, seed, sway, children }) {
  const swayAnim = useSway(seed, sway, 2400);
  const swayTransform = swayAnim.interpolate({ inputRange: [0, 1], outputRange: ['rotate(-2.2)', 'rotate(2.2)'] });
  return <AnimatedG transform={swayTransform}>{children}</AnimatedG>;
}

function Bonsai({ s, sway }) {
  const lineW = Math.max(0.7, s * 0.008);
  return (
    <G>
      <Path d={`M 0 0 C ${s * 0.06} ${-s * 0.12}, ${-s * 0.02} ${-s * 0.2}, ${s * 0.02} ${-s * 0.3}`} stroke={INK} strokeWidth={s * 0.065} fill="none" strokeLinecap="round" />
      <Path d={`M 0 0 C ${s * 0.06} ${-s * 0.12}, ${-s * 0.02} ${-s * 0.2}, ${s * 0.02} ${-s * 0.3}`} stroke={PAPER} strokeWidth={s * 0.042} fill="none" strokeLinecap="round" />
      <BonsaiCanopy s={s} seed={0} sway={sway}>
        <Ellipse cx={-s * 0.02} cy={-s * 0.4} rx={s * 0.2} ry={s * 0.09} fill={PAPER} stroke={INK} strokeWidth={lineW * 1.2} />
        {[-0.11, -0.03].map((dx, i) => (
          <Line key={i} x1={-s * 0.02 + dx * s} y1={-s * 0.4} x2={-s * 0.02 + dx * s * 1.3} y2={-s * 0.46} stroke={INK} strokeWidth={lineW * 0.7} strokeLinecap="round" opacity={0.7} />
        ))}
      </BonsaiCanopy>
      <BonsaiCanopy s={s} seed={1} sway={sway}>
        <Ellipse cx={s * 0.15} cy={-s * 0.3} rx={s * 0.13} ry={s * 0.065} fill={PAPER} stroke={INK} strokeWidth={lineW * 1.2} />
        {[0.05, 0.13].map((dx, i) => (
          <Line key={i} x1={-s * 0.02 + dx * s} y1={-s * 0.4} x2={-s * 0.02 + dx * s * 1.3} y2={-s * 0.46} stroke={INK} strokeWidth={lineW * 0.7} strokeLinecap="round" opacity={0.7} />
        ))}
      </BonsaiCanopy>
    </G>
  );
}

// Peanut-Kaktus (Echinopsis chamaecereus) waechst als Buendel laenglicher,
// runder Triebe, nicht als ein Koerper mit duennen Armen - drei
// ueberlappende, vollflaechig gefuellte Zylinder wirken organischer und
// koennen sich nicht wie lose Striche vom Koerper abloesen.
function CactusBlob({ s, b, bi, sway }) {
  const lineW = Math.max(0.7, s * 0.008);
  const swayAnim = useSway(bi, sway, 3200);
  // Ein Kaktus ist holzig/starr - nur ein winziges Wackeln, kein Blatt-Flattern.
  const swayTransform = swayAnim.interpolate({ inputRange: [0, 1], outputRange: [`translate(${b.x} 0) rotate(${b.tilt - 1})`, `translate(${b.x} 0) rotate(${b.tilt + 1})`] });
  const ribs = [0.3, 0.5, 0.7].map((at, i) => (
    <Line key={i} x1={-b.w / 2 + at * b.w} y1={-b.h * 0.88} x2={-b.w / 2 + at * b.w} y2={-b.h * 0.12}
      stroke={INK} strokeWidth={lineW} opacity={i === 1 ? 1 : 0.5} />
  ));
  const spines = [0.28, 0.48, 0.68, 0.85].map((at, i) => (
    <Line key={i} x1={i % 2 ? b.w * 0.4 : -b.w * 0.4} y1={-b.h * at} x2={i % 2 ? b.w * 0.52 : -b.w * 0.52} y2={-b.h * at}
      stroke={INK} strokeWidth={lineW} strokeLinecap="round" />
  ));
  return (
    <AnimatedG transform={swayTransform}>
      <G transform={`translate(0 ${-b.h / 2})`}>
        <Ellipse cx={0} cy={0} rx={b.w / 2} ry={b.h / 2} fill={PAPER} stroke={INK} strokeWidth={lineW * 1.3} />
      </G>
      {ribs}
      {spines}
    </AnimatedG>
  );
}

function Cactus({ s, sway }) {
  const blobs = [
    { x: -s * 0.14, w: s * 0.16, h: s * 0.3, tilt: -9 },
    { x: s * 0.13, w: s * 0.15, h: s * 0.24, tilt: 11 },
    { x: 0, w: s * 0.24, h: s * 0.48, tilt: 0 }
  ];
  return (
    <G>
      {blobs.map((b, bi) => <CactusBlob key={bi} s={s} b={b} bi={bi} sway={sway} />)}
    </G>
  );
}

// Orchideen-Bluetenrispe: ein duenner, leicht gebogener Stiel seitlich der
// Blaetter mit ein paar kleinen, offenen Bluetenkoepfen daran - ohne sie ist
// eine Orchideen-Illustration nur ein Buendel Schwertblaetter und nicht als
// Orchidee erkennbar.
function Bloom({ s }) {
  const lineW = Math.max(0.7, s * 0.008);
  const stemPath = `M ${s * 0.02} 0 C ${s * 0.05} ${-s * 0.16}, ${s * 0.02} ${-s * 0.3}, ${s * 0.12} ${-s * 0.46}`;
  const flowers = [
    { x: s * 0.13, y: -s * 0.47, r: s * 0.055 },
    { x: s * 0.08, y: -s * 0.39, r: s * 0.048 },
    { x: s * 0.15, y: -s * 0.3, r: s * 0.042 }
  ];
  return (
    <G>
      <Path d={stemPath} stroke={INK} strokeWidth={lineW} fill="none" strokeLinecap="round" />
      {flowers.map((f, i) => (
        <G key={i} transform={`translate(${f.x} ${f.y})`}>
          {[0, 72, 144, 216, 288].map((ang) => (
            <Ellipse key={ang} cx={0} cy={-f.r * 0.9} rx={f.r * 0.48} ry={f.r * 0.85} fill={PAPER} stroke={INK}
              strokeWidth={lineW * 0.8} transform={`rotate(${ang})`} />
          ))}
          <Circle cx={0} cy={0} r={f.r * 0.3} fill={BLUSH} />
        </G>
      ))}
    </G>
  );
}

// Fuenf Topf-Stile statt einer einzigen Universalform, damit eine Sammlung
// nicht wie ein Topf mit vielen Pflanzen wirkt: band (schlichte Zierlinie),
// ribbed (gefurchte Keramik), hatch (schraffierter Farbverlauf), basket
// (geflochten) und legs (kleiner Staender mit Beinchen). bowl ist eine runde
// Schale statt der spitz zulaufenden Form.
function Pot({ s, sp, potW, potH }) {
  const style = sp.pot || 'band';
  const lineW = Math.max(0.8, s * 0.009);
  const top = -potH;
  const isBowl = style === 'bowl';

  // Leichte Baucharung an den Seiten statt exakt gerader Linien - wirkt
  // getoepfert statt CAD-gezeichnet. Die obere Kante ist eine ganz flache
  // Kurve (keine Ellipse!) - ein Topf von vorn, kein schwebender Kreis oben.
  const wob = potW * 0.025;
  const rimDip = potH * 0.05;
  const bodyPath = isBowl
    ? `M ${-potW / 2} ${top * 0.55} Q ${-potW / 2} 0 0 0 Q ${potW / 2} 0 ${potW / 2} ${top * 0.55} Z`
    : `M ${-potW / 2} ${top} Q 0 ${top - rimDip} ${potW / 2} ${top} Q ${potW / 2 + wob} ${top * 0.4} ${potW * 0.42} 0 L ${-potW * 0.42} 0 Q ${-potW / 2 - wob} ${top * 0.4} ${-potW / 2} ${top} Z`;

  const deco = [];
  if (style === 'band') {
    deco.push(<Line key="band" x1={-potW * 0.44} y1={top * 0.6} x2={potW * 0.44} y2={top * 0.6} stroke={INK} strokeWidth={lineW} opacity={0.8} />);
  }
  if (style === 'ribbed') {
    for (let k = -2; k <= 2; k++) {
      deco.push(<Line key={'r' + k} x1={k * potW * 0.15} y1={top * 0.92} x2={k * potW * 0.11} y2={-2} stroke={INK} strokeWidth={lineW * 0.7} opacity={0.55} />);
    }
  }
  if (style === 'hatch') {
    for (let row = 0; row < 4; row++) {
      const y = top * (0.18 + row * 0.2);
      const count = 3 + row;
      for (let c = 0; c < count; c++) {
        const x = -potW * 0.36 + (c * potW * 0.72) / Math.max(1, count - 1);
        deco.push(<Line key={`h${row}-${c}`} x1={x} y1={y} x2={x} y2={y - s * 0.014} stroke={INK} strokeWidth={lineW * 0.6} opacity={0.5} />);
      }
    }
  }
  if (style === 'basket') {
    for (let row = 1; row <= 3; row++) {
      const y = top * (row / 4);
      deco.push(<Line key={'bh' + row} x1={-potW * 0.44} y1={y} x2={potW * 0.44} y2={y} stroke={INK} strokeWidth={lineW * 0.65} opacity={0.6} />);
    }
    for (let col = -3; col <= 3; col++) {
      deco.push(<Line key={'bv' + col} x1={col * potW * 0.12} y1={top * 0.92} x2={col * potW * 0.1} y2={-2} stroke={INK} strokeWidth={lineW * 0.5} opacity={0.45} />);
    }
  }

  return (
    <G>
      {style === 'legs' && [-1, 1].map((dir) => (
        <Line key={'leg' + dir} x1={dir * potW * 0.3} y1={0} x2={dir * potW * 0.38} y2={potH * 0.16} stroke={INK} strokeWidth={lineW * 0.9} strokeLinecap="round" />
      ))}
      <Path d={bodyPath} fill={PAPER} stroke={INK} strokeWidth={lineW * 1.2} strokeLinejoin="round" />
      {deco}
      {/* Randlippe: eine duenne Innenlinie knapp unter dem oberen Rand statt
          einer schwebenden Ellipse - liest sich als Topfdicke, nicht als Kreis. */}
      <Path
        d={isBowl
          ? `M ${-potW * 0.42} ${top * 0.5} Q 0 ${top * 0.32} ${potW * 0.42} ${top * 0.5}`
          : `M ${-potW * 0.46} ${top + rimDip * 0.6} Q 0 ${top - rimDip * 0.5} ${potW * 0.46} ${top + rimDip * 0.6}`}
        stroke={INK} strokeWidth={lineW * 0.7} fill="none" strokeLinecap="round" opacity={0.6}
      />
    </G>
  );
}

const BLUSH = '#E8998A';

function Blush({ eyeD }) {
  return (
    <G opacity={0.65}>
      <Ellipse cx={-eyeD * 2.5} cy={eyeD * 0.95} rx={eyeD * 1.1} ry={eyeD * 0.72} fill={BLUSH} />
      <Ellipse cx={eyeD * 2.5} cy={eyeD * 0.95} rx={eyeD * 1.1} ry={eyeD * 0.72} fill={BLUSH} />
    </G>
  );
}

const FACE = {
  happy: (s, eyeD) => (
    <G>
      <Blush eyeD={eyeD} />
      <Circle cx={-eyeD * 1.5} cy={0} r={eyeD * 0.62} fill={INK} />
      <Circle cx={eyeD * 1.5} cy={0} r={eyeD * 0.62} fill={INK} />
      <Circle cx={-eyeD * 1.24} cy={-eyeD * 0.22} r={eyeD * 0.18} fill={PAPER} />
      <Circle cx={eyeD * 1.76} cy={-eyeD * 0.22} r={eyeD * 0.18} fill={PAPER} />
      <Path d={`M ${-eyeD * 0.95} ${eyeD * 1.15} Q 0 ${eyeD * 2} ${eyeD * 0.95} ${eyeD * 1.15}`} stroke={INK} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
    </G>
  ),
  sad: (s, eyeD) => (
    <G>
      <Blush eyeD={eyeD} />
      {/* Sorgenvolle Augenbrauen (innen hoch, aussen haengend) ueber
          geschlossenen, nach unten blickenden Augen - vorher waren die
          "Augen" fast flache Striche ohne erkennbaren Ausdruck. */}
      <Path d={`M ${-eyeD * 2.3} ${-eyeD} L ${-eyeD * 0.9} ${-eyeD * 1.5}`} stroke={INK} strokeWidth={s * 0.026} fill="none" strokeLinecap="round" />
      <Path d={`M ${eyeD * 0.9} ${-eyeD * 1.5} L ${eyeD * 2.3} ${-eyeD}`} stroke={INK} strokeWidth={s * 0.026} fill="none" strokeLinecap="round" />
      <Path d={`M ${-eyeD * 2.1} 0 Q ${-eyeD * 1.5} ${eyeD * 0.55} ${-eyeD * 0.85} 0`} stroke={INK} strokeWidth={s * 0.024} fill="none" strokeLinecap="round" />
      <Path d={`M ${eyeD * 0.85} 0 Q ${eyeD * 1.5} ${eyeD * 0.55} ${eyeD * 2.1} 0`} stroke={INK} strokeWidth={s * 0.024} fill="none" strokeLinecap="round" />
      <Path d={`M ${-eyeD * 0.9} ${eyeD * 1.7} Q 0 ${eyeD} ${eyeD * 0.9} ${eyeD * 1.7}`} stroke={INK} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
    </G>
  ),
  sleepy: (s, eyeD) => (
    <G>
      <Blush eyeD={eyeD} />
      <Path d={`M ${-eyeD * 2.3} 0 Q ${-eyeD * 1.5} ${-eyeD} ${-eyeD * 0.7} 0`} stroke={INK} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
      <Path d={`M ${eyeD * 0.7} 0 Q ${eyeD * 1.5} ${-eyeD} ${eyeD * 2.3} 0`} stroke={INK} strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />
      {/* Neutraler, leicht haengender Mund statt eines Laechelns - nur
          "happy" soll wirklich froehlich wirken, "sleepy" ist unzufrieden
          (nasse Fuesse/Dunkelheit/trockene Luft), nicht bloss muede. */}
      <Path d={`M ${-eyeD * 0.7} ${eyeD * 1.55} Q 0 ${eyeD * 1.4} ${eyeD * 0.7} ${eyeD * 1.55}`} stroke={INK} strokeWidth={s * 0.024} fill="none" strokeLinecap="round" />
    </G>
  ),
  pot: (s, eyeD) => (
    <G opacity={0.4}>
      <Circle cx={-eyeD * 1.5} cy={0} r={eyeD * 0.5} fill={INK} />
      <Circle cx={eyeD * 1.5} cy={0} r={eyeD * 0.5} fill={INK} />
      <Line x1={-eyeD} y1={eyeD * 1.4} x2={eyeD} y2={eyeD * 1.4} stroke={INK} strokeWidth={s * 0.018} strokeLinecap="round" />
    </G>
  )
};

export function PlantAvatar({ kind = 'generic', mood = 'happy', size = 96, sway = true, style }) {
  const s = size;
  const sp = SPECIES[kind] || SPECIES.generic;
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!sway) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(swayAnim, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sway, swayAnim]);

  const rotate = swayAnim.interpolate({ inputRange: [0, 1], outputRange: ['-1.6deg', '1.6deg'] });
  const potScale = sp.potScale || 1;
  const potW = s * 0.56 * potScale, potH = s * 0.42 * potScale;
  const eyeD = Math.max(2.4, s * 0.05);
  // Bei kleineren Toepfen (Kaktus, Bogenhanf, Palmlilie, ...) reicht ein
  // fixer Anteil der (dann kleineren) Topfhoehe nicht - die Pflanze bleibt
  // gleich gross und wirkt trotzdem, als schwebe sie ueber dem Topf. Je
  // kleiner der Topf, desto staerker zusaetzlich absenken.
  const anchorRatio = 0.68 - (1 - potScale) * 1.6;
  // Die Schale (pot: 'bowl') ist viel flacher als ein normaler Topf - ihre
  // sichtbare Oberkante liegt bei top*0.55, nicht bei top (siehe Pot()).
  // Ohne diese Korrektur haengt die Pflanze mit sichtbarem Abstand ueber
  // der Schale, weil der Anker sich an der (viel hoeheren) Kontur eines
  // normalen Topfes orientiert.
  const rimFactor = sp.pot === 'bowl' ? 0.55 : 1;
  const anchorY = -(potH * rimFactor * anchorRatio);

  return (
    <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View style={{ width: s, height: s, transform: [{ rotate }] }}>
        <Svg width={s} height={s} viewBox={`${-s / 2} ${-s} ${s} ${s}`}>
          {/* Boden-Schattenlinie */}
          <Line x1={-s * 0.25} y1={-s * 0.015} x2={s * 0.25} y2={-s * 0.015} stroke={INK} strokeWidth={Math.max(1, s * 0.009)} strokeLinecap="round" opacity={0.4} />

          {/* Pflanzenbasis deutlich unter dem Rand ansetzen, nicht nur knapp
              daran - sonst wirkt es, als schwebe die Pflanze ueber dem Topf
              statt darin zu stecken. Gilt fuer alle Topfgroessen gleich. */}
          <G transform={`translate(0 ${anchorY})`}>
            {!!sp.stemHeight && (
              <Line x1={0} y1={0} x2={0} y2={-s * sp.stemHeight} stroke={INK} strokeWidth={Math.max(1.4, s * 0.02)} strokeLinecap="round" />
            )}
            {/* lift: hebt die Blattgruppe wie stemHeight an, aber OHNE eine
                Stamm-Linie zu zeichnen - fuer Arten mit mehreren duennen
                Einzelstielen statt einem gemeinsamen Stamm (z.B. Pfeilblatt,
                Strelizie, Ufopflanze), deren eigene, pro Blatt gezeichnete
                Stiele sonst komplett unter dem Topfrand verschwinden. */}
            <G transform={`translate(0 ${-s * ((sp.stemHeight || 0) + (sp.lift || 0))})`}>
              {sp.form === 'fan' && <Fan s={s} sp={sp} sway={sway} />}
              {sp.form === 'bamboo' && <Bamboo s={s} sway={sway} />}
              {sp.form === 'bonsai' && <Bonsai s={s} sway={sway} />}
              {sp.form === 'cactus' && <Cactus s={s} sway={sway} />}
              {!!sp.bloom && <Bloom s={s} />}
            </G>
          </G>

          <Pot s={s} sp={sp} potW={potW} potH={potH} />

          {/* Gesicht - bewusst kraeftiger gezeichnet als die duenne
              Botanik-Skizze darunter, damit es als niedlicher Kontrast wirkt. */}
          <G transform={`translate(0 ${-potH * 0.44})`}>
            {(FACE[mood] || FACE.happy)(s, eyeD)}
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}
