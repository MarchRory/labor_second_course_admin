<template>
  <div id="pageContainer" class="container">
    <el-row :gutter="20" type="flex" justify="space-around" align="middle">
      <el-col :span="18" class="box">
        <div class="toolbar">
          <div class="semesterBox">
            <div style="">当前学期: {{ semesterName }}</div>
            <div v-permission="['user.student.get']" class="searchSemester">
              查看:
              <el-select
                v-model="chosenSemester"
                placeholder="选择学期查看数据"
                size="small"
                @change="chooseNewSemester"
              >
                <el-option-group
                  v-for="group in semesterList"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-option-group>
              </el-select>
            </div>
          </div>

          <div class="searchBar">
            <el-input
              v-model="keyWords"
              placeholder="请输入学生姓名"
              size="small"
            />
            <div class="bottons">
              <el-button
                size="small"
                :disabled="!keyWords"
                @click="keyWords = ''"
                >重置</el-button
              >
              <el-button
                type="primary"
                size="small"
                :disabled="!keyWords"
                @click="searchData"
                >搜索</el-button
              >
            </div>
          </div>

          <div class="getExcel">
            <el-button
              v-permission="['user.student.get']"
              type="success"
              icon="el-icon-s-grid"
              @click="download"
              >导出所选学期积分表格</el-button
            >
          </div>
        </div>

        <div ref="listBox" v-loading="rankLoad" class="visual-list">
          <visual-list
            :list="rankList"
            :ceil-size="visualListCeilSize"
            :show-number="showNumber"
            :avatar-size="avatarSize"
            style="width: 100%"
          />
        </div>
      </el-col>

      <el-col :span="6" class="box">
        <el-card id="spc_card" class="box-card">
          <div id="card_header" slot="header" class="clearfix">
            <span>积分分布图</span>
          </div>
          <div
            ref="spc"
            v-loading="scChartLoad"
            :style="{ height: cardBodyHeight + 'px' }"
            class="scoresPieChart"
          />
        </el-card>

        <el-card id="gcpc_card" class="box-card">
          <div slot="header" class="clearfix">
            <span>年级积分对比图</span>
          </div>
          <div
            ref="gcpc"
            v-loading="gcChartLoad"
            :style="{ height: cardBodyHeight + 'px' }"
            class="gradeScorePieChart"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getAllSemesters } from "@/api/semesterAndObjectives/semester";
