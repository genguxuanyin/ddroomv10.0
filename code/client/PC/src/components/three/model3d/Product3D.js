import {
  EventDispatcher,
  Group
} from 'three'
import TYPES from '../types'
import * as Objects3d from '../objects3d/index'
import {
  fromStrToArray
} from '../util'

export default class Product3D extends EventDispatcher {
  constructor(solution3d, product, pproduct3d) {
    super();
    this.solution3d = solution3d;
    this.manager3d = solution3d.manager3d;
    this._pproduct3d = pproduct3d;
    this.product = product;
    this._products3d = {};
    this._product3dCount = 0;
    this._product3dArray = [];
    this.properties = {};
    this.state = 0; // 0初始，1就绪，2错误，3删除
    this._promise = new Promise((resolve, reject) => {
      var addMesh = () => {
        this.state = 1;
        resolve(this);
        this.removeEventListener(TYPES['mesh-add'], addMesh);
        this.removeEventListener(TYPES['load-error'], loadError);
        this.removeEventListener(TYPES['remove'], removeProduct);
      };
      var loadError = () => {
        this.state = 2;
        reject(this);
        this.removeEventListener(TYPES['mesh-add'], addMesh);
        this.removeEventListener(TYPES['load-error'], loadError);
        this.removeEventListener(TYPES['remove'], removeProduct);
      };
      var removeProduct = () => {
        this.state = 3;
        reject(this);
        this.removeEventListener(TYPES['mesh-add'], addMesh);
        this.removeEventListener(TYPES['load-error'], loadError);
        this.removeEventListener(TYPES['remove'], removeProduct);
      };
      this.addEventListener(TYPES['mesh-add'], addMesh);
      this.addEventListener(TYPES['load-error'], loadError);
      this.addEventListener(TYPES['remove'], removeProduct);
    })
  }
  init(product, onprogress) {
    this.product = product || this.product;
    var model = this.product.getModel();

    this.group = new Group();
    this.group.name = 'productGroup';
    this.group.userData.cl = 'P';
    this.group.userData.t = model.t;
    this.group.userData.k = this.product.getKey();
    model.p && this.group.position.set(...fromStrToArray(model.p)); // position 位置
    model.r && this.group.rotation.set(...fromStrToArray(model.r, Math.PI)); // rotation 旋转
    this.getParentGroup().add(this.group);

    var progress = 0;
    var total = this.product.getProductCount(true) + 1;
    this.doProgress = () => {
      progress++;
      if (onprogress) {
        onprogress({
          type: total === progress ? 'product3d-inited' : 'product3d-initing',
          total: total,
          progress: progress,
          product3d: this
        });
      }
      this.getParent3d().doProgress();
    };
    var OBJECT3D = Objects3d[model.t];
    if (OBJECT3D) {
      this.group.add(new OBJECT3D(this));
    } else {
      console.log(`Error, No Match constructor ${model.t}`);
    }
    /* var parentGroup = this.getParentGroup(this.product);
    var progress = 0;
    var total = this.product.getProductCount(true) + 1;
    this.manager3d.dispatchEvent({
      type: 'initProduct3d',
      total: total,
      progress: progress,
      product3d: this
    });
    console.debug('initProduct3d(' + model.n + '[' + model.k + ']) start...');
    console.time('initProduct3d(' + model.n + '[' + model.k + '])');
    var doProgress = () => {
      progress++;
      if (onprogress) {
        onprogress({
          type: 'initProduct3d',
          total: total,
          progress: progress,
          product3d: this
        });
      }
      this.manager3d.dispatchEvent({
        type: 'initProduct3d',
        total: total,
        progress: progress,
        product3d: this
      });
      if (progress >= total) {
        console.debug('initProduct3d(' + model.n + '[' + model.k + ']) finish.');
        console.timeEnd('initProduct3d(' + model.n + '[' + model.k + '])');
      }
    };
    createProduct(model, parentGroup, this.product.getProductKey(),
      (model, func) => { // checkCache
        return this.manager3d.checkCache(model, func);
      },
      (model, result) => { // onload
        let product3d;
        switch (result.type) {
          case 'product':
            if (model.k === model.k) {
              this._setProductGroup(result.group, result.hasMesh);
              if (result.hasMesh) {
                doProgress();
              }
            } else {
              product3d = this.product3d.getProduct3dFromGroup(result.group);
              if (!product3d) {
                const curProduct = this.product3d.getProductFromGroup(result.group);
                if (curProduct) {
                  product3d = new Product3D(this.product3d, curProduct);
                  product3d._setProductGroup(result.group, result.hasMesh);
                  if (result.hasMesh) {
                    // console.debug('initProduct3d('+model.n+'['+model.k+']) finish.');
                    console.timeEnd('initProduct3d(' + model.n + '[' + model.k + '])');
                    doProgress();
                  }
                }
              }
            }
            break;
          case 'productMesh':
            product3d = this.product3d.getProduct3dFromGroup(result.group);
            if (product3d) {
              this.manager3d.dispatchEvent({
                type: 'addProductMesh',
                product: product3d.getProduct(),
                product3d: product3d,
                productGroup: result.group
              });
              product3d.dispatchEvent({
                type: 'addMesh',
                product: product3d.getProduct(),
                product3d: product3d,
                productGroup: result.group
              });
              if (model.k !== model.k) {
                // console.debug('initProduct3d('+model.n+'['+model.k+']) finish.');
                console.timeEnd('initProduct3d(' + model.n + '[' + model.k + '])');
              }
              doProgress();
            }
            break;
          case 'material':
            // console.debug('initProduct3d('+model.n+'['+model.k+']) finish.');
            // console.timeEnd('initProduct3d('+model.n+'['+model.k+'])');
            if (model.k === model.k) {
              this._setProductGroup(result.group, result.hasMesh);
              doProgress();
            } else {
              const curProduct = this.product3d.getProduct(model.k);
              if (curProduct) {
                product3d = new Product3D(this.product3d, curProduct);
                product3d._setProductGroup(result.group, result.hasMesh);
                doProgress();
              }
            }
            product3d = this.product3d.getProduct3dFromGroup(result.parentGroup);
            if (product3d) {
              // product3d.updateMaterials(result.materials, result.materialConfigs, model);
            }
            break;
        }
      },
      (model, result) => { // onprogress
        if (result.xhr.lengthComputable) {
          if (result.type === 'product') {
            // var product3d = this.getProduct3d(model.k);
            var percent = result.xhr.loaded / result.xhr.total * 100;
            var v = Math.round(percent, 2);
            if (onprogress) {
              onprogress({
                type: 'loadProductProgress',
                product3d: this,
                xhr: result.xhr,
                percent: v
              });
            } else {
              // console.debug( 'loadProductProgress('+model.n+'['+model.k+']): '+ v + '%');
            }
            this.manager3d.dispatchEvent({
              type: 'loadProductProgress',
              product3d: this,
              xhr: result.xhr,
              percent: v
            });
          }
        }
      },
      (model, result) => { // onerror
        if (result.type === 'product') {
          console.error('loadProductError(' + model.n + '[' + model.k + ']).');
          var product3d = this.getProduct3d(model.k);
          product3d.dispatchEvent({
            type: 'loadError',
            product3d: this,
            xhr: result.xhr
          });
          this.manager3d.dispatchEvent({
            type: 'loadProductError',
            product3d: this,
            xhr: result.xhr
          });
        }
      }
    ); */
  }
  uninit() {
    const product3dArray = this.getProduct3dArray();
    const keys = product3dArray.map(p3d => p3d.getKey());
    keys.forEach(k => {
      this.removeProduct3d(this.getProduct3d(k), true, false);
    });
  }
  getState() {
    return this.state;
  }
  hasMesh() {
    return this.state === 1;
  }
  isReady(func) {
    switch (this.state) {
      case 1:
        if (func) {
          func(true);
        }
        return true;
      case 2:
      case 3:
        if (func) {
          func(false);
        }
        return false;
      default:
        this._promise.then(() => {
          if (func) {
            func(true);
          }
        }, () => {
          if (func) {
            func(false);
          }
        });
        return false;
    }
  }
  isRemoved() {
    return this.state === 3;
  }
  getMesh(func) {
    var result = this.getMeshArray((meshArray) => {
      if (func) {
        func((meshArray && meshArray.length > 0) ? meshArray[0] : null);
      }
    });
    return (result && result.length > 0) ? result[0] : null;
  }
  getKey() {
    return this.product.getKey();
  }
  getProductArray() {
    return this.product.getProductArray();
  }
  getProduct() {
    return this.product;
  }
  getMeshArray(func) {
    var meshArray = null;
    switch (this.state) {
      case 1:
        meshArray = this.group.children.filter(v => {
          return v.isMesh;
        });
        if (func) {
          func(meshArray);
        }
        break;
      case 2:
      case 3:
        if (func) {
          func(meshArray);
        }
        break;
      default:
        this._promise.then((product3d) => {
          if (func) {
            meshArray = product3d.group.children.filter(v => {
              return v.isMesh;
            });
            func(meshArray)
          }
        }, () => {
          if (func) {
            func(meshArray)
          }
        });
        break;
    }
    return meshArray;
  }
  getProduct3d(key) {
    return this._products3d[key];
  }
  getParent() {
    return this.product.getParent();
  }
  getParent3d() {
    return this._pproduct3d;
  }
  getParentGroup() {
    return this.getParent3d().getGroup();
  }
  getGroup() {
    return this.group;
  }
  getModel() {
    return this.product.getModel();
  }
  copyModel() {
    return this.product.copyModel();
  }
  getAtt(url, isClone = false, _default = '') {
    return this.product.getAtt(url, isClone, _default);
  }
  getProduct3dArray() {
    return this._product3dArray;
  }
  buildProduct3d(product, onprogress) {
    const product3d = new Product3D(this.solution3d, product, this);
    product3d.init(product, onprogress);
    this.addProduct3d(product3d, onprogress, true);
    return product3d;
  }
  addProduct3d(product3d, onprogress, isSelf, isSub) {
    if (product3d) {
      this._products3d[product3d.getKey()] = product3d;
      this._product3dCount++;
      var parent3d = this.getParent3d();
      parent3d.addProduct3d(product3d, onprogress, false, false);
      if (isSelf) {
        this._product3dArray.push(product3d);
        var subProduct = product3d.getProductArray();
        if (Array.isArray(subProduct) && subProduct.length > 0) {
          subProduct.forEach(p => {
            if (!p.di) {
              const subProduct3d = new Product3D(this.solution3d, p, product3d);
              this._products3d[p.getKey()] = subProduct3d;
              subProduct3d.init(p, onprogress);
              product3d.addProduct3d(subProduct3d, onprogress, true, true);
            }
          })
        }
      }
      this.manager3d.dispatchEvent({
        type: TYPES['product3d-add'],
        product3d: product3d,
        productGroup: product3d.getGroup()
      });
      return product3d;
    }
  }
  removeProduct3d(product3d, isSelf, isSub) {
    if (product3d) {
      var key = product3d.getKey();
      delete this._products3d[key];
      this._product3dCount--;
      var parent3d = this.getParent3d();
      parent3d.removeProduct3d(product3d, false, false);
      if (isSelf) {
        this._product3dArray.splice(this._product3dArray.indexOf(product3d), 1);
        product3d.uninit();
        product3d.getGroup().free();
        product3d.dispatchEvent({
          type: TYPES['remove'],
          product3d: product3d
        });
      }
      this.manager3d.dispatchEvent({
        type: TYPES['product3d-remove'],
        product3d: product3d
      });
      return product3d;
    }
  }
  moveTo(receiver3d) {
    var parent3d = this.getParent3d();
    if (parent3d !== receiver3d) {
      parent3d.removeProduct3d(this, true, false);
      receiver3d.buildProduct3d(this.product, null);
    }
  }
  _setProductGroup(group, hasMesh) {
    this.productGroup = group;
    this.product3d.products3d[this.getKey()] = this;
    if (this.product.isActive()) {
      this.product3d.solution3d.activeProduct = this.getProduct();
      this.product3d.solution3d.activeProduct3d = this.getProduct3d();
      this.product3d.solution3d.activeProduct = this.getProduct();
      this.product3d.solution3d.activeProduct3d = this;
    }
    this.manager3d.dispatchEvent({
      type: 'product3d-add',
      product: this.product,
      product3d: this,
      productGroup: this.productGroup
    });
    if (hasMesh) {
      this.manager3d.dispatchEvent({
        type: 'product3d-add-mesh',
        product: this.product,
        product3d: this,
        productGroup: this.productGroup
      });
      this.dispatchEvent({
        type: 'mesh-add',
        product: this.product,
        product3d: this,
        productGroup: this.productGroup
      });
    }
  }
  getProperty(k) {
    return this.properties[k];
  }
  setProperty(k, value) {
    this.properties[k] = value;
  }
  removeProperty(k) {
    delete this.properties[k];
  }
  clearProperty() {
    this.properties = {};
  }
  remove() {
    var parent3d = this.getParent3d();
    parent3d.removeProduct3d(this, true);
  }
  setProduct3dAtt(url) {
    var product = this.getProduct();
    var newValue = product.getAtt(url);
    var group = this.getGroup();
    switch (url) {
      case 'p': // position
        group.position.fromArray(fromStrToArray(newValue));
        break;
    }
  }
  isActive() {
    return this.product.isActive();
  }
}
