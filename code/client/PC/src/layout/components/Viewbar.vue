<template>
  <div class="viewbar">
    <ul>
      <li
        v-for="(v,i) in views"
        :key="i"
        :class="{isActive:v.isActive}"
        @click="changeView(i)"
      >{{ v.title }}</li>
    </ul>
  </div>
</template>
<script>
import ee from '../../utils/event'
import TYPES from '@/components/three/types'
export default {
  data() {
    return {
      views: [
        {
          title: '2D',
          name: '2d',
          icon: '',
          isActive: false
        },
        {
          title: '3D',
          name: '3d',
          icon: '',
          isActive: true
        },
        {
          title: 'FV',
          name: 'fv',
          icon: '',
          isActive: false
        }
      ]
    }
  },
  methods: {
    changeView(i) {
      if (this.views[i]['isActive']) return
      this.views.forEach(element => {
        element.isActive = false
      })
      this.views[i]['isActive'] = true
      ee.emit(TYPES['menu-change-view'], { data: this.views[i] })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.viewbar {
  position: absolute;
  width: $viewbar-width;
  right: $viewbar-width;
  height: $header-height;
  top: $header-height;
  border-bottom-left-radius: $base-border-radius;
  border-bottom-right-radius: $base-border-radius;
  box-shadow: $light-box-shadow;
  background-color: $view-bg-color;
  ul {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    color: black;
    li {
      height: 100%;
      width: 30%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-grow: 1;
      &:nth-last-child(1) {
        border-bottom-right-radius: $base-border-radius;
      }
      &:nth-child(1) {
        border-bottom-left-radius: $base-border-radius;
      }
      &.isActive {
        background-color: $view-active-color !important;
      }
      &:hover {
        background-color: $view-hover-bg-color;
      }
    }
  }
}
</style>
