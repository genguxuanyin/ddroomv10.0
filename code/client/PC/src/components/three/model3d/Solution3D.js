import Product3D from './Product3D'
import TYPES from '../types'
import {
  Group
} from 'three'

export default class Solution3D {
  constructor(manager3d, solution) {
    this.manager3d = manager3d;
    this.solution = solution;
    this._product3dArray = [];
    this._products3d = {};
    this._product3dCount = 0;
    this.state = 'none';
  }
  init(solution, onprogress) {
    this.solution = solution || this.solution;
    this.group = new Group();
    this.group.name = 'solutionGroup';
    this.group.userData.cl = 'S';
    this.group.userData.k = this.solution.getKey();
    this.manager3d.getRootGroup().add(this.group);
    var progress = 0;
    var total = this.solution.getProductCount(true)/*  + 1 */;
    this.doProgress = () => {
      progress++;
      if (onprogress) {
        onprogress({
          type: total === progress ? 'solution3d-inited' : 'solution3d-initing',
          total: total,
          progress: progress,
          solution3d: this
        });
      }
    };
    if (this.state !== 'inited') {
      this.state = 'initing';
      const products = this.solution.getProductArray();
      products.filter(p => !p.getAtt('di')).forEach(p => {
        if (!p.getAtt('di')) {
          const product3d = new Product3D(this, p, this);
          product3d.init(p, onprogress);
          this.addProduct3d(product3d, onprogress, true, false);
        }
      });
      this.state = 'inited';
    }
  }
  uninit() {
    if (this.state === 'inited') {
      this.state = 'uniniting';
      const product3dArray = this.getProduct3dArray();
      const keys = product3dArray.map(p3d => p3d.getKey());
      keys.forEach(k => {
        this.removeProduct3d(this.getProduct3d(k), true, false);
      });
      this.state = 'uninited';
    }
  }
  getKey() {
    return this.solution.getKey();
  }
  getProduct3dArray() {
    return this._product3dArray;
  }
  getSolution() {
    return this.solution;
  }
  getActiveProduct3d() {
    return this.activeProduct3d;
  }
  setActiveProduct3d(product3d) {
    if (product3d) {
      if (product3d !== this.activeProduct3d) {
        this.oldActiveProduct3d = this.activeProduct3d;
        this.activeProduct3d = product3d;
        this.manager3d.dispatchEvent({
          type: TYPES['product-changed-active'],
          oldProduct3d: this.activeProduct3d,
          newProduct3d: product3d
        });
      }
    }
  }
  getActiveProduct3dGroup() {
    var product3d = this.getActiveProduct3d();
    return product3d ? product3d.getGroup() : null;
  }
  buildProduct3d(product, onprogress) {
    const product3d = new Product3D(this, product, this);
    product3d.init(product, onprogress);
    this.addProduct3d(product3d, onprogress, true);
    return product3d;
  }
  addProduct3d(product3d, onprogress, isSelf, isSub) {
    if (product3d) {
      this._products3d[product3d.getKey()] = product3d;
      this._product3dCount++;
      if (isSelf) {
        this._product3dArray.push(product3d);
        var subProduct = product3d.getProductArray();
        if (Array.isArray(subProduct) && subProduct.length > 0) {
          subProduct.forEach(p => {
            if (!p.di) {
              const subProduct3d = new Product3D(this, p, product3d);
              this._products3d[p.getKey()] = subProduct3d;
              subProduct3d.init(p, onprogress);
              product3d.addProduct3d(subProduct3d, onprogress, true, true);
            }
          })
        }
      }
      this.manager3d.dispatchEvent({
        type: TYPES['product-add'],
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
      if (isSelf) {
        this._product3dArray.splice(this._product3dArray.indexOf(product3d), 1);
        product3d.uninit();
        product3d.getGroup().free();
      }
      this.manager3d.dispatchEvent({
        type: TYPES['product-remove'],
        product3d: product3d
      });
      return product3d;
    }
  }
  moveProduct3d(product3d, receiver3d) {
    var productGroup = product3d.getGroup();
    var receiverGroup = receiver3d.getGroup();
    receiverGroup.add(productGroup);
    this.manager3d.dispatchEvent({
      type: TYPES['product-move'],
      product: product3d,
      receiver3d: receiver3d
    });
  }
  getProduct(key) {
    return this.solution.getProduct(key);
  }
  getProductFromGroup({ userData: { k }}) {
    return this.getProduct(k);
  }
  getProducts3d() {
    return this._products3d;
  }
  getProduct3d(key) {
    return this._products3d[key];
  }
  getProduct3dFromProduct(product) {
    return this.getProduct3d(product.getKey());
  }
  getProduct3dFromGroup(group) {
    return this.getProduct3d(group.userData.productKey);
  }
  getGroup() {
    return this.group;
  }
  getGroupFromKey(key) {
    var product3d = this.getProduct3d(key);
    return product3d ? product3d.getGroup() : null;
  }
  getGroupArray() {
    var a = [];
    for (var k in this._products3d) {
      a.push(this._products3d[k].getGroup());
    }
    return a;
  }
  getGroupFromProduct(product) {
    return this.getGroup(product.getProductKey(), product.getKey());
  }
}
