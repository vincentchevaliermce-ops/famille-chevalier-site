// =====================================================================
//  Moteur de personnages « skinnés » (WebGL) — squelette 2D + maillage
// =====================================================================
const Skin = (() => {
  const VS = `
  attribute vec2 aPos; attribute vec2 aUV; attribute vec4 aB; attribute vec4 aW;
  uniform vec4 uA[20]; uniform vec2 uT[20];
  uniform mat3 uView; varying vec2 vUV;
  vec2 xf(float i, vec2 p){ int k=int(i+0.5); vec4 a; vec2 t;
    for(int j=0;j<20;j++){ if(j==k){ a=uA[j]; t=uT[j]; } }
    return vec2(a.x*p.x + a.z*p.y + t.x, a.y*p.x + a.w*p.y + t.y); }
  void main(){
    vec2 p = aW.x*xf(aB.x,aPos) + aW.y*xf(aB.y,aPos) + aW.z*xf(aB.z,aPos) + aW.w*xf(aB.w,aPos);
    vec3 c = uView * vec3(p,1.0);
    gl_Position = vec4(c.xy, 0.0, 1.0); vUV = aUV; }`;
  const FS = `precision mediump float; varying vec2 vUV; uniform sampler2D uTex; uniform vec4 uTint; uniform float uFlash; uniform float uAlpha;
  void main(){ vec4 c = texture2D(uTex, vUV); float l = dot(c.rgb, vec3(0.3,0.59,0.11)); c.rgb = mix(c.rgb, uTint.rgb*l*1.35, uTint.a); c.rgb += uFlash*c.a; gl_FragColor = c*uAlpha; }`;
  let gl, prog, loc = {};
  function init(canvas) {
    gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return false;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    gl.useProgram(prog);
    for (const n of ['aPos', 'aUV', 'aB', 'aW']) loc[n] = gl.getAttribLocation(prog, n);
    for (const n of ['uA', 'uT', 'uView', 'uTex', 'uTint', 'uFlash', 'uAlpha']) loc[n] = gl.getUniformLocation(prog, n);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    return true;
  }
  function tex(img) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function buf(data, T) { const b = gl.createBuffer(); gl.bindBuffer(T === Uint16Array ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER, b);
    gl.bufferData(T === Uint16Array ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER, new T(data), gl.STATIC_DRAW); return b; }
  const loadImg = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });

  async function load(name, base) {
    const R = await (await fetch(base + name + '.meta.json')).json();
    // maillage : intégré en base64 dans le .json (servi partout), sinon fichier .bin
    const bin = R.mesh ? Uint8Array.from(atob(R.mesh), c => c.charCodeAt(0)).buffer : await (await fetch(base + name + '.bin')).arrayBuffer();
    delete R.mesh;
    await Promise.all(R.layers.map(async L => {
      const img = await loadImg(base + L.tex); L.glTex = tex(img);
      const v = new Float32Array(bin, L.v_off, L.nv * 2);
      const bb = new Uint8Array(bin, L.b_off, L.nv * 4), ww = new Uint8Array(bin, L.w_off, L.nv * 4);
      const t = new Uint16Array(bin, L.t_off, L.nt);
      const uv = L.uv ? new Float32Array(L.uv) : Float32Array.from(v, (x, i) => i % 2 ? x / R.h : x / R.w);
      L.bPos = buf(v, Float32Array); L.bUV = buf(uv, Float32Array); L.bB = buf(Float32Array.from(bb), Float32Array);
      L.bW = buf(Float32Array.from(ww, x => x / 255), Float32Array); L.bI = buf(t, Uint16Array); L.count = L.nt;
    }));
    R.index = {}; R.bones.forEach((b, i) => R.index[b.n] = i);
    return R;
  }
  // pose : {bone:{r, x, y, sx, sy}} (rotation en radians, translation en px image)
  function matrices(R, pose) {
    const M = [];
    for (let i = 0; i < R.bones.length; i++) {
      const b = R.bones[i], p = pose[b.n] || {};
      const r = p.r || 0, c = Math.cos(r), s = Math.sin(r), sx = p.sx ?? 1, sy = p.sy ?? 1;
      // local = T(pivot+t) R S T(-pivot)
      const a = c * sx, bb = s * sx, cc = -s * sy, d = c * sy;
      const tx = b.x + (p.x || 0) - (a * b.x + cc * b.y), ty = b.y + (p.y || 0) - (bb * b.x + d * b.y);
      let m = [a, bb, cc, d, tx, ty];
      if (b.p >= 0) { const P = M[b.p]; m = [P[0]*m[0]+P[2]*m[1], P[1]*m[0]+P[3]*m[1], P[0]*m[2]+P[2]*m[3], P[1]*m[2]+P[3]*m[3], P[0]*m[4]+P[2]*m[5]+P[4], P[1]*m[4]+P[3]*m[5]+P[5]]; }
      M.push(m);
    }
    return M;
  }
  // transforme un point image au repos -> image posée (pour accrocher effets et boîtes)
  function point(M, R, boneName, x, y) { const m = M[R.index[boneName]]; return [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]]; }

  // view : matrice image->clip (2x3 + flip) calculée par le jeu
  function draw(R, M, view, opts = {}) {
    gl.useProgram(prog);
    const A = new Float32Array(80), T = new Float32Array(40);
    M.forEach((m, i) => { A.set([m[0], m[1], m[2], m[3]], i * 4); T.set([m[4], m[5]], i * 2); });
    gl.uniform4fv(loc.uA, A); gl.uniform2fv(loc.uT, T);
    gl.uniformMatrix3fv(loc.uView, false, view);
    gl.uniform4fv(loc.uTint, opts.tint || [0, 0, 0, 0]); gl.uniform1f(loc.uFlash, opts.flash || 0); gl.uniform1f(loc.uAlpha, opts.alpha ?? 1);
    for (const L of R.layers) {
      if (opts.only) { if (L.n !== opts.only) continue; }
      else if (L.overlay && !(opts.show && opts.show[L.n])) continue;
      if (opts.hide && opts.hide[L.n]) continue;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, L.glTex); gl.uniform1i(loc.uTex, 0);
      const at = (b, l, n) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0); };
      at(L.bPos, loc.aPos, 2); at(L.bUV, loc.aUV, 2); at(L.bB, loc.aB, 4); at(L.bW, loc.aW, 4);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, L.bI); gl.drawElements(gl.TRIANGLES, L.count, gl.UNSIGNED_SHORT, 0);
    }
  }
  // cinématique inverse : place l'extrémité (end, au repos) sur la cible (repère image posé)
  function ik(R, pose, upper, lower, end, target, bend = 0, keep) {
    const bu = R.bones[R.index[upper]], bl = R.bones[R.index[lower]];
    if (!bend) { const ex = end[0] - bu.x, ey = end[1] - bu.y, kx = bl.x - bu.x, ky = bl.y - bu.y; bend = (ex * ky - ey * kx) >= 0 ? 1 : -1; }
    const M = matrices(R, pose), pm = bu.p >= 0 ? M[bu.p] : [1, 0, 0, 1, 0, 0];
    const P1 = [pm[0] * bu.x + pm[2] * bu.y + pm[4], pm[1] * bu.x + pm[3] * bu.y + pm[5]];
    const L1 = Math.hypot(bl.x - bu.x, bl.y - bu.y), L2 = Math.hypot(end[0] - bl.x, end[1] - bl.y);
    let dx = target[0] - P1[0], dy = target[1] - P1[1], d = Math.hypot(dx, dy);
    const mx = (L1 + L2) * 0.999, mn = Math.abs(L1 - L2) + 1;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx } if (d < mn) { dx *= mn / (d || 1); dy *= mn / (d || 1); d = mn }
    const phi = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const t1 = phi + bend * al, K = [P1[0] + L1 * Math.cos(t1), P1[1] + L1 * Math.sin(t1)];
    const t2 = Math.atan2(P1[1] + dy - K[1], P1[0] + dx - K[0]);
    const rho = Math.atan2(pm[1], pm[0]), d1 = Math.atan2(bl.y - bu.y, bl.x - bu.x), d2 = Math.atan2(end[1] - bl.y, end[0] - bl.x);
    const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
    pose[upper] = Object.assign(pose[upper] || {}, { r: wrap(t1 - rho - d1) });
    pose[lower] = Object.assign(pose[lower] || {}, { r: wrap(t2 - t1 - (d2 - d1)) });
    if (keep) pose[keep] = Object.assign(pose[keep] || {}, { r: wrap(-(t2 - d2)) + (pose[keep] && pose[keep].extra || 0) });
    return pose;
  }
  function clear() { gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
  // matrice : image(px) -> monde(px écran 1920x1080) -> clip
  function viewMatrix(R, X, Y, scale, face, cam, W, H) {
    // image -> monde : x' = X + face*(x-gx)*scale ; y' = Y + (y-gy)*scale
    const gx = R.ground[0], gy = R.ground[1];
    let a = face * scale, tx = X - face * gx * scale, d = scale, ty = Y - gy * scale;
    // monde -> écran via caméra (zoom z autour de cx,cy) puis -> clip
    const z = cam.z, sx = 2 / W, sy = -2 / H;
    const A = a * z * sx, TX = ((tx - cam.cx) * z + W / 2 + cam.ox) * sx - 1;
    const D = d * z * sy, TY = ((ty - cam.cy) * z + H / 2 + cam.oy) * sy + 1;
    return new Float32Array([A, 0, 0, 0, D, 0, TX, TY, 1]);
  }
  return { init, load, matrices, point, draw, clear, viewMatrix, ik, get gl() { return gl } };
})();
