import {
  Shape,
  ExtrudeGeometry,
  Mesh,
  CatmullRomCurve3,
  Vector3,
  Vector2,
  ShapeGeometry,
  Geometry,
  LineSegments,
  Line,
  Group,
  CircleGeometry
} from 'three'
import {
  chunk,
  groupBy,
  round,
  cloneDeep
} from 'lodash'
import {
  fromArraytoVector3,
  fromStrToArray
} from '../util'
import designer from '../Designer'

class Base {
  create() {
    return new Mesh(this.geometry, this.material);
  }
  getModel() {
    return this.model;
  }
  getGeo() {
    return this.geometry;
  }
  getMat() {
    return this.material;
  }
  getMesh() {
    return this.mesh;
  }
  filterFace() {
    var geometry = this.geometry;
    var n = new Vector3();
    geometry.faces = geometry.faces.filter((f) => {
      return !n.equals(f.normal);
    });
  }
  calcGroup() {
    var geometry = this.geometry;
    if (!geometry.isBufferGeometry) return;
    var {
      array: arrayNormal
    } = geometry.getAttribute('normal');
    var cn = chunk(arrayNormal, 3);
    var gn = groupBy(cn, (v) => {
      return v.reduce((t, v, i, a) => {
        return t + ',' + round(v, 4);
      }, '')
    })
    geometry.clearGroups();
    var start = 0;
    var i = 0;
    for (var key in gn) {
      geometry.addGroup(start, gn[key].length, i);
      start += gn[key].length;
      i++;
    }
  }
  calcUvs(range = {
    w: 1024,
    h: 1024
  }, dir = 'h') {
    var geometry = this.geometry;
    if (!geometry.isGeometry) return;
    geometry.computeBoundingBox();
    geometry.faceVertexUvs[0] = [];
    var {
      min
    } = geometry.boundingBox;

    geometry.faces.forEach((face) => {
      var components = ['x', 'y', 'z'].sort((a, b) => {
        return Math.abs(face.normal[a]) - Math.abs(face.normal[b]);
      });

      var offset = new Vector2(0 - min[components[0]], 0 - min[components[1]]);

      var v1 = geometry.vertices[face.a];
      var v2 = geometry.vertices[face.b];
      var v3 = geometry.vertices[face.c];

      geometry.faceVertexUvs[0].push(dir === 'h' ? [
        new Vector2((v1[components[1]] + offset.y) / range.h, (v1[components[0]] + offset.x) / range.w),
        new Vector2((v2[components[1]] + offset.y) / range.h, (v2[components[0]] + offset.x) / range.w),
        new Vector2((v3[components[1]] + offset.y) / range.h, (v3[components[0]] + offset.x) / range.w)
      ] : [
        new Vector2((v1[components[0]] + offset.x) / range.w, (v1[components[1]] + offset.y) / range.h),
        new Vector2((v2[components[0]] + offset.x) / range.w, (v2[components[1]] + offset.y) / range.h),
        new Vector2((v3[components[0]] + offset.x) / range.w, (v3[components[1]] + offset.y) / range.h)
      ]);
    });
    geometry.uvsNeedUpdate = true;
    return geometry;
  }
  calcUvs1(geometry) {
    geometry.computeBoundingBox();
    var {
      min
    } = geometry.boundingBox;
    var {
      array: arrayPosition
    } = geometry.getAttribute('position');
    var uvArray = [];
    var cp = chunk(arrayPosition, 3);
    fromArraytoVector3(cp).forEach((v, i, a) => {
      var _r = this.getRadius(min, v);
      var angleXY = this.getAngleXY(Math.round(_r), v);
      var uvP = this.getUVPosition({
        x: angleXY.x || 0,
        y: angleXY.y || 0
      });
      uvArray.push(uvP.u, uvP.v);

      // 每圈的最后一个点 解决 0 1拼接点的压缩线问题.
      /* if ((i / 3) % (geometry.parameters.widthSegments + 1) === 0) {
        uvP.u = 1;
      } */
    })
    uvArray = new Float32Array(uvArray)
    var uv = geometry.getAttribute("uv");
    uv.needsUpdate = false;
    uv.setArray(uvArray);
    // 更新
    uv.needsUpdate = true;
  }
  getRadius({
    x,
    y,
    z
  }, {
    x: x1,
    y: y1,
    z: z1
  }) {
    return Math.pow(
      Math.pow(x - x1, 2) + Math.pow(y - y1, 2) + Math.pow(z - z1, 2), 1 / 2
    );
  }
  getAngleXY(r, {
    x,
    y,
    z
  }) {
    return {
      x: Math.atan2(z, x) + Math.PI,
      y: Math.asin(y / r)
    };
  }
  getUVPosition({
    x,
    y
  }) {
    return {
      u: (x / (2 * Math.PI)) % 1,
      v: 1 / 2 + y / Math.PI
    }
  }
}

