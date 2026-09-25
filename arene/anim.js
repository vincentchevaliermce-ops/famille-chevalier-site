// =====================================================================
//  ANIMATIONS — poses des deux combattants (repère image, face à droite)
//  r > 0 : rotation horaire à l'écran. Les pieds restent au sol par IK.
// =====================================================================
const TAU = Math.PI * 2;
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const eo = x => 1 - Math.pow(1 - x, 3), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2) };
const P = (t, a, b) => cl((t - a) / (b - a));

// pose dessinée entière (sprite) : légère vie (respiration, écrasement) autour des pieds
function SP(n, o = {}, roar = false) { return { pose: { spr: Object.assign({ x: 0, y: 0, r: 0, sx: 1, sy: 1 }, o) }, roar, spr: n }; }

// ---------- TIGRE ----------
const TIG = {
  ends: { hN: [385, 882], hF: [650, 864], fN: [1030, 882], fF: [1212, 872] },
  legs: { hN: ['hN1', 'hN2'], hF: ['hF1', 'hF2'], fN: ['fN1', 'fN2'], fF: ['fF1', 'fF2'] },
};
function tigerPlant(R, pose, off = {}) {
  // off[leg] = [dx, dy] décalage de la patte par rapport au repos (image px)
  for (const k of ['hF', 'fF', 'hN', 'fN']) {
    const e = TIG.ends[k], o = off[k] || [0, 0];
    Skin.ik(R, pose, TIG.legs[k][0], TIG.legs[k][1], e, [e[0] + o[0], e[1] + o[1]]);
  }
  return pose;
}
function tail(pose, t, amp = 1, lift = 0) {
  pose.tail1 = { r: lift * -.5 + .12 * amp * Math.sin(t * 2.4) };
  pose.tail2 = { r: lift * -.3 + .22 * amp * Math.sin(t * 2.4 - .9) };
  pose.tail3 = { r: lift * -.2 + .3 * amp * Math.sin(t * 2.4 - 1.8) };
}
function tigerPose(R, f, T) {
  const t = T, st = f.state, u = f.u || 0, ph = f.ph;
  let pose = {}, roar = false, off = {};
  const breathe = Math.sin(t * 3.2);
  const stance = () => { pose.root = { y: 26 + breathe * 4, r: .02 }; pose.chest = { r: .04 + breathe * .01 }; pose.neck = { r: .05 }; pose.head = { r: .06 + breathe * .02 }; tail(pose, t, 1, .2); };
  const air = (tuck = 1) => {
    pose.root = { r: cl(f.vy * .012, -.3, .3) };
    pose.hN1 = { r: -.55 * tuck }; pose.hN2 = { r: .9 * tuck }; pose.hF1 = { r: -.45 * tuck }; pose.hF2 = { r: .8 * tuck };
    pose.fN1 = { r: -.7 * tuck }; pose.fN2 = { r: -.9 * tuck }; pose.fF1 = { r: -.6 * tuck }; pose.fF2 = { r: -.8 * tuck };
    pose.head = { r: -.05 }; tail(pose, t, .4, .8);
  };
  switch (st) {
    case 'walk': case 'walkB': case 'dash': {
      stance();
      const p = f.dist * .018 * (st === 'dash' ? .6 : 1), A = st === 'dash' ? 110 : 70, B = 44;
      const g = (phs) => [A * Math.cos(p + phs), -B * Math.max(0, Math.sin(p + phs))];
      off = { hN: g(0), fF: g(0), hF: g(Math.PI), fN: g(Math.PI) };
      pose.root.y = 26 + 7 * Math.abs(Math.sin(p)); pose.head.r = .04 + .03 * Math.sin(p * 2);
      if (st === 'dash') { pose.root.r = -.06; pose.root.y = 50; tail(pose, t, .3, .9); }
      break;
    }
    case 'crouch': return SP('accroupi', { sy: 1 + .012 * breathe });
    case 'cblock': return SP('garde', { x: -15, sy: .96 });
    case 'block': return SP('garde', { x: -10, sy: 1 + .01 * breathe });
    case 'prejump': stance(); pose.root.y = 90; break;
    case 'land': stance(); pose.root.y = 70 - 40 * u; break;
    case 'air': air(); return { pose, roar };
    case 'hurt':
      if (f.roule) { const r = f.roule, hc = 260; return SP('ko', { r, x: -hc * Math.sin(r), y: -hc * (1 - Math.cos(r)) }) }
      stance(); pose.root.r = .16 * f.hurtK; pose.root.x = -30 * f.hurtK; pose.chest = { r: .12 }; pose.head = { r: -.35 * f.hurtK }; pose.neck = { r: -.1 };
      if (f.h > 0) { air(.4); pose.root.r = .35; return { pose, roar }; }
      break;
    case 'down': case 'ko':
      if (f.h > 0) { air(.3); pose.root.r = .5; return { pose, roar: false }; }
      return SP('ko', { sy: 1 + .01 * Math.sin(t * 3) });
      pose.root = { y: 230, r: .05 }; pose.chest = { r: .06 }; pose.head = { r: .45 }; pose.neck = { r: .2 }; tail(pose, t, .15, -.3);
      pose.fN1 = { r: -1.25 }; pose.fN2 = { r: -.1 }; pose.fF1 = { r: -1.1 }; pose.fF2 = { r: -.1 };
      pose.hN1 = { r: 1.2 }; pose.hN2 = { r: .1 }; pose.hF1 = { r: 1.1 }; pose.hF2 = { r: .1 };
      return { pose, roar: false };
    case 'getup': {
      const k = 1 - eo(u); stance(); pose.root.y = lerp(26, 230, k); pose.head.r = lerp(.06, .45, k);
      off = { fN: [140 * k, 0], fF: [140 * k, 0], hN: [-140 * k, 0], hF: [-140 * k, 0] }; break;
    }
    case 'win': return SP('rugit', { sy: 1 + .015 * Math.sin(t * 5), r: -.01 * Math.sin(t * 5) });
    case 'lance': return f.t < (f.prise && f.prise.prise.t || 20) - 5 ? SP('debout', { x: -10, sy: 1 + .02 * Math.sin(t * 20) }, true) : SP('coup', { x: 60, r: .16, sx: 1.05 }, true);
    case 'tenu': return SP('ko', { r: -.3 + .06 * Math.sin(t * 25), y: -60 });
    case 'fuite': { stance(); const p = f.t * .35; off = { hN: [110 * Math.cos(p), -44 * Math.max(0, Math.sin(p))], fF: [110 * Math.cos(p), -44 * Math.max(0, Math.sin(p))], hF: [110 * Math.cos(p + Math.PI), -44 * Math.max(0, Math.sin(p + Math.PI))], fN: [110 * Math.cos(p + Math.PI), -44 * Math.max(0, Math.sin(p + Math.PI))] }; tigerPlant(R, pose, off); return { pose, roar: false, flip: true } }
    case 'dizzy': stance(); pose.root.r = .08 * Math.sin(t * 6); pose.root.x = 12 * Math.sin(t * 6); pose.head = { r: .25 + .15 * Math.sin(t * 7) }; tail(pose, t, .3, -.3); break;
    case 'lose': stance(); pose.head.r = .45; pose.neck = { r: .25 }; pose.root.y = 60; tail(pose, t, .2, -.4); break;
    case 'intro':
      if (f.t > 20 && f.t < 80) return SP('rugit', { sy: 1 + .02 * Math.sin(t * 7) });
      stance(); break;
    case 'atk': {
      const k = f.mk;
      if (f.kind === 'gorille') return gorilleSpr(f, t, u, ph, k, repos);
      if (k === 'L') {
        stance();
        if (ph === 'st') { pose.chest.r = .1; off = { fN: [-30, -40] }; pose.head.r = .12; pose.root.x = -10; }
        else if (ph === 'act') return SP('coup', { x: 30, sx: 1.03 });
        else if (u < .55) return SP('coup', { x: 30 * (1 - u), sx: 1 + .03 * (1 - u) });
        else { const e = eo(P(u, .55, 1)); pose.root.x = 20 * (1 - e); }
      } else if (k === 'cL') {
        if (ph === 'act' || (ph === 'rec' && u < .5)) return SP('balayage', { x: ph === 'act' ? 30 : 30 * (1 - u) }, true);
        return SP('accroupi', { x: ph === 'st' ? -10 : 0 });
      } else if (k === 'H') {
        if (ph === 'st') { const e = eo(u); return SP('debout', { x: -20 * e, sy: .9 + .1 * e, sx: 1.05 - .05 * e }, true); }
        else if (ph === 'act') return SP('coup', { x: 70, r: .14, sx: 1.06 }, true);
        else { const e = 1 - eo(u); pose.root = { r: .12 * e, x: 90 * e, y: 20 * e + 20 }; pose.head = { r: .06 }; tail(pose, t, .6, .4); off = { fN: [260 * e, 0], fF: [240 * e, 0] }; }
      } else if (k === 'S') {
        if (ph === 'st') return SP('accroupi', { x: 3 * Math.sin(t * 60), sy: .97 + .02 * Math.sin(t * 40) });
        else if (f.h > 0) return f.vy < 2 ? SP('bond', { r: cl(-.1 + f.vy * .01, -.3, .25), y: 120, sx: 1.04 }, true) : SP('morsure', { r: .15, y: 80 }, true); else { stance(); pose.root.y = 90 * (1 - u); }
      } else if (k === 'cH') { // balayette
        if (ph === 'st') return SP('accroupi', { x: -12 });
        if (ph === 'act' || (ph === 'rec' && u < .45)) return SP('balayage', { x: ph === 'act' ? 40 : 40 * (1 - u), y: 6 }, true);
        return SP('accroupi', { sy: .97 });
      } else if (k === 'T') { // projection : il attrape
        if (ph === 'st') return SP('coup', { x: -10, sx: .98 }); return SP('coup', { x: 30, sx: 1.03 });
      } else if (k === 'SF') { // la ruée du chasseur : très bas, très vite
        if (ph === 'st') return SP('accroupi', { x: -25 * u + 3 * Math.sin(t * 70), sy: .95 });
        if (ph === 'act') return SP('bond', { y: 70, r: .06, sx: 1.06 }, true);
        return u < .5 ? SP('coup', { x: 30 * (1 - u) }) : SP('accroupi', { sy: .97 });
      } else if (k === 'SD') { // griffes vers le ciel
        if (ph === 'st') return SP('accroupi', { sy: .9 });
        if (f.h > 0) return SP('debout', { r: -.16, y: 20 }, true);
        return SP('accroupi', { sy: .94 + .06 * u });
      } else if (k === 'A') {
        return SP('morsure', { r: .12, y: 60 }, true);
      } else if (k === 'SUPER') {
        if (ph === 'st') return SP('debout', { x: -20, sy: 1 + .02 * Math.sin(t * 30) }, true);
        else if (ph === 'act') { const k2 = Math.floor(f.t / 5) % 2; return k2 ? SP('coup', { x: 60, sx: 1.04 }) : SP('debout', { x: 10, r: .06 }, true); } else { stance(); pose.root.y = 50 * (1 - u); }
      }
      break;
    }
    default: stance();
  }
  tigerPlant(R, pose, off);
  return { pose, roar };
}

