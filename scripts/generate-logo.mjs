import { createCanvas } from "@napi-rs/canvas";
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public");
mkdirSync(OUT_DIR, { recursive: true });

const W = 900;
const H = 900;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  deepBrown:  "#1e0f04",
  brown:      "#5c3d1e",
  midBrown:   "#7a4f28",
  gold:       "#c8922a",
  goldLight:  "#e8c060",
  goldDim:    "#8a6010",
  cream:      "#f5ead5",
  creamDark:  "#d4b87a",
  sage:       "#6b8c6e",
  sageDark:   "#3d5c40",
  sageLight:  "#9ab89d",
  rust:       "#b5451b",
  rustLight:  "#d4673a",
  rustDark:   "#7a2e10",
  moonGlow:   "#f0e8c0",
  starWhite:  "#fffde8",
  night1:     "#060e1c",
  night2:     "#0d1b2e",
  night3:     "#1a2d44",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function rg(x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  return g;
}
function lg(x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  return g;
}
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Arc-text convention:
//   angle = 0   → top    (x = cx,    y = cy - R)
//   angle = π/2 → right  (x = cx+R,  y = cy)
//   angle = π   → bottom (x = cx,    y = cy + R)
//
//   arcX(a) = cx + sin(a) * R
//   arcY(a) = cy - cos(a) * R
//   ctx.rotate(a) makes text tangent to circle, reading clockwise

// ── Badge geometry ────────────────────────────────────────────────────────────
const CX = W / 2;          // 450
const CY = H / 2 + 10;    // 460  (shifted slightly down for top-text room)
const BRX = 360;           // badge rx
const BRY = 390;           // badge ry

function badgePath() {
  ctx.beginPath();
  ctx.ellipse(CX, CY, BRX, BRY, 0, 0, Math.PI * 2);
  ctx.closePath();
}

// ── 1. Badge background ───────────────────────────────────────────────────────
// Outer gold glow
ctx.save();
badgePath();
ctx.shadowColor = C.gold;
ctx.shadowBlur = 30;
ctx.fillStyle = C.gold;
ctx.fill();
ctx.restore();

// Fill
ctx.save();
badgePath();
ctx.fillStyle = rg(CX, CY - 100, 40, BRY + 80, [
  [0,    "#3a1c08"],
  [0.45, "#241005"],
  [1,    "#130802"],
]);
ctx.fill();
ctx.restore();

