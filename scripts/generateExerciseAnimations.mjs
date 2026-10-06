// Generates looping, resolution-independent animated SVG demos for every exercise.
// Run: node scripts/generateExerciseAnimations.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'exercises');
mkdirSync(OUT, { recursive: true });

const L = { torso: 52, u: 28, f: 27, th: 36, sh: 36, neck: 8, head: 9 };
const ACCENT = '#34d399';
const NEUTRAL = '#a1a1aa';
const rad = (d) => (d * Math.PI) / 180;
const dir = (a) => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];

// Two-bone IK. bend=+1 / -1 selects which side the joint bulges to.
function ik(from, to, l1, l2, bend) {
    let dx = to[0] - from[0], dy = to[1] - from[1];
    let d = Math.hypot(dx, dy) || 0.001;
    const maxD = l1 + l2 - 0.01;
    if (d > maxD) { to = [from[0] + (dx / d) * maxD, from[1] + (dy / d) * maxD]; dx = to[0] - from[0]; dy = to[1] - from[1]; d = maxD; }
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const ux = dx / d, uy = dy / d;
    return { mid: [from[0] + ux * a - uy * h * bend, from[1] + uy * a + ux * h * bend], end: to };
}

function limb(root, spec, l1, l2, kind) {
    if (spec.a1 !== undefined) {
        const mid = add(root, dir(spec.a1), l1);
        return { mid, end: add(mid, dir(spec.a2), l2) };
    }
    if (spec.rel) return ik(root, [root[0] + spec.rel[0], root[1] + spec.rel[1]], l1, l2, spec.bend ?? (kind === 'leg' ? -1 : 1));
    return ik(root, spec.to, l1, l2, spec.bend ?? (kind === 'leg' ? -1 : 1));
}

function joints(p) {
    const hip = p.hip;
    let shoulder = add(hip, dir(p.t), L.torso);
    if (p.shrug) shoulder = [shoulder[0], shoulder[1] + p.shrug];
    const neck = add(shoulder, dir(p.t), L.neck);
    const head = add(neck, dir(p.t), L.head);
    const arm = limb(shoulder, p.arm, L.u, L.f, 'arm');
    const arm2 = p.arm2 ? limb(shoulder, p.arm2, L.u, L.f, 'arm') : null;
    const leg = limb(hip, p.leg, L.th, L.sh, 'leg');
    const leg2 = p.leg2 ? limb(hip, p.leg2, L.th, L.sh, 'leg') : null;
    const toe = p.toe || [leg.end[0] + 12, leg.end[1]];
    const toe2 = leg2 ? [leg2.end[0] + 12, leg2.end[1]] : null;
    return { hip, shoulder, neck, head, arm, arm2, leg, leg2, toe, toe2 };
}

const A = (arm, extra = {}) => ({ hip: [150, 100], t: 180, arm, leg: { to: [150, 172] }, ...extra });
const FK = (a1, a2) => ({ a1, a2 });
const REL = (dx, dy, bend) => ({ rel: [dx, dy], bend });

const BENCH_FLAT = [{ k: 'line', pts: [[56, 134], [200, 134]], w: 9 }];
const lyingBase = { hip: [84, 122], t: 90, leg: { to: [56, 172], bend: -1 } };
const lying = (arm) => ({ ...lyingBase, arm });

// muscle -> which parts glow
const GLOW = {
    Triceps: ['arm'], Biceps: ['arm'], Chest: ['torso', 'arm'], Legs: ['leg'], Back: ['torso', 'arm'],
    Shoulders: ['arm', 'torso'], Core: ['torso'], Forearms: ['arm'],
};

const DB = (r = 5) => ({ k: 'weight', at: 'hand', r });
const BB = (r = 8) => ({ k: 'weight', at: 'hand', r });

