import {
  Box3,
  Vector3,
  Vector2,
  BufferAttribute
} from 'three';
import {
  attempt,
  zipObject
} from 'lodash'
import Big from 'big.js'

Big.DP = 2;

/* eslint-disable */

const box = new Box3();

export function getSize(object) {
  box.setFromObject(object);

  return box.getSize(new Vector3());
}

export function getCenter(object) {
  box.setFromObject(object);

  return box.getCenter(new Vector3());
}

// function lightsDiff(lights, oldLights) {
// }

export function toIndexed(bufferGeometry) {
  const rawPositions = bufferGeometry.getAttribute('position').array;

  let rawUvs;
  const hasUV = bufferGeometry.getAttribute('uv') !== undefined;
  if (hasUV) rawUvs = bufferGeometry.getAttribute('uv').array;

  let rawNormals;
  const hasNormal = bufferGeometry.getAttribute('normal') !== undefined;
  if (hasNormal) rawNormals = bufferGeometry.getAttribute('normal').array;

  const indices = [];
  const vertices = [];
  const normals = [];
  const uvs = [];

  let face;
  let faceNormalss;
  let faceUvs;
  let
    tmpIndices;

  const v0 = new Vector3();
  const v1 = new Vector3();
  const v2 = new Vector3();

  const n0 = new Vector3();
  const n1 = new Vector3();
  const n2 = new Vector3();

  const uv0 = new Vector2();
  const uv1 = new Vector2();
  const uv2 = new Vector2();

  for (let i = 0; i < rawPositions.length; i += 9) {
    v0.x = rawPositions[i];
    v0.y = rawPositions[i + 1];
    v0.z = rawPositions[i + 2];

    v1.x = rawPositions[i + 3];
    v1.y = rawPositions[i + 4];
    v1.z = rawPositions[i + 5];

    v2.x = rawPositions[i + 6];
    v2.y = rawPositions[i + 7];
    v2.z = rawPositions[i + 8];

    face = [v0, v1, v2];

    if (hasNormal) {
      n0.x = rawNormals[i];
      n0.y = rawNormals[i + 1];
      n0.z = rawNormals[i + 2];

      n1.x = rawNormals[i + 3];
      n1.y = rawNormals[i + 4];
      n1.z = rawNormals[i + 5];

      n2.x = rawNormals[i + 6];
      n2.y = rawNormals[i + 7];
      n2.z = rawNormals[i + 8];

      faceNormalss = [n0, n1, n2];
    }

    if (hasUV) {
      uv0.x = rawUvs[i];
      uv0.y = rawUvs[i + 1];

      uv1.x = rawUvs[i + 2];
      uv1.y = rawUvs[i + 3];

      uv2.x = rawUvs[i + 4];
      uv2.y = rawUvs[i + 5];

      faceUvs = [uv0, uv1, uv2];
    }

    tmpIndices = [];

    face.forEach((v, i) => {
      let id = exists(v, vertices);
      if (id === -1) {
        id = vertices.length;
        vertices.push(v.clone());

        if (hasNormal) normals.push(faceNormalss[i].clone());
        if (hasUV) uvs.push(faceUvs[i].clone());
      }
      tmpIndices.push(id);
    });

    indices.push(tmpIndices[0], tmpIndices[1], tmpIndices[2]);
  }

  const positionBuffer = new Float32Array(vertices.length * 3);

  let normalBuffer;
  let
    uvBuffer;

  if (hasNormal) normalBuffer = new Float32Array(vertices.length * 3);
  if (hasUV) uvBuffer = new Float32Array(vertices.length * 2);

  let i2 = 0;
  let i3 = 0;
  for (let i = 0; i < vertices.length; i++) {
    i3 = i * 3;

    positionBuffer[i3] = vertices[i].x;
    positionBuffer[i3 + 1] = vertices[i].y;
    positionBuffer[i3 + 2] = vertices[i].z;

    if (hasNormal) {
      normalBuffer[i3] = normals[i].x;
      normalBuffer[i3 + 1] = normals[i].y;
      normalBuffer[i3 + 2] = normals[i].z;
    }

    if (hasUV) {
      i2 = i * 2;
      uvBuffer[i2] = uvs[i].x;
      uvBuffer[i2 + 1] = uvs[i].y;
    }
  }

  bufferGeometry.addAttribute('position', new BufferAttribute(positionBuffer, 3));
  if (hasNormal) bufferGeometry.addAttribute('normal', new BufferAttribute(normalBuffer, 3));
  if (hasUV) bufferGeometry.addAttribute('uv', new BufferAttribute(uvBuffer, 2));
  bufferGeometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1));
  return bufferGeometry;

  function exists(v, vertices) {
    for (let i = 0; i < vertices.length; i++) {
      if (v.equals(vertices[i])) return i;
    }
    return -1;
  }
}