import visualList from "./components/visualList.vue";
import {
  gradeCreditStatistics,
  getRankChart,
} from "@/api/chartsData/chartsData";
import { downloadExcel } from "@/api/student";
import { handleDownload } from "@/utils/file";
import { getScorePieOpts, getgradeScorePieOpts } from "@/utils/chartOpts";
import { debunce } from "@/utils/debounce";
import { mapGetters, mapState } from "vuex";
export default {
  name: "rankList",
  components: { visualList },
  data() {
    return {
      chosenSemester: null,
      checkedSemester: null,
      semesterList: [],
      rankList: [],
      copyList: [],
      rankLoad: false,
      scChartLoad: true,
      gcChartLoad: false,
      SPCData: [],
      gcCData: {
        xData: [],
        yData: [],
      },
      SPCChart: null,
      gcChart: null,
      visualListCeilSize: 0,
      showNumber: 15,
      keyWords: "",
      cardBodyHeight: null,
      watchChart: null,
      avatarSize: null,
    };
  },
  created() {
    this.getSemesterList();
    this.chosenSemester = this.semesterId;
    this.checkedSemester = this.semesterId;
  },
  mounted() {
    this.visualListCeilSize =
      (this.$refs.listBox.offsetHeight - 40) / this.showNumber; // -40是为了给表头腾出地方
    this.avatarSize = this.$refs.listBox.offsetHeight < 600 ? 30 : 38;
    this.cardBodyHeight =
      document.getElementById("spc_card").offsetHeight -
      document.getElementById("card_header").offsetHeight -
      40;
    (async () => {
      await this.getRankList();
      await this.getGCPCChart();
    })().finally(() => {
      this.watchChart = new ResizeObserver(() => {
        debunce(() => {
          if (this.SPCChart && this.gcChart) {
            this.SPCChart.resize();
            this.gcChart.resize();
          }
        }, 280);
      });
      this.watchChart.observe(document.getElementById("pageContainer"));
    });
    window.addEventListener("resize", () => {
      this.visualListCeilSize =
        (this.$refs.listBox.offsetHeight - 40) / this.showNumber;
      this.avatarSize = this.$refs.listBox.offsetHeight < 600 ? 30 : 38;
      this.cardBodyHeight =
        document.getElementById("spc_card").offsetHeight -
        document.getElementById("card_header").offsetHeight -
        40;
    });
  },
  beforeDestroy() {
    if (this.SPCChart || this.gcChart) {
      this.SPCChart.clear();
      this.gcChart.clear();
    }
    this.watchChart.disconnect();
    this.watchChart = null;
    window.removeEventListener("resize", () => {});
  },
  computed: {
    ...mapGetters(["semesterId"]),
    ...mapState("semester", ["semesterName"]),
  },
  watch: {
    keyWords: {
      handler(newer, older) {
        if (!newer && this.rankList.length != this.copyList.length) {
          this.rankList = this.copyList;
        }
      },
    },
  },
  methods: {
    chooseNewSemester(newSemesterId) {
      if (newSemesterId != this.checkedSemester) {
        this.rankLoad = true;
        this.checkedSemester = newSemesterId;
        (async () => {
          this.scChartLoad = true;
          this.SPCData = [];
          this.gcCData = [];
          this.getRankList();
        })().finally(() => {
          this.rankLoad = false;
          this.scChartLoad = false;
        });
      }
    },
    getSemesterList() {
      getAllSemesters().then((res) => {
        if (res.code == 200) {
          const { data } = res;
          this.semesterList.push({
            label: "当前学期",
            options: [{ value: this.semesterId, label: this.semesterName }],
          });
          const index = data.findIndex((item) => item.id === this.semesterId);
          data.splice(index, 1);
          if (data.length > 0) {
            const others = data.map((ever) => {
              return { value: ever.id, label: ever.semesterName };
            });
            this.semesterList.push({
              label: "其他学期",
              options: others,
            });
          }
        } else {
          this.$message.error("网络异常, 获取学期信息列表失败");
        }
      });
    },
    getRankList() {
      this.rankLoad = true;
      getRankChart(0, -1, this.checkedSemester)
        .then((res) => {
          const { list, total } = res.data;
          this.rankList = list;
          this.copyList = list;
          this.rankLoad = false;
        })
        .then(async () => {
          if (this.rankList.length) {
            const range = Math.abs(
              this.rankList[0].score -
                this.rankList[this.rankList.length - 1].score
            );
            let rSide = 0;
            let right = false;
            if (range == 0) {
              this.SPCData.push({
                name: this.rankList[0].score.toString(),
                value: parseInt(this.rankList.length),
              });
            } else if (range > 0 && range <= 10) {
              rSide = 2;
            } else if (range < 20) {
              rSide = 3;
            } else if (range < 30) {
              rSide = 4;
            } else {
              rSide = 5;
            }

            if (range != 0) {
              for (let i = 0; i < rSide; i++) {
                right = i == rSide - 1 ? (range / 2) * (i + 1) : range + 1;
                this.SPCData.push({
                  name: `${(range / 2) * i}~${(range / rSide) * (i + 1)}`,
                  value: parseInt(
                    this.copyList.filter((item) => {
                      item.score >= (range / rSide) * i && item.score < right;
                    }).length
                  ),
                });
              }
            }
          }
        })
        .finally(() => {
          this.getSPCChart();
          this.rankLoad = false;
        });
    },
    async getSPCChart() {
      this.SPCData = await JSON.parse(JSON.stringify(this.SPCData));
      if (!this.SPCChart) {
        this.SPCChart = this.$echarts.init(this.$refs.spc);
        this.SPCChart.setOption(getScorePieOpts(this.SPCData));
      } else {
        this.SPCChart.setOption(getScorePieOpts(this.SPCData));
      }
    },
    async getGCPCChart() {
      this.gcChartLoad = true;
      gradeCreditStatistics()
        .then((res) => {
          const { xData, yData } = res.data;
          this.gcCData.xData = xData;
          this.gcCData.xData.forEach((item, index) => {
            this.gcCData.xData[index] += "级";
          });
          this.gcCData.yData = yData;
        })
        .then(() => {
          if (!this.gcChart) {
            this.gcChart = this.$echarts.init(this.$refs.gcpc);
            this.gcChart.setOption(
              getgradeScorePieOpts(this.gcCData.xData, this.gcCData.yData)
            );
          } else {
            this.gcChart.setOption(
              getgradeScorePieOpts(this.gcCData.xData, this.gcCData.yData)
            );
          }
        })
        .finally(() => {
          this.gcChartLoad = false;
        });
    },
    searchData() {
      this.rankLoad = true;
      this.rankList = this.copyList.filter((item) =>
        item.studentVO.name.includes(this.keyWords)
      );
      if (!this.rankList.length) {
        this.$message.warning("没有找到相关信息");
      }
      this.rankLoad = false;
    },
    download() {
      downloadExcel(this.checkedSemester)
        .then((data) => {
          if (!data) {
            this.$message.error("获取Excel文件失败");
            return;
          }
          const semesterNow = JSON.parse(
            JSON.stringify(this.semesterList[0].options)
          );
          const semesterOther = JSON.parse(
            JSON.stringify(this.semesterList[1].options)
          );
          const fileName = semesterNow
            .concat(semesterOther)
            .find((item) => item.value == this.checkedSemester).label;
          let xisxName = `${fileName}积分排行榜.xlsx`;
          console.log("rankOriginData: ", data);
          handleDownload(xisxName, data);
        })
        .catch((e) => {
          this.$message.error("处理文件时遇到错误");
          console.log("前端处理文件API出错: ", e);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-card__body {
  padding: 0;
}
.container {
  width: 100%;
  height: calc(100vh - 50px);
  min-width: 1326px;
  min-height: 665.2px;
  padding: 10px;
  background: #f5f5f5;
  .el-row {
    .box {
      padding-left: 10px;
      border-radius: 4px;
      height: calc(100vh - 70px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      .toolbar {
        &::-webkit-scrollbar {
          width: 0 !important;
        }
      }
      .visual-list {
        &::-webkit-scrollbar {
          height: 0 !important;
        }
      }
      .toolbar,
      .visual-list {
        width: 100%;
        background-color: #ffffff;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        overflow-x: hidden;
        .semesterBox {
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: space-around;
          height: 100%;
          width: 30%;
        }
        .searchBar {
          width: 30%;
          height: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          ::v-deep .el-input__inner {
            width: 200px;
          }
          .bottons {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-left: 5px;
          }
        }
        .getExcel {
          width: 20%;
        }
      }
      .toolbar {
        height: 10%;
      }
      .visual-list {
        height: 88.5%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
      }

      .clearfix:before,
      .clearfix:after {
        display: table;
        content: "";
      }
      .clearfix:after {
        clear: both;
      }

      .box-card {
        width: 100%;
        height: 49%;
        .scoresPieChart {
          width: 100%;
        }
      }
    }
  }
}
</style>