const EX = {
    ex_skullcrusher: { name: 'Skullcrushers', m: 'Triceps', eq: [...BENCH_FLAT, BB(7)], a: lying(FK(180, 180)), b: lying(FK(180, 100)) },
    ex_pushdown: { name: 'Cable Pushdowns', m: 'Triceps', eq: [{ k: 'cable', to: [182, 14] }], a: A(FK(0, 110), { t: 172 }), b: A(FK(0, 0), { t: 172 }) },
    ex_dips: {
        name: 'Dips', m: 'Triceps',
        eq: [{ k: 'line', pts: [[160, 118], [160, 176]], w: 4 }, { k: 'dot', at: [160, 118], r: 5 }],
        a: { hip: [151, 118], t: 178, arm: { to: [160, 118], bend: 1 }, leg: FK(10, -75) },
        b: { hip: [151, 138], t: 168, arm: { to: [160, 118], bend: 1 }, leg: FK(10, -75) },
    },
    ex_close_grip_bench: { name: 'Close-Grip Bench', m: 'Triceps', eq: [...BENCH_FLAT, BB(8)], a: lying(REL(0, -54, -1)), b: lying(REL(-12, -14, -1)) },
    ex_overhead_tri_ext: { name: 'Overhead Tricep Ext', m: 'Triceps', eq: [DB(6)], a: A(FK(178, 178)), b: A(FK(170, -20)) },
    ex_hammer: { name: 'Hammer Curls', m: 'Biceps', eq: [DB(5)], a: A(FK(0, 0)), b: A(FK(0, 150)) },
    ex_barbell_curl: { name: 'Barbell Curls', m: 'Biceps', eq: [BB(8)], a: A(FK(0, 0)), b: A(FK(0, 150)) },
    ex_incline_db_curl: {
        name: 'Incline DB Curl', m: 'Biceps',
        eq: [{ k: 'line', pts: [[140, 142], [92, 84]], w: 8 }, DB(5)],
        a: { hip: [130, 138], t: 222, arm: FK(2, 2), leg: FK(85, -5) },
        b: { hip: [130, 138], t: 222, arm: FK(2, 150), leg: FK(85, -5) },
    },
    ex_spider_curl: {
        name: 'Spider Curls', m: 'Biceps',
        eq: [{ k: 'line', pts: [[112, 130], [176, 96]], w: 8 }, DB(5)],
        a: { hip: [120, 118], t: 118, arm: FK(0, 0), leg: { to: [110, 172], bend: -1 } },
        b: { hip: [120, 118], t: 118, arm: FK(0, 165), leg: { to: [110, 172], bend: -1 } },
    },
    ex_incline_press: {
        name: 'Incline DB Press', m: 'Chest',
        eq: [{ k: 'line', pts: [[84, 140], [142, 84]], w: 8 }, DB(6)],
        a: { hip: [96, 130], t: 135, arm: REL(0, -54, -1), leg: { to: [62, 172], bend: -1 } },
        b: { hip: [96, 130], t: 135, arm: REL(-8, -20, -1), leg: { to: [62, 172], bend: -1 } },
    },
    ex_cable_fly_high: {
        name: 'High-to-Low Cable Fly', m: 'Chest', eq: [{ k: 'cable', to: [236, 12] }],
        a: A(FK(128, 138), { t: 174 }), b: A(FK(55, 65), { t: 168 }),
    },
    ex_incline_barbell_press: {
        name: 'Incline Barbell Press', m: 'Chest',
        eq: [{ k: 'line', pts: [[84, 140], [142, 84]], w: 8 }, BB(9)],
        a: { hip: [96, 130], t: 135, arm: REL(0, -54, -1), leg: { to: [62, 172], bend: -1 } },
        b: { hip: [96, 130], t: 135, arm: REL(-8, -18, -1), leg: { to: [62, 172], bend: -1 } },
    },
    ex_flat_db_press: { name: 'Flat Dumbbell Press', m: 'Chest', eq: [...BENCH_FLAT, DB(6)], a: lying(REL(0, -54, -1)), b: lying(REL(-4, -20, -1)) },
    ex_pec_deck: {
        name: 'Pec Deck Fly', m: 'Chest',
        eq: [{ k: 'line', pts: [[116, 66], [116, 132]], w: 8 }],
        a: { hip: [130, 132], t: 180, arm: FK(-45, 35), leg: FK(90, 0) },
        b: { hip: [130, 132], t: 180, arm: FK(80, 85), leg: FK(90, 0) },
    },
    ex_squat: {
        name: 'Barbell Squat', m: 'Legs', eq: [{ k: 'weight', at: 'shoulder', r: 9 }],
        a: A(REL(8, -6, 1)), b: { hip: [118, 130], t: 140, arm: REL(8, -6, 1), leg: { to: [150, 172], bend: -1 } },
    },
    ex_lunge: {
        name: 'Walking Lunges', m: 'Legs', eq: [DB(5)],
        a: A(FK(0, 0), { leg: { to: [168, 172], bend: -1 }, leg2: { to: [132, 172], bend: -1 } }),
        b: A(FK(0, 0), { hip: [150, 132], leg: { to: [190, 172], bend: -1 }, leg2: { to: [108, 172], bend: -1 } }),
    },
    ex_rdl: {
        name: 'Romanian Deadlift', m: 'Legs', eq: [BB(8)],
        a: A(REL(0, 50)), b: { hip: [125, 106], t: 100, arm: REL(0, 50), leg: { to: [150, 172], bend: -1 } },
    },
    ex_bulgarian_split_squat: {
        name: 'Bulgarian Split Squat', m: 'Legs',
        eq: [{ k: 'line', pts: [[84, 154], [114, 154]], w: 8 }, { k: 'line', pts: [[92, 154], [92, 176]], w: 4 }, DB(5)],
        a: A(FK(0, 0), { hip: [146, 106], leg: { to: [184, 172], bend: -1 }, leg2: { to: [104, 148], bend: -1 } }),
        b: A(FK(0, 0), { hip: [146, 136], leg: { to: [184, 172], bend: -1 }, leg2: { to: [104, 148], bend: -1 } }),
    },
    ex_leg_press: {
        name: 'Leg Press', m: 'Legs', eq: [{ k: 'line', pts: [[96, 156], [196, 82]], w: 5 }],
        a: { hip: [110, 138], t: 225, arm: FK(10, 10), leg: { to: [132, 112], bend: -1 } },
        b: { hip: [110, 138], t: 225, arm: FK(10, 10), leg: { to: [162, 92], bend: -1 } },
    },
    ex_leg_curl: {
        name: 'Leg Curl', m: 'Legs', eq: [{ k: 'line', pts: [[84, 140], [250, 140]], w: 8 }],
        a: { hip: [170, 128], t: 90, arm: FK(80, 80), leg: FK(-90, -90) },
        b: { hip: [170, 128], t: 90, arm: FK(80, 80), leg: FK(-90, -165) },
    },
    ex_calf_raise: {
        name: 'Calf Raise', m: 'Legs', eq: [DB(5)],
        a: A(FK(0, 0), { leg: { to: [150, 172], bend: -1 } }),
        b: A(FK(0, 0), { hip: [150, 90], leg: { to: [152, 162], bend: -1 }, toe: [162, 172] }),
    },
    ex_deadlift: {
        name: 'Deadlift', m: 'Back', eq: [BB(10)],
        a: { hip: [108, 116], t: 105, arm: { to: [152, 160], bend: 1 }, leg: { to: [150, 172], bend: -1 } },
        b: A(REL(0, 52)),
    },
    ex_row: {
        name: 'Bent Over Row', m: 'Back', eq: [BB(8)],
        a: { hip: [125, 106], t: 100, arm: REL(0, 52), leg: { to: [150, 172], bend: -1 } },
        b: { hip: [125, 106], t: 100, arm: { to: [152, 114], bend: 1 }, leg: { to: [150, 172], bend: -1 } },
    },
    ex_lat_pulldown: {
        name: 'Lat Pulldown', m: 'Back', eq: [{ k: 'cable', to: [190, 8] }],
        a: { hip: [130, 140], t: 190, arm: FK(172, 176), leg: FK(90, 0) },
        b: { hip: [130, 140], t: 190, arm: FK(-15, 165), leg: FK(90, 0) },
    },
    ex_pull_up: {
        name: 'Weighted Pull-Ups', m: 'Back',
        eq: [{ k: 'line', pts: [[116, 28], [184, 28]], w: 5 }],
        a: { hip: [150, 135], t: 180, arm: { to: [150, 28], bend: -1 }, leg: FK(5, -70) },
        b: { hip: [150, 92], t: 180, arm: { to: [150, 28], bend: -1 }, leg: FK(5, -70) },
    },
    ex_single_arm_row: {
        name: 'Single-Arm DB Row', m: 'Back',
        eq: [{ k: 'line', pts: [[150, 130], [212, 130]], w: 8 }, DB(6)],
        a: { hip: [125, 106], t: 100, arm: REL(0, 50), arm2: { to: [182, 128], bend: 1 }, leg: { to: [150, 172], bend: -1 } },
        b: { hip: [125, 106], t: 100, arm: { to: [152, 112], bend: 1 }, arm2: { to: [182, 128], bend: 1 }, leg: { to: [150, 172], bend: -1 } },
    },
    ex_ohp: { name: 'Overhead Press', m: 'Shoulders', eq: [BB(9)], a: A(REL(8, -4, 1)), b: A(REL(2, -54, 1)) },
    ex_lateral_raise: { name: 'Lateral Raise', m: 'Shoulders', eq: [DB(5)], a: A(FK(0, 0)), b: A(FK(92, 92)) },
    ex_face_pull: {
        name: 'Face Pull', m: 'Shoulders', eq: [{ k: 'cable', to: [262, 52] }],
        a: A(FK(90, 90), { t: 184 }), b: A(REL(14, -18, -1), { t: 184 }),
    },
    ex_db_shrug: { name: 'DB Shrugs', m: 'Shoulders', eq: [DB(6)], a: A(FK(0, 0)), b: A(FK(0, 0), { shrug: -8 }) },
    ex_plank: {
        name: 'Plank Hold', m: 'Core', eq: [],
        a: { hip: [150, 146], t: 90, arm: FK(0, 90), leg: { to: [80, 172], bend: -1 } },
        b: { hip: [150, 149], t: 90, arm: FK(0, 90), leg: { to: [80, 172], bend: -1 } },
    },
    ex_woodchop: {
        name: 'Cable Woodchop', m: 'Core', eq: [{ k: 'cable', to: [90, 10] }],
        a: A(FK(-150, -150), { hip: [150, 106], t: 200, leg: { to: [136, 172], bend: -1 }, leg2: { to: [170, 172], bend: -1 } }),
        b: A(FK(55, 62), { hip: [150, 106], t: 160, leg: { to: [136, 172], bend: -1 }, leg2: { to: [170, 172], bend: -1 } }),
    },
    ex_forearm_roller: {
        name: 'Forearm Rollers', m: 'Forearms', eq: [],
        a: { ...A(FK(90, 90), { t: 180 }), rope: 14 }, b: { ...A(FK(90, 90), { t: 180 }), rope: 54 },
    },
};

