import {
  Box3,
  Vector3,
  Vector2,
  BufferAttribute,
  Group,
  BoxGeometry,
  Mesh
} from 'three';
import {
  attempt
} from 'lodash'

/* eslint-disable */

const box = new Box3();

function getSize(object) {
  box.setFromObject(object);

  return box.getSize(new Vector3());
}

function getCenter(object) {
  box.setFromObject(object);

  return box.getCenter(new Vector3());
}

// function lightsDiff(lights, oldLights) {
// }

function toIndexed(bufferGeometry) {
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

function jsonToStr(obj) {
  return attempt(JSON.stringify.bind(null, obj));
}

function strToJson(str) {
  return attempt(JSON.parse.bind(null, str));
}


function createPart(model, parentGroup, productKey, checkCache, onload, onprogress, onerror) {
  if (!model.baseModel) {
    const partGroup = new Group();
    buildGroup(model, partGroup, productKey);
    parentGroup.add(partGroup);
    if (onload) {
      onload(model, {
        type: 'group',
        group: partGroup
      });
    }
    createSubParts(model, partGroup, productKey, checkCache, onload, onprogress, onerror);
  } else if (model.baseModel.type === 'material') {
    
  } else {
    if (checkCache) {
      checkCache(model, (cacheObj) => {
        if (cacheObj) {
          buildGroup(model, cacheObj, productKey);
          parentGroup.add(cacheObj);
          if (onload) {
            onload(model, {
              type: 'part',
              group: cacheObj,
              hasMesh: true
            });
          }
          createSubParts(model, cacheObj, productKey, checkCache, onload, onprogress, onerror);
        } else {
          const partGroup = new Group();
          buildGroup(model, partGroup, productKey);
          parentGroup.add(partGroup);
          if (onload) {
            onload(model, {
              type: 'part',
              group: partGroup,
              hasMesh: false
            });
          }
          createPartMesh(model, partGroup, onload);
          createSubParts(model, partGroup, productKey, checkCache, onload, onprogress, onerror);
        }
      });
    } else {
      const partGroup = new Group();
      buildGroup(model, partGroup, productKey);
      parentGroup.add(partGroup);
      if (onload) {
        onload(model, {
          type: 'part',
          group: partGroup,
          hasMesh: false
        });
      }
      createPartMesh(model, partGroup, onload);
      createSubParts(model, partGroup, productKey, checkCache, onload, onprogress, onerror);
    }
  }
}

function buildGroup(model, group, productKey) {
  if (group) {
    group.userData = {
      productKey: productKey,
      key: model.key,
      type: model.type
    };
  }
  if (model.baseModel) {
    if (model.size && model.baseModel.size) {
      switch (model.baseModel.type) {
        case 'load':
        case 'cube':
          model.baseModel.scale = {};
          model.baseModel.scale.x = Math.abs(model.size.w / model.baseModel.size.w);
          model.baseModel.scale.y = Math.abs(model.size.h / model.baseModel.size.h);
          model.baseModel.scale.z = Math.abs(model.size.d / model.baseModel.size.d);
          break;
      }
    }
    model.baseModel.scale = model.baseModel.scale || {
      x: 1,
      y: 1,
      z: 1
    };
    if (group) {
      group.scale.set(model.baseModel.scale.x, model.baseModel.scale.y, model.baseModel.scale.z);
      switch (model.baseModel.type) {
        case 'load':
        case 'cube':
        case 'extrude':
          if (model.baseModel.position !== undefined) {
            group.position.set(model.baseModel.position.x, model.baseModel.position.y, model.baseModel.position.z);
          }
          break;
        case 'shape':
          if (model.baseModel.height !== undefined) {
            group.position.set(0, model.baseModel.height, 0);
          }
          break;
      }
    }
    if (model.type !== 'board' && model.baseModel.angle && model.type !== 'hole' && model.type !== 'ceiling' && model.type !== 'topLineMade') {
      group.setRotationFromAxisAngle(new Vector3(1, 0, 0), 0);
      group.rotateOnAxis(new Vector3(1, 0, 0), model.baseModel.angle.x);
      group.rotateOnAxis(new Vector3(0, 1, 0), model.baseModel.angle.y);
      group.rotateOnAxis(new Vector3(0, 0, 1), model.baseModel.angle.z);
    }
  } else { // 如果是产品组
    if (model.position) {
      group.position.set(model.position.x, model.position.y, model.position.z);
    }
    if (model.angle) {
      group.rotation.set(model.angle.x, model.angle.y, model.angle.z);
    }
    if (model.scale) {
      group.scale.set(model.scale.x, model.scale.y, model.scale.z);
    }
  }
  return group;
}

function createSubParts(model, partGroup, productKey, checkCache, onload, onprogress, onerror) {
  if (model.parts && model.parts.length > 0) {
    var partModel;
    for (var i = 0; i < model.parts.length; i++) {
      partModel = model.parts[i];
      if (!partModel.disabled) {
        createPart(partModel, partGroup, productKey, checkCache, onload, onprogress, onerror);
      }
    }
  }
}

function createPartMesh(model, partGroup, onload) {
  model.baseModel = model.baseModel || {
    size: {
      w: 100,
      h: 100,
      d: 100
    },
    visible: false
  };
  if (model.baseModel.materials) {
    createCubeModel(model.baseModel, (mesh) => {
      partGroup.add(mesh);
      if (onload) {
        onload(model, {
          type: 'partMesh',
          group: partGroup
        });
      }
    });
  }
}

function createCubeModel(model, func) {
  var geometry = new BoxGeometry(200, 200, 200);
  var mesh = new Mesh(geometry);
  if (func) {
    func(mesh)
  }
}

function createModel(model, checkCache, onload, onprogress, onerror) {
	if (model.baseModel && model.baseModel.type === 'load') {
		if (checkCache) {
			checkCache(model, function (cacheObj) {
				if (cacheObj) {
					//console.info('product3d(' + model.key + ') loadFromCache(' + model.name + ').');
					buildGroup(model, cacheObj, model.key);
					if (onload) {
						onload(model, {
							type: 'product',
							group: cacheObj,
							hasMesh: true
						});
					}
					createSubParts(model, cacheObj, model.key, checkCache, onload, onprogress, onerror);
				} else {
					loadObj(model, function (result) {
						if (result.type === 'loadTempObj') {
							buildGroup(model, result.group, model.key);
							if (onload) {
								onload(model, {
									type: 'product',
									group: result.group,
									hasMesh: false
								});
							}
							createSubParts(model, result.group, model.key, checkCache, onload, onprogress, onerror);
						} else if (onload) {
							onload(model, {
								type: 'productMesh',
								group: result.group
							});
						}
					},
						function (xhr) {
							if (onprogress) {
								onprogress(model, {
									type: 'product',
									xhr: xhr
								});
							}
						},
						function (xhr) {
							if (onerror) {
								onerror(model, {
									type: 'product',
									xhr: xhr
								});
							}
						});
				}
			});
		} else {
			loadObj(model, function (result) {
				if (result.type === 'loadTempObj') {
					buildGroup(model, result.group, model.key);
					if (onload) {
						onload(model, {
							type: 'product',
							group: result.group,
							hasMesh: false
						});
					}
					createSubParts(model, result.group, model.key, checkCache, onload, onprogress, onerror);
				} else if (onload) {
					onload(model, {
						type: 'productMesh',
						group: result.group
					});
				}
			},
				function (xhr) {
					if (onprogress) {
						onprogress(model, {
							type: 'product',
							xhr: xhr
						});
					}
				},
				function (xhr) {
					if (onerror) {
						onerror(model, {
							type: 'product',
							xhr: xhr
						});
					}
				});
		}
	} else {
		var productGroup = new Group();
		buildGroup(model, productGroup, model.key);
		if (onload) {
			onload(model, {
				type: 'product',
				group: productGroup,
				hasMesh: true
			});
		}
		createSubParts(model, productGroup, model.key, checkCache, onload, onprogress, onerror);
	}
}

export { getSize, getCenter, toIndexed, jsonToStr, strToJson, createPart, createModel };
