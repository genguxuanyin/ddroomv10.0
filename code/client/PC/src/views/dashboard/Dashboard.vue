<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
    <Welcome />
  </div>
</template>

<script>
import Welcome from "@/components/welcome/Welcome";
import { mapGetters } from "vuex";
export default {
  name: "Dashboard",
  components: {
    Welcome
  },
  computed: {
    ...mapGetters(["name"])
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