const f1 = (n) => Math.round(n * 10) / 10;
const KT = '0;0.12;0.5;0.62;1';
const KS = '0 0 1 1;0.4 0 0.6 1;0 0 1 1;0.4 0 0.6 1';
const anim = (attr, v1, v2) =>
    `<animate attributeName="${attr}" dur="4s" repeatCount="indefinite" calcMode="spline" keyTimes="${KT}" keySplines="${KS}" values="${f1(v1)};${f1(v1)};${f1(v2)};${f1(v2)};${f1(v1)}"/>`;

function seg(p, q, cls, width, color, opacity = 1) {
    return `<line x1="${f1(p[0][0])}" y1="${f1(p[0][1])}" x2="${f1(p[1][0])}" y2="${f1(p[1][1])}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}">`
        + anim('x1', p[0][0], q[0][0]) + anim('y1', p[0][1], q[0][1]) + anim('x2', p[1][0], q[1][0]) + anim('y2', p[1][1], q[1][1]) + '</line>';
}

function render(id, ex) {
    const ja = joints(ex.a), jb = joints(ex.b);
    const glow = GLOW[ex.m] || [];
    const col = (part) => (glow.includes(part) ? ACCENT : NEUTRAL);
    const S = (get, part, w = 6, op = 1) => seg([get(ja)[0], get(ja)[1]], [get(jb)[0], get(jb)[1]], part, w, col(part), op);
    const parts = [];
    // equipment (static)
    for (const e of ex.eq) {
        if (e.k === 'line') parts.push(`<polyline points="${e.pts.map((q) => q.join(',')).join(' ')}" stroke="#3f3f46" stroke-width="${e.w}" stroke-linecap="round" fill="none"/>`);
        if (e.k === 'dot') parts.push(`<circle cx="${e.at[0]}" cy="${e.at[1]}" r="${e.r}" fill="#52525b"/>`);
    }
    // body (back limbs first)
    if (ja.leg2) parts.push(S((j) => [j.hip, j.leg2.mid], 'leg', 6, 0.55), S((j) => [j.leg2.mid, j.leg2.end], 'leg', 6, 0.55));
    parts.push(S((j) => [j.hip, j.leg.mid], 'leg'), S((j) => [j.leg.mid, j.leg.end], 'leg'), S((j) => [j.leg.end, j.toe], 'foot', 5));
    parts.push(S((j) => [j.hip, j.shoulder], 'torso', 9));
    if (ja.arm2) parts.push(S((j) => [j.shoulder, j.arm2.mid], 'arm', 5, 0.55), S((j) => [j.arm2.mid, j.arm2.end], 'arm', 5, 0.55));
    parts.push(S((j) => [j.shoulder, j.arm.mid], 'arm', 5), S((j) => [j.arm.mid, j.arm.end], 'arm', 5));
    const ca = (get) => `<circle r="${L.head}" fill="none" stroke="#e4e4e7" stroke-width="3" cx="${f1(get(ja)[0])}" cy="${f1(get(ja)[1])}">${anim('cx', get(ja)[0], get(jb)[0])}${anim('cy', get(ja)[1], get(jb)[1])}</circle>`;
    parts.push(ca((j) => j.head));
    // moving equipment
    for (const e of ex.eq) {
        const pos = (j) => (e.at === 'shoulder' ? [j.shoulder[0] + 6, j.shoulder[1] - 4] : j.arm.end);
        if (e.k === 'weight') {
            const pa = pos(ja), pb = pos(jb);
            parts.push(`<circle r="${e.r}" fill="#f4f4f5" stroke="#18181b" stroke-width="2" cx="${f1(pa[0])}" cy="${f1(pa[1])}">${anim('cx', pa[0], pb[0])}${anim('cy', pa[1], pb[1])}</circle>`);
        }
        if (e.k === 'cable') {
            const pa = ja.arm.end, pb = jb.arm.end;
            parts.push(`<circle cx="${e.to[0]}" cy="${e.to[1]}" r="4" fill="#52525b"/>`,
                `<line x1="${e.to[0]}" y1="${e.to[1]}" x2="${f1(pa[0])}" y2="${f1(pa[1])}" stroke="#d4d4d8" stroke-width="1.5">${anim('x2', pa[0], pb[0])}${anim('y2', pa[1], pb[1])}</line>`);
        }
    }
    if (ex.a.rope !== undefined) {
        const pa = ja.arm.end, pb = jb.arm.end;
        parts.push(`<line stroke="#d4d4d8" stroke-width="1.5" x1="${f1(pa[0])}" y1="${f1(pa[1])}" x2="${f1(pa[0])}" y2="${f1(pa[1] + ex.a.rope)}">${anim('x1', pa[0], pb[0])}${anim('y1', pa[1], pb[1])}${anim('x2', pa[0], pb[0])}${anim('y2', pa[1] + ex.a.rope, pb[1] + ex.b.rope)}</line>`,
            `<circle r="7" fill="#f4f4f5" stroke="#18181b" stroke-width="2" cx="${f1(pa[0])}" cy="${f1(pa[1] + ex.a.rope)}">${anim('cx', pa[0], pb[0])}${anim('cy', pa[1] + ex.a.rope, pb[1] + ex.b.rope)}</circle>`);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 380 214" width="760" height="428" role="img" aria-label="${ex.name} demonstration">
<rect x="-30" y="-30" width="380" height="214" fill="#09090b"/>
<line x1="-10" y1="177" x2="330" y2="177" stroke="#27272a" stroke-width="3" stroke-linecap="round"/>
<text x="-20" y="-10" fill="#fafafa" font-family="system-ui,sans-serif" font-size="13" font-weight="700">${ex.name}</text>
<text x="-20" y="4" fill="${ACCENT}" font-family="system-ui,sans-serif" font-size="10" font-weight="600">TARGET: ${ex.m.toUpperCase()}</text>
${parts.join('\n')}
</svg>
`;
}

let n = 0;
for (const [id, ex] of Object.entries(EX)) {
    writeFileSync(join(OUT, `${id}.svg`), render(id, ex));
    n++;
}
console.log(`Generated ${n} animated exercise SVGs in ${OUT}`);
