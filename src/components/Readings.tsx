import { readings } from '@/data/site';

// Chart space: x 0..400, y 0..140 for reward 300..0, with room above and below for the dot.
const W = 400;
const H = 140;
const PAD = 14;
const yOf = (r: number) => H - (r / 300) * H;

/** A learning curve that rises and levels off at `final`. Only `final` is data; the wiggle is drawing. */
function curve(final: number, rate: number, seed: number) {
  const pts: [number, number][] = [];
  const N = 44;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const base = (final * (1 - Math.exp(-rate * t))) / (1 - Math.exp(-rate));
    const wiggle = final * (1 - t) * (0.035 * Math.sin(t * 17 + seed) + 0.015 * Math.sin(t * 43 + seed * 2));
    pts.push([PAD + t * (W - 2 * PAD), yOf(Math.max(0, base + wiggle))]);
  }
  // Catmull-Rom → cubic Bézier, so the line reads as a measured signal, not a polyline
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return { d, end: pts[pts.length - 1] };
}

function Corner() {
  // collapse: two arrows meeting on the diagonal
  return (
    <svg className="reading__corner" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4v6h6M10 20v-6H4M14 10l6-6M10 14l-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Readings() {
  const j = readings.jeevi;
  const t = readings.tomatobot;
  const lines = j.curves.map((c, i) => ({ ...c, ...curve(c.final, c.rate, i * 1.7 + 0.4) }));
  const lead = lines[0];
  const [rough, obstacles] = lines.slice(1);
  const chartLabel = `Reward rising and levelling off during training: ${lines.map((l) => `${l.label.toLowerCase()} ${l.final}`).join(', ')}.`;

  // gauge: a half dial, 0 to 100%
  const g = 0.88;
  const ga = Math.PI * (1 - g);
  const gx = 60 + 50 * Math.cos(ga);
  const gy = 60 - 50 * Math.sin(ga);

  return (
    <div className="readings" data-readings>
      <article className="reading reading--dark intro-rise" aria-labelledby="r-jeevi" style={{ '--d': '0.55s' } as React.CSSProperties}>
        <div className="reading__head">
          <h2 id="r-jeevi" className="reading__label">{j.label}</h2>
          <span className="reading__status"><span className="led" aria-hidden="true" />{j.status}</span>
          <Corner />
        </div>
        <p className="reading__value">
          <span data-count={j.value} data-decimals="2">{j.value.toFixed(2)}</span>
          <span className="reading__unit">{j.unit}</span>
        </p>
        <p className="reading__note">
          <svg className="tri" viewBox="0 0 10 9" aria-hidden="true"><path d="M5 0l5 9H0z" /></svg>
          {j.note}
        </p>
        <figure className="chart">
          <svg viewBox={`0 -12 ${W} ${H + 24}`} role="img" aria-label={chartLabel}>
            {j.axis.map((v) => (
              <line key={v} className="chart__grid" x1="0" x2={W} y1={yOf(v)} y2={yOf(v)} />
            ))}
            <line className="chart__grid chart__grid--base" x1="0" x2={W} y1={H} y2={H} />
            {[obstacles, rough, lead].map((l) => (
              <path key={l.key} className={`chart__line chart__line--${l.key}`} d={l.d} pathLength={1} data-draw />
            ))}
            <line className="chart__drop" x1={lead.end[0]} x2={lead.end[0]} y1={lead.end[1]} y2={H} pathLength={1} data-drop />
            <circle className="chart__halo" cx={lead.end[0]} cy={lead.end[1]} r="11" data-ride />
            <circle className="chart__dot" cx={lead.end[0]} cy={lead.end[1]} r="4.5" data-ride />
            <path d={lead.d} fill="none" stroke="none" data-ride-path />
          </svg>
          <ul className="chart__axis" aria-hidden="true">
            {j.axis.map((v) => (
              <li key={v} style={{ top: `${((yOf(v) + 12) / (H + 24)) * 100}%` }}>{v}</li>
            ))}
          </ul>
        </figure>
        <dl className="reading__split">
          {[rough, obstacles].map((l) => (
            <div key={l.key}>
              <dt>{l.label}</dt>
              <dd>{l.final.toFixed(2)}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="reading reading--light intro-rise" aria-labelledby="r-tomatobot" style={{ '--d': '0.7s' } as React.CSSProperties}>
        <div className="reading__head">
          <h2 id="r-tomatobot" className="reading__label">{t.label}</h2>
        </div>
        <div className="reading__row">
          <p className="reading__value">
            <span data-count={t.value} data-decimals="0">{t.value}</span>
            <span className="reading__unit">{t.unit}</span>
          </p>
          <svg className="gauge" viewBox="0 0 120 66" aria-hidden="true">
            {Array.from({ length: 11 }, (_, i) => {
              const a = Math.PI * (1 - i / 10);
              return <line key={i} className="gauge__tick" x1={60 + 56 * Math.cos(a)} y1={60 - 56 * Math.sin(a)} x2={60 + 60 * Math.cos(a)} y2={60 - 60 * Math.sin(a)} />;
            })}
            <path className="gauge__track" d="M10 60 A50 50 0 0 1 110 60" pathLength={1} />
            <path className="gauge__value" d="M10 60 A50 50 0 0 1 110 60" pathLength={1} style={{ strokeDashoffset: 1 - g }} data-gauge={g} />
            <circle className="gauge__dot" cx={gx} cy={gy} r="3.6" data-gauge-dot />
          </svg>
        </div>
        <p className="reading__caption">{t.caption}</p>
        <p className="reading__tag">{t.tag}</p>
      </article>
    </div>
  );
}
