import {
  Box3,
  Vector3,
  Vector2,
  BufferAttribute
} from 'three';
import {
  attempt
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

  let face; let faceNormalss; let faceUvs; let
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

  let normalBuffer; let
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

export function fromStrToArray(v, n = 1) { // "1,2,3" => [1,2,3]
  return Array.isArray(v) ? v : v.split(/,/g).map((v) => {
    return parseFloat(v) * n;
  });
}

export function fromArraytoVector3(a) {
  return a.map((v) => {
    return toVector3(v);
  })
}

export function toVector3(v) { // [1,2,3] => Vector3 [1,2,3]
  return v.isVector3 ? v : new Vector3(...fromStrToArray(v));
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
      return middle;
    }
    else if (val > num) {
      right = middle;
    }
    else {
      left = middle;
    }
  }
  var leftValue = arr[left];
  var rightValue = arr[right];
  return rightValue - num > num - leftValue ? leftValue : rightValue;
}

export function twoPointsEquation({ x: x1, y: y1 }, { x: x2, y: y2 }) { //平面两点求直线方程
  x1 = Big(x1);
  y1 = Big(y1);
  x2 = Big(x2);
  y2 = Big(y2);
  return {
    A: + y2.minus(y1),
    B: + x1.minus(x2),
    C: + x2.times(y1).minus(x1.times(y2))
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
    C: + Big(line.C).plus(D2.times(dis))
  }, {
    A: line.A,
    B: line.B,
    C: + Big(line.C).minus(D2.times(dis))
  }
  ];
}

export function footPoint({ x, y }, line) { //平面上点到直线的垂足
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