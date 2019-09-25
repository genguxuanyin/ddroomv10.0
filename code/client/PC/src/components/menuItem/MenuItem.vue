<template>
  <div class="menuItem" @click="$emit('click')">
    <Item :icon="icon" :title="title" />
  </div>
</template>
<script>
import Item from './Item'
export default {
  name: 'MenuItem',
  components: {
    Item
  },
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/styles/variables.scss';
.menuItem {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &.column {
    flex-direction: column;
  }
  &.big {
    .svg-icon {
      width: 2em;
      height: 2em;
    }
  }
  &.super-big {
    .svg-icon {
      width: 3em;
      height: 3em;
    }
  }
  &.padding-top-6 {
    span {
      padding-top: 6px;
    }
  }
}
</style>
