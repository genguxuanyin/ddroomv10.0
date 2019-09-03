<template>
  <div class="sampleRoom">
    <div class="nav">
      <el-menu default-active="1" class="el-menu-vertical">
        <el-submenu v-for="(v, i) in nav" :key="i" :index="i + ''">
          <template slot="title">
            <span class="title">{{ v.title }}</span>
          </template>
          <el-menu-item v-for="(cv, ci) in v.children" :key="ci" :index="i+'-'+ci">{{ cv.title }}</el-menu-item>
        </el-submenu>
      </el-menu>
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
        <SampleRoomItem v-for="l in list" :key="l.id" :item="l" />
      </div>
      <Paginations :total="total" @handleCurrentChange="handleCurrentChange" />
    </div>
  </div>
</template>
<script>
import Paginations from "@/components/paginations/Paginations";
import SampleRoomItem from "./components/SampleRoomItem";
export default {
  components: {
    SampleRoomItem,
    Paginations
  },
  data() {
    return {
      input: "",
      currentPage: 2,
      nav: [
        {
          title: "空间",
          children: [
            {
              title: "不限"
            },
            {
              title: "客餐厅"
            },
            {
              title: "主卧"
            },
            {
              title: "客卧"
            },
            {
              title: "厨房"
            },
            {
              title: "儿童房"
            },
            {
              title: "书房"
            },
            {
              title: "卫生间"
            },
            {
              title: "客厅"
            }
          ]
        },
        {
          title: "风格",
          children: [
            {
              title: "不限"
            },
            {
              title: "现代"
            },
            {
              title: "北欧"
            },
            {
              title: "欧式"
            },
            {
              title: "中式"
            },
            {
              title: "美式"
            },
            {
              title: "地中海"
            },
            {
              title: "东南亚"
            },
            {
              title: "新古典"
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
      total: 180
    };
  },
  methods: {
    handleCurrentChange(page) {
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
<style lang="scss">
$allWidth: 300px;
$navWidth: 60px;
.sampleRoom {
  display: flex;
  width: $allWidth;
  height: 100%;
  .nav {
    display: flex;
    align-items: center;
    flex-basis: $navWidth;
    .el-menu-vertical {
      width: $navWidth;
      height: 100%;
      .title {
        font-weight: bold;
        padding: 0 0 0 2px;
        font-size: 12px;
      }
      .el-menu-item {
        width: $navWidth;
        min-width: $navWidth;
        height: 26px;
        line-height: 26px;
        font-size: 12px;
        padding: 0 0 0 6px !important;
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
      justify-content: center;
    }
  }
}
.sampleRoom .el-submenu__title {
  line-height: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sampleRoom .el-submenu__icon-arrow {
  display: block !important;
  position: static;
}
</style>
