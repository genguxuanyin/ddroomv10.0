import { Object3D, Group, Material, Texture } from 'three'

if (!Group.prototype.track && !Group.prototype.free) {
  Object.defineProperty(Group.prototype, "track", {
    writable: false,
    enumerable: false,
    configurable: true,
    value(resource, result) {
      if (!resource) {
        return resource;
      }
      // handle children and when material is an array of materials or
      // uniform is array of textures
      if (Array.isArray(resource)) {
        resource.forEach(r => this.track(r || null, result));
        return resource;
      }

      if (resource.dispose || resource instanceof Object3D) {
        result.add(resource);
      }
      if (resource instanceof Object3D) {
        this.track(resource.geometry || null, result);
        this.track(resource.material || null, result);
        this.track(resource.children || null, result);
      } else if (resource instanceof Material) {
        // We have to check if there are any textures on the material
        for (const value of Object.values(resource)) {
          if (value instanceof Texture) {
            this.track(value || null, result);
          }
        }
        // We also have to check if any uniforms reference textures or arrays of textures
        if (resource.uniforms) {
          for (const value of Object.values(resource.uniforms)) {
            if (value) {
              const uniformValue = value.value;
              if (uniformValue instanceof Texture ||
                Array.isArray(uniformValue)) {
                this.track(uniformValue || null, result);
              }
            }
          }
        }
      }
      return resource;
    }
  });

  Object.defineProperty(Group.prototype, "free", {
    writable: false,
    enumerable: false,
    configurable: true,
    value(resource = this) {
      let result = new Set();
      this.track(resource, result);
      for (const r of result) {
        if (r instanceof Object3D && r.parent) {
          r.parent.remove(r);
        }
        if (r.dispose) {
          r.dispose();
        }
      }
      result.clear();
      result = null;
    }
  });
} else {
  throw Error("function Group.prototype.track or Group.prototype.free already existed ")
}
