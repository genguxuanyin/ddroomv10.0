export default class Part3dCache {
  constructor(name) {
    this.name = name;
    this.state = 0;
    this.number = 0;
  }
  init(part3d, func) {
    this.part3d = part3d;
    this.group = part3d.getPartGroup();
    this.model = part3d.getPart().cloneModel();
    this.state = 1;
    var me = this;
    this.part3d.isReady(function(state) {
      if (state) {
        me.state = 2;
        me.group = me.part3d.getPartGroup().clone();
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
      delete me.part3d;
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
      var part3d = this.part3d;
      if (part3d) {
        var me = this;
        part3d.isReady(function(state) {
          if (state) {
            me.state = 2;
            me.group = part3d.getPartGroup().clone();
            me.cleanGroup(me.group);
          } else {
            me.state = 3;
          }
          delete me.part3d;
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
