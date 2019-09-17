import {
  EventDispatcher
} from 'three'
import Part3dCache from './Part3dCache'
import Solution3D from './Solution3D'
import TYPES from '../types'

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
    this.solutionManager.addEventListener(TYPES['solution-add'], ({ solution, onprogress }) => {
      this.addSolution3d(solution, onprogress);
    });
    this.solutionManager.addEventListener(TYPES['solution-remove'], ({ solution }) => {
      this.removeSolution3d(solution);
    });
    this.solutionManager.addEventListener(TYPES['solution-edit'], ({ solution, url }) => {
      this.editSolution3d(solution, url);
    });
    this.solutionManager.addEventListener(TYPES['solution-changed-active'], ({ activeSolution, oldActiveSolution }) => {
      this.setActiveSolution3d(activeSolution, oldActiveSolution);
    });

    this.solutionManager.addEventListener(TYPES['product-add'], ({ product, onprogress }) => {
      var solution3d = this.getSolution3d(product.solution.getKey());
      if (solution3d) {
        solution3d.addProduct3d(product, onprogress);
      }
    });
    this.solutionManager.addEventListener(TYPES['product-remove'], ({ product }) => {
      var solution3d = this.getSolution3d(product.solution.getKey());
      if (solution3d) {
        solution3d.removeProduct3d(product);
      }
    });
    this.solutionManager.addEventListener(TYPES['product-edit'], ({ product, url }) => {
      var solution3d = this.getSolution3d(product.solution.getKey());
      if (solution3d) {
        solution3d.setProduct3dAtt(product, url);
      }
    });
    this.solutionManager.addEventListener(TYPES['product-changed-active'], ({ activeProduct }) => {
      var solution3d = this.getSolution3d(activeProduct.solution.getKey());
      if (solution3d) {
        solution3d.setActiveProduct3d(activeProduct);
      }
    });
    this.solutionManager.addEventListener(TYPES['part-add'], ({ part, onprogress }) => {
      var solution3d = this.getSolution3d(part.product.solution.getKey());
      if (solution3d) {
        solution3d.addPart3d(part, onprogress);
      }
    });
    this.solutionManager.addEventListener(TYPES['part-remove'], ({ part }) => {
      var solution3d = this.getSolution3d(part.product.solution.getKey());
      if (solution3d) {
        solution3d.removePart3d(part);
      }
    });
    this.solutionManager.addEventListener(TYPES['part-edit'], ({ part, url }) => {
      var solution3d = this.getSolution3d(part.product.solution.getKey());
      if (solution3d) {
        solution3d.setPart3dAtt(part, url);
      }
    });
    this.solutionManager.addEventListener(TYPES['part-move'], ({ part, sender, receiver }) => {
      var solution3d = this.getSolution3d(part.product.solution.getKey());
      if (solution3d) {
        solution3d.movePart3d(part, sender, receiver);
      }
    });
    this.solutionManager.addEventListener(TYPES['part-changed-active'], ({ activePart, oldActivePart }) => {
      var solution3d = this.getSolution3d(activePart.product.solution.getKey());
      if (solution3d) {
        solution3d.setActivePart3d(activePart);
      }
    });

    this.addEventListener(TYPES['part-add'], ({ part, part3d }) => {
      var model = part.getModel();
      var part3dCache = this.caches[model.parkId];
      if (!part3dCache) {
        part3dCache = new Part3dCache(model.parkId);
        this.caches[model.parkId] = part3dCache;
        if (model.cache) {
          part3dCache.init(part3d, (state) => {
            if (!state) {
              delete this.caches[model.parkId];
            }
          });
        }
      }
      part3dCache.increase();
    });
    this.addEventListener(TYPES['part-remove'], ({ part }) => {
      var model = part.getModel();
      var part3dCache = this.caches[model.parkId];
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
        type: TYPES['solution-add'],
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
          type: TYPES['solution-remove'],
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
