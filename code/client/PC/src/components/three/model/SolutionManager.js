import {
  EventDispatcher
} from 'three'
import {
} from 'lodash'
import {
  strToJson
} from '../util'
import AddSolutionCommand from './commands/Solution/AddSolutionCommand'
import RemoveSolutionCommand from './commands/Solution/RemoveSolutionCommand'
import OperateGroupCommand from './commands/OperateGroupCommand'
import Solution from './Solution'
import History from './History'
import TYPES from '../types'

export default class SolutionManager extends EventDispatcher {
  constructor() {
    super();
    this._solutionArray = [];
    this._solutions = {};
    this.operate = new History(this);
    this.activeSolution = null;
    this.oldActiveSolution = null;
  }
  init(model, onprogress) {
    if (Array.isArray(model)) {
      model.forEach(solutionModel => {
        if (!solutionModel.di) {
          this.buildSolution(solutionModel, onprogress);
        }
      });
    } else {
      this.buildSolution(model, onprogress);
    }
  }
  getSolutions() {
    return this._solutions;
  }
  getSolutionArray() {
    this._solutionArray;
  }
  getSolutionCount() {
    return this._solutionArray.length;
  }
  getSolution(k) {
    return this._solutions[k];
  }
  buildSolutionFromStr(str, onprogress) {
    var model = strToJson(str);
    return this.buildSolution(model, onprogress);
  }
  buildSolution(model, onprogress) {
    var solution = new Solution(this);
    solution.init(model);
    this.addSolution(solution, onprogress);
    return solution;
  }
  addSolution(solution, onprogress, isReal, func) {
    if (isReal) {
      if (solution) {
        if (solution.manager !== this) {
          solution.manager.removeSolution(solution.getKey());
          solution.manager = this;
        }
        this._solutionArray.push(solution);
        this._solutions[solution.getKey()] = solution;
        solution._init(onprogress);
        func && func(solution);
        if (!this.activeSolution || solution === this.oldActiveSolution || solution.isActive(true)) {
          solution.setActive(true);
        }
      }
    } else {
      this.operate.execute(new AddSolutionCommand(this, solution, onprogress));
    }
  }
  removeSolution(k, isReal, func) {
    var solution = this.getSolution(k);
    if (solution) {
      if (isReal) {
        solution._uninit();
        this._solutionArray.splice(this._solutionArray.indexOf(solution), 1);
        delete this._solutions[k];
        func && func(solution);
        if (solution === this.activeSolution) {
          if (this.oldActiveSolution) {
            this.oldActiveSolution.setActive(true);
          } else if (this._solutionArray.length > 0) {
            this._solutionArray[0].setActive(true);
          } else {
            this.setActiveSolution(undefined);
          }
        } else if (solution === this.oldActiveSolution) {
          this.oldActiveSolution = undefined;
        }
      } else {
        this.operate.execute(new RemoveSolutionCommand(this, solution));
      }
    }
    return solution;
  }
  removeSolutions() {
    const result = [];
    while (this._solutionArray.length > 0) {
      result.push(this.removeSolution(this._solutionArray[0].getKey()));
    }
    return result;
  }
  isActiveSolution(k) {
    if (k && this.activeSolution) {
      return this.activeSolution.getKey() === k;
    }
    return false;
  }
  getActiveSolution() {
    return this.activeSolution;
  }
  setActiveSolution(k) {
    var solution = k ? this.getSolution(k) : undefined;
    if (this.activeSolution !== solution) {
      this.oldActiveSolution = this.activeSolution;
      if (this.oldActiveSolution) {
        this.oldActiveSolution.setActive(false);
      }
      this.activeSolution = solution;
      this.dispatchEvent({ type: TYPES['solution-changed-active'], activeSolution: this.activeSolution, oldActiveSolution: this.oldActiveSolution });
      return true;
    }
    return false;
  }
  buildProductFromStr(str, onprogress, solution) {
    solution = solution || this.activeSolution;
    return solution ? solution.buildProductFromStr(str, onprogress) : undefined;
  }
  buildProduct(model, onprogress, solution) {
    solution = solution || this.activeSolution;
    return solution ? solution.buildProduct(model, onprogress) : undefined;
  }
  getActiveProduct(solution) {
    solution = solution || this.activeSolution;
    return solution ? solution.getActiveProduct() : undefined;
  }
  getProduct(key, solution) {
    solution = solution || this.activeSolution;
    return solution ? solution.getProduct(key) : undefined;
  }
  reset() {
    this.removeSolutions();
    this._solutions = {};
    this._solutionArray = [];
    this.clearHistory();
  }
  beginGroup() {
    this.operate.execute(new OperateGroupCommand({ type: 'begin', operate: this.operate, manager: this }));
  }
  endGroup() {
    this.operate.execute(new OperateGroupCommand({ type: 'end', operate: this.operate, manager: this }));
  }
  undo() {
    this.dispatchEvent({ type: TYPES['before-undo'], solutionManager: this });
    this.operate.undo();
    this.dispatchEvent({ type: TYPES['after-undo'], solutionManager: this });
  }
  redo() {
    this.dispatchEvent({ type: TYPES['before-redo'], solutionManager: this });
    this.operate.redo();
    this.dispatchEvent({ type: TYPES['after-redo'], solutionManager: this });
  }
  clearHistory() {
    this.operate.clear();
  }
}