export class CreateExtrude extends Base {
  constructor(model) {
    super();
    var ep, ep_dir, p_dir, cross, path;
    this.model = model;
    path = fromArraytoVector3(this.model.pa);
    ep = this.model.ep; // 挤压路径
    if (!ep && this.model.h) {
      ep = [
        '0,0,0',
        `0,${this.model.h},0`
      ];
    }
    this.ep = fromArraytoVector3(ep);
    p_dir = path[1].clone().sub(path[0]).normalize();
    ep_dir = this.ep[1].clone().sub(this.ep[0]).normalize(); // 挤压方向的方向向量
    cross = new Vector3().crossVectors(p_dir, ep_dir).clone().multiplyScalar(this.model.w / 2); // 求正交向量
    this.path = [
      path[0].clone().add(cross),
      path[0],
      path[0].clone().sub(cross),
      path[1].clone().sub(cross),
      path[1],
      path[1].clone().add(cross)
    ]
    this.shape = new Shape(this.path.map((v) => {
      return new Vector2(-v.z, -v.x);
    }));
    this.extrudeSettings = {
      // curveSegments: 1,
      // depth: 1000
      extrudePath: new CatmullRomCurve3(this.ep)
    };
    // var texture = new TextureLoader().load("http://f3d.ddroom.cn/upload/images/7723af81-49f7-4a75-b4dd-a3afe4e06fb3/2017-11-01112913/manguchuntian.jpg");
    // texture.wrapS = RepeatWrapping;
    // texture.wrapT = RepeatWrapping;
    this.geometry = new ExtrudeGeometry(this.shape, this.extrudeSettings);
    this.material = designer.scene3d.materialManager.getMaterial('def')[0];
    this.filterFace(); // 过滤法线为 0 0 0 的face
    this.calcUvs(); // 计算Uvs
    this.mesh = new Mesh(this.geometry, this.material);
  }
  create() {
    return this.mesh;
  }
  getEP() {
    return this.ep;
  }
  getPath() {
    return this.path;
  }
}

export class CreateShape extends Base {
  constructor(model) {
    super();
    var path;
    this.model = model;
    path = fromArraytoVector3(model.pa);
    this.path = path.map(v => new Vector2(v.x, v.z));
    this.shape = new Shape(this.path);
    this.geometry = new ShapeGeometry(this.shape);
    this.material = designer.scene3d.materialManager.getMaterial(model.m)[0];
    this.filterFace();
    this.calcUvs();
    this.mesh = new Mesh(this.geometry, this.material);
    model.p && this.mesh.position.set(...fromStrToArray(model.p)); // position 旋转
  }
  create() {
    return this.mesh;
  }
}

export class CreateShapes extends Base {
  constructor(model) {
    super();
    var hs, mats, cmodel, shape;
    this.shapes = [];
    this.meshs = [];
    this.model = model;
    hs = fromStrToArray(model.h);
    mats = model.m;
    hs.map((h, i) => {
      cmodel = cloneDeep(this.model)
      delete cmodel.h;
      cmodel.p = `0,0,${h}`;
      cmodel.m = Array.isArray(mats) ? (mats[i] ? mats[i] : (mats.length > 0 ? mats[0] : 'def')) : mats;
      shape = new CreateShape(cmodel);
      this.shapes.push(shape)
      this.meshs.push(shape.create())
    })
  }
  create() {
    return this.meshs;
  }
}

export class CreateLineSegments {
  constructor(path = ['0,0,0', '1,0,1']) {
    this.path = fromArraytoVector3(path);
    this.geometry = new Geometry();
    this.geometry.vertices.push(...this.path);
    this.material = designer.scene3d.materialManager.getMaterial('lineDashed1')[0];
    this.mesh = new LineSegments(this.geometry, this.material);
    this.mesh.computeLineDistances();
  }
  create() {
    return this.mesh;
  }
  update(path) {
    this.path = path;
    this.geometry.vertices.length = 0;
    this.geometry.vertices.push(...this.path);
    this.geometry.verticesNeedUpdate = true;
    this.geometry.lineDistancesNeedUpdate = true;
    this.mesh.computeLineDistances();
  }
}

export class CreateLine {
  constructor(path) {
    this.path = fromArraytoVector3(path);
    this.geometry = new Geometry();
    this.material = designer.scene3d.materialManager.getMaterial({
      name: "line1",
      type: "line",
      color: 0x00008B
    })[0];
    this.geometry.vertices.push(...this.path);
    this.mesh = new Line(this.geometry, this.material);
  }
  create() {
    return this.mesh;
  }
  update(path) {
    this.path = path;
    this.geometry.vertices.length = 0;
    this.geometry.vertices.push(...this.path);
    this.geometry.verticesNeedUpdate = true;
  }
  setVisible(value) {
    this.mesh.visible !== !!value && (this.mesh.visible = !!value)
  }
}

export class CreateCircle {
  constructor(r, pos) {
    this.r = r;
    this.pos = pos;
    this.geometry = new CircleGeometry(r, 32);
    this.material = designer.scene3d.materialManager.getMaterial({
      name: "circle1",
      type: "phong",
      color: 0x00008B
    })[0];
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.rotateX(-Math.PI / 2);
    this.mesh.position.copy(this.pos);
  }
  create() {
    return this.mesh;
  }
  update(pos) {
    this.mesh.position.copy(pos);
  }
}

