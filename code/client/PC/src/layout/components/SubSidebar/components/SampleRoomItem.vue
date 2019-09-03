<template>
  <div class="sampleRoomItem">
    <el-image :src="item.url" :fit="fit"></el-image>
    <div class="mask">
      <el-button type="primary" size="small">打开</el-button>
      <span class="name">{{ item.name }}</span>
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
      fit: "fill"
    };
  }
};
</script>
<style lang="scss">
.sampleRoomItem {
  position: relative;
  width: 90%;
  height: 121px;
  margin: 10px 0 10px 0;
  &:hover {
    .mask {
      display: flex;
    }
  }
  .mask {
    display: none;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    .name {
      padding: 10px;
      font-size: 12px;
    }
  }
}
</style>
