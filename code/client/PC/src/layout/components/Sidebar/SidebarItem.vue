<template>
  <div
    v-if="!item.hidden"
    class="menu-wrapper"
    :class="{ active: item.isActive}"
    @click="selectedSideMenu"
  >
    <MenuItem
      :icon="item.icon"
      :title="item.isActive && item.children && item.children.length ? '' : item.title"
      class="big padding-top-6 column"
    />
    <div v-if="item.isActive && item.children && item.children.length" class="sub-menu-wrapper">
      <MenuItem v-for="(subItem,i) in item.children" :key="i" :title="subItem.title" class="padding-top-6" />
    </div>
  </div>
</template>

<script>
import MenuItem from "@/components/menuItem/MenuItem";
import FixiOSBug from "./FixiOSBug";

export default {
  name: "SidebarItem",
  components: { MenuItem },
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
  font-size: $small-text-size;
  &.active {
    color: $sidebar-active-color;
    background-color: $sidebar-active-bg-color !important;
  }
  &:hover {
    background-color: $sidebar-hover-bg-color;
  }
  .sub-menu-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }
}
</style>