export function jsonToStr(obj) {
  return attempt(JSON.stringify.bind(null, obj));
}

export function strToJson(str) {
  return attempt(JSON.parse.bind(null, str));
}

export function fromArrayToStr(a) { // [1,2,3] => "1,2,3"
  return a.toString();
}

export function fromObjectToStr(o, dim = ['x', 'y', 'z']) { // {x:1,y:2,z:3} => "1,2,3"
  var result = [];
  dim.forEach(d => {
    result.push(o[d]);
  })
  return result.join(',');
}

export function fromStrToArray(v, n = 1) { // "1,2,3" => [1,2,3]
  return Array.isArray(v) ? v.map(_v => {
    return _v * n;
  }) : v.split(/,/g).map((_v) => {
    return parseFloat(_v) * n;
  });
}

export function fromStrToObject(v, n = 1, dim = ['x', 'y', 'z']) { // "1,2,3" => [1,2,3]
  var arr = Array.isArray(v) ? v.map(_v => {
    return _v * n;
  }) : v.split(/,/g).map(_v => {
    return parseFloat(_v) * n;
  });
  return zipObject(dim, arr);
}

export function fromArraytoVector3(a) {
  return a.map((v) => {
    return toVector3(v);
  })
}

export function toVector3(v) { // [1,2,3] => Vector3 [1,2,3]
  if (v.isVector3) {
    return v
  } else if (Array.isArray(v)) {
    return new Vector3(...v);
  } else if (typeof v === 'string') {
    return new Vector3(...fromStrToArray(v));
  } else if (typeof v === 'object') {
    return new Vector3(v.x, v.y, v.z);
  } else {
    console.error(`${v} illegal`);
  }
}

export function toStr(v) {
  if (Array.isArray(v)) {
    return fromArrayToStr(v);
  } else if (typeof v === 'object') {
    return fromObjectToStr(v);
  } else if (typeof v === 'string') {
    return v;
  } else {
    console.error(`${v} illegal`);
  }
}

export function getDir(p, normalize = true) {
  var dir;
  if (Array.isArray(p) && p.length === 2) {
    p = fromArraytoVector3(p)
    dir = p[1].clone().sub(p[0]);
    return normalize ? dir.normalize().toFixed() : dir.toFixed();
  }
  console.error(`${p} illegal`);
  return toVector3('0,0,0');
}

export function collinear(d0, d1) {
  d0 = toVector3(d0);
  d1 = toVector3(d1);
  return d0.clone().cross(d1).toFixed().equals(toVector3('0,0,0'));
}

export function getClosest(arr, num) { // 二分查找和num最接近的值
  var left = 0;
  var right = arr.length - 1;
  while (left <= right) {
    var middle = Math.floor((right + left) / 2);
    if (right - left <= 1) {
      break;
    }
    var val = arr[middle];
    if (val === num) {
      return val;
    } else if (val > num) {
      right = middle;
    } else {
      left = middle;
    }
  }
  var leftValue = arr[left];
  var rightValue = arr[right];
  return rightValue - num > num - leftValue ? leftValue : rightValue;
}

export function twoPointsEquation({
  x: x1,
  y: y1
}, {
  x: x2,
  y: y2
}) { //平面两点求直线方程
  x1 = Big(x1);
  y1 = Big(y1);
  x2 = Big(x2);
  y2 = Big(y2);
  return {
    A: +y2.minus(y1),
    B: +x1.minus(x2),
    C: +x2.times(y1).minus(x1.times(y2))
  };
  // return {
  //   A: y2 - y1,
  //   B: x1 - x2,
  //   C: x2 * y1 - x1 * y2
  // };
}

export function parallelLine(line, dis) { //平面上到直线一定距离的直线方程
  var D2 = Big(line.A).pow(2).plus(Big(line.B).pow(2)).sqrt()
  return [{
    A: line.A,
    B: line.B,
    C: +Big(line.C).plus(D2.times(dis))
  }, {
    A: line.A,
    B: line.B,
    C: +Big(line.C).minus(D2.times(dis))
  }];
}

export function footPoint({
  x,
  y
}, line) { //平面上点到直线的垂足
  var a = Big(line.A);
  var b = Big(line.B);
  var c = Big(line.C);

  var d = a.pow(2).plus(b.pow(2));
  return {
    x: (b.times(b).times(x).minus(a.times(b).times(y)).minus(a.times(c))).div(d),
    y: (a.times(a).times(y).minus(a.times(b).times(x)).minus(b.times(c))).div(d)
  };
  // return {
  //   x: parseFloat(((line.B * line.B * x - line.A * line.B * y - line.A * line.C) / D).toFixed(2)),
  //   y: parseFloat(((line.A * line.A * y - line.A * line.B * x - line.B * line.C) / D).toFixed(2)),
  // };
}

