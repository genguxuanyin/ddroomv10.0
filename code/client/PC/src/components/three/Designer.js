import Event from './Event'
import TYPES from './types'
import Scene3D from './Scene3D'
import SolutionManager from './model/SolutionManager'
import Solution3DManager from './model3d/Solution3DManager'

// import model from './model/InitModel'
import model from './model/model'
import '../../utils/hotkeys'
import Wall from './design/Wall'
import CeilingFloor from './design/CeilingFloor'

export default new class Designer {
  constructor() {
    this.scene3d = new Scene3D();
    this.solutionManager = new SolutionManager();
    this.solution3DManager = new Solution3DManager(this.solutionManager, this.scene3d);
    this.event = new Event(this);
    this.wall = new Wall(this);
    this.ceilingFloor = new CeilingFloor(this);
    this.event.addEventListener(TYPES['menu-click'] + '-distribute', ({ command, param }) => {
      if (!Array.isArray(command)) {
        command = [command];
      }
      if (!Array.isArray(param)) {
        param = [param];
      }
      command.forEach((c, i) => {
        this[c] && this[c](param[i] ? param[i] : param[0])
      })
    })
    this.event.addEventListener(TYPES['common'], ({ command, param }) => {
      if (!Array.isArray(command)) {
        command = [command];
      }
      if (!Array.isArray(param)) {
        param = [param];
      }
      command.forEach((c, i) => {
        this[c] && this[c](param[i] ? param[i] : param[0])
      })
    })
  }
  init() {
    this.scene3d.init();
    this.solution3DManager.init();
    this.solutionManager.init(model, () => {
      // console.log(arguments)
    });
    this.event.init();
    console.log(this.solutionManager);
    console.log(this.solution3DManager);
  }
  changeView(param) {
    switch (param.viewState) {
      case 'two':
        this.scene3d.to2d()
        break
      case 'three':
        this.scene3d.to3d()
        break
      case 'fv':
        this.scene3d.toFv()
        break
    }
  }
  undo(ev) {
    this.solutionManager.undo()
  }
  redo(ev) {
    this.solutionManager.redo()
  }
}()
