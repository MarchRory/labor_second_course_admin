<template>
  <div
    v-permission="['curriculum.evaluate', 'curriculum.signUp.update']"
    style="height: calc(100vh - 70px)"
  >
    <el-row :gutter="20">
      <el-col :span="6" :offset="0">
        <el-card>
          <div slot="header">
            学生列表
            <el-button
              style="color: #30d0c4"
              type="text"
              icon="el-icon-refresh"
              @click="loadStudentList"
              >刷新</el-button
            >
            <el-select
              v-model="evaluateType"
              @change="handleEvaluateTypeChange"
            >
              <el-option :value="0" :label="'未考评'">未考评</el-option>
              <el-option :value="-1" :label="'全部'">全部</el-option>
              <el-option :value="1" :label="'已考评'">已考评</el-option>
            </el-select>
          </div>
          <div class="card card-height">
            <div class="card-content" style="height: 100%">
              <!--            <el-card shadow="hover" class="user-info-card" tabindex="2" v-for="student in studentList" @click.native="onStudentClick(student.userId)">-->
              <!--              {{student.studentId}} {{student.name}}<el-tag>完成</el-tag>-->
              <!--            </el-card>-->
              <el-table
                ref="studentTable"
                :data="studentList"
                v-loading="userListLoad"
                highlight-current-row
                @current-change="handleCurrentChange"
                style="width: 100%; height: 90%"
              >
                <el-table-column type="index" min-width="40" label="序号">
                </el-table-column>
                <el-table-column property="studentId" label="学号">
                </el-table-column>
                <el-table-column property="name" label="姓名">
                </el-table-column>
              </el-table>
              <el-pagination
                style="margin-top: 10px; width: fit-content; margin: 20px auto"
                @size-change="handleSizeChange"
                @current-change="loadStudentList"
                layout="total, prev, pager, next,sizes"
                :pager-count="5"
                :current-page.sync="currentPage"
                :page-sizes="[10, 15, 20, 25]"
                :total="total"
              >
              </el-pagination>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card shadow="hover" class="card_height" v-loading="userLoad">
          <div slot="header">
            <span
              >考评详情
              <el-popover
                placement="top-start"
                width="200"
                trigger="click"
                :content="helpMsg"
              >
                <i class="el-icon-warning-outline" slot="reference"></i>
              </el-popover>
            </span>
            <el-row>
              <el-col :span="6">
                <el-statistic
                  group-separator=","
                  decimal-separator="."
                  title="报名人数"
                >
                  <template slot="prefix">
                    <i class="el-icon-s-flag" style="color: blueviolet"></i>
                    <span class="statisticNumber">{{ signUpCount }}</span>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="6">
                <el-statistic
                  group-separator=","
                  decimal-separator="."
                  title="参加人数"
                >
                  <template slot="prefix">
                    <i class="el-icon-s-flag" style="color: red"></i>
                    <span class="statisticNumber">{{ passCount }}</span>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="6">
                <el-statistic
                  group-separator=","
                  decimal-separator="."
                  title="自评"
                >
                  <template slot="prefix">
                    <i class="el-icon-s-flag" style="color: green"></i>
                    <span class="statisticNumber">{{ selfEvaluateCount }}</span>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="6">
                <el-statistic
                  group-separator=","
                  decimal-separator="."
                  title="已考评"
                >
                  <template slot="prefix">
                    <i class="el-icon-s-flag" style="color: yellow"></i>
                    <span class="statisticNumber">{{ evaluateCount }}</span>
                  </template>
                </el-statistic>
              </el-col>
            </el-row>
          </div>
          <div class="info-card">
            <div class="card-content" v-if="evaluatable">
              <div>
                <el-descriptions title="学生信息" :column="3">
                  <el-descriptions-item label="学号">{{
                    courseEvaluate.createBy.studentId
                  }}</el-descriptions-item>
                  <el-descriptions-item label="姓名">{{
                    courseEvaluate.createBy.name
                  }}</el-descriptions-item>
                  <el-descriptions-item label="自我评分"
                    ><el-tag type="danger" size="small">{{
                      courseEvaluate.score
                    }}</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
                <el-card>
                  <div slot="header">
                    <span>自我评价</span>
                  </div>
                  <div class="self-card">
                    <div class="card-content">
                      <article
                        style="
                          text-indent: 2em;
                          line-height: 27px;
                          pointer-events: none;
                        "
                        v-html="courseEvaluate.evaluateText"
                      ></article>
                    </div>
                  </div>
                </el-card>
              </div>
              <el-row>
                <el-col :span="24">
                  <el-card shadow="hover" :body-style="{ height: '325px' }">
                    <div slot="header">
                      <span>教师评价</span>
                      <div style="float: right">
                        得分:
                        <el-input-number
                          v-show="courseEvaluate.evaluationStatus != 1"
                          style="margin-right: 20px"
                          :min="0"
                          :max="100"
                          size="mini"
                          v-model="evaluateInfo.score"
                        >
                        </el-input-number>

                        <el-tooltip
                          v-show="courseEvaluate.evaluationStatus != 1"
                          class="item"
                          effect="dark"
                          content="模板内容与得分相关联"
                          placement="top-end"
                        >
                          <el-button type="text" @click="openTemplateListDrawer"
                            >选择考评模板<i class="el-icon-d-arrow-right"></i
                          ></el-button>
                        </el-tooltip>
                        <el-tag
                          v-show="courseEvaluate.evaluationStatus == 1"
                          type="primary"
                          size="small"
                          >{{ courseEvaluate.teacherScore }}</el-tag
                        >
                      </div>
                    </div>
                    <div v-loading="templateLoad">
                      <evaluate-template
                        v-if="courseEvaluate.evaluationStatus != 1"
                        style="text-indent: 2em"
                        ref="evaluateText"
                        :is-edit="isEvaluateUpdate"
                        :is-use-right-menu="false"
                        :template-text="evaluateInfo.evaluate"
                        @onChange="handleReceiveTemplateUpdate"
                        @onInsertText="handleGetInsertParams"
                      />
                      <article
                        v-else
                        v-html="courseEvaluate.teacherEvaluate"
                        style="text-indent: 2em"
                      />
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
            <el-empty description="当前没有需要评价的学生" v-else></el-empty>
          </div>
          <el-button
            v-permission="['curriculum.signUp.update']"
            class="btn"
            v-debounce
            type="primary"
            style="transition: opacity 0.3s ease-in"
            :style="{
              opacity: isSubmitVisible ? 1 : 0,
            }"
            @click="handleEvaluate"
            >完成考评</el-button
          >
          <!--        <el-button @click="setNext">下一个</el-button>-->
        </el-card>
      </el-col>
    </el-row>
    <template-list
      :level="vocabularySearchParmas.level"
      :visible="templateListDrawerVisible"
      :has-template-edited="hasTemplateEdited"
      @onChange="handleReceiveTemplate"
      @onClose="handleTemplateDrawerClose"
    />
    <vocabulary-list
      :is-visible="vocabularyListVisible"
      :search-params="vocabularySearchParmas"
      :type-description="chosenVocabularyDescription"
      @onChange="handleReceiveVocabulary"
      @onClose="handleCloseVocabularyPage"
    />
  </div>
