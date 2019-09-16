import {
  EventDispatcher,
  Shape,
  Vector3,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Mesh,
  MeshPhongMaterial,
  BoxGeometry,
  LineSegments
} from 'three'
import CommonUtil from '../util/CommonUtil'
import ThreeUtil from '../util/ThreeUtil'
import { MaterialObjManager } from '../three/Manager3D'
import ThreeBSP from '../../threejs/ThreeBSP'

export default class Part3D extends EventDispatcher {
  constructor(product3d, part) {
    super();
    this.product3d = product3d;
    this.part = part;
    this.properties = {};
    this.state = 0; // 0初始，1就绪，2错误，3删除
    var me = this;
    this._promise = new Promise(function(resolve, reject) {
      var addMesh = function() {
        me.state = 1;
        resolve(me);
        me.removeEventListener('addMesh', addMesh);
        me.removeEventListener('loadError', loadError);
        me.removeEventListener('remove', removePart);
      };
      var loadError = function() {
        me.state = 2;
        reject(me);
        me.removeEventListener('addMesh', addMesh);
        me.removeEventListener('loadError', loadError);
        me.removeEventListener('remove', removePart);
      };
      var removePart = function() {
        me.state = 3;
        reject(me);
        me.removeEventListener('addMesh', addMesh);
        me.removeEventListener('loadError', loadError);
        me.removeEventListener('remove', removePart);
      };
      me.addEventListener('addMesh', addMesh);
      me.addEventListener('loadError', loadError);
      me.addEventListener('remove', removePart);
    })
  }
  init(part, onprogress) {
    this.part = part || this.part;
    var partModel = this.part.getModel();
    var parentGroup = this.product3d.getParentGroup(this.part);
    var me = this;
    var progress = 0;
    var total = this.part.getPartCount(true) + 1;
    this.product3d.solution3d.manager3d.dispatchEvent({
      type: 'initPart3d',
      total: total,
      progress: progress,
      part3d: this
    });
    // console.debug('initPart3d('+partModel.name+'['+partModel.key+']) start...');
    console.time('initPart3d(' + partModel.name + '[' + partModel.key + '])');
    var doProgress = function() {
      progress++;
      if (onprogress) {
        onprogress({
          type: 'initPart3d',
          total: total,
          progress: progress,
          part3d: me
        });
      }
      me.product3d.solution3d.manager3d.dispatchEvent({
        type: 'initPart3d',
        total: total,
        progress: progress,
        part3d: me
      });
      if (progress >= total) {
        // console.debug('initPart3d('+partModel.name+'['+partModel.key+']) finish.');
        // console.timeEnd('initPart3d('+partModel.name+'['+partModel.key+'])');
      }
    };
    ThreeUtil.createPart(partModel, parentGroup, this.part.getProductKey(),
      function(model, func) { // checkCache
        return me.product3d.solution3d.manager3d.checkCache(model, func);
      },
      function(model, result) { // onload
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
              me.product3d.solution3d.manager3d.dispatchEvent({
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
              part3d.updateMaterials(result.materials, result.materialConfigs, model);
            }
            break;
        }
      },
      function(model, result) { // onprogress
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
            me.product3d.solution3d.manager3d.dispatchEvent({
              type: 'loadPartProgress',
              part3d: this,
              xhr: result.xhr,
              percent: v
            });
          }
        }
      },
      function(model, result) { // onerror
        if (result.type === 'part') {
          console.error('loadPartError(' + model.name + '[' + model.key + ']).');
          var part3d = me.getPart3d(model.key);
          part3d.dispatchEvent({
            type: 'loadError',
            part3d: this,
            xhr: result.xhr
          });
          me.product3d.solution3d.manager3d.dispatchEvent({
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
        this._promise.then(function() {
          if (func) {
            func(true);
          }
        },
        function() {
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
    var result = this.getMeshArray(function(meshArray) {
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
        meshArray = CommonUtil.getMeshArray(this.partGroup);
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
        this._promise.then(function(part3d) {
          if (func) {
            meshArray = CommonUtil.getMeshArray(part3d.partGroup);
            func(meshArray)
          }
        },
        function(part3d) {
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
  getName() {
    return this.part.getName();
  }
  getType() {
    return this.part.getType();
  }
  getcType() {
    return this.part.getcType();
  }
  getPlaces() {
    return this.part.getPlaces();
  }
  getPlaceTypes() {
    return this.part.getPlaceTypes();
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
    this.product3d.solution3d.manager3d.dispatchEvent({
      type: 'addPart',
      part: this.part,
      part3d: this,
      partGroup: this.partGroup
    });
    this.setPropertys();
    if (hasMesh) {
      this.product3d.solution3d.manager3d.dispatchEvent({
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
    this._checkRelation();
  }
  _checkRelation(parentGroup) {
    var ppart = this.part.getParentPart();
    if (!ppart) return;
    var ptype = ppart.getType();
    var place; var places = this.part.getPlaces();
    for (var i = 0; i < places.length; i++) {
      place = places[i];
      if (place.type === ptype) {
        switch (place.relation) {
          case 'subtract': // 减、补
            this._subtractRelation(parentGroup);
            break;
          case 'union': // 加、并
            break;
          case 'intersect': // 交
            break;
          default:
            // this._noneRelation();
            break;
        }
        break;
      }
    }
  }
  getProperty(key) {
    return this.properties[key];
  }
  setProperty(key, value) {
    this.properties[key] = value;
  }
  getPropertys() {
    return {
      key: this.getProperty('key'),
      type: this.getProperty('type'),
      cType: this.getProperty('cType'),
      menus: this.getProperty('menus'),
      path: this.getProperty('path'),
      width: this.getProperty('width'),
      height: this.getProperty('height'),
      direction: this.getProperty('direction'),
      points: this.getProperty('points'),
      angle: this.getProperty('angle'),
      size: this.getProperty('size')
    };
  }
  setPropertys() {
    var model = this.getModel();
    var baseModel = model.baseModel;
    this.setProperty('key', model.key);
    this.setProperty('type', model.type);
    this.setProperty('cType', model.cType);
    this.setProperty('menus', model.menus || []);
    this.setProperty('path', this.getVector3Path());
    this.setProperty('width', baseModel.width);
    this.setProperty('height', baseModel.height);
    this.setProperty('boardType', model.boardType);
    this.setProperty('direction', baseModel.direction ? {
      view: baseModel.direction.view,
      normal: {
        x: baseModel.direction.normal.x,
        y: baseModel.direction.normal.y,
        z: baseModel.direction.normal.z
      }
    } : {});
    this.setProperty('points', baseModel.points || []);
    this.setProperty('angle', baseModel.angle ? {
      x: baseModel.angle.x,
      y: baseModel.angle.y,
      z: baseModel.angle.z
    } : {
      x: 0,
      y: 0,
      z: 0
    });
    this.setProperty('size', model.size ? {
      d: model.size.d,
      w: model.size.w,
      h: model.size.h
    } : {
      d: 0,
      w: 0,
      h: 0
    });
  }
  removeProperty(key) {
    delete this.properties[key];
  }
  clearProperty() {
    this.properties = {};
  }
  _subtractRelation(parentGroup) {
    var parentPart = this.part.getParentPart();
    if (!parentPart) return;

    if (!parentGroup) {
      parentGroup = this.product3d.getPartGroup(parentPart.getKey());
      if (!parentGroup) return;
    }

    var ppart3d = this.product3d.getPart3dFromGroup(parentGroup);
    if (ppart3d) {
      var me = this;
      ppart3d.getMesh(function(mesh) {
        if (mesh) {
          me._subtractMesh(ppart3d, mesh);
          var matPart = parentPart.getMaterialPart();
          if (matPart) { me.product3d.solution3d.setPartMaterial(matPart); }
        }
      });
    }
  }
  _subtractMesh(parentPart3d, parentMesh) {
    var partModel = this.part.getModel();
    var partGroup = this.getPartGroup();
    var pos = this.part.getPosition();
    var mesh, width;
    if (partModel.type === 'hole' && partModel.baseModel.type === 'extrude') {
      var shape = new Shape();
      var data = partModel.baseModel.shape.data;
      if (partModel.baseModel.shape.type === 'circle') {
        shape.moveTo(data.radius, 0);
        shape.absarc(data.x, data.y, data.radius, data.startRad, data.endRad, data.anticlockwise);
      } else if (partModel.baseModel.shape.type === 'ellipse') {
        shape.moveTo(data.dis.x, 0);
        shape.absellipse(data.x, data.y, data.dis.x, data.dis.y, data.startRad, data.endRad, data.anticlockwise); // ellipse可以指定x轴半径和y轴半径
      } else if (partModel.baseModel.shape.type === 'rectangle') {
        shape.moveTo(data.dis.x, -data.dis.y);
        shape.lineTo(-data.dis.x, -data.dis.y);
        shape.lineTo(-data.dis.x, data.dis.y);
        shape.lineTo(data.dis.x, data.dis.y);
        shape.lineTo(data.dis.x, -data.dis.y);
      } else if (partModel.baseModel.shape.type === 'free') {
        var points = data.points;
        shape = new Shape();
        var c = points[0].c;
        shape.moveTo(points[0].point[c[0]], points[0].point[c[1]]);
        for (var i = 0; i < points.length; i++) {
          if (points[i].angle !== 0) {
            var p1;
            if (i === 0) {
              p1 = CommonUtil.transformVector3(points[points.length - 1].point);
            } else {
              p1 = CommonUtil.transformVector3(points[i - 1].point);
            }
            var p2 = CommonUtil.transformVector3(points[i].point);
            var angle = points[i].angle;
            var c = points[i].c;
            var ns = new Vector3(0, 0, 0);
            ns[c[0]] = c[0] === 'z' ? -1 : 1;
            var index0 = c[2] === 'z' ? 1 : -1;
            var _p1 = p1.clone().setZ(index0 * p1.z);
            var _p2 = p2.clone().setZ(index0 * p2.z);
            var parms = CommonUtil.calculateArc(_p1, _p2, ns, angle, c);
            var index1 = 1;
            var index2 = 1;
            c[0] === 'z' ? index1 = -1 : c[1] === 'z' ? index2 = -1 : '';
            shape.absarc(index1 * parms.x, index2 * parms.y, parms.radius, parms.strAngle, parms.endAngle, parms.type);
          } else {
            shape.lineTo(points[i].point[c[0]], points[i].point[c[1]]);
          }
        }
        shape.autoClose = true;
      }
      var path = CommonUtil.transformVector3(partModel.baseModel.path);
      var path = new CatmullRomCurve3(path);
      var extrudeSettings = {
        steps: partModel.baseModel.extrudeSettings.steps,
        curveSegments: partModel.baseModel.extrudeSettings.curveSegments,
        extrudePath: path
      };
      var geometry = new ExtrudeGeometry(shape, extrudeSettings);
      mesh = new Mesh(geometry, new MeshPhongMaterial({
        color: 0x000000
      }));
    } else {
      mesh = new Mesh(new BoxGeometry(partModel.size.w, partModel.size.h, partModel.size.d));
      mesh.position.set(pos.x, pos.y, pos.z);
    }
    if (!mesh) return;
    mesh.visible = false;
    mesh.userData.type = '_hole';
    var parentBSP = new ThreeBSP(parentMesh);
    var childBSP = new ThreeBSP(mesh);
    var finalBSP = parentBSP.subtract(childBSP);
    finalBSP = finalBSP.toMesh();
    parentMesh.geometry = finalBSP.geometry;

    parentMesh.geometry.computeFaceNormals();
    // 释放
    var _mesh; var meshArray = CommonUtil.getMeshArray(partGroup);
    for (var i = 0; i < meshArray.length; i++) {
      _mesh = meshArray[i];
      if (_mesh.userData.type === '_hole') {
        this._disposeNode(_mesh);
        partGroup.remove(_mesh);
        CommonUtil.disposeNode(_mesh);
      }
    }
    partGroup.add(mesh);
  }
  _noneRelation() {

  }
  remove() {
    var model = this.part.getModel();
    if (model.parts && model.parts.length > 0) {
      var i; var partModel; var parts = [];
      for (i = 0; i < model.parts.length; i++) {
        partModel = model.parts[i];
        if (partModel.enabled) {
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
      this.getParent3d().updateMaterials([], []);
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
    this.product3d.solution3d.manager3d.scene3D.removeModelCtrl();
    this.product3d.solution3d.manager3d.dispatchEvent({
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
        if (partModel.enabled) {
          parts.push(partModel);
        }
      }
      for (i = 0; i < parts.length; i++) {
        this._removePart(parts[i]);
      }
    }
    if (model.type === 'material') {
      this.updateMaterials([], []);
    }
    var partGroup = this.product3d.getPartGroup(model.key);
    if (partGroup) {
      this._disposeNode(partGroup);
    }
    delete this.product3d.parts3d[model.key];
  }
  _disposeNode(parentObject) {
    CommonUtil.disposeNode(parentObject);
  }
  getVector3Path() {
    var path = [];
    var model = this.part.getModel();
    if (model.baseModel.path) {
      path = CommonUtil.transformVector3(model.baseModel.path);
    }
    return path;
  }
  updateMaterials(materials, materialConfigs, model) {
    var me = this;
    var partModel = this.getModel();
    var material;
    this.getMeshArray(function(meshArray) {
      if (!(meshArray && meshArray.length)) return;
      for (var mi = 0; mi < meshArray.length; mi++) {
        const mesh = meshArray[mi];
        if (!mesh || mesh instanceof LineSegments) {
          continue;
        }
        var geometry = mesh.geometry;
        /*
				if(geometry.isBufferGeometry){
					geometry = new Geometry().fromBufferGeometry( mesh.geometry );
					mesh.geometry = geometry;
				}
				*/
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
  }
}
