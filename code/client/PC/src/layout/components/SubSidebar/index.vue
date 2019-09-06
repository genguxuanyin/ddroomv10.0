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
  height: calc(100% - #{$footer-height});
  top: 0;
  left: $sidebar-width;
  background-color: $sub-sidebar-bg-color;
  box-shadow: $light-box-shadow;
}
</style>
