import Product3D from './Product3D'
import CommonUtil from '../util/CommonUtil'
import ThreeUtil from '../util/ThreeUtil'
import {
  Group,
  Scene,
  Vector3,
  BoxGeometry,
  LineSegments,
  BoxHelper
} from 'three'

export default class Solution3D {
  constructor(manager3d, solution) {
    this.manager3d = manager3d;
    this.solution = solution;
    this.products3d = {};
    this.state = 'none';
  }
  init(solution, onprogress) {
    this.solution = solution || this.solution;

    this.solutionGroup = new Group();
    this.solutionGroup.userData.type = 'Solution';
    this.solutionGroup.userData.key = this.solution.getKey();
    this.manager3d.rootGroup.add(this.solutionGroup);

    let product; const products = this.solution.getProductArray();
    for (let i = 0; i < products.length; i++) {
      product = products[i];
      if (product.isEnabled()) {
        this.addProduct3d(product, onprogress);
      }
    }
  }
  uninit() {
    this.state = 'uniniting';
    //
    this.state = 'uninited';
  }
  getKey() {
    return this.solution.getKey();
  }
  getSolution() {
    return this.solution;
  }
  getSolutionGroup() {
    return this.solutionGroup;
  }
  getActiveProduct3d() {
    return this.activeProduct3d;
  }
  setActiveProduct3d(product) {
    if (product) {
      const product3d = this.getProduct3d(product.getKey());
      if (product3d !== this.activeProduct3d) {
        this.manager3d.dispatchEvent({
          type: 'activeProductChanged',
          oldProduct: this.activeProduct,
          oldProduct3d: this.activeProduct3d,
          newProduct: product3d ? product3d.getProduct() : null,
          newProduct3d: product3d
        });
        this.activeProduct3d = product3d;
        this.activeProduct = product3d ? product3d.getProduct() : null;
      }
    }
  }
  getActiveProduct() {
    return this.activeProduct;
  }
  getActiveProductGroup() {
    var product3d = this.getActiveProduct3d();
    return product3d ? product3d.getProductGroup() : null;
  }
  getActivePart3d() {
    return this.activePart3d;
  }
  setActivePart3d(part) {
    const part3d = part ? this.getPart3dFromPart(part) : null;
    if (part3d) {
      this.setActiveProduct3d(part.getProduct());
      this.activePart3d = part3d;
      this.activePart = part3d.getPart();
    } else {
      this.activePart3d = null;
      this.activePart = null;
    }
  }
  getActivePart() {
    return this.activePart;
  }
  getActivePartGroup() {
    var part3d = this.getActivePart3d();
    return part3d ? part3d.getPartGroup() : null;
  }
  addProduct3d(product, onprogress) {
    if (product) {
      const product3d = new Product3D(this);
      this.products3d[product.getKey()] = product3d;
      product3d.init(product, onprogress);
      this.manager3d.dispatchEvent({
        type: 'addProduct',
        product: product,
        product3d: product3d,
        productGroup: product3d.getProductGroup()
      });
      return product3d;
    }
  }
  removeProduct3d(product) {
    if (product) {
      const key = product.getKey();
      const product3d = this.getProduct3d(key);
      if (product3d) {
        product3d.uninit();
        delete this.products3d[key];
        const productGroup = product3d.getProductGroup();
        this.solutionGroup.remove(productGroup);

        CommonUtil.disposeNode(productGroup);

        if (product.isActive()) {
          this.manager3d.scene3D.removeModelCtrl();
        }
        this.manager3d.dispatchEvent({
          type: 'removeProduct',
          product: product,
          product3d: product3d,
          productGroup: productGroup
        });
        return product3d;
      }
    }
  }
  addPart3d(part, onprogress) {
    if (part) {
      const product3d = this.getProduct3d(part.getProductKey());
      if (product3d) {
        product3d.addPart3d(part, onprogress);
      }
    }
  }
  removePart3d(part) {
    if (part) {
      const product3d = this.getProduct3d(part.getProductKey());
      if (product3d) {
        product3d.removePart3d(part);
      }
    }
  }
  movePart3d(part, sender, receiver) {
    var me = this;
    var part3d = this.getPart3dFromPart(part);
    var partGroup = part3d.getPartGroup();
    var receiverGroup, senderGroup;
    if (sender.getClass() === 'Part') {
      senderGroup = this.getGroupFromPart(sender);
    } else {
      senderGroup = this.getProductGroup(sender.getKey());
    }

    if (receiver.getClass() === 'Part') {
      receiverGroup = this.getGroupFromPart(receiver);
      var pos = part.getPosition();
      if (pos) {
        partGroup.position.set(pos.x, pos.y, pos.z);
      }
      receiverGroup.add(partGroup);
      // senderGroup.remove(partGroup);
      part3d._checkRelation(receiverGroup);
    } else {
      receiverGroup = this.getProductGroup(receiver.getKey());
      receiverGroup.add(partGroup);
      // senderGroup.remove(partGroup);
      var type = this.getPart3dFromGroup(senderGroup).getProperty('type');
      if (type === 'board' || type === 'section') {
        var ppart = this.getPartFromGroup(senderGroup);
        var me = this;
        var temp = [];
        for (var i = 0; i < senderGroup.children.length; i++) {
          var group = senderGroup.children[i];
          var userData = group.userData;
          var part3d = this.getPart3dFromGroup(group);
          var type, cType;
          if (part3d) {
            type = part3d.getProperty('type');
            cType = part3d.getcType();
          }
          if ((type === 'stickLine' || type === 'topLine') && cType === 'side') {
            var cPart = this.getPart(userData.productKey, userData.key);
            temp.push(cPart);
          }
        }
        for (var j = 0; j < temp.length; j++) {
          var model = temp[j].getModel();
          temp[j].remove();
          ppart.buildPart(model);
        }
        if (type === 'board') {
          ThreeUtil.createCuboidModel(ppart.getModel().baseModel, function(mesh) {
            var senderMesh = CommonUtil.getMeshArray(senderGroup)[0]; // me.getPart3dFromPart(ppart).getMesh();
            senderMesh.geometry.dispose();
            senderMesh.geometry = mesh.geometry;
            var childGroup, childPart3d;
            for (var i = 0; i < senderGroup.children.length; i++) {
              childGroup = senderGroup.children[i];
              childPart3d = me.getPart3dFromGroup(childGroup);
              if (childPart3d) { childPart3d._checkRelation(null, true); }
            }
            var matPart = sender.getMaterialPart();
            if (matPart) { me.setPartMaterial(matPart); }
          });
        } else {
          ThreeUtil.createExtrudeModel_More(ppart.getModel().baseModel, function(mesh) {
            var senderMesh = CommonUtil.getMeshArray(senderGroup)[0]; // me.getPart3dFromPart(ppart).getMesh();
            senderMesh.geometry.dispose();
            senderMesh.geometry = mesh.geometry;
            var childGroup, childPart3d;
            for (var i = 0; i < senderGroup.children.length; i++) {
              childGroup = senderGroup.children[i];
              childPart3d = me.getPart3dFromGroup(childGroup);
              if (childPart3d) { childPart3d._checkRelation(null, true); }
            }
            var matPart = sender.getMaterialPart();
            if (matPart) { me.setPartMaterial(matPart); }
          });
        }
      }
    }
    this.manager3d.dispatchEvent({
      type: 'movePart',
      receiverGroup: receiverGroup,
      senderGroup: senderGroup,
      part: part,
      sender: sender,
      receiver: receiver
    });
  }
  getProduct(key) {
    return this.solution.getProduct(key);
  }
  getProducts3d() {
    return this.products3d;
  }
  getProduct3d(key) {
    return this.products3d[key];
  }
  getProduct3dFromProduct(product) {
    return this.getProduct3d(product.getKey());
  }
  getProduct3dFromGroup(group) {
    return this.getProduct3d(group.userData.productKey);
  }
  getProductGroup(key) {
    var product3d = this.getProduct3d(key);
    return product3d ? product3d.getProductGroup() : null;
  }
  getParentGroup(part) {
    var parent = part.getParent();
    if (parent.getClass() === 'Part') {
      this.getPartGroup(parent.getProductKey(), parent.getKey());
    } else {
      return this.getProductGroup(parent.getKey());
    }
  }
  getPart3d(productKey, partKey) {
    var product3d = this.getProduct3d(productKey);
    return product3d ? product3d.getPart3d(partKey) : null;
  }
  getPartGroup(productKey, partKey) {
    var product3d = this.getProduct3d(productKey);
    return product3d ? product3d.getPartGroup(partKey) : null;
  }
  getPart(productKey, partKey) {
    return this.solution.getPart(productKey, partKey);
  }
  getPart3dFromPart(part) {
    return this.getPart3d(part.getProductKey(), part.getKey());
  }
  getPart3dFromGroup(group) {
    if (group && group.type === 'Group') {
      var userData = group.userData;
      return this.getPart3d(userData.productKey, userData.key);
    } else {
      return null;
    }
  }
  getPartFromGroup(group) {
    var userData = group.userData;
    return this.getPart(userData.productKey, userData.key);
  }
  getGroupFromPart(part) {
    return this.getPartGroup(part.getProductKey(), part.getKey());
  }
  getGroupFromSelectedObj(obj) {
    if (!obj || !obj.parent || obj.parent instanceof Scene) {
      return null;
    } else if (obj.parent.userData.productKey && obj.parent.userData.key && obj.parent.userData.type) {
      return obj.parent;
    } else {
      return this.getGroupFromSelectedObj(obj.parent);
    }
  }
  setPartPosition(part) {
    var partGroup = this.getGroupFromPart(part);
    var p1 = part.getPosition();
    var p2 = partGroup.position;
    if (p1.x !== p2.x || p1.y !== p2.y || p1.z !== p2.z) {
      partGroup.position.set(p1.x, p1.y, p1.z);
    }
    // @ZX 20170208 userData path 更新
    if (part.getType() === 'board') {
      this.getPart3dFromPart(part).setProperty('path', part.getModel().baseModel.path);
      // partGroup.userData.path = part.getModel().baseModel.path;
    }
  }
  setPartScale(part) {
    var partGroup = this.getGroupFromPart(part);
    var s1 = part.getScale();
    var s2 = partGroup.scale;
    if (s1.x !== s2.x || s1.y !== s2.y || s1.z !== s2.z) {
      partGroup.scale.set(s1.x, s1.y, s1.z);
    }
  }
  setPartMaterial(part, oldvalue) {
    var model = part.getModel();
    var material; var materialConfig; var materialConfigs = [];
    for (let i = 0; i < model.baseModel.materials.length; i++) {
      materialConfig = model.baseModel.materials[i];
      if (materialConfig.enabled) {
        materialConfigs.push(materialConfig);
      }
    }
    var oldMaterialConfigs;
    if (oldvalue) {
      oldMaterialConfigs = [];
      for (let i = 0; i < oldvalue.baseModel.materials.length; i++) {
        materialConfig = oldvalue.baseModel.materials[i];
        if (materialConfig.enabled) {
          oldMaterialConfigs.push(materialConfig);
        }
      }
    }
    var me = this;
    var materialBuilder = new ThreeUtil.MaterialBuilder(model.baseModel, materialConfigs);
    materialBuilder.init(function(baseModel, materials) {
      if (baseModel.type === 'material') {
        const ppart = part.getParentPart();
        if (ppart) {
          const ppart3d = me.getPart3dFromPart(ppart);
          if (ppart3d) {
            ppart3d.updateMaterials(materials, materialConfigs, model);
          }
        }
      }
    });
    this.manager3d.dispatchEvent({
      type: 'setPartMaterial',
      solution3d: this
    });
  }
  setTextureDir(part) {
    var matPart = part.getMaterialPart();
    if (matPart) {
      this.setPartMaterial(matPart);
    }
  }
  setPartAngle(part) {
    var partGroup = this.getGroupFromPart(part);
    var part3d = this.getPart3dFromPart(part);
    var a1 = part.getAngle();
    var a2 = part3d.getProperty('angle');
    if (a1.x !== a2.x || a1.y !== a2.y || a1.z !== a2.z) {
      part3d.setProperty('angle', {
        x: a1.x,
        y: a1.y,
        z: a1.z
      });
      if (a1.x !== a2.x) { partGroup.setRotationFromAxisAngle(new Vector3(1, 0, 0), a1.x); }
      if (a1.y !== a2.y) { partGroup.setRotationFromAxisAngle(new Vector3(0, 1, 0), a1.y); }
      if (a1.z !== a2.z) { partGroup.setRotationFromAxisAngle(new Vector3(0, 0, 1), a1.z); }
    }
  }
  setPartParms(part) {
    var model = part.getModel();
    var baseModel = model.baseModel;
    var path = CommonUtil.computeOffset(baseModel.path);
    var data = CommonUtil.pathToPoints(path[0], path[1], baseModel.width, baseModel.height, baseModel.direction);
    var points = CommonUtil.transformVector3(data.points);
    var part3d = this.getPart3dFromPart(part);
    var mesh = part3d.getMesh();
    if (!mesh.userData.data) {
      alert("ERROR_fun_setPartParms");
      return;
    }
    mesh.userData.data = data;

    var geometry = new BoxGeometry(100, 100, 100, 1, 1, 1);
    for (var i = 0; i < points.length; i++) {
      geometry.vertices[i] = points[i];
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.computeFlatVertexNormals();
    geometry.computeMorphNormals();
    ThreeUtil.calculateUvs(geometry, undefined, model.textureDir);
    geometry.verticesNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.elementsNeedUpdate = true;
    mesh.geometry = geometry;

    // var geometry = mesh.geometry;
    // for (var i = 0; i < points.length; i++) {
    // 	geometry.vertices[i] = points[i];
    // }
    // geometry.computeFaceNormals();
    // geometry.computeVertexNormals();
    // geometry.computeFlatVertexNormals();
    // geometry.computeMorphNormals();
    // geometry.verticesNeedUpdate = true;
    // geometry.normalsNeedUpdate = true;
    // ThreeUtil.calculateUvs(geometry, undefined, model.textureDir);
    // geometry.elementsNeedUpdate = true;

    var newPos = part.getPosition();
    var group = part3d.getPartGroup();
    group.position.set(newPos.x, newPos.y, newPos.z);
    var hasLineSegments = false;
    group.traverse(function(child) {
      if (child instanceof LineSegments) {
        child.parent.remove(child);
        CommonUtil.disposeNode(child);
        hasLineSegments = true;
      }
    });
    if (hasLineSegments) {
      var cloneGroup = group.clone();
      cloneGroup.position.set(0, 0, 0);
      cloneGroup.scale.set(1, 1, 1);
      cloneGroup.rotation.set(0, 0, 0);
      var helper = new BoxHelper(cloneGroup, 0x000000);
      group.add(helper);
    }
    part3d.setProperty('path', part3d.getVector3Path());
    part3d.setProperty('width', baseModel.width);
    part3d.setProperty('height', baseModel.height);
  }
  setPartOpenType(part) {
    var model = part.getModel();
    var part3d = this.getPart3dFromPart(part);
    var meshs = part3d.getMeshArray();
    var openType = part.getOpenType();
    var width = model.size.w;
    var scalew = model.baseModel.scale.x;
    switch (openType) {
      case 'top':
        for (var i = 0; i < meshs.length; i++) {
          meshs[i].position.set(0 - (width / scalew) / 2, 0, 0);
        }
        break;
      case 'right':
        for (var i = 0; i < meshs.length; i++) {
          meshs[i].position.set(0 - (width / scalew) / 2, 0, 0);
        }
        break;
      case 'bottom':
        for (var i = 0; i < meshs.length; i++) {
          meshs[i].position.set(0 + (width / scalew) / 2, 0, 0);
        }
        break;
      case 'left':
        for (var i = 0; i < meshs.length; i++) {
          meshs[i].position.set(0 + (width / scalew) / 2, 0, 0);
        }
        break;
    }
  }
  setPartBoardType(part) {
    this.getPart3dFromPart(part).setProperty('boardType', part.getModel().boardType);
  }
  setProductPosition(product) {
    var productGroup = this.getProductGroup(product.getKey());
    var p1 = product.getPosition();
    var p2 = productGroup.position;
    if (p1.x !== p2.x || p1.y !== p2.y || p1.z !== p2.z) {
      p2.set(p1.x, p1.y, p1.z);
    }
  }
  setProductScale(product) {
    var productGroup = this.getProductGroup(product.getKey());
    var s1 = product.getScale();
    var s2 = productGroup.scale;
    if (s1.x !== s2.x || s1.y !== s2.y || s1.z !== s2.z) {
      s2.set(s1.x, s1.y, s1.z);
    }
  }
  setProductAngle(product) {
    var productGroup = this.getProductGroup(product.getKey());
    var a1 = product.getAngle();
    var a2 = productGroup.rotation;
    if (a1.x !== a2.x || a1.y !== a2.y || a1.z !== a2.z) {
      a2.set(a1.x, a1.y, a1.z);
    }
  }
  getProductGroupArray() {
    var objs = [];
    for (var name in this.products3d) {
      objs.push(this.products3d[name].getProductGroup());
    }
    return objs;
  }
}
