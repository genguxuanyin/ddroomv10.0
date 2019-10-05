<template>
  <div class="rightbar">
    <MenuItem
      v-for="(menu, index) in menus"
      :key="index"
      :icon="menu.icon"
      :title="menu.title"
      class="menu-wrapper column padding-top-6"
      @click="change({i:index})"
    />
  </div>
</template>
<script>
import MenuItem from '@/components/menuItem/MenuItem'
export default {
  components: {
    MenuItem
  },
  computed: {
    menus() {
      return this.$store.getters.rightBar
    }
  },
  methods: {
    change(payload) {
      this.$store.dispatch('menu/rightBarChange', payload)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.rightbar {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  color: $right-sidebar-text-color;
  cursor: pointer;
  .menu-wrapper:hover {
    background-color: $right-sidebar-hover-bg-color;
    &:nth-last-child(1) {
      border-bottom-left-radius: $base-border-radius;
    }
    &:nth-child(1) {
      border-top-left-radius: $base-border-radius;
    }
  }
}
</style>
