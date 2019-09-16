/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */
export default class History {
  constructor(manager) {
    this.manager = manager;
    this.undos = [];
    this.redos = [];
    this.lastCmdTime = new Date();
    this.idCounter = 0;

    this.historyDisabled = false;
    // this.config = manager.config;

    this.manager.addEventListener('change-history-state', (ev) => {
      this.historyDisabled = ev.value;
    });
  }
  execute(cmd, optionalName) {
    var lastCmd = this.undos[this.undos.length - 1];
    var timeDifference = new Date().getTime() - this.lastCmdTime.getTime();

    var isUpdatableCmd = lastCmd &&
			lastCmd.updatable &&
			cmd.updatable &&
			lastCmd.object === cmd.object &&
			lastCmd.type === cmd.type &&
			lastCmd.script === cmd.script &&
			lastCmd.attributeName === cmd.attributeName;

    if (isUpdatableCmd && cmd.type === "SetScriptValueCommand") {
      // When the cmd.type is "SetScriptValueCommand" the timeDifference is ignored

      lastCmd.update(cmd);
      cmd = lastCmd;
    } else if (isUpdatableCmd && timeDifference < 500) {
      lastCmd.update(cmd);
      cmd = lastCmd;
    } else {
      // the command is not updatable and is added as a new part of the history

      this.undos.push(cmd);
      cmd.id = ++this.idCounter;
    }
    cmd.name = (optionalName !== undefined) ? optionalName : cmd.name;
    cmd.execute();
    cmd.inMemory = true;

    // if (this.config.getKey('settings/history')) {
    //   cmd.json = cmd.toJSON();	// serialize the cmd immediately after execution and append the json to the cmd
    // }
    this.lastCmdTime = new Date();

    // clearing all the redo-commands

    this.redos = [];
    this.manager.dispatchEvent(cmd);
  }
  undo() {
    if (this.historyDisabled) {
      console.log("Undo/Redo disabled while scene is playing.");
      return;
    }

    var cmd;

    if (this.undos.length > 0) {
      cmd = this.undos.pop();

      if (cmd.inMemory === false) {
        cmd.fromJSON(cmd.json);
      }
    }

    if (cmd !== undefined) {
      cmd.undo();
      this.redos.push(cmd);
      this.manager.dispatchEvent(cmd);
    }

    return cmd;
  }
  redo() {
    if (this.historyDisabled) {
      console.log("Undo/Redo disabled while scene is playing.");
      return;
    }

    var cmd;

    if (this.redos.length > 0) {
      cmd = this.redos.pop();

      if (cmd.inMemory === false) {
        cmd.fromJSON(cmd.json);
      }
    }

    if (cmd !== undefined) {
      cmd.execute();
      this.undos.push(cmd);
      this.manager.dispatchEvent(cmd);
    }

    return cmd;
  }
  getUndoCmd() {
    var cmd;
    if (this.undos.length > 0) {
      cmd = this.undos[this.undos.length - 1];
    }
    return cmd;
  }
  getRedoCmd() {
    var cmd;
    if (this.redos.length > 0) {
      cmd = this.redos[this.redos.length - 1];
    }
    return cmd;
  }
  toJSON() {
    var history = {};
    history.undos = [];
    history.redos = [];

    // if (!this.config.getKey('settings/history')) {
    //   return history;
    // }

    // Append Undos to History

    var i;
    for (i = 0; i < this.undos.length; i++) {
      if (this.undos[i].hasOwnProperty("json")) {
        history.undos.push(this.undos[i].json);
      }
    }

    // Append Redos to History

    for (i = 0; i < this.redos.length; i++) {
      if (this.redos[i].hasOwnProperty("json")) {
        history.redos.push(this.redos[i].json);
      }
    }

    return history;
  }
  fromJSON(json) {
    if (json === undefined) return;
    var i, cmdJSON, cmd;
    for (i = 0; i < json.undos.length; i++) {
      cmdJSON = json.undos[i];
      cmd = new window[cmdJSON.type]();	// creates a new object of type "json.type"
      cmd.json = cmdJSON;
      cmd.id = cmdJSON.id;
      cmd.name = cmdJSON.name;
      this.undos.push(cmd);
      this.idCounter = (cmdJSON.id > this.idCounter) ? cmdJSON.id : this.idCounter; // set last used idCounter
    }

    for (i = 0; i < json.redos.length; i++) {
      cmdJSON = json.redos[i];
      cmd = new window[cmdJSON.type]();	// creates a new object of type "json.type"
      cmd.json = cmdJSON;
      cmd.id = cmdJSON.id;
      cmd.name = cmdJSON.name;
      this.redos.push(cmd);
      this.idCounter = (cmdJSON.id > this.idCounter) ? cmdJSON.id : this.idCounter; // set last used idCounter
    }

    // Select the last executed undo-command
    this.manager.dispatchEvent(this.undos[this.undos.length - 1]);
  }
  clear() {
    this.undos = [];
    this.redos = [];
    this.idCounter = 0;

    this.manager.dispatchEvent({
      type: 'clear-history'
    });
  }
  goToState(id) {
    if (this.historyDisabled) {
      console.log("Undo/Redo disabled while scene is playing.");
      return;
    }

    // this.manager.signals.sceneGraphChanged.active = false;
    // this.manager.signals.historyChanged.active = false;

    var cmd = this.undos.length > 0 ? this.undos[this.undos.length - 1] : undefined;	// next cmd to pop

    if (cmd === undefined || id > cmd.id) {
      cmd = this.redo();
      while (cmd !== undefined && id > cmd.id) {
        cmd = this.redo();
      }
    } else {
      while (typeof x === "undefined") {
        cmd = this.undos[this.undos.length - 1];	// next cmd to pop

        if (cmd === undefined || id === cmd.id) break;

        this.undo();
      }
    }

    // this.manager.signals.sceneGraphChanged.active = true;
    // this.manager.signals.historyChanged.active = true;

    this.manager.dispatchEvent();
    this.manager.dispatchEvent(cmd);
  }
  enableSerialization(id) {
    /**
		 * because there might be commands in this.undos and this.redos
		 * which have not been serialized with .toJSON() we go back
		 * to the oldest command and redo one command after the other
		 * while also calling .toJSON() on them.
		 */

    this.goToState(-1);

    // this.manager.signals.sceneGraphChanged.active = false;
    // this.manager.signals.historyChanged.active = false;

    var cmd = this.redo();
    while (cmd !== undefined) {
      if (!cmd.hasOwnProperty("json")) {
        cmd.json = cmd.toJSON();
      }
      cmd = this.redo();
    }

    // this.manager.signals.sceneGraphChanged.active = true;
    // this.manager.signals.historyChanged.active = true;

    this.goToState(id);
  }
}
