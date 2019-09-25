export default class Product3DCache {
  constructor(name) {
    this.name = name;
    this.state = 0;
    this.number = 0;
  }
  init(product3d, func) {
    this.product3d = product3d;
    this.group = product3d.getProductGroup();
    this.model = product3d.getProduct().cloneModel();
    this.state = 1;
    var me = this;
    this.product3d.isReady(function(state) {
      if (state) {
        me.state = 2;
        me.group = me.product3d.getProductGroup().clone();
        me.cleanGroup(me.group);
        if (func) {
          func(true);
        }
      } else {
        me.state = 3;
        if (func) {
          func(false);
        }
      }
      delete me.product3d;
    });
  }
  getName() {
    return this.name;
  }
  getNumber() {
    return this.number;
  }
  getState() {
    return this.state;
  }
  getModel() {
    return this.model;
  }
  getGroup(func) {
    if (this.state === 1) {
      var product3d = this.product3d;
      if (product3d) {
        var me = this;
        product3d.isReady(function(state) {
          if (state) {
            me.state = 2;
            me.group = product3d.getProductGroup().clone();
            me.cleanGroup(me.group);
          } else {
            me.state = 3;
          }
          delete me.product3d;
          if (func) {
            func(me.group);
          }
        });
        return this.group;
      }
    }
    if (func) {
      func(this.group);
    }
    return this.group;
  }
  cloneGroup(func) {
    this.getGroup(function(group) {
      if (func) {
        func(group ? group.clone() : null);
      }
    });
    if (!func) {
      return this.group ? this.group.clone() : null;
    }
  }
  isCache() {
    return this.state > 0;
  }
  increase() {
    this.number += 1;
  }
  decrease() {
    if (this.number > 0) {
      this.number -= 1;
    }
  }
  cleanGroup(group) {
    var v; var gs = [];
    for (let i = 0; i < group.children.length; i++) {
      v = group.children[i];
      if (v && !v.isMesh) {
        gs.push(v);
      }
    }
    for (let i = 0; i < gs.length; i++) {
      group.remove(gs[i]);
      group.prototype.free(gs[i]);
    }
  }
}
