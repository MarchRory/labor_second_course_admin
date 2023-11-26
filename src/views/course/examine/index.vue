<template>
  <div id="bg" v-permission="['examine']">
    <div id="leftSide">
      <div id="guide">待审核: {{ courseTotal }}</div>
      <div id="searchBar">
        <div id="keyWords">
          <el-input
            v-model="courseKeywords"
            style="width: 180px; display: flex; align-items: center"
            placeholder="搜索课程名"
          />
        </div>
        <div id="buttons">
          <el-button icon="el-icon-refresh" @click="resetSearch"
            >重置</el-button
          >
          <el-button
            v-permission="[
              'curriculum.signUp.get',
              'curriculum.course.student.get',
            ]"
            v-debounce
            type="primary"
            icon="el-icon-search"
            :disabled="courseKeywords == ''"
            @click="searchCourse"
            >搜索</el-button
          >
        </div>
      </div>

      <div id="courseList">
        <el-table
          ref="couseList"
          v-loading="courseLoad"
          :data="searchedList"
          style="width: 100%; font-size: 12px"
          height="98%"
          highlight-current-row
          @current-change="handleChooseRow"
        >
          <el-table-column label="序号" min-width="50" align="center">
            <template slot-scope="scope">
              <div>
                {{ scope.$index + 1 }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="title"
            label="课程名"
            min-width="180"
            align="center"
          />
          <el-table-column label="状态" min-width="60" align="center">
            <template>
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-around;
                "
              >
                <p class="point" />
                <div style="font-size: 10px">待审核</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div id="rightSide">
      <el-table
        ref="stuList"
        v-loading="stuloading"
        :data="waitForPassList"
        style="width: 100%; font-size: 12px"
        height="87%"
        highlight-current-row
        @selection-change="handleSelectChange"
      >
        <el-table-column type="selection" :selectable="canSelect" width="55" />
        <el-table-column
          label="序号"
          type="index"
          min-width="30"
          align="center"
        />
        <!--             <el-table-column
                prop="studentId"
                label="学号"
                min-width="80"
                align="center">
            </el-table-column> -->
        <el-table-column
          prop="name"
          label="姓名"
          min-width="60"
          align="center"
        />
        <el-table-column
          prop="studentId"
          label="学号"
          min-width="90"
          align="center"
        />
        <!--             <el-table-column
                prop="enrollmentYear"
                label="年级"
                :filters="enterYear"
                :filter-method="filterYear"
                min-width="30"
                align="center">
            </el-table-column>
            <el-table-column
                prop="college"
                label="学院"
                :filters="enterCollege"
                :filter-method="filterCollege"
                min-width="90"
                align="center">
            </el-table-column> -->
        <el-table-column
          v-permission="[
            'curriculum.signUp.get',
            'curriculum.course.student.get',
          ]"
          width="320"
          align="right"
        >
          <template slot="header" slot-scope="scope">
            <div id="headerSearch">
              <el-input
                v-model="examineKeyWords"
                size="medium"
                placeholder="输入关键字搜索"
                @keyup.enter.native="handlerFilter"
              />
              <el-button
                v-debounce
                style="margin-left: 10px"
                type="primary"
                icon="el-icon-search"
                :disabled="examineKeyWords == ''"
                @click="handlerFilter"
                >搜索</el-button
              >
            </div>
          </template>
          <template>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-around;
              "
            >
              <p class="point" />
              <div style="font-size: 10px">待审核</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
        "
      >
        <el-pagination
          background
          :page-size="pageSize"
          :page-sizes="[30, 40, 50]"
          layout="total,sizes, prev, pager, next, jumper"
          :current-page="page"
          :total="waitPassTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <div class="examineButtonBox">
        <div id="surplus">课程剩余名额: {{ surplus }}</div>
        <div
          style="
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
          "
        >
          <div
            v-permission="['curriculum.signUp.add', 'curriculum.signUp.update']"
            @click="examine"
          >
            <pass-button text="一键通过" />
          </div>
          <div
            v-permission="[
              'curriculum.signUp.update',
              'curriculum.signUp.add',
              'curriculum.signUp.delete',
            ]"
          >
            <el-button
              v-debounce
              type="text"
              style="color: red"
              icon="el-icon-delete"
              @click="refuseAll"
              >一键拒绝</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getStudentList, selectCoursePage } from "@/api/lessons.js";
