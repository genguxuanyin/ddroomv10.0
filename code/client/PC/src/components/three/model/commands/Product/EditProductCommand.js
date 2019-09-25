import Command from '../Command'
import TYPES from '../../../types'
export default class EditProductCommand extends Command {
  constructor(manager, product, param) {
    super(manager);
    this.type = 'EditProductCommand';
    this.name = 'EditProduct';
    this.product = product;
    this.param = param || {};
    this.oldValue = this.product.getAtt(this.param.url);
  }
  execute() {
    this.product.setAtt(this.param.url, this.param.value, true);
    var eventObj = { type: TYPES['product-edit'], product: this.product, url: this.param.url };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
  undo() {
    this.product.setAtt(this.param.url, this.oldValue, true);
    var eventObj = { type: TYPES['product-edit'], product: this.product, url: this.param.url };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], operate: eventObj });
  }
}
