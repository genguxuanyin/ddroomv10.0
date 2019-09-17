import Part3D from './Part3D'
import {
  createModel
} from '../util'

export default class Product3D {
  constructor(solution3d, product) {
    this.solution3d = solution3d;
    this.manager3d = solution3d.manager3d;
    this.product = product;
    this.parts3d = {};
    this.state = 'none';
    this.properties = {};
  }
  init(product, onprogress) {
    this.product = product || this.product;
    var me = this;
    var progress = 0;
    var total = this.product.getPartCount(true) + 1;
    this.manager3d.dispatchEvent({
      type: 'initProduct3d',
      total: total,
      progress: progress,
      product3d: this
    });
    // console.debug('initProduct3d('+this.getAtt('name')+'['+this.getKey()+']) start...');
    console.time('initProduct3d(' + this.getAtt('name') + '[' + this.getKey() + '])');
    var doProgress = () => {
      progress++;
      if (onprogress) {
        onprogress({
          type: 'initProduct3d',
          total: total,
          progress: progress,
          product3d: me
        });
      }
      this.manager3d.dispatchEvent({
        type: 'initProduct3d',
        total: total,
        progress: progress,
        product3d: me
      });
      if (progress >= total) {
        me.state = 'inited';
        console.timeEnd('initProduct3d(' + me.getAtt('name') + '[' + me.getKey() + '])');
      }
    };
    this.state = 'initing';
    createModel(this.product.getModel(),
      (model, func) => { // checkCache
        return this.manager3d.checkCache(model, func);
      },
      (model, result) => { // onload
        let curPart, part3d;
        switch (result.type) {
          case 'product':
            this.solution3d.solutionGroup.add(result.group);
            this.productGroup = result.group;
            doProgress();
            break;
          case 'part':
            part3d = this.getPart3dFromGroup(result.group);
            if (!part3d) {
              curPart = this.getPartFromGroup(result.group);
              if (curPart) {
                console.time('initPart3d(' + model.name + '[' + model.key + '])');
                part3d = new Part3D(this, curPart);
                part3d._setPartGroup(result.group, result.hasMesh);
                if (result.hasMesh) {
                  console.timeEnd('initPart3d(' + model.name + '[' + model.key + '])');
                  doProgress();
                }
              }
            }
            break;
          case 'partMesh':
            part3d = this.getPart3dFromGroup(result.group);
            if (part3d) {
              this.manager3d.dispatchEvent({
                type: 'addPartMesh',
                part: part3d.getPart(),
                part3d: part3d,
                partGroup: result.group
              });
              part3d.dispatchEvent({
                type: 'addMesh',
                part: part3d.getPart(),
                part3d: part3d,
                partGroup: result.group
              });
              doProgress();
            }
            break;
          case 'material':
            curPart = this.getPart(model.key);
            if (curPart) {
              part3d = new Part3D(this, curPart);
              part3d._setPartGroup(result.group, result.hasMesh);
              doProgress();
            }
            part3d = this.getPart3dFromGroup(result.parentGroup);
            if (part3d) {
              part3d.updateMaterials(result.materials, result.materialConfigs, model);
            }
            break;
        }
      },
      (model, result) => { // onprogress
        if (result.xhr.lengthComputable) {
          var percent = result.xhr.loaded / result.xhr.total * 100;
          var v = Math.round(percent, 2);
          if (result.type === 'part') {
            var part3d = this.getPart3d(model.key);
            if (onprogress) {
              onprogress({
                type: 'loadPartProgress',
                part3d: part3d,
                xhr: result.xhr,
                percent: v
              });
            }
            this.manager3d.dispatchEvent({
              type: 'loadPartProgress',
              part3d: part3d,
              xhr: result.xhr,
              percent: v
            });
          } else if (result.type === 'product') {
            if (onprogress) {
              onprogress({
                type: 'loadProductProgress',
                products3d: this,
                xhr: result.xhr,
                percent: v
              });
            }
            this.manager3d.dispatchEvent({
              type: 'loadProductProgress',
              products3d: this,
              xhr: result.xhr,
              percent: v
            });
          }
        }
      },
      (model, result) => { // onerror
        this.state = 'error';
        if (result.type === 'part') {
          console.error('loadPartError(' + model.name + '[' + model.key + ']).');
          var part3d = this.getPart3d(model.key);
          part3d.dispatchEvent({
            type: 'loadError',
            part3d: part3d,
            xhr: result.xhr
          });
          this.manager3d.dispatchEvent({
            type: 'loadPartError',
            part3d: part3d,
            xhr: result.xhr
          });
        } else if (result.type === 'product') {
          console.error('loadProductError(' + model.name + '[' + model.key + ']).');
          this.dispatchEvent({
            type: 'loadError',
            products3d: this,
            xhr: result.xhr
          });
          this.manager3d.dispatchEvent({
            type: 'loadProductError',
            products3d: this,
            xhr: result.xhr
          });
        }
      });
  }
  uninit() {
    this.state = 'uniniting';
    //
    this.state = 'uninited';
  }
  getSolution3DManager() {
    return this.manager3d;
  }
  getSolution3d() {
    return this.solution3d;
  }
  getState() {
    return this.state;
  }
  isIniting() {
    return this.state === 'initing';
  }
  isReady() {
    return this.state === 'inited';
  }
  getKey() {
    return this.product.getKey();
  }
  getAtt(url, isClone = false, _default = '') {
    this.product.getAtt(url, isClone, _default);
  }
  getProduct() {
    return this.product;
  }
  getPart(key) {
    return this.product.getPart(key);
  }
  getParts3d() {
    return this.parts3d;
  }
  getPart3d(key) {
    return this.parts3d[key];
  }
  getParent3d(part) {
    var parent = part.getParent();
    if (parent.getClass() === 'Part') {
      return this.getPart3d(parent.getKey());
    } else {
      return this;
    }
  }
  getProductGroup() {
    return this.productGroup;
  }
  getPartGroup(key) {
    var part3d = this.getPart3d(key);
    return part3d ? part3d.getPartGroup() : null;
  }
  getParentGroup(part) {
    var parent = part.getParent();
    if (parent.getClass() === 'Part') {
      return this.getPartGroup(parent.getKey());
    } else {
      return this.getProductGroup();
    }
  }
  getPartFromGroup(group) {
    return this.product.getPart(group.userData.key, true);
  }
  getPart3dFromGroup(group) {
    return this.getPart3d(group.userData.key);
  }
  addPart3d(part, onprogress) {
    var part3d = new Part3D(this, part);
    part3d.init(part, onprogress);
    return part3d;
  }
  removePart3d(part) {
    var part3d = this.getPart3d(part.getKey());
    if (part3d) {
      part3d.remove();
    }
    return part3d;
  }
  getPartGroupArray() {
    var partGroupArray = [];
    for (var key in this.parts3d) {
      partGroupArray.push(this.parts3d[key].getPartGroup());
    }
    return partGroupArray;
  }
  getProperty(key) {
    return this.properties[key];
  }
  setProperty(key, value) {
    this.properties[key] = value;
  }
  removeProperty(key) {
    delete this.properties[key];
  }
  clearProperty() {
    this.properties = {};
  }
}
