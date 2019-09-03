<template>
  <div
    v-if="!item.hidden"
    class="menu-wrapper"
    :class="{ active: item.isActive}"
    @click="selectedSideMenu"
  >
    <item :icon="item.icon" :title="item.isActive && item.children && item.children.length ? '' : item.title" />
    <div v-if="item.isActive && item.children && item.children.length" class="sub-menu-wrapper">
      <item v-for="(subItem,i) in item.children" :key="i" :title="subItem.title" />
    </div>
  </div>
</template>

<script>
import Item from "./Item";
import FixiOSBug from "./FixiOSBug";

export default {
  name: "SidebarItem",
  components: { Item },
  mixins: [FixiOSBug],
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    selectedSideMenu() {
      this.$emit("selectedSideMenu", {
        index: this.index
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.menu-wrapper {
  display: flex;
  padding: 10px 0 16px 0;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  &.active {
    color: $menuActiveText;
    background-color: $sideBarActiveBg !important;
  }
  &:hover {
    background-color: $menuHover;
  }
  span {
    margin-top: 6px;
  }
  .sub-menu-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
}
</style>
