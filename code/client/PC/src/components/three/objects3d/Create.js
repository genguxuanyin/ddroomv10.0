import {
  Shape,
  ExtrudeGeometry,
  Mesh,
  CatmullRomCurve3,
  Vector3,
  Vector2,
  ShapeGeometry
} from 'three'
import {
  chunk,
  groupBy,
  round
} from 'lodash'
import { toVector3FromArray } from '../util'
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
    var { array: arrayNormal } = geometry.getAttribute('normal');
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
  calcUvs(range = { w: 1024, h: 1024 }, dir = 'h') {
    var geometry = this.geometry;
    if (!geometry.isGeometry) return;
    geometry.computeBoundingBox();
    geometry.faceVertexUvs[0] = [];
    var { min } = geometry.boundingBox;

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
    var { min } = geometry.boundingBox;
    var { array: arrayPosition } = geometry.getAttribute('position');
    var uvArray = [];
    var cp = chunk(arrayPosition, 3);
    toVector3FromArray(cp).forEach((v, i, a) => {
      var _r = this.getRadius(min, v);
      var angleXY = this.getAngleXY(Math.round(_r), v);
      var uvP = this.getUVPosition({ x: angleXY.x || 0, y: angleXY.y || 0 });
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
  getRadius({ x, y, z }, { x: x1, y: y1, z: z1 }) {
    return Math.pow(
      Math.pow(x - x1, 2) + Math.pow(y - y1, 2) + Math.pow(z - z1, 2), 1 / 2
    );
  }
  getAngleXY(r, { x, y, z }) {
    return {
      x: Math.atan2(z, x) + Math.PI,
      y: Math.asin(y / r)
    };
  }
  getUVPosition({ x, y }) {
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
    path = toVector3FromArray(this.model.pa);
    ep = this.model.ep; // 挤压路径
    if (!ep && this.model.h) {
      ep = [
        '0,0,0',
        `0,${this.model.h},0`
      ];
    }
    this.ep = toVector3FromArray(ep);
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
    this.filterFace();// 过滤法线为 0 0 0 的face
    this.calcUvs();// 计算Uvs
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
    path = toVector3FromArray(model.pa);
    this.path = path.map((v) => {
      return new Vector2(v.x, v.z);
    });
    this.shape = new Shape(this.path);
    this.geometry = new ShapeGeometry(this.shape);
    this.material = designer.scene3d.materialManager.getMaterial({ name: 'def', side: 1, map: 'http://f3d.ddroom.cn/upload/images/7723af81-49f7-4a75-b4dd-a3afe4e06fb3/2017-11-01112913/manguchuntian.jpg' })[0];
    // this.material = new MeshPhongMaterial({ color: 0xF5F5F5, side: 1 });
    this.filterFace();
    this.calcUvs();
    this.mesh = new Mesh(this.geometry, this.material);
  }
  create() {
    return this.mesh;
  }
}
