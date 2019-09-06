<template>
  <div class="houseTypeItem">
    <span class="title">{{ item.title }}</span>
    <div v-if="Array.isArray(item.children) && item.children.length" class="container">
      <MenuItem
        v-for="(cItem, index) in item.children"
        :key="index"
        class="item column big padding-top-6"
        :icon="cItem.icon"
        :title="cItem.title"
      />
    </div>
  </div>
</template>
<script>
import MenuItem from "@/components/menuItem/MenuItem";
export default {
  components: {
    MenuItem
  },
  props: {
    item: {
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
.houseTypeItem {
  display: flex;
  flex-direction: column;
  color: $sub-sidebar-text-color;
  > .title {
    font-size: $middle-text-size;
    font-weight: bolder;
    line-height: 50px;
    height: 50px;
    padding: 0 0 0 10px;
  }
  .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: space-between;
    .item {
      width: 33%;
      height: 60px;
      cursor: pointer;
      &:hover {
        background-color: $sub-sidebar-hover-bg-color;
      }
    }
  }
}
</style>
