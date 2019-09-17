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
    if (model && Array.isArray(model.solutions)) {
      model.solutions.forEach(solutionModel => {
        if (!solutionModel.disabled) {
          this.buildSolution(solutionModel, onprogress);
        }
      });
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
  getSolution(key) {
    return this._solutions[key];
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
  removeSolution(key, isReal, func) {
    var solution = this.getSolution(key);
    if (solution) {
      if (isReal) {
        solution._uninit();
        this._solutionArray.splice(this._solutionArray.indexOf(solution), 1);
        delete this._solutions[key];
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
  isActiveSolution(key) {
    if (key && this.activeSolution) {
      return this.activeSolution.getKey() === key;
    }
    return false;
  }
  getActiveSolution() {
    return this.activeSolution;
  }
  setActiveSolution(key) {
    var solution = key ? this.getSolution(key) : undefined;
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
  reset() {
    this.removeSolutions();
    this._solutions = {};
    this._solutionArray = [];
    this.clearHistory();
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
