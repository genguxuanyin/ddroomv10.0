import shortid from 'shortid'
import {
  get,
  set,
  isArray,
  cloneDeep,
  isEqual,
  values
} from 'lodash'
import {
  jsonToStr,
  strToJson
} from '../util'
import AddPartCommand from './commands/Part/AddPartCommand'
import RemovePartCommand from './commands/Part/RemovePartCommand'
import MovePartCommand from './commands/Part/MovePartCommand'
import EditPartCommand from './commands/Part/EditPartCommand'

export default class Part {
  constructor(product, ppart) {
    this.product = product;
    this.manager = product.solution.manager;
    this._ppart = ppart;
    this._partArray = [];
    this._parts = {};
    this._partCount = 0;
  }
  init(model) {
    this._model = model || {};
    this._model.clazz = 'Part';
    this._model.parts = this._model.parts || [];
    this._model.places = this._model.places || [];
    if (!this._model.key) {
      this._model.key = shortid.generate();
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
        this.manager.operate.execute(new EditPartCommand(this.manager, this, { url, value }));
      }
    }
  }
  getKey() {
    return this.getAtt('key');
  }
  getClass() {
    return this.getAtt('clazz');
  }
  getSolution() {
    return this.product.solution;
  }
  getProduct() {
    return this.product;
  }
  getParent() {
    return this._ppart ? this._ppart : this.product;
  }
  hasParentPart() {
    return !!this._ppart;
  }
  getParentPart() {
    return this._ppart;
  }
  getParts() {
    return this._parts;
  }
  getPartCount(isAll) {
    return isAll ? this._partCount : this._partArray.length;
  }
  getPartArray(isAll) {
    if (isAll) {
      return values(this._parts)
    } else {
      return this._partArray;
    }
  }
  getPart(key) {
    return this._parts[key];
  }
  resetKey(model) {
    delete model.key;
    isArray(model.parts) && model.parts.forEach(m => this.resetKey(m));
  }
  clone(ppart) {
    var model = this.cloneModel();
    model.key = shortid.generate();
    if (ppart === undefined) {
      ppart = this.getParentPart();
    }
    return this.buildPart(model, ppart);
  }
  cloneModel() {
    return cloneDeep(this.getModel());
  }
  clonePart() {
    var model = this.cloneModel();
    this.resetKey(model);
    var part = new Part(this.product, this._ppart);
    part.init(model);
    return part;
  }
  copyModel(isCopyKey) {
    var model = this.cloneModel();
    if (!isCopyKey) {
      this.resetKey(model);
    }
    return model;
  }
  copyPart() {
    var model = this.copyModel(false);
    this.buildPart(model, this.getParentPart());
  }
  buildPart(model, onprogress, ppart = this) {
    var part = new Part(this.product, ppart);
    part.init(model);
    ppart.addPart(part, onprogress);
    return part;
  }
  moveTo(receiver, isReal) {
    if (!receiver) {
      receiver = this.product;
    }
    if (isReal) {
      var parent = this.getParent();
      if (parent !== receiver) {
        parent.removePart(this.getKey(), true, true, false);
        this._ppart = receiver.getClass() === 'Part' ? receiver : null;
        receiver.addPart(this, null, true, true, false);
      }
    } else {
      this.manager.operate.execute(new MovePartCommand(this.manager, this, receiver));
    }
  }
  remove() {
    var parent = this.getParent();
    parent.removePart(this.getKey());
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
      }
      var parent = this.getParent();
      parent.addPart(part, onprogress, true, false, false);
      if (isSelf) {
        if (Array.isArray(model.parts) && model.parts.length > 0) {
          model.parts.forEach(p => {
            if (p.enabled) {
              const subPart = new Part(this.product, part);
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
        var model = part.getModel();
        if (isSelf) {
          if (Array.isArray(model.parts) && model.parts.length > 0) {
            model.parts.filter(p => p.enabled).forEach(p => part.removePart(p.key, true, true, true));
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
        this.getParent().removePart(part.getKey(), true, false, false);
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
  isActive(isReal) {
    return isReal ? this._model.active : this.product.isActivePart(this.getKey());
  }
  setActive(active) {
    this._model.active = active === undefined ? true : active === true;
    if (this._model.active === true) {
      this.product.setActivePart(this.getKey());
    }
  }
  undo() {
    this.product.undo();
  }
  redo() {
    this.product.redo();
  }
  beginGroup() {
    this.product.beginGroup();
  }
  endGroup() {
    this.product.endGroup();
  }
  toString() {
    return jsonToStr(this.getModel());
  }
}
