<template>
  <div class="main">
    <div class="banner">
      <img src="../../assets/img/main.jpg" alt />
    </div>
  </div>
</template>

<script>
export default {
  name: "Main"
};
</script>

<style lang="scss" scoped>
.main {
  position: relative;
  top: 70px;
  .banner {
    width: 100%;
    font-size: 0;
    img {
      width: 100%;
    }
  }
}
</style>
