<template>
  <div style="width: 100%; height: 100%; margin: 0; border: 0; padding: 0;">
    <canvas v-if="suportWebGL" ref="canvas" style="width: 100%; height: 100%;"></canvas>
    <div v-else>
      <slot>
        Your browser does not seem to support
        <a
          href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation"
          style="color:#000"
        >WebGL</a>.
        <br />'
      </slot>
    </div>
  </div>
</template>

<script>
import './extend/Group'
import {
  Group,
  Vector2,
  Color,
  Scene,
  BoxGeometry,
  Mesh,
  Raycaster,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { getSize } from './util'
import CameraManager from './manager/CameraManager'
import LightManager from './manager/LightManager'
import EnvManager from './manager/EnvManager'

const suportWebGL = (() => {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
})()

const DEFAULT_GL_OPTIONS = {
  antialias: true,
  alpha: true
}

export default {
  props: {
    width: {
      type: Number,
      default: window.innerWidth
    },
    height: {
      type: Number,
      default: window.innerHeight
    }
  },
  data() {
    const solutionGroup = new Group()
    const lightGroup = new Group()
    const envGroup = new Group()
    const tempGroup = new Group()
    solutionGroup.name = 'solutionGroup'
    lightGroup.name = 'lightGroup'
    envGroup.name = 'envGroup'
    tempGroup.name = 'tempGroup'
    return {
      crossOrigin: 'anonymous',
      controllable: true,
      suportWebGL,
      size: {
        width: this.width,
        height: this.height
      },
      object: null,
      raycaster: new Raycaster(),
      mouse: new Vector2(),
      cameraManager: new CameraManager(),
      camera: null,
      lightManager: new LightManager(lightGroup),
      envManager: new EnvManager(envGroup),
      scene: new Scene(),
      renderer: null,
      controls: null,
      solutionGroup,
      lightGroup,
      envGroup,
      tempGroup,
      clock: typeof performance === 'undefined' ? Date : performance,
      reqId: null // requestAnimationFrame id
    }
  },
  computed: {
    hasListener() {
      // 判断是否有鼠标事件监听，用于减少不必要的拾取判断
      /* eslint-disable no-underscore-dangle */
      const events = this._events
      const result = {}

      ;['on-mousemove', 'on-mouseup', 'on-mousedown', 'on-click'].forEach(
        name => {
          result[name] = !!events[name] && events[name].length > 0
        }
      )

      return result
    },
    envParams() {
      return this.$store.state.three.env
    },
    lightParams() {
      return this.$store.state.three.lights
    },
    cameraParams() {
      return this.$store.state.three.camera
    },
    rendererParams() {
      return this.$store.state.three.renderer
    }
  },
  watch: {
    cameraParams: {
      deep: true,
      handler() {
        this.changeCamera()
      }
    },
    size: {
      deep: true,
      handler() {
        this.updateCamera()
        this.updateRenderer()
      }
    },
    controllable() {
      this.updateControls()
    },
    backgroundAlpha() {
      this.updateRenderer()
    },
    backgroundColor() {
      this.updateRenderer()
    }
  },
  mounted() {
    if (this.width === undefined || this.height === undefined) {
      this.size = {
        width: this.$el.offsetWidth,
        height: this.$el.offsetHeight
      }
    }

    const options = Object.assign({}, DEFAULT_GL_OPTIONS, this.glOptions, {
      canvas: this.$refs.canvas
    })

    this.renderer = new WebGLRenderer(options)
    this.renderer.shadowMap.enabled = true
    // this.renderer.gammaOutput = this.gammaOutput
    this.initCamera()
    this.initLights()
    this.initEnv()

    const mesh = new Mesh(new BoxGeometry(1000, 1000, 1000))
    this.solutionGroup.add(mesh)
    this.scene.add(this.solutionGroup)
    this.scene.add(this.lightGroup)
    this.scene.add(this.envGroup)
    this.scene.add(this.tempGroup)
    this.update()

    this.$el.addEventListener('mousedown', this.onMouseDown, false)
    this.$el.addEventListener('mousemove', this.onMouseMove, false)
    this.$el.addEventListener('mouseup', this.onMouseUp, false)
    this.$el.addEventListener('click', this.onClick, false)

    window.addEventListener('resize', this.onResize, false)

    this.start()
  },
  beforeDestroy() {
    cancelAnimationFrame(this.reqId)

    this.$el.removeEventListener('mousedown', this.onMouseDown, false)
    this.$el.removeEventListener('mousemove', this.onMouseMove, false)
    this.$el.removeEventListener('mouseup', this.onMouseUp, false)
    this.$el.removeEventListener('click', this.onClick, false)

    window.removeEventListener('resize', this.onResize, false)
  },
  methods: {
    onResize() {
      this.$nextTick(() => {
        this.size = {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        }
      })
    },
    onMouseDown(event) {
      if (!this.hasListener['on-mousedown']) return

      const intersected = this.pick(event.clientX, event.clientY)
      this.$emit('on-mousedown', intersected)
    },
    onMouseMove(event) {
      if (!this.hasListener['on-mousemove']) return

      const intersected = this.pick(event.clientX, event.clientY)
      this.$emit('on-mousemove', intersected)
    },
    onMouseUp(event) {
      if (!this.hasListener['on-mouseup']) return

      const intersected = this.pick(event.clientX, event.clientY)
      this.$emit('on-mouseup', intersected)
    },
    onClick(event) {
      if (!this.hasListener['on-click']) return

      const intersected = this.pick(event.clientX, event.clientY)
      this.$emit('on-click', intersected)
    },
    pick(x, y) {
      const rect = this.$el.getBoundingClientRect()

      x -= rect.left
      y -= rect.top

      this.mouse.x = (x / this.size.width) * 2 - 1
      this.mouse.y = -(y / this.size.height) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)

      const intersects = this.raycaster.intersectObject(
        this.solutionGroup,
        true
      )

      return (intersects && intersects.length) > 0 ? intersects[0] : null
    },
    update() {
      this.updateRenderer()
      this.updateControls()
    },
    updateModel() {
      const { object } = this

      if (!object) return

      const { position } = this
      const { rotation } = this
      const { scale } = this

      object.position.set(position.x, position.y, position.z)
      object.rotation.set(rotation.x, rotation.y, rotation.z)
      object.scale.set(scale.x, scale.y, scale.z)
    },
    updateRenderer() {
      const { renderer } = this

      renderer.setSize(this.size.width, this.size.height)
      renderer.setPixelRatio(window.devicePixelRatio || 1)
      renderer.setClearColor(
        new Color(this.rendererParams.backgroundColor).getHex()
      )
      renderer.setClearAlpha(this.rendererParams.backgroundAlpha)
    },
    initCamera() {
      this.cameraManager.init(this.cameraParams)
      this.camera = this.cameraManager.getCurrentCamera()
    },
    updateCamera() {
      if (this.camera) {
        this.camera.aspect = this.size.width / this.size.height
        this.camera.updateProjectionMatrix()
      }
    },
    initLights() {
      this.lightManager.init(this.lightParams)
    },
    updateControls() {
      if (this.controllable) {
        this.controls = new OrbitControls(this.camera, this.$el)
        this.controls.rotateSpeed = 2
        this.controls.zoomSpeed = 2
        this.controls.minDistance = 2000
        this.controls.maxDistance = 25000
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.16
        this.controls.type = 'orbit'
      } else if (this.controls) {
        this.controls.dispose()
        this.controls = null
      }
    },
    initEnv() {
      this.envManager.init(this.envParams)
    },
    changeCamera() {
      const current = this.cameraParams.find(v => {
        return v.isCurrent
      })
      this.stop()
      this.cameraManager.setCurrentCamera(current.name)
      this.camera = this.cameraManager.getCurrentCamera()
      this.updateRenderer()
      this.updateCamera()
      this.updateControls()
      this.start()
    },
    animate() {
      this.reqId = window.requestAnimationFrame(this.animate)
      this.render()
    },
    start() {
      this.animate()
    },
    stop() {
      if (this.reqId !== undefined) {
        window.cancelAnimationFrame(this.reqId)
      }
    },
    render() {
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>
