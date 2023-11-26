<template>
  <div class="app-container">
    <div v-if="$route.meta.showFather">
      <div class="toolBar">
        <div id="searchBar">
          <div id="keyWords">
            <span style="width: 30%">课程名:&nbsp;</span>
            <el-input
              v-model="keyWords"
              style="
                margin-left: -20px;
                width: 180px;
                display: flex;
                align-items: center;
              "
              placeholder="需要查询的课程"
            />
          </div>
          <div id="buttons">
            <el-button @click="reset">重置</el-button>
            <el-button
              v-debounce
              type="primary"
              :disabled="keyWords == ''"
              @click="search"
              >搜索</el-button
            >
          </div>
        </div>

        <div
          class="guideButtons"
          style="display: flex; justify-content: space-around"
        >
          <el-button
            v-permission="['curriculum.course.add']"
            v-debounce
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="openAddLesson"
            >新增课程</el-button
          >
        </div>
      </div>

      <div id="main" v-loading="loading">
        <div id="roleTable">
          <el-table
            :row-style="{ minHeight: 50 + 'px', height: 'auto' }"
            :cell-style="{ padding: 8 + 'px' }"
            :data="showLessons"
            stripe
            height="100%"
            style="width: 100%"
            @filter-change="filterChange"
          >
            <el-table-column label="序号" min-width="40" align="center">
              <template slot-scope="scope">
                <div>
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="title"
              label="课程名称"
              min-width="120"
              align="center"
            />
            <el-table-column
              prop="courseCategory"
              label="分类"
              min-width="60"
              align="center"
              :filter-multiple="false"
              column-key="chosenCategory"
              :filters="[
                { text: '日常生活劳动', value: '日常生活劳动' },
                { text: '公益服务劳动', value: '公益服务劳动' },
                { text: '生产顶岗劳动', value: '生产顶岗劳动' },
                { text: '劳动理论学习', value: '劳动理论学习' },
                { text: '其他方式劳动', value: '其他方式劳动' },
              ]"
            />
            <el-table-column
              label="状态"
              align="center"
              min-width="40"
              column-key="status"
              :filter-multiple="false"
              :filters="[
                { text: '筹备中', value: 1 },
                { text: '报名中', value: 2 },
                { text: '审核中', value: 5 },
                { text: '进行中', value: 3 },
                { text: '已结束', value: 4 },
              ]"
            >
              <template slot-scope="scope">
                <el-tag v-if="scope.row.state == 1" type="warning"
                  >筹备中</el-tag
                >
                <el-tag v-else-if="scope.row.state == 2" type="primary"
                  >报名中</el-tag
                >
                <el-tag v-else-if="scope.row.state == 3" type="success"
                  >进行中</el-tag
                >
                <el-tag v-else-if="scope.row.state == 4" type="info"
                  >已结束</el-tag
                >
                <el-tag v-else-if="scope.row.state == 5" type="danger"
                  >审核中</el-tag
                >
                <el-tag v-else type="danger">未知状态</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="承办方" prop="undertaker" align="center" />
            <el-table-column
              label="承办单位"
              prop="undertaker"
              align="center"
            />
            <el-table-column
              v-permission="['router.coursesManage']"
              label="详细信息"
              prop="id"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <i
                  class="el-icon-tickets detailTag"
                  style="font-size: 21px"
                  size="large"
                  @click="seeDetail(scope.row.id, scope.row.state)"
                />
              </template>
            </el-table-column>
            <el-table-column
              v-permission="[
                'curriculum.course',
                'curriculum.course.add',
                'curriculum.course.update',
                'curriculum.course.delete',
              ]"
              label="操作"
              prop="id"
              min-width="120"
              align="center"
            >
              <template slot-scope="scope">
                <div class="tools">
                  <el-button
                    v-if="scope.row.numberLimit > scope.row.passCount"
                    v-permission="[
                      'curriculum.signUp.get',
                      'curriculum.signUp.add',
                      'curriculum.signUp.update',
                      'curriculum.signUp.delete',
                    ]"
                    :disabled="scope.row.state > 3"
                    v-debounce
                    type="text"
                    style="color: #e6a23c"
                    @click="examine(scope.row.id)"
                    icon="el-icon-s-check"
                    >审核</el-button
                  >
                  <el-button
                    v-else
                    v-permission="[
                      'curriculum.signUp.get',
                      'curriculum.signUp.add',
                      'curriculum.signUp.update',
                      'curriculum.signUp.delete',
                    ]"
                    v-debounce
                    type="text"
                    style="color: #ff2727"
                    icon="el-icon-s-check"
                    :disabled="true"
                    >满员</el-button
                  >
                  <el-button
                    v-permission="['curriculum.course.update']"
                    v-debounce
                    :disabled="scope.row.state > 2"
                    type="text"
                    style="color: #409eff"
                    icon="el-icon-edit-outline"
                    @click="openUpdateLesson(scope.row)"
                    >编辑</el-button
                  >
                  <el-button
                    v-permission="['curriculum.course.delete']"
                    v-debounce
                    :disabled="scope.row.state > 2"
                    style="color: #f56c6c"
                    type="text"
                    icon="el-icon-delete"
                    @click="delLesson(scope.row.id)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div id="pageChange">
          <el-pagination
            :current-page.sync="page.currentPage"
            :page-size="page.pageSize"
            :page-sizes="[10, 15, 20, 30]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="lessonsTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <el-dialog
        id="popup"
        v-permission="['curriculum.course.update', 'curriculum.course.add']"
        :visible.sync="isOpenAddLesson"
        :title="!isOpenModify ? '新建劳动课程' : '修改课程信息'"
        top="4vh"
        :show-close="false"
        @closed="clearForm"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <course-form
          ref="courseForm"
          :is-Visible="isOpenAddLesson"
          :is-update="isOpenModify"
          :lesson-id="courseId"
          :state="chosenCourseState"
          @successCourseFrom="handleAddLessonSuccess"
          @onClose="handleFormClose"
        />
      </el-dialog>
    </div>

    <router-view v-else :key="$route.fullPath" />
  </div>
