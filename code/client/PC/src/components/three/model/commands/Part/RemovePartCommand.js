import Command from '../Command'
export default class RemovePartCommand extends Command {
  constructor(manager, parent, part) {
    super(manager);
    this.type = 'RemovePartCommand';
    this.name = 'RemovePart';
    this.parent = parent;
    this.part = part;
  }
  execute() {
    this.parent.removePart(this.part.getKey(), true, true, false);
    var eventObj = { type: 'part-remove', solution: this.part.product.solution, product: this.part.product, part: this.part };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.part.product.solution, operate: eventObj });
  }
  undo() {
    this.parent.addPart(this.part, null, true, true, false);
    var eventObj = { type: 'part-add', solution: this.part.product.solution, product: this.part.product, part: this.part, onprogress: null };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.part.product.solution, product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.part.product.solution, operate: eventObj });
  }
}
