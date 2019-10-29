"use strict";
import TYPES from '../types'
import {
  fromArraytoVector3,
  toVector3,
  fromStrToArray,
  getClosest,
  getDir,
  collinear,
  segmentsIntr,
  toStr,
  pointOnPath
} from '../util'
import {
  cloneDeep,
  zip,
  orderBy,
  groupBy,
  unionWith,
  uniqWith,
  pullAll,
  isEqual
} from 'lodash'
import {
  CreateDraw,
  CreatePoint
} from '../objects3d/Create'
import {
  Message
} from 'element-ui';
export default class Wall {
  constructor(designer) {
    this.designer = designer;
    this.event = designer.event;
    this.points = [];
    this.isAdsorb = true;
    // this.adsorbDir = [];
    this.adsorbPoints = [];
    this.adsorbAxes = {};
    // this.adsorbAngle = 0;
    this.adsorbDis = 0;
    this.tempWall = [];
    this.tempPoint = [];
    this.tempGroup = designer.scene3d.getObjectByName('tempGroup');
    this.model = {
      t: 'Create', // type
      mt: 'Extrude', // mesh-type
      n: 'wall', // name
      // k: '92z5d56d', // key
      h: 2800, // height
      w: 240, // width
      pa: [ // path
        '0,0,0',
        '1000,0,1000'
      ]
      // m: [
      //   {
      //     k: 'adf546ad', // key
      //     t: 'map', // type
      //     u: 't/a.jpg' // url
      //   }
      // ],
      // c: [], // children
      // di: false // disabled 是否不可用
    };
    this.event.addEventListener(TYPES['menu-click'] + '-distribute', ({
      command,
      param
    }) => {
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
    this.event.addEventListener(TYPES['common'], ({
      command,
      param
    }) => {
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
    this.setAdsorbDis(200); // 距离小于200吸附
  }
  getAdsorb() {
    return this.isAdsorb;
  }
  setAdsorb(value) {
    this.isAdsorb = !!value;
  }
  getAdsorbDis() {
    return this.adsorbDis;
  }
  setAdsorbDis(value) {
    this.adsorbDis = value;
  }
  resetWall() {
    this.points = [];
    this.resetTempPoint();
    this.resetTempWall();
  }
  resetTempPoint() {
    if (this.tempPoint.length) {
      this.tempPoint.forEach(p => {
        p.free();
      })
      this.tempPoint = [];
    }
  }
  resetTempWall() {
    if (this.tempWall.length) {
      this.tempWall.forEach(w => {
        w.free();
      })
      this.tempWall = [];
    }
  }
  resetSize() {
    this.event.dispatchEvent({
      type: TYPES['menu-change'],
      command: ['menu/sizeChange'],
      param: [
        []
      ]
    });
  }
  computeAdsorbPoint(point) {
    if (!this.isAdsorb) return point;
    var adsorbPoint = point;
    this.adsorbPoints.forEach((values, i) => {
      var v = adsorbPoint.getComponent(i);
      var closestValue = getClosest(values, v);
      this.adsorbAxes[i] = false;
      if (Math.abs(closestValue - v) < this.getAdsorbDis()) {
        adsorbPoint.setComponent(i, closestValue);
        this.adsorbAxes[i] = true;
      }
    })
    return adsorbPoint;
  }
  sizeEnter(sizes) {
    var opState = this.designer.event.getState('opState');
    opState.forEach(o => {
      switch (o) {
        case "drawSequence":
          var s = sizes[0];
          this.adsorbPoint = s.endPoint.clone().sub(s.beginPoint).setLength(s.value).add(s.beginPoint);
          this.drawSequence({
            event: {
              type: 'mousedown'
            }
          });
          break;
        case "drawBox":
        case "drawPillar":
        case "drawPlat":
        case "drawGirde":
          var target = toVector3('0,0,0');
          sizes.forEach((s, i) => {
            i === 0 && target.copy(s.beginPoint)
            target.add(s.endPoint.clone().sub(s.beginPoint).setLength(s.value))
          })
          this.adsorbPoint = target;
          this[o] ?
            this[o]({
              event: {
                type: 'mousedown'
              }
            }) :
            this.drawOther({
              event: {
                type: 'mousedown'
              }
            });
          this.resetSize();
          break;
      }
    })
  }
  drawSequence(param) {
    var model, midPoint, dis;
    var activeSolution = this.getActiveSolution();
    if (param.event.type === 'mousedown') {
      var point = this.adsorbPoint ? this.adsorbPoint : param.intersect.point;
      this.points.push(point);
      this.adsorbPoints = [
        [point.x],
        [point.y],
        [point.z]
      ];
      this.resetTempPoint();
    }
    if (this.points.length < 1) { // 起始点
      this.adsorbPoint = this.computeAdsorbPoint(param.intersect.point.clone());
      if (!this.tempPoint.length) {
        this.tempPoint.push(new CreatePoint(this.adsorbPoint));
        this.tempGroup.add(this.tempPoint[this.tempPoint.length - 1]);
      } else {
        this.tempPoint.forEach(p => {
          p.update(this.adsorbPoint, this.adsorbAxes);
        })
      }
    } else if (this.points.length === 1) { // 有一个点
      model = cloneDeep(this.model);
      if (!this.tempWall.length) {
        this.tempWall.push(new CreateDraw(model));
        this.tempGroup.add(this.tempWall[this.tempWall.length - 1]);
      } else {
        midPoint = this.points[0].clone().add(this.adsorbPoint).divideScalar(2);
        dis = this.points[0].clone().sub(this.adsorbPoint).length();
        model.pa = [
          toStr(this.points[0]),
          toStr(this.adsorbPoint)
        ];
        this.adsorbPoint = this.computeAdsorbPoint(param.intersect.point.clone());
        this.tempWall.forEach(w => {
          w.update(model, this.adsorbAxes);
        })
        this.event.dispatchEvent({
          type: TYPES['menu-change'],
          command: ['menu/sizeChange'],
          param: [
            [{
              ...this.designer.scene3d.project(midPoint),
              value: parseFloat(dis.toFixed(0)),
              editable: true,
              edit: true,
              beginPoint: this.points[0],
              endPoint: this.adsorbPoint
            }]
          ]
        });
      }
    } else if (this.points.length > 1) { // 创建
      var beginPoint, endPoint, intersectPoints;
      model = cloneDeep(this.model);
      beginPoint = this.points.shift();
      endPoint = this.points[this.points.length - 1];
      if (beginPoint.distanceToSquared(endPoint) < Math.pow(this.getAdsorbDis(), 2)) {
        Message({
          message: '墙体长度不小于200mm',
          type: 'warning'
        });
        return;
      }
      intersectPoints = this.computeIntersectPoint([
        beginPoint,
        endPoint
      ]);
      var cmds = [];
      if (intersectPoints.length > 0) {
        this.incision(intersectPoints, cmds); // 断他
        this.incisionSelf(intersectPoints, [beginPoint, endPoint], cmds); // 自断
      } else {
        model.pa = [
          toStr(beginPoint),
          toStr(endPoint)
        ];
        cmds.push(['AddProductCommand', activeSolution, activeSolution.createProduct(model)]);
      }
      this.uniqPath(cmds);
      this.event.dispatchEvent({
        type: TYPES['ceiling-floor-update'],
        cmds
      });
      activeSolution.multiCmds(cmds);
      this.updateAdsorbPoints();
    }
  }
  drawBox(param) {
    var model, beginPoint, endPoint;
    var p1, p2, p3, p4, paths, flag, cmds, intersectPoints, intersectPointsAll;
    var activeSolution = this.getActiveSolution();
    if (param.event.type === 'mousedown') {
      this.points.push(this.adsorbPoint ? this.adsorbPoint : param.intersect.point);
      this.resetTempPoint();
    }
    if (this.points.length < 1) {
      this.adsorbPoint = this.computeAdsorbPoint(param.intersect.point.clone());
      if (!this.tempPoint.length) {
        this.tempPoint.push(new CreatePoint(this.adsorbPoint));
        this.tempGroup.add(this.tempPoint[this.tempPoint.length - 1]);
      } else {
        this.tempPoint.forEach(p => {
          p.update(this.adsorbPoint, this.adsorbAxes);
        })
      }
    } else if (this.points.length === 1) {
      this.adsorbPoint = this.computeAdsorbPoint(param.intersect.point.clone());
      beginPoint = this.points[0];
      endPoint = this.adsorbPoint;

      p1 = beginPoint.clone();
      p3 = endPoint.clone();
      p2 = toVector3([p1.x, p1.y, p3.z]);
      p4 = toVector3([p3.x, p3.y, p1.z]);

      paths = [
        [p1, p2],
        [p2, p3],
        [p3, p4],
        [p4, p1]
      ]; // 逆时针

      if (!this.tempWall.length) {
        paths.forEach(p => {
          model = cloneDeep(this.model);
          this.tempWall.push(new CreateDraw(model));
          this.tempGroup.add(this.tempWall[this.tempWall.length - 1]);
        })
      } else {
        paths.forEach((p, i) => {
          model = cloneDeep(this.model);
          model.pa = [
            toStr(p[0]),
            toStr(p[1])
          ];
          this.tempWall[i].update(model, this.adsorbAxes);
        });

        var midPoint14 = p1.clone().add(p4).divideScalar(2),
          midPoint43 = p4.clone().add(p3).divideScalar(2),
          dis14 = p1.clone().sub(p4).length(),
          dis43 = p4.clone().sub(p3).length();

        this.event.dispatchEvent({
          type: TYPES['menu-change'],
          command: ['menu/sizeChange'],
          param: [
            [{
              ...this.designer.scene3d.project(midPoint14),
              value: parseFloat(dis14.toFixed(0)),
              editable: true,
              edit: true,
              beginPoint: p1,
              endPoint: p4
            }, {
              ...this.designer.scene3d.project(midPoint43),
              value: parseFloat(dis43.toFixed(0)),
              editable: true,
              edit: false,
              beginPoint: p4,
              endPoint: p3
            }]
          ]
        });

      }
    } else if (this.points.length > 1) {
      cmds = [];
      intersectPointsAll = [];
      beginPoint = this.points.shift();
      endPoint = this.points.shift();

      p1 = beginPoint.clone();
      p3 = endPoint.clone();
      p2 = toVector3([p1.x, p1.y, p3.z]);
      p4 = toVector3([p3.x, p3.y, p1.z]);

      paths = [
        [p1, p2],
        [p2, p3],
        [p3, p4],
        [p4, p1]
      ]; // 逆时针
      flag = paths.some(p => p[0].distanceToSquared(p[1]) < Math.pow(this.getAdsorbDis(), 2)) // 有一段长度小于200
      if (flag) {
        Message({
          message: '墙体长度不小于200mm',
          type: 'warning'
        });
        this.points.push(beginPoint);
        return;
      }
      paths.forEach((p) => {
        intersectPoints = this.computeIntersectPoint(p);
        if (intersectPoints.length > 0) {
          intersectPointsAll = [...intersectPointsAll, ...intersectPoints];
          // this.incision(intersectPoints, cmds); // 断他
          this.incisionSelf(intersectPoints, p, cmds); // 自断
        } else {
          var model = cloneDeep(this.model);
          model.pa = [
            toStr(p[0]),
            toStr(p[1])
          ];
          cmds.push(['AddProductCommand', activeSolution, activeSolution.createProduct(model)]);
        }
      })
      var intersectPointsAllGroup = groupBy(intersectPointsAll, ({
        product
      }) => {
        return product.getAtt('k');
      })
      Object.keys(intersectPointsAllGroup).forEach(k => {
        var intersectPoints = [];
        var product;
        intersectPointsAllGroup[k].forEach(({
          ip
        }) => {
          intersectPoints.push(ip);
        })
        product = activeSolution.getProduct(k);
        this.incision([{
          product,
          ip: intersectPoints
        }], cmds); // 断他
      });
      // 去重
      this.uniqPath(cmds);
      this.event.dispatchEvent({
        type: TYPES['ceiling-floor-update'],
        cmds
      });
      activeSolution.multiCmds(cmds);
      this.updateAdsorbPoints();
      this.resetTempWall();
      this.resetSize();
    }
  }
  drawOther(param) { // 柱 梁 地台
    var opState, model, beginPoint, endPoint;
    var p1, p2, p3, p4;
    var activeSolution = this.getActiveSolution();
    if (param.event.type === 'mousedown') {
      this.points.push(this.adsorbPoint ? this.adsorbPoint : param.intersect.point);
      this.resetTempPoint();
    }
    if (this.points.length < 1) {
      this.adsorbPoint = this.computeAdsorbPoint(param.intersect.point.clone());
      if (!this.tempPoint.length) {
        this.tempPoint.push(new CreatePoint(this.adsorbPoint));
        this.tempGroup.add(this.tempPoint[this.tempPoint.length - 1]);
      } else {
        this.tempPoint.forEach(p => {
          p.update(this.adsorbPoint, this.adsorbAxes);
        })
      }
    } else if (this.points.length === 1) {
      this.adsorbPoint = this.computeAdsorbPoint(param.intersect.point.clone());
      beginPoint = this.points[0];
      endPoint = this.adsorbPoint;

      p1 = beginPoint.clone();
      p3 = endPoint.clone();
      p2 = toVector3([p1.x, p1.y, p3.z]);
      p4 = toVector3([p3.x, p3.y, p1.z]);

      var midPoint12 = p1.clone().add(p2).divideScalar(2),
        midPoint34 = p3.clone().add(p4).divideScalar(2),
        dis12 = p1.clone().sub(p2).length();

      if (!this.tempWall.length) {
        model = cloneDeep(this.model);
        this.tempWall.push(new CreateDraw(model, false));
        this.tempGroup.add(this.tempWall[this.tempWall.length - 1]);
      } else {
        model = cloneDeep(this.model);
        model.pa = [
          toStr(midPoint12),
          toStr(midPoint34)
        ];
        model.w = dis12;
        this.tempWall.forEach(w => {
          w.update(model, this.adsorbAxes, p3);
        })

        var midPoint14 = p1.clone().add(p4).divideScalar(2),
          midPoint43 = p4.clone().add(p3).divideScalar(2),
          dis14 = p1.clone().sub(p4).length(),
          dis43 = p4.clone().sub(p3).length();

        this.event.dispatchEvent({
          type: TYPES['menu-change'],
          command: ['menu/sizeChange'],
          param: [
            [{
              ...this.designer.scene3d.project(midPoint14),
              value: parseFloat(dis14.toFixed(0)),
              editable: true,
              edit: true,
              beginPoint: p1,
              endPoint: p4
            }, {
              ...this.designer.scene3d.project(midPoint43),
              value: parseFloat(dis43.toFixed(0)),
              editable: true,
              edit: false,
              beginPoint: p4,
              endPoint: p3
            }]
          ]
        });

      }
    } else if (this.points.length > 1) {
      opState = this.designer.event.getState('opState');
      beginPoint = this.points.shift();
      endPoint = this.points.shift();

      p1 = beginPoint.clone();
      p3 = endPoint.clone();
      p2 = toVector3([p1.x, p1.y, p3.z]);
      p4 = toVector3([p3.x, p3.y, p1.z]);

      var midPoint12 = p1.clone().add(p2).divideScalar(2),
        midPoint34 = p3.clone().add(p4).divideScalar(2),
        dis12 = p1.clone().sub(p2).length();

      var model = cloneDeep(this.model);
      model.pa = [
        toStr(midPoint12),
        toStr(midPoint34)
      ];
      model.w = dis12;
      switch (opState[0]) {
        case 'drawPillar':
          model.n = 'pillar';
          break;
        case 'drawPlat':
          model.n = 'plat';
          model.h = 600;
          break;
        case 'drawGirde':
          model.n = 'girde';
          model.p = `0,${2800-600},0`;
          model.h = 600;
          break;
      }
      activeSolution.buildProduct(model);
      this.resetTempWall();
      this.resetSize();
    }
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
  getWallPointArrayVector3() {
    return fromArraytoVector3(this.getWallPointArray());
  }
  computeIntersectPoint(path) { // 计算path与已有path的交点
    var intersectPoints = [];
    var wallArray = this.getArray('wall');
    var direction = getDir(path);
    var pa, dir, ip;
    wallArray.forEach((product) => {
      pa = fromArraytoVector3(product.getAtt('pa'));
      dir = getDir(pa);
      if (!collinear(direction, dir)) { // 非共线向量
        ip = segmentsIntr(pa, path, true);
        ip && (intersectPoints.push({
          product,
          ip
        }))
      }
    })
    return intersectPoints;
  }
  incision(intersectPoints, cmds, err = 4) { // 断他
    var activeSolution = this.getActiveSolution();
    intersectPoints.forEach(({
      product,
      ip
    }) => {
      var path, model;
      path = fromArraytoVector3(product.getAtt('pa'));
      ip = fromArraytoVector3(Array.isArray(ip) ? ip : [ip]);
      ip = unionWith(ip, path, (a, b) => {
        return a.equals(b);
      })
      if (ip.length > 2) {
        ip = orderBy(ip, ['x', 'y', 'z']);
        cmds.push([
          'RemoveProductCommand',
          activeSolution,
          product
        ]);
        ip.reduce((t, c) => {
          model = product.copyModel();
          model.pa = [
            toStr(t),
            toStr(c)
          ];
          cmds.push([
            'AddProductCommand',
            activeSolution,
            activeSolution.createProduct(model)
          ]);
          return c;
        })
      }
    });
  }
  incisionSelf(intersectPoints, curPath, cmds) { // 自断
    var model;
    var activeSolution = this.getActiveSolution();
    var points = unionWith(intersectPoints.map(intersectPoint => toVector3(intersectPoint.ip)), curPath, (a, b) => {
      return a.equals(b);
    })
    points = orderBy(points, ['x', 'y', 'z']);
    points.forEach((p, i, a) => {
      if (i !== a.length - 1) {
        model = cloneDeep(this.model);
        model.pa = [
          toStr(p),
          toStr(a[i + 1])
        ];
        cmds.push([
          'AddProductCommand',
          activeSolution,
          activeSolution.createProduct(model)
        ]);
      }
    })
  }
  uniqPath(cmds) {
    var uniqCmds = uniqWith(cmds, (c1, c2) => { // 去重
      var p1 = c1[2].getAtt('pa')
      var p2 = c2[2].getAtt('pa')
      return c1[0] === c2[0] && (isEqual(p1, p2) || isEqual(p1, cloneDeep(p2).reverse()))
    })
    cmds.length = 0;
    cmds.push(...uniqCmds);

    var removePaths = [];
    var paths = this.getAttArray('wall', 'pa');
    var cmdsGroup = groupBy(cmds, (c) => {
      return c[0];
    })
    var addCmds = cmdsGroup['AddProductCommand'];
    Array.isArray(cmdsGroup['RemoveProductCommand']) && cmdsGroup['RemoveProductCommand'].forEach(r => {
      removePaths.push(r[2].getAtt('pa'));
    })
    pullAll(paths, removePaths);
    paths = paths.map((p) => {
      p = fromArraytoVector3(p);
      return orderBy(p, ['x', 'y', 'z']);
    });
    var ac;
    var path;
    var pulls = []; // 新添加的和现有的有重合
    for (let i = 0; i < addCmds.length; i++) {
      ac = addCmds[i];
      path = fromArraytoVector3(ac[2].getAtt('pa'));
      for (let j = 0; j < paths.length; j++) {
        const p = paths[j];
        if (pointOnPath(path[0], p) && pointOnPath(path[1], p)) {
          pulls.push(ac);
        }
      }
    }
    pullAll(cmds, pulls);
  }
  includesCmd(cmds, cmd) {
    return cmds.some(c => {
      return c[0] === cmd[0] && c[2].getAtt('pa')
    })
  }
  updateAdsorbPoints() { // 把所有墙的端点 按x,y,z分类并排序
    this.adsorbPoints = zip(...this.getWallPointArray().map(v => fromStrToArray(v))).map(_v => _v.sort((a, b) => a - b));
  }
  threeProjectTwo(v) {

  }
}
