import Part3D from './Part3D'
import ThreeUtil from '../util/ThreeUtil'

export default class Product3D {
  constructor(solution3d, product) {
    this.solution3d = solution3d;
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
    this.solution3d.manager3d.dispatchEvent({
      type: 'initProduct3d',
      total: total,
      progress: progress,
      product3d: this
    });
    // console.debug('initProduct3d('+this.getName()+'['+this.getKey()+']) start...');
    console.time('initProduct3d(' + this.getName() + '[' + this.getKey() + '])');
    var doProgress = function() {
      progress++;
      if (onprogress) {
        onprogress({
          type: 'initProduct3d',
          total: total,
          progress: progress,
          product3d: me
        });
      }
      me.solution3d.manager3d.dispatchEvent({
        type: 'initProduct3d',
        total: total,
        progress: progress,
        product3d: me
      });
      if (progress >= total) {
        me.state = 'inited';
        // console.debug('initProduct3d('+me.getName()+'['+me.getKey()+']) finish.');
        console.timeEnd('initProduct3d(' + me.getName() + '[' + me.getKey() + '])');
      }
    };
    this.state = 'initing';
    ThreeUtil.createModel(this.product.getModel(),
      function(model, func) { // checkCache
        return me.solution3d.manager3d.checkCache(model, func);
      },
      function(model, result) { // onload
        let curPart, part3d;
        switch (result.type) {
          case 'product':
            me.solution3d.solutionGroup.add(result.group);
            me.productGroup = result.group;
            doProgress();
            break;
          case 'part':
            part3d = me.getPart3dFromGroup(result.group);
            if (!part3d) {
              curPart = me.getPartFromGroup(result.group);
              if (curPart) {
                // console.debug('initPart3d('+model.name+'['+model.key+']) start...');
                console.time('initPart3d(' + model.name + '[' + model.key + '])');
                part3d = new Part3D(me, curPart);
                part3d._setPartGroup(result.group, result.hasMesh);
                if (result.hasMesh) {
                  // console.debug('initPart3d('+model.name+'['+model.key+']) finish.');
                  console.timeEnd('initPart3d(' + model.name + '[' + model.key + '])');
                  doProgress();
                }
              }
            }
            break;
          case 'partMesh':
            // console.debug('initPart3d('+model.name+'['+model.key+']) finish.');
            // console.timeEnd('initPart3d('+model.name+'['+model.key+'])');
            part3d = me.getPart3dFromGroup(result.group);
            if (part3d) {
              me.solution3d.manager3d.dispatchEvent({
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
            // console.debug('initPart3d('+model.name+'['+model.key+']) finish.');
            curPart = me.getPart(model.key);
            if (curPart) {
              part3d = new Part3D(me, curPart);
              part3d._setPartGroup(result.group, result.hasMesh);
              doProgress();
            }
            part3d = me.getPart3dFromGroup(result.parentGroup);
            if (part3d) {
              part3d.updateMaterials(result.materials, result.materialConfigs, model);
            }
            break;
        }
      },
      function(model, result) { // onprogress
        if (result.xhr.lengthComputable) {
          var percent = result.xhr.loaded / result.xhr.total * 100;
          var v = Math.round(percent, 2);
          if (result.type === 'part') {
            var part3d = me.getPart3d(model.key);
            if (onprogress) {
              onprogress({
                type: 'loadPartProgress',
                part3d: part3d,
                xhr: result.xhr,
                percent: v
              });
            } else {
              // console.debug( 'loadPartProgress('+model.name+'['+model.key+']): '+ v + '% downloaded');
            }
            me.solution3d.manager3d.dispatchEvent({
              type: 'loadPartProgress',
              part3d: part3d,
              xhr: result.xhr,
              percent: v
            });
          } else if (result.type === 'product') {
            if (onprogress) {
              onprogress({
                type: 'loadProductProgress',
                products3d: me,
                xhr: result.xhr,
                percent: v
              });
            } else {
              // console.debug( 'loadProductProgress('+model.name+'['+model.key+']): '+ v + '% downloaded');
            }
            me.solution3d.manager3d.dispatchEvent({
              type: 'loadProductProgress',
              products3d: me,
              xhr: result.xhr,
              percent: v
            });
          }
        }
      },
      function(model, result) { // onerror
        me.state = 'error';
        if (result.type === 'part') {
          console.error('loadPartError(' + model.name + '[' + model.key + ']).');
          var part3d = me.getPart3d(model.key);
          part3d.dispatchEvent({
            type: 'loadError',
            part3d: part3d,
            xhr: result.xhr
          });
          me.solution3d.manager3d.dispatchEvent({
            type: 'loadPartError',
            part3d: part3d,
            xhr: result.xhr
          });
        } else if (result.type === 'product') {
          console.error('loadProductError(' + model.name + '[' + model.key + ']).');
          me.dispatchEvent({
            type: 'loadError',
            products3d: me,
            xhr: result.xhr
          });
          me.solution3d.manager3d.dispatchEvent({
            type: 'loadProductError',
            products3d: me,
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
  getProduct3dManager() {
    return this.getSolution3dManager();
  }
  getSolution3dManager() {
    return this.solution3d.manager;
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
  getName() {
    return this.product.getName();
  }
  getType() {
    return this.product.getType();
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
    var objs = [];
    for (var name in this.parts3d) {
      objs.push(this.parts3d[name].getPartGroup());
    }
    return objs;
  }
  getProperty(key) {
    return this.properties[key];
  }
  setProperty(key, value) {
    this.properties[key] = value;
  }
}
