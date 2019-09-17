import Command from "../Command";
import TYPES from '../../../types'
export default class AddSolutionCommand extends Command {
  constructor(manager, solution, onprogress) {
    super(manager);
    this.type = 'AddSolutionCommand';
    this.name = 'AddSolution';
    this.solution = solution;
    this.onprogress = onprogress;
  }
  execute() {
    this.manager.addSolution(this.solution, this.onprogress, true, (solution) => {
      var eventObj = { type: TYPES['solution-add'], solution: solution, onprogress: this.onprogress };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: solution, operate: eventObj });
    });
  }
  undo() {
    this.manager.removeSolution(this.solution.getKey(), true, (solution) => {
      var eventObj = { type: TYPES['solution-remove'], solution: solution };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: solution, operate: eventObj });
    });
  }
}
