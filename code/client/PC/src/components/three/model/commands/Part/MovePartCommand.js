import Command from '../Command'
import TYPES from '../../../types'
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
    var eventObj = { type: TYPES['part-move'], part: this.part, sender: this.sender, receiver: this.receiver };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent(TYPES['product-changed'], { product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent(TYPES['solution-changed'], { solution: this.part.product.solution, operate: eventObj });
  }
  undo() {
    this.part.moveTo(this.sender, true);
    var eventObj = { type: TYPES['part-move'], part: this.part, sender: this.receiver, receiver: this.sender };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['product-changed'], product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: this.part.product.solution, operate: eventObj });
  }
}
