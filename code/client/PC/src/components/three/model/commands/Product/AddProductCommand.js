import Command from "../Command";
import TYPES from '../../../types'
export default class AddProductCommand extends Command {
  constructor(manager, product, onprogress) {
    super(manager);
    this.type = 'AddProductCommand';
    this.name = 'AddProduct';
    this.product = product;
    this.onprogress = onprogress;
  }
  execute() {
    this.product.solution.addProduct(this.product, this.onprogress, true, (product) => {
      var eventObj = { type: TYPES['product-add'], product: product, onprogress: this.onprogress };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: product.solution, operate: eventObj });
    });
  }
  undo() {
    this.product.solution.removeProduct(this.product.getKey(), true, (product) => {
      var eventObj = { type: TYPES['product-remove'], product: product };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: product.solution, operate: eventObj });
    });
  }
}
