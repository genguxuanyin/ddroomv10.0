import Product3D from './Product3D'
import TYPES from '../types'
import {
  Group
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
    this.solutionGroup.name = 'solutionGroup';
    this.solutionGroup.userData.type = 'Solution';
    this.solutionGroup.userData.key = this.solution.getKey();
    this.manager3d.rootGroup.add(this.solutionGroup);

    const products = this.solution.getProductArray();
    products.forEach(p => {
      if (!p.getAtt('disabled')) {
        this.addProduct3d(p, onprogress);
      }
    })
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
          type: TYPES['product-changed-active'],
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
        type: TYPES['product-add'],
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
        productGroup.free();
        if (product.isActive()) {
          this.manager3d.scene3D.removeModelCtrl();
        }
        this.manager3d.dispatchEvent({
          type: TYPES['product-remove'],
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
    } else {
      receiverGroup = this.getProductGroup(receiver.getKey());
      receiverGroup.add(partGroup);
    }
    this.manager3d.dispatchEvent({
      type: TYPES['part-move'],
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
  getPart3dFromGroup({ userData }) {
    return this.getPart3d(userData.productKey, userData.key);
  }
  getPartFromGroup({ userData }) {
    return this.getPart(userData.productKey, userData.key);
  }
  getGroupFromPart(part) {
    return this.getPartGroup(part.getProductKey(), part.getKey());
  }
  setPart3dAtt(part, url, newValue) {

  }
  setProduct3dAtt(product, url, newValue) {
    var productGroup = this.getProductGroup(product.getKey());
    var p1 = product.getPosition();
    var p2 = productGroup.position;
    if (p1.x !== p2.x || p1.y !== p2.y || p1.z !== p2.z) {
      p2.set(p1.x, p1.y, p1.z);
    }
  }
  getProductGroupArray() {
    var productGroupArray = [];
    for (var key in this.products3d) {
      productGroupArray.push(this.products3d[key].getProductGroup());
    }
    return productGroupArray;
  }
}
