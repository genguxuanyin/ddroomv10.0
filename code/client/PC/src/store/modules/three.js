const TYPES = {
  SET_ENV: "SET_ENV",
  SET_LIGHT: "SET_LIGHT",
  SET_RENDERER: "SET_RENDERER",
  SET_CAMERA: "SET_CAMERA"
}

const state = {
  env: [
    {
      name: 'grid',
      type: 'grid',
      size: 25000,
      step: 50,
      colorCenter: 0x0000ff,
      color: 0xcccccc,
      enabled: true
    }
  ],
  lights: [
    {
      type: "HemisphereLight",
      position: { x: 0, y: 1, z: 0 },
      skyColor: 0xaaaaff,
      groundColor: 0x806060,
      intensity: 0.2
    },
    {
      type: "DirectionalLight",
      position: { x: 1, y: 1, z: 1 },
      color: 0xffffff,
      intensity: 0.8
    }
  ],
  renderer: {
    antialias: true,
    alpha: true,
    backgroundColor: 0xffffff,
    backgroundAlpha: 0,
    gammaOutput: false
  },
  camera: {
    fov: 45,
    aspect: 1,
    near: 1,
    far: 10000,
    position: { x: 4000, y: 4000, z: 4000 },
    rotation: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    lookAt: { x: 0, y: 0, z: 0 }
  }
}

const mutations = {

}

const actions = {

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

