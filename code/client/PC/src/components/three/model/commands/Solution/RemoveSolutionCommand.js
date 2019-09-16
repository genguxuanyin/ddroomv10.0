import Command from "../Command";

export default class RemoveSolutionCommand extends Command {
  constructor(manager, solution) {
    super(manager);
    this.type = 'RemoveSolutionCommand';
    this.name = 'RemoveSolution';
    this.solution = solution;
  }
  execute() {
    this.manager.removeSolution(this.solution.getKey(), true, (solution) => {
      var eventObj = { type: 'solution-remove', solution: solution };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: 'solution-changed', solution: solution, operate: eventObj });
    });
  }
  undo() {
    this.manager.addSolution(this.solution, null, true, (solution) => {
      var eventObj = { type: 'solution-add', solution: solution, onprogress: null };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: 'solution-changed', solution: solution, operate: eventObj });
    });
  }
}