import { examinePass } from "@/api/examine/examine";
import passButton from "@/components/buttons/passButton.vue";
import { Message } from "element-ui";
import { mapGetters } from "vuex";
export default {
  components: { passButton },
  data() {
    return {
      examinedCourseId: null,
      stuList: [],
      filterList: [],
      waitForPassList: [], // 用于展示的列表，筛选后的待审核列表
      passList: [], // 提交给后端的审核通过列表数组
      courseKeywords: "",
      courseList: [], // 展示的列表的copy, 用于作为筛选时候的的数据源
      searchedList: [],
      pageNum: 1,
      pageSize: 15,
      examineKeyWords: "",
      enterYear: [],
      collegeList: [],
      loadding: false,
      courseLoad: false,
      stuloading: false,
      enterCollege: [],
      isPassAll: 1,
      page: 1,
      waitPassTotal: 0,
      passType: 0,
      evaluateType: -2, // evaluateType:-1忽略此字段(会过滤掉没有写自我评价的学生),-2,完全忽略此字段,0未考评,1考评通过
      courseLimit: 0,
      surplus: null, // 课程名额存量
      courseTotal: null,
    };
  },
  computed: {
    ...mapGetters(["semesterId"]),
  },
  watch: {
    courseKeywords: {
      handler(n, o) {
        if (n == "") {
          this.searchedList = this.courseList;
        }
      },
    },
    examineKeyWords: {
      handler(n, o) {
        if (n != "") {
          this.waitForPassList = this.filterList;
          this.filterList = [];
        } else {
          this.waitForPassList = this.stuList;
        }
      },
    },
  },
  created() {},
  mounted() {
    this.courseLoad = true;
    selectCoursePage(null, null, 1, 1000, null, null, this.semesterId, null, 2)
      .then((res) => {
        if (res.code == 200) {
          const { list, total } = res.data;
          this.courseList = list;
          this.searchedList = list;
          this.courseTotal = Number(total);
        } else {
          this.$message.error("网络异常, 请稍后再试");
        }
      })
      .finally(async () => {
        this.courseLoad = false;
        const id = this.$route.query.id;
        if (typeof id !== "undefined") {
          this.editedCourseId = id;
          const index = this.courseList.findIndex((item) => item.id == id);
          if (index === -1) {
            this.$message.warning("该课程暂时还不需要审核哦, 看看其他课程吧");
            return;
          }
          this.scrollToGoalRow(this.editedCourseId, this.courseList);
          this.getStuList(this.editedCourseId);
        }
      });
  },
  methods: {
    getCoursesList() {
      this.courseLoad = true;
      selectCoursePage(null, 1, 1000, null, null, this.semesterId, null, 2)
        .then((res) => {
          if (res.code == 200) {
            const { list, total } = res.data;
            this.courseList = list;
            this.searchedList = list;
            this.courseTotal = Number(total);
          } else {
            this.$message.error("网络异常, 请稍后再试");
          }
        })
        .finally(() => {
          this.courseLoad = false;
        });
    },
    getStuList(id) {
      this.passList = [];
      this.stuloading = true;
      return new Promise((resolve, reject) => {
        getStudentList(
          id,
          this.page,
          this.pageSize,
          this.passType,
          this.evaluateType
        )
          .then((res) => {
            if (res.code == 200) {
              const { data } = res;
              data.list = data.list.filter((item) => item.userId !== null);
              this.waitForPassList = data.list;
              this.stuList = data.list;
              this.waitPassTotal = Number(data.total);
              this.surplus = this.courseLimit - Number(data.passCount);
              // this.stuList = data
              /*                         let years = [], cList = []
                         years = data.map((ever) => {
                            return ever.enrollmentYear
                        })
                        cList = data.map((ever) => {
                            return ever.college
                        })

                        this.enterYear = [...new Set(years)]
                        this.collegeList = [...new Set(cList)] */
              resolve(true);
            } else {
              this.$message.error("网络异常, 请稍后重试");
            }
          })
          .finally(() => {
            this.stuloading = false;
          });
      });
    },
    searchCourse() {
      this.passList = [];
      this.$refs.stuList.clearSelection();
      this.searchedList = this.courseList.filter((course) => {
        return course.title.includes(this.courseKeywords);
      });
      if (this.searchedList.length == 0) {
        Message({
          type: "warning",
          message: "没有找到符合要求的课程",
          duration: 3000,
        });
      }
    },
    resetSearch() {
      this.courseKeywords = "";
    },
    handleChooseRow(currentRow) {
      this.passList = [];
      this.$refs.stuList.clearSelection();
      if (currentRow) {
        this.editedCourseId = currentRow.id;
        this.courseLimit = currentRow.numberLimit;
        this.page = 1;
        this.getStuList(this.editedCourseId);
      }
    },
    scrollToGoalRow(id, list) {
      const index = list.findIndex((item) => item.id == id);
      const courseListEL = this.$refs.couseList.$el;
      if (courseListEL) {
        const goalRowTop = courseListEL
          .getElementsByClassName("el-table__row")
          [index].getBoundingClientRect().top;
        const listTop = courseListEL
          .querySelector(".el-table__body")
          .getBoundingClientRect().top.$el;
        if (goalRowTop - listTop - 483 > 0) {
          this.$refs.couseList.$refs.bodyWrapper.scrollTop =
            goalRowTop - listTop;
        }
        this.$refs.couseList.setCurrentRow(this.$refs.couseList.data[index]);
      }
    },
    getParticipantsList(id) {},
    handleSelectChange(selectionObj) {
      this.passList = selectionObj;
    },
    handlerFilter() {
      this.waitForPassList = this.stuList.filter((ever) => {
        return Object.values(ever).some((item) =>
          item.includes(this.examineKeyWords)
        );
      });
    },
    filterYear(value, row) {
      return row.enrollmentYear === value;
    },
    filterCollege(value, row) {
      return row.college === value;
    },
    refuseAll() {
      this.isPassAll = -1;
      this.examine();
    },
    examine() {
      if (this.passList.length != 0) {
        this.$confirm("确定要让当前已选中的同学通过审核吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          this.passList = this.passList.map((item) => {
            return item.userId;
          });
          examinePass(this.editedCourseId, this.passList, this.isPassAll)
            .then((res) => {
              if (res.code == 200) {
                this.waitForPassList = this.waitForPassList.filter(
                  (item) => !this.passList.includes(item.id)
                );
                this.stuList = this.waitForPassList;
                if (this.waitPassTotal - this.passList.length === 0) {
                  this.$message.success("该课程已完成审核");
                  const indexS = this.searchedList.findIndex(
                    (item) => item.id === this.editedCourseId
                  );
                  this.searchedList.splice(indexS, 1);
                  const indexC = this.courseList.findIndex(
                    (item) => item.id === this.editedCourseId
                  );
                  if (indexC != -1) {
                    this.courseList.splice(indexC, 1);
                  }
                  if (this.courseKeywords && !this.searchedList.length) {
                    this.courseKeywords = "";
                  }
                  this.waitForPassList = [];
                  this.stuList = [];
                  this.surplus = null;
                  this.page = 1;
                } else {
                  this.page = 1;
                  this.getStuList(this.editedCourseId);
                  this.$message.success("审核成功");
                }
              } else {
                this.$message.error("网络异常, 请稍后再试");
              }
            })
            .finally(() => {
              this.isPassAll = 1;
            });
        });
      } else {
        Message({
          type: "warning",
          message: "还没有选择审核的学生",
          duration: 3000,
        });
      }
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.getStuList(this.editedCourseId);
    },
    handleCurrentChange(newPage) {
      this.page = newPage;
      this.getStuList(this.editedCourseId);
    },
    canSelect() {
      return this.passList.length < this.surplus;
    },
  },
};
</script>

