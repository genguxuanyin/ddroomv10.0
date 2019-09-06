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
export default {
  data() {
    return {
      views: [
        {
          title: '2D',
          icon: '',
          isActive: true
        },
        {
          title: '3D',
          icon: '',
          isActive: false
        },
        {
          title: 'FV',
          icon: '',
          isActive: false
        }
      ]
    }
  },
  methods: {
    changeView(i) {
      this.views.forEach(element => {
        element.isActive = false
      })
      this.views[i]['isActive'] = true
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
        border-bottom-right-radius: 6px;
      }
      &:nth-child(1) {
        border-bottom-left-radius: 6px;
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
