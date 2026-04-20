// draw-primitives.js

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawHeart(ctx, x, y, size, fillColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 13, size / 13);

  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(0, 0, -9, 0, -9, 6);
  ctx.bezierCurveTo(-9, 12, 0, 16, 0, 18);
  ctx.bezierCurveTo(0, 16, 9, 12, 9, 6);
  ctx.bezierCurveTo(9, 0, 0, 0, 0, 6);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.restore();
}

export function drawHeartShape(ctx, x, y, size, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.globalAlpha = alpha;

  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-18, -12, -28, 10, 0, 30);
  ctx.bezierCurveTo(28, 10, 18, -12, 0, 8);
  ctx.closePath();

  ctx.fillStyle = "#ff4f8b";
  ctx.fill();

  ctx.restore();
}