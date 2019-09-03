<template>
  <div v-if="total > 0" class="pagination">
    <el-pagination
      :small="small"
      :page-size="pageSize"
      :total="total"
      :pager-count="pagerCount"
      :current-page.sync="currentPage"
      :layout="layout"
      :page-sizes="pageSizes"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    ></el-pagination>
  </div>
</template>
<script>
export default {
  props: {
    small: {
      // 样式
      type: Boolean,
      default: true
    },
    pageSize: {
      // 每页显示多少条
      type: Number,
      default: 20
    },
    total: {
      // 总的条目数
      type: Number,
      default: 200
    },
    pagerCount: {
      // 页码按钮的数量
      type: Number,
      default: 5
    },
    currentPage: {
      // 当前页
      type: Number,
      default: 1
    },
    layout: {
      // 组件布局
      type: String,
      default: "total, prev, pager, next, jumper"
    },
    pageSizes: {
      // 每页显示个数选择器的选项设置
      type: Array,
      default() {
        return [10, 20, 40];
      }
    }
  },
  methods: {
    handleCurrentChange(page) {
      this.$emit("handleCurrentChange", { page });
    },
    handleSizeChange(page_size) {
      this.$emit("handleSizeChange", { page_size });
    }
  }
};
</script>
<style lang="scss">
.el-pagination {
  white-space: normal;
  .el-pagination__total {
    display: block !important;
  }
  .el-pagination__jump {
    margin: 0;
  }
}
</style>
