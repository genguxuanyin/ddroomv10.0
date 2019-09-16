import {
  Vector3,
  Euler,
  EventDispatcher,
  Math as THREE_Math
} from 'three'
import { OrbitControls as OC } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

class OrbitControls extends OC {
  constructor(...arg) {
    super(...arg);
    // this.mouseButtons = { MIDDLE: MOUSE.ROTATE, RIGHT: MOUSE.PAN };
    this.setObject = (object) => {
      this.reset();
      this.object = object;
    };

    this.setTarget = (target) => {
      this.target = target;
    };
  }
}

const CONFIGS = [
  {
    name: 'ctrlScene',
    type: 'ctrlScene',
    zoomSpeed: 2,
    minDistance: 1000,
    maxDistance: 25000,
    enableDamping: true,
    screenSpacePanning: true,
    dampingFactor: 0.16,
    disabled: false
  }, {
    name: 'ctrlModel',
    type: 'ctrlModel',
    disabled: false
  }, {
    name: 'ctrlNavigator',
    type: 'ctrlNavigator',
    cameraName: 'fv',
    height: 0,
    jumpHeight: 1500,
    velocity: 200,
    gravity: 9.8,
    mass: 100
  }
];

class PointerLockControls extends EventDispatcher {
  constructor(camera, domElement) {
    super();
    this.domElement = domElement || document.body;
    this.enabled = false;
    this.isMouseDown = false;

    //
    // internals
    //

    var scope = this;

    var changeEvent = { type: 'change' };

    var euler = new Euler(0, 0, 0, 'YXZ');

    var PI_2 = Math.PI / 2;

    var vec = new Vector3();

    function onMouseDown(event) {
      if (scope.enabled === false) return;
      if (event.button === 1) {
        event.preventDefault();
        scope.isMouseDown = true;
      }
    }

    function onMouseMove(event) {
      if (scope.enabled === false || !scope.isMouseDown) return;

      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      euler.setFromQuaternion(camera.quaternion);

      euler.y -= movementX * 0.002;
      euler.x -= movementY * 0.002;

      euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));

      camera.quaternion.setFromEuler(euler);

      scope.dispatchEvent(changeEvent);
    }

    function onMouseUp() {
      if (scope.enabled === false) return;
      if (event.button === 1) {
        event.preventDefault();
        scope.isMouseDown = false;
      }
    }

    this.connect = () => {
      document.addEventListener('mousedown', onMouseDown, false);
      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
    };

    this.disconnect = () => {
      document.removeEventListener('mousedown', onMouseDown, false);
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
    };

    this.dispose = () => {
      this.disconnect();
    };

    this.getObject = () => { // retaining this method for backward compatibility
      return camera;
    };

    this.getDirection = (function() {
      var direction = new Vector3(0, 0, -1);
      return function(v) {
        return v.copy(direction).applyQuaternion(camera.quaternion);
      };
    })();

    this.moveForward = (distance) => {
      // move forward parallel to the xz-plane
      // assumes camera.up is y-up

      vec.setFromMatrixColumn(camera.matrix, 0);

      vec.crossVectors(camera.up, vec);

      camera.position.addScaledVector(vec, distance);
    };

    this.moveRight = (distance) => {
      vec.setFromMatrixColumn(camera.matrix, 0);

      camera.position.addScaledVector(vec, distance);
    };
  }
}

