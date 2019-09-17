import Command from "../Command";
import TYPES from '../../../types'
export default class RemoveSolutionCommand extends Command {
  constructor(manager, solution) {
    super(manager);
    this.type = 'RemoveSolutionCommand';
    this.name = 'RemoveSolution';
    this.solution = solution;
  }
  execute() {
    this.manager.removeSolution(this.solution.getKey(), true, (solution) => {
      var eventObj = { type: TYPES['solution-remove'], solution: solution };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: solution, operate: eventObj });
    });
  }
  undo() {
    this.manager.addSolution(this.solution, null, true, (solution) => {
      var eventObj = { type: TYPES['solution-add'], solution: solution, onprogress: null };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: solution, operate: eventObj });
    });
  }
}
