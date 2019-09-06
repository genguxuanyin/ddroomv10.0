<template>
  <div class="navbar">
    <Logo v-if="showLogo" />
    <div class="right">
      <div class="right-menu">
        <ul>
          <li v-for="(item,index) in menus" :key="index">
            <template v-if="!item.hidden">
              <el-dropdown
                v-if="item.dropdown && item.dropdown.length > 0"
                :size="dropdownSetting.size"
                :placement="dropdownSetting.placement"
                :hide-timeout="dropdownSetting.hideTimeout"
                :show-timeout="dropdownSetting.showTimeout"
                :hide-on-click="item.hideOnClick === undefined ? true : item.hideOnClick"
                @command="handleCommand"
              >
                <span class="el-dropdown-link">
                  <MenuItem :icon="item.icon" :title="item.title" />
                </span>
                <el-dropdown-menu
                  slot="dropdown"
                  :class="{showAndHide:item.dropdown && item.dropdown.length > 0}"
                >
                  <el-dropdown-item
                    v-for="(cItem,cIndex) in item.dropdown"
                    :key="cIndex"
                    :command="cItem.command"
                    :divided="cItem.divided || false"
                  >
                    <template v-if="!cItem.hidden">
                      <el-checkbox v-if="cItem.isCheckbox" v-model="cItem.checked">{{ cItem.title }}</el-checkbox>
                      <span v-else>{{ cItem.title }}</span>
                    </template>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <MenuItem v-else :icon="item.icon" :title="item.title" />
            </template>
          </li>
        </ul>
      </div>
      <Personal />
    </div>
  </div>
</template>

<script>
import MenuItem from "@/components/menuItem/MenuItem";
import Personal from "@/components/personal/Personal";
import Logo from "./Logo";

export default {
  components: {
    MenuItem,
    Logo,
    Personal
  },
  data() {
    return {
      checked: false,
      dropdownSetting: {
        size: "mini",
        placement: "top",
        hideTimeout: 250,
        showTimeout: 100
      },
      menus: [
        {
          title: "调查问卷",
          hidden: false
        },
        {
          title: "返回旧版"
        },
        {
          icon: "undo"
        },
        {
          icon: "redo"
        },
        {
          title: "文件",
          icon: "file",
          dropdown: [
            {
              title: "新建",
              command: "a",
              divided: false
            },
            {
              title: "从户型库新建",
              command: "b",
              divided: false
            },
            {
              title: "打开本地",
              command: "c",
              divided: false
            },
            {
              title: "上传临摹图",
              command: "d",
              divided: true,
              hidden: false
            },
            {
              title: "上传CAD户型图",
              command: "e",
              divided: false
            },
            {
              title: "我的方案",
              command: "f",
              divided: true
            },
            {
              title: "本地备份记录",
              command: "g",
              divided: false
            }
          ]
        },
        {
          title: "保存",
          icon: "save",
          dropdown: [
            {
              title: "保存",
              command: "h",
              divided: false
            },
            {
              title: "保存为",
              command: "i",
              divided: false
            },
            {
              title: "保存到本地",
              command: "j",
              divided: false
            }
          ]
        },
        {
          title: "显示",
          icon: "show",
          hideOnClick: false,
          dropdown: [
            {
              title: "管理显示对象",
              divided: false
            },
            {
              title: "吊顶层",
              command: "k",
              isCheckbox: true,
              isCheck: false,
              divided: true
            },
            {
              title: "门窗",
              command: "l",
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: "顶角线",
              command: "m",
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: "地角线",
              command: "n",
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: "地台横梁柱子",
              command: "o",
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: "橱衣柜",
              command: "p",
              isCheckbox: true,
              isCheck: false,
              divided: false
            }
          ]
        },
        {
          title: "工具",
          icon: "tool",
          dropdown: [
            {
              title: "测距量尺",
              command: "q",
              divided: false
            },
            {
              title: "全屏",
              command: "r",
              divided: false
            },
            {
              title: "设置",
              command: "s",
              divided: false
            }
          ]
        },
        {
          title: "图纸",
          icon: "draw",
          dropdown: [
            {
              title: "导出CAD",
              command: "t",
              divided: false
            },
            {
              title: "平面图",
              command: "u",
              divided: true
            },
            {
              title: "毛坯图",
              command: "v",
              divided: false,
              hidden: true
            },
            {
              title: "CAD施工图",
              command: "w",
              divided: false
            }
          ]
        },
        {
          title: "清单",
          icon: "list",
          dropdown: [
            {
              title: "定制报价",
              command: "x",
              divided: false
            },
            {
              title: "全屋报价",
              command: "y"
            }
          ]
        },
        {
          title: "帮助",
          icon: "help",
          hidden: false
        }
      ]
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
      // this[command]();
      this.$message("click on item " + command);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.navbar {
  height: $header-height;
  overflow: hidden;
  position: relative;
  background-color: $header-bg-color;
  box-shadow: $light-box-shadow;
  display: flex;
  justify-content: space-between;
  .right {
    display: flex;
    align-items: center;
    height: $header-height;
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
            background-color: $header-hover-bg-color;
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
        }
      }
    }
  }
}
</style>
<style lang="scss">
@import "~@/styles/variables.scss";
.showAndHide {
  .el-checkbox__label {
    font-size: $small-text-size;
  }
}
</style>
