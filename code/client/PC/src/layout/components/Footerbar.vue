<template>
  <div class="footerbar">
    <ul class="left">
      <li>套内面积：{{ area | areaFormat }}</li>
      <li>技术提供：{{ company }}</li>
      <li>Version：{{ version }}</li>
    </ul>
    <ul class="right">
      <li>
        <a>质量优先</a>
      </li>
      <li>
        <a>显示材质</a>
      </li>
      <li>
        <a>教程</a>
      </li>
      <li>
        <a>客服</a>
      </li>
      <li>
        <a>反馈</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  filters: {
    areaFormat(area) {
      return area + "㎡";
    }
  },
  data() {
    return {
      area: 100,
      company: "云南智巢科技有限责任公司",
      version: "10.0"
    };
  }
};
</script>

<style lang="scss" scoped>
.footerbar {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  ul {
    display: flex;
    li {
      padding: 0 6px 0 6px;
    }
  }
}
</style>
