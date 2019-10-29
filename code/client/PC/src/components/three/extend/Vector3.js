import { Vector3 } from 'three'
if (!Vector3.prototype.toFixed) {
  Object.defineProperty(Vector3.prototype, "toFixed", {
    writable: false,
    enumerable: false,
    configurable: true,
    value(fixed = 2) {
      this.x = parseFloat(this.x.toFixed(fixed))
      this.y = parseFloat(this.y.toFixed(fixed))
      this.z = parseFloat(this.z.toFixed(fixed))
      return this;
    }
  });
} else {
  throw Error("function Vector3.prototype.toFixed already existed ")
}
