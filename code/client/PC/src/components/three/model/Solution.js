import shortid from 'shortid'
import {
  get,
  set,
  cloneDeep,
  isEqual
} from 'lodash'
import {
  jsonToStr,
  strToJson
} from '../util'
import AddProductCommand from './commands/Product/AddProductCommand'
import RemoveProductCommand from './commands/Product/RemoveProductCommand'
import EditSolutionCommand from './commands/Solution/EditSolutionCommand'

import Product from './Product'

import TYPES from '../types'

export default class Solution {
  constructor(manager) {
    this.manager = manager;
    this._productArray = [];
    this._products = {};
    this._productCount = 0;
    this.state = 'none';
  }
  init(model) {
    this._model = model || {};
    this._model.cl = 'S';
    this._model.c = this._model.c || [];
    if (!this._model.k) {
      this._model.k = shortid.generate();
    }
  }
  getModel() {
    return this._model;
  }
  getAtt(url, isClone = false, _default = '') { // url='position' || url='baseModel.scale'
    var result = get(this.getModel(), url, _default);
    return isClone ? cloneDeep(result) : result;
  }
  setAtt(url, value, isReal) { // url='position' || url='baseModel.scale'
    if (isReal) {
      set(this.getModel(), url, value);
    } else {
      var oldValue = this.getAtt(url);
      if (!isEqual(oldValue, value)) {
        this.manager.operate.execute(new EditSolutionCommand(this.manager, this, { url, value }));
      }
    }
  }
  getKey() {
    return this.getAtt('k');
  }
  getClass() {
    return this.getAtt('cl');
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
  isActive(isReal) {
    return isReal ? this._model.active : this.manager.isActiveSolution(this.getKey());
  }
  setActive(active) {
    this._model.active = active === undefined ? true : active === true;
    if (this._model.active === true) {
      this.manager.setActiveSolution(this.getKey());
    }
  }
  remove() {
    this.manager.removeSolution(this.getKey());
  }
  getProducts() {
    return this._products;
  }
  getProductArray() {
    return this._productArray;
  }
  getProductCount(isAll) {
    return isAll ? this._productCount : this._productArray.length;
  }
  getActiveProduct() {
    return this.activeProduct;
  }
  isActiveProduct(k) {
    if (k && this.activeProduct) {
      return this.activeProduct.getKey() === k;
    }
    return false;
  }
  setActiveProduct(k) {
    var product = k ? this.getProduct(k) : undefined;
    if (product !== this.activeProduct) {
      this.oldActiveProduct = this.activeProduct;
      if (this.oldActiveProduct) {
        this.oldActiveProduct.setActive(false);
      }
      this.activeProduct = product;
      this.manager.dispatchEvent({ type: TYPES['product-changed-active'], activeProduct: this.activeProduct, oldActiveProduct: this.oldActiveProduct });
      return true;
    }
    return false;
  }
  getProduct(k) {
    return this._products[k];
  }
  buildProductFromStr(str, onprogress) {
    var model = strToJson(str);
    return this.buildProduct(model, onprogress);
  }
  buildProduct(model, onprogress) {
    var product = new Product(this);
    product.init(model);
    this.addProduct(product, onprogress);
    return product;
  }
  /*
    isReal 是否真正创建 用于判断是否经过 history
    isSelf 是否是当前product或solution的直接product
    isSub 是否由父级直接创建，用于判断是否移动model
  */
  addProduct(product, onprogress, isReal, isSelf, isSub) {
    if (isReal) {
      if (product) {
        var model = product.getModel();
        this._products[model.k] = product;
        this._productCount++;
        if (isSelf) {
          this._productArray.push(product);
          if (!isSub && this._model.c.indexOf(model) < 0) {
            this._model.c.push(model);
          }
          if (Array.isArray(model.c) && model.c.length > 0) {
            model.c.forEach(p => {
              if (!p.di) {
                const subProduct = new Product(this, product);
                subProduct.init(p);
                product.addProduct(subProduct, onprogress, true, true, true);
              }
            })
          }
        }
        if (!this.activeProduct || product === this.oldActiveProduct || product.isActive(true)) {
          product.setActive(true);
        }
      }
    } else {
      this.manager.operate.execute(new AddProductCommand(this.manager, this, product, onprogress));
    }
  }
  removeProduct(k, isReal, isSelf, isSub) {
    var product = this.getProduct(k);
    if (product) {
      if (isReal) {
        var model = product.getModel();
        if (isSelf) {
          if (Array.isArray(model.c) && model.c.length > 0) {
            model.c.filter(p => !p.di).forEach(p => product.removeProduct(p.k, true, true, true));
          }
          this._productArray.splice(this._productArray.indexOf(product), 1);
          if (!isSub) {
            this._model.c.splice(this._model.c.indexOf(model), 1);
          }
        }
        delete this._products[k];
        this._productCount--;
        if (product === this.activeProduct) {
          if (this.oldActiveProduct) {
            this.oldActiveProduct.setActive(true);
          } else if (this._productArray.length > 0) {
            this._productArray[0].setActive(true);
          } else {
            this.setActiveProduct(undefined);
          }
        } else if (product === this.oldActiveProduct) {
          this.oldActiveProduct = undefined;
        }
      } else {
        this.manager.operate.execute(new RemoveProductCommand(this.manager, this, product));
      }
    }
    return product;
  }
  removeProducts() {
    const result = [];
    while (this._productArray.length > 0) {
      result.push(this.removeProduct(this._productArray[0].getKey()));
    }
    return result;
  }
  cloneModel() {
    return cloneDeep(this.getModel());
  }
  cloneSolution() {
    var model = this.cloneModel();
    var solution = new Solution(this.manager);
    solution.init(model);
    return solution;
  }
  beginGroup() {
    this.manager.beginGroup();
  }
  endGroup() {
    this.manager.endGroup();
  }
  undo() {
    this.manager.undo();
  }
  redo() {
    this.manager.redo();
  }
  clear() {
    this.removeProducts();
  }
  toString() {
    return jsonToStr(this.getModel());
  }
  _init(onprogress) {
    if (this.state !== 'inited') {
      this.state = 'initing';
      const model = this._model;
      if (Array.isArray(model.c)) {
        model.c.forEach(p => {
          if (!p.di) {
            const product = new Product(this);
            product.init(p);
            this.addProduct(product, onprogress, true, true, false);
          }
        })
      }
      this.state = 'inited';
    }
  }
  _uninit() {
    if (this.state === 'inited') {
      this.state = 'uniniting';
      const model = this.getModel();
      if (Array.isArray(model.c)) {
        model.c.filter(p => !p.di).forEach(p => this.removeProduct(p.k, true, true, false));
      }
      // this._model = null;
      this.state = 'uninited';
    }
  }
}
