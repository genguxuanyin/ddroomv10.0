import shortid from 'shortid'
import {
  get,
  set,
  cloneDeep,
  isEqual,
  values
} from 'lodash'
import {
  strToJson,
  jsonToStr
} from '../util'
import AddPartCommand from './commands/Part/AddPartCommand'
import RemovePartCommand from './commands/Part/RemovePartCommand'
import EditProductCommand from './commands/Product/EditProductCommand'

import Part from './Part'

export default class Product {
  constructor(solution) {
    this.solution = solution;
    this.manager = solution.manager;
    this._partArray = [];
    this._parts = {};
    this._partCount = 0;
    this.state = 'none';
  }
  init(model) {
    this._model = model || {};
    this._model.clazz = 'Product';
    this._model.parts = this._model.parts || [];
    if (!this._model.key) {
      this._model.key = shortid.generate();
    }
  }
  initFromStr(str) {
    var model = strToJson(str);
    this.init(model);
  }
  load(id) {
    // 根据id从服务器获取模型数据
    var model = {

    };
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
    return this.getAtt('key');
  }
  getClass() {
    return this.getAtt('clazz');
  }
  isIniting() {
    return this.state === 'initing';
  }
  isReady() {
    return this.state === 'inited';
  }
  getSolution() {
    return this.solution;
  }
  getSolutionKey() {
    return this.solution.getKey();
  }
  getParts() {
    return this._parts;
  }
  cloneModel() {
    return cloneDeep(this.getModel());
  }
  cloneProduct() {
    var model = this.cloneModel();
    var product = new Product(this.solution);
    product.init(model);
    return product;
  }
  getPartCount(isAll) {
    return isAll ? this._partCount : this._partArray.length;
  }
  getPartArray(isAll) {
    if (isAll) {
      return values(this._parts);
    } else {
      return this._partArray;
    }
  }
  getPart(key, isAll) {
    var part = this._partArray.find(p => p.getKey() === key);
    if (!part && isAll) {
      return this._parts[key];
    }
    return part;
  }
  isActive(isReal) {
    return isReal ? this._model.active : this.solution.isActiveProduct(this.getKey());
  }
  setActive(active) {
    this._model.active = active === undefined ? true : active === true;
    if (this._model.active === true) {
      this.solution.setActiveProduct(this.getKey());
    }
  }
  getActivePart() {
    return this.solution.getActivePart();
  }
  isActivePart(key) {
    return this.solution.isActivePart(this.getKey(), key);
  }
  setActivePart(key) {
    this.solution.setActivePart(this.getKey(), key);
  }
  remove() {
    this.solution.removeProduct(this.getKey());
  }
  buildPartFromStr(str, onprogress) {
    var model = strToJson(str);
    return this.buildPart(model, onprogress);
  }
  buildPart(model, onprogress) {
    var part = new Part(this, null);
    part.init(model);
    this.addPart(part, onprogress);
    return part;
  }
  addPart(part, onprogress, isReal, isSelf, isSub) {
    if (isReal) {
      var model = part.getModel();
      this._parts[model.key] = part;
      this._partCount++;
      if (isSelf) {
        this._partArray.push(part);
        if (!isSub && this._model.parts.indexOf(model) < 0) {
          this._model.parts.push(model);
        }
        if (Array.isArray(model.parts) && model.parts.length > 0) {
          model.parts.forEach(p => {
            if (!p.disabled) {
              const subPart = new Part(this, part);
              subPart.init(p);
              part.addPart(subPart, onprogress, true, true, true);
            }
          })
        }
      }
    } else {
      this.manager.operate.execute(new AddPartCommand(this.manager, this, part, onprogress));
    }
  }
  removePart(key, isReal, isSelf, isSub) {
    var part = this.getPart(key);
    if (part) {
      if (isReal) {
        const model = part.getModel();
        if (isSelf) {
          if (Array.isArray(model.parts) && model.parts.length > 0) {
            model.parts.filter(p => !p.disabled).forEach(p => part.removePart(p.key, true, true, true))
          }
        }
        delete this._parts[key];
        this._partCount--;
        if (isSelf) {
          this._partArray.splice(this._partArray.indexOf(part), 1);
          if (!isSub) {
            this._model.parts.splice(this._model.parts.indexOf(model), 1);
          }
        }
      } else {
        this.manager.operate.execute(new RemovePartCommand(this.manager, part.getParent(), part));
      }
    }
    return part;
  }
  removeParts() {
    var result = []; var parts = this._model.parts || [];
    switch (parts.length) {
      case 0:
        return result;
      case 1:
        result.push(this.removePart(parts[0].key));
        break;
      default:
        this.beginGroup();
        while (parts.length > 0) {
          result.push(this.removePart(parts[0].key));
        }
        this.endGroup();
        break;
    }
    return result;
  }
  undo() {
    this.solution.undo();
  }
  redo() {
    this.solution.redo();
  }
  toString() {
    return jsonToStr(this.getModel());
  }
  _init(onprogress) {
    if (this.state !== 'inited') {
      this.state = 'initing';
      const model = this._model;
      if (model.parts && model.parts.length > 0) {
        model.parts.forEach(p => {
          if (!p.disabled) {
            const subPart = new Part(this, null);
            subPart.init(p);
            this.addPart(subPart, onprogress, true, true, true);
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
      if (Array.isArray(model.parts) && model.parts.length > 0) {
        model.parts.filter(p => !p.disabled).forEach(p => this.removePart(p.key, true, true, true));
      }
      this.state = 'uninited';
    }
  }
}
