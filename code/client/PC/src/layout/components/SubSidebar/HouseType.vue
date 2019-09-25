<template>
  <div class="houseType">
    <HouseTypeItem
      v-for="(item, index) in lists"
      :key="index"
      :index="index"
      :item="item"
      @click="onClick"
    />
  </div>
</template>
<script>
import HouseTypeItem from './components/HouseTypeItem'
export default {
  components: {
    HouseTypeItem
  },
  data() {
    return {
      lists: [
        {
          title: '自由绘制',
          children: [
            {
              icon: 'my',
              title: '画墙',
              isActive: true
            },
            {
              icon: 'my',
              title: '矩形画墙',
              isActive: false
            },
            {
              icon: 'my',
              title: '自由建模',
              isActive: false
            }
          ]
        },
        {
          title: '从形状绘制',
          children: [
            {
              icon: 'my'
            },
            {
              icon: 'my'
            },
            {
              icon: 'my'
            },
            {
              icon: 'my'
            },
            {
              icon: 'my'
            },
            {
              icon: 'my'
            }
          ]
        },
        {
          title: '结构部件',
          children: [
            {
              icon: 'my',
              title: '柱子'
            },
            {
              icon: 'my',
              title: '地台'
            },
            {
              icon: 'my',
              title: '横梁'
            }
          ]
        },
        {
          title: '门窗',
          children: [
            {
              icon: 'my',
              title: '单开门'
            },
            {
              icon: 'my',
              title: '双开门'
            },
            {
              icon: 'my',
              title: '推拉门'
            },
            {
              icon: 'my',
              title: '矩形窗'
            },
            {
              icon: 'my',
              title: '落地窗'
            },
            {
              icon: 'my',
              title: '飘窗'
            }
          ]
        }
      ]
    }
  },
  methods: {
    onClick({ i, ci }) {
      if (this.lists[i].children[ci]['isActive']) return
      this.lists[i].children.forEach(element => {
        element.isActive = false
      })
      this.lists[i].children[ci]['isActive'] = true
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
