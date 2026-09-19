import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

// Outline-Illustrationen je SpeciesKind, nachgebaut aus PlantAvatar.dc.html:
// 2-3px Tintenkontur, cremeweisse Fuellung, keine Farbflaechen. Jede Art
// besteht aus einem Blaetter-Faecher (die meisten Arten), oder einer der
// drei Sonderformen (Bambus, Bonsai, Kaktus).
const INK = '#1D2418';
const PAPER = '#FFFDF7';

const SPECIES = {
  begonia: { form: 'fan', count: 4, w: 0.24, h: 0.34, spread: 40, vein: 'mid', spots: 4 },
  kingbegonia: { form: 'fan', count: 4, w: 0.27, h: 0.3, spread: 44, vein: 'fan', spots: 3 },
  pilea: { form: 'fan', count: 5, w: 0.2, h: 0.2, spread: 50, round: true, vein: 'fan' },
  monstera: { form: 'fan', count: 3, w: 0.32, h: 0.34, spread: 44, vein: 'mid', slits: 3 },
  strelitzia: { form: 'fan', count: 4, w: 0.19, h: 0.46, spread: 30, vein: 'mid' },
  pothos: { form: 'fan', count: 5, w: 0.23, h: 0.25, spread: 74, droop: 22, vein: 'mid' },
  sansevieria: { form: 'fan', count: 5, w: 0.1, h: 0.62, spread: 20, straight: true, potScale: 0.86 },
  coffee: { form: 'fan', count: 5, w: 0.17, h: 0.3, spread: 46, vein: 'mid', berries: true },
  rubber: { form: 'fan', count: 4, w: 0.24, h: 0.38, spread: 34, vein: 'mid' },
  fern: { form: 'fan', count: 5, w: 0.12, h: 0.48, spread: 50, vein: 'mid', comb: 4 },
  bamboo: { form: 'bamboo', potScale: 0.82 },
  bonsai: { form: 'bonsai', potScale: 1.06 },
  cactus: { form: 'cactus', potScale: 0.9 },
  generic: { form: 'fan', count: 3, w: 0.27, h: 0.42, spread: 36, vein: 'mid' }
};

