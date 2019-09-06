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
import {
  Group,
  Vector2,
  Vector3,
  Color,
  Scene,
  BoxGeometry,
  Mesh,
  Raycaster,
  WebGLRenderer,
  PerspectiveCamera,
  AmbientLight,
  PointLight,
  HemisphereLight,
  DirectionalLight
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { toIndexed, getSize, getCenter } from './util'

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
      camera: new PerspectiveCamera(45, 1, 1, 100000),
      scene: new Scene(),
      renderer: null,
      controls: null,
      wrapper: new Group(),
      lightGroup: new Group(),
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
    lights() {
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
    lights: {
      deep: true,
      handler() {
        this.updateLights()
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
    this.renderer.gammaOutput = this.gammaOutput

    const mesh = new Mesh(new BoxGeometry(1000, 1000, 1000))
    this.wrapper.add(mesh)
    this.lightGroup.name = 'lightGroup'
    this.wrapper.name = 'solutionGroup'
    this.scene.add(this.lightGroup)
    this.scene.add(this.wrapper)

    this.load()
    this.update()

    this.$el.addEventListener('mousedown', this.onMouseDown, false)
    this.$el.addEventListener('mousemove', this.onMouseMove, false)
    this.$el.addEventListener('mouseup', this.onMouseUp, false)
    this.$el.addEventListener('click', this.onClick, false)

    window.addEventListener('resize', this.onResize, false)

    this.animate()
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
      // if (this.width === undefined || this.height === undefined) {
      this.$nextTick(() => {
        this.size = {
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        }
      })
      // }
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
      if (!this.object) return null

      const rect = this.$el.getBoundingClientRect()

      x -= rect.left
      y -= rect.top

      this.mouse.x = (x / this.size.width) * 2 - 1
      this.mouse.y = -(y / this.size.height) * 2 + 1

      this.raycaster.setFromCamera(this.mouse, this.camera)

      const intersects = this.raycaster.intersectObject(this.object, true)

      return (intersects && intersects.length) > 0 ? intersects[0] : null
    },
    update() {
      this.updateRenderer()
      this.updateCamera()
      this.updateLights()
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
    updateCamera() {
      const { camera } = this
      const { object } = this

      camera.aspect = this.size.width / this.size.height
      camera.updateProjectionMatrix()

      if (!this.cameraParams.lookAt && !this.cameraParams.up) {
        if (!object) return

        const distance = getSize(object).length()

        camera.position.set(
          this.cameraParams.position.x,
          this.cameraParams.position.y,
          this.cameraParams.position.z
        )
        camera.rotation.set(
          this.cameraParams.rotation.x,
          this.cameraParams.rotation.y,
          this.cameraParams.rotation.z
        )

        if (
          this.cameraParams.position.x === 0 &&
          this.cameraParams.position.y === 0 &&
          this.cameraParams.position.z === 0
        ) {
          camera.position.z = distance
        }

        camera.lookAt(new Vector3())
      } else {
        camera.position.set(
          this.cameraParams.position.x,
          this.cameraParams.position.y,
          this.cameraParams.position.z
        )
        camera.rotation.set(
          this.cameraParams.rotation.x,
          this.cameraParams.rotation.y,
          this.cameraParams.rotation.z
        )
        camera.up.set(
          this.cameraParams.up.x,
          this.cameraParams.up.y,
          this.cameraParams.up.z
        )

        camera.lookAt(
          new Vector3(
            this.cameraParams.lookAt.x,
            this.cameraParams.lookAt.y,
            this.cameraParams.lookAt.z
          )
        )
      }
    },
    updateLights() {
      this.lights.forEach(item => {
        if (!item.type) return

        const type = item.type.toLowerCase()

        let light = null

        if (type === 'ambient' || type === 'ambientlight') {
          const color =
            item.color === 0x000000 ? item.color : item.color || 0x404040
          const intensity =
            item.intensity === 0 ? item.intensity : item.intensity || 1

          light = new AmbientLight(color, intensity)
        } else if (type === 'point' || type === 'pointlight') {
          const color =
            item.color === 0x000000 ? item.color : item.color || 0xffffff
          const intensity =
            item.intensity === 0 ? item.intensity : item.intensity || 1
          const distance = item.distance || 0
          const decay = item.decay === 0 ? item.decay : item.decay || 1

          light = new PointLight(color, intensity, distance, decay)

          if (item.position) {
            light.position.copy(item.position)
          }
        } else if (type === 'directional' || type === 'directionallight') {
          const color =
            item.color === 0x000000 ? item.color : item.color || 0xffffff
          const intensity =
            item.intensity === 0 ? item.intensity : item.intensity || 1

          light = new DirectionalLight(color, intensity)

          if (item.position) {
            light.position.copy(item.position)
          }

          if (item.target) {
            light.target.copy(item.target)
          }
        } else if (type === 'hemisphere' || type === 'hemispherelight') {
          const skyColor =
            item.skyColor === 0x000000
              ? item.skyColor
              : item.skyColor || 0xffffff
          const groundColor =
            item.groundColor === 0x000000
              ? item.groundColor
              : item.groundColor || 0xffffff
          const intensity =
            item.intensity === 0 ? item.intensity : item.intensity || 1

          light = new HemisphereLight(skyColor, groundColor, intensity)

          if (item.position) {
            light.position.copy(item.position)
          }
        }

        this.lightGroup.add(light)
      })
    },
    updateControls() {
      if (this.controllable && this.controls) return

      if (this.controllable) {
        if (this.controls) return

        this.controls = new OrbitControls(this.camera, this.$el)
        // this.controls.enableDamping = true
        this.controls.type = 'orbit'
      } else if (this.controls) {
        this.controls.dispose()
        this.controls = null
      }
    },
    updateEnv() {},
    process(object) {
      if (this.smoothing) {
        object.traverse(child => {
          if (child.geometry) {
            child.geometry = toIndexed(child.geometry)
            child.geometry.computeVertexNormals()
          }
        })
      }
    },
    load() {
      if (!this.src) return

      if (this.object) {
        this.wrapper.remove(this.object)
      }

      const onLoad = object => {
        if (this.process) {
          this.process(object)
        }
        this.addObject(object)

        this.$emit('on-load')
      }

      const onProgress = xhr => {
        this.$emit('on-progress', xhr)
      }

      const onError = err => {
        this.$emit('on-error', err)
      }

      if (this.mtl) {
        let { mtlPath } = this
        let mtlSrc = this.mtl

        if (!this.mtlPath) {
          const result = /^(.*\/)([^/]*)$/.exec(this.mtl)

          if (result) {
            mtlPath = result[1]
            mtlSrc = result[2]
          }
        }

        if (mtlPath) {
          this.mtlLoader.setPath(mtlPath)
        }

        this.mtlLoader.load(
          mtlSrc,
          materials => {
            materials.preload()

            this.loader
              .setMaterials(materials)
              .load(this.src, onLoad, onProgress, onError)
          },
          () => {},
          onError
        )
      } else {
        this.loader.load(this.src, onLoad, onProgress, onError)
      }
    },
    getObject(object) {
      return object
    },
    addObject(object) {
      // const center = getCenter(object)
      const center = new Vector3()

      // correction position
      this.wrapper.position.copy(center.negate())

      this.object = object
      this.wrapper.add(object)

      this.updateCamera()
      this.updateModel()
    },
    animate() {
      this.reqId = requestAnimationFrame(this.animate)
      this.render()
    },
    render() {
      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>
