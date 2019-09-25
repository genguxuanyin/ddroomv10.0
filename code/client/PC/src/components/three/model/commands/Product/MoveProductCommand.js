import Command from '../Command'
import TYPES from '../../../types'
export default class MoveProductCommand extends Command {
  constructor(manager, product, receiver, before) {
    super(manager);
    this.type = 'MoveProductCommand';
    this.name = 'MoveProduct';
    this.product = product;
    this.receiver = receiver;
    this.before = before;
    this.sender = product.getParent();
  }
  execute() {
    this.product.moveTo(this.receiver, true);
    var eventObj = { type: TYPES['product-move'], product: this.product, receiver: this.receiver };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
  undo() {
    this.product.moveTo(this.sender, true);
    var eventObj = { type: TYPES['product-move'], product: this.product, receiver: this.sender };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
}