function Leaf({ s, angle, w, h, stemLen, sp, i }) {
  const rx = w / 2, ry = h / 2;
  const inner = [];
  if (sp.vein === 'mid') {
    inner.push(<Line key="rib" x1={0} y1={-ry * 0.8} x2={0} y2={ry * 0.75} stroke={INK} strokeWidth={s * 0.014} strokeLinecap="round" />);
  }
  if (sp.vein === 'fan') {
    [-26, 0, 26].forEach((va, vi) => inner.push(
      <Line key={'v' + vi} x1={0} y1={ry * 0.8} x2={ry * 0.62 * Math.sin((va * Math.PI) / 180)} y2={ry * 0.8 - ry * 0.62 * Math.cos((va * Math.PI) / 180)}
        stroke={INK} strokeWidth={s * 0.012} strokeLinecap="round" />
    ));
  }
  if (sp.slits) {
    for (let k = 0; k < sp.slits; k++) {
      const y = -ry * 0.5 + k * (ry * 0.5);
      [-1, 1].forEach((dir) => inner.push(
        <Line key={'sl' + k + dir} x1={dir * rx * 0.95} y1={y} x2={dir * rx * 0.35} y2={y + ry * 0.16}
          stroke={INK} strokeWidth={s * 0.013} strokeLinecap="round" />
      ));
    }
  }
  if (sp.comb) {
    for (let k = 0; k < sp.comb; k++) {
      const y = -ry * 0.75 + k * (ry * 1.4 / sp.comb);
      [-1, 1].forEach((dir) => inner.push(
        <Line key={'c' + k + dir} x1={0} y1={y} x2={dir * rx * 0.85} y2={y + ry * 0.12}
          stroke={INK} strokeWidth={s * 0.011} strokeLinecap="round" />
      ));
    }
  }
  if (sp.spots) {
    for (let k = 0; k < sp.spots; k++) {
      inner.push(<Circle key={'sp' + k} cx={(k % 2 ? 1 : -1) * rx * 0.32} cy={-ry * 0.3 + k * ry * 0.28} r={Math.max(1.2, w * 0.05)} fill={INK} />);
    }
  }
  if (sp.berries && i === 1) {
    inner.push(<Circle key="berry" cx={rx * 0.5} cy={ry * 0.6} r={Math.max(1.6, w * 0.07)} fill={PAPER} stroke={INK} strokeWidth={s * 0.012} />);
  }

  const shape = sp.round
    ? <Circle cx={0} cy={0} r={rx} fill={PAPER} stroke={INK} strokeWidth={s * 0.018} />
    : sp.straight
      ? <Path d={`M ${-rx} ${ry} L ${-rx * 0.7} ${-ry} L ${rx * 0.7} ${-ry} L ${rx} ${ry} Z`} fill={PAPER} stroke={INK} strokeWidth={s * 0.018} strokeLinejoin="round" />
      : <Path
          d={`M 0 ${ry} C ${-rx * 1.15} ${ry * 0.35}, ${-rx * 0.85} ${-ry * 0.85}, 0 ${-ry} C ${rx * 0.85} ${-ry * 0.85}, ${rx * 1.15} ${ry * 0.35}, 0 ${ry} Z`}
          fill={PAPER} stroke={INK} strokeWidth={s * 0.018} strokeLinejoin="round"
        />;

  return (
    <G transform={`rotate(${angle})`}>
      {stemLen > 0 && <Line x1={0} y1={0} x2={0} y2={-stemLen} stroke={INK} strokeWidth={s * 0.018} strokeLinecap="round" />}
      <G transform={`translate(0 ${-(stemLen + ry)})`}>{shape}{inner}</G>
    </G>
  );
}

function Fan({ s, sp }) {
  const n = sp.count;
  const angles = n === 1 ? [0] : Array.from({ length: n }, (_, i) => -sp.spread + (2 * sp.spread * i) / (n - 1));
  return angles.map((a, i) => {
    const mid = n % 2 === 1 && i === Math.floor(n / 2);
    const grow = mid ? 1.1 : Math.abs(a) > sp.spread * 0.8 ? 0.9 : 1;
    const w = s * sp.w * grow, h = s * sp.h * grow;
    const stemLen = s * 0.05 * grow;
    const rot = a + (sp.droop ? (a / sp.spread) * sp.droop : 0);
    return <Leaf key={i} s={s} i={i} angle={rot} w={w} h={h} stemLen={stemLen} sp={sp} />;
  });
}

function Bamboo({ s }) {
  const canes = [
    { x: -s * 0.11, h: s * 0.5, rot: -5 },
    { x: 0, h: s * 0.6, rot: 0 },
    { x: s * 0.11, h: s * 0.44, rot: 6 }
  ];
  return canes.map((c, i) => {
    const cw = Math.max(2.4, s * 0.05);
    const nodes = [1, 2, 3].map((k) => <Line key={k} x1={-cw / 2} y1={-c.h * (k / 4)} x2={cw / 2} y2={-c.h * (k / 4)} stroke={INK} strokeWidth={s * 0.012} />);
    const leaves = [0.34, 0.62].map((at, li) => {
      const dir = (i + li) % 2 ? 1 : -1;
      const y = -c.h * at;
      return (
        <Path key={li} d={`M 0 ${y} Q ${dir * s * 0.11} ${y - s * 0.02} ${dir * s * 0.13} ${y + s * 0.015}`} stroke={INK} strokeWidth={s * 0.014} fill="none" strokeLinecap="round" />
      );
    });
    return (
      <G key={i} transform={`translate(${c.x} 0) rotate(${c.rot})`}>
        <Line x1={0} y1={0} x2={0} y2={-c.h} stroke={INK} strokeWidth={cw} strokeLinecap="round" />
        <Line x1={0} y1={0} x2={0} y2={-c.h} stroke={PAPER} strokeWidth={cw - s * 0.02} strokeLinecap="round" />
        {nodes}{leaves}
      </G>
    );
  });
}

