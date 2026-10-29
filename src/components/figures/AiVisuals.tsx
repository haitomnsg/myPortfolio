import type { Frame } from '@/data/site';

// Chapter 02: the drawn outputs on the film. Each is a model's output as a small paper print, in the
// site's drawing language: navy hairlines, paper, one apricot reading. Where a real screen exists
// (Phulbari, DocLipi) the frame shows that instead.

type Props = { kind: NonNullable<Frame['visual']>; className?: string };

const ink = '#121a26';
const sky = '#1e578f';
const hair = '#c9daec';
const pale = '#eaf1f8';
const signal = '#ff8f4d';
const mono = { fontFamily: 'var(--f-mono), ui-monospace, monospace', fontWeight: 500 } as const;

function Corners({ x, y, w, h, s = 14, color = sky }: { x: number; y: number; w: number; h: number; s?: number; color?: string }) {
  const d = [
    `M${x} ${y + s}V${y}h${s}`,
    `M${x + w - s} ${y}h${s}v${s}`,
    `M${x} ${y + h - s}v${s}h${s}`,
    `M${x + w - s} ${y + h}h${s}v${-s}`,
  ].join(' ');
  return <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />;
}

export function FrameVisual({ kind, className }: Props) {
  const common = { className, viewBox: '0 0 300 250', 'aria-hidden': true as const };
  switch (kind) {
    case 'bench': {
      // nine experiments on one bench, each a small tile with its own mark
      const tiles = ['tumour area', 'fire / smoke', 'autoencoder', 'DQN', 'LSTM · GRU', 'Nepali NLP', 'optical flow', 'panoptic seg.', 'heritage'];
      const bars = [8, 14, 11, 18];
      return (
        <svg {...common}>
          <rect width="300" height="250" fill="#fff" />
          {tiles.map((t, i) => {
            const x = 16 + (i % 3) * 92;
            const y = 16 + Math.floor(i / 3) * 74;
            return (
              <g key={t}>
                <rect x={x} y={y} width="80" height="62" rx="8" fill={pale} stroke={hair} />
                {i === 0 && <circle cx={x + 40} cy={y + 24} r="9" fill="none" stroke={sky} strokeWidth="1.5" strokeDasharray="2 2" />}
                {i === 1 && <path d={`M${x + 33} ${y + 34}c0-10 7-12 7-20 6 6 10 12 10 20a8 8 0 0 1-17 0z`} fill="none" stroke={sky} strokeWidth="1.5" />}
                {i === 2 && <path d={`M${x + 26} ${y + 24}h8l6-8 6 16 6-8h10`} fill="none" stroke={sky} strokeWidth="1.5" strokeLinejoin="round" />}
                {i === 3 && bars.map((h, k) => <rect key={k} x={x + 28 + k * 7} y={y + 34 - h} width="4" height={h} fill={sky} opacity={k === 3 ? 1 : 0.5} />)}
                {i === 4 && <path d={`M${x + 24} ${y + 30}c10-16 16 8 26-6 6-8 10 2 14-2`} fill="none" stroke={sky} strokeWidth="1.5" />}
                {i === 5 && <text x={x + 40} y={y + 30} textAnchor="middle" fontSize="14" fill={sky} fontFamily="serif">नेपाली</text>}
                {i === 6 && <path d={`M${x + 26} ${y + 18}l8 4m4 2l8 4m-20 4l8 4m4 2l8 4`} stroke={sky} strokeWidth="1.5" strokeLinecap="round" />}
                {i === 7 && <g fill="none" stroke={sky} strokeWidth="1.5"><rect x={x + 24} y={y + 14} width="14" height="20" rx="2" /><rect x={x + 42} y={y + 20} width="14" height="14" rx="2" /></g>}
                {i === 8 && <path d={`M${x + 28} ${y + 34}v-10l12-10 12 10v10z`} fill="none" stroke={sky} strokeWidth="1.5" strokeLinejoin="round" />}
                <text x={x + 40} y={y + 52} textAnchor="middle" fontSize="8" fill={ink} opacity="0.75" style={mono}>{t}</text>
              </g>
            );
          })}
        </svg>
      );
    }
    case 'tomato-vision': {
      // what the Raspberry Pi sees: three tomatoes on a stake, YOLO boxes on the ripe ones
      const fruit = [
        { x: 92, y: 96, r: 20, ripe: true },
        { x: 164, y: 150, r: 23, ripe: true },
        { x: 212, y: 88, r: 17, ripe: false },
      ];
      return (
        <svg {...common}>
          <rect width="300" height="250" fill="#fff" />
          <rect x="14" y="14" width="272" height="222" rx="10" fill={pale} />
          <path d="M150 236V40" stroke={sky} strokeWidth="2" strokeLinecap="round" />
          <path d="M150 90c-20 0-34-4-58 6M150 130c10 8 10 20 14 20M150 72c20 0 40 2 62 16" fill="none" stroke="#6f9a6b" strokeWidth="1.5" strokeLinecap="round" />
          {fruit.map((f) => (
            <g key={f.x}>
              <circle cx={f.x} cy={f.y} r={f.r} fill={f.ripe ? '#e05a3f' : '#8fbb7a'} />
              <circle cx={f.x - f.r * 0.3} cy={f.y - f.r * 0.35} r={f.r * 0.3} fill="#fff" opacity="0.35" />
              <path d={`M${f.x - 6} ${f.y - f.r + 1}l6-5 6 5M${f.x} ${f.y - f.r - 4}v6`} fill="none" stroke="#4b7a4a" strokeWidth="1.5" strokeLinecap="round" />
              <rect x={f.x - f.r - 6} y={f.y - f.r - 8} width={f.r * 2 + 12} height={f.r * 2 + 14} rx="3" fill="none" stroke={f.ripe ? signal : sky} strokeWidth="1.5" strokeDasharray={f.ripe ? undefined : '3 3'} />
              <rect x={f.x - f.r - 6} y={f.y - f.r - 20} width={f.ripe ? 30 : 40} height="12" rx="2" fill={f.ripe ? signal : sky} />
              <text x={f.x - f.r - 1} y={f.y - f.r - 11} fontSize="8" fill="#fff" style={mono}>{f.ripe ? 'ripe' : 'unripe'}</text>
            </g>
          ))}
          <Corners x={24} y={24} w={252} h={202} />
          <text x="30" y="46" fontSize="8" fill={sky} style={mono}>YOLOv11 · 6 CLASSES</text>
          <text x="270" y="216" fontSize="8" fill={sky} textAnchor="end" style={mono}>FIELD · 88%</text>
        </svg>
      );
    }
    case 'recyclo': {
      // a bottle under the camera, and the three bins it could go in
      return (
        <svg {...common}>
          <rect width="300" height="250" fill="#fff" />
          <rect x="14" y="14" width="272" height="156" rx="10" fill={pale} />
          <path d="M138 44h24v16l12 14v62a8 8 0 0 1-8 8h-32a8 8 0 0 1-8-8V74l12-14z" fill="#fff" stroke={sky} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M134 96h32M134 112h32" stroke={hair} strokeWidth="1.5" />
          <Corners x={112} y={34} w={76} h={116} color={signal} />
          <text x="30" y="40" fontSize="8" fill={sky} style={mono}>GEMINI · WHAT IS THIS</text>
          {['plastic', 'paper', 'organic'].map((c, i) => (
            <g key={c}>
              <rect x={16 + i * 92} y="186" width="84" height="26" rx="13" fill={i === 0 ? ink : '#fff'} stroke={i === 0 ? ink : hair} />
              <text x={58 + i * 92} y="203" fontSize="9" textAnchor="middle" fill={i === 0 ? '#fff' : ink} style={mono}>{c}</text>
            </g>
          ))}
          <text x="16" y="236" fontSize="8" fill={sky} style={mono}>↳ REUSE IDEAS · THRIFT · CLEANUPS</text>
        </svg>
      );
    }
    case 'dementiabot': {
      // a conversation; the words are not shown, the shape of a patient one is
      const rows = [
        { left: true, w: 150, lines: [120, 80] },
        { left: false, w: 120, lines: [90] },
        { left: true, w: 170, lines: [140, 110, 60] },
      ];
      let y = 30;
      return (
        <svg {...common}>
          <rect width="300" height="250" fill="#fff" />
          {rows.map((r, i) => {
            const h = 16 + r.lines.length * 10;
            const x = r.left ? 20 : 280 - r.w;
            const top = y;
            y += h + 12;
            return (
              <g key={i}>
                <rect x={x} y={top} width={r.w} height={h} rx="12" fill={r.left ? pale : '#fff'} stroke={r.left ? pale : hair} />
                {r.lines.map((l, k) => <rect key={k} x={x + 14} y={top + 10 + k * 10} width={l} height="4" rx="2" fill={sky} opacity={r.left ? 0.45 : 0.25} />)}
              </g>
            );
          })}
          <circle cx="30" cy="222" r="4" fill={signal} />
          <text x="42" y="225" fontSize="8" fill={sky} style={mono}>DIZZYBITS · HARVARD HEALTH HACKATHON</text>
        </svg>
      );
    }
    case 'risk': {
      // the review queue: accounts ranked by risk, the top one first
      const bars = [0.92, 0.71, 0.58, 0.44, 0.31, 0.19];
      return (
        <svg {...common}>
          <rect width="300" height="250" fill="#fff" />
          <text x="16" y="30" fontSize="8" fill={sky} style={mono}>XGBOOST · REVIEW QUEUE</text>
          <text x="284" y="30" fontSize="8" fill={sky} textAnchor="end" style={mono}>RISK</text>
          {bars.map((b, i) => {
            const y = 48 + i * 30;
            return (
              <g key={i}>
                <text x="16" y={y + 13} fontSize="9" fill={ink} opacity="0.7" style={mono}>{String(i + 1).padStart(2, '0')}</text>
                <rect x="40" y={y} width="244" height="18" rx="9" fill={pale} />
                <rect x="40" y={y} width={244 * b} height="18" rx="9" fill={i === 0 ? signal : sky} opacity={i === 0 ? 1 : 0.35 + 0.1 * (5 - i)} />
              </g>
            );
          })}
          <text x="16" y="240" fontSize="8" fill={sky} style={mono}>↳ WHY: THE FEATURES THAT MOVED THE SCORE</text>
        </svg>
      );
    }
    case 'phulbari':
    case 'doclipi':
      return null; // a real screen stands in (Frame.image)
  }
}
