import {
  MeshPhongMaterial,
  MeshPhysicalMaterial
} from 'three'
import {
  isEqual
} from 'lodash'
import TextureManager from './TextureManager'

const textureManager = new TextureManager();
const CONFIGS = [
  {
    name: "def",
    type: "Phong",
    color: 0xF5F5F5
  },
  {
    name: "phy",
    type: "Physical",
    color: 0xF5F5F5
  }
];
import TYPES from '../types'
export default class MaterialManager {
  constructor(scene3d) {
    this.scene3d = scene3d;
    this.materialObjs = new Map();
    this.configs = CONFIGS || [];
  }
  init() {
    this.configs.filter((v) => {
      return !v.disabled;
    }).forEach(v => {
      this.create(v)
    })
  }
  create(config) {
    let material = null;
    switch (config.type.toLowerCase()) {
      case "phong":
        material = new MeshPhongMaterial();
        break;
      case "physical":
        material = new MeshPhysicalMaterial();
        break;
    }
    if (config.name && !this.getFromKey(config)) {
      var materialObj = {
        config,
        material,
        count: 0
      };
      material['refObj'] = materialObj;
      material.addEventListener(TYPES['material-remove'], this.remove.bind(this));
      this.materialObjs.set(config, materialObj);
      this.setMaterial(config);
      return materialObj;
    } else {
      throw new Error('config.name must exist and be unique')
    }
  }
  getFromKey(object) {
    for (var [key, value] of this.materialObjs) {
      if (isEqual(key, object)) {
        return value;
      }
    }
    return null;
  }
  add(config) {
    if (config.name && this.getFromKey(config)) {
      this.setMaterial(config)
      return this.getFromKey(config);
    } else {
      this.configs.push(config);
      return this.create(config);
    }
  }
  remove({ target: material }) {
    var refObj = material.refObj;
    var materialObj = this.getFromKey(refObj.config);
    if (materialObj) {
      materialObj.count--;
      if (materialObj.count <= 0) {
        this.materialObjs.delete(materialObj.config);
        this.configs = this.configs.filter((c) => {
          return !isEqual(c, materialObj.config);
        })
      }
    }
  }
  setMaterial(config) {
    var materialObj = this.getFromKey(config);
    if (materialObj) {
      var enclude = ['type'];// 排除的key
      var { material } = materialObj;
      for (const key in config) {
        if (material.hasOwnProperty(key) && !enclude.includes(key)) {
          if (/map$/i.test(key)) {
            material.setValues({ [key]: textureManager.getTexture(config[key]) });
          } else {
            material.setValues({ [key]: config[key] });
          }
        }
      }
      return materialObj;
    }
    return null;
  }
  /*
  @param config: string|array-string|array-object
  finally:
  [
    {
      name:'def',
      textures:[
        map:'/texture/1.jpg'
      ]
    },
    {
      name:'def',
      color:0x121212,
      textures:[
        map:'/texture/2.jpg'
      ]
    },
  ]
  */
  getMaterial(config) {
    if (typeof config === 'string') {
      config = [{ name: config }]
    } else if (Array.isArray(config)) {
      config = config.map((c) => {
        if (typeof c === 'string') {
          return { name: c }
        } else {
          return c;
        }
      })
    } else if (typeof config === 'object') {
      config = [config];
    }
    config = config.map((c) => {
      var cur = this.configs.find((v) => {
        return v.name === c.name;
      });
      if (typeof cur === 'undefined') {
        cur = {}
      }
      return Object.assign({}, cur, c);
    })
    var materials = [];
    config.forEach((c) => {
      var materialObj = this.getFromKey(c);
      if (!materialObj) {
        this.configs.push(c);
        materialObj = this.create(c);
      }
      materialObj.count++;
      materials.push(materialObj.material);
    })
    return materials;
  }
}
