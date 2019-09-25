import shortid from 'shortid'
import {
  get,
  set,
  cloneDeep,
  isEqual,
  values
} from 'lodash'
import {
  jsonToStr,
  strToJson
} from '../util'
import AddProductCommand from './commands/Product/AddProductCommand'
import RemoveProductCommand from './commands/Product/RemoveProductCommand'
import MoveProductCommand from './commands/Product/MoveProductCommand'
import EditProductCommand from './commands/Product/EditProductCommand'

export default class Product {
  constructor(solution, pproduct) {
    this.solution = solution;
    this.manager = solution.manager;
    this._pproduct = pproduct;
    this._productArray = [];
    this._products = {};
    this._productCount = 0;
  }
  init(model) {
    this._model = model || {};
    this._model.cl = 'P'; // class
    if (!this._model.k) {
      this._model.k = shortid.generate();
    }
  }
  initFromStr(str) {
    var model = strToJson(str);
    this.init(model);
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
        this.manager.operate.execute(new EditProductCommand(this.manager, this, { url, value }));
      }
    }
  }
  getKey() {
    return this.getAtt('k');
  }
  getClass() {
    return this.getAtt('cl');
  }
  getParent() {
    return this._pproduct ? this._pproduct : this.solution;
  }
  hasParentProduct() {
    return !!this._pproduct;
  }
  getProducts() {
    return this._products;
  }
  getProductCount(isAll) {
    return isAll ? this._productCount : this._productArray.length;
  }
  getProductArray(isAll) {
    if (isAll) {
      return values(this._products)
    } else {
      return this._productArray;
    }
  }
  getProduct(k) {
    return this._products[k];
  }
  resetKey(model) {
    delete model.k;
    Array.isArray(model.c) && model.c.forEach(m => this.resetKey(m));
  }
  cloneModel() {
    return cloneDeep(this.getModel());
  }
  copyProduct() {
    var model = this.copyModel(false);
    return this.buildProduct(model, null, this._pproduct);
  }
  copyModel(isCopyKey) {
    var model = this.cloneModel();
    if (!isCopyKey) {
      this.resetKey(model);
    }
    return model;
  }
  buildProduct(model, onprogress, pproduct = this) {
    var product = new Product(this.solution, pproduct);
    product.init(model);
    this.addProduct(product, onprogress);
    return product;
  }
  moveTo(receiver = this.solution, isReal) {
    if (isReal) {
      var parent = this.getParent();
      if (parent !== receiver) {
        parent.removeProduct(this.getKey(), true, true, false);
        this._pproduct = receiver === this.solution ? this.solution : receiver;
        receiver.addProduct(this, null, true, true, false);
      }
    } else {
      this.manager.operate.execute(new MoveProductCommand(this.manager, this, receiver));
    }
  }
  remove() {
    var parent = this.getParent();
    parent.removeProduct(this.getKey());
  }
  addProduct(product, onprogress, isReal, isSelf, isSub) {
    if (isReal) {
      var model = product.getModel();
      this._products[model.k] = product;
      this._productCount++;
      var parent = this.getParent();
      parent.addProduct(product, onprogress, true, false, false);
      if (isSelf) {
        this._productArray.push(product);
        if (!isSub && this._model.c.indexOf(model) < 0) {
          this._model.c.push(model);
        }
        if (Array.isArray(model.c) && model.c.length > 0) {
          model.c.forEach(p => {
            if (!p.di) {
              const subProduct = new Product(this.solution, product);
              subProduct.init(p);
              product.addProduct(subProduct, onprogress, true, true, true);
            }
          })
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
        }
        delete this._products[k];
        this._productCount--;
        if (isSelf) {
          this._productArray.splice(this._productArray.indexOf(product), 1);
          if (!isSub) {
            this._model.c.splice(this._model.c.indexOf(model), 1);
          }
        }
        this.getParent().removeProduct(product.getKey(), true, false, false);
      } else {
        this.manager.operate.execute(new RemoveProductCommand(this.manager, product.getParent(), product));
      }
    }
    return product;
  }
  removeProducts() {
    var result = []; var products = this._model.c || [];
    switch (products.length) {
      case 0:
        return result;
      case 1:
        result.push(this.removeProduct(products[0].k));
        break;
      default:
        this.beginGroup();
        while (products.length > 0) {
          result.push(this.removeProduct(products[0].k));
        }
        this.endGroup();
        break;
    }
    return result;
  }
  isActive(isReal) {
    return isReal ? this._model.a : this.solution.isActiveProduct(this.getKey());
  }
  setActive(active) {
    this._model.a = active === undefined ? true : active === true;
    if (this._model.a === true) {
      this.solution.setActiveProduct(this.getKey());
    }
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
  toString() {
    return jsonToStr(this.getModel());
  }
}
