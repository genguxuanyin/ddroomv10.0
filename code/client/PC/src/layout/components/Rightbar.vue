<template>
  <div class="rightbar">
    <MenuItem v-for="(menu, index) in menus" :key="index" :icon="menu.icon" :title="menu.title" class="menu-wrapper column padding-top-6" />
  </div>
</template>
<script>
import MenuItem from "@/components/menuItem/MenuItem";
export default {
  components: {
    MenuItem
  },
  data() {
    return {
      menus: [
        {
          title: "导视图",
          icon: "guidesView",
          hidden: false,
          isActive: false
        },
        {
          title: "效果图",
          icon: "render",
          hidden: false,
          isActive: false
        },
        {
          title: "快照",
          icon: "camera",
          hidden: false,
          isActive: false
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.rightbar {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  color: $right-sidebar-text-color;
  cursor: pointer;
  .menu-wrapper:hover {
    background-color: $right-sidebar-hover-bg-color;
  }
}
</style>
