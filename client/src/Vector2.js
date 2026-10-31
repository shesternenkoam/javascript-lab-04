export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
  scale(scalar) { return new Vector2(this.x * scalar, this.y * scalar); }
  length() { return Math.hypot(this.x, this.y); }
  normalize() {
    const len = this.length();
    if (len === 0) return new Vector2(0, 0);
    return new Vector2(this.x / len, this.y / len);
  }
  clone() { return new Vector2(this.x, this.y); }
}