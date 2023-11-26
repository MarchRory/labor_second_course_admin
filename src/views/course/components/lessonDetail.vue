<template>
  <div>
    <div
      class="container"
      v-loading="detailLoading"
      v-if="!$route.meta.showEvaluate"
    >
      <div class="mainInfo">
        <div class="cover rounded_rectangle">
          <el-image
            :src="detail.cover || deafaultCover"
            alt="活动封面"
            style="width: 100%; height: inherit"
            fit="cover"
          />
          <div class="mask">
            <div class="baseInfo">
              <div class="name_and_provider">
                <ul style="margin: 0; padding: 0; list-style: none">
                  <li>{{ detail.title }}</li>
                  <li>活动联系方式: {{ detail.contact }}</li>
                  <li>
                    举办单位: &nbsp; {{ detail.organizer }}&nbsp;
                    <span style="margin-left: 20px"
                      >承办单位: {{ detail.undertaker }}</span
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="rightCard rounded_rectangle">
          <div class="">
            <ul>
              <li>
                <h3>二课分类:</h3>
              </li>
              <li>
                <span>{{ detail.courseCategory }}</span>
              </li>
            </ul>
          </div>
          <div class="">
            <ul>
              <li>
                <h3>名额限制:</h3>
              </li>
              <li>
                <span style="color: red">{{ detail.numberLimit }}</span>
              </li>
            </ul>
          </div>
          <div class="">
            <ul>
              <li>
                <h3>学期:</h3>
              </li>
              <li>
                <span>{{ detail.semester }}</span>
                <!-- <span>2023年秋季学期</span> -->
              </li>
            </ul>
          </div>
          <div class="">
            <ul>
              <li>
                <h3>报名时间:</h3>
              </li>
              <li>
                <span style="font-size: 0.5em"
                  >{{ detail.applicationStart }} ~
                  {{ detail.applicationEnd }}</span
                >
              </li>
            </ul>
          </div>
          <div class="">
            <ul>
              <li>
                <h3>活动时间:</h3>
              </li>
              <li>
                <span style="font-size: 0.5em"
                  >{{ detail.hostingStart }} ~ {{ detail.hostingEnd }}</span
                >
              </li>
            </ul>
          </div>
          <div class="">
            <ul>
              <li>
                <h3>操作:</h3>
              </li>
              <li>
                <span style="font-size: 0.5em">
                  <el-button
                    v-permission="['evaluatePage']"
                    v-debounce
                    type="primary"
                    @click="openEvaluateDrawer"
                    >考评</el-button
                  >
                  <!--            todo-->
                  <el-button
                    v-permission="[
                      'curriculum.course.add',
                      'curriculum.course.update',
                    ]"
                    v-debounce
                    type="success"
                    :disabled="detail.state > 3"
                    @click="dialogVisible = true"
                    >导入名单</el-button
                  >
                  <!--  由于移动端扫码需要https而现在没有, 所以只能先把扫码功能搁置了, 后面https域名下来了再开启扫码功能
                        <el-button type="warning" :disabled="status<=2" @click="createQRCode">签到二维码</el-button>
                    -->
                  <el-button
                    v-permission="[
                      'curriculum.signUp',
                      'curriculum.signUp.update',
                    ]"
                    :disabled="detail.state < 2"
                    type="warning"
                    @click="createSignCode"
                    >签到指令码</el-button
                  >
                  <el-button
                    v-permission="[
                      'curriculum.course.student',
                      'curriculum.course.student.get',
                    ]"
                    type="warning"
                    v-if="detail.state > 3"
                    @click="openEditStageForm"
                    >导出结果</el-button
                  >
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="detailInfo">
        <div class="rounded_rectangle card">
          <div style="font-weight: bolder; margin-left: 20px">详细信息</div>
          <el-tooltip
            class="item"
            effect="light"
            :disabled="toolTipDisabled"
            placement="top-start"
          >
            <div
              slot="content"
              class="texts"
              style="width: 300px; height: auto"
            >
              {{ detail.introduction }}
            </div>
            <div
              @mouseover="isEllipsis"
              @mouseleave="checkToolTip"
              style="padding: 10px 10px 10px 20px"
            >
              <div ref="detailInfo" class="texts texts_ellipsis">
                {{ detail.introduction }}
              </div>
            </div>
          </el-tooltip>
        </div>

        <div class="rounded_rectangle card">
          <div style="font-weight: bolder; margin-left: 20px">课程进度</div>
          <div>
            <el-progress
              class="progress"
              type="circle"
              :stroke-width="15"
              :width="130"
              :percentage="percentage"
              :color="progressColor"
              :format="progressFormat"
            >
            </el-progress>
          </div>
        </div>

        <div class="rounded_rectangle card">
          <div style="font-weight: bolder; margin-left: 20px">加分规则</div>
          <div style="padding: 10px 10px 10px 20px">
            <div class="texts">{{ detail.scoringStandards }}</div>
          </div>
        </div>
      </div>
      <div class="detailInfo">
        <div
          class="rounded_rectangle card"
          style="
            width: 32%;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <courseStatistics
            :course-id="courseId"
            :type="1"
            title="自我评价"
          ></courseStatistics>
        </div>
        <div
          class="rounded_rectangle card"
          style="
            width: 32%;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <courseStatistics
            :course-id="courseId"
            :type="0"
            title="课程评价"
          ></courseStatistics>
        </div>
        <div
          class="rounded_rectangle card"
          style="
            width: 32%;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <courseStatistics
            :course-id="courseId"
            :type="2"
            title="教师考评"
          ></courseStatistics>
        </div>
      </div>

      <div class="participantsInfo">
        <div class="comments rounded_rectangle" v-loading="commentsLoadding">
          <div class="comments_guide">
            <div>课程评价</div>
          </div>
          <comments-list :id="courseId" />
        </div>
        <div
          class="stuList rounded_rectangle"
          v-permission="['curriculum.course.student']"
        >
          <div class="list_name">
            <i class="el-icon-user-solid" style="margin-right: 10px"></i>
            报名列表
          </div>
          <div
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              height: 100%;
            "
          >
            <el-table
              v-loading="stuTableLoad"
              :data="stuList"
              stripe
              height="100%"
              size="medium"
              style="width: 100%"
            >
              <el-table-column
                prop="studentId"
                label="学号"
                align="center"
                min-width="160"
              >
              </el-table-column>
              <el-table-column
                prop="name"
                label="姓名"
                align="center"
                min-width="175"
              >
              </el-table-column>
            </el-table>
            <div style="height: 10%; display: flex; align-items: center">
              <el-pagination
                small
                @current-change="handleCurrentChange"
                :current-page.sync="page.currentPage"
                :page-size="page.pageSize"
                layout="total, prev, pager, next, jumper"
                :total="stuList.length"
              >
              </el-pagination>
            </div>
          </div>
        </div>
      </div>
      <!--    考评列表-->
      <!-- <div>
        <el-drawer title="课程考评" size="70%" :visible.sync="drawer">
          <course-evaluate-drawer :course-id="parseInt(courseId)" />
        </el-drawer>
      </div> -->

      <el-dialog
        class="qrDialog"
        title="学生名单上传"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="30%"
        :before-close="handleClose"
        center
      >
        <div style="display: flex; flex-direction: column; align-items: center">
          <el-upload
            drag
            :action="uploadUrl"
            :before-upload="handelUpload"
            multiple
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div class="el-upload__tip" style="font-size: 15px" slot="tip">
              学生信息应包括: <strong>学号、学生姓名</strong>
            </div>
            <div
              class="el-upload__tip"
              style="color: red; margin-top: 10px"
              slot="tip"
            >
              只能上传jpg/png文件, 且不超过500kb
            </div>
          </el-upload>
          <span
            slot="footer"
            class="dialog-footer"
            style="
              width: 150px;
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            "
          >
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button v-debounce type="success" @click="dialogVisible = false"
              >确定</el-button
            >
          </span>
        </div>
      </el-dialog>

      <el-dialog
        v-if="false"
        class="qrDialog"
        :append-to-body="true"
        title="签到二维码"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="25%"
        :visible.sync="QRDialogVisible"
      >
        <div class="qrBox">
          <div class="qrInfo" v-loading="qrLoading">
            <vue-qr
              ref="qrCode"
              :text="qrText"
              :correctLevel="3"
              backgroundColor="white"
              colorLight="white"
              colorDark="black"
              :logoSrc="defaultQRLogo"
              :logoMargin="5"
              :size="200"
            />
            <div style="color: red">本次有效期30分钟, 请及时使用</div>
          </div>
          <div class="qrTools">
            <el-button v-debounce @click="downloadQr"> 下载二维码 </el-button>
            <el-button v-debounce @click="refreashQr" type="success">
              刷新二维码
            </el-button>
            <el-button type="danger" @click="QRDialogVisible = false">
              取消
            </el-button>
          </div>
        </div>
      </el-dialog>

      <el-dialog
        class="qrDialog"
        :append-to-body="true"
        title="签到指令码"
        v-loading="qrLoading"
        width="25%"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="signCodeVisible"
      >
        <div class="qrBox">
          <div class="qrInfo" v-loading="qrLoading">
            <div class="signCode">{{ signCode }}</div>
            <div style="color: red">
              本次有效期30分钟, 且15分钟内不可重复生成, 请及时使用
            </div>
            <el-statistic
              ref="statistic"
              format="mm:ss"
              :value="deadline"
              time-indices
            >
              <template slot="suffix">后签到码失效</template>
            </el-statistic>
          </div>
          <div class="qrTools">
            <el-button
              @click="refreshCode"
              :disabled="detail.state > 2 && codeChangeDisabled"
              type="success"
            >
              刷新签到码
            </el-button>
            <el-button type="danger" @click="signCodeVisible = false">
              关闭
            </el-button>
          </div>
        </div>
      </el-dialog>
      <stage-form
        v-if="detail.state == 4"
        :is-open="isOpenEditSatgeForm"
        :course-id="courseId"
        :course-name="detail.title"
        @onClose="handleStageFormClose"
      />
    </div>
    <router-view v-else />
  </div>
