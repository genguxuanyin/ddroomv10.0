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
    this.state = 'none';
  }
  init(model) {
    this._model = model || {};
    this._model.clazz = 'Solution';
    this._model.products = this._model.products || [];
    if (!this._model.key) {
      this._model.key = shortid.generate();
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
    return this.getAtt('key');
  }
  getClass() {
    return this.getAtt('clazz');
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
  getProductCount() {
    return this._productArray.length;
  }
  getActiveProduct() {
    return this.activeProduct;
  }
  isActiveProduct(key) {
    if (key && this.activeProduct) {
      return this.activeProduct.getKey() === key;
    }
    return false;
  }
  setActiveProduct(key, notSetPart) {
    var product = key ? this.getProduct(key) : undefined;
    if (product !== this.activeProduct) {
      this.oldActiveProduct = this.activeProduct;
      if (this.oldActiveProduct) {
        this.oldActiveProduct.setActive(false);
      }
      this.activeProduct = product;
      if (!notSetPart && this.activePart && this.activePart.getProduct() !== product) {
        this.oldActivePart = this.activePart;
        this.activePart = undefined;
      }
      this.manager.dispatchEvent({ type: TYPES['product-changed-active'], activeProduct: this.activeProduct, oldActiveProduct: this.oldActiveProduct });
      return true;
    }
    return false;
  }
  getActivePart() {
    return this.activePart;
  }
  isActivePart(productKey, partKey) {
    if (this.isActiveProduct(productKey)) {
      if (partKey && this.activePart) {
        return this.activePart.getKey() === partKey;
      }
    }
    return false;
  }
  setActivePart(productKey, partKey) {
    const result = this.setActiveProduct(productKey, true);
    const part = (this.activeProduct && partKey) ? this.activeProduct.getPart(partKey) : undefined;
    if (part !== this.activePart) {
      this.oldActivePart = this.activePart;
      if (this.oldActivePart) {
        this.oldActivePart.setActive(false);
      }
      this.activePart = part;
      this.manager.dispatchEvent(TYPES['part-changed-active'], { activePart: this.activePart, oldActivePart: this.oldActivePart });
      return true;
    }
    return result;
  }
  getProduct(key) {
    return this._products[key];
  }
  getPart(productKey, partKey) {
    var product = this.getProduct(productKey);
    return product ? product.getPart(partKey, true) : null;
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
  addProduct(product, onprogress, isReal, func) {
    if (isReal) {
      var model = product.getModel();
      if (this._model.products.indexOf(model) < 0) {
        this._model.products.push(model);
      }
      this._productArray.push(product);
      this._products[product.getKey()] = product;
      product._init(onprogress);
      func && func(product);
      if (!this.activeProduct || product === this.oldActiveProduct || product.isActive(true)) {
        product.setActive(true);
      }
    } else {
      this.manager.operate.execute(new AddProductCommand(this.manager, product, onprogress));
    }
  }
  removeProduct(key, isReal, func) {
    var product = this.getProduct(key);
    if (product) {
      if (isReal) {
        product._uninit();
        this._model.products.splice(this._model.products.indexOf(product.getModel()), 1);
        this._productArray.splice(this._productArray.indexOf(product), 1);
        delete this._products[key];
        if (func) {
          func(product);
        }
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
        this.manager.operate.execute(new RemoveProductCommand(this.manager, product));
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
  undo() {
    this.manager.operate.undo();
  }
  redo() {
    this.manager.operate.redo();
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
      if (Array.isArray(model.products)) {
        model.products.forEach(p => {
          if (!p.disabled) {
            const product = new Product(this);
            product.init(p);
            this.addProduct(product, onprogress, true);
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
      if (Array.isArray(model.products)) {
        model.products.filter(p => !p.disabled).forEach(p => this.removeProduct(p.key, true));
      }
      this.state = 'uninited';
    }
  }
}