// ---------- GORILLE ----------
const GOR = {
  ends: { aN: [990, 882], aF: [1220, 882], lN: [262, 925], lF: [600, 910] },
  legs: { aN: ['aN1', 'aN2', 'aN3'], aF: ['aF1', 'aF2', 'aF3'], lN: ['lN1', 'lN2', 'lN3'], lF: ['lF1', 'lF2', 'lF3'] },
};
function gorPlant(R, pose, off = {}, skip = {}) {
  for (const k of ['lF', 'lN', 'aF', 'aN']) {
    if (skip[k]) continue;
    const e = GOR.ends[k], o = off[k] || [0, 0], L = GOR.legs[k];
    Skin.ik(R, pose, L[0], L[1], e, [e[0] + o[0], e[1] + o[1]], 0, L[2]);
  }
  return pose;
}
function upright(pose, k = 1) { // se redresse sur ses pattes arrière
  pose.root = Object.assign(pose.root || {}, { r: -.55 * k, y: (pose.root && pose.root.y || 0) - 30 * k });
  pose.torso = { r: -.18 * k }; pose.chest = { r: .06 * k }; pose.head = { r: .58 * k };
}
function chestBeat(pose, t, t0 = 0) {
  const ph = (t - t0) * 9, a = Math.max(0, Math.sin(ph)), b = Math.max(0, Math.sin(ph + Math.PI));
  pose.aN1 = { r: .45 - .25 * a }; pose.aN2 = { r: -2.05 + .35 * a }; pose.aN3 = { r: -.4 };
  pose.aF1 = { r: .35 - .25 * b }; pose.aF2 = { r: -1.95 + .35 * b }; pose.aF3 = { r: -.4 };
  return a > .9 || b > .9;
}
// frappe de poitrine : une seule illustration, rythmée par un léger rebond
function beat(t) { const a = Math.abs(Math.sin(t * 9)); return SP('poitrine', { sy: 1 - .025 * a, sx: 1 + .02 * a, r: .015 * Math.sin(t * 9) }, true); }
function gorillaPose(R, f, T) {
  const t = T, st = f.state, u = f.u || 0, ph = f.ph;
  let pose = {}, roar = false, off = {}, skip = {};
  const breathe = Math.sin(t * 2.6);
  const stance = () => { pose.root = { y: 18 + breathe * 5, r: 0 }; pose.torso = { r: breathe * .012 }; pose.chest = { r: 0 }; pose.head = { r: .02 * Math.sin(t * 1.3) }; };
  const air = () => { upright(pose, .5); pose.lN1 = { r: -.5 }; pose.lN2 = { r: .9 }; pose.lF1 = { r: -.4 }; pose.lF2 = { r: .8 };
    pose.aN1 = { r: -.6 }; pose.aN2 = { r: -.5 }; pose.aF1 = { r: -.5 }; pose.aF2 = { r: -.4 }; skip = { lN: 1, lF: 1, aN: 1, aF: 1 }; };
  switch (st) {
    case 'walk': case 'walkB': case 'dash': {
      stance();
      const p = f.dist * .014 * (st === 'dash' ? .7 : 1), A = st === 'dash' ? 120 : 75, B = 50;
      const g = (phs) => [A * Math.cos(p + phs), -B * Math.max(0, Math.sin(p + phs))];
      off = { aN: g(0), lF: g(.5), aF: g(Math.PI), lN: g(Math.PI + .5) };
      pose.root.y = 18 + 8 * Math.abs(Math.sin(p)); pose.torso.r = .03 * Math.sin(p);
      break;
    }
    case 'crouch': case 'cblock':
      pose.root = { y: 110, r: .06 }; pose.torso = { r: .08 }; pose.chest = { r: .05 }; pose.head = { r: .08 };
      off = { aN: [40, 0], aF: [30, 0] };
      if (st === 'cblock') { pose.root.x = -20; pose.root.y = 125; pose.head.r = .32; pose.chest.r = .1; off = { aN: [10, 0], aF: [5, 0] }; }
      break;
    case 'block': return SP('garde', { x: -10, sy: 1 + .008 * breathe });
    case 'prejump': stance(); pose.root.y = 80; break;
    case 'land': stance(); pose.root.y = 60 - 40 * u; break;
    case 'air': air(); break;
    case 'hurt':
      stance(); upright(pose, .25 * f.hurtK); pose.root.x = -30 * f.hurtK; pose.head.r = -.35 * f.hurtK; roar = true;
      if (f.h > 0) { air(); pose.root.r = .2; }
      break;
    case 'down': case 'ko':
      if (f.h > 0) { air(); pose.root.r = .3; break; }
      return SP('ko', { sy: 1 + .01 * Math.sin(t * 3) });
      pose.root = { y: 330, r: .18 }; pose.torso = { r: .05 }; pose.head = { r: .3 };
      pose.aN1 = { r: -1.35 }; pose.aN2 = { r: .2 }; pose.aF1 = { r: -1.25 }; pose.aF2 = { r: .2 };
      pose.lN1 = { r: .9 }; pose.lN2 = { r: .4 }; pose.lF1 = { r: .8 }; pose.lF2 = { r: .4 };
      return { pose, roar: false };
    case 'getup': {
      const k = 1 - eo(u); stance(); pose.root.y = lerp(18, 330, k); pose.head.r = .3 * k;
      off = { aN: [220 * k, 0], aF: [220 * k, 0], lN: [-150 * k, 0], lF: [-150 * k, 0] }; break;
    }
    case 'win': return beat(t);
    case 'lose': stance(); pose.head.r = .4; pose.root.y = 50; break;
    case 'intro': if (f.t > 15 && f.t < 80) return beat(t); stance(); break;
    case 'atk': {
      const k = f.mk;
      if (f.kind === 'gorille') return gorilleSpr(f, t, u, ph, k, repos);
      if (k === 'L') {
        stance(); pose.torso.r = -.04;
        if (ph === 'st') { off = { aN: [-60, -40] }; pose.root.x = -10; }
        else if (ph === 'act') return SP('poing', { x: 20, sx: 1.03 });
        else if (u < .55) return SP('poing', { x: 20 * (1 - u) });
        else { pose.root.x = 10 * (1 - eo(P(u, .55, 1))); }
      } else if (k === 'cL') {
        pose.root = { y: 110, r: .06 }; pose.torso = { r: .08 }; pose.head = { r: .08 };
        const e = ph === 'st' ? -.2 : ph === 'act' ? 1 : 1 - eo(u);
        off = { aN: [320 * Math.max(0, e), 0], aF: [30, 0] }; roar = ph === 'act';
      } else if (k === 'H') {
        if (ph === 'st') { const e = eo(u); return SP('smash', { x: -30 * e, sy: .88 + .12 * e, sx: 1.06 - .06 * e }, true); }
        else { const e = ph === 'act' ? 1 : 1 - eo(u); stance(); pose.root.x = 40 * e; pose.torso.r = .12 * e; pose.head.r = -.1 * e;
          off = { aN: [230 * e, 0], aF: [200 * e, 0] }; roar = ph === 'act'; }
      } else if (k === 'S') {
        if (ph === 'st') return beat(t);
        else if (ph === 'act') { stance(); const p = f.dist * .014 * .7, A = 130, B = 55, g = (s) => [A * Math.cos(p + s), -B * Math.max(0, Math.sin(p + s))];
          off = { aN: g(0), lF: g(.5), aF: g(Math.PI), lN: g(Math.PI + .5) }; pose.torso.r = .08; pose.head.r = .1; roar = true; }
        else { stance(); }
      } else if (k === 'A') { if (ph === 'st') return SP('smash', { y: 30, sy: .96 }, true); if (!f.landed) return SP('ecrase', { y: 20, r: .06 }, true); return SP('ecrase', { y: -40, sy: .9, r: .1 }, true); }
      else if (k === 'SUPER') {
        if (ph === 'st') return beat(t);
        else if (ph === 'act') { const e = f.t % 12 < 6 ? 1 : 0; if (e) return SP('smash', { x: -20, sy: 1.02 }, true);
          stance(); pose.torso.r = .12; pose.head.r = -.1; off = { aN: [220, 0], aF: [200, 0] }; roar = true; }
        else stance();
      }
      break;
    }
    default: stance();
  }
  gorPlant(R, pose, off, skip);
  return { pose, roar };
}

