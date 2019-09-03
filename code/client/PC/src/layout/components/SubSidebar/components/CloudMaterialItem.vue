<template>
  <div class="cloudMaterialItem">
    <el-image :src="item.url" :fit="fit"></el-image>
    <div class="mask">
      <el-tooltip class="item" effect="dark" content="收藏" placement="right">
        <svg-icon icon-class="collect"></svg-icon>
      </el-tooltip>
      <el-popover placement="right" width="300" trigger="hover">
        <DetailInfo :item="item" />
        <svg-icon slot="reference" icon-class="info"></svg-icon>
      </el-popover>
    </div>
  </div>
</template>
<script>
import DetailInfo from "./CMI-DetailInfo";
export default {
  components: {
    DetailInfo
  },
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
  width: 102px;
  height: 102px;
  margin: 6px 0 6px 0;
  .el-image {
    width: 100%;
    height: 100%;
  }
  &:hover {
    .mask {
      display: flex;
    }
  }
  .mask {
    display: none;
    position: absolute;
    width: 106px;
    height: 106px;
    top: -2px;
    left: -2px;
    justify-content: space-between;
    background-color: rgba(0, 0, 0, 0.2);
    border: 2px solid $menuActiveText;
  }
}
</style>
