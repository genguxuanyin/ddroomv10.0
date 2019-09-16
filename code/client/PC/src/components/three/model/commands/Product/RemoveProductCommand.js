import Command from "../Command";

export default class RemoveProductCommand extends Command {
  constructor(manager, product) {
    super(manager);
    this.type = 'RemoveProductCommand';
    this.name = 'RemoveProduct';
    this.product = product;
  }
  execute() {
    this.product.solution.removeProduct(this.product.getKey(), true, (product) => {
      var eventObj = { type: 'product-remove', solution: product.solution, product: product };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: 'solution-changed', solution: product.solution, operate: eventObj });
    });
  }
  undo() {
    this.product.solution.addProduct(this.product, null, true, (product) => {
      var eventObj = { type: 'product-add', solution: product.solution, product: product, onprogress: null };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: 'solution-changed', solution: product.solution, operate: eventObj });
    });
  }
}
