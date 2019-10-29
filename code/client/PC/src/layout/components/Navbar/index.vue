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
                  <MenuItem :icon="item.icon" :title="item.title" class="padding-left-right-6" />
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
              <MenuItem
                v-else
                :icon="item.icon"
                :title="item.title"
                class="padding-left-right-6"
                @click="handleCommand(item.command)"
              />
            </template>
          </li>
        </ul>
      </div>
      <Personal />
    </div>
  </div>
</template>

<script>
import MenuItem from '@/components/menuItem/MenuItem'
import Personal from '@/components/personal/Personal'
import Logo from './Logo'

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
        size: 'mini',
        placement: 'top',
        hideTimeout: 250,
        showTimeout: 100
      },
      menus: [
        {
          title: '调查问卷',
          hidden: false
        },
        {
          title: '返回旧版'
        },
        {
          icon: 'undo',
          command: 'undo'
        },
        {
          icon: 'redo',
          command: 'redo'
        },
        {
          title: '文件',
          icon: 'file',
          dropdown: [
            {
              title: '新建',
              command: 'new',
              divided: false
            },
            {
              title: '从户型库新建',
              command: 'fromLibrary',
              divided: false
            },
            {
              title: '打开本地',
              command: 'openLocal',
              divided: false
            },
            {
              title: '上传临摹图',
              command: 'uploadCopy',
              divided: true,
              hidden: false
            },
            {
              title: '上传CAD户型图',
              command: 'uploadCAD',
              divided: false
            },
            {
              title: '我的方案',
              command: 'mySolution',
              divided: true
            },
            {
              title: '本地备份记录',
              command: 'backupRecord',
              divided: false
            }
          ]
        },
        {
          title: '保存',
          icon: 'save',
          dropdown: [
            {
              title: '保存',
              command: 'save',
              divided: false
            },
            {
              title: '保存为',
              command: 'saveAs',
              divided: false
            },
            {
              title: '保存到本地',
              command: 'saveToLocal',
              divided: false
            }
          ]
        },
        {
          title: '显示',
          icon: 'show',
          hideOnClick: false,
          dropdown: [
            {
              title: '管理显示对象',
              command: 'showHideManage',
              divided: false
            },
            {
              title: '吊顶层',
              command: 'shCeiling',
              isCheckbox: true,
              isCheck: false,
              divided: true
            },
            {
              title: '门窗',
              command: 'shDoorWindow',
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: '顶角线',
              command: 'shTopLine',
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: '地角线',
              command: 'shBottomLine',
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: '地台横梁柱子',
              command: 'shdhz',
              isCheckbox: true,
              isCheck: false,
              divided: false
            },
            {
              title: '橱衣柜',
              command: 'shCabinet',
              isCheckbox: true,
              isCheck: false,
              divided: false
            }
          ]
        },
        {
          title: '工具',
          icon: 'tool',
          dropdown: [
            {
              title: '测距量尺',
              command: 'measure',
              divided: false
            },
            {
              title: '全屏',
              command: 'fullScreen',
              divided: false
            },
            {
              title: '设置',
              command: 'setting',
              divided: false
            }
          ]
        },
        {
          title: '图纸',
          icon: 'draw',
          dropdown: [
            {
              title: '导出CAD',
              command: 'exportCAD',
              divided: false
            },
            {
              title: '平面图',
              command: 'plane',
              divided: true
            },
            {
              title: '毛坯图',
              command: 'blank',
              divided: false,
              hidden: true
            },
            {
              title: 'CAD施工图',
              command: 'production',
              divided: false
            }
          ]
        },
        {
          title: '清单',
          icon: 'list',
          dropdown: [
            {
              title: '定制报价',
              command: 'customMade',
              divided: false
            },
            {
              title: '全屋报价',
              command: 'all'
            }
          ]
        },
        {
          title: '帮助',
          icon: 'help',
          command: 'help',
          hidden: false
        }
      ]
    }
  },
  computed: {
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    handleCommand(command) {
      if (this[command]) {
        this[command]()
      } else {
        this.$store.dispatch('menu/navBarChange', { command })
      }
    },
    fullScreen() {
      function full() {
        var el = document.documentElement
        var rfs =
          el.requestFullScreen ||
          el.webkitRequestFullScreen ||
          el.mozRequestFullScreen ||
          el.msRequestFullscreen
        if (typeof rfs !== 'undefined' && rfs) {
          return rfs.call(el)
        }
      }
      function exit() {
        var rfs =
          document.exitFullscreen ||
          document.mozCancelFullScreen ||
          document.webkitCancelFullScreen ||
          document.msExitFullscreen
        if (typeof rfs !== 'undefined' && rfs) {
          rfs.call(document)
        }
      }
      var obj = this.getObectFromCommand('fullScreen')
      if (
        window.outerHeigth === screen.heigth &&
        window.outerWidth === screen.width
      ) {
        full()
        obj.title = '退出全屏'
      } else {
        exit()
        obj.title = '全屏'
      }
    },
    getObectFromCommand(command) {
      for (let i = 0; i < this.menus.length; i++) {
        if (this.menus[i].command === command) {
          return this.menus[i]
        }
        if (Array.isArray(this.menus[i].dropdown)) {
          var dropdown = this.menus[i].dropdown
          for (let j = 0; j < dropdown.length; j++) {
            if (dropdown[j].command === command) {
              return dropdown[j]
            }
          }
        }
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
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
@import '~@/styles/variables.scss';
.showAndHide {
  .el-checkbox__label {
    font-size: $small-text-size;
  }
}
</style>