</template>

<script>
import { evaluate } from "@/api/examine/examine";
import { getEvaluation } from "@/api/selfEvaluate";
import { getStudentList } from "@/api/lessons";
export default {
  name: "introduction",
  components: {
    EvaluateTemplate: () =>
      import("@/components/templateCreatedArea/index.vue"),
    TemplateList: () => import("./components/templateList.vue"),
    VocabularyList: () => import("./components/vocabulary.vue"),
  },
  data() {
    return {
      reg: null,
      courseId: -1,
      helpMsg:
        "在学生列表选择未考评状态时,点击完成考评可以直接跳转到下一位考评的学生信息",
      total: 0,
      currentPage: 1,
      pageSize: 5,
      templateCardHeight: 100,
      selfEvaluateCount: 0,
      signUpCount: 0,
      evaluateCount: 0,
      passCount: 0,
      evaluateType: 0,
      evaluatable: false,
      userListLoad: true,
      userLoad: false,
      isEvaluateUpdate: true,
      hasTemplateEdited: false,
      templateListDrawerVisible: false,
      templateLoad: false,
      evaluateInfo: {
        userId: "",
        evaluate: "",
        score: 90,
      },
      studentList: [],
      courseEvaluate: {
        evaluateText: "",
        score: 0,
        createBy: {
          userId: 1,
          studentId: "",
          name: "",
        },
      },
      vocabularyListVisible: false,
      vocabularySearchParmas: {
        level: -1,
        typeId: -1,
        partOfSpeech: -1,
      },
      chosenVocabularyDescription: "",
      modifiedDOM: null,
    };
  },
  mounted() {
    window.insertText = this.insertText;
  },
  watch: {
    "$route.query.id": {
      handler(newVal) {
        this.courseId = newVal;
        this.loadStudentList();
      },
      immediate: true,
    },
    "evaluateInfo.userId": {
      handler(n, o) {
        if (n == "" || !n) {
          return;
        }
        this.loadStudentEvaluate();
      },
      immediate: true,
    },
    "evaluateInfo.evaluate": {
      handler(newVal, oldVal) {
        this.hasTemplateEdited = newVal != "";
      },
    },
  },
  computed: {
    currentUserIndex() {
      for (let i = 0; i < this.studentList.length; i++) {
        if (this.evaluateInfo.userId === this.studentList[i].userId) {
          return i;
        }
      }
      return -1;
    },
    isSubmitVisible() {
      /*       if (this.studentList.length) {
        if (this.evaluateType == 0) return 1;
        else if (this.evaluateType == 1) return 0;
        else {
          return this.courseEvaluate.evaluationStatus != 1;
        }
      } else {
        return 0;
      } */
      return this.studentList.length !== 0 && this.evaluatable;
    },
  },
  methods: {
    handleEvaluateTypeChange(e) {
      let fn = () => {
        if (this.studentList.length) {
          this.evaluatable = false;
          this.loadStudentEvaluate();
        }
      };
      this.loadStudentList(fn);
    },
    insertText(e, params) {
      return;
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.loadStudentList();
    },
    setNext() {
      if (this.currentUserIndex < this.studentList.length) {
        this.$refs.studentTable.setCurrentRow(
          this.studentList[this.currentUserIndex + 1]
        );
      }
    },
    async handleEvaluate() {
      let originEvaluateHTML = await this.$refs.evaluateText.getDOM();
      if (this.reg == null) {
        this.reg = /<input[^>]*?value=[\"\'](.*?)[\"\'][^>]*>/i;
      }
      this.evaluateInfo.evaluate = await originEvaluateHTML.replace(
        this.reg,
        "$1"
      );
      evaluate({
        courseId: this.courseId,
        ...this.evaluateInfo,
      }).then((res) => {
        this.$message.success("已完成对该学生考评");
        this.loadStudentList();
      });
    },
    handleCurrentChange(data) {
      if (!data) {
        this.loadStudentList();
        return;
      }
      this.evaluateInfo.userId = data.userId;
    },
    handleTemplateDrawerClose(val) {
      this.templateListDrawerVisible = val;
    },
    loadStudentList(finallyFn = null) {
      this.evaluatable = false;
      this.userListLoad = true;
      this.studentList = [];
      getStudentList(
        this.courseId,
        this.currentPage,
        this.pageSize,
        1,
        this.evaluateType
      )
        .then((res) => {
          const { data } = res;
          this.studentList = data.list;
          Object.keys(data)
            .filter((key) => key != "list")
            .forEach((key) => {
              if (key != "total") {
                this[key] = data[key];
              } else {
                this[key] = parseInt(data[key]);
              }
            });
          if (this.studentList.length > 0) {
            let studentListElement = this.studentList[0];
            this.$refs.studentTable.setCurrentRow(studentListElement);
            this.evaluateInfo.userId = studentListElement.userId;
          }
        })
        .finally(() => {
          this.userListLoad = false;
          if (finallyFn) {
            finallyFn();
          }
        });
    },
    loadStudentEvaluate() {
      if (!this.evaluateInfo.userId) {
        return;
      }
      this.userLoad = true;
      this.courseEvaluate = {};
      getEvaluation(this.courseId, this.evaluateInfo.userId)
        .then((res) => {
          const { data } = res;
          this.courseEvaluate = data;
          this.evaluatable = true;
          this.evaluateInfo.evaluate = data.teacherEvaluate;
          this.score = data.teacherScore;
        })
        .finally(() => {
          this.userLoad = false;
        });
    },
    handleGetInsertParams(e, params) {
      if (this.templateListDrawerVisible) {
        return;
      }
      this.modifiedDOM = e.target;
      this.vocabularySearchParmas.level = Math.floor(
        this.evaluateInfo.score / 10
      );
      this.vocabularySearchParmas.typeId = params.typeId;
      this.vocabularySearchParmas.partOfSpeech = params.partOfSpeech;
      this.chosenVocabularyDescription = params.word;
      this.vocabularyListVisible = true;
    },
    handleReceiveTemplate(templateText) {
      this.evaluateInfo.evaluate = templateText;
    },
    handleReceiveTemplateUpdate(evaluateTemplateHTML) {
      this.evaluateInfo.evaluate = evaluateTemplateHTML;
    },
    openTemplateListDrawer() {
      this.vocabularySearchParmas.level = Math.floor(
        this.evaluateInfo.score / 10
      );
      this.templateListDrawerVisible = true;
    },
    handleReceiveVocabulary(word) {
      this.modifiedDOM.value = word;
    },
    handleCloseVocabularyPage(val) {
      this.vocabularyListVisible = val;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-table__body tr.current-row > td {
  background: rgba(103, 177, 253, 0.82) !important;
}
::v-deep {
  .el-select {
    .el-input {
      .el-select__caret {
        display: flex;
        align-items: center;
      }
    }
  }
}
.card {
  /* 设置 el-card 的最大高度为视口高度的80% */
  min-height: 70vh;
  /* 设置内容溢出时出现垂直滚动条 */
  overflow-y: auto;
  overflow-x: hidden;
}
.card-height {
  height: calc(100vh - 220px);
}
.card-content {
  /* 设置内容区域可以溢出容器 */
  flex: 1;
  /* 可选：添加额外样式以适应特定需求 */
  padding: 10px;
}
.info-card {
  /* 设置 el-card 的最大高度为视口高度的65% */
  height: 66vh;
  /* 设置内容溢出时出现垂直滚动条 */
  overflow-y: auto;
}
.btn {
  position: relative;
  left: 91%;
}
.Template-card {
  /* 设置 el-card 的最大高度为视口高度的80% */
  max-height: 40vh;
  /* 设置内容溢出时出现垂直滚动条 */
  overflow-y: auto;
}
.self-card {
  /* 设置 el-card 的最大高度为视口高度的80% */
  max-height: 30vh;
  /* 设置内容溢出时出现垂直滚动条 */
  overflow-y: auto;
}
.user-info-card {
  margin-bottom: 2px;
}
.user-info-card:focus {
  background-color: #409eff;
}
.statisticNumber {
  font-size: 20px;
  padding: 0 4px;
}
</style>
