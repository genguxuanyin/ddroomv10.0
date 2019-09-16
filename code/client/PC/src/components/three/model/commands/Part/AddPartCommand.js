import Command from '../Command'
export default class AddPartCommand extends Command {
  constructor(manager, parent, part, onprogress) {
    super(manager)
    this.type = 'AddPartCommand';
    this.name = 'AddPart';
    this.parent = parent;
    this.part = part;
    this.onprogress = onprogress;
  }
  execute() {
    this.parent.addPart(this.part, this.onprogress, true, true, false);
    var eventObj = { type: 'part-add', solution: this.part.product.solution, product: this.part.product, part: this.part, onprogress: this.onprogress };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.part.product.solution, product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.part.product.solution, operate: eventObj });
  }
  undo() {
    this.parent.removePart(this.part.getKey(), true, true, false);
    var eventObj = { type: 'part-remove', solution: this.part.product.solution, product: this.part.product, part: this.part };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.part.product.solution, product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.part.product.solution, operate: eventObj });
  }
}
