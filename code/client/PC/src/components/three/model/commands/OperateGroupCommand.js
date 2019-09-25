import Command from "./Command";

export default class OperateGroupCommand extends Command {
  constructor(param) {
    super();
    this.type = 'OperateGroupCommand';
    this.name = 'OperateGroup';
    this.param = param || {};
    this.isRedo = false;
  }
  execute() {
    if (this.isRedo && this.param.type === 'begin') {
      var cmd = this.param.operate.getRedoCmd();
      while (cmd) {
        this.param.operate.redo();
        if (cmd.type === 'OperateGroupCommand' && cmd.param.type === 'end') {
          break;
        }
        cmd = this.param.operate.getRedoCmd();
      }
    }
    this.isRedo = true;
  }
  undo() {
    if (this.param.type === 'end') {
      var cmd = this.param.operate.getUndoCmd();
      while (cmd) {
        this.param.operate.undo();
        if (cmd.type === 'OperateGroupCommand' && cmd.param.type === 'begin') {
          break;
        }
        cmd = this.param.operate.getUndoCmd();
      }
    }
  }
}
