import Command from '../Command'
export default class MovePartCommand extends Command {
  constructor(manager, part, receiver, before) {
    super(manager);
    this.type = 'MovePartCommand';
    this.name = 'MovePart';
    this.part = part;
    this.receiver = receiver;
    this.before = before;
    this.sender = part.getParent();
  }
  execute() {
    this.part.moveTo(this.receiver, true);
    var eventObj = { type: 'part-move', solution: this.part.product.solution, product: this.part.product, part: this.part, sender: this.sender, receiver: this.receiver };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.part.product.solution, product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.part.product.solution, operate: eventObj });
  }
  undo() {
    this.part.moveTo(this.sender, true);
    var eventObj = { type: 'part-move', solution: this.part.product.solution, product: this.part.product, part: this.part, sender: this.receiver, receiver: this.sender };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.part.product.solution, product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.part.product.solution, operate: eventObj });
  }
}