export class CreateDraw extends Group {
  constructor(model, hasCircle = true) {
    super();
    var ep, p_dir, ep_dir, cross, path;
    this.model = model;
    this.lines = [];
    this.hasCircle = hasCircle;
    path = fromArraytoVector3(this.model.pa);
    ep = this.model.ep; // 挤压路径
    if (!ep && this.model.h) {
      ep = [
        '0,0,0',
        `0,${this.model.h},0`
      ];
    }
    this.ep = fromArraytoVector3(ep);
    p_dir = path[1].clone().sub(path[0]).normalize();
    ep_dir = this.ep[1].clone().sub(this.ep[0]).normalize(); // 挤压方向的方向向量
    cross = new Vector3().crossVectors(p_dir, ep_dir).clone().multiplyScalar(this.model.w / 2); // 求正交向量
    this.path = [
      path[0].clone().add(cross),
      path[0],
      path[0].clone().sub(cross),
      path[1].clone().sub(cross),
      path[1],
      path[1].clone().add(cross),
      path[0].clone().add(cross)
    ]
    this.visible = false;
    this.create();
  }
  create() {
    var paths = [
      [this.path[1], this.path[4]],
      this.path,
      ['-1,0,0', '1,0,0'],
      ['0,-1,0', '0,1,0'],
      ['0,0,-1', '0,0,1']
    ]
    paths.forEach(p => {
      this.lines.push(new CreateLine(p))
      this.add(this.lines[this.lines.length - 1].create())
    });
    if (this.hasCircle) {
      this.circle = new CreateCircle(this.model.w / 2, this.path[4]);
      this.add(this.circle.create());
    }
  }
  update(model, adsorbAxes, endpoint) {
    if (this.visible === false) this.visible = true;
    var ep, ep_dir, p_dir, cross, path;
    this.model = model;
    path = fromArraytoVector3(this.model.pa);
    ep = this.model.ep; // 挤压路径
    if (!ep && this.model.h) {
      ep = [
        '0,0,0',
        `0,${this.model.h},0`
      ];
    }
    this.ep = fromArraytoVector3(ep);
    p_dir = path[1].clone().sub(path[0]).normalize();
    ep_dir = this.ep[1].clone().sub(this.ep[0]).normalize(); // 挤压方向的方向向量
    cross = new Vector3().crossVectors(p_dir, ep_dir).clone().multiplyScalar(this.model.w / 2); // 求正交向量
    this.path = [
      path[0].clone().add(cross),
      path[0],
      path[0].clone().sub(cross),
      path[1].clone().sub(cross),
      path[1],
      path[1].clone().add(cross),
      path[0].clone().add(cross)
    ]
    var paths = [
      [this.path[1], this.path[4]],
      this.path,
      ['-1,0,0', '1,0,0'],
      ['0,-1,0', '0,1,0'],
      ['0,0,-1', '0,0,1']
    ]
    for (let i = 0; i < 2; i++) {
      const line = this.lines[i];
      line.update(paths[i]);
    }
    var flag, dir, cross_dir;
    endpoint = endpoint ? endpoint : this.path[4];
    for (let i = 2; i < 5; i++) {
      flag = adsorbAxes[i - 2];
      dir = new Vector3();
      dir.setComponent(i - 2, 1);
      cross_dir = new Vector3().crossVectors(dir, ep_dir);
      cross_dir.multiplyScalar(20000);
      this.lines[i].setVisible(flag);
      this.lines[i].update([endpoint.clone().sub(cross_dir), endpoint.clone().add(cross_dir)]);
    }
    if (this.hasCircle && this.circle) {
      this.circle.update(this.path[4])
    }
  }
}

export class CreatePoint extends Group {
  constructor(point, radius = 120, ep_dir = new Vector3(0, 1, 0)) {
    super();
    this.point = point;
    this.radius = radius;
    this.ep_dir = ep_dir;
    this.lines = [];
    this.visible = false;
    this.create();
  }
  create() {
    var paths = [
      ['-1,0,0', '1,0,0'],
      ['0,-1,0', '0,1,0'],
      ['0,0,-1', '0,0,1']
    ]
    paths.forEach(p => {
      this.lines.push(new CreateLine(p))
      this.add(this.lines[this.lines.length - 1].create())
    });
    this.circle = new CreateCircle(this.radius, this.point);
    this.add(this.circle.create());
  }
  update(point, adsorbAxes) {
    if (this.visible === false) this.visible = true;
    this.lines.forEach((l, i) => {
      var flag, dir, cross_dir;
      flag = adsorbAxes[i];
      dir = new Vector3();
      dir.setComponent(i, 1);
      cross_dir = new Vector3().crossVectors(dir, this.ep_dir);
      cross_dir.multiplyScalar(20000);
      l.setVisible(flag);
      l.update([point.clone().sub(cross_dir), point.clone().add(cross_dir)]);
    })
    this.circle.update(point)
  }
}
