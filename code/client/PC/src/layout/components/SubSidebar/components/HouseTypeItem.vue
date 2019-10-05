<template>
  <div class="houseTypeItem">
    <span class="title">{{ item.title }}</span>
    <div v-if="Array.isArray(item.children) && item.children.length" class="container">
      <MenuItem
        v-for="(cItem, ci) in item.children"
        :key="ci"
        class="item column big padding-top-6"
        :class="{'active':item.hasState && cItem.isActive}"
        :icon="cItem.icon"
        :title="cItem.title"
        @click="change({i:index,ci})"
      />
    </div>
  </div>
</template>
<script>
import TYPES from '@/components/three/types'
import MenuItem from '@/components/menuItem/MenuItem'
export default {
  components: {
    MenuItem
  },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    },
    index: {
      type: Number,
      default: 0
    }
  },
  methods: {
    change(payload) {
      this.$store.dispatch('menu/subSideHouseTypeListsChange', payload)
      /* event.dispatchEvent({
        type: TYPES['menu-click'],
        message: {
          data: this.views[i],
          type: 'view'
        }
      }) */
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/styles/variables.scss';
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
      &.active {
        border: 1px solid $sub-sidebar-active-bg-color;
        background-color: #ffffff !important;
        box-shadow: $base-box-shadow;
      }
      &:hover {
        background-color: $sub-sidebar-hover-bg-color;
      }
    }
  }
}
</style>
