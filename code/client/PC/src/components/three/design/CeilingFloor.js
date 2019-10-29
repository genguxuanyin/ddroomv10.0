import {
  fromArraytoVector3,
  getDir
} from '../util'
import {
  differenceWith,
  intersection,
  cloneDeep,
  pullAll,
  groupBy
} from 'lodash'
import TYPES from '../types'
import shortid from 'shortid'
export default class CeilingFloor {
  constructor(designer) {
    this.designer = designer;
    this.event = designer.event;
    this.graphic = new Graphic();
    this.model = {
      t: 'Create', // type
      mt: 'Shapes', // mesh-type
      n: 'cf', // name
      // k: '5a6d21ad', // key
      h: '0,-2800',
      r: '0.5,0,0', // rotation
      pa: [ // path
        '0,0,1000',
        '2000,0,1000',
        '2000,0,4000',
        '0,0,4000'
      ],
      m: [{
        name: 'def',
        side: 1,
        map: 'http://f3d.ddroom.cn/upload/images/7723af81-49f7-4a75-b4dd-a3afe4e06fb3/2017-11-01112913/manguchuntian.jpg'
      }, {
        name: 'def',
        map: 'http://f3d.ddroom.cn/upload/images/7723af81-49f7-4a75-b4dd-a3afe4e06fb3/2017-11-01112913/manguchuntian.jpg'
      }]
    };
    this.event.addEventListener(TYPES['ceiling-floor-update'], (ev) => {
      this.update(ev);
    })
  }
  getActiveSolution() {
    return this.designer.solutionManager.getActiveSolution();
  }
  getArray(name) {
    var activeSolution = this.getActiveSolution();
    return activeSolution.getProductArrayFromName(name);
  }
  getAttArray(name, att) {
    var wallArray = this.getArray(name);
    return wallArray.map(w => w.getAtt(att));
  }
  getWallPointArray() { // 获取墙的所有端点,并去重
    return [...new Set(this.getAttArray('wall', 'pa').flat())];
  }
  buildGraph(cmds) {
    var removePaths = [];
    var paths = this.getAttArray('wall', 'pa');
    var cmdsGroup = groupBy(cmds, (c) => {
      return c[0];
    })
    Array.isArray(cmdsGroup['AddProductCommand']) && cmdsGroup['AddProductCommand'].forEach(a => {
      paths.push(a[2].getAtt('pa'));
    })
    Array.isArray(cmdsGroup['RemoveProductCommand']) && cmdsGroup['RemoveProductCommand'].forEach(r => {
      removePaths.push(r[2].getAtt('pa'));
    })
    pullAll(paths, removePaths);
    var points = [...new Set(paths.flat())];
    var graph = new Array(points.length).fill(1).map(_ => []);
    paths.forEach(p => {
      var i0 = points.indexOf(p[0]);
      var i1 = points.indexOf(p[1]);
      graph[i0].push(i1);
      graph[i1].push(i0);
    });
    return {
      graph,
      points
    }
  }
  update({
    cmds
  }) {
    var activeSolution = this.getActiveSolution();
    var {
      graph,
      points
    } = this.buildGraph(cmds);
    var twoDimPoints = fromArraytoVector3(points).map(p => {
      return {
        x: p.x,
        y: p.z
      }
    })
    this.graphic.asyncDetectCycles(graph, twoDimPoints, 0, (sycles) => {
      var cfArray = this.getArray('cf');
      var oldPaths = cfArray.map(w => w.getAtt('pa'));
      var newPaths = sycles.map(s => {
        var sPoints = s.map(_s => {
          return points[_s];
        })
        return this.deleteCollinePoint(sPoints)
      }); // 待完成 此处要检查新的路径共线的点，并删除
      var removePaths = differenceWith(oldPaths, newPaths, (o, n) => {
        return o.length === n.length && intersection(o, n).length === o.length;
      })
      var addPaths = differenceWith(newPaths, oldPaths, (o, n) => {
        return o.length === n.length && intersection(o, n).length === o.length;
      })
      var model;
      removePaths.forEach(rp => {
        var product = cfArray.find(cfp => {
          return cfp.getAtt('pa') === rp;
        })
        if (product) {
          cmds.push([
            'RemoveProductCommand',
            activeSolution,
            product
          ]);
        }
      })
      addPaths.forEach(ap => {
        model = cloneDeep(this.model)
        model.pa = ap;
        cmds.push([
          'AddProductCommand',
          activeSolution,
          activeSolution.createProduct(model)
        ]);
      });
    });
  }
  deleteCollinePoint(points) { //去除共线的点
    var removePoints = [];
    for (let i = 1; i < points.length; i++) {
      var prev = i - 1;
      var next = i + 1;
      if (i === points.length - 1) {
        next = 0;
      }
      if (getDir([points[prev], points[i]]).equals(getDir([points[i], points[next]]))) {
        removePoints.push(points[i]);
      }
    }
    pullAll(points, removePoints)
    return points;
  }
}

