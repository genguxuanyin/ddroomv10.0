<template>
  <div class="rightbar">
    <sidebar-item
      v-for="(menu, index) in menus"
      :key="index"
      :item="menu"
      :index="index"
      @selectedSideMenu="selectedSideMenu"
    />
  </div>
</template>
<script>
import SidebarItem from "./Sidebar/SidebarItem";
export default {
  components: {
    SidebarItem
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
  },
  methods: {
    selectedSideMenu() {}
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
  color: $subSidebarMenuText;
  .menu-wrapper:hover{
    background-color: $subSidebarMenuHover;
  }
}
</style>
