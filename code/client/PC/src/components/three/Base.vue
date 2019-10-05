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
        <br />'
      </slot>
    </div>
  </div>
</template>

<script>
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
      designer: designer,
      suportWebGL
    }
  },
  mounted() {
    this.designer.init()
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