const CONFIG = {
  MIN_CYCLE_LEN: 3,
  MAX_CYCLE_LEN: 18,
  version: '1.1.0',
  mainWorkerEnabled: false, // 异步改为true
  asyncDetectEnabled: false,
  asyncDetectSize: 3
}

class Node {
  constructor(value, info) {
    this.value = value;
    this.info = info;
    this.key = shortid.generate();
  }
  getKey() {
    return this.key;
  }
  getIndex() {
    return this.value - 1;
  }
  getValue() {
    return this.value;
  }
  setValue(value) {
    this.value = value;
  }
  getInfo() {
    return this.info;
  }
  setInfo(info) {
    this.info = info;
  }
  toString() {
    if (!this.info) {
      return 'Node{' + this.value + '}';
    }
    return 'Node{' + 'value=' + this.value + ', info=' + this.info + '}';
  }
  equals(node) {
    return this.compareTo(node) === 0;
  }
  compareTo(node) {
    return this.value - node.getValue();
  }
}

class NodeList {
  constructor(graphic, firstNode) {
    this.graphic = graphic;
    this.list = [];
    if (firstNode) {
      this.list.push(firstNode);
    }
  }
  add(node) {
    if (node) {
      this.list.push(node);
    }
  }
  contains(node) {
    var n;
    for (var i = 0; i < this.list.length; i++) {
      n = this.list[i];
      if (n.getValue() === node.getValue()) {
        return true;
      }
    }
    return false;
  }
  getNodeCnt() {
    return this.list.length;
  }
  getNode(index) {
    if (index >= 0 && index < this.list.length) {
      return this.list[index];
    } else {
      return undefined;
    }
  }
  getLastNode() {
    if (this.list.length > 0) {
      return this.list[this.list.length - 1];
    } else {
      return undefined;
    }
  }
  size() {
    return this.list.length;
  }
  isEmpty() {
    return this.list.length === 0;
  }
  remove(node) {
    this.list.splice(this.list.indexOf(node), 1);
  }
  clone() {
    var nodeList = new NodeList(this.graphic);
    for (var i = 0; i < this.list.length; i++) {
      nodeList.list.push(this.list[i]);
    }
    return nodeList;
  }
  getPoints() {
    if (this.points === undefined && this.graphic) {
      this.points = this.graphic.getListPoints(this);
    }
    return this.points;
  }
  checkPoint(point) {
    var points = this.getPoints();
    return points ? this.graphic.pointInPoly(point, points) : false;
  }
  checkNode(node) {
    var point = this.graphic.getNodePoint(node);
    return point ? this.checkPoint(point) : false;
  }
  checkList(list) {
    var node;
    var flag;
    var matchAll = true;
    var result = false;
    for (let i = 0; i < list.getNodeCnt(); i++) {
      node = list.getNode(i);
      flag = false;
      for (let j = 0; j < this.getNodeCnt(); j++) {
        if (this.getNode(j).compareTo(node) === 0) {
          flag = true;
          result = true;
          break;
        }
      }
      if (!flag) {
        matchAll = false;
        if (!this.checkNode(node)) {
          return false;
        }
      }
    }
    if (matchAll) {
      const centerList = list.getTriangleGravityCenterList();
      for (let j = 0; j < centerList.length; j++) {
        if (!this.checkPoint(centerList[j])) {
          return false;
        }
      }
    }
    return result;
  }
  getTriangleList(startIndex) {
    var tris = [];
    var tri;
    var count = this.size();
    switch (count) {
      case 0:
      case 1:
      case 2:
        break;
      case 3:
        tri = [];
        for (let i = 0; i < 3; i++) {
          tri.push(this.getNode(i));
        }
        tris.push(tri);
        break;
      default:
        count -= 2;
        if (!startIndex) {
          startIndex = 0;
        }
        var n0 = this.getNode(startIndex);
        for (let i = 0; i < count; i++) {
          tri = [n0];
          for (let j = 0, k = i + 1 + startIndex; j < 2; j++, k += 1) {
            tri.push(this.getNode(k));
          }
          tris.push(tri);
        }
        break;
    }
    return tris;
  }
  getTrianglePointsList(startIndex) {
    var result = [];
    var points = this.graphic.getPoints();
    if (points) {
      let tri;
      const list = this.getTriangleList(startIndex);
      for (let i = 0; i < list.length; i++) {
        tri = [];
        for (let j = 0; j < 3; j++) {
          tri.push(points[list[i][j].getIndex()]);
        }
        result.push(tri);
      }
    }
    return result;
  }
  getTriangleGravityCenterList(startIndex) {
    var result = [];
    var list = this.getTrianglePointsList(startIndex);
    for (let i = 0; i < list.length; i++) {
      result.push(this.graphic.getTriangleGravityCenter(list[i]));
    }
    return result;
  }
  getPoint() {
    var list;
    var count = this.size();
    for (let i = 0; i < count; i++) {
      list = this.getTriangleGravityCenterList(i);
      for (let j = 0; j < list.length; j++) {
        if (this.checkPoint(list[j])) {
          return list[j];
        }
      }
    }
    return null;
  }
  getArea() { // 平面多边形面积(顶点按照顺时针或者逆时针方向排列)
    var points = this.getPoints();
    if (points.length < 3) {
      return 0;
    }
    var s = 0;
    for (var i = 0; i < points.length; i++) {
      s += points[i].x * points[(i + 1) % points.length].y - points[i].y * points[(i + 1) % points.length].x;
    }
    return Math.abs(s / 2);
  }
}

