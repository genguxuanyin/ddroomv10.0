<template>
  <div class="navbar">
    <Logo v-if="showLogo" />
    <div class="right">
      <div class="right-menu">
        <ul>
          <li>
            <a>调查问卷</a>
          </li>
          <li>
            <a>返回旧版</a>
          </li>
          <li>
            <svg-icon icon-class="undo" />
          </li>
          <li>
            <svg-icon icon-class="redo" />
          </li>
          <li>
            <el-dropdown size="mini" placement="top" :hide-timeout="250" @command="handleCommand">
              <span class="el-dropdown-link">
                <svg-icon icon-class="file" />
                文件
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="a">新建</el-dropdown-item>
                <el-dropdown-item command="b">从户型库新建</el-dropdown-item>
                <el-dropdown-item command="c">打开本地</el-dropdown-item>
                <el-dropdown-item command="d" divided>上传临摹图</el-dropdown-item>
                <el-dropdown-item command="e">上传CAD户型图</el-dropdown-item>
                <el-dropdown-item command="f" divided>我的方案</el-dropdown-item>
                <el-dropdown-item command="g">本地备份记录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <li>
            <el-dropdown size="mini" placement="top" :hide-timeout="250" @command="handleCommand">
              <span class="el-dropdown-link">
                <svg-icon icon-class="save" />
                保存
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="h">保存</el-dropdown-item>
                <el-dropdown-item command="i">保存为</el-dropdown-item>
                <el-dropdown-item command="j">保存到本地</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <li>
            <el-dropdown
              size="mini"
              placement="top"
              :hide-timeout="250"
              :hide-on-click="false"
              @command="handleCommand"
            >
              <span class="el-dropdown-link">
                <svg-icon icon-class="show" />
                显示
              </span>
              <el-dropdown-menu slot="dropdown" class="showAndHide">
                <el-dropdown-item command="k">管理显示对象</el-dropdown-item>
                <el-dropdown-item command="l" divided>
                  <el-checkbox v-model="checked">家具/饰品</el-checkbox>
                </el-dropdown-item>
                <el-dropdown-item command="m">
                  <el-checkbox v-model="checked">吊顶层</el-checkbox>
                </el-dropdown-item>
                <el-dropdown-item command="n">
                  <el-checkbox v-model="checked">门窗</el-checkbox>
                </el-dropdown-item>
                <el-dropdown-item command="o">
                  <el-checkbox v-model="checked">顶角线</el-checkbox>
                </el-dropdown-item>
                <el-dropdown-item command="p">
                  <el-checkbox v-model="checked">地角线</el-checkbox>
                </el-dropdown-item>
                <el-dropdown-item command="q">
                  <el-checkbox v-model="checked">地台横梁柱子</el-checkbox>
                </el-dropdown-item>
                <el-dropdown-item command="r">
                  <el-checkbox v-model="checked">橱衣柜</el-checkbox>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <li>
            <el-dropdown size="mini" placement="top" :hide-timeout="250" @command="handleCommand">
              <span class="el-dropdown-link">
                <svg-icon icon-class="tool" />
                工具
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="s">测距量尺</el-dropdown-item>
                <el-dropdown-item command="t">全屏</el-dropdown-item>
                <el-dropdown-item command="u">设置</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <li>
            <el-dropdown size="mini" placement="top" :hide-timeout="250" @command="handleCommand">
              <span class="el-dropdown-link">
                <svg-icon icon-class="draw" />
                图纸
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="v">导出CAD</el-dropdown-item>
                <el-dropdown-item command="w" divided>平面图</el-dropdown-item>
                <el-dropdown-item command="x">毛坯图</el-dropdown-item>
                <el-dropdown-item command="y">CAD施工图</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <li>
            <el-dropdown size="mini" placement="top" :hide-timeout="250" @command="handleCommand">
              <span class="el-dropdown-link">
                <svg-icon icon-class="list" />
                清单
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="z">定制报价</el-dropdown-item>
                <el-dropdown-item command="0">全屋报价</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <li>
            <svg-icon icon-class="help" />
            <a>帮助</a>
          </li>
        </ul>
      </div>
      <Personal />
    </div>
  </div>
</template>

<script>
import Logo from "./Sidebar/Logo";
import Personal from "../../components/personal/Personal";

export default {
  components: {
    Logo,
    Personal
  },
  data() {
    return {
      checked: false
    };
  },
  computed: {
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    }
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
.navbar {
  height: $headerHeight;
  overflow: hidden;
  position: relative;
  background: $menuBg;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  .right {
    display: flex;
    align-items: center;
    height: $headerHeight;
    .right-menu {
      height: 100%;
      ul {
        display: flex;
        height: 100%;
        li {
          height: 100%;
          list-style: none;
          color: #fff;
          padding: 0 6px 0 6px;
          margin: 0 6px 0 6px;
          display: flex;
          align-items: center;
          cursor: pointer;
          &:hover {
            background-color: $menuActiveText;
          }
          .el-dropdown {
            height: 100%;
            width: 100%;
            display: flex;
          }
          .el-dropdown-link {
            color: #fff;
            display: flex;
            align-items: center;
            height: 100%;
            width: 100%;
          }
          .svg-icon {
            width: 1.4em !important;
            height: 1.4em !important;
            margin-right: 4px;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.showAndHide {
  .el-checkbox__label {
    font-size: 12px;
  }
}
</style>
