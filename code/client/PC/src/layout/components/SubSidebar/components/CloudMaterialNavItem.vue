<template>
  <div v-if="item.children && item.children.length>0" class="cloudMaterialNavItem">
    <ul v-for="(v, i) in item.children" :key="i">
      <li class="title">{{ v.title }}</li>
      <li v-for="(cv, ci) in v.children" :key="ci">{{ cv.title }}</li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  }
};
</script>
<style lang="scss">
.cloudMaterialNavItem {
  ul {
    border-bottom: solid 1px #e6e6e6;
    li {
      display: inline-block;
      padding: 6px 4px 6px 4px;
      font-size: 12px;
      cursor: pointer;
      &.title {
        font-weight: bold;
      }
      &:hover {
        background-color: #ecf5ff;
      }
    }
  }
}
</style>
