import {
  Vector3,
  PerspectiveCamera,
  OrthographicCamera,
  Group
} from 'three'

const CONFIGS = [
  {
    name: '3d',
    type: 'perspective',
    fov: 60,
    near: 100,
    far: 200000,
    width: window.innerWidth,
    height: window.innerHeight,
    position: { x: 4000, y: 4000, z: 4000 },
    isDefault: true
  }, {
    name: 'fv',
    type: 'perspective',
    fov: 60,
    near: 100,
    far: 20000,
    width: window.innerWidth,
    height: window.innerHeight,
    position: { x: 0, y: 1700, z: 0 }
  }, {
    name: '2d',
    type: 'orthographic',
    near: 100,
    far: 20000,
    width: window.innerWidth,
    height: window.innerHeight,
    position: {
      x: 0,
      y: 5000,
      z: 0
    }
  }
];

export default class CameraManager {
  constructor(scene3d) {
    this.scene3d = scene3d;
    this.configs = CONFIGS || [];
    this.cameras = {};
    this.defCamera = null;
  }
  init() {
    this.configs.filter((v) => {
      return !v.disabled;
    }).forEach(v => {
      this.create(v);
    })
  }
  create(v) {
    let camera = null;
    switch (v.type.toLowerCase()) {
      case "perspective":
        camera = new PerspectiveCamera(v.fov, v.width / v.height, v.near, v.far);
        break;
      case "orthographic":
        camera = new OrthographicCamera(v.width / -2, v.width / 2, v.height / 2, v.height / -2, v.near, v.far);
        break;
    }
    if (v.name && !this.cameras[v.name]) {
      camera.name = v.name;
      this.cameras[v.name] = camera;
      this.setCamera(v.name, v);
      if (!this.defCamera || v.isDefault) {
        this.defCamera = camera;
      }
    } else {
      throw new Error('config.name must exist and be unique')
    }
  }
  add(config) {
    if (config.name && this.cameras[config.name]) {
      this.setCamera(config.name, config);
    } else {
      this.create(config);
      this.configs.push(config);
    }
  }
  remove(name) {
    const camera = this.cameras[name];
    if (camera) {
      Group.prototype.free(camera);
      const index = this.configs.findIndex((v) => {
        return v.name === name;
      })
      this.configs.splice(index, 1);
      delete this.cameras[name];
    }
  }
  getCamera(name) {
    return this.cameras[name];
  }
  setCamera(name, config) {
    const camera = this.cameras[name];
    if (camera) {
      for (const key in config) {
        switch (key) {
          case 'position':
            camera.position.set(config[key].x, config[key].y, config[key].z);
            break;
          case 'rotation':
            camera.rotation.set(
              config[key].x,
              config[key].y,
              config[key].z
            )
            break;
          case 'lookAt':
            camera.lookAt(
              new Vector3(
                config[key].x,
                config[key].y,
                config[key].z
              )
            )
            break;
          case 'up':
            camera.up.set(config[key].x, config[key].y, config[key].z);
            break;
        }
      }
    }
  }
  getDefCamera() {
    return this.defCamera;
  }
  setDefCamera(name) {
    const camera = this.cameras[name];
    if (camera) {
      this.defCamera = camera;
    } else {
      throw new Error(`Not found name is ${name}`)
    }
  }
  getConfig(name) {
    const result = this.configs.find((v) => {
      return v.name === name;
    })
    if (result && result.length > 0) {
      return result[0];
    }
    return null;
  }
  free() {
    for (const k in this.cameras) {
      Group.prototype.free(this.cameras[k]);
    }
    this.clear();
  }
  clear() {
    this.configs = [];
    this.cameras = {};
    this.defCamera = null;
  }
}
