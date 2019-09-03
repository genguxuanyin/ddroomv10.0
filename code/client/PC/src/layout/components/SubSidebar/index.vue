<template>
  <div class="subSidebar">
    <transition name="el-fade-in-linear" mode="out-in">
      <component :is="menu.subSidebarComponent"></component>
    </transition>
  </div>
</template>
<script>
import HouseType from "./HouseType";
import SampleRoom from "./SampleRoom";
import CloudMaterial from "./CloudMaterial";
import CustomMade from "./CustomMade";
import My from "./My";
export default {
  components: {
    HouseType,
    SampleRoom,
    CloudMaterial,
    CustomMade,
    My
  },
  props: {
    menu: {
      type: Object,
      default() {
        return {};
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "~@/styles/variables.scss";
.subSidebar {
  position: absolute;
  height: calc(100% - #{$footerHeight});
  top: 0;
  left: $sideBarWidth;
  background-color: $subSidebarMenuBg;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
