
import {
  GridHelper,
  Vector3,
  Mesh,
  PlaneGeometry,
  MeshPhongMaterial,
  Group
} from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

const CONFIGS = [
  {
    name: 'grid',
    type: 'grid',
    size: 25000,
    step: 50,
    centerColor: 0x409EFF,
    color: 0xffffff,
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    disabled: false
  },
  {
    name: 'skyBox',
    type: 'skyBox',
    effectController: {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      luminance: 1,
      inclination: -0.25, // elevation / inclination
      azimuth: 0.32, // Facing front,
      distance: 40000,
      sun: !true
    },
    disabled: false
  },
  {
    name: 'plane',
    type: 'plane',
    size: {
      width: 50000,
      length: 50000
    },
    rotation: {
      x: -Math.PI / 2,
      y: 0,
      z: 0
    },
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    matVisible: false,
    disabled: false
  }
];

export default class EnvManager {
  constructor(scene3d, group) {
    this.scene3d = scene3d;
    this.configs = CONFIGS || [];
    this.envs = {};
    this.group = group;
  }
  init() {
    this.configs.filter((v) => {
      return !v.disabled;
    }).forEach(v => {
      this.create(v);
    })
  }
  create(v) {
    let env = null
    switch (v.type) {
      case 'grid':
        env = new GridHelper(v.size, v.step, v.centerColor, v.color)
        break
      case 'skyBox':
        env = new Sky()
        env.scale.setScalar(45000)
        var uniforms = env.material.uniforms
        uniforms['turbidity'].value = v.effectController.turbidity
        uniforms['rayleigh'].value = v.effectController.rayleigh
        uniforms['mieCoefficient'].value =
          v.effectController.mieCoefficient
        uniforms['mieDirectionalG'].value =
          v.effectController.mieDirectionalG
        uniforms['luminance'].value = v.effectController.luminance

        var theta = Math.PI * (v.effectController.inclination - 0.5)
        var phi = 2 * Math.PI * (v.effectController.azimuth - 0.5)

        uniforms['sunPosition'].value.copy(
          new Vector3(
            v.effectController.distance * Math.cos(phi),
            v.effectController.distance * Math.sin(phi) * Math.sin(theta),
            v.effectController.distance * Math.sin(phi) * Math.cos(theta)
          )
        )
        break
      case 'plane':
        env = new Mesh(
          new PlaneGeometry(v.size.width, v.size.length),
          new MeshPhongMaterial({ visible: v.matVisible })
        )
    }
    if (v.name && !this.envs[v.name]) {
      env.name = v.name;
      this.envs[v.name] = env;
      this.setEnv(v.name, v);
      this.group.add(env);
    } else {
      throw new Error('item.name must exist and be unique')
    }
  }
  setEnv(name, config) {
    const env = this.envs[name];
    if (env) {
      for (const key in config) {
        switch (key) {
          case 'position':
            env.position.set(config[key].x, config[key].y, config[key].z);
            break;
          case 'rotation':
            env.rotation.set(config[key].x, config[key].y, config[key].z);
            break;
        }
      }
    }
  }
  getEnv(name) {
    return this.envs[name];
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
    this.envs = {};
  }
}
