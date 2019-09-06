<template>
  <div class="dashboard-container">
    <Base />
    <Welcome />
  </div>
</template>

<script>
import Base from '../../components/three/Base'
import Welcome from '@/components/welcome/Welcome'
import { mapGetters } from 'vuex'
export default {
  name: 'Dashboard',
  components: {
    Base,
    Welcome
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
