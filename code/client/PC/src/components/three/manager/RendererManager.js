import {
  EventDispatcher,
  WebGLRenderer,
  PCFSoftShadowMap,
  Group,
  ReinhardToneMapping
} from 'three'
import TYPES from '../types';
const CONFIGS = [
  {
    name: 'defRender',
    id: 'three-view-container',
    antialias: true,
    clearColor: {
      color: 0x666666,
      alpha: 1
    },
    shadowMap: {
      soft: true,
      needsUpdate: true,
      disabled: false
    },
    shadowMapEnabled: true,
    physicallyCorrectLights: true,
    toneMapping: ReinhardToneMapping,
    gammaInput: true,
    gammaOutput: true,
    camera: '3d',
    isDefault: true,
    disabled: false
  }
];

export class Renderer3D extends EventDispatcher {
  constructor(manager, config) {
    super();
    this.manager = manager;
    this.scene3d = this.manager.scene3d;
    this.config = config || {};
    this.size = { x: 0, y: 0 };
  }
  init() {
    this.cameraName = this.config.camera;
    this.camera = this.scene3d.cameraManager.getCamera(this.cameraName);

    if (this.config.id) {
      this.container = document.getElementById(this.config.id);
      this.size.width = this.container.clientWidth;
      this.size.height = this.container.clientHeight;
      if (this.config.cameraScale) {
        this.camera.left = -(this.size.width * this.config.cameraScale) / 2;
        this.camera.right = (this.size.width * this.config.cameraScale) / 2;
        this.camera.top = (this.size.height * this.config.cameraScale) / 2;
        this.camera.bottom = -(this.size.height * this.config.cameraScale) / 2;
        this.camera.updateProjectionMatrix();
      }
      this.id = this.config.id;
    } else {
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
      this.size.width = window.innerWidth;
      this.size.height = window.innerHeight;
    }

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(this.config.clearColor.color, this.config.clearColor.alpha);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setClearAlpha(this.config.backgroundAlpha);

    this.renderer.shadowMap.enabled = this.config.shadowMap.enabled;
    this.renderer.shadowMap.needsUpdate = this.config.shadowMap.needsUpdate;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMapSoft = this.config.shadowMap.soft;

    this.container.appendChild(this.renderer.domElement);
    this.container.addEventListener('mousedown', (e) => {
      this.manager.dispatchEvent({ type: TYPES['mousedown'], event: e || event, renderer3d: this });
    });
    this.container.addEventListener('mouseup', (e) => {
      this.manager.dispatchEvent({ type: TYPES['mouseup'], event: e || event, renderer3d: this });
    });
    this.container.addEventListener('mousemove', (e) => {
      this.manager.dispatchEvent({ type: TYPES['mousemove'], event: e || event, renderer3d: this });
    });
    window.addEventListener('resize', (e) => {
      if (this.config.id) {
        this.container = document.getElementById(this.config.id);
        this.size.width = this.container.clientWidth;
        this.size.height = this.container.clientHeight;
      } else {
        this.size.width = window.innerWidth;
        this.size.height = window.innerHeight;
      }
      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.size.width, this.size.height);
    });
  }
  getName() {
    return this.config.name;
  }
  getScene3d() {
    return this.scene3d;
  }
  getCameraName() {
    return this.cameraName;
  }
  getCamera() {
    return this.camera;
  }
  getContainer() {
    return this.container;
  }
  setCamera(name) {
    var camera = this.scene3d.cameraManager.getCamera(name);
    if (camera !== this.camera) {
      this.oldCameraName = this.cameraName;
      this.cameraName = name;
      this.camera = camera;
      this.manager.dispatchEvent({ type: TYPES['camera-changed'], renderer3d: this });
    }
  }
  resetCamera(isFirst) {
    var name = isFirst ? this.config.camera : this.oldCameraName || this.config.camera;
    this.setCamera(name);
  }
  getSize() {
    return this.size;
  }
  render() {
    this.renderer.render(this.scene3d.scene, this.camera);
  }
}

export default class RendererManager extends EventDispatcher {
  constructor(scene3d) {
    super()
    this.scene3d = scene3d;
    this.renderers = {};
    this.configs = CONFIGS || [];
    this.defRenderer = null;
  }
  init() {
    this.configs.filter((v) => {
      return !v.disabled;
    }).forEach((v) => {
      this.create(v);
    })
  }
  create(v) {
    const renderer = new Renderer3D(this, v);
    if (renderer) {
      renderer.init();
      this.renderers[v.name] = renderer;
      if (!this.defRenderer || v.isDefault) {
        this.defRenderer = renderer;
      }
    }
  }
  add(config) {
    if (config.name && this.cameras[config.name]) {
      this.setRenderer(config.name, config);
    } else {
      this.create(config);
      this.configs.push(config);
    }
  }
  remove(name) {
    const renderer = this.renderers[name];
    if (renderer) {
      Group.prototype.free(renderer);
      const index = this.configs.findIndex((v) => {
        return v.name === name;
      })
      this.configs.splice(index, 1);
      delete this.renderers[name];
    }
  }
  getDefRenderer3D() {
    return this.defRenderer;
  }
  getRenderer3D(name) {
    return this.renderers[name];
  }
  setCamera(rname, cname) {
    this.renderers[rname].setCamera(cname);
  }
  setRenderer(name, config) {
    const renderer = this.renderer[name];
    if (renderer) {
      for (const key in config) {
        switch (key) {
          case 'position':
            break;
        }
      }
    }
  }
  render() {
    let renderer;
    for (const k in this.renderers) {
      renderer = this.renderers[k];
      renderer.render();
    }
  }
  clear() {
    this.configs = [];
    this.renderers = {};
  }
}
