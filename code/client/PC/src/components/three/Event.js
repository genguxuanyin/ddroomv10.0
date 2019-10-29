import {
  EventDispatcher
} from 'three'
import TYPES from './types'
import {
  intersection
} from 'lodash'
const CONFIG = new Map([
  [
    [{
      name: 'opState',
      value: ['drawSequence']
    }, {
      name: 'viewState',
      value: ['two']
    }, {
      name: 'findObject',
      value: {
        type: ['plane'],
        eventType: ['mousedown0', 'mousemove0']
      }
    }], {
      command: 'drawSequence',
      param: {}
    }
  ],
  [
    [{
      name: 'opState',
      value: ['drawBox']
    }, {
      name: 'viewState',
      value: ['two']
    }, {
      name: 'findObject',
      value: {
        type: ['plane'],
        eventType: ['mousedown0', 'mousemove0']
      }
    }], {
      command: 'drawBox',
      param: {}
    }
  ],
  [
    [{
      name: 'opState',
      value: ['drawPillar', 'drawPlat', 'drawGirde']
    }, {
      name: 'viewState',
      value: ['two']
    }, {
      name: 'findObject',
      value: {
        type: ['plane'],
        eventType: ['mousedown0', 'mousemove0']
      }
    }], {
      command: 'drawOther',
      param: {}
    }
  ],
  [
    [{
      name: 'opState',
      value: ['drawSequence', 'drawBox', 'drawPillar']
    }, {
      name: 'viewState',
      value: ['two']
    }, {
      name: 'findObject',
      value: {
        type: ['plane'],
        eventType: ['mousedown2']
      }
    }], {
      command: 'resetWall',
      param: {}
    }
  ]
]);
export default class EventManager extends EventDispatcher {
  constructor(designer) {
    super();
    this.states = {
      opState: {
        drawSequence: true
      },
      viewState: {
        three: true
      }
    };
    this.designer = designer;
    this.scene3d = designer.scene3d;
    this.solutionManager = designer.solutionManager;
    this.solution3DManager = designer.solution3DManager;
  }
  init() {
    this.addEventListener(TYPES['menu-click'], (ev) => {
      var {
        command,
        param
      } = ev;
      if (!Array.isArray(command)) {
        command = [command];
      }
      if (!Array.isArray(param)) {
        param = [param];
      }
      command.forEach((c, i) => {
        this[c] && this[c](param[i] ? param[i] : param[0])
      })
      this.dispatchEvent(Object.assign(ev, {
        type: TYPES['menu-click'] + '-distribute'
      }));
    });
    this.scene3d.addEventListener(TYPES['find-object'], (ev) => {
      this.goes(ev);
      this.dispatchEvent(ev);
    })
  }
  getState(p) {
    var arg = arguments;
    if (arg.length > 0) {
      var cur = [];
      for (var key in this.states) {
        if (key === p) {
          for (var k in this.states[key]) {
            if (this.states[key][k]) {
              cur.push(k)
            }
          }
        }
      }
      return cur;
    }
    return this.states;
  }
  addState(param) { // { opState:'draw',viewState:'two'}
    for (const key in param) {
      if (typeof this.states[key] !== 'object') {
        this.states[key] = {};
      }
      this.states[key][param[key]] = true;
    }
    return this;
  }
  changeState(param) { // { opState:'draw',viewState:'two'}
    for (const key in param) {
      this.states[key] = {};
      this.states[key][param[key]] = true;
    }
    return this;
  }
  goes(ev) {
    CONFIG.forEach((value, key) => {
      try {
        key.forEach(v => {
          if (!this.match(v, ev)) {
            throw new Error('break'); // 终止forEach循环
          }
        })
        this.dispatchEvent({
          type: TYPES['common'],
          command: value.command,
          param: Object.assign(value.param, ev)
        });
      } catch (error) {
        if (error.message !== "break") {
          console.error(error);
        }
      }
    })
  }
  match(v, ev) {
    switch (v.name) {
      case 'opState':
        var opState = this.getState('opState');
        return this._intersection(v.value, opState);
      case 'viewState':
        var viewState = this.getState('viewState');
        return this._intersection(v.value, viewState);
      case 'findObject':
        return (
          this._intersection(v.value.eventType, [ev.event.type + ev.event.button])
          /*  &&
                    this._intersection(v.value.type, [ev.event.type]) */
        );
    }
  }
  _intersection(...arg) {
    return !!intersection(...arg).length
  }
}
