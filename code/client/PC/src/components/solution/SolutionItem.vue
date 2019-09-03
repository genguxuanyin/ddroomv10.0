<template>
  <div class="cloudMaterialItem">
    <el-image :src="item.url" :fit="fit"></el-image>
    <div class="mask">
      <div class="name">{{ item.name }}</div>
      <div class="time">{{ item.time }}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fit: "cover"
    };
  }
};
</script>
<style lang="scss">
@import "~@/styles/variables.scss";
.cloudMaterialItem {
  position: relative;
  width: 160px;
  height: 100px;
  margin: 6px 0 6px 0;
  cursor: pointer;
  line-height: 20px;
  &:hover {
    .mask {
      display: flex;
    }
  }
  .mask {
    display: none;
    position: absolute;
    width: 164px;
    height: 104px;
    top: -2px;
    left: -2px;
    flex-direction: column;
    justify-content: flex-end;
    background-color: rgba(0, 0, 0, 0.2);
    border: 2px solid $menuActiveText;
    font-size: 10px;
    color: #fff;
  }
}
</style>