// ── 2. Border rings ───────────────────────────────────────────────────────────
function ring(rx, ry, lw, color, dash = []) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(CX, CY, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  if (dash.length) ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

ring(BRX - 5,  BRY - 5,  11, C.gold);
ring(BRX - 14, BRY - 14,  2, C.goldLight);
ring(BRX - 22, BRY - 22,  1.5, C.goldDim, [7, 5]);
ring(BRX - 30, BRY - 30,  2, C.gold);
ring(BRX - 38, BRY - 38,  1, C.goldLight);

// Gold dots on outer ring
for (let i = 0; i < 24; i++) {
  const a = (i / 24) * Math.PI * 2;
  const dx = CX + Math.cos(a) * (BRX - 5);
  const dy = CY + Math.sin(a) * (BRY - 5);
  ctx.beginPath();
  ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = C.goldLight;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = C.gold;
  ctx.fill();
}

// ── 3. Wheat stalks ───────────────────────────────────────────────────────────
function wheatStalk(baseX, baseY, tiltAngle, sc = 1) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(tiltAngle);
  ctx.scale(sc, sc);

  // Stem
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(5, -55, 3, -120, 0, -205);
  ctx.strokeStyle = lg(0, 0, 0, -205, [
    [0,   C.goldDim],
    [0.5, C.gold],
    [1,   C.creamDark],
  ]);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Grain head
  const COUNT = 8;
  const GH = 10, GW = 5.5;
  for (let i = 0; i < COUNT; i++) {
    const gy = -205 + i * GH;
    const s = i % 2 === 0 ? 1 : -1;
    // Kernel
    ctx.save();
    ctx.translate(s * 8, gy);
    ctx.rotate(s * 0.38);
    const kg = rg(-1, -1, 0, GW, [
      [0, C.goldLight],
      [0.5, C.gold],
      [1, C.goldDim],
    ]);
    ctx.beginPath();
    ctx.ellipse(0, 0, GW, GH / 2 + 1, 0, 0, Math.PI * 2);
    ctx.fillStyle = kg;
    ctx.fill();
    ctx.strokeStyle = C.goldDim;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Awn
    ctx.beginPath();
    ctx.moveTo(s * 2, -GH / 2);
    ctx.lineTo(s * 6, -GH / 2 - 16);
    ctx.strokeStyle = C.creamDark;
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
    // Leaf
    if (i === 2 || i === 5) {
      ctx.save();
      ctx.translate(s * 2, gy + 3);
      ctx.rotate(s * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(s * 14, -5, s * 18, -16);
      ctx.quadraticCurveTo(s * 9, -10, 0, 0);
      ctx.fillStyle = C.sage;
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

// Left cluster
const leftBase = [[115,670],[126,660],[138,672],[148,658],[160,668]];
const leftAngles = [-0.52,-0.44,-0.36,-0.28,-0.20];
leftBase.forEach(([x,y],i)=>wheatStalk(x,y,leftAngles[i],0.92+i*0.03));

// Right cluster (mirror)
ctx.save(); ctx.translate(W,0); ctx.scale(-1,1);
leftBase.forEach(([x,y],i)=>wheatStalk(x,y,leftAngles[i],0.92+i*0.03));
ctx.restore();

// ── 4. Window ─────────────────────────────────────────────────────────────────
const WX = CX - 170;
const WY = 235;
const WW = 340;
const WH = 268;
const FRAME = 16;

// Glass – night sky
ctx.save();
rrect(WX + FRAME, WY + FRAME, WW - FRAME * 2, WH - FRAME * 2, 3);
ctx.clip();
ctx.fillStyle = lg(WX, WY, WX, WY + WH, [
  [0,   C.night1],
  [0.5, C.night2],
  [1,   C.night3],
]);
ctx.fillRect(WX, WY, WW, WH);

// Stars
const STARS = [
  [530,268,1.4,true], [492,278,1.0,false],[558,285,0.7,false],
  [472,257,1.1,true], [610,264,0.9,false],[542,308,0.7,false],
  [508,325,1.2,true], [576,295,0.6,false],[490,315,0.9,false],
  [635,282,1.0,true], [516,345,0.7,false],[462,332,0.8,false],
  [598,318,1.1,false],[552,272,0.6,false],[483,292,0.9,false],
  [465,270,0.5,false],[622,305,0.8,true], [505,355,0.6,false],
];
STARS.forEach(([sx,sy,sr,tw]) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fillStyle = tw ? C.goldLight : C.starWhite;
  ctx.shadowColor = tw ? C.goldLight : "rgba(255,253,200,0.6)";
  ctx.shadowBlur = tw ? 7 : 4;
  ctx.fill();
  ctx.restore();
});

// Moon
const MX = 614, MY = 300;
ctx.save();
ctx.shadowColor = "rgba(240,232,192,0.5)";
ctx.shadowBlur = 22;
ctx.beginPath();
ctx.arc(MX, MY, 27, 0, Math.PI * 2);
ctx.fillStyle = rg(MX - 7, MY - 7, 1, 27, [
  [0,   "#fff8e0"],
  [0.4, C.moonGlow],
  [0.8, "#d0ba80"],
  [1,   "#a89050"],
]);
ctx.fill();
// Craters
ctx.fillStyle = "rgba(150,130,80,0.22)";
[[MX+7,MY-5,4.5,3,-.3],[MX-5,MY+7,3.5,2.5,.5],[MX+1,MY+13,2.5,1.8,0]].forEach(([cx2,cy2,ex,ey,ang])=>{
  ctx.beginPath(); ctx.ellipse(cx2,cy2,ex,ey,ang,0,Math.PI*2); ctx.fill();
});
// Halo
ctx.beginPath();
ctx.arc(MX, MY, 58, 0, Math.PI * 2);
ctx.fillStyle = rg(MX, MY, 27, 58, [
  [0, "rgba(240,232,192,0.13)"],
  [1, "rgba(240,232,192,0)"],
]);
ctx.fill();
ctx.restore();
ctx.restore(); // end sky clip

// Wood frame
ctx.save();
const woodGrad = lg(WX, WY, WX+WW, WY+WH, [
  [0,   "#5c3420"],
  [0.3, "#7a4f28"],
  [0.6, "#5c3420"],
  [1,   "#3e2010"],
]);
rrect(WX, WY, WW, WH, 7);
ctx.strokeStyle = woodGrad;
ctx.lineWidth = FRAME;
ctx.stroke();
// Bevel
rrect(WX+FRAME/2-2, WY+FRAME/2-2, WW-FRAME+4, WH-FRAME+4, 5);
ctx.strokeStyle = "rgba(210,180,100,0.28)";
ctx.lineWidth = 2;
ctx.stroke();
// Mullions
const MUX = WX + WW / 2, MUY = WY + WH / 2;
ctx.strokeStyle = woodGrad;
ctx.lineWidth = FRAME - 4;
ctx.beginPath(); ctx.moveTo(MUX,WY); ctx.lineTo(MUX,WY+WH); ctx.stroke();
ctx.beginPath(); ctx.moveTo(WX,MUY); ctx.lineTo(WX+WW,MUY); ctx.stroke();
ctx.strokeStyle = "rgba(220,190,110,0.25)";
ctx.lineWidth = 1.5;
ctx.beginPath(); ctx.moveTo(MUX-1,WY); ctx.lineTo(MUX-1,WY+WH); ctx.stroke();
ctx.beginPath(); ctx.moveTo(WX,MUY-1); ctx.lineTo(WX+WW,MUY-1); ctx.stroke();
ctx.restore();

// ── 5. Windowsill ─────────────────────────────────────────────────────────────
const SILL_Y = WY + WH;
const SILL_H = 24;
const OVERHANG = 20;

ctx.save();
rrect(WX - OVERHANG, SILL_Y, WW + OVERHANG * 2, SILL_H, 3);
ctx.fillStyle = lg(WX-OVERHANG, SILL_Y, WX-OVERHANG, SILL_Y+SILL_H, [
  [0,   "#8a5c30"],
  [0.3, "#7a4f28"],
  [0.7, "#5c3420"],
  [1,   "#3e2210"],
]);
ctx.fill();
ctx.strokeStyle = C.goldDim;
ctx.lineWidth = 1;
ctx.stroke();
ctx.beginPath();
ctx.moveTo(WX-OVERHANG, SILL_Y+1.5);
ctx.lineTo(WX-OVERHANG+WW+OVERHANG*2, SILL_Y+1.5);
ctx.strokeStyle = "rgba(220,190,110,0.35)";
ctx.lineWidth = 1.5;
ctx.stroke();
ctx.restore();

// ── 6. Bread loaves ───────────────────────────────────────────────────────────
function loaf(lx, ly, lw, lh, tilt = 0) {
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(tilt);
  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, lw / 2, lh / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = rg(0, -lh*0.1, lh*0.04, lw*0.55, [
    [0,   "#d4855a"],
    [0.3, "#b8622e"],
    [0.6, "#8a4018"],
    [1,   "#5c2a0e"],
  ]);
  ctx.fill();
  // Score lines
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0,0,lw/2,lh/2,0,0,Math.PI*2); ctx.clip();
  ctx.strokeStyle = "rgba(70,25,8,0.45)";
  ctx.lineWidth = 1.8;
  [-1, 0, 1].forEach(i => {
    const ox = i * lw * 0.14;
    ctx.beginPath();
    ctx.moveTo(ox - lw*0.12, -lh*0.45);
    ctx.quadraticCurveTo(ox, -lh*0.08, ox + lw*0.12, lh*0.45);
    ctx.stroke();
  });
  ctx.restore();
  // Sheen
  ctx.beginPath(); ctx.ellipse(0,0,lw/2,lh/2,0,0,Math.PI*2);
  ctx.fillStyle = lg(-lw*0.2,-lh*0.5,lw*0.1,-lh*0.1,[
    [0,"rgba(255,200,130,0.3)"],
    [1,"rgba(255,200,130,0)"],
  ]);
  ctx.fill();
  // Edge
  ctx.beginPath(); ctx.ellipse(0,0,lw/2,lh/2,0,0,Math.PI*2);
  ctx.strokeStyle = "rgba(55,18,4,0.55)"; ctx.lineWidth = 2; ctx.stroke();
  // Steam
  [-1,0,1].forEach(i => {
    ctx.save(); ctx.translate(i*lw*0.14, -lh*0.5);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(7,-9,-7,-19,4,-30);
    ctx.strokeStyle="rgba(255,255,255,0.16)"; ctx.lineWidth=2; ctx.lineCap="round"; ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

loaf(CX + 86, SILL_Y - 10, 68, 48,  0.05);
loaf(CX,      SILL_Y - 13, 84, 52,  0);
loaf(CX - 84, SILL_Y - 10, 64, 44, -0.05);

// ── 7. Curtains ───────────────────────────────────────────────────────────────
function curtain(side) {
  const L = side === "left";
  const fd = L ? 1 : -1;
  const sx = L ? WX - FRAME/2 : WX + WW + FRAME/2;
  const fx = L ? sx + 65 : sx - 65;
  const ty = WY - 46;
  const by = SILL_Y + 16;

  ctx.save();
  const cg = lg(
    L ? sx : sx-65, ty, L ? sx+65 : sx, by,
    [
      [0,   L ? C.rust      : C.rustDark ],
      [0.4, L ? C.rustLight : C.rust     ],
      [0.7, L ? C.rust      : C.rustLight],
      [1,   L ? C.rustDark  : C.rust     ],
    ]
  );
  ctx.beginPath();
  ctx.moveTo(sx, ty);
  ctx.bezierCurveTo(sx+fd*18, ty+75, sx+fd*38, ty+150, fx, by);
  ctx.lineTo(sx, by);
  ctx.closePath();
  ctx.fillStyle = cg;
  ctx.fill();
  // Fold
  ctx.beginPath();
  ctx.moveTo(sx+fd*10, ty+18);
  ctx.bezierCurveTo(sx+fd*20, ty+75, sx+fd*28, ty+145, sx+fd*32, by);
  ctx.strokeStyle = L ? "rgba(210,100,60,0.38)" : "rgba(90,25,8,0.28)";
  ctx.lineWidth = 5; ctx.stroke();
  // Rod
  const ry = ty + 2;
  ctx.beginPath(); ctx.moveTo(sx-fd*10,ry); ctx.lineTo(sx+fd*76,ry);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 5.5; ctx.lineCap="round"; ctx.stroke();
  ctx.beginPath(); ctx.arc(sx+fd*76, ry, 6.5, 0, Math.PI*2);
  ctx.fillStyle = C.goldLight; ctx.fill();
  ctx.strokeStyle = C.goldDim; ctx.lineWidth = 1.5; ctx.stroke();
  // Tie-back ring
  ctx.beginPath(); ctx.arc(sx+fd*16, ty+162, 8, 0, Math.PI*2);
  ctx.fillStyle = C.goldLight; ctx.fill();
  ctx.strokeStyle = C.goldDim; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(sx+fd*16, ty+162, 4.5, 0, Math.PI*2);
  ctx.fillStyle = C.gold; ctx.fill();
  ctx.restore();
}
curtain("left");
curtain("right");

// ── 8. Scroll divider ─────────────────────────────────────────────────────────
function scrollDivider(y) {
  ctx.save();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(CX-195,y); ctx.lineTo(CX-68,y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(CX+68,y); ctx.lineTo(CX+195,y); ctx.stroke();
  // Left scroll
  ctx.beginPath();
  ctx.moveTo(CX-68,y);
  ctx.bezierCurveTo(CX-54,y-11,CX-44,y-11,CX-34,y);
  ctx.bezierCurveTo(CX-24,y+11,CX-14,y+7,CX,y);
  ctx.stroke();
  // Right scroll (mirror)
  ctx.save(); ctx.translate(CX*2,0); ctx.scale(-1,1);
  ctx.beginPath();
  ctx.moveTo(CX-68,y);
  ctx.bezierCurveTo(CX-54,y-11,CX-44,y-11,CX-34,y);
  ctx.bezierCurveTo(CX-24,y+11,CX-14,y+7,CX,y);
  ctx.stroke();
  ctx.restore();
  // Diamond end caps
  [CX-210, CX+210].forEach(dx => {
    ctx.save(); ctx.translate(dx,y); ctx.rotate(Math.PI/4);
    ctx.fillStyle = C.gold;
    ctx.beginPath(); rrect(-3.5,-3.5,7,7,1); ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}
scrollDivider(600);

// ── 9. Sage leaves on border ──────────────────────────────────────────────────
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  const lx = CX + Math.cos(a) * (BRX - 20);
  const ly = CY + Math.sin(a) * (BRY - 20);
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(a + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0,-9); ctx.bezierCurveTo(7,-4,7,4,0,9);
  ctx.bezierCurveTo(-7,4,-7,-4,0,-9);
  ctx.fillStyle = C.sage; ctx.fill();
  ctx.strokeStyle = C.sageDark; ctx.lineWidth = 0.7; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(0,9);
  ctx.strokeStyle = C.sageLight; ctx.lineWidth = 0.7; ctx.stroke();
  ctx.restore();
}

// ── 10. ARC TEXT ──────────────────────────────────────────────────────────────
// Convention: angle=0 → top, angle=π/2 → right, angle=π → bottom
// arcX(a) = CX + sin(a)*R,  arcY(a) = CY - cos(a)*R
// ctx.rotate(a) makes character tangent to arc (reading clockwise)

function drawArcText(text, R, centerAngle, fontSize, fontStr, fillColor, shadowColor, letterSpacing = 2) {
  ctx.save();
  ctx.font = `${fontStr} ${fontSize}px "Baskerville", "Didot", "Georgia", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Measure each character
  const chars = text.split("");
  const widths = chars.map(ch => ctx.measureText(ch).width + letterSpacing);
  const totalW = widths.reduce((a, b) => a + b, 0) - letterSpacing;
  const totalAngle = totalW / R;
  let currentAngle = centerAngle - totalAngle / 2;

  chars.forEach((ch, i) => {
    const charAngle = currentAngle + widths[i] / 2 / R;
    const px = CX + Math.sin(charAngle) * R;
    const py = CY - Math.cos(charAngle) * R;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(charAngle);
    // Shadow
    ctx.fillStyle = shadowColor;
    ctx.fillText(ch, 2, 2);
    // Fill
    ctx.fillStyle = fillColor;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    currentAngle += widths[i] / R;
  });
  ctx.restore();
}

// "SOUTHERN CRUST" along top arc, centered at angle=0 (top)
drawArcText(
  "SOUTHERN  CRUST",
  BRX - 48,     // radius — just inside the inner ring
  0,            // center at top
  34,
  "bold",
  C.goldLight,
  "rgba(0,0,0,0.55)",
  3.5
);

// "· EST. 2024 ·" along bottom arc, centered at angle=π (bottom)
// Iterate right-to-left (decreasing angle) so text reads left→right visually.
// Rotation = charAngle - π keeps each character upright.
function drawBottomArcText(text, R, fontSize, fillColor) {
  ctx.save();
  ctx.font = `italic ${fontSize}px "Baskerville", "Georgia", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const chars = text.split("");
  const LS = 1.5;
  const widths = chars.map(ch => ctx.measureText(ch).width + LS);
  const totalW = widths.reduce((a, b) => a + b, 0) - LS;
  const totalAngle = totalW / R;

  // Start from left of bottom arc (π + half) and decrease angle rightward
  let currentAngle = Math.PI + totalAngle / 2;

  chars.forEach((ch, i) => {
    const charAngle = currentAngle - widths[i] / 2 / R;
    const px = CX + Math.sin(charAngle) * R;
    const py = CY - Math.cos(charAngle) * R;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(charAngle - Math.PI);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillText(ch, 1, -1);
    ctx.fillStyle = fillColor;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    currentAngle -= widths[i] / R;
  });
  ctx.restore();
}

drawBottomArcText("· EST. 2024 ·", BRX - 50, 22, C.creamDark);

// ── 11. Tagline ───────────────────────────────────────────────────────────────
// "Love in Every Loaf" — centered, italic, between scroll and bottom arc text
ctx.save();
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = `italic 25px "Baskerville", "Didot", "Georgia", serif`;
ctx.fillStyle = "rgba(0,0,0,0.45)";
ctx.fillText("Love in Every Loaf", CX + 1.5, 636 + 1.5);
ctx.fillStyle = C.cream;
ctx.fillText("Love in Every Loaf", CX, 636);

// Sage rule lines
ctx.strokeStyle = C.sage; ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(CX-225,636); ctx.lineTo(CX-125,636); ctx.stroke();
ctx.beginPath(); ctx.moveTo(CX+125,636); ctx.lineTo(CX+225,636); ctx.stroke();
ctx.fillStyle = C.sageLight;
ctx.beginPath(); ctx.arc(CX-125,636,3,0,Math.PI*2); ctx.fill();
ctx.beginPath(); ctx.arc(CX+125,636,3,0,Math.PI*2); ctx.fill();
ctx.restore();

// ── 12. Vignette ──────────────────────────────────────────────────────────────
ctx.save();
badgePath(); ctx.clip();
ctx.fillStyle = rg(CX, CY, 180, BRX + 60, [
  [0,   "rgba(0,0,0,0)"],
  [0.65,"rgba(0,0,0,0)"],
  [1,   "rgba(0,0,0,0.5)"],
]);
ctx.fillRect(0, 0, W, H);
ctx.restore();

// ── 13. Export ────────────────────────────────────────────────────────────────
const buf = canvas.toBuffer("image/png");
writeFileSync(join(OUT_DIR, "logo.png"), buf);

await Promise.all([
  // 2× retina
  sharp(buf)
    .resize(1800, 1800, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 8 })
    .toFile(join(OUT_DIR, "logo@2x.png")),
  // Favicon – 64×64 (browsers scale down to 32)
  sharp(buf)
    .resize(64, 64, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT_DIR, "favicon.png")),
]);

console.log("Done →");
console.log("  public/logo.png      (900×900)");
console.log("  public/logo@2x.png   (1800×1800)");
console.log("  public/favicon.png   (64×64)");
