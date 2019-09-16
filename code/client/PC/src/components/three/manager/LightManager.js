import {
  AmbientLight,
  PointLight,
  DirectionalLight,
  HemisphereLight,
  Group
} from 'three'

const CONFIGS = [
  {
    name: "hl",
    type: "HemisphereLight",
    position: { x: 0, y: 1, z: 0 },
    skyColor: 0xaaaaff,
    groundColor: 0x806060,
    intensity: 0.2
  },
  {
    name: "dl",
    type: "DirectionalLight",
    position: { x: 1, y: 1, z: 1 },
    color: 0xffffff,
    intensity: 0.8
  }
];

export default class LightManager {
  constructor(scene3d, group) {
    this.scene3d = scene3d;
    this.configs = CONFIGS || [];
    this.lights = {};
    this.group = group;
  }
  init() {
    this.configs.filter((v) => {
      return !v.disabled;
    }).forEach(v => {
      this.create(v)
    })
  }
  create(config) {
    let light = null;
    switch (config.type.toLowerCase()) {
      case "ambient":
      case "ambientlight":
        light = new AmbientLight(config.color, config.intensity)
        break;
      case "point":
      case "pointlight":
        light = new PointLight(config.color, config.intensity, config.distance, config.decay)
        break;
      case "directional":
      case "directionallight":
        light = new DirectionalLight(config.color, config.intensity)
        break;
      case "hemisphere":
      case "hemispherelight":
        light = new HemisphereLight(config.skyColor, config.groundColor, config.intensity)
        break;
    }
    if (config.name && !this.configs[config.name]) {
      light.name = config.name;
      this.configs[config.name] = config;
      this.lights[config.name] = light;
      this.setLight(config.name, config);
      this.group.add(light);
    } else {
      throw new Error('config.name must exist and be unique')
    }
  }
  add(config) {
    if (config.name && this.lights[config.name]) {
      this.setLight(config.name, config)
    } else {
      this.create(config);
      this.configs.push(config);
    }
  }
  remove(name) {
    const light = this.lights[name];
    if (light) {
      Group.prototype.free(light)
      const index = this.configs.findIndex((v) => {
        return v.name === name;
      })
      this.configs.splice(index, 1);
      delete this.lights[name]
    }
  }
  getLight(name) {
    return this.lights[name];
  }
  setLight(name, config) {
    const light = this.lights[name];
    if (light) {
      for (const key in config) {
        switch (key) {
          case 'position':
            light.position.set(config[key].x, config[key].y, config[key].z);
            break;
          case 'target':
            light.target.set(
              config[key].x,
              config[key].y,
              config[key].z
            )
            break;
        }
      }
    }
  }
  getGroup() {
    return this.group;
  }
  free() {
    this.group.children.forEach(v => {
      Group.prototype.free(v)
    })
    this.clear();
  }
  clear() {
    this.configs = [];
    this.lights = {};
  }
}
