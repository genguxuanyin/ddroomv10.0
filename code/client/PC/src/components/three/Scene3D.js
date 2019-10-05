import './extend/Group'
import {
  EventDispatcher,
  Scene,
  Group,
  Vector2,
  Raycaster,
  AxesHelper,
  Plane,
  Vector3,
  PlaneHelper
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
    const helpGroup = new Group();
    rootGroup.name = 'rootGroup';
    lightGroup.name = 'lightGroup';
    envGroup.name = 'envGroup';
    tempGroup.name = 'tempGroup';
    ctrlGroup.name = 'ctrlGroup';
    helpGroup.name = 'helpGroup';
    super();
    this.config = CONFIG || {};
    this.rootGroup = rootGroup;
    this.lightGroup = lightGroup;
    this.envGroup = envGroup;
    this.tempGroup = tempGroup;
    this.ctrlGroup = ctrlGroup;
    this.helpGroup = helpGroup;
    this.canFindObj = true;
    this.reqId = null;
    this.view = 'three';
    this.plane = new Plane(new Vector3(0, 1, 0), 0);
    this.planeState = false;
  }
  init() {
    this.scene = new Scene();
    this.scene.add(this.rootGroup); // 放置方案产品
    this.scene.add(this.lightGroup);
    this.scene.add(this.envGroup);
    this.scene.add(this.tempGroup);
    this.scene.add(this.ctrlGroup);
    this.scene.add(this.helpGroup);

    var axesHelper = new AxesHelper(1000);
    var planeHelper = new PlaneHelper(this.plane, 2000, 0xffff00);
    this.helpGroup.add(axesHelper);
    this.helpGroup.add(planeHelper);

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

    this.dispatchEvent({ type: TYPES['scene3d-init'], scene3d: this });
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
    this.setView('two');
    this.setPlaneState(true);
    var renderer3d = this.rendererManager.getDefRenderer3D();
    if (renderer3d) {
      renderer3d.setCamera('two');
    }
    oldView === 'fv' && this.controlManager.stopNavigator();
    this.controlManager.setCtrlScene({
      oldView,
      newView: 'two',
      enabled: true,
      object: renderer3d.getCamera(),
      enableRotate: false
    });
  }
  to3d() {
    var oldView = this.getView();
    this.setView('three');
    this.setPlaneState(false);
    var renderer3d = this.rendererManager.getDefRenderer3D();
    if (renderer3d) {
      renderer3d.setCamera('three');
    }
    oldView === 'fv' && this.controlManager.stopNavigator();
    this.controlManager.setCtrlScene({
      oldView,
      newView: 'three',
      enabled: true,
      object: renderer3d.getCamera(),
      enableRotate: true
    });
  }
  toFv() {
    this.setView('fv');
    this.setPlaneState(false);
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
  setPlane(...arg) {
    // .set ( normal : Vector3, constant : Float ) : Plane
    // .setComponents ( x : Float, y : Float, z : Float, w : Float ) : Plane
    // .setFromCoplanarPoints ( a : Vector3, b : Vector3, c : Vector3 ) : Plane
    // .setFromNormalAndCoplanarPoint ( normal : Vector3, point : Vector3 ) : Plane
    var fun = arg.shift();
    this.plane[fun](...arg);
  }
  setPlaneState(value) {
    this.planeState = value;
  }
  getObjectByName(name, recursive = false) {
    if (this.scene) {
      if (recursive) {
        return this.scene.getObjectByName(name);
      }
      var children = this.scene.children;
      for (let i = 0; i < children.length; i++) {
        const g = children[i];
        if (g.name === name) {
          return g;
        }
      }
      return null;
    } else {
      return this[name];
    }
  }
  getMoveFindObj() {
    return this.canFindObj;
  }
  setMoveFindObj(value) {
    this.canFindObj = !!value;
  }
  _findObject(ev) {
    var oEvent = ev.event;
    oEvent.preventDefault();
    if (oEvent.button === 0) {
      var mouse = new Vector2();
      mouse.x = (oEvent.clientX / this.size.width) * 2 - 1;
      mouse.y = -(oEvent.clientY / this.size.height) * 2 + 1;
      var raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, this.renderer3d.getCamera());
      if (this.planeState) {
        var intersect = new Vector3();
        raycaster.ray.intersectPlane(this.plane, intersect);
        if (intersect) {
          this.dispatchEvent({ type: TYPES['find-object'], event: oEvent, intersect: { point: intersect.round() }, renderer3d: ev.renderer3d });
        }
      } else {
        var intersects = raycaster.intersectObjects([this.rootGroup], true);
        if (intersects.length > 0) {
          this.dispatchEvent({ type: TYPES['find-object'], event: oEvent, intersect: intersects[0], intersects: intersects, renderer3d: ev.renderer3d });
        }
      }
    } else {
      this.dispatchEvent({ type: TYPES['find-object'], event: oEvent, renderer3d: ev.renderer3d });
    }
  }
}