function Bonsai({ s }) {
  return (
    <G>
      <Path d={`M 0 0 C ${s * 0.06} ${-s * 0.12}, ${-s * 0.02} ${-s * 0.2}, ${s * 0.02} ${-s * 0.3}`} stroke={INK} strokeWidth={s * 0.075} fill="none" strokeLinecap="round" />
      <Path d={`M 0 0 C ${s * 0.06} ${-s * 0.12}, ${-s * 0.02} ${-s * 0.2}, ${s * 0.02} ${-s * 0.3}`} stroke={PAPER} strokeWidth={s * 0.05} fill="none" strokeLinecap="round" />
      <Ellipse cx={-s * 0.02} cy={-s * 0.4} rx={s * 0.2} ry={s * 0.09} fill={PAPER} stroke={INK} strokeWidth={s * 0.016} />
      <Ellipse cx={s * 0.15} cy={-s * 0.3} rx={s * 0.13} ry={s * 0.065} fill={PAPER} stroke={INK} strokeWidth={s * 0.016} />
    </G>
  );
}

function Cactus({ s }) {
  const bodyW = s * 0.28, bodyH = s * 0.5;
  const ribs = [0.32, 0.5, 0.68].map((at, i) => (
    <Line key={i} x1={-bodyW / 2 + at * bodyW} y1={-bodyH * 0.9} x2={-bodyW / 2 + at * bodyW} y2={-bodyH * 0.1}
      stroke={INK} strokeWidth={s * 0.01} opacity={i === 1 ? 1 : 0.5} />
  ));
  const spines = [0.24, 0.44, 0.64, 0.82].map((at, i) => (
    <Line key={i} x1={i % 2 ? bodyW * 0.42 : -bodyW * 0.42} y1={-bodyH * at} x2={i % 2 ? bodyW * 0.55 : -bodyW * 0.55} y2={-bodyH * at}
      stroke={INK} strokeWidth={s * 0.012} strokeLinecap="round" />
  ));
  return (
    <G>
      <G transform={`translate(${-s * 0.19} 0) rotate(-24)`}>
        <Path d={`M 0 0 L 0 ${-s * 0.2}`} stroke={INK} strokeWidth={s * 0.1} strokeLinecap="round" />
        <Path d={`M 0 0 L 0 ${-s * 0.2}`} stroke={PAPER} strokeWidth={s * 0.07} strokeLinecap="round" />
      </G>
      <G transform={`translate(${s * 0.19} 0) rotate(24)`}>
        <Path d={`M 0 0 L 0 ${-s * 0.17}`} stroke={INK} strokeWidth={s * 0.1} strokeLinecap="round" />
        <Path d={`M 0 0 L 0 ${-s * 0.17}`} stroke={PAPER} strokeWidth={s * 0.07} strokeLinecap="round" />
      </G>
      <G transform={`translate(0 ${-bodyH / 2})`}>
        <Ellipse cx={0} cy={0} rx={bodyW / 2} ry={bodyH / 2} fill={PAPER} stroke={INK} strokeWidth={s * 0.018} />
      </G>
      <G transform={`translate(0 ${-bodyH})`}>{ribs}{spines}</G>
    </G>
  );
}

