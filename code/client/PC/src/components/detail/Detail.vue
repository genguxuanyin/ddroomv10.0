<template>
  <div class="detail">
    <span class="name">{{ item.name }}</span>
    <el-image :src="item.url" :fit="fit"></el-image>
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
      fit: "fit"
    };
  }
};
</script>
<style lang="scss" scoped>
.name {
  float: left;
  font-weight: bold;
  margin-bottom: 6px;
}
</style>
