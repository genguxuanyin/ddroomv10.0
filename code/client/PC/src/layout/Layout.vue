<template>
  <div :class="classObj" class="app-wrapper">
    <el-container>
      <el-header>
        <navbar />
        <Viewbar />
      </el-header>
      <el-container>
        <el-aside>
          <Sidebar :menus="sidebarMenus" @selectedSideMenu="selectedSideMenu" />
          <SubSidebar :menu="activeMenu" />
        </el-aside>
        <el-container>
          <el-main>
            <app-main />
          </el-main>
          <el-footer>
            <Footerbar />
          </el-footer>
        </el-container>
        <el-aside class="right">
          <Rightbar />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import {
  Navbar,
  Sidebar,
  SubSidebar,
  Footerbar,
  AppMain,
  Rightbar,
  Viewbar
} from "./components";
import ResizeMixin from "./mixin/ResizeHandler";

export default {
  name: "Layout",
  components: {
    Navbar,
    Sidebar,
    SubSidebar,
    Footerbar,
    AppMain,
    Rightbar,
    Viewbar
  },
  mixins: [ResizeMixin],
  data() {
    return {
      sidebarMenus: [
        {
          title: "户型",
          icon: "houseType",
          subSidebarComponent: "HouseType",
          hidden: false,
          isActive: true
        },
        {
          title: "样板间",
          icon: "sampleRoom",
          subSidebarComponent: "SampleRoom",
          hidden: false,
          isActive: false
        },
        {
          title: "云素材",
          icon: "cloudMaterial",
          subSidebarComponent: "CloudMaterial",
          hidden: false,
          children: [
            {
              title: "公共库",
              hidden: false,
              isActive: false
            },
            {
              title: "品牌馆",
              hidden: false,
              isActive: false
            }
          ],
          isActive: false
        },
        {
          title: "定制",
          icon: "customMade",
          subSidebarComponent: "CustomMade",
          hidden: false,
          isActive: false
        },
        {
          title: "我的",
          icon: "my",
          subSidebarComponent: "My",
          hidden: false,
          isActive: false
        }
      ]
    };
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar;
    },
    device() {
      return this.$store.state.app.device;
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === "mobile"
      };
    },
    activeMenu() {
      return this.sidebarMenus.find(v => {
        return v.isActive;
      });
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch("app/closeSideBar", { withoutAnimation: false });
    },
    selectedSideMenu({ index }) {
      this.sidebarMenus.forEach(element => {
        element.isActive = false;
      });
      this.sidebarMenus[index]["isActive"] = true;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.el-container {
  width: 100%;
  height: 100%;
}
.el-header,
.el-footer,
.el-aside {
  position: absolute;
  background-color: $menuBg;
  color: #fff;
  z-index: 2;
  font-size: 14px;
}
.el-header {
  height: $headerHeight !important;
  width: 100%;
}
.el-footer {
  height: $footerHeight !important;
  left: $sideBarWidth;
  bottom: 0;
  width: calc(100% - #{$sideBarWidth});
}

.el-aside {
  height: calc(100% - #{$headerHeight});
  left: 0;
  top: $headerHeight;
  width: $sideBarWidth !important;
  overflow: visible;
}

.el-aside.right {
  top: calc(50% - #{$rightSideBarHeight});
  height: $rightSideBarHeight;
  left: auto;
  right: 0;
  background-color: $subSidebarMenuBg;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 160px;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