class Navigator {
  constructor(scene3d) {
    this.scene3d = scene3d;
    this.navigator = {};
  }
  init(config) {
    var me = this;
    this.config = config || {};
    this.camera = this.getCamera();
    if (this.camera) {
      this.navigator = {
        prevTime: performance.now(),
        velocity: new Vector3(),
        directionNormal: new Vector3(),
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        canJump: false
      };
      this.ctrlNavigator = new PointerLockControls(this.camera);
      const onKeyDown = (event) => {
        console.log(`keydown:${event.keyCode}`)
        if (!me.ctrlNavigator.enabled) {
          return;
        }
        switch (event.keyCode) {
          case 38: // up
          case 87: // w
            me.navigator.moveForward = true;
            break;
          case 37: // left
          case 65: // a
            me.navigator.moveLeft = true;
            break;
          case 40: // down
          case 83: // s
            me.navigator.moveBackward = true;
            break;
          case 39: // right
          case 68: // d
            me.navigator.moveRight = true;
            break;
          case 32: // space
            if (me.navigator.canJump) {
              me.navigator.velocity.y += me.config.jumpHeight;
            }
            me.navigator.canJump = false;
            break;
        }
      }
      const onKeyUp = (event) => {
        console.log(`keyup:${event.keyCode}`)
        if (!me.ctrlNavigator.enabled) {
          return;
        }
        switch (event.keyCode) {
          case 38: // up
          case 87: // w
            me.navigator.moveForward = false;
            break;
          case 37: // left
          case 65: // a
            me.navigator.moveLeft = false;
            break;
          case 40: // down
          case 83: // s
            me.navigator.moveBackward = false;
            break;
          case 39: // right
          case 68: // d
            me.navigator.moveRight = false;
            break;
        }
      }
      this.connect = () => {
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        // this.scene3d.addEventListener('keydown', onKeyDown);
        // this.scene3d.addEventListener('keyup', onKeyUp);
      };

      this.disconnect = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        // this.scene3d.removeEventListener('keydown', onKeyDown);
        // this.scene3d.removeEventListener('keyup', onKeyUp);
      };
    }
  }
  getCameraName() {
    return this.config.cameraName;
  }
  getCamera() {
    if (this.camera) {
      return this.camera;
    }
    return this.scene3d.cameraManager.getCamera(this.getCameraName());
  }
  getCtrlNavigator() {
    return this.ctrlNavigator;
  }
  update() {
    if (this.ctrlNavigator && this.ctrlNavigator.enabled) {
      if (this.navigator.moveForward || this.navigator.moveBackward || this.navigator.moveLeft || this.navigator.moveRight) {
        this._update();
      } else {
        this.navigator.prevTime = performance.now();
      }
      return true;
    }
    return false;
  }
  _update() {
    var time = performance.now();
    var delta = (time - this.navigator.prevTime) / 100;
    var velocity = this.navigator.velocity;
    velocity.x -= velocity.x * delta;
    velocity.z -= velocity.z * delta;
    velocity.y -= this.config.gravity * this.config.mass * delta; // 100.0 = mass

    var directionNormal = this.navigator.directionNormal;
    directionNormal.z = Number(this.navigator.moveForward) - Number(this.navigator.moveBackward);
    directionNormal.x = Number(this.navigator.moveRight) - Number(this.navigator.moveLeft);
    directionNormal.normalize(); // this ensures consistent movements in all directions

    if (this.navigator.moveForward || this.navigator.moveBackward) velocity.z -= directionNormal.z * 400.0 * delta;
    if (this.navigator.moveLeft || this.navigator.moveRight) velocity.x -= directionNormal.x * 400.0 * delta;

    this.ctrlNavigator.moveRight(-velocity.x * delta);
    this.ctrlNavigator.moveForward(-velocity.z * delta);
    var obj = this.ctrlNavigator.getObject();
    if (obj.position.y < 10) {
      velocity.y = 0;
      obj.position.y = this.config.height;
      this.navigator.canJump = true;
    }
    this.navigator.prevTime = time;
  }
  start() {
    this.connect();
    this.ctrlNavigator.enabled = true;
    this.ctrlNavigator.connect();
  }
  stop() {
    this.disconnect();
    this.ctrlNavigator.enabled = false;
    this.ctrlNavigator.dispose();
  }
}

export default class ControlManager {
  constructor(scene3d, group) {
    this.scene3d = scene3d;
    this.group = group;
    this.controls = {};
    this.configs = CONFIGS || [];
  }
  init() {
    this.configs.filter((v) => {
      return !v.disabled;
    }).forEach((v) => {
      this.create(v);
    });
  }
  create(v) {
    var renderer3d = this.scene3d.rendererManager.getDefRenderer3D();
    let ctrl = null;
    switch (v.type) {
      case 'ctrlScene':
        ctrl = new OrbitControls(renderer3d.getCamera(), renderer3d.renderer.domElement);
        ctrl.zoomSpeed = v.zoomSpeed;
        ctrl.minDistance = v.minDistance;
        ctrl.maxDistance = v.maxDistance;
        ctrl.enableDamping = v.enableDamping;
        ctrl.screenSpacePanning = v.screenSpacePanning;
        ctrl.dampingFactor = v.dampingFactor;
        break;
      case 'ctrlModel':
        ctrl = new TransformControls(renderer3d.getCamera(), renderer3d.renderer.domElement);
        ctrl.setRotationSnap(THREE_Math.degToRad(15));
        break;
      case 'ctrlNavigator':
        this.navigator = new Navigator(this.scene3d);
        this.navigator.init(v);
        ctrl = this.navigator.getCtrlNavigator();
        break;
    }
    ctrl.name = v.name;
    this[v.name] = ctrl;
    this.controls[v.name] = ctrl;
  }
  getCtrlFromName(name) {
    return this.controls[name];
  }
  addModelCtrl(partGroup) {
    if (partGroup) {
      this.ctrlModel.attach(partGroup);
      this.group.add(this.ctrlModel);
    }
  }
  removeModelCtrl() {
    const ctrlModel = this.getCtrlFromName('ctrlModel');
    if (ctrlModel) {
      ctrlModel.detach();
      this.group.remove(ctrlModel);
    }
  }
  setModelCtrlMode(type) {
    const ctrlModel = this.getCtrlFromName('ctrlModel');
    if (ctrlModel) {
      ctrlModel.setMode(type);// rotate,scale,translate
    }
  }
  update() {
    if (!this.navigator || !this.navigator.update()) {
      const ctrlScene = this.getCtrlFromName('ctrlScene');
      if (ctrlScene) {
        ctrlScene.update();
      }
    }
  }
  startNavigator() {
    const ctrlNavigator = this.getCtrlFromName('ctrlNavigator');
    if (ctrlNavigator && this.navigator) {
      this.navigator && this.navigator.start();
    }
  }
  stopNavigator() {
    const ctrlNavigator = this.getCtrlFromName('ctrlNavigator');
    if (ctrlNavigator && ctrlNavigator.enabled) {
      this.navigator && this.navigator.stop();
    }
  }
  setCtrlScene(objects) {
    const ctrlScene = this.getCtrlFromName('ctrlScene');
    if (ctrlScene) {
      for (const key in objects) {
        if (objects.hasOwnProperty(key)) {
          ctrlScene[key] = objects[key];
        }
      }
    }
  }
}
