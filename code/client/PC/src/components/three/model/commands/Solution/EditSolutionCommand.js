import Command from "../Command";
import TYPES from '../../../types'
export default class EditSolutionCommand extends Command {
  constructor(manager, solution, param) {
    super(manager);
    this.type = 'EditSolutionCommand';
    this.name = 'EditSolution';
    this.solution = solution;
    this.param = param || {};
    this.oldValue = this.solution.getAtt(this.param.url);
  }
  execute() {
    this.solution.setAtt(this.param.url, this.param.value, true);
    var eventObj = { type: TYPES['solution-edit'], solution: this.solution, url: this.param.url };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: this.solution, operate: eventObj });
  }
  undo() {
    this.solution.setAtt(this.param.url, this.oldValue, true);
    var eventObj = { type: TYPES['solution-edit'], solution: this.solution, url: this.param.url };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: this.solution, operate: eventObj });
  }
}
