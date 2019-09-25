import Command from '../Command'
import TYPES from '../../../types'
export default class RemoveProductCommand extends Command {
  constructor(manager, parent, product) {
    super(manager);
    this.type = 'RemoveProductCommand';
    this.name = 'RemoveProduct';
    this.parent = parent;
    this.product = product;
  }
  execute() {
    this.parent.removeProduct(this.product.getKey(), true, true, false);
    var eventObj = { type: TYPES['product-remove'], product: this.product };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
  undo() {
    this.parent.addProduct(this.product, null, true, true, false);
    var eventObj = { type: TYPES['product-add'], product: this.product, onprogress: null };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
}
