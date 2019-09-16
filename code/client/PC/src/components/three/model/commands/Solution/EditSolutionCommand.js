import Command from "../Command";

export default class EditSolutionCommand extends Command {
  constructor(manager, solution, param) {
    super(manager);
    this.type = 'EditSolutionCommand';
    this.name = 'EditSolution';
    this.solution = solution;
    this.param = param || {};
  }
  execute() {
    this.oldValue = this.solution.getAtt(this.param.url);
    this.solution.setAtt(this.param.url, this.param.value, true);
    var eventObj = { type: 'solution-edit', operate: this.param.type, solution: this.solution };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.solution, operate: eventObj });
  }
  undo() {
    this.solution.setAtt(this.param.url, this.oldValue, true);
    var eventObj = { type: 'solution-edit', operate: this.param.type, solution: this.solution };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.solution, operate: eventObj });
  }
}
