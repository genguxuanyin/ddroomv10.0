import Command from '../Command'
import TYPES from '../../../types'
export default class EditPartCommand extends Command {
  constructor(manager, part, param) {
    super(manager);
    this.type = 'EditPartCommand';
    this.name = 'EditPart';
    this.part = part;
    this.param = param || {};
    this.oldValue = this.part.getAtt(this.param.url);
  }
  execute() {
    this.part.setAtt(this.param.url, this.param.value, true);
    var eventObj = { type: TYPES['part-edit'], part: this.part, url: this.param.url };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['product-changed'], product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: this.part.product.solution, operate: eventObj });
  }
  undo() {
    this.part.setAtt(this.param.url, this.oldValue, true);
    var eventObj = { type: TYPES['part-edit'], part: this.part, url: this.param.url };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['product-changed'], product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: this.part.product.solution, operate: eventObj });
  }
}
