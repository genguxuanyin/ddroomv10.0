import Command from "../Command";

export default class EditProductCommand extends Command {
  constructor(manager, product, param) {
    super(manager);
    this.type = 'EditProductCommand';
    this.name = 'EditProduct';
    this.product = product;
    this.param = param || {};
  }
  execute() {
    this.oldValue = this.product.getAtt(this.param.url);
    this.product.setAtt(this.param.url, this.param.value, true);
    var eventObj = { type: 'product-edit', operate: this.param.type, solution: this.product.solution, product: this.product };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.product.solution, product: this.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.product.solution, operate: eventObj });
  }
  undo() {
    this.product.setAtt(this.param.url, this.oldValue, true);
    var eventObj = { type: 'product-edit', operate: this.param.type, solution: this.product.solution, product: this.product };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: 'product-changed', solution: this.product.solution, product: this.product, operate: eventObj });
    this.manager.dispatchEvent({ type: 'solution-changed', solution: this.product.solution, operate: eventObj });
  }
}
