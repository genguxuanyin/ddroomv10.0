import Command from "./Command";

export default class MultiCmdsCommand extends Command {
  constructor(cmdArray) {
    super();
    this.type = 'MultiCmdsCommand';
    this.name = 'Multiple Changes';

    this.cmdArray = (cmdArray !== undefined) ? cmdArray : [];
  }
  execute() {
    for (var i = 0; i < this.cmdArray.length; i++) {
      this.cmdArray[i].execute();
    }
  }
  undo() {
    for (var i = this.cmdArray.length - 1; i >= 0; i--) {
      this.cmdArray[i].undo();
    }
  }
  toJSON() {
    var output = super.toJSON.call(this);

    var cmds = [];
    for (var i = 0; i < this.cmdArray.length; i++) {
      cmds.push(this.cmdArray[i].toJSON());
    }
    output.cmds = cmds;

    return output;
  }
  fromJSON(json) {
    super.fromJSON.call(this, json);

    var cmds = json.cmds;
    for (var i = 0; i < cmds.length; i++) {
      var cmd = new window[cmds[i].type]();	// creates a new object of type "json.type"
      cmd.fromJSON(cmds[i]);
      this.cmdArray.push(cmd);
    }
  }
}
