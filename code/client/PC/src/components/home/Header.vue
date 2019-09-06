<template>
  <div class="header">
    <div class="left">
      <div class="logo">滴答空间</div>
      <div class="header-container">
        <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          background-color="#1d1e20"
          text-color="#fff"
          active-text-color="#409EFF"
          @select="handleSelect"
        >
          <el-menu-item index="1">3D云设计</el-menu-item>
          <el-submenu index="2">
            <template slot="title">行业解决方案</template>
            <el-menu-item index="2-1">装修公司</el-menu-item>
            <el-menu-item index="2-2">全屋定制</el-menu-item>
            <el-menu-item index="2-3">瓷砖卫浴</el-menu-item>
            <el-menu-item index="2-4">云订单</el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">产品与服务</template>
            <el-menu-item index="3-1">软件产品</el-menu-item>
            <el-menu-item index="3-2">周边产品</el-menu-item>
            <el-menu-item index="3-3">软件下载</el-menu-item>
          </el-submenu>
          <el-menu-item index="4">客户案例</el-menu-item>
          <el-menu-item index="5">服务市场</el-menu-item>
        </el-menu>
        <div class="line" />
      </div>
    </div>
    <div class="right">
      <ul>
        <li>
          <a>帮助</a>
        </li>
        <li>
          <div v-if="!avatar">
            <router-link to="/login">登录</router-link>|
            <router-link to="/register">注册</router-link>
          </div>
          <Personal v-else />
        </li>
        <li>
          <router-link to="/dashboard" class="start">开始设计</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Personal from "../personal/Personal";
export default {
  name: "Header",
  components: {
    Personal
  },
  data() {
    return {
      activeIndex: "1"
    };
  },
  computed: {
    ...mapGetters(["avatar"])
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";
.header {
  height: 70px;
  width: 100%;
  background: #1d1e20;
  color: #fff;
  display: flex;
  position: fixed;
  justify-content: space-between;
  top: 0;
  z-index: 999;
  .left {
    display: flex;
  }
  .logo {
    width: 200px;
    height: 70px;
    line-height: 70px;
    font-size: $super-text-size;
    font-weight: bolder;
    text-align: center;
  }
  .header-container {
    height: 100%;
  }
  .right {
    font-size: $middle-text-size;
    ul {
      box-sizing: border-box;
      display: flex;
      margin: 0;
      align-items: center;
      height: 70px;
      li {
        margin: 0 20px 0 0;
        list-style: none;
      }
    }
  }
}
.el-menu.el-menu--horizontal {
  border-bottom: none;
}
.start {
  background-color: #1d1e20;
  color: #fff;
  font-size: $middle-text-size;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  padding: 3px 8px;
  border: 1px solid #fff;
  cursor: pointer;
}
</style>
