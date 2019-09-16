<template>
  <div class="dashboard-container">
    <Three @on-click="clickFun" />
    <!-- <Two /> -->
    <Welcome />
  </div>
</template>

<script>
import Three from '../../components/three/Base'
// import Two from '../../components/two/Base'
import Welcome from '@/components/welcome/Welcome'
import { mapGetters } from 'vuex'
export default {
  name: 'Dashboard',
  components: {
    Three,
    // Two,
    Welcome
  },
  computed: {
    ...mapGetters(['name'])
  },
  methods: {
    clickFun(v) {
      console.log(v)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
}
</style>
