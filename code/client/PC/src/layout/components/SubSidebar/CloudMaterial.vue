<template>
  <div class="cloudMaterial">
    <div class="nav">
      <el-popover v-for="(v, i) in nav" :key="i" placement="right" width="400" trigger="hover">
        <CloudMaterialNavItem :item="v" />
        <div slot="reference">{{ v.title }}</div>
      </el-popover>
    </div>
    <div class="container">
      <div class="header">
        <el-input
          v-model="input"
          size="small"
          placeholder="请输入内容"
          prefix-icon="el-icon-search"
          clearable
        ></el-input>
      </div>
      <div class="content">
        <CloudMaterialItem v-for="l in list" :key="l.id" :item="l" />
      </div>
      <Paginations :total="total" @handleCurrentChange="handleCurrentChange" />
    </div>
  </div>
</template>
<script>
import Paginations from "@/components/paginations/Paginations";
import CloudMaterialNavItem from "./components/CloudMaterialNavItem";
import CloudMaterialItem from "./components/CloudMaterialItem";
export default {
  components: {
    CloudMaterialNavItem,
    CloudMaterialItem,
    Paginations
  },
  data() {
    return {
      input: "",
      currentPage: 2,
      nav: [
        {
          title: "门窗",
          children: [
            {
              title: "门",
              children: [
                {
                  title: "单开门"
                },
                {
                  title: "双开门"
                },
                {
                  title: "卫生间门"
                },
                {
                  title: "推拉门"
                },
                {
                  title: "防盗门"
                },
                {
                  title: "门洞"
                },
                {
                  title: "其他"
                }
              ]
            },
            {
              title: "窗",
              children: [
                {
                  title: "矩形窗"
                },
                {
                  title: "异形窗"
                },
                {
                  title: "飘窗"
                },
                {
                  title: "落地窗"
                },
                {
                  title: "天窗"
                },
                {
                  title: "转角飘窗"
                }
              ]
            }
          ]
        },
        {
          title: "硬装",
          children: [
            {
              title: "门",
              children: [
                {
                  title: "矩形窗"
                },
                {
                  title: "异形窗"
                },
                {
                  title: "飘窗"
                },
                {
                  title: "落地窗"
                },
                {
                  title: "天窗"
                },
                {
                  title: "转角飘窗"
                }
              ]
            },
            {
              title: "门",
              children: [
                {
                  title: "单开门"
                },
                {
                  title: "双开门"
                },
                {
                  title: "卫生间门"
                },
                {
                  title: "推拉门"
                },
                {
                  title: "防盗门"
                },
                {
                  title: "门洞"
                },
                {
                  title: "其他"
                }
              ]
            }
          ]
        }
      ],
      list: [
        {
          id: "1",
          url:
            "http://manager.ddroom.cn//upload/render/20190829152729/c8552f9b.jpg",
          name: "万科海上明月--扶风"
        },
        {
          id: "2",
          url:
            "http://manager.ddroom.cn//upload/render/20190828160549/e3832a7c.jpg",
          name: "星雨华府--草木"
        },
        {
          id: "3",
          url:
            "http://manager.ddroom.cn//upload/render/20190827114554/90d69d30.jpg",
          name: "天一仁和--时光"
        }
      ],
      total: 120
    };
  },
  methods: {
    handleCurrentChange({ page }) {
      // 当前页
      const sortnum = this.paginations.page_size * (page - 1);
      const table = this.list.filter((item, index) => {
        return index >= sortnum;
      });
      // 设置默认分页数据
      this.tableData = table.filter((item, index) => {
        return index < this.paginations.page_size;
      });
    },
    setPaginations() {
      // 总页数
      this.paginations.total = this.list.length;
      this.paginations.page_index = 1;
      this.paginations.page_size = 5;
      // 设置默认分页数据
      this.tableData = this.list.filter((item, index) => {
        return index < this.paginations.page_size;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
$allWidth: 300px;
$navWidth: 60px;
.cloudMaterial {
  display: flex;
  width: $allWidth;
  height: 100%;
  .nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-basis: $navWidth;
    border-right: solid 1px #e6e6e6;
    color: #000;
    span {
      display: inline-block;
      width: 100%;
      div {
        height: 40px;
        line-height: 40px;
        font-weight: bold;
        padding: 0 0 0 2px;
        font-size: 12px;
        text-align: center;
        cursor: pointer;
        &:hover {
          background-color: #ecf5ff;
        }
      }
    }
  }
  .container {
    width: $allWidth - $navWidth;
    .header {
      padding: 10px;
    }
    .content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      padding: 0 12px 0 12px;
      &:after {
        content: "";
        flex: auto;
      }
    }
  }
}
</style>
