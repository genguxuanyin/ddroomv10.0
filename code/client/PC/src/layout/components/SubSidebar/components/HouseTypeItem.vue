<template>
  <div class="houseTypeItem">
    <span class="title">{{ item.title }}</span>
    <div v-if="Array.isArray(item.children) && item.children.length" class="container">
      <div v-for="(cItem,index) in item.children" :key="index" class="item">
        <svg-icon :icon-class="cItem.iconClass" />
        <span v-if="cItem.title" class="title">{{ cItem.title }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
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
  color: $subSidebarMenuText;
  > .title {
    font-size: 14px;
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
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      &:hover {
        background-color: $subSidebarMenuHover;
      }
      .title {
        font-size: 12px;
        padding: 10px 0 0 0;
      }
    }
  }
}
</style>
