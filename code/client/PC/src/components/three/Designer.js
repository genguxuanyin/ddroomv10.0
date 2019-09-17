import Scene3D from './Scene3D'
import SolutionManager from './model/SolutionManager'
import Solution3DManager from './model3d/Solution3DManager'

import model from './model/InitModel'

export default class Designer {
  constructor() {
    this.scene3d = new Scene3D();
    this.solutionManager = new SolutionManager();
    this.solution3DManager = new Solution3DManager(this.solutionManager, this.scene3d);
  }
  init() {
    this.scene3d.init();
    this.solution3DManager.init();
    this.solutionManager.init(model);
    console.log(this.solutionManager)
    console.log(this.solution3DManager)
  }
}
