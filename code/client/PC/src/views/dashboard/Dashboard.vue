<template>
  <div class="dashboard-container">
    <Three />
    <!-- <Two /> -->
    <Welcome />
    <Size />
  </div>
</template>

<script>
import Three from '../../components/three/Base'
// import Two from '../../components/two/Base'
import Welcome from '@/components/welcome/Welcome'
import Size from '../../components/size/Size'
import { mapGetters } from 'vuex'
export default {
  name: 'Dashboard',
  components: {
    Three,
    // Two,
    Welcome,
    Size
  },
  computed: {
    ...mapGetters(['name'])
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
