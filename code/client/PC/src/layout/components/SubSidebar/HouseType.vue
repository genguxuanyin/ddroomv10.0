<template>
  <div class="houseType">
    <HouseTypeItem v-for="(item, index) in lists" :key="index" :item="item" />
  </div>
</template>
<script>
import HouseTypeItem from "./components/HouseTypeItem";
export default {
  components: {
    HouseTypeItem
  },
  data() {
    return {
      lists: [
        {
          title: "自由绘制",
          children: [
            {
              iconClass: "my",
              title: "画墙"
            },
            {
              iconClass: "my",
              title: "矩形画墙"
            },
            {
              iconClass: "my",
              title: "自由建模"
            }
          ]
        },
        {
          title: "从形状绘制",
          children: [
            {
              iconClass: "my"
            },
            {
              iconClass: "my"
            },
            {
              iconClass: "my"
            },
            {
              iconClass: "my"
            },
            {
              iconClass: "my"
            },
            {
              iconClass: "my"
            }
          ]
        },
        {
          title: "结构部件",
          children: [
            {
              iconClass: "my",
              title: "柱子"
            },
            {
              iconClass: "my",
              title: "地台"
            },
            {
              iconClass: "my",
              title: "横梁"
            }
          ]
        },
        {
          title: "门窗",
          children: [
            {
              iconClass: "my",
              title: "单开门"
            },
            {
              iconClass: "my",
              title: "双开门"
            },
            {
              iconClass: "my",
              title: "推拉门"
            },
            {
              iconClass: "my",
              title: "矩形窗"
            },
            {
              iconClass: "my",
              title: "落地窗"
            },
            {
              iconClass: "my",
              title: "飘窗"
            }
          ]
        }
      ]
    };
  }
};
</script>
<style lang="scss" scoped>
.houseType {
  height: 100%;
  width: 200px;
}
</style>