export function segmentsIntr1([p00, p01], [p10, p11], isSegments, dim = ['x', 'z']) { //求两条线段或直线的交点
  var p00x = Big(p00[dim[0]]);
  var p00y = Big(p00[dim[1]]);
  var p01x = Big(p01[dim[0]]);
  var p01y = Big(p01[dim[1]]);

  var p10x = Big(p10[dim[0]]);
  var p10y = Big(p10[dim[1]]);
  var p11x = Big(p11[dim[0]]);
  var p11y = Big(p11[dim[1]]);

  /* 1 解线性方程组, 求线段交点*/
  // 如果分母为0 则平行或共线, 不相交
  var denominator = (p01y.minus(p00y)).times(p11x.minus(p10x)).minus((p00x.minus(p01x)).times(p10y.minus(p11y)));
  if (+denominator === 0) {
    return false;
  }
  // 线段所在直线的交点坐标 (x , y)      
  var x = ((p01x.minus(p00x)).times(p11x.minus(p10x)).times(p10y.minus(p00y)).plus((p01y.minus(p00y)).times(p11x.minus(p10x)).times(p00x)).minus((p11y.minus(p10y)).times(p01x.minus(p00x)).times(p10x))).div(denominator)
  var y = ((p01y.minus(p00y)).times(p11y.minus(p10y)).times(p10x.minus(p00x)).plus((p01x.minus(p00x)).times(p11y.minus(p10y)).times(p00y)).minus((p11x.minus(p10x)).times(p01y.minus(p00y)).times(p10y))).times(-1).div(denominator)

  if (!isSegments) {
    return {
      x: +x,
      y: +y
    }
  }
  /* 2 判断交点是否在两条线段上 */
  if ( // 交点在线段1上  
    (x.minus(p00x)).times(x.minus(p01x)).lte(0) &&
    (y.minus(p00y)).times(y.minus(p01y)).lte(0) &&

    (x.minus(p10x)).times(x.minus(p11x)).lte(0) &&
    (y.minus(p10y)).times(y.minus(p11y)).lte(0)
  ) {
    // 返回交点p  
    return {
      x: +x,
      y: +y
    }
  }
  //否则不相交
  return false;
}

export function segmentsIntr([p00, p01], [p10, p11], isSegments, dim = ['x', 'z', 'y']) { //求两条线段或直线的交点
  var p00x = p00[dim[0]];
  var p00y = p00[dim[1]];
  var p01x = p01[dim[0]];
  var p01y = p01[dim[1]];

  var p10x = p10[dim[0]];
  var p10y = p10[dim[1]];
  var p11x = p11[dim[0]];
  var p11y = p11[dim[1]];

  /* 1 解线性方程组, 求线段交点*/
  // 如果分母为0 则平行或共线, 不相交
  var denominator = (p01y - p00y) * (p11x - p10x) - (p00x - p01x) * (p10y - p11y);
  if (denominator == 0) {
    return false;
  }
  // 线段所在直线的交点坐标 (x , y)      
  var x = ((p01x - p00x) * (p11x - p10x) * (p10y - p00y) + (p01y - p00y) * (p11x - p10x) * p00x -
    (p11y - p10y) * (p01x - p00x) * p10x) / denominator;
  var y = -((p01y - p00y) * (p11y - p10y) * (p10x - p00x) + (p01x - p00x) * (p11y - p10y) * p00y -
    (p11x - p10x) * (p01y - p00y) * p10y) / denominator;

  if (!isSegments) {
    return {
      [dim[0]]: parseFloat(x.toFixed(2)),
      [dim[1]]: parseFloat(y.toFixed(2)),
      [dim[2]]: p00[dim[2]]
    }
  }
  /* 2 判断交点是否在两条线段上 */
  if ( // 交点在线段1上  
    (x - p00x) * (x - p01x) <= 0 && (y - p00y) * (y - p01y) <= 0
    // 且交点也在线段2上  
    &&
    (x - p10x) * (x - p11x) <= 0 && (y - p10y) * (y - p11y) <= 0
  ) {
    // 返回交点p  
    return {
      [dim[0]]: parseFloat(x.toFixed(2)),
      [dim[1]]: parseFloat(y.toFixed(2)),
      [dim[2]]: p00[dim[2]]
    }
  }
  //否则不相交  
  return false;
}

export function pointOnPath(point, path) {
  path = fromArraytoVector3(path);
  point = toVector3(point);
  if (point.equals(path[0]) || point.equals(path[1])) {
    return true;
  }
  if (getDir([path[0], point]).negate().equals(getDir([path[1], point]))) {
    return true;
  }
  return false;
}
