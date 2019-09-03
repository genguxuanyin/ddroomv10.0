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
                  <item :icon="v.icon" :title="v.title" />
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
                <el-carousel-item v-for="item in 4" :key="item">
                  <h3 class="small">{{ item }}</h3>
                </el-carousel-item>
              </el-carousel>
            </div>
          </div>
          <div class="right">
            <div class="title">我的方案</div>
            <div class="solution">
              <SolutionItem v-for="(v,i) in solutions" :key="i" :item="v" />
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Item from "@/layout/components/Sidebar/Item";
import SolutionItem from "../solution/SolutionItem";
export default {
  components: {
    Item,
    SolutionItem
  },
  data() {
    return {
      isShow: true,
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
      font-size: 18px;
      font-weight: bolder;
      letter-spacing: 2px;
    }
    .title {
      height: 50px;
      line-height: 50px;
    }
    .content {
      display: flex;
      .left {
        display: flex;
        width: 80%;
        flex-direction: column;
        .title {
          padding: 0 0 0 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .quick-start {
          .menu {
            display: flex;
            .item {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100px;
              line-height: 50px;
              cursor: pointer;
              padding: 10px 0 0 0;
              svg {
                width: 3em;
                height: 3em;
              }
              &:hover {
                background-color: $subSidebarMenuHover;
              }
            }
          }
        }
        .study {
          display: flex;
          flex-direction: column;
          height: 130px;
          .course {
            display: flex;
            flex-wrap: wrap;
            height: 30px;
            line-height: 30px;
            padding: 0 20px 0 20px;
            li {
              width: 50%;
              &:hover {
                color: $menuActiveText;
              }
            }
          }
        }
        .slide {
          padding: 20px;
          line-height: 20px;
          .el-carousel__item h3 {
            color: #475669;
            font-size: 14px;
            opacity: 0.75;
            line-height: 200px;
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
        flex-grow: 1;
        .solution {
          padding: 0 0 0 20px;
        }
        .title {
          padding: 0 0 0 20px;
          font-weight: bold;
          font-size: 16px;
        }
      }
      /* .quick-start,
      .study,
      .slide {
        border: 1px solid black;
      } */
    }
  }
}
</style>
