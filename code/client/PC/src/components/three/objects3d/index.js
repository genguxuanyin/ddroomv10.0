import {
  Group
} from 'three';
import * as LoaderMesh from './Loader';
import * as CreateMesh from './Create';
import TYPES from '../types';

export class Create extends Group {
  constructor(product3d) {
    super();
    this.onLoad = (p) => {
      this.product3d.dispatchEvent({
        type: TYPES['mesh-add']
      });
      this.product3d.doProgress();
    }
    this.mt = product3d.getAtt('mt'); // mesh-type
    this.name = 'Create-' + this.mt;
    this.product3d = product3d;
    this.model = product3d.getModel();
    this.init();
  }
  init() {
    var em = null,
      mesh = null;
    var CREATE = CreateMesh['Create' + this.mt];
    if (CREATE) {
      em = new CREATE(this.model);
      mesh = em.create();
      if (Array.isArray(mesh)) {
        this.add(...mesh);
      } else {
        this.add(mesh);
      }
    }
    this.onLoad();
  }
}

export class Loader extends Group {
  constructor(product3d) {
    super();
    this.onLoad = (p) => {
      this.product3d.dispatchEvent({
        type: TYPES['mesh-add']
      });
      this.product3d.doProgress();
    }
    this.onProgress = (deci) => {
      console.log(deci);
    }
    this.onError = () => {
      this.product3d.dispatchEvent({
        type: TYPES['load-error']
      });
      var product = this.product3d.getProduct();
      product.remove();
    }
    this.mt = product3d.getAtt('mt'); // mesh-type
    this.name = 'Load-' + this.mt;
    this.product3d = product3d;
    this.model = product3d.getModel();
    this.init();
  }

  init() {
    var LOADER = LoaderMesh['load' + this.mt];
    if (LOADER) {
      LOADER(this.model.u, this.onProgress).then(({
        scene
      }) => {
        scene.scale.set(4, 4, 4);
        this.scene = scene;
        this.add(scene);
        this.onLoad(scene);
      }).catch((error) => {
        this.onError(error);
      })
    } else {
      this.onLoad();
    }
  }
}
