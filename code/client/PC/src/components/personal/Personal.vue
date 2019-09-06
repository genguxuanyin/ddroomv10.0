<template>
  <div class="personal">
    <el-dropdown class="avatar-container" trigger="hover" size="mini" @command="handleCommand">
      <div class="avatar-wrapper">
        <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar" />
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        <el-dropdown-item command="a">
          <span class="name">登录账号：{{ name }}</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="b">商家中心</el-dropdown-item>
        <el-dropdown-item command="c">服务中心</el-dropdown-item>
        <el-dropdown-item command="d">账号设置</el-dropdown-item>
        <el-dropdown-item divided>
          <span style="display:block;" @click="logout">退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    ...mapGetters(["avatar", "name"])
  },
  methods: {
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    handleCommand(command) {
      this.$message("click on item " + command);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.personal {
  float: right;
  height: 100%;
  display: flex;
  align-content: center;
  &:focus {
    outline: none;
  }

  .personal-item {
    display: inline-block;
    padding: 0 8px;
    height: 100%;
    font-size: $bigger-text-size;
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
    display: flex;
    align-items: center;
    .avatar-wrapper {
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
        font-size: $small-text-size;
      }
    }
  }
}
</style>
