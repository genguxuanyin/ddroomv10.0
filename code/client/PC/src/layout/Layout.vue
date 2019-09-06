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
  z-index: 2;
  background-color: $base-bg-color;
  color: $base-text-color;
  font-size: $middle-text-size;
}
.el-header {
  height: $header-height !important;
  width: 100%;
}
.el-footer {
  height: $footer-height !important;
  left: $sidebar-width;
  bottom: 0;
  width: calc(100% - #{$sidebar-width});
}
.el-aside {
  height: calc(100% - #{$header-height});
  left: 0;
  top: $header-height;
  width: $sidebar-width !important;
  overflow: visible;
}
.el-aside.right {
  top: calc(50% - #{$right-sideBar-height});
  height: $right-sideBar-height;
  left: auto;
  right: 0;
  background-color: $right-sidebar-bg-color;
  color: $right-sidebar-text-color;
  border-top-left-radius: $base-border-radius;
  border-bottom-left-radius: $base-border-radius;
  box-shadow: $light-box-shadow;
}
.el-main {
  width: 100%;
  height: 100%;
  padding: 0;
}
</style>