const FACE = {
  happy: (s, eyeD) => (
    <G>
      <Circle cx={-eyeD * 1.5} cy={0} r={eyeD * 0.5} fill={INK} />
      <Circle cx={eyeD * 1.5} cy={0} r={eyeD * 0.5} fill={INK} />
      <Path d={`M ${-eyeD * 1.5} ${eyeD * 1.1} Q 0 ${eyeD * 2.4} ${eyeD * 1.5} ${eyeD * 1.1}`} stroke={INK} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
    </G>
  ),
  sad: (s, eyeD) => (
    <G>
      <Path d={`M ${-eyeD * 2.1} ${-eyeD * 0.2} A ${eyeD} ${eyeD} 0 0 0 ${-eyeD * 0.9} ${-eyeD * 0.2}`} stroke={INK} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
      <Path d={`M ${eyeD * 0.9} ${-eyeD * 0.2} A ${eyeD} ${eyeD} 0 0 0 ${eyeD * 2.1} ${-eyeD * 0.2}`} stroke={INK} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
      <Path d={`M ${-eyeD * 1.5} ${eyeD * 1.7} Q 0 ${eyeD * 0.7} ${eyeD * 1.5} ${eyeD * 1.7}`} stroke={INK} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
    </G>
  ),
  sleepy: (s, eyeD) => (
    <G>
      <Path d={`M ${-eyeD * 2.2} 0 Q ${-eyeD * 1.5} ${-eyeD * 0.9} ${-eyeD * 0.8} 0`} stroke={INK} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
      <Path d={`M ${eyeD * 0.8} 0 Q ${eyeD * 1.5} ${-eyeD * 0.9} ${eyeD * 2.2} 0`} stroke={INK} strokeWidth={s * 0.02} fill="none" strokeLinecap="round" />
      <Line x1={-eyeD} y1={eyeD * 1.4} x2={eyeD} y2={eyeD * 1.4} stroke={INK} strokeWidth={s * 0.022} strokeLinecap="round" />
    </G>
  ),
  pot: (s, eyeD) => (
    <G opacity={0.45}>
      <Circle cx={-eyeD * 1.5} cy={0} r={eyeD * 0.4} fill={INK} />
      <Circle cx={eyeD * 1.5} cy={0} r={eyeD * 0.4} fill={INK} />
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

  const rotate = swayAnim.interpolate({ inputRange: [0, 1], outputRange: ['-2.6deg', '2.6deg'] });
  const potW = s * 0.56 * (sp.potScale || 1), potH = s * 0.42 * (sp.potScale || 1);
  const eyeD = Math.max(2.2, s * 0.045);

  return (
    <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View style={{ width: s, height: s, transform: [{ rotate }] }}>
        <Svg width={s} height={s} viewBox={`${-s / 2} ${-s} ${s} ${s}`}>
          {/* Boden-Schattenlinie */}
          <Line x1={-s * 0.25} y1={-s * 0.015} x2={s * 0.25} y2={-s * 0.015} stroke={INK} strokeWidth={Math.max(1.5, s * 0.014)} strokeLinecap="round" opacity={0.5} />

          <G transform={`translate(0 ${-(potH * 0.92)})`}>
            {sp.form === 'fan' && <Fan s={s} sp={sp} />}
            {sp.form === 'bamboo' && <Bamboo s={s} />}
            {sp.form === 'bonsai' && <Bonsai s={s} />}
            {sp.form === 'cactus' && <Cactus s={s} />}
          </G>

          {/* Topf */}
          <G transform="translate(0 0)">
            <Path
              d={`M ${-potW / 2} ${-potH} L ${potW / 2} ${-potH} L ${potW * 0.42} 0 L ${-potW * 0.42} 0 Z`}
              fill={PAPER} stroke={INK} strokeWidth={s * 0.02} strokeLinejoin="round"
            />
            <Ellipse cx={0} cy={-potH * 0.92} rx={potW * 0.4} ry={potH * 0.1} fill={PAPER} stroke={INK} strokeWidth={s * 0.018} />
            <Ellipse cx={0} cy={-potH} rx={potW * 0.55} ry={potH * 0.13} fill={PAPER} stroke={INK} strokeWidth={s * 0.02} />
          </G>

          {/* Gesicht */}
          <G transform={`translate(0 ${-potH * 0.34})`}>
            {(FACE[mood] || FACE.happy)(s, eyeD)}
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}
