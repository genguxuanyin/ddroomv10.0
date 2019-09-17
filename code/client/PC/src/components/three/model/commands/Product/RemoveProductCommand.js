import Command from "../Command";
import TYPES from '../../../types'
export default class RemoveProductCommand extends Command {
  constructor(manager, product) {
    super(manager);
    this.type = 'RemoveProductCommand';
    this.name = 'RemoveProduct';
    this.product = product;
  }
  execute() {
    this.product.solution.removeProduct(this.product.getKey(), true, (product) => {
      var eventObj = { type: TYPES['product-remove'], product: product };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: product.solution, operate: eventObj });
    });
  }
  undo() {
    this.product.solution.addProduct(this.product, null, true, (product) => {
      var eventObj = { type: TYPES['product-add'], product: product, onprogress: null };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: product.solution, operate: eventObj });
    });
  }
}
