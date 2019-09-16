import {
  EventDispatcher,
  Scene
} from 'three'
import Part3dCache from './Part3dCache'
import Solution3D from './Solution3D'

export default class Solution3DManager extends EventDispatcher {
  constructor(solutionManager, scene3D) {
    super();
    this.solutionManager = solutionManager;
    this._solutions3d = {};
    this._solution3dCount = 0;
    this.scene3D = scene3D;
    this.rootGroup = scene3D.rootGroup;
    this.caches = {};
  }
  init() {
    this.solutionManager.addEventListener('solution-add', (ev) => {
      this.addSolution3d(ev.solution, ev.onprogress);
    });
    this.solutionManager.addEventListener('solution-remove', (ev) => {
      this.removeSolution3d(ev.solution);
    });
    this.solutionManager.addEventListener('solution-edit', (ev) => {
      this.editSolution3d(ev.solution);
    });
    this.solutionManager.addEventListener('solution-changed-active', (ev) => {
      this.setActiveSolution3d(ev.activeSolution);
    });

    this.solutionManager.addEventListener('product-add', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        solution3d.addProduct3d(ev.product, ev.onprogress);
      }
    });
    this.solutionManager.addEventListener('product-remove', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        solution3d.removeProduct3d(ev.product);
      }
    });
    this.solutionManager.addEventListener('product-edit', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        switch (ev.operate) {
          case 'setPosition':
            solution3d.setProductPosition(ev.product);
            break;
          case 'setScale':
            solution3d.setProductScale(ev.product);
            break;
          case 'setAngle':
            solution3d.setProductAngle(ev.product);
            break;
        }
      }
    });
    this.solutionManager.addEventListener('product-changed-active', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        solution3d.setActiveProduct3d(ev.activeProduct);
      }
    });

    this.solutionManager.addEventListener('part-add', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        solution3d.addPart3d(ev.part, ev.onprogress);
      }
    });
    this.solutionManager.addEventListener('part-remove', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        solution3d.removePart3d(ev.part);
      }
    });
    this.solutionManager.addEventListener('part-edit', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        switch (ev.operate) {
          case 'setPosition':
            solution3d.setPartPosition(ev.part);
            break;
          case 'setScale':
            solution3d.setPartScale(ev.part);
            break;
          case 'setMaterial':
            solution3d.setPartMaterial(ev.part, ev.oldvalue);
            break;
          case 'setTextureDir':
            solution3d.setTextureDir(ev.part);
            break;
          case 'setAngle':
            solution3d.setPartAngle(ev.part);
            break;
          case 'setPath':
          case 'setHeight':
          case 'setWidth':
            solution3d.setPartParms(ev.part);
            break;
          case 'setOpenType':
            solution3d.setPartOpenType(ev.part);
            break;
          case 'setBoardType':
            solution3d.setPartBoardType(ev.part);
            break;
        }
        const baseModel = ev.part.getModel().baseModel;
        // if(baseModel&&baseModel.oldPath){
        solution3d.manager3d.dispatchEvent({
          type: 'part-edit',
          part: ev.part,
          operate: ev.operate,
          oldPath: baseModel.oldPath
        });
        // }
      }
    });
    this.solutionManager.addEventListener('part-move', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        solution3d.movePart3d(ev.part, ev.sender, ev.receiver);
      }
    });
    this.solutionManager.addEventListener('part-changed-active', (ev) => {
      var solution3d = this.getSolution3d(ev.solution.getKey());
      if (solution3d) {
        solution3d.setActivePart3d(ev.activePart);
      }
    });

    this.addEventListener('part-add', (ev) => {
      var model = ev.part.getModel();
      var part3dCache = this.caches[model.parkId];
      if (!part3dCache) {
        part3dCache = new Part3dCache(model.parkId);
        this.caches[model.parkId] = part3dCache;
        if (model.cache) {
          part3dCache.init(ev.part3d, function(state) {
            if (!state) {
              delete this.caches[model.parkId];
            }
          });
        }
      }
      part3dCache.increase();
    });
    this.addEventListener('part-remove', (ev) => {
      var model = ev.part.getModel();
      var part3dCache = this.caches[model.name];
      if (part3dCache) {
        part3dCache.decrease();
      }
    });
  }
  getSolution(key) {
    return this.solutionManager.getSolution(key);
  }
  getRootGroup() {
    return this.rootGroup;
  }
  getSolution3dCount() {
    return this._solution3dCount;
  }
  getSolution3d(key) {
    return this._solutions3d[key];
  }
  addSolution3d(solution, onprogress) {
    if (solution) {
      const solution3d = new Solution3D(this, solution);
      this._solutions3d[solution3d.getKey()] = solution3d;
      this._solution3dCount++;
      solution3d.init(solution, onprogress);
      this.dispatchEvent({
        type: 'solution-add',
        solution: solution,
        solution3d: solution3d,
        rootGroup: solution3d.getSolutionGroup()
      });
      return solution3d;
    }
  }
  removeSolution3d(solution) {
    if (solution) {
      const key = solution.getKey();
      const solution3d = this.getSolution3d(key);
      if (solution3d) {
        solution3d.uninit();
        delete this._solutions3d[key];
        this._solution3dCount--;
        const solutionGroup = solution3d.getSolutionGroup();
        this.rootGroup.remove(solutionGroup);
        solutionGroup.free();
        if (solution.isActive()) {
          this.removeCtrl();
        }
        this.dispatchEvent({
          type: 'solution-remove',
          solution: solution,
          solution3d: solution3d,
          solutionGroup: solutionGroup
        });
        return solution3d;
      }
    }
  }
  setActiveSolution3d(solution) {
    if (solution) {
      const solution3d = this.getSolution3d(solution.getKey());
      if (solution3d !== this.activeSolution3d) {
        this.activeSolution3d = solution3d;
        this.activeSolution = solution3d ? solution3d.getSolution() : undefined;
        if (this.activeSolution3d && this.activeSolution3d.activeProduct3d === undefined) {
          const activeProduct = this.activeSolution.getActiveProduct();
          if (activeProduct) {
            this.activeSolution3d.setActiveProduct3d(activeProduct);
          }
        }
      }
    }
  }
  getActiveSolution() {
    return this.activeSolution;
  }
  getActiveSolution3d() {
    return this.activeSolution3d;
  }
  getActiveProduct(solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getActiveProduct() : undefined;
  }
  getActivePart(solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getActivePart() : undefined;
  }
  getActiveProduct3d(solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getActiveProduct3d() : undefined;
  }
  getActivePart3d(solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getActivePart3d() : undefined;
  }
  getActivePartGroup(solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getActivePartGroup() : undefined;
  }
  getPart3dFromGroup(group, solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getPart3dFromGroup(group) : undefined;
  }
  getProduct(key, solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getProduct(key) : undefined;
  }
  getProduct3d(key, solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getProduct3d(key) : undefined;
  }
  getPart(productKey, partKey, solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getPart(productKey, partKey) : undefined;
  }
  getPart3d(productKey, partKey, solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getPart3d(productKey, partKey) : undefined;
  }
  getCache(name) {
    return this.caches[name];
  }
  checkCache(model, func) {
    if (model && model.cache) {
      var cache = this.getCache(model.parkId);
      if (cache) {
        return cache.cloneGroup(func);
      }
    }
    if (func) {
      func(null);
    }
    return null;
  }
  getCacheGroup(name, func) {
    var cache = this.getCache(name);
    if (cache) {
      return cache.getGroup(func);
    } else if (func) {
      func(null);
    }
    return null;
  }
  getCacheModel(name) {
    var cache = this.getCache(name);
    return cache ? cache.getModel() : null;
  }
  getCacheNumber(name) {
    var cache = this.getCache(name);
    return cache ? cache.getNumber() : 0;
  }
}
