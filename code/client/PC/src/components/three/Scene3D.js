import './extend/Group'
import {
  EventDispatcher,
  Scene,
  Group,
  Vector2,
  Raycaster,
  AxesHelper
} from 'three'
const CONFIG = {

}
import CameraManager from './manager/CameraManager'
import EnvManager from './manager/EnvManager'
import LightManager from './manager/LightManager'
import RendererManager from './manager/RendererManager'
import ControlManager from './manager/ControlManager'
import MaterialManager from './manager/MaterialManager'
import Stats from 'three/examples/jsm/libs/stats.module';
import TYPES from './types'
export default class Scene3D extends EventDispatcher {
  constructor() {
    const rootGroup = new Group();
    const lightGroup = new Group();
    const envGroup = new Group();
    const tempGroup = new Group();
    const ctrlGroup = new Group();
    rootGroup.name = 'rootGroup';
    lightGroup.name = 'lightGroup';
    envGroup.name = 'envGroup';
    tempGroup.name = 'tempGroup';
    ctrlGroup.name = 'ctrlGroup';
    super();
    this.config = CONFIG || {};
    this.rootGroup = rootGroup;
    this.lightGroup = lightGroup;
    this.envGroup = envGroup;
    this.tempGroup = tempGroup;
    this.ctrlGroup = ctrlGroup;
    this.canFindObj = false;
    this.reqId = null;
    this.view = '3d';
  }
  init() {
    this.scene = new Scene();
    this.scene.add(this.rootGroup);
    this.scene.add(this.lightGroup);
    this.scene.add(this.envGroup);
    this.scene.add(this.tempGroup);
    this.scene.add(this.ctrlGroup);

    var axesHelper = new AxesHelper(1000);
    this.scene.add(axesHelper);

    this.cameraManager = new CameraManager(this);
    this.cameraManager.init();

    this.envManager = new EnvManager(this, this.envGroup);
    this.envManager.init();

    this.lightManager = new LightManager(this, this.lightGroup);
    this.lightManager.init();

    this.rendererManager = new RendererManager(this);
    this.rendererManager.init();

    this.controlManager = new ControlManager(this, this.ctrlGroup);
    this.controlManager.init();

    this.materialManager = new MaterialManager(this);
    this.materialManager.init();

    this.rendererManager.addEventListener(TYPES['mousedown'], (ev) => {
      this._findObject(ev);
      this.dispatchEvent(ev);
    });
    this.rendererManager.addEventListener(TYPES['mouseup'], (ev) => {
      this._findObject(ev);
      this.dispatchEvent(ev);
    });
    this.rendererManager.addEventListener(TYPES['mousemove'], (ev) => {
      if (this.canFindObj) {
        this._findObject(ev);
      }
      this.dispatchEvent(ev);
    });

    this.renderer3d = this.rendererManager.getDefRenderer3D();
    this.size = this.renderer3d.getSize();
    this.ctrlScene = this.controlManager.ctrlScene;

    if (typeof x === "undefined") {
      this.stats = new Stats();
      var container = this.renderer3d.getContainer()
      container && container.appendChild(this.stats.dom);
    }

    this.dispatchEvent(TYPES['scene3d-init'], { scene3d: this });
    this.start();
  }
  refresh() {
    this.stats && this.stats.update();
    this.update();
    this.rendererManager.render();
  }
  update() {
    this.controlManager.update();
  }
  animate() {
    this.reqId = window.requestAnimationFrame(this.animate.bind(this));
    this.refresh();
  }
  start() {
    this.animate();
  }
  stop() {
    if (this.reqId !== undefined) {
      window.cancelAnimationFrame(this.reqId);
    }
  }
  to2d() {
    var oldView = this.getView();
    this.setView('2d');
    var renderer3d = this.rendererManager.getDefRenderer3D();
    if (renderer3d) {
      renderer3d.setCamera('2d');
    }
    oldView === 'fv' && this.controlManager.stopNavigator();
    this.controlManager.setCtrlScene({
      enabled: true,
      object: renderer3d.getCamera(),
      enableRotate: false
    });
  }
  to3d() {
    var oldView = this.getView();
    this.setView('3d');
    var renderer3d = this.rendererManager.getDefRenderer3D();
    if (renderer3d) {
      renderer3d.setCamera('3d');
    }
    oldView === 'fv' && this.controlManager.stopNavigator();
    this.controlManager.setCtrlScene({
      enabled: true,
      object: renderer3d.getCamera(),
      enableRotate: true
    });
  }
  toFv() {
    this.setView('fv');
    var renderer3d = this.rendererManager.getDefRenderer3D();
    if (renderer3d) {
      renderer3d.setCamera('fv');
    }
    this.controlManager.startNavigator();
    this.controlManager.setCtrlScene({ enabled: false });
  }
  setView(value) {
    this.view = value;
  }
  getView() {
    return this.view;
  }
  getMoveFindObj() {
    return this.canFindObj;
  }
  setMoveFindObj(value) {
    this.canFindObj = !!value;
  }
  _findObject(ev) {
    var oEvent = ev.event;
    if (oEvent.button === 0) {
      oEvent.preventDefault();
      var mouse = new Vector2();
      mouse.x = (oEvent.clientX / this.size.width) * 2 - 1;
      mouse.y = -(oEvent.clientY / this.size.height) * 2 + 1;
      var raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, this.renderer3d.getCamera());
      var intersects = raycaster.intersectObjects([this.rootGroup], true);
      if (intersects.length > 0) {
        console.log(intersects[0].face)
        this.dispatchEvent({ type: TYPES['find-object'], event: oEvent, intersect: intersects[0], intersects: intersects, renderer3d: ev.renderer3d });
      }
    }
  }
}
