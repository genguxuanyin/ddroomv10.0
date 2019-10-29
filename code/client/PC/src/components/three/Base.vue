<template>
  <div style="width: 100%; height: 100%; margin: 0; border: 0; padding: 0;">
    <div v-if="suportWebGL" id="three-view-container"></div>
    <div v-else>
      <slot>
        Your browser does not seem to support
        <a
          href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation"
          style="color:#000"
        >WebGL</a>.
        <br>'
      </slot>
    </div>
  </div>
</template>

<script>
import TYPES from './types'
import designer from './Designer'
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

export default {
  data() {
    return {
      designer,
      suportWebGL
    }
  },
  mounted() {
    this.designer.init()
    this.designer.event.addEventListener(TYPES['menu-change'], ev => {
      var { command, param } = ev
      if (!Array.isArray(command)) {
        command = [command]
      }
      if (!Array.isArray(param)) {
        param = [param]
      }
      command.forEach((c, i) => {
        this[c] && this[c](param[i] ? param[i] : param[0])
        this.$store.dispatch(c, param[i] ? param[i] : param[0])
      })
    })
  },
  beforeDestroy() {
    this.designer.scene3d.stop()
  }
}
</script>
<style>
#three-view-container {
  width: 100%;
  height: 100%;
}
</style>