</template>

<script>
import { addLesson, delLesson } from "@/api/lessons";
import { mapGetters } from "vuex";
import { selectCoursePage } from "@/api/lessons";
export default {
  name: "courseTable",
  components: { CourseForm: () => import("./components/form/courseForm.vue") },
  inject: ["reload"],
  data() {
    return {
      keyWords: " ",
      loading: false,
      attachmentList: [],
      semesterTime: "",
      whichSemester: "",
      dialogVisible: false,
      temp: [],
      chosenCourseState: null,
      page: {
        currentPage: 1,
        pageSize: 10,
      },
      category: [
        "公益服务劳动",
        "劳动理论学习",
        "日常生活劳动",
        "生产顶岗劳动",
        "其他方式劳动",
      ],
      chosenCategory: null,
      showLessons: [],
      lessonsTotal: null,
      pageTable: [],
      isOpenAddLesson: false,
      isOpenModify: false,
      chosenState: 0,
      courseId: "",
    };
  },
  computed: {
    ...mapGetters(["semesterId"]),
  },
  watch: {
    isOpenAddLesson: {
      handler(newV, oldV) {
        if (!newV) {
          setTimeout(() => {
            this.semesterTime = "";
            this.whichSemester = "";
          }, 400);
        }
      },
    },
  },
  created() {
    this.loadList();
  },
  mounted() {},
  methods: {
    search() {
      this.page.currentPage = 1;
      this.loadList();
    },
    reset() {
      this.keyWords = null;
      this.search();
    },
    clearForm() {
      this.$refs.courseForm.clearFormContext();
    },
    filterChange(value) {
      const type = Object.keys(value)[0];
      if (type === "chosenCategory") {
        let tag = value["chosenCategory"][0];
        tag = typeof tag === "undefined" ? null : tag;
        if (this.chosenCategory != tag) {
          this.chosenCategory = tag;
          this.page.currentPage = 1;
          this.loadList();
        }
      } else if (type === "status") {
        const tag = value["status"][0];
        if (this.chosenState != tag) {
          this.chosenState = tag;
          this.page.currentPage = 1;
          this.loadList();
        }
      }
    },
    handleAddLessonSuccess() {
      this.loadList();
      this.isOpenAddLesson = false;
      this.isOpenModify = false;
    },
    handleFormClose() {
      this.isOpenAddLesson = false;
      setTimeout(() => {
        this.isOpenModify = false;
      }, 300);
    },
    openUpdateLesson(row) {
      this.courseId = row.id;
      this.chosenCourseState = row.state;
      this.isOpenAddLesson = true;
      this.isOpenModify = true;
    },
    delLesson(id) {
      this.$confirm("确认要删除该课程吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delLesson(id)
            .then((res) => {
              this.$message.success("删除成功");
              if (this.showLessons.length == 1 && this.page.currentPage > 1) {
                this.page.currentPage--;
              }
              this.loadList();
            })
            .catch((err) => {
              this.$message.success("遇到错误, 删除失败");
            });
        })
        .catch((e) => {
          this.$message.warning("已取消删除");
        });
    },
    openAddLesson() {
      this.chosenCourseState = null;
      this.isOpenAddLesson = true;
      this.isOpenModify = false;
    },
    loadList() {
      this.loading = true;
      selectCoursePage(
        this.keyWords,
        this.chosenCategory,
        this.page.currentPage,
        this.page.pageSize,
        null,
        null,
        null,
        this.chosenState,
        0
      )
        .then((res) => {
          if (res.code == 200) {
            const { list, total } = res.data;
            this.showLessons = list;
            this.lessonsTotal = Number(total);
          } else {
            this.$message.error("网络异常, 请稍后再试");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    addLesson() {
      this.newLessons.semester = this.semesterTime + this.whichSemester;
      let keys = Object.keys(this.newLessons);
      keys = keys.filter((item) => {
        return (
          item != "attachment" &&
          item != "cover" &&
          item != "courseManager" &&
          item != "ruleContent"
        );
      });
      const flag = keys.some((key) => {
        console.log(`${key}: `, this.newLessons[key]);
        return !this.newLessons[key];
      }); // 附件和封面是可选项
      if (flag) {
        this.$message.warning("请检查信息是否完整、正确");
        return;
      }
      this.newLessons.numberLimit = parseInt(this.newLessons.numberLimit);
      const data = JSON.parse(JSON.stringify(this.newLessons));
      data["semesterId"] = this.semesterId;
      addLesson(data).then((res) => {
        if (res.code == 200) {
          this.$message.success("课程创建成功!");
          this.isOpenAddLesson = false;
          this.loadList();
        } else {
          this.$message.error("网络故障，添加失败");
        }
      });
    },
    seeDetail(id, state) {
      this.$router.push({
        path: "/nested/lessonsManage/lessonDetail",
        query: { id: id, status: state },
      });
    },
    choosePermission() {
      this.isChoosePermission = !this.isChoosePermission;
    },
    handleCurrentChange(currentPage) {
      this.page.currentPage = currentPage;
      this.loadList();
    },
    handleSizeChange(currentSize) {
      this.page.currentSize = currentSize;
      this.loadList();
    },
    examine(id) {
      this.$router.push({
        path: "/nested/examine/examinePage",
        query: { id: id },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-input__inner {
    border-radius: 8px;
  }
  .el-button {
    letter-spacing: 1px;
    padding: 10px 13px 10px 13px;
  }
  .el-input {
    input {
      height: 30px;
    }
  }
  #buttons {
    .el-button {
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 13px;
    }
  }
  .datePicker {
    font-size: 13px;
    .el-input input {
      padding-right: 5px;
    }
  }
  .el-dialog {
    min-width: 759.6px;
  }
  .el-dialog__body {
    padding-bottom: 10px;
  }
  .el-dialog {
    min-width: 1200px;
  }
  #popup {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  .el-col-11 {
    width: 40.833%;
  }
  .el-upload--picture-card {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .uploadCover {
    .el-upload-list__item {
      transition: none;
      width: 100px;
      height: 100px;
    }
  }
  .uploadAttachment {
    .el-upload-list__item {
      width: auto !important;
      height: auto !important;
    }
  }
}
.app-container {
  .toolBar {
    height: 60px;
    padding: 5px 5% 5px 10%;
    width: 100%;
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    transition: box-shadow 0.25s ease-in;
    &:hover {
      box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
    }
    #searchBar {
      display: flex;
      flex-direction: row;

      #keyWords {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 90%;
        color: #838383;
        margin-left: -5px;
      }

      #buttons {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 12%;
        height: 30px;
      }
    }
  }
  .searchBar:hover {
    box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
  }
  #main {
    margin-top: 10px;
    height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0.5% 20px 0.5%;
    background-color: #ffffff;
    transition: box-shadow 0.25s ease-in;
    div {
      margin-bottom: 10px;
    }
    #roleTable {
      width: 100%;
      height: 85%;
      .tools {
        width: 13vw;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    #pageChange {
      margin-top: 20px;
    }
  }
  #main:hover {
    box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
  }
  #rolePermission {
    padding: 2px 0px 2px 15px;
    height: auto;
    min-height: 35px;
    width: 36.5vw;
    min-width: 560.64px;
    border-radius: 8px;
    position: relative;
    margin-left: -120px !important;
    border: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    flex-direction: row;
    transition: border-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    #chosenPermisssionsList {
      display: flex;
      align-items: center;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      width: 95%;
    }
  }
  #rolePermission:hover {
    border-color: #c0c4cc;
    cursor: pointer;
  }
  #triangle {
    position: relative;
    display: inline-block;
    width: 0px;
    height: 0px;
    top: 10px;
    right: 45%;
    z-index: 10;
    border-style: solid;
    border-width: 10px;
    border-color: transparent;
    box-shadow: 2px -2px 2px rgba(0, 0, 0, 0.07);
    transform: rotate(-45deg);
    background-color: white;
  }
  #isConfirm {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
    i {
      margin-right: 20px;
      font-size: 1.5em;
      font-weight: 800;
    }
    i:hover {
      cursor: pointer;
    }
    .close-icon {
      color: #fd6e60;
    }
    .confirm-icon {
      color: #11d757;
    }
  }
  .chosenPermissionsList {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
  }
}
.detailTag:hover {
  cursor: pointer;
  color: #5b9eec;
}
.flex_center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
