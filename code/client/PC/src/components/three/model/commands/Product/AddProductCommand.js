import Command from '../Command'
import TYPES from '../../../types'
export default class AddProductCommand extends Command {
  constructor(manager, parent, product, onprogress) {
    super(manager)
    this.type = 'AddProductCommand';
    this.name = 'AddProduct';
    this.parent = parent;
    this.product = product;
    this.onprogress = onprogress;
  }
  execute() {
    this.parent.addProduct(this.product, this.onprogress, true, true, false);
    var eventObj = { type: TYPES['product-add'], product: this.product, onprogress: this.onprogress };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
  undo() {
    this.parent.removeProduct(this.product.getKey(), true, true, false);
    var eventObj = { type: TYPES['product-remove'], product: this.product };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
}