<style lang="scss" scoped>
@mixin flex_jc_sb_dr {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
::v-deep {
  .el-table--scrollable-x .el-table__body-wrapper {
    overflow-x: hidden !important;
  }
  .el-table {
    .el-table__body tr.current-row > td {
      background: #6785f1bf !important;
      color: white;
      font-weight: 600;
    }
    .el-table__row {
      height: 30px;
    }
  }
  #keyWords {
    .el-input {
      input {
        height: 30px;
      }
    }
  }
  #buttons {
    .el-button {
      width: 8vh;
      min-width: 57.73px;
      height: 30px;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  #headerSearch {
    .el-input {
      input {
        width: 100%;
        height: 35px;
      }
    }
    .el-button {
      height: 35px;
      padding-left: 15px;
      padding-right: 15px;
    }
  }
  #passButton {
    .cssbuttons-io-button {
      background: #6785f1bf;
      box-shadow: inset 0 0 1.6em -0.6em #1949f7bf;
    }
  }
}
#bg {
  @include flex_jc_sb_dr;
  min-width: 1326px;
  min-height: 665.2px;
  width: 100%;
  height: 100%;
  padding: 10px;
  & > div {
    height: 100%;
    background-color: #ffffff;
    border-radius: 15px;
    transition: all 0.25s ease-in;
    padding: 10px;
    &:hover {
      box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
    }
  }
  #leftSide {
    width: 24%;
    display: flex;
    flex-direction: column;
    #guide {
      width: 100%;
      height: 30px;
      /* margin-top: 1px; */
      margin-left: 2px;
      margin-bottom: 10px;
      font-size: 20px;
      font-weight: bold;
      border-bottom: solid 2px;
    }
    #searchBar {
      @include flex_jc_sb_dr;
      width: 93%;
      margin: 0 auto;
      margin-top: 10px;
      #keyWords {
        @include flex_jc_sb_dr;
        align-items: center;
        width: 50%;
        color: #838383;
        margin-left: -5px;
      }

      #buttons {
        @include flex_jc_sb_dr;
        align-items: center;
        width: 42%;
        height: 30px;
      }
    }
    #courseList {
      width: 100%;
      height: 90%;
      margin-top: 11px;
      .point {
        height: 6px;
        width: 6px;
        border-radius: 50%;
        background-color: #ed9a45;
      }
    }
  }
  #rightSide {
    width: 75%;
    #headerSearch {
      width: 100%;
      @include flex_jc_sb_dr;
    }
  }

  .examineButtonBox {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    #surplus {
      margin-left: 30px;
    }
    div {
      margin-right: 20px;
    }
  }
}
</style>
