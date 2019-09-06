<template>
  <div class="welcome">
    <el-dialog :visible.sync="isShow" center>
      <!-- <template v-slot:title>
        <span>欢迎使用滴答空间设计平台</span>
      </template>-->
      <div class="container">
        <div class="title">欢迎使用滴答空间设计平台</div>
        <div class="content">
          <div class="left">
            <div class="quick-start">
              <div class="title">快速设计</div>
              <div class="menu">
                <div v-for="(v,i) in menus" :key="i" class="item">
                  <MenuItem :icon="v.icon" :title="v.title" class="column super-big padding-top-6" />
                </div>
              </div>
            </div>
            <div class="study">
              <div class="title">教程</div>
              <ul class="course">
                <li v-for="(v,i) in studies" :key="v.id">
                  <a :href="v.url">{{ (i+1) + ' ' + v.title }}</a>
                </li>
              </ul>
            </div>
            <div class="slide">
              <el-carousel height="200px">
                <el-carousel-item v-for="(item, index) in carousels" :key="index">
                  <el-image :src="item.url" fit="cover"></el-image>
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>
          <div class="right">
            <div class="title">我的方案</div>
            <div v-if="solutions && solutions.length > 0">
              <ImageItem v-for="(v,i) in solutions.slice(0, 4)" :key="i" :item="v" class="margin-6">
                <template v-slot:header>
                  <span></span>
                </template>
              </ImageItem>
              <el-link :underline="false" type="primary">查看更多</el-link>
            </div>
            <div v-else>空空如也...</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import MenuItem from "@/components/menuItem/MenuItem";
import ImageItem from "../imageItem/ImageItem";
export default {
  components: {
    MenuItem,
    ImageItem
  },
  data() {
    return {
      isShow: false,
      menus: [
        {
          title: "户型",
          icon: "houseType",
          hidden: false
        },
        {
          title: "样板间",
          icon: "sampleRoom",
          hidden: false
        }
      ],
      studies: [
        {
          id: "1",
          url: "",
          title: "0到1学习客餐厅3D云设计"
        },
        {
          id: "2",
          url: "",
          title: "上传CAD户型图自动生成墙体方式"
        },
        {
          id: "3",
          url: "",
          title: "渲染--灯光渲染高级设置"
        },
        {
          id: "4",
          url: "",
          title: "定制柜体和下单"
        },
        {
          id: "5",
          url: "",
          title: "批量上传模型操作讲解"
        },
        {
          id: "6",
          url: "",
          title: "水电教学--水路"
        }
      ],
      solutions: [
        {
          id: "1",
          url:
            "http://manager.ddroom.cn//upload/render/20190829152729/c8552f9b.jpg",
          name: "万科海上明月--扶风",
          time: "2019/09/03 17:30"
        },
        {
          id: "2",
          url:
            "http://manager.ddroom.cn//upload/render/20190828160549/e3832a7c.jpg",
          name: "星雨华府--草木",
          time: "2019/09/03 17:30"
        },
        {
          id: "3",
          url:
            "http://manager.ddroom.cn//upload/render/20190827114554/90d69d30.jpg",
          name: "天一仁和--时光",
          time: "2019/09/03 17:30"
        },
        {
          id: "2",
          url:
            "http://manager.ddroom.cn//upload/render/20190828160549/e3832a7c.jpg",
          name: "星雨华府--草木",
          time: "2019/09/03 17:30"
        },
        {
          id: "3",
          url:
            "http://manager.ddroom.cn//upload/render/20190827114554/90d69d30.jpg",
          name: "天一仁和--时光",
          time: "2019/09/03 17:30"
        },
        {
          id: "2",
          url:
            "http://manager.ddroom.cn//upload/render/20190828160549/e3832a7c.jpg",
          name: "星雨华府--草木",
          time: "2019/09/03 17:30"
        }
      ],
      carousels: [
        {
          id: "1",
          url:
            "http://manager.ddroom.cn//upload/render/20190829152729/c8552f9b.jpg",
          name: "万科海上明月--扶风",
          time: "2019/09/03 17:30"
        },
        {
          id: "2",
          url:
            "http://manager.ddroom.cn//upload/render/20190828160549/e3832a7c.jpg",
          name: "星雨华府--草木",
          time: "2019/09/03 17:30"
        },
        {
          id: "3",
          url:
            "http://manager.ddroom.cn//upload/render/20190829152729/c8552f9b.jpg",
          name: "万科海上明月--扶风",
          time: "2019/09/03 17:30"
        },
        {
          id: "4",
          url:
            "http://manager.ddroom.cn//upload/render/20190828160549/e3832a7c.jpg",
          name: "星雨华府--草木",
          time: "2019/09/03 17:30"
        }
      ]
    };
  }
};
</script>
<style lang="scss">
@import "@/styles/variables.scss";
.welcome {
  .container {
    display: flex;
    flex-direction: column;
    color: #000;
    & > .title {
      text-align: center;
      font-size: $bigger-text-size;
      font-weight: bolder;
      letter-spacing: 2px;
    }
    .content {
      display: flex;
      .left {
        display: flex;
        width: 80%;
        flex-direction: column;
        padding: 20px;
        .title {
          font-weight: bold;
          font-size: $big-text-size;
          margin: 10px 0;
        }
        .quick-start {
          margin: 20px 0;
          .menu {
            display: flex;
            .item {
              margin-right: 6px;
              padding: 20px;
              cursor: pointer;
              &:hover {
                background-color: $sub-sidebar-hover-bg-color;
              }
            }
          }
        }
        .study {
          display: flex;
          flex-direction: column;
          .course {
            display: flex;
            flex-wrap: wrap;
            padding: 0 20px 0 20px;
            li {
              width: 50%;
              line-height: 30px;
              &:hover {
                color: $base-active-bg-color;
              }
            }
          }
        }
        .slide {
          margin: 20px 0;
          .el-carousel {
            overflow-y: hidden;
          }
          .el-carousel__item h3 {
            color: #475669;
            font-size: $middle-text-size;
            opacity: 0.75;
            margin: 0;
          }
          .el-carousel__item:nth-child(2n) {
            background-color: #99a9bf;
          }
          .el-carousel__item:nth-child(2n + 1) {
            background-color: #d3dce6;
          }
        }
      }
      .right {
        width: 20%;
        .title {
          margin: 20px 0 20px 0;
          font-weight: bold;
          font-size: $big-text-size;
        }
      }
    }
  }
}
</style>
