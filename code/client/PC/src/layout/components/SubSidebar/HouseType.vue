<template>
  <div class="houseType">
    <HouseTypeItem v-for="(item, index) in lists" :key="index" :index="index" :item="item" />
  </div>
</template>
<script>
import HouseTypeItem from './components/HouseTypeItem'
export default {
  components: {
    HouseTypeItem
  },
  computed: {
    lists() {
      return this.$store.getters.subSideHouseType
    }
  }
}
</script>
<style lang="scss" scoped>
.houseType {
  height: 100%;
  width: 200px;
  padding: 8px;
}
</style>
