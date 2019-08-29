<template>
  <div class="header">
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
          <div class="right-menu" v-else>
            <el-dropdown class="avatar-container" trigger="click">
              <div class="avatar-wrapper">
                <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar" />
                <i class="el-icon-caret-bottom" />
              </div>
              <el-dropdown-menu slot="dropdown" class="user-dropdown">
                <router-link to="/">
                  <el-dropdown-item>Home</el-dropdown-item>
                </router-link>
                <a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">
                  <el-dropdown-item>Github</el-dropdown-item>
                </a>
                <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
                  <el-dropdown-item>Docs</el-dropdown-item>
                </a>
                <el-dropdown-item divided>
                  <span style="display:block;" @click="logout">Log Out</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
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
export default {
  name: "Header",
  data() {
    return {
      activeIndex: "1"
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    }
  },
  computed: {
    ...mapGetters(["avatar"])
  }
};
</script>

<style lang="scss" scoped>
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
  .logo {
    width: 200px;
    height: 70px;
    line-height: 70px;
    font-size: 30px;
    font-weight: bolder;
    text-align: center;
  }
  .header-container {
    height: 100%;
  }
  .right {
    font-size: 14px;
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
  font-size: 14px;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  padding: 3px 8px;
  border: 1px solid #fff;
  cursor: pointer;
}
.right-menu {
  float: right;
  height: 100%;
  line-height: 50px;

  &:focus {
    outline: none;
  }

  .right-menu-item {
    display: inline-block;
    padding: 0 8px;
    height: 100%;
    font-size: 18px;
    color: #5a5e66;
    vertical-align: text-bottom;

    &.hover-effect {
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }
  }

  .avatar-container {
    margin-right: 30px;

    .avatar-wrapper {
      margin-top: 15px;
      position: relative;

      .user-avatar {
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }

      .el-icon-caret-bottom {
        cursor: pointer;
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}
</style>
