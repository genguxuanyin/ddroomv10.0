<template>
  <div class="sidebar">
    <sidebar-item
      v-for="(menu, index) in menus"
      :key="index"
      :item="menu"
      :index="index"
      @selectedSideMenu="$emit('selectedSideMenu',{ index })"
    />
  </div>
</template>

<script>
import SidebarItem from "./SidebarItem";

export default {
  components: { SidebarItem },
  props: {
    menus: {
      type: Array,
      default() {
        return [];
      }
    }
  }
};
</script>