</template>

<script>
import {
  getLessonDetail,
  getStudentList,
  uploadUserToCourse,
} from "@/api/lessons";
import { getRandomCode } from "@/api/common";
import { sendSignCode } from "@/api/examine/examine";
import VueQr from "vue-qr";
export default {
  name: "courseDetail",
  components: {
    CourseStatistics: () => import("./courseStatistics.vue"),
    CourseEvaluateDrawer: () => import("../evaluate/index.vue"),
    commentsList: () => import("@/components/comments/index.vue"),
    VueQr,
    StageForm: () => import("./form/stageForm.vue"),
  },
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + "/data/file/upload",
      deadline: null,
      codeDisabledTimer: null,
      codeChangeDisabled: false,
      codeTimer: null,
      signCode: null,
      signStamp: null,
      signCodeVisible: false,
      commentsLoadding: false,
      detailLoading: true,
      dialogVisible: false,
      qrLoading: false,
      QRDialogVisible: false,
      qrText: "",
      qrTextCopy: {
        courseId: null,
        timestamp: null,
      },
      qrLogo: "",
      qrTimeRange: null,
      defaultQRLogo: require("@/assets/swpu_Logo/logo_blue.jpg"),
      courseId: null,
      deafaultCover:
        "https://img2.baidu.com/it/u=3287115334,1498982333&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=281",
      detail: {
        cover: "",
        id: null,
        title: "",
        semesterId: null,
        numberLimit: null,
        courseManager: null,
        courseLocation: "",
        applicationStart: "",
        applicationEnd: "",
        hostingEnd: "",
        hostingStart: "",
        courseCategory: "",
        pointsRules: "",
        ruleContent: "",
        scoringStandards: "",
        organizer: "",
        undertaker: "",
        introduction: "",
        contact: "",
        attachment: "",
        state: -1,
      },
      stuList: [],
      stuTotal: 0,
      stuTableLoad: false,
      state: null,
      progressStatus: null,
      percentage: 0,
      progressColor: "",
      toolTipDisabled: false,
      page: {
        currentPage: 1,
        pageSize: 25,
      },
      commentsChoice: 0,
      createQRVisible: false,
      isOpenEditSatgeForm: false,
    };
  },
  created() {
    if (!this.$route.meta.showEvaluate && this.$route.query.id) {
      this.getSignCodeDisabledStatus();
    }
  },
  computed: {
    status() {
      return this.$route.query.status == this.detail.state
        ? this.$route.query.status
        : this.detail.state;
    },
  },
  mounted() {
    if (!this.$route.meta.showexam) {
      this.courseId = this.$route.query.id;
      this.qrTextCopy.courseId = this.courseId;
      if (this.status == 1) {
        this.percentage = 25;
        this.progressColor = "#69e7ee";
        this.state = "筹备中";
        this.progressStatus = null;
      } else if (this.status == 2) {
        this.percentage = 50;
        this.progressColor = "rgb(230, 162, 60)";
        this.state = "报名中";
        this.progressStatus = "warning";
      } else if (this.status == 3) {
        this.percentage = 75;
        this.progressColor = "rgb(19, 206, 102)";
        this.state = "进行中";
        this.progressStatus = "success";
      } else {
        this.percentage = 100;
        this.progressColor = "#f56969";
        this.state = "已结束";
        this.progressStatus = "exception";
      }
      if (this.courseId) {
        this.loadLessonDetail();
        this.loadStuList();
      }
    }
  },
  beforeDestroy() {
    if (this.codeTimer || this.codeDisabledTimer) {
      clearInterval(this.codeTimer);
      clearInterval(this.codeDisabledTimer);
    }
  },
  watch: {},
  methods: {
    checkToolTip() {
      return this.toolTipDisabled === true ? false : true;
    },
    handelUpload(file) {
      uploadUserToCourse(this.courseId, file).then((res) => {
        this.$message.success("上传成功");
      });
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(() => {
          done();
        })
        .catch(() => {});
    },
    openEvaluateDrawer() {
      this.$router.push({
        name: "introduction",
        query: {
          id: this.courseId,
          status: this.detail.state,
        },
      });
      this.$forceUpdate();
    },
    isEllipsis() {
      let pHeight = this.$refs.detailInfo.parentNode.offsetHeight;
      let itsHeight = this.$refs.detailInfo.offsetHeight;
      this.toolTipDisabled = pHeight > itsHeight;
    },
    loadLessonDetail() {
      this.detailLoading = true;
      getLessonDetail(this.courseId)
        .then((res) => {
          if (res.code == 200) {
            this.detail = res.data;
            if (!this.detail.cover) {
              this.detail.cover = this.deafaultCover;
            }
          } else {
            this.$message.error("网络异常, 获取课程详细信息失败");
            this.$router.back();
          }
        })
        .finally(() => {
          this.detailLoading = false;
        });
    },
    loadStuList() {
      this.stuTableLoad = true;
      getStudentList(
        this.courseId,
        this.page.currentPage,
        this.page.pageSize,
        1,
        -2
      )
        .then((res) => {
          if (res.code == 200) {
            const { list, total } = res.data;
            this.stuList = list;
            this.stuTotal = total;
          } else {
            this.$message.error("报名者信息获取失败");
          }
        })
        .finally(() => {
          this.stuTableLoad = false;
        });
    },
    handleCurrentChange(currentPage) {
      this.page.currentPage = currentPage;
      this.loadStuList();
    },
    progressFormat(percentage) {
      let status = this.$route.query.status;
      if (status == 1) {
        return "筹备中";
      } else if (status == 2) {
        return "报名中";
      } else if (status == 3) {
        return "进行中";
      } else {
        return "已结束";
      }
    },
    downloadQr() {
      const qrcodeSrc = document.createElement("a");
      qrcodeSrc.download = "二课签到二维码";
      qrcodeSrc.href = this.$refs.qrCode.$el.src;
      qrcodeSrc.click();
    },
    refreashQr() {
      this.qrLoading = true;
      let timestampNow = new Date().getTime();
      // 二维码有效期半小时
      this.qrTextCopy.timestamp = timestampNow + 1000 * 60 * 30;
      this.qrText = JSON.stringify(this.qrTextCopy);
      this.qrLoading = false;
      this.$message.success("签到二维码已更新");
    },
    createQRCode() {
      let timeTool = new Date();
      let timestampNow = timeTool.getTime();
      this.QRDialogVisible = true;
      // 初次打开或者二维码过时, 刷新二维码
      if (
        this.qrTextCopy.timestamp == null ||
        timestampNow >= this.qrTextCopy.timestamp + 1000 * 60 * 30
      ) {
        this.refreashQr();
      }
    },
    refreshCode() {
      if (!this.courseId) return;
      if (this.codeTimer || this.codeDisabledTimer) {
        clearInterval(this.codeTimer);
        clearInterval(this.codeDisabledTimer);
      }
      this.codeChangeDisabled = true;
      this.qrLoading = true;
      // 签到码有效期半小时
      let newCode = getRandomCode(6);
      sendSignCode(this.$route.query.id, newCode, 60 * 30, 1)
        .then((res) => {
          if (res.code === 200) {
            this.signCode = newCode;
            this.deadline = new Date().getTime() + 1000 * 60 * 30;
            this.setSignCodeDisabledStatus(
              true,
              new Date().getTime() + 1000 * 60 * 30,
              newCode
            );
            this.codeTimer = setInterval(() => {
              this.refreshCode();
            }, 1000 * 60 * 30);
            this.codeDisabledTimer = setInterval(() => {
              this.codeChangeDisabled = false;
              this.setSignCodeDisabledStatus(
                false,
                new Date().getTime() + 1000 * 60 * 15,
                newCode
              );
            }, 1000 * 60 * 15);
            this.$message.success("签到码更新成功");
          } else {
            this.$message.error("网络异常, 签到码同步更新失败, 请稍后重试");
          }
        })
        .finally(() => {
          this.qrLoading = false;
        });
    },
    createSignCode() {
      this.signCodeVisible = true;
      // 初次打开或者二维码过时, 刷新二维码
      if (!this.codeTimer) {
        this.refreshCode();
      }
    },
    getSignCodeDisabledStatus() {
      let res = localStorage.getItem(
        `signCode?courseid=${this.$route.query.id}`
      );
      res = JSON.parse(res);
      // 有存储记录
      if (res) {
        let now = new Date().getTime();
        if (
          this.$route.query.status > 3 &&
          now > res.expireTime + 1000 * 60 * 30
        ) {
          // 课程结束超过30mins, 再次进入界面则清除记录
          localStorage.removeItem(`signCode?courseid=${this.$route.query.id}`);
          return;
        }
        if (now < res.expireTime) {
          this.signCode = res.code;
          this.deadline = res.expireTime;
          if (!this.codeTimer) {
            this.codeTimer = setInterval(() => {
              this.refreshCode();
            }, res.expireTime - now);
          }
          if (!this.codeDisabledTimer) {
            this.codeDisabledTimer = setInterval(() => {
              this.setSignCodeDisabledStatus(
                false,
                new Date().getTime() + res.expireTime - now
              );
            }, res.expireTime - now);
          }
        }
        this.codeChangeDisabled = res.expireTime - now > 1000 * 60 * 15;
      } else {
        // 无存储记录则获取
        sendSignCode(this.$route.query.id).then((result) => {
          const { data } = result;
          // time===2 -> 没有有效码, 其他是存在有效码
          if (data.time > 0) {
            let obj = {
              code: data.code,
              courseId: this.$route.query.id,
              isDisabled: data.time <= 1500,
              expireTime: new Date().getTime() + data.time,
            };
            localStorage.setItem(
              `signCode?courseid=${this.$route.query.id}`,
              JSON.stringify(obj)
            );
            this.codeChangeDisabled = data.time <= 1500;
            this.codeTimer = setInterval(() => {
              this.refreshCode();
            }, 1000 * data.time);

            // 有效期超过半小时
            if (this.codeChangeDisabled) {
              setInterval(() => {
                this.setSignCodeDisabledStatus(
                  false,
                  new Date().getTime() + 1000 * (data.time - 1500),
                  this.signCode
                );
              }, 1000 * (data.time - 1500));
            }
            this.signCode = data.code ?? null;
          } else {
            this.codeChangeDisabled = false;
          }
        });
      }
    },
    setSignCodeDisabledStatus(status, deadline, code = null) {
      this.codeChangeDisabled = status;
      let obj = {
        code: code, // 码
        courseId: this.$route.query.id, // 所属课程id
        isDisabled: status, // 当前是否有效（可选）
        expireTime: deadline, // 签到码有效期截止时间戳
      };
      localStorage.setItem(
        `signCode?courseid=${this.$route.query.id}`,
        JSON.stringify(obj)
      );
    },
    openEditStageForm() {
      this.isOpenEditSatgeForm = true;
    },
    handleStageFormClose() {
      this.isOpenEditSatgeForm = false;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .qrDialog {
    .el-dialog {
      min-width: 240px !important;
    }
  }
}
.el-dialog__wrapper {
  min-width: 100px;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.texts_ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 250px;
  -webkit-line-clamp: 9;
  text-overflow: ellipsis;
}
.texts {
  font-size: 0.7em;
  color: rgba(70, 69, 69, 0.719);
  line-height: normal;
  word-break: break-all;
  letter-spacing: 1px;
}
.container {
  width: 100%;
  height: 100%;
  min-width: 686.66px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-wrap: wrap;
  padding: 30px 50px;
  margin: 0;
  .mainInfo {
    display: flex;
    justify-content: space-between;
    width: 100%;
    .cover {
      width: 66%;
      height: 80vh;
      min-height: 400px;
      .mask {
        position: relative;
        width: 100%;
        height: 80vh;
        min-height: 400px;
        top: -103%;
        background: linear-gradient(to top, #00000098, transparent);
        .status {
          position: absolute;
          left: 80%;
          top: 3%;
          min-height: 130px;
          min-width: 130px;
          div {
            position: relative;
            color: white;
            font-size: 25px;
            font-weight: bold;
            letter-spacing: 2px;
            left: 18%;
            bottom: 67px;
            transform: rotate(27deg);
          }
        }
        .baseInfo {
          color: white;
          position: relative;
          top: 70%;
          left: 5%;
          .name_and_provider {
            ul > li:first-child {
              font-size: 36px;
              font-weight: 700;
              letter-spacing: 1px;
              margin-bottom: 14px;
              line-height: normal;
              word-break: break-all;
            }
            ul > li:nth-child(2) {
              font-size: 18px;
              font-weight: 500;
            }
            ul > li:last-child {
              font-size: 18px;
              font-weight: 600;
              margin-top: 8px;
              letter-spacing: 1px;
            }
          }
        }
      }
    }
    .rightCard {
      width: 32%;
      height: 80vh;
      min-height: 572px;
      display: flex;
      flex-direction: column;
      cursor: default;
      div {
        width: 100%;
        height: 20%;
        padding: 5px;
        h3 {
          margin-left: 10%;
          position: relative;
          top: -8px;
        }
        ul > li:nth-child(2) {
          font-size: 1.5em;
          font-weight: 700;
          position: relative;
          top: -12px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
  .detailInfo {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 20px;
    width: 100%;
    height: auto;
    .card {
      width: 32%;
      height: 30vh;
      min-height: 200px;
      max-height: 290px;
      padding: 20px;
      .progress {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 25px;
      }
    }
  }
  .participantsInfo {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 20px;
    .list_name {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 30px;
      margin-top: 15px;
      width: 100%;
      height: 50px;
      font-size: 20px;
      font-weight: 700;
    }
    .stuList {
      width: 32%;
      height: 620px;
      display: flex;
      flex-direction: column;
    }
    .comments {
      width: 66%;
      height: auto;
      min-height: 400px;
      padding-bottom: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      .comments_guide {
        display: flex;
        flex-direction: row;
        padding-left: 40px;
        padding-top: 30px;
        div {
          margin-right: 10px;
          font-size: 20px;
          font-weight: bold;
          transition: all 0.15s ease-in;
          cursor: pointer;
        }
      }
    }
  }
}
.qrBox {
  display: flex;
  flex-direction: column;
  .qrInfo {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .signCode {
      font-size: 60px;
      margin-bottom: 20px;
      letter-spacing: 5px;
    }
    ::v-deep {
      .el-statistic .con {
        font-size: 20px;
        display: flex;
        align-items: center;
        margin-top: 30px;
        .number {
          font-size: 30px;
        }
      }
    }
  }
  .qrTools {
    margin-top: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.rounded_rectangle {
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.01), 0 0 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: solid 4px transparent;
  transition: all 0.2s ease-in;
  &:hover {
    border-color: #d1d7fff2;
  }
}
</style>
