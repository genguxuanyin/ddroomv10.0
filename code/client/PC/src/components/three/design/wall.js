import TYPES from '../types'
import {
  fromArrayToStr,
  fromArraytoVector3,
  toVector3,
  fromStrToArray,
  getClosest
} from '../util'
import {
  cloneDeep,
  zip
} from 'lodash'
import {
  CreateDraw,
  CreatePoint
} from '../objects3d/Create'
import { Message } from 'element-ui';
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
  drawSequence(param) {
    var model, beginPoint, endPoint;
    var activeSolution = this.getActiveSolution();
    if (param.event.type === 'mousedown') {
      var point = this.adsorbPoint ? this.adsorbPoint : param.intersect.point;
      this.points.push(point);
      this.adsorbPoints = [[point.x], [point.y], [point.z]];
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
        model.pa = [
          fromArrayToStr(this.points[0].toArray()),
          fromArrayToStr(this.adsorbPoint.toArray())
        ];
        this.adsorbPoint = this.computeAdsorbPoint(param.intersect.point.clone());
        this.tempWall.forEach(w => {
          w.update(model, this.adsorbAxes);
        })
      }
    } else if (this.points.length > 1) { // 创建
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
      model.pa = [
        fromArrayToStr(beginPoint.toArray()),
        fromArrayToStr(endPoint.toArray())
      ];
      activeSolution.buildProduct(model);
      this.updateAdsorbPoints();
    }
  }
  drawBox(param) {
    var model, beginPoint, endPoint;
    var p1, p2, p3, p4, paths, flag;
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

      paths = [[p1, p2], [p2, p3], [p3, p4], [p4, p1]]; // 逆时针

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
            fromArrayToStr(p[0].toArray()),
            fromArrayToStr(p[1].toArray())
          ];
          this.tempWall[i].update(model, this.adsorbAxes);
        });
      }
    } else if (this.points.length > 1) {
      beginPoint = this.points.shift();
      endPoint = this.points.shift();

      p1 = beginPoint.clone();
      p3 = endPoint.clone();
      p2 = toVector3([p1.x, p1.y, p3.z]);
      p4 = toVector3([p3.x, p3.y, p1.z]);

      paths = [[p1, p2], [p2, p3], [p3, p4], [p4, p1]]; // 逆时针
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
        var model = cloneDeep(this.model);
        model.pa = [
          fromArrayToStr(p[0].toArray()),
          fromArrayToStr(p[1].toArray())
        ];
        activeSolution.buildProduct(model);
      })
      this.updateAdsorbPoints();
      this.resetTempWall();
    }
  }
  getActiveSolution() {
    return this.designer.solutionManager.getActiveSolution();
  }
  getWallArray() {
    var activeSolution = this.getActiveSolution();
    var productArray = activeSolution.getProductArray();
    return productArray.filter(p => p.getAtt('n') === 'wall');
  }
  getWallPathArray() {
    var wallArray = this.getWallArray();
    return wallArray.map(w => w.getAtt('pa'));
  }
  getWallPointArray() {
    return [...new Set(this.getWallPathArray().flat())];
  }
  getWallPointArrayVector3() {
    return fromArraytoVector3(this.getWallPointArray());
  }
  updateAdsorbPoints() { // 把所有墙的端点 按x,y,z分类并排序
    this.adsorbPoints = zip(...this.getWallPointArray().map(v => fromStrToArray(v))).map(_v => _v.sort((a, b) => a - b));
  }
}
