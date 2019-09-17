import Command from '../Command'
import TYPES from '../../../types'
export default class AddPartCommand extends Command {
  constructor(manager, parent, part, onprogress) {
    super(manager)
    this.type = 'AddPartCommand';
    this.name = 'AddPart';
    this.parent = parent;
    this.part = part;
    this.onprogress = onprogress;
  }
  execute() {
    this.parent.addPart(this.part, this.onprogress, true, true, false);
    var eventObj = { type: TYPES['part-add'], part: this.part, onprogress: this.onprogress };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['product-changed'], product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: this.part.product.solution, operate: eventObj });
  }
  undo() {
    this.parent.removePart(this.part.getKey(), true, true, false);
    var eventObj = { type: TYPES['part-remove'], part: this.part };
    this.manager.dispatchEvent(eventObj);
    this.manager.dispatchEvent({ type: TYPES['product-changed'], product: this.part.product, operate: eventObj });
    this.manager.dispatchEvent({ type: TYPES['solution-changed'], solution: this.part.product.solution, operate: eventObj });
  }
}