class Graphic {
  constructor() {
    this.nodes = [];
    this.keys = {};
    this.chilerens = {};
    this.cycles = [];
    this.workcount = 0;
    this.workers = [];
  }
  getCycles() {
    return this.cycles;
  }
  getChildren(node) {
    var n;
    for (var k in this.keys) {
      n = this.keys[k];
      if (n.equals(node)) {
        return this.chilerens[k];
      }
    }
    return null;
  }
  getNodeCnt() {
    return this.nodes.length;
  }
  getFatherNodeByValue(value) {
    var n;
    for (var k in this.keys) {
      n = this.keys[k];
      if (n.getValue() === value) {
        return n;
      }
    }
  }
  sortFunc(a, b) {
    return a.area - b.area;
  }
  sortCycles(cycles) {
    var list;
    var areas = [];
    var result = [];
    for (let i = 0; i < cycles.length; i++) {
      list = cycles[i]
      areas.push({
        area: list.getArea(),
        cycle: list
      });
    }
    areas.sort(this.sortFunc);
    for (let i = 0; i < areas.length; i++) {
      result.push(areas[i].cycle);
    }
    return result;
  }
  getMinAreaCycle(cycles) {
    var list;
    var areas = [];
    for (let i = 0; i < cycles.length; i++) {
      list = cycles[i]
      areas.push({
        area: list.getArea(),
        cycle: list
      });
    }
    areas.sort(this.sortFunc);
    return areas[0].cycle;
  }
  addNode(node, children) {
    var key = node.getKey();
    this.nodes.push(node);
    this.keys[key] = node;
    this.chilerens[key] = children;
  }
  removeNode(node) {
    var key = node.getKey();
    delete this.keys[key];
    delete this.chilerens[key];
    this.nodes.splice(this.nodes.indexOf(node), 1);
  }
  clearNodes() {
    this.nodes = [];
    this.keys = {};
    this.chilerens = {};
    this.cycles = [];
    this.points = undefined;
  }
  getPoints() {
    return this.points;
  }
  getNodePoint(node) {
    return this.points ? this.points[node.getIndex()] : null;
  }
  getListPoints(list) {
    if (this.points) {
      var points = [];
      var count = list.size();
      for (var i = 0; i < count; i++) {
        points.push(this.points[list.getNode(i).getIndex()]);
      }
      return points;
    }
    return null;
  }
  pointInPoly(pt, poly) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
      if (
        (
          (poly[i].y <= pt.y && pt.y < poly[j].y) ||
          (poly[j].y <= pt.y && pt.y < poly[i].y)
        ) &&
        (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
      ) {
        c = !c
      }
    }
    return c;
  }
  getTriangleGravityCenter(triangle) {
    return {
      x: (triangle[0].x + triangle[1].x + triangle[2].x) / 3.0,
      y: (triangle[0].y + triangle[1].y + triangle[2].y) / 3.0
    };
  }
  compareList(list1, list2) {
    var result = false;
    var matchAll = true;
    var flag;
    var j;
    var n1;
    var n2;
    for (var i = 0; i < list1.getNodeCnt(); i++) {
      n1 = list1.getNode(i);
      flag = false;
      for (j = 0; j < list2.getNodeCnt(); j++) {
        n2 = list2.getNode(j);
        if (n1.compareTo(n2) === 0) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        matchAll = false;
        if (this.points) {
          if (!list2.checkNode(n1)) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        result = true;
      }
    }
    if (result && matchAll) {
      var list3 = list1.getTriangleGravityCenterList();
      for (j = 0; j < list3.length; j++) {
        if (!list2.checkPoint(list3[j])) {
          return false;
        }
      }
    }
    return result;
  }
  checkCycles(cycles) {
    var list1;
    var list2;
    var flag;
    var result = [];
    for (let i = 0; i < cycles.length; i++) {
      list1 = cycles[i];
      flag = false;
      for (let j = 0; j < cycles.length; j++) {
        list2 = cycles[j];
        if (list1 !== list2 && list1.checkList(list2)) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        result.push(list1);
      }
    }
    return result;
  }
  checkPointArea(cycles) {
    var k;
    var list1;
    var list2;
    var point;
    var list;
    var result = [];
    for (let i = 0; i < cycles.length; i++) {
      list = [];
      list1 = cycles[i];
      point = list1.getPoint();
      if (point) {
        for (let j = 0; j < cycles.length; j++) {
          list2 = cycles[j];
          if (list2 !== list1) {
            if (list2.checkPoint(point)) {
              list.push(list2);
            }
          }
        }
      }
      if (list.length > 0) {
        list.push(list1);
        list = this.sortCycles(list);
        if (result.indexOf(list[0]) < 0) {
          result.push(list[0]);
        }
        for (let j = 1; j < list.length; j++) {
          k = cycles.indexOf(list[j]);
          if (k >= 0) {
            if (k <= i) {
              i--;
            }
            cycles.splice(k, 1);
          }
        }
      } else if (result.indexOf(list1) < 0) {
        result.push(list1);
      }
    }
    return result;
  }
  detectMinCycles(maxCycleLen) {
    var nodeCnt = this.getNodeCnt();
    var cycleListSameLen;
    var cycleList = [];
    var flag1, j, k, list1, list2;
    // 检测所有长度的环，最小长度为3，最大长度为图的节点数;
    // console.time('detectMinCycles');
    if (!maxCycleLen) {
      maxCycleLen = CONFIG.MAX_CYCLE_LEN ? CONFIG.MAX_CYCLE_LEN : nodeCnt
    }
    var count = maxCycleLen > nodeCnt ? nodeCnt : maxCycleLen;
    for (var i = CONFIG.MIN_CYCLE_LEN; i <= count; i++) {
      // console.time('detectCycleOfLength('+i+')');
      cycleListSameLen = this.detectCycleOfLength(i);
      // console.timeEnd('detectCycleOfLength('+i+')');
      // console.time('MinCycles('+i+')');
      if (i > 3) {
        for (j = 0; j < cycleListSameLen.length; j++) {
          list2 = cycleListSameLen[j];
          flag1 = false;
          for (k = 0; k < cycleList.length; k++) {
            list1 = cycleList[k];
            if (list2.size() > list1.size()) {
              if (this.compareList(list1, list2)) {
                flag1 = true;
                break;
              }
            }
          }
          if (!flag1) {
            cycleList.push(list2);
          }
        }
      } else {
        for (j = 0; j < cycleListSameLen.length; j++) {
          list2 = cycleListSameLen[j];
          cycleList.push(list2);
        }
      }
      // console.timeEnd('MinCycles('+i+')');
    }
    // console.timeEnd('detectMinCycles');
    // this.cycles = this.checkCycles(cycleList);
    // console.time("checkPointArea");
    this.cycles = this.checkPointArea(this.checkCycles(cycleList));
    // console.timeEnd("checkPointArea");
    return this.cycles;
  }
  asyncDetectMinCycles(maxCycleLen, func) {
    var nodeCnt = this.getNodeCnt();
    var promise;
    var tempList = [];
    var flag1, j, k, list1, list2;
    // 检测所有长度的环，最小长度为3，最大长度为图的节点数
    var size = CONFIG.asyncDetectSize ? CONFIG.asyncDetectSize : 1;
    if (!maxCycleLen) {
      maxCycleLen = CONFIG.MAX_CYCLE_LEN ? CONFIG.MAX_CYCLE_LEN : nodeCnt;
    }
    var length = maxCycleLen > nodeCnt ? nodeCnt : maxCycleLen;
    var end;
    var begin = CONFIG.MIN_CYCLE_LEN;
    var count = Math.ceil((length - begin + 1) / size);
    for (let i = 0; i < count; i++) {
      promise = new Promise((resolve, reject) => {
        end = begin + size - 1;
        if (end > length) {
          end = length;
        }
        this.asyncDetectCycleOfLength(begin, end, (result) => {
          if (result.list.length > 0) {
            resolve(result);
          } else {
            reject(result.error);
          }
        });
        begin = end + 1;
      });
      tempList.push(promise);
    }
    var resultOflength;
    var cycleListSameLen;
    var cycleList = [];
    this._tempIndex = 0;
    this._processCycles(tempList, (result) => {
      for (let i = 0; i < result.list.length; i++) {
        resultOflength = result.list[i];
        cycleListSameLen = resultOflength.cycleList;
        if (resultOflength.length > 3) {
          for (j = 0; j < cycleListSameLen.length; j++) {
            list2 = cycleListSameLen[j];
            flag1 = false;
            for (k = 0; k < cycleList.length; k++) {
              list1 = cycleList[k];
              if (list2.size() > list1.size()) {
                if (this.compareList(list1, list2)) {
                  flag1 = true;
                  break;
                }
              }
            }
            if (!flag1) {
              cycleList.push(list2);
            }
          }
        } else {
          for (j = 0; j < cycleListSameLen.length; j++) {
            list2 = cycleListSameLen[j];
            cycleList.push(list2);
          }
        }
      }
    }, () => {
      this.cycles = cycleList;
      if (func) {
        func(cycleList);
      }
    });
  }
  _processCycles(list, func1, func2) {
    if (this._tempIndex < list.length) {
      var promise = list[this._tempIndex];
      promise.then((result) => {
        this._tempIndex++;
        func1(result);
        this._processCycles(list, func1, func2);
      })
    } else if (func2) {
      func2();
    }
  }
  detectAllCycles() {
    var nodeCnt = this.getNodeCnt();
    var cycleListSameLen;
    var list;
    var cycleList = [];
    // 检测所有长度的环，最小长度为3，最大长度为图的节点数
    for (var i = CONFIG.MIN_CYCLE_LEN; i <= nodeCnt; i++) {
      cycleListSameLen = this.detectCycleOfLength(i);
      for (let j = 0; j < cycleListSameLen.length; j++) {
        list = cycleListSameLen[j];
        cycleList.push(list);
      }
    }
    this.cycles = cycleList;
    return cycleList;
  }
  detectCycleOfLength(length) {
    var node;
    var cycle;
    var cycleList = [];
    // 按节点值遍历环检测的起点，节点值最小为1
    for (var i = 1; i < this.getNodeCnt() - length + 2; i++) {
      node = this.getFatherNodeByValue(i);
      cycle = new NodeList(this, node); // 用于保存检测到的环
      // console.time('detectCycleOfLength('+length+'): '+ i);
      this.detectCycleStartsWith(length, cycle, cycleList);
      // console.timeEnd('detectCycleOfLength('+length+'): '+ i);
    }
    return cycleList;
  }
  asyncDetectCycleOfLength(begin, end, func) {
    if (CONFIG.asyncDetectEnabled) {
      var worker = new Worker(CONFIG.mainWorkerEnabled ? 'DetectCircleWorker.js' : 'common/qm/designer/util/DetectCircleWorker.js');
      worker.onmessage = (event) => {
        if (func) {
          let resultOflength;
          for (let i = 0; i < event.data.result.length; i++) {
            resultOflength = event.data.result[i];
            resultOflength.cycleList = this._toNodeList(resultOflength.cycleList);
          }
          func({
            begin: event.data.begin,
            end: event.data.end,
            list: event.data.result
          });
        }
      };
      worker.onerror = (e) => {
        if (func) {
          func({
            list: [],
            error: e.data
          });
        }
      };
      this.workers.push(worker);
      worker.postMessage({
        type: 'detectCycleOfLength',
        begin: begin,
        end: end,
        data: this.data,
        points: this.points
      });
    } else {
      var cycleList = this.detectCycleOfLength(length);
      if (func) {
        func({
          length: length,
          cycleList: cycleList
        });
      }
      return cycleList;
    }
  }
  _toNodeList(list) {
    var node;
    var nodes;
    var j;
    var k;
    var cycleList = [];
    for (var i = 0; i < list.length; i++) {
      node = list[i];
      nodes = new NodeList(this);
      for (j = 0; j < node.list.length; j++) {
        k = node.list[j].value;
        nodes.add(new Node(k));
      }
      cycleList.push(nodes);
    }
    return cycleList;
  }
  detectCycleStartsWith(length, cycle, cycleList) {
    if (cycle.isEmpty()) { // 未指定环检测的起点，退出
      return 0;
    }
    var node_cnt = cycle.getNodeCnt(); // 环路径上的节点的个数，第一次递归时，个数为1，即，环检测的起点
    var lastNode = cycle.getLastNode(); // 环路径上的最后一个节点
    var children = this.getChildren(lastNode); // 获取环路径上最后一个节点在图中的子节点列表
    var nbNode;
    // 遍历子节点列表中的每一个节点，测试该子节点是否是环路径上的节点
    for (var i = 0; children != null && i < children.getNodeCnt(); i++) {
      nbNode = children.getNode(i);
      if (node_cnt === length - 1) { // nbNode是否为环的倒数第二个节点
        if ((nbNode.compareTo(cycle.getNode(1)) > 0) && // 为避免重复检测，nbNode的值需大于已检测到的环路径上第二个节点的值
          (!cycle.contains(nbNode)) && // nbNode还未存在于已检测到的环路径中
          this.getChildren(nbNode).contains(cycle.getNode(0))) { // nbNode的子节点中包含起始节点，即构成一个环路
          cycle.add(nbNode); // 将nbNode添加到已检测的环路径中，此时该路径构成一个环
          cycleList.push(cycle); // 将环添加到检测结果中
        }
        // nbNode不是倒数第二个节点
      } else if ((nbNode.compareTo(cycle.getNode(0)) > 0) && // 为避免重复检测，nbNode的值需大于初始节点
        !cycle.contains(nbNode)) { // nbNode还未存在于环路径上
        cycle.add(nbNode); // nbNode添加到环路径中
        // 由于Java在函数参数传递时，引用变量作为参数时，传递的是引用，而这里在
        // 递归调用时detectCycleStartsWith函数的第二个参数，每次递归时需要独立
        // 存储空间，因此，进行克隆后再进行下一次递归，否则递归检测的结果会叠加在一起
        // 进行递归调用
        this.detectCycleStartsWith(length, cycle.clone(), cycleList);

        // 如果执行到这里，说明nbNode不在环路径上，因此需要将其从环路径中删除。
        cycle.remove(nbNode);
      }
    }
    return cycleList.length;
  }
  buildGraphic(data, points) {
    this.clearNodes();
    this.data = data;
    this.points = points;
    var node, nodes, j, k;
    for (var i = 0; i < data.length; i++) {
      node = data[i];
      nodes = new NodeList(this);
      for (j = 0; j < node.length; j++) {
        k = node[j];
        nodes.add(new Node(k + 1));
      }
      this.addNode(new Node(i + 1), nodes);
    }
  }
  detectCycles(data, points, maxCycleLen, func) {
    console.time('detectCycles');
    this.buildGraphic(data, points);
    if (CONFIG.asyncDetectEnabled) {
      let worker;
      for (let i = 0; i < this.workers.length; i++) {
        worker = this.workers[i];
        if (worker) {
          worker.terminate();
          this.workers[i] = null;
        }
      }
      this.workers = [];
      this.asyncDetectMinCycles(maxCycleLen, (cycles) => {
        let cycle, node, j;
        let ns;
        const result = [];
        for (let i = 0; i < cycles.length; i++) {
          cycle = cycles[i];
          ns = [];
          for (j = 0; j < cycle.list.length; j++) {
            node = cycle.list[j];
            ns.push(node.value - 1);
          }
          result.push(ns);
        }
        console.timeEnd('detectCycles');
        if (func) {
          func(result);
        }
      });
    } else {
      const cycles = this.detectMinCycles(maxCycleLen);
      let cycle, node, j;
      let ns;
      const result = [];
      for (let i = 0; i < cycles.length; i++) {
        cycle = cycles[i];
        ns = [];
        for (j = 0; j < cycle.size(); j++) {
          node = cycle.getNode(j);
          ns.push(node.getIndex());
        }
        result.push(ns);
      }
      console.timeEnd('detectCycles');
      if (func) {
        func(result);
      }
      return result;
    }
  }
  asyncDetectCycles(data, points, maxCycleLen, func) {
    if (CONFIG.mainWorkerEnabled && typeof (Worker) !== "undefined") {
      if (this.worker) {
        console.debug('DetectCircleWorker(' + this.workcount + ') terminate.');
        this.worker.terminate();
        this.worker = null;
      }
      this.workcount++;
      const count = this.workcount;
      console.debug('DetectCircleWorker(' + count + ') start...');
      console.time('DetectCircleWorker(' + count + ') load');
      this.worker = new Worker('common/qm/designer/util/DetectCircleWorker.js');
      console.timeEnd('DetectCircleWorker(' + count + ') load');
      this.worker.onerror = (e) => {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        console.debug('DetectCircleWorker(' + count + ') error: ' + e.data);
      };
      this.worker.onmessage = (event) => {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        console.timeEnd('DetectCircleWorker(' + count + ') detectCircle');
        console.debug('DetectCircleWorker(' + count + ') finish.');
        if (func) {
          func(event.data);
        }
      };
      console.time('DetectCircleWorker(' + count + ') detectCircle');
      this.worker.postMessage({
        type: 'detectCycles',
        data: data,
        points: points,
        maxCycleLen: maxCycleLen
      });
    } else {
      if (!CONFIG.mainWorkerEnabled) {
        console.info('DetectCircleMainWorkerNoEnabled.');
      } else {
        console.info('DetectCircleWorkerNoSupport.');
      }

      if (func) {
        // setTimeout(() => {
        this.detectCycles(data, points, maxCycleLen, (result) => {
          func(result);
        });
        // }1);
      } else {
        return this.detectCycles(data, maxCycleLen, points);
      }
    }
  }
}
