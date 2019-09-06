<template>
  <div class="image-item">
    <el-image :src="item.url" :fit="fit"></el-image>
    <div class="mask">
      <header>
        <slot name="header">
          <el-tooltip class="item" effect="dark" content="收藏" placement="right">
            <MenuItem icon="collect" />
          </el-tooltip>
          <el-popover class="item" placement="right" width="300" trigger="hover">
            <Detail :item="item" />
            <MenuItem slot="reference" icon="info" />
          </el-popover>
        </slot>
      </header>
      <main>
        <slot>
          <el-button type="primary" size="small">打开</el-button>
        </slot>
      </main>
      <footer>
        <slot name="footer">
          <div v-if="item.name" class="name">{{ item.name }}</div>
          <div v-if="item.time" class="time">{{ item.time }}</div>
        </slot>
      </footer>
    </div>
  </div>
</template>
<script>
import MenuItem from "../menuItem/MenuItem";
import Detail from "../detail/Detail";
export default {
  components: {
    MenuItem,
    Detail
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fit: "cover"
    };
  }
};
</script>
<style lang="scss">
@import "~@/styles/variables.scss";
.image-item {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  .el-image {
    width: 100%;
    height: 100%;
  }
  &.margin-6 {
    margin: 6px;
  }
  &:hover {
    .mask {
      display: flex;
    }
  }
  .mask {
    display: none;
    position: absolute;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    top: -2px;
    left: -2px;
    flex-direction: column;
    justify-content: space-between;
    background-color: rgba(0, 0, 0, 0.2);
    border: 2px solid $base-active-bg-color;
    font-size: $mini-text-size;
    color: #fff;
    header,
    main,
    footer {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 4px;
    }
    header {
      justify-content: space-between;
      .item {
        width: 20px;
      }
    }
    footer {
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
    }
  }
}
</style>
