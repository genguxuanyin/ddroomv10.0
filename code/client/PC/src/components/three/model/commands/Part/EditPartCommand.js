import Command from '../Command'
export default class EditPartCommand extends Command {
  constructor(manager, part, param) {
    super(manager);
    this.type = 'EditPartCommand';
    this.name = 'EditPart';
    this.part = part;
    this.param = param || {};
  }
  execute() {
    this.oldValue = this.part.getAtt(this.param.url);
    this.part.setAtt(this.param.url, this.param.value, true);
    var eventObj = { type: 'part-edit', operate: this.param.type, solution: this.part.product.solution, product: this.part.product, part: this.part, oldvalue: this.oldvalue };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.part.product.solution, product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.part.product.solution, operate: eventObj });
  }
  undo() {
    this.part.setAtt(this.param.url, this.oldValue, true);
    var eventObj = { type: 'editPart', operate: this.param.type, solution: this.part.product.solution, product: this.part.product, part: this.part, oldvalue: this.param.value };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'productChanged', solution: this.part.product.solution, product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solutionChanged', solution: this.part.product.solution, operate: eventObj });
  }
}