// ---------- ANIMAUX « 100 % ILLUSTRATIONS » (lion, ours polaire…) ----------
// Chaque pose est une illustration entière ; le mouvement vient de petits
// écrasements / étirements, de l'alternance de deux images pour la marche et d'un fondu-traînée.
function spritePose(R, f, T) {
  const t = T, st = f.state, u = f.u || 0, ph = f.ph, br = Math.sin(t * 3);
  const repos = () => SP('base', { sy: 1 + .012 * br, sx: 1 - .006 * br });
  switch (st) {
    case 'walk': case 'walkB': case 'dash': {
      const p = Math.abs(f.dist) * (st === 'dash' ? .012 : .02), k = Math.floor(p) % 2;
      if (f.d.serpent && st !== 'dash') return SP('base', { x: 10 * Math.sin(p * Math.PI * 2), sx: 1 + .035 * Math.sin(p * Math.PI * 2), sy: 1 - .02 * Math.sin(p * Math.PI * 2) }); // serpent : il ondule sur place (pas de pattes !)
      return SP(k ? 'marche' : 'base', { y: -10 * Math.abs(Math.sin(p * Math.PI)), r: st === 'dash' ? .05 : .015 * Math.sin(p * Math.PI) });
    }
    case 'crouch': return SP('accroupi', { sy: 1 + .012 * br });
    case 'block': return SP('garde', { x: -10, sy: 1 + .006 * br });
    case 'cblock': return f.d.gardeBas ? SP(f.d.gardeBas, { sy: 1 + .006 * br }) : SP('garde', { x: -15, sy: .9 });
    case 'prejump': return SP('accroupi', { sy: .94 });
    case 'land': return SP('accroupi', { sy: .94 + .06 * u });
    case 'air': return SP('saut', { r: cl(f.vy * .01, -.25, .25), y: 70 });
    case 'hurt':
      if (f.roule) { const r = f.roule, hc = 300; return SP('touche', { r, x: -hc * Math.sin(r), y: -hc * (1 - Math.cos(r)) }) } // roulade de la mort : il tourne sur lui-même
      if (f.h > 0) return SP('touche', { r: -.25, y: 40 }); return SP('touche', { x: -20 * f.hurtK, r: -.05 * f.hurtK });
    case 'down': case 'ko': if (f.h > 0) return SP('touche', { r: -.45, y: 40 }); return SP('ko', { sy: 1 + .01 * Math.sin(t * 3) });
    case 'getup': return SP('accroupi', { sy: .85 + .15 * u });
    case 'win': if (f.kind === 'grizzly' && f.t > 100) return SP('saumon', { sy: 1 + .012 * Math.sin(t * 4) }); if (f.kind === 'hyene' && f.t > 100) return SP('os', { sy: 1 + .012 * Math.sin(t * 9), x: 3 * Math.sin(t * 18) }); if (f.kind === 'morse' && f.t > 110) return SP('bouee', { sy: 1 + .02 * Math.sin(t * 2.2) }); if (f.kind === 'trex' && f.t > 90 && f.t % 180 < 70) return SP('rugit', { sy: 1 + .02 * Math.sin(t * 20) }, true); if (f.kind === 'porcepic' && f.t > 90 && f.t % 150 < 60) return SP('hochet', { x: 4 * Math.sin(t * 70) }, true); if (f.kind === 'leopard' && f.t > 110 && f.t % 200 < 80) return SP('grimpe', { sy: 1 + .01 * Math.sin(t * 6) }, true); if (f.kind === 'loup' && f.t > 90 && f.t % 180 < 70) return SP('hurle', { sy: 1 + .02 * Math.sin(t * 8) }, true); if (f.kind === 'oursnoir' && f.t > 110 && f.t % 200 < 90) return SP('mange', { sy: 1 + .015 * Math.sin(t * 9) }, true); if (f.kind === 'caiman' && f.t > 110 && f.t % 220 < 100) return SP('sieste', { sy: 1 + .015 * Math.sin(t * 2.5) }, true); return SP('victoire', { sy: 1 + .015 * Math.sin(t * 5) }, true);
    case 'lance': { // il tient l'adversaire puis le lance
      const fin = f.t >= (f.prise && f.prise.prise.t || 20) - 6, n = f.mkPrise === 'T' ? 'fort' : (f.d.poseLance || 'fort');
      if (f.kind === 'gorille' && f.mkPrise === 'SF') return fin ? SP('bas', { x: 40, y: 20, sy: .94 }, true) : SP('fort', { y: -12 + 4 * Math.sin(t * 30) }, true);
      return fin ? SP('coup', { x: 50, r: .12, sx: 1.05 }, true) : SP(n, { sy: 1 + .02 * Math.sin(t * 25) }, true);
    }
    case 'tenu': { const a = f.tenuPar; if (a && a.prise && a.prise.prise.plaque) return SP('ko', { x: 6 * Math.sin(t * 30), sy: .92 }); return SP('touche', { r: -.2 + .08 * Math.sin(t * 28), y: -30 }); }
    case 'dizzy': return SP('touche', { r: .07 * Math.sin(t * 6), x: 10 * Math.sin(t * 6), sy: .98 + .02 * Math.sin(t * 12) });
    case 'fuite': { const k = Math.floor(f.t / 6) % 2; return Object.assign(SP(k ? 'marche' : 'base', { y: -14 * Math.abs(Math.sin(f.t * .5)), r: .04 }), { flip: true }) }
    case 'lose': return SP('touche', { sy: .97, r: .04 });
    case 'intro': if (f.t > 20 && f.t < 80) return SP(f.kind === 'grizzly' || f.kind === 'trex' || f.kind === 'megalo' ? 'rugit' : f.kind === 'hyene' ? 'rire' : f.kind === 'orque' ? 'appel' : f.kind === 'loup' ? 'hurle' : f.kind === 'cobra' ? 'capuchon' : f.kind === 'glouton' ? 'gronde' : f.kind === 'mangouste' ? 'dresse' : 'victoire', { sy: 1 + .02 * Math.sin(t * (f.kind === 'hyene' ? 30 : 7)) }, true); return repos();
    case 'atk': {
      const k = f.mk;
      if (f.kind === 'gorille') return gorilleSpr(f, t, u, ph, k, repos);
      if (k === 'L') { if (ph === 'st') return SP('base', { x: -15, sx: .97 }); if (ph === 'act' || u < .5) return SP('coup', { x: 25 * (ph === 'act' ? 1 : 1 - u), sx: 1.03 }); return repos(); }
      if (k === 'cL') { if (ph === 'act' || (ph === 'rec' && u < .5)) return SP('bas', { x: 25 }, true); return SP('accroupi'); }
      if (k === 'H' && f.d.hPose) { const [p0, p1] = f.d.hPose; if (ph === 'st') { const e = eo(u); return SP(p0, { x: -18 * e, sy: .95 + .05 * e }, true); } if (ph === 'act') return SP(p1, { x: 50, sx: 1.05 }, true); return u < .45 ? SP(p1, { x: 40 * (1 - u) }) : repos(); }
      if (k === 'H') { if (ph === 'st') { const e = eo(u); return SP('fort', { x: -20 * e, sy: .9 + .1 * e, sx: 1.05 - .05 * e }, true); }
        if (ph === 'act') return SP('coup', { x: 70, r: .14, sx: 1.06 }, true); return u < .4 ? SP('coup', { x: 50 * (1 - u), r: .1 }) : repos(); }
      if (k === 'A') return SP('saut', { r: .2, y: 80 }, true);
      if (k === 'cH') { if (ph === 'st') return SP('accroupi', { x: -10 }); if (ph === 'act' || (ph === 'rec' && u < .45)) return SP('bas', { x: 40, y: 8 }, true); return SP('accroupi', { sy: .97 }); }
      if (k === 'T') { if (ph === 'st') return SP('base', { x: -12, sx: .97 }); return SP('coup', { x: 30, sx: 1.03 }); }
      const spe = SPECIAUX[f.kind]; if (spe) { const r = spe(f, t, u, ph, k, repos); if (r) return r }
      return poseSpeGenerique(f, t, u, ph, k, repos);
    }
  }
  return repos();
}
// coups spéciaux sans pose dédiée : on choisit la pose selon ce que fait le coup
function poseSpeGenerique(f, t, u, ph, k, repos) {
  const m = f.move || {};
  if (m.aa || (m.saute && !m.quakeLand)) { // anti-aérien : ramassé, puis il bondit vers le ciel
    if (ph === 'st') return SP('accroupi', { sy: .9 });
    if (f.h > 0) return SP('fort', { r: -.1, y: 10 }, true);
    return SP('accroupi', { sy: .94 + .06 * u });
  }
  if (m.saute) { // saut qui écrase (ours polaire : il brise la glace)
    if (ph === 'st') return SP('accroupi', { sy: .92 });
    if (f.h > 0) return SP('saut', { r: f.vy < 0 ? -.08 : .18, y: 40 }, true);
    return SP('bas', { y: 12, sy: .94 }, true);
  }
  if (m.prise) { if (ph === 'st') return SP('accroupi', { x: -10 }); return SP('coup', { x: 40, sx: 1.04 }, true) }
  if (m.rush) { if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .96 }); if (ph === 'act') return SP(Math.floor(f.t / 5) % 2 ? 'coup' : 'marche', { y: -8 * Math.abs(Math.sin(t * 18)), r: .05 }, true); return u < .5 ? SP('coup', { x: 20 * (1 - u) }) : repos(); }
  if (m.contre) { if (ph === 'act') return SP('garde', { x: -6 + 3 * Math.sin(t * 40), sx: 1.03 }, true); return SP('garde', {}) }
  if (m.proj) { if (ph === 'st') return SP('fort', { sy: 1 + .02 * Math.sin(t * 30) }, true); if (ph === 'act') return SP('bas', { x: 20, y: 16, sy: .95 }, true); return repos(); }
  if (ph === 'st') return SP('fort', { sy: 1 + .02 * Math.sin(t * 30) }, true);
  if (ph === 'act') return SP('coup', { x: 50, sx: 1.05 }, true);
  return u < .5 ? SP('coup', { x: 30 * (1 - u) }) : repos();
}
// gorille (poses dessinées) : A = poing, B = bras levés puis il écrase le sol, ★ = la charge en hurlant, SUPER = tambour de la jungle
function gorilleSpr(f, t, u, ph, k, repos) {
  switch (k) {
    case 'L': if (ph === 'st') return SP('base', { x: -15, sx: .97 }); if (ph === 'act' || u < .5) return SP('coup', { x: 20 * (ph === 'act' ? 1 : 1 - u), sx: 1.02 }); return repos();
    case 'cL': if (ph === 'act' || (ph === 'rec' && u < .5)) return SP('bas', { x: 20, y: 10 }, true); return SP('accroupi');
    case 'H': if (ph === 'st') { const e = eo(u); return SP('fort', { y: -10 * e, sy: .96 + .04 * e }, true) }
      if (ph === 'act') return SP('bas', { x: 40, y: 20, sy: .95 }, true); return u < .5 ? SP('bas', { x: 30 * (1 - u) }) : repos();
    case 'A': return SP('saut', { r: .15, y: 60 }, true);
    case 'cH': if (ph === 'st') return SP('accroupi', { x: -10 }); if (ph === 'act' || (ph === 'rec' && u < .45)) return SP('bas', { x: 40, y: 12 }, true); return SP('accroupi');
    case 'T': if (ph === 'st') return SP('base', { x: -12 }); return SP('coup', { x: 30, sx: 1.03 });
    case 'SF': if (ph === 'st') return SP('coup', { x: -15 * u, sx: .97 }); return SP('coup', { x: 45, sx: 1.05 }, true); // il tend les bras pour attraper
    case 'SD': if (ph === 'st') { const e = eo(u); return SP('fort', { y: -14 * e, sy: .96 + .04 * e }, true) } if (ph === 'act') return SP('bas', { x: 30, y: 22, sy: .93 }, true); return u < .5 ? SP('bas', { x: 20 * (1 - u) }) : repos();
    case 'S': if (ph === 'st') return SP('special', { x: -10 * u, sy: 1 + .02 * Math.sin(t * 30) }, true);
      if (ph === 'act') return SP(Math.floor(f.t / 5) % 2 ? 'marche' : 'special', { y: -8 * Math.abs(Math.sin(t * 16)), r: .05 }, true); return u < .5 ? SP('special', {}) : repos();
    case 'SUPER': if (ph === 'st') return SP('victoire', { sy: 1 + .03 * Math.sin(t * 40) }, true);
      if (ph === 'act') return f.t % 12 < 6 ? SP('fort', { y: -20 }, true) : SP('bas', { x: 20, y: 20, sy: .94 }, true); return repos();
  }
  return repos();
}
const SPECIAUX = {
  // ===== les animaux du livre ajoutés le 25/09 (duels 7, 11, 14, 15, 19, 20, 22, 23, 26, 27) =====
  // jaguar : ★ la morsure perce-crâne · → ★ l'attaque par-derrière (il rampe dans l'herbe) · ↓ ★ la griffe vers le ciel · SUPER le jaguar tout noir
  jaguar(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -20 * e, sy: .96 }, true) } if (ph === 'act') return SP('fort', { x: 50, sx: 1.06 }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('rampe', { sy: .96 }, true); if (ph === 'act') return SP('fort', { x: 40, sx: 1.05 }, true); return u < .5 ? SP('rampe', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .02 * Math.sin(t * 30) }, true); if (ph === 'act') return Math.floor(f.t / 5) % 2 ? SP('coup', { x: 50, sx: 1.05 }, true) : SP('fort', { x: 30 }, true); return repos(); }
  },
  // anaconda : ★ il serre à bloquer le sang (prise) · → ★ sous l'eau · ↓ ★ caché dans l'herbe (contre) · SUPER les bébés anacondas
  anaconda(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { x: -10 * u }, true); return SP('fort', { x: 40, sx: 1.05 }, true) }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { y: 220 * Math.min(1, f.t / 10) }); if (f.h > 0) return SP('special', { r: f.vy < 0 ? -.05 : .15, y: 20 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SD') { if (f.contre) return SP('fort', { x: 45, sx: 1.05 }, true); if (ph === 'rec') return repos(); return SP('accroupi', { sy: .95 + .01 * Math.sin(t * 8) }, true); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return SP('victoire', { sy: 1 + .02 * Math.sin(t * 12) }, true); return repos(); }
  },
  // caïman : ★ il plonge pour se cacher · → ★ la sieste au soleil (contre) · ↓ ★ la mâchoire vers le ciel · SUPER les 10 millions du Pantanal
  caiman(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { y: 220 * Math.min(1, f.t / 10) }); if (f.h > 0) return SP('special', { r: f.vy < 0 ? -.05 : .15, y: 20 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SF') { if (f.contre) return SP('fort', { x: 45, sx: 1.06 }, true); if (ph === 'rec') return repos(); return SP('sieste', { sy: 1 + .015 * Math.sin(t * 2.5) }, true); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return SP('victoire', { sy: 1 + .02 * Math.sin(t * 12) }, true); return repos(); }
  },
  // puma : ★ il saute sur le dos et mord (prise) · → ★ le saut de 5,50 m · ↓ ★ les grosses pattes griffues · SUPER 2 400 km à pied
  puma(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .94 }); return SP('dos', { x: 30, y: -20 }, true) }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { sy: .9 }); if (f.h > 0) return SP(f.vy < 0 ? 'saut' : 'special', { r: f.vy < 0 ? -.1 : .2, y: 40 }, true); return SP('accroupi', { sy: .92 + .08 * u }); }
  },
  // loup : ★ il blesse, puis il attend · → ★ le hurlement (l'autre prend peur) · ↓ ★ le croc en l'air · SUPER la meute
  loup(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { x: -14 * u }, true); if (ph === 'act') return SP('fort', { x: 40, sx: 1.05 }, true); return SP('garde', { x: -30 * u }, true) }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { sy: .97 }, true); if (ph === 'act') return SP('hurle', { sy: 1 + .02 * Math.sin(t * 30) }, true); return repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('hurle', { sy: 1 + .03 * Math.sin(t * 30) }, true); if (ph === 'act') return SP('victoire', { sy: 1 + .02 * Math.sin(t * 12) }, true); return repos(); }
  },
  // mangouste : ★ elle esquive, puis mord la tête (contre) · → ★ la vitesse · ↓ ★ le saut sur la tête · SUPER la danse
  mangouste(f, t, u, ph, k, repos) {
    if (k === 'S') { if (f.contre) return SP('fort', { x: 50, y: -40, sx: 1.06 }, true); if (ph === 'rec') return repos(); return SP('dresse', { x: 26 * Math.sin(t * 9), r: .08 * Math.sin(t * 9) }, true); }
    if (k === 'SUPER') { if (ph === 'st') return SP('dresse', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('dresse', { x: 60 * Math.sin(t * 12), r: .1 * Math.sin(t * 12) }, true) : SP('fort', { x: 40, sx: 1.05 }, true); return repos(); }
  },
  // cobra : ★ il ouvre son capuchon (l'autre prend peur) · → ★ dressé, il poursuit l'ennemi · ↓ ★ la morsure vers le ciel · SUPER le venin royal
  cobra(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { sy: .96 + .04 * u }, true); if (ph === 'act') return SP('capuchon', { sy: 1 + .02 * Math.sin(t * 30) }, true); return repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('capuchon', { sy: .98 }, true); if (ph === 'act') return f.hit ? SP('fort', { x: 40, sx: 1.05 }, true) : SP('capuchon', { y: -8 * Math.abs(Math.sin(t * 16)), r: .04 }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('capuchon', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('fort', { x: 40, sx: 1.05 }, true) : SP('coup', { x: 20 }, true); return repos(); }
  },
  // ours noir : ★ il charge pour faire peur · → ★ la pause goûter · ↓ ★ les griffes courbes · SUPER l'ours esprit (tout blanc)
  oursnoir(f, t, u, ph, k, repos) {
    if (k === 'SF') { if (ph === 'act') return SP('mange', { sy: 1 + .02 * Math.sin(t * 9), x: 2 * Math.sin(t * 20) }, true); return SP('accroupi', { sy: .96 }); }
  },
  // glouton : ★ il gronde et fonce · → ★ la dent pour la viande gelée · ↓ ★ le grimpeur · SUPER il ne recule jamais
  glouton(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('gronde', { x: 4 * Math.sin(t * 50), sy: 1 + .02 * Math.sin(t * 30) }, true); if (ph === 'act') return SP(Math.floor(f.t / 5) % 2 ? 'coup' : 'marche', { y: -8 * Math.abs(Math.sin(t * 18)), r: .05 }, true); return u < .5 ? SP('coup', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('gronde', { x: -16 * u }, true); if (ph === 'act') return SP('fort', { x: 45, sx: 1.06 }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
  },
  // girafe : ★ le coup de pied qui assomme · → ★ le rodéo (elle se secoue) · ↓ ★ le coup de cou · SUPER les pattes de 1,80 m
  girafe(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -16 * e }, true) } if (ph === 'act') return SP('fort', { x: 40, sx: 1.04 }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: 6 * Math.sin(t * 50) }, true); if (ph === 'act') return SP(f.t % 12 < 6 ? 'special' : 'garde', { x: 16 * Math.sin(t * 40), r: .05 * Math.sin(t * 40) }, true); return repos(); } // le rodéo : elle se cabre et se secoue
    if (k === 'SD') { if (ph === 'st') return SP('garde', { r: -.08 }, true); if (ph === 'act') return SP('cou', { r: .04 }, true); return u < .5 ? SP('cou', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('fort', { x: 40, sx: 1.04 }, true) : SP('coup', { x: 20 }, true); return repos(); }
  },
  // lionne : ★ elles sautent sur le dos (prise) · → ★ l'embuscade dans l'herbe · ↓ ★ les griffes pour s'accrocher · SUPER l'équipe de foot
  lionne(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .94 }); return SP('special', { x: 30, y: -20 }, true) }
    if (k === 'SF') { if (ph === 'st') return SP('rampe', { x: -10 * u }, true); if (ph === 'act') return f.hit ? SP('fort', { x: 40 }, true) : SP('rampe', { y: -4 * Math.abs(Math.sin(t * 16)), x: 10 * Math.sin(t * 16) }, true); return u < .5 ? SP('rampe', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return SP('victoire', { sy: 1 + .02 * Math.sin(t * 12) }, true); return repos(); }
  },
  // python : ★ l'attaque surprise (immobile comme une branche) · → ★ il mord, puis il s'enroule (prise) · ↓ ★ il « voit » la chaleur (contre) · SUPER il avale tout rond
  python(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { sy: .97 }); if (ph === 'act') return SP('fort', { x: 60, sx: 1.06 }, true); return u < .5 ? SP('fort', { x: 30 * (1 - u) }) : repos(); }
    if (k === 'SF' || k === 'SUPER') { if (ph === 'st') return SP('garde', { x: -10 * u }, true); return SP('fort', { x: 40, sx: 1.05 }, true) }
    if (k === 'SD') { if (f.contre) return SP('fort', { x: 45, sx: 1.05 }, true); if (ph === 'rec') return repos(); return SP('garde', { sy: 1 + .01 * Math.sin(t * 20) }, true); }
  },
  // alligator : ★ il mord, puis il roule · → ★ le grondement qui fait danser l'eau · ↓ ★ la mâchoire aux 80 dents · SUPER le chef des marais
  alligator(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { x: -10 * u }); if (ph === 'act') return f.hit ? SP('roule', { r: .15 * Math.sin(t * 20) }, true) : SP('fort', { x: 30, sx: 1.04 }, true); return repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: 5 * Math.sin(t * 60), sy: 1 + .02 * Math.sin(t * 40) }, true); if (ph === 'act') return SP('garde', { x: 3 * Math.sin(t * 60) }, true); return repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('fort', { x: 40, sx: 1.05 }, true) : SP('coup', { x: 10 }, true); return repos(); }
  },
  // requin-bouledogue (MER) : ★ il cogne, puis il mord · → ★ le requin de rivière · ↓ ★ la morsure record · SUPER le bagarreur
  bouledogue(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { x: -14 * u }, true); if (ph === 'act') return f.hit >= 1 ? SP('fort', { x: 40, sx: 1.05 }, true) : SP('cogne', { x: 30 }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: -12 * u, sy: .97 }, true); if (ph === 'act') return f.hit ? SP('fort', { x: 30 }, true) : SP('cogne', { y: -6 * Math.abs(Math.sin(t * 18)) }, true); return u < .5 ? SP('cogne', {}) : repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .95 }); if (f.h > 0) return SP('special', { r: f.vy < 0 ? -.05 : .2, y: 20 }, true); return SP('accroupi', { sy: .95 + .05 * u }); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('cogne', { x: 30 }, true) : SP('fort', { x: 40, sx: 1.05 }, true); return repos(); }
  },
  // baleine bleue (MER) : ★ le chant (onde) · → ★ elle file à 32 km/h · ↓ ★ le souffle de 9 m · SUPER la grande gorgée
  baleine(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { sy: 1 + .02 * Math.sin(t * 20) }, true); if (ph === 'act') return SP('coup', { x: 10 }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .95 }); if (ph === 'act') return SP('souffle', { sy: 1 + .02 * Math.sin(t * 20) }, true); return u < .5 ? SP('souffle', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .03 * Math.sin(t * 30) }, true); if (ph === 'act') return SP('fort', { x: 20 + 10 * Math.sin(t * 10), sx: 1.04 }, true); return repos(); }
  },
  // crabe (MER) : ★ il pince et ne lâche plus (prise) · → ★ la marche de côté · ↓ ★ les pinces vers le ciel · SUPER l'armure de chevalier
  crabe(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { x: -10 * u }, true); return SP('pince', { x: 30, sx: 1.03 }, true) }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { sy: .96 }, true); if (ph === 'act') return f.hit ? SP('fort', { x: 30 }, true) : SP('special', { y: -4 * Math.abs(Math.sin(t * 24)) }, true); return u < .5 ? SP('special', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('fort', { x: 40, sx: 1.04 }, true) : SP('pince', { x: 20 }, true); return repos(); }
  },
  // crevette-mante (MER) : ★ elle casse les coquilles · → ★ la bulle qui éclate · ↓ ★ la massue vers le ciel · SUPER plus rapide qu'un clin d'œil
  crevette(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -14 * e, sy: .97 }, true) } if (ph === 'act') return SP('fort', { x: 40, sx: 1.05 }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: -8 * u }, true); if (ph === 'act' || u < .4) return SP('bulle', { x: 20 }, true); return repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 6 < 3 ? SP('fort', { x: 40, sx: 1.05 }, true) : SP('coup', { x: 20 }, true); return repos(); }
  },
  // frelon géant (PETITES BÊTES) : ★ les mandibules-ciseaux · → ★ le dard de 6 mm · ↓ ★ le décollage · SUPER la bande à frelons
  frelon(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -14 * e }, true) } if (ph === 'act') return SP('ciseaux', { x: 40, sx: 1.05 }, true); return u < .5 ? SP('ciseaux', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: -10 * u, y: -10 * u }, true); if (ph === 'act') return f.hit ? SP('fort', { x: 30 }, true) : SP('special', { y: 10 * Math.sin(t * 20) }, true); return u < .5 ? SP('fort', {}) : repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .95 }); if (f.h > 0) return SP(f.vy < 0 ? 'saut' : 'special', { r: f.vy < 0 ? 0 : .15, y: 20 }, true); return SP('accroupi', { sy: .95 + .05 * u }); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { x: 4 * Math.sin(t * 50), sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return SP('victoire', { y: -6 * Math.sin(t * 12) }, true); return repos(); }
  },
  // abeilles (PETITES BÊTES) : ★ elles foncent toutes ensemble · → ★ ça vibre, ça chauffe · ↓ ★ le dard vers le ciel · SUPER la boule de chaleur
  abeille(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { x: -12 * u }, true); if (ph === 'act') return SP(Math.floor(f.t / 5) % 2 ? 'special' : 'coup', { y: -6 * Math.abs(Math.sin(t * 18)) }, true); return u < .5 ? SP('coup', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { sy: .97 }, true); if (ph === 'act') return SP('vibre', { x: 5 * Math.sin(t * 70), sy: 1 + .02 * Math.sin(t * 50) }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .95 }); if (f.h > 0) return SP(f.vy < 0 ? 'saut' : 'fort', { r: f.vy < 0 ? 0 : .12, y: 20 }, true); return SP('accroupi', { sy: .95 + .05 * u }); }
    if (k === 'SUPER') { if (ph === 'st') return SP('vibre', { x: 4 * Math.sin(t * 60), sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('fort', { x: 30, sx: 1.04 }, true) : SP('vibre', { x: 4 * Math.sin(t * 60) }, true); return repos(); }
  },
  // léopard : ★ le bond de 6 m · → ★ le repas dans l’arbre (prise : il grimpe avec sa proie) · ↓ ★ tombé du ciel · SUPER l’ombre de la nuit
  leopard(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .94 }); if (f.h > 0) return SP('special', { r: f.vy < 0 ? -.08 : .12, y: 30 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { x: -10 * u, sy: .95 }); if (ph === 'act') return SP('fort', { x: 30, sx: 1.04 }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('grimpe', { y: -30 }, true); if (f.h > 0) return SP('special', { r: .7, y: 20 }, true); return u < .5 ? SP('accroupi', { sy: .9 }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .02 * Math.sin(t * 30) }, true); if (ph === 'act') return Math.floor(f.t / 5) % 2 ? SP('coup', { x: 50, sx: 1.05 }, true) : SP('fort', { x: 30 }, true); return repos(); }
  },
  // porc-épic : → ★ la charge en marche arrière (il montre ses piquants) · ★ tchik-tchik (le hochet qui contre) · ↓ ★ la boule piquante · SUPER qui s’y frotte s’y pique
  porcepic(f, t, u, ph, k, repos) {
    if (k === 'SF' || k === 'SUPER') {
      if (ph === 'st') return u < .5 ? SP('base', { sx: Math.max(.08, 1 - u * 1.9) }) : SP('special', { sx: Math.max(.08, (u - .5) * 2) }, true); // il se retourne
      if (ph === 'act') return SP('special', { y: -6 * Math.abs(Math.sin(t * 20)), x: 3 * Math.sin(t * 50) }, true);
      return u < .45 ? SP('special', { sx: Math.max(.08, 1 - u * 2.2) }) : SP('base', { sx: Math.max(.08, (u - .45) * 1.9) });
    }
    if (k === 'S') { if (f.contre) return f.t - f.hitT < 8 ? SP('fort', { y: -10 }, true) : SP('coup', { x: 30, sx: 1.04 }, true); if (ph === 'rec' && u > .4) return repos(); return SP('hochet', { x: 4 * Math.sin(t * 70), sx: 1 + .01 * Math.sin(t * 50) }, true); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .9 }); if (f.h > 0) return SP('garde', { r: f.vy < 0 ? -.2 : .2, y: 20 }, true); return SP('accroupi', { sy: .94 + .06 * u }); }
  },
  // guépard : ★ le croche-patte (glissade basse) · → ★ le démarrage turbo · ↓ ★ le saut de l’éclair · SUPER la tornade tachetée
  guepard(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { x: -10 * u, sy: .95 }); if (ph === 'act') return SP('bas', { x: 30, y: 6 }, true); return u < .5 ? SP('bas', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF' || k === 'SUPER') { if (ph === 'st') return SP('accroupi', { x: -14 * u, sy: .93 }); if (ph === 'act') return f.hit && f.t - f.hitT < 5 ? SP('coup', { x: 40, sx: 1.05 }, true) : SP('special', { y: -6 * Math.abs(Math.sin(t * 22)), sx: 1.05 }, true); return u < .5 ? SP('accroupi', {}) : repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .9 }); if (f.h > 0) return SP('crochet', { r: -.1, y: 10 }, true); return SP('accroupi', { sy: .94 + .06 * u }); }
  },
  // autruche : ★ le grand coup de patte · → ★ le pas de géant · ↓ ★ le tas de terre (couchée, puis surprise !) · SUPER karaté-poule
  autruche(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { x: -14 * u, sy: .97 }, true); if (ph === 'act' || u < .45) return SP('fort', { x: ph === 'act' ? 40 : 40 * (1 - u), sx: 1.04 }, true); return repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { x: -10 * u, sy: .95 }); if (ph === 'act') return f.hit ? SP('fort', { x: 30 }, true) : SP('special', { y: -10 * Math.abs(Math.sin(t * 14)) }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('terre', { sy: 1 + .01 * Math.sin(t * 4) }); if (ph === 'act') return SP('coup', { y: -20, r: -.15 }, true); return u < .5 ? SP('accroupi', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('victoire', { sy: 1 + .02 * Math.sin(t * 30) }, true); if (ph === 'act') { const q = Math.floor(f.t / 4) % 3; return SP(['fort', 'bas', 'coup'][q], { x: 30 + 10 * Math.sin(t * 40) }, true) } return repos(); }
  },
  // lion : ★ rugissement qui souffle · → ★ il plaque sa proie (bond puis prise) · ↓ ★ coup de patte vers le ciel (générique) · SUPER la charge du roi
  lion(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { sy: .95 - .03 * u }); if (ph === 'act') return SP('special', { x: 3 * Math.sin(t * 70), sx: 1.04 }, true); return u < .5 ? SP('special', {}, true) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .94 }); if (ph === 'act') return SP('saut', { y: 40, r: .06 }, true); return repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .02 * Math.sin(t * 30) }, true);
      if (ph === 'act') return Math.floor(f.t / 5) % 2 ? SP('coup', { x: 60, sx: 1.05 }, true) : SP('saut', { y: 40, r: .08 }, true); return repos(); }
  },
  // crocodile : ★ la roulade de la mort · → ★ et SUPER : il plonge (flaque) et bondit de l’eau · ↓ ★ la mâchoire vers le ciel
  croco(f, t, u, ph, k, repos) {
    if (k === 'S') {
      if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .97 });
      if (ph === 'act') { if (!f.hit) return SP('coup', { x: 30, sx: 1.04 }, true); return Math.floor(f.t / 4) % 2 ? SP('special', { y: -18 }, true) : SP('accroupi', { y: -6, sy: .96 }); }
      return u < .5 ? SP('accroupi', {}) : repos();
    }
    if (k === 'SF' || k === 'SUPER') {
      if (ph === 'st') return SP('accroupi', { y: 220 * Math.min(1, f.t / 10) });
      if (ph === 'act') return SP('saut', { r: f.vy < 0 ? -.12 : .1, y: 30 }, true);
      return repos();
    }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .9 }); if (ph === 'act' || u < .4) return SP('fort', { y: -20 + 10 * u }, true); return repos(); }
  },
  // hippopotame : ★ il se retourne, la queue-hélice mitraille · → ★ la charge gueule ouverte · ↓ ★ le grand bâillement · SUPER le déluge
  hippo(f, t, u, ph, k, repos) {
    if (k === 'S' || k === 'SUPER') {
      const gros = k === 'SUPER' ? 1.6 : 1;
      if (ph === 'st') return u < .5 ? SP('base', { sx: Math.max(.08, 1 - u * 1.9) }) : SP('special', { sx: Math.max(.08, (u - .5) * 2) }, true); // il se retourne
      if (ph === 'act') return SP('special', { x: 5 * gros * Math.sin(t * 60), sy: 1 + .02 * gros * Math.sin(t * 40) }, true);
      return u < .45 ? SP('special', { sx: Math.max(.08, 1 - u * 2.2) }) : SP('base', { sx: Math.max(.08, (u - .45) * 1.9) }); // il se remet face à l'adversaire
    }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { x: -15 * u, sy: .96 }); if (ph === 'act') return SP(Math.floor(f.t / 6) % 2 ? 'coup' : 'marche', { y: -8 * Math.abs(Math.sin(t * 18)), r: .04 }, true); return u < .5 ? SP('accroupi', {}) : repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('base', { sy: .95 }); if (ph === 'act' || u < .4) return SP('fort', { y: -24 }, true); return repos(); }
  },
  // ratel : ★ la bombe puante (dos tourné, queue levée) · → ★ il fonce sans réfléchir · ↓ ★ la morsure qui ne lâche pas · SUPER la furie
  ratel(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'rec' && u > .5) return repos(); return SP('special', { x: 3 * Math.sin(t * 50) }, true); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { x: -10 * u, sy: .94 }); if (ph === 'act') return SP(Math.floor(f.t / 4) % 2 ? 'bas' : 'marche', { y: 6, r: .08 }, true); return u < .5 ? SP('accroupi', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .03 * Math.sin(t * 30) }, true);
      if (ph === 'act') { const q = Math.floor(f.t / 3) % 3; return SP(['coup', 'saut', 'fort'][q], { x: 20 * Math.sin(t * 40), y: q === 1 ? -30 : 0, r: .1 * Math.sin(t * 30) }, true); } return repos(); }
  },
  // dragon de Komodo : ★ la morsure à venin (langue qui goûte l'air) · → ★ le coup de queue (il pivote) · SUPER la morsure royale
  komodo(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('special', { sy: 1 + .01 * Math.sin(t * 20) }, true); if (ph === 'act') return SP('coup', { x: 40, sx: 1.05 }, true); return u < .5 ? SP('coup', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { // il pivote : la queue fouette du côté de l'adversaire
      if (ph === 'st') return SP('base', { sx: Math.max(.08, 1 - u * 1.9) });
      if (ph === 'act' || (ph === 'rec' && u < .35)) return Object.assign(SP('bas', { x: -40, sy: .96 }, true), { flip: true });
      return SP('base', { sx: Math.max(.08, (u - .35) * 1.6) });
    }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .02 * Math.sin(t * 30) }, true); if (ph === 'act') return SP('coup', { x: 70, sx: 1.06 }, true); return repos(); }
  },
  // grizzly : ★ la patte à saumons (uppercut) · → ★ la charge · ↓ ★ l'invité surprise (grognement qui fait fuir) · SUPER la pêche miraculeuse
  grizzly(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { sy: .92 }); if (ph === 'act' || u < .5) return SP('special', { y: -12 * (ph === 'act' ? 1 : 1 - u) }, true); return repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .95 }); if (ph === 'act') return SP(Math.floor(f.t / 5) % 2 ? 'saut' : 'marche', { y: -10 * Math.abs(Math.sin(t * 16)), r: .04 }, true); return u < .5 ? SP('coup', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SD') { if (ph === 'rec' && u > .5) return repos(); return SP('rugit', { x: ph === 'act' ? 4 * Math.sin(t * 60) : 0, sx: 1.02 }, true); }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .02 * Math.sin(t * 30) }, true); if (ph === 'act') return Math.floor(f.t / 5) % 2 ? SP('coup', { x: 50, sx: 1.05 }, true) : SP('special', { y: -10 }, true); return repos(); }
  },
  // T. rex : ★ le pas qui fait trembler · → ★ la morsure géante (prise, poses génériques) · ↓ ★ le coup de queue · SUPER le rugissement du roi
  trex(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('fort', { y: -8 * u, sy: 1 + .02 * u }, true); if (ph === 'act' || u < .4) return SP('bas', { y: 10, sy: .95 }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('garde', { x: -10 * u }); if (ph === 'act' || u < .5) return SP('queue', { x: ph === 'act' ? 20 : 0, r: ph === 'act' ? .04 * Math.sin(t * 40) : 0 }, true); return repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('accroupi', { sy: .92 + .04 * Math.sin(t * 30) }, true); if (ph === 'act' || u < .6) return SP('rugit', { x: 6 * Math.sin(t * 60), sy: 1.03 }, true); return repos(); }
  },
  // morse : ★ le mur de défenses (contre) · → ★ il marche avec ses dents (bond) · ↓ ★ l'aspirateur à moustaches · SUPER le canapé d'une tonne et demie
  morse(f, t, u, ph, k, repos) {
    if (k === 'S') { if (f.contre) return f.t - f.hitT < 8 ? SP('fort', { y: -10 }, true) : SP('coup', { x: 40, sx: 1.05 }, true);
      if (ph === 'rec' && u > .4) return repos(); return SP('garde', { sx: 1 + .015 * Math.sin(t * 20), sy: .99 }, true); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { sy: .94 }); if (f.h > 0) return SP('saut', { r: f.vy < 0 ? -.06 : .1, y: 30 }, true); return SP('coup', { x: 30, sx: 1.04 }, true); }
    if (k === 'SD') { if (ph === 'rec' && u > .5) return repos(); return SP('slurp', { x: ph === 'act' ? 4 * Math.sin(t * 50) : 0, sx: ph === 'act' ? 1.02 + .02 * Math.sin(t * 30) : 1 }, true); }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .02 * Math.sin(t * 30) }, true); if (f.h > 0) return SP('saut', { r: f.vy < 0 ? -.08 : .15, y: 40 }, true); return SP('accroupi', { sy: .9 + .1 * Math.min(1, (f.t - (f.landT || f.t)) / 12), sx: 1.05 }, true); }
  },
  // buffle : ★ la charge tête baissée · → ★ le lancer de cornes · ↓ ★ il se secoue (mordu, mais pas vaincu) · SUPER la charge de 550 kg
  buffle(f, t, u, ph, k, repos) {
    if (k === 'S' || k === 'SUPER') { if (ph === 'st') return SP(f.t % 10 < 5 ? 'accroupi' : 'garde', { x: -8 * u, sy: .96 + .02 * Math.sin(t * 40) }, true);
      if (ph === 'act') return f.hit && f.t - f.hitT < 6 ? SP('coup', { x: 40, sx: 1.05 }, true) : SP(Math.floor(f.t / 5) % 2 ? 'special' : 'marche', { y: -10 * Math.abs(Math.sin(t * 16)), r: .03 }, true);
      return u < .5 ? SP('coup', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { sy: .92 }); if (ph === 'act' || u < .45) return SP('fort', { y: ph === 'act' ? -14 : -14 * (1 - u) }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('garde', { sy: .97 }); if (ph === 'act') return SP('secoue', { x: 12 * Math.sin(t * 60), r: .035 * Math.sin(t * 47) }, true); return u < .4 ? SP('secoue', {}) : repos(); }
  },
  // hyène : ★ le rire qui énerve · → ★ elle ne lâche jamais (poursuite qui mordille) · ↓ ★ croque-os (prise) · SUPER le clan arrive
  hyene(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { sy: .95 - .03 * u }); if (ph === 'act' || u < .6) return SP('rire', { sy: 1 + .03 * Math.sin(t * 45), r: -.03 + .03 * Math.sin(t * 22) }, true); return repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('accroupi', { x: -12 * u, sy: .95 }); if (ph === 'act') return f.t % 9 < 4 ? SP('coup', { x: 30, sx: 1.04 }, true) : SP(Math.floor(f.t / 5) % 2 ? 'saut' : 'marche', { y: -12 * Math.abs(Math.sin(t * 18)), r: .04 }, true); return u < .5 ? SP('coup', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('rire', { sy: 1 + .03 * Math.sin(t * 45) }, true); if (ph === 'act') return f.t % 12 < 6 ? SP('coup', { x: 50, sx: 1.05 }, true) : SP('fort', { y: -8 }, true); return repos(); }
  },
  // ours polaire : ★ glissade sur le ventre (toboggan) · SUPER le coup de patte de géant (→ ★ et ↓ ★ : poses génériques)
  ours(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { x: -10 * u }); if (ph === 'act') return SP('special', { y: -4 * Math.abs(Math.sin(t * 20)) }, true); return u < .5 ? SP('accroupi', {}) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('fort', { sy: 1 + .02 * Math.sin(t * 30) }, true);
      if (ph === 'act') return f.t % 12 < 6 ? SP('fort', { x: -10, sy: 1.02 }, true) : SP('coup', { x: 40, r: .12, sx: 1.04 }, true); return repos(); }
  },
  // orque (MER) : ★ le coup de queue qui assomme · → ★ le sonar · ↓ ★ le plongeon de 10 tonnes (elle remonte respirer, puis retombe) · SUPER la bande d'orques
  orque(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -20 * e, r: -.08 * e, sy: .97 }) } if (ph === 'act') return SP('fort', { x: 30, r: .06, sx: 1.04 }, true); return u < .5 ? SP('fort', { x: 20 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('appel', { sy: 1 + .02 * Math.sin(t * 40), r: -.03 * u }, true); if (ph === 'act' || u < .5) return SP('appel', { x: -8, sx: 1.03 }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('saut', { r: -.35, y: -20 }, true); if (f.h > 0) return SP('bas', { r: .25, y: 20 }, true); return u < .5 ? SP('accroupi', { sy: .92 }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('appel', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return SP('appel', { sy: 1 + .02 * Math.sin(t * 12), r: -.02 }, true); return repos(); }
  },
  // pieuvre (MER) : ★ le bec caché (prise) · → ★ le nuage d'encre · ↓ ★ le camouflage (contre, presque invisible) · SUPER la danse des 8 bras
  pieuvre(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('garde', { x: -16 * u, sy: .97 }); if (ph === 'act') return SP('special', { x: 24, sx: 1.04 }, true); return u < .5 ? SP('special', { x: 12 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('encre', { sy: 1 + .03 * Math.sin(t * 40), x: -6 * u }, true); if (ph === 'act' || u < .4) return SP('encre', { x: -10, sx: 1.02 }, true); return repos(); }
    if (k === 'SD') { if (f.contre) return f.t - f.hitT < 8 ? SP('fort', { x: 40, sx: 1.05 }, true) : SP('coup', { x: 30 }, true); if (ph === 'rec') return repos(); return SP('accroupi', { sy: .96 + .02 * Math.sin(t * 6) }, true); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 8 < 4 ? SP('fort', { x: 30, sx: 1.04 }, true) : SP('coup', { x: 40, r: .04 }, true); return repos(); }
  },
  // aiguillat (MER) : ★ il se plie et pique · → ★ la flèche grise · ↓ ★ l'épine du dos (anti-aérien) · SUPER la bande des mille
  aiguillat(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -14 * e, r: -.06 * e, sy: .97 }) } if (ph === 'act') return SP('special', { x: 16, sx: 1.03 }, true); return u < .5 ? SP('special', { x: 8 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: -14 * u, sy: .97 }); if (ph === 'act') return SP('coup', { x: 20, sx: 1.06, r: .03 }, true); return u < .5 ? SP('coup', { x: 12 * (1 - u) }) : repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .92 }); if (f.h > 0) return SP('epine', { r: f.vy < 0 ? -.12 : .1 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('coup', { x: 30, sx: 1.04 }, true) : SP('fort', { x: 20 }, true); return repos(); }
  },
  // espadon (MER) : ★ le coup de tête qui tranche · → ★ la charge de l'épée (qui peut se coincer dans le mur) · ↓ ★ l'épée vers le ciel · SUPER la tempête d'épée
  espadon(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -22 * e, r: .12 * e, sy: .97 }) } if (ph === 'act') return SP('special', { x: 24, r: -.05 }, true); return u < .5 ? SP('special', { x: 12 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: -16 * u, sy: .97 }); if (ph === 'act') return SP('coup', { x: 24, sx: 1.06 }, true); return u < .5 ? SP('coup', { x: 12 * (1 - u) }) : repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .92 }); if (f.h > 0) return SP('ciel', { r: f.vy < 0 ? -.08 : .12 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('garde', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') { const c = Math.floor(f.t / 5) % 3; return c === 0 ? SP('coup', { x: 30, sx: 1.05 }, true) : c === 1 ? SP('fort', { x: 20 }, true) : SP('special', { x: 24 }, true) } return repos(); }
  },
  // requin bleu (MER) : ★ il tourne autour (il disparaît, puis mord par-derrière) · → ★ les dents en scie · ↓ ★ le museau en l'air · SUPER la tornade bleue
  requinbleu(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('special', {}, true); if (ph === 'act') return SP('fort', { x: 30, sx: 1.05 }, true); return u < .5 ? SP('fort', { x: 14 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: -14 * u, sy: .97 }); if (ph === 'act') return f.t % 8 < 4 ? SP('fort', { x: 24, sx: 1.04 }, true) : SP('coup', { x: 30 }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { sy: .92 }); if (f.h > 0) return SP('museau', { r: f.vy < 0 ? -.1 : .12 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('special', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 12 < 6 ? SP('special', { r: .1 * Math.sin(t * 30) }, true) : SP('fort', { x: 20 }, true); return repos(); }
  },
  // mégalodon (légendaire de la MER) : ★ la mâchoire géante · → ★ la vague géante · ↓ ★ surgi des profondeurs · SUPER les dents de 18 cm
  megalo(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') { const e = eo(u); return SP('garde', { x: -20 * e, r: -.06 * e, sy: .97 }) } if (ph === 'act') return SP('fort', { x: 30, sx: 1.05 }, true); return u < .5 ? SP('fort', { x: 14 * (1 - u) }) : repos(); }
    if (k === 'SF') { if (ph === 'st') return SP('rugit', { sy: 1 + .02 * Math.sin(t * 40) }, true); if (ph === 'act' || u < .4) return SP('coup', { x: -10 }, true); return repos(); }
    if (k === 'SD') { if (ph === 'st') return SP('accroupi', { y: 220 * Math.min(1, f.t / 10) }); if (ph === 'act' && f.h > 0) return SP('special', { r: f.vy < 0 ? -.05 : .15, y: 20 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('rugit', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('fort', { x: 40, sx: 1.05 }, true) : SP('coup', { x: 10 }, true); return repos(); }
  },
  // grand requin blanc (MER) : ★ l'attaque par en dessous (on ne voit que l'aileron, puis il surgit) · → ★ la torpille · ↓ ★ le radar (contre) · SUPER les 300 dents
  requin(f, t, u, ph, k, repos) {
    if (k === 'S') { if (ph === 'st') return SP('accroupi', { y: 220 * Math.min(1, f.t / 10) }); if (ph === 'act' && f.h > 0) return SP('special', { r: f.vy < 0 ? -.05 : .15, y: 20 }, true); return u < .5 ? SP('accroupi', { sy: .95 }) : repos(); }
    if (k === 'SD') { if (f.contre) return SP('coup', { x: 45, sx: 1.05 }, true); if (ph === 'rec') return repos(); return SP('radar', { x: 3 * Math.sin(t * 60), sy: 1 + .01 * Math.sin(t * 20) }, true); }
    if (k === 'SF') { if (ph === 'st') return SP('garde', { x: -14 * u, sy: .97 }); if (ph === 'act') return SP('coup', { x: 20, sx: 1.06, r: .03 }, true); return u < .5 ? SP('coup', { x: 15 * (1 - u) }) : repos(); }
    if (k === 'SUPER') { if (ph === 'st') return SP('coup', { sy: 1 + .03 * Math.sin(t * 40) }, true); if (ph === 'act') return f.t % 10 < 5 ? SP('coup', { x: 40, sx: 1.05 }, true) : SP('garde', { x: 10 }, true); return repos(); }
  },
};
