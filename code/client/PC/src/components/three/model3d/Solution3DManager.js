import {
  EventDispatcher
} from 'three'
import Product3DCache from './Product3DCache'
import Solution3D from './Solution3D'
import TYPES from '../types'
import {
  fromStrToArray
} from '../util'

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
      var solution3d = this.getSolution3d(activeSolution.getKey());
      this.setActiveSolution3d(solution3d);
    });

    this.solutionManager.addEventListener(TYPES['product-add'], ({ product, onprogress }) => {
      var solution3d = this.getSolution3d(product.solution.getKey());
      var parent = product.getParent();
      if (solution3d) {
        if (parent.getClass('cl') === 'S') {
          solution3d.buildProduct3d(product, onprogress);
        } else {
          var parent3d = solution3d.getProduct3dFromProduct(parent);
          parent3d.buildProduct3d(product, onprogress);
        }
      }
    });
    this.solutionManager.addEventListener(TYPES['product-remove'], ({ product }) => {
      var solution3d = this.getSolution3d(product.solution.getKey());
      var product3d = solution3d.getProduct3dFromProduct(product);
      product3d && product3d.remove();
    });
    this.solutionManager.addEventListener(TYPES['product-edit'], ({ product, url }) => {
      var solution3d = this.getSolution3d(product.solution.getKey());
      var product3d = solution3d.getProduct3dFromProduct(product);
      product3d && product3d.setProduct3dAtt(url);
    });
    this.solutionManager.addEventListener(TYPES['product-move'], ({ product, receiver }) => {
      var solution3d = this.getSolution3d(product.solution.getKey());
      var product3d = solution3d.getProduct3dFromProduct(product);
      var receiver3d;
      if (receiver.getClass() === 'S') {
        receiver3d = solution3d;
      } else {
        receiver3d = solution3d.getProduct3dFromProduct(receiver);
      }
      product3d.moveTo(receiver3d);
    });
    this.solutionManager.addEventListener(TYPES['product-changed-active'], ({ activeProduct }) => {
      var solution3d = this.getSolution3d(activeProduct.solution.getKey());
      if (solution3d) {
        solution3d.setActiveProduct3d(solution3d.getProduct3dFromProduct(activeProduct));
      }
    });

    this.addEventListener(TYPES['product3d-add'], ({ product3d }) => {
      var product = product3d.getProduct();
      var model = product.getModel();
      var product3DCache = this.caches[model.i];
      if (!product3DCache) {
        product3DCache = new Product3DCache(model.i);
        this.caches[model.i] = product3DCache;
        if (model.cache) {
          product3DCache.init(product3d, (state) => {
            if (!state) {
              delete this.caches[model.i];
            }
          });
        }
      }
      product3DCache.increase();
    });
    this.addEventListener(TYPES['product3d-remove'], ({ product3d }) => {
      var product = product3d.getProduct();
      var model = product.getModel();
      var product3DCache = this.caches[model.i];
      if (product3DCache) {
        product3DCache.decrease();
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
        type: TYPES['solution3d-add'],
        solution: solution,
        solution3d: solution3d,
        rootGroup: solution3d.getGroup()
      });
      return solution3d;
    }
  }
  removeSolution3d(solution) {
    if (solution) {
      const k = solution.getKey();
      const solution3d = this.getSolution3d(k);
      if (solution3d) {
        solution3d.uninit();
        delete this._solutions3d[k];
        this._solution3dCount--;
        const solutionGroup = solution3d.getGroup();
        solutionGroup.free();
        this.dispatchEvent({
          type: TYPES['solution3d-remove'],
          solution3d: solution3d
        });
        return solution3d;
      }
    }
  }
  editSolution3d(solution, url) {
    if (solution) {
      const k = solution.getKey();
      const newValue = solution.getAtt(url);
      const solution3d = this.getSolution3d(k);
      const group = solution3d.getGroup();
      switch (url) {
        case 'p':
          group.position.fromArray(fromStrToArray(newValue));
          break;
      }
    }
  }
  setActiveSolution3d(solution3d) {
    if (solution3d) {
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
  getActiveProduct3d(solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getActiveProduct3d() : undefined;
  }
  getProduct(key, solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getProduct(key) : undefined;
  }
  getProduct3d(key, solution3d) {
    solution3d = solution3d || this.activeSolution3d;
    return solution3d ? solution3d.getProduct3d(key) : undefined;
  }
  getCache(name) {
    return this.caches[name];
  }
  checkCache(model, func) {
    if (model && model.cache) {
      var cache = this.getCache(model.i);
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
