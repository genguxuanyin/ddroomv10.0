import {
  EventDispatcher
} from 'three'
import TYPES from '../types'
import {
  createPart
} from '../util'

export default class Part3D extends EventDispatcher {
  constructor(product3d, part) {
    super();
    this.product3d = product3d;
    this.manager3d = product3d.manager3d;
    this.part = part;
    this.properties = {};
    this.state = 0; // 0初始，1就绪，2错误，3删除
    var me = this;
    this._promise = new Promise((resolve, reject) => {
      var addMesh = () => {
        me.state = 1;
        resolve(me);
        me.removeEventListener(TYPES['add-mesh'], addMesh);
        me.removeEventListener(TYPES['load-error'], loadError);
        me.removeEventListener(TYPES['remove'], removePart);
      };
      var loadError = () => {
        me.state = 2;
        reject(me);
        me.removeEventListener(TYPES['add-mesh'], addMesh);
        me.removeEventListener(TYPES['load-error'], loadError);
        me.removeEventListener(TYPES['remove'], removePart);
      };
      var removePart = () => {
        me.state = 3;
        reject(me);
        me.removeEventListener(TYPES['add-mesh'], addMesh);
        me.removeEventListener(TYPES['load-error'], loadError);
        me.removeEventListener(TYPES['remove'], removePart);
      };
      me.addEventListener(TYPES['add-mesh'], addMesh);
      me.addEventListener(TYPES['load-error'], loadError);
      me.addEventListener(TYPES['remove'], removePart);
    })
  }
  init(part, onprogress) {
    this.part = part || this.part;
    var partModel = this.part.getModel();
    var parentGroup = this.product3d.getParentGroup(this.part);
    var me = this;
    var progress = 0;
    var total = this.part.getPartCount(true) + 1;
    this.manager3d.dispatchEvent({
      type: 'initPart3d',
      total: total,
      progress: progress,
      part3d: this
    });
    console.time('initPart3d(' + partModel.name + '[' + partModel.key + '])');
    var doProgress = () => {
      progress++;
      if (onprogress) {
        onprogress({
          type: 'initPart3d',
          total: total,
          progress: progress,
          part3d: me
        });
      }
      me.manager3d.dispatchEvent({
        type: 'initPart3d',
        total: total,
        progress: progress,
        part3d: me
      });
      if (progress >= total) {

      }
    };
    createPart(partModel, parentGroup, this.part.getProductKey(),
      (model, func) => { // checkCache
        return me.manager3d.checkCache(model, func);
      },
      (model, result) => { // onload
        let part3d;
        switch (result.type) {
          case 'part':
            if (model.key === partModel.key) {
              me._setPartGroup(result.group, result.hasMesh);
              if (result.hasMesh) {
                doProgress();
              }
            } else {
              part3d = me.product3d.getPart3dFromGroup(result.group);
              if (!part3d) {
                const curPart = me.product3d.getPartFromGroup(result.group);
                if (curPart) {
                  part3d = new Part3D(me.product3d, curPart);
                  part3d._setPartGroup(result.group, result.hasMesh);
                  if (result.hasMesh) {
                    // console.debug('initPart3d('+model.name+'['+model.key+']) finish.');
                    console.timeEnd('initPart3d(' + model.name + '[' + model.key + '])');
                    doProgress();
                  }
                }
              }
            }
            break;
          case 'partMesh':
            part3d = me.product3d.getPart3dFromGroup(result.group);
            if (part3d) {
              me.manager3d.dispatchEvent({
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
              if (model.key !== partModel.key) {
                // console.debug('initPart3d('+model.name+'['+model.key+']) finish.');
                console.timeEnd('initPart3d(' + model.name + '[' + model.key + '])');
              }
              doProgress();
            }
            break;
          case 'material':
            // console.debug('initPart3d('+model.name+'['+model.key+']) finish.');
            // console.timeEnd('initPart3d('+model.name+'['+model.key+'])');
            if (model.key === partModel.key) {
              me._setPartGroup(result.group, result.hasMesh);
              doProgress();
            } else {
              const curPart = me.product3d.getPart(model.key);
              if (curPart) {
                part3d = new Part3D(me.product3d, curPart);
                part3d._setPartGroup(result.group, result.hasMesh);
                doProgress();
              }
            }
            part3d = me.product3d.getPart3dFromGroup(result.parentGroup);
            if (part3d) {
              // part3d.updateMaterials(result.materials, result.materialConfigs, model);
            }
            break;
        }
      },
      (model, result) => { // onprogress
        if (result.xhr.lengthComputable) {
          if (result.type === 'part') {
            // var part3d = me.getPart3d(model.key);
            var percent = result.xhr.loaded / result.xhr.total * 100;
            var v = Math.round(percent, 2);
            if (onprogress) {
              onprogress({
                type: 'loadPartProgress',
                part3d: this,
                xhr: result.xhr,
                percent: v
              });
            } else {
              // console.debug( 'loadPartProgress('+model.name+'['+model.key+']): '+ v + '%');
            }
            me.manager3d.dispatchEvent({
              type: 'loadPartProgress',
              part3d: this,
              xhr: result.xhr,
              percent: v
            });
          }
        }
      },
      (model, result) => { // onerror
        if (result.type === 'part') {
          console.error('loadPartError(' + model.name + '[' + model.key + ']).');
          var part3d = me.getPart3d(model.key);
          part3d.dispatchEvent({
            type: 'loadError',
            part3d: this,
            xhr: result.xhr
          });
          me.manager3d.dispatchEvent({
            type: 'loadPartError',
            part3d: this,
            xhr: result.xhr
          });
        }
      }
    );
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
  getMeshArray(func) {
    var meshArray = null;
    switch (this.state) {
      case 1:
        meshArray = this.partGroup.children.filter(v => {
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
        this._promise.then((part3d) => {
          if (func) {
            meshArray = part3d.partGroup.children.filter(v => {
              return v.isMesh;
            });
            func(meshArray)
          }
        }, (part3d) => {
          if (func) {
            func(meshArray)
          }
        });
        break;
    }
    return meshArray;
  }
  getProductKey() {
    return this.product3d.getKey();
  }
  getProductName() {
    return this.product3d.getName();
  }
  getProductType() {
    return this.product3d.getType();
  }
  getProduct3d() {
    return this.product3d;
  }
  getProductGroup() {
    return this.product3d.getProductGroup();
  }
  getProduct() {
    return this.product3d.getProduct();
  }
  getParent() {
    return this.part.getParent();
  }
  getParent3d() {
    return this.product3d.getParent3d(this.part);
  }
  getParentGroup() {
    return this.product3d.getParentGroup(this.part);
  }
  getModel() {
    return this.part.getModel();
  }
  copyModel() {
    return this.part.copyModel();
  }
  getKey() {
    return this.part.getKey();
  }
  getAtt(url, isClone = false, _default = '') {
    this.part.getAtt(url, isClone, _default);
  }
  getPart() {
    return this.part;
  }
  getPartGroup() {
    return this.partGroup;
  }
  _setPartGroup(group, hasMesh) {
    this.partGroup = group;
    this.product3d.parts3d[this.getKey()] = this;
    if (this.part.isActive()) {
      this.product3d.solution3d.activeProduct = this.getProduct();
      this.product3d.solution3d.activeProduct3d = this.getProduct3d();
      this.product3d.solution3d.activePart = this.getPart();
      this.product3d.solution3d.activePart3d = this;
    }
    this.manager3d.dispatchEvent({
      type: 'addPart',
      part: this.part,
      part3d: this,
      partGroup: this.partGroup
    });
    if (hasMesh) {
      this.manager3d.dispatchEvent({
        type: 'addPartMesh',
        part: this.part,
        part3d: this,
        partGroup: this.partGroup
      });
      this.dispatchEvent({
        type: 'addMesh',
        part: this.part,
        part3d: this,
        partGroup: this.partGroup
      });
    }
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
  remove() {
    var model = this.part.getModel();
    if (model.parts && model.parts.length > 0) {
      var i; var partModel; var parts = [];
      for (i = 0; i < model.parts.length; i++) {
        partModel = model.parts[i];
        if (!partModel.disabled) {
          parts.push(partModel);
        }
      }
      for (i = 0; i < parts.length; i++) {
        this._removePart(parts[i]);
      }
    }
    var key = this.part.getKey();
    var parentGroup = this.product3d.getParentGroup(this.part);
    if (model.type === 'material') {
      // this.getParent3d().updateMaterials([], []);
    } else {
      parentGroup.remove(this.partGroup);
      this._disposeNode(this.partGroup);
    }
    delete this.product3d.parts3d[key];
    this.dispatchEvent({
      type: 'remove',
      part: this.getPart(),
      part3d: this
    });
    this.manager3d.scene3D.removeModelCtrl();
    this.manager3d.dispatchEvent({
      type: 'removePart',
      part: this.part,
      part3d: this,
      partGroup: this.partGroup
    });
  }
  _removePart(model) {
    if (model.parts && model.parts.length > 0) {
      var i; var partModel; var parts = [];
      for (i = 0; i < model.parts.length; i++) {
        partModel = model.parts[i];
        if (!partModel.disabled) {
          parts.push(partModel);
        }
      }
      for (i = 0; i < parts.length; i++) {
        this._removePart(parts[i]);
      }
    }
    if (model.type === 'material') {
      // this.updateMaterials([], []);
    }
    var partGroup = this.product3d.getPartGroup(model.key);
    if (partGroup) {
      partGroup.free();
    }
    delete this.product3d.parts3d[model.key];
  }
  /*
  updateMaterials(materials, materialConfigs) {
    var partModel = this.getModel();
    this.getMeshArray((meshArray) => {
      if (!(meshArray && meshArray.length)) return;
      for (var mi = 0; mi < meshArray.length; mi++) {
        const mesh = meshArray[mi];
        if (!mesh || mesh instanceof LineSegments) {
          continue;
        }
        var geometry = mesh.geometry;
        if (materialConfigs.length > 0) {
          var imgAtt = materialConfigs[0].textures[0].att;
          if (geometry.isGeometry &&
            geometry.imgAtt !== (imgAtt.width + '/' + imgAtt.height + '/' + partModel.textureDir) &&
            materialConfigs[0] &&
            materialConfigs[0].textures &&
            materialConfigs[0].textures[0].att) {
            ThreeUtil.calculateUvs(geometry, imgAtt, partModel.textureDir);
          }
        }

        var type = MaterialObjManager.freeMaterialObj(mesh.material);
        if (type === 1) {
          mesh.material = null;
          mesh.material = materials.length ? materials[materials.length - 1 >= mi ? mi : 0] : new MeshPhongMaterial({
            color: 0xffffff
          });
        } else if (type > 1) {
          mesh.material = [];
          mesh.material.push(materials.length ? materials[materials.length - 1 >= mi ? mi : 0] : new MeshPhongMaterial({
            color: 0xffffff
          }));
        }
        mesh.geometry.elementsNeedUpdate = true;
      }
    });
  } */
}
