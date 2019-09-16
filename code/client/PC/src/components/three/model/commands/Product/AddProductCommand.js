import Command from "../Command";

export default class AddProductCommand extends Command {
  constructor(manager, product, onprogress) {
    super(manager);
    this.type = 'AddProductCommand';
    this.name = 'AddProduct';
    this.product = product;
    this.onprogress = onprogress;
  }
  execute() {
    var me = this;
    this.product.solution.addProduct(this.product, this.onprogress, true, (product) => {
      var eventObj = { type: 'product-add', solution: product.solution, product: product, onprogress: me.onprogress };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: 'solution-changed', solution: product.solution, operate: eventObj });
    });
  }
  undo() {
    this.product.solution.removeProduct(this.product.getKey(), true, (product) => {
      var eventObj = { type: 'product-remove', solution: product.solution, product: product };
      this.manager.dispatchEvent(eventObj);
      this.manager.dispatchEvent({ type: 'solution-changed', solution: product.solution, operate: eventObj });
    });
  }
}
