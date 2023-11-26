<template>
  <div
    v-permission="['curriculum.course.update', 'curriculum.course.add']"
    style="display: flex; justify-content: space-around; flex-direction: row"
  >
    <div>
      <el-form
        ref="ruleForm1"
        :model="course"
        label-width="120px"
        label-position="left"
        :rules="rules"
        v-loading="formLoading"
      >
        <el-form-item label="课程名称" prop="title">
          <div id="title">
            <el-input
              v-model.trim="course.title"
              style="width: 94%"
              type="text"
              placeholder="请输入课程名"
            />
          </div>
        </el-form-item>
        <el-form-item label="审核方式" prop="auditPolicy">
          <div id="title">
            <el-switch
              v-model="course.auditPolicy"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="自动审核"
              inactive-text="手动审核"
              :active-value="1"
              :inactive-value="0"
            />
          </div>
        </el-form-item>
        <el-form-item label="学期" prop="semesterId">
          <div id="title">
            <el-select
              v-model="course.semesterId"
              style="width: 46%"
              collapse-tags
              placeholder="请选择学期"
            >
              <el-option
                v-for="(semester, index) in semesterList"
                :key="index"
                :label="semester.semesterName"
                :value="semester.id"
              />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="课程类型" prop="courseCategory">
          <el-select
            v-model="course.courseCategory"
            placeholder="请选择课程类型"
            style="width: 46%"
          >
            <el-option
              v-for="(item, index) in category"
              :key="index"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报名时间" prop="applicationStart">
          <el-col :span="11">
            <el-date-picker
              v-model="course.applicationStart"
              class="datePicker"
              style="width: 108%"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择报名开始时间"
            />
          </el-col>
          <el-col
            class="line"
            style="
              display: flex;
              justify-content: center;
              align-items: center;
              position: relative;
              left: 1.5%;
            "
            :span="2"
          >
            至
          </el-col>
          <el-col :span="11">
            <el-date-picker
              v-model="course.applicationEnd"
              class="datePicker"
              style="width: 108%"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择报名结束时间"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="活动时间" prop="hostingStart">
          <el-col :span="11">
            <el-date-picker
              v-model="course.hostingStart"
              class="datePicker"
              style="width: 108%"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择活动开始时间"
            />
          </el-col>
          <el-col
            class="line"
            style="
              display: flex;
              justify-content: center;
              align-items: center;
              position: relative;
              left: 1.5%;
            "
            :span="2"
          >
            至
          </el-col>
          <el-col :span="11">
            <el-date-picker
              v-model="course.hostingEnd"
              class="datePicker"
              style="width: 108%"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择活动结束时间"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="积分规则" prop="pointsRules">
          <div id="title">
            <el-input
              v-model.trim="course.pointsRules"
              style="width: 93%"
              type="text"
              placeholder="积分规则, 如: 公益劳动课程4分"
            />
          </div>
        </el-form-item>
        <el-form-item label="计分标准" prop="scoringStandards">
          <div id="title">
            <el-input
              v-model.trim="course.scoringStandards"
              style="width: 93%"
              type="text"
              placeholder="计分标准, 如: 一次活动+4分, 每学期上限2次"
            />
          </div>
        </el-form-item>
        <el-form-item label="详细信息" prop="introduction">
          <div id="title">
            <el-input
              v-model.trim="course.introduction"
              style="width: 400px"
              maxlength="300"
              type="textarea"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-form
        ref="ruleForm2"
        :model="course"
        label-width="120px"
        label-position="left"
        :rules="rules"
      >
        <el-form-item label="人数限制" prop="numberLimit">
          <div id="title">
            <el-input
              v-model.number="course.numberLimit"
              style="width: 400px"
              type="text"
            />
          </div>
        </el-form-item>
        <el-form-item label="地点" prop="courseLocation">
          <div id="title">
            <el-input
              v-model.trim="course.courseLocation"
              style="width: 400px"
              type="text"
            />
          </div>
        </el-form-item>
        <el-form-item label="主办单位" prop="organizer">
          <div id="title">
            <el-input
              v-model.trim="course.organizer"
              style="width: 400px"
              type="text"
            />
          </div>
        </el-form-item>
        <el-form-item label="承办单位" prop="undertaker">
          <div id="title">
            <el-input
              v-model.trim="course.undertaker"
              style="width: 400px"
              type="text"
            />
          </div>
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <div id="title">
            <el-input
              v-model.trim="course.contact"
              style="width: 400px"
              type="text"
              placeholder="如: QQ群: 123456"
            />
          </div>
        </el-form-item>
        <el-form-item label="附件 （可选项）" prop="attachment">
          <div id="title" :style="{ opacity: state > 3 ? 0 : 1 }">
            <el-upload
              ref="uploadAtt"
              class="uploadAttachment"
              :action="uploadUrl"
              :on-success="fileListSuccess"
              :on-remove="removeAttachment"
              :file-list="attachmentList"
              accept=".rar,.zip"
            >
              <el-button
                :disabled="state != 0 && state > 3"
                size="small"
                type="primary"
                >上传压缩包</el-button
              >
            </el-upload>
            <div style="color: red; font-size: 13px">
              仅支持.rar、.zip格式, 大小20M以内
            </div>
          </div>
          <div v-if="isUpdate && state > 3" style="position: absolute; top: 0">
            <span v-if="course.attachment == '' || !course.attachment"
              >无附件</span
            >
            <button type="text" v-else>
              <a :href="course.attachment" style="text-decoration: none"
                >下载附件</a
              >
            </button>
          </div>
        </el-form-item>
        <el-form-item label="活动封面(可选项)" prop="cover">
          <div id="title" v-if="state < 3">
            <el-upload
              ref="uploadFile"
              class="uploadCover"
              :action="uploadUrl"
              list-type="picture-card"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              :limit="1"
              :on-remove="handleRemove"
              :on-change="handleChange"
              :on-success="handleSuccess"
            >
              <img
                v-if="course.cover"
                :src="course.cover"
                style="
                  width: 112px;
                  height: 112px;
                  object-fit: cover;
                  border-radius: 5px;
                "
              />
              <i v-else class="el-icon-plus" />
            </el-upload>
            <div
              :style="{ opacity: state > 3 ? 0 : 1 }"
              style="color: red; font-size: 13px"
            >
              图片建议: jpg、jpg、png、webp格式, 大小20M以内
            </div>
          </div>
          <img
            v-else
            style="
              width: 112px;
              height: 112px;
              object-fit: cover;
              border-radius: 5px;
            "
            :src="course.cover"
            alt="课程封面"
          />
        </el-form-item>
        <el-form-item style="position: absolute; bottom: 0px; right: 3%">
          <div style="text-align: right; display: flex; float: right">
            <el-button type="danger" @click="cancelAddLesson">取消</el-button>
            <el-button v-if="isUpdate" type="primary" @click="updateLesson"
              >修改</el-button
            >
            <el-button v-else type="primary" v-debounce @click="addLesson"
              >创建</el-button
            >
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { addLesson, backInfo, updateLesson } from "@/api/lessons";
import { deleteFile, isObjHasEmpty } from "@/api/common";
import { getAllSemesters } from "@/api/semesterAndObjectives/semester";

export default {
  name: "CourseForm",
  props: {
    lessonId: Number | String,
    isUpdate: Boolean,
    isVisible: Boolean,
    state: Number | String,
  },
  data() {
    return {
      formLoading: false,
      courseId: "",
      semesterList: [],
      course: {
        title: "",
        cover: "",
        semesterId: "",
        numberLimit: "",
        courseManager: "",
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
        auditPolicy: 0,
        attachment: "",
      },
      rules: {
        title: [
          { required: true, message: "请输入课程名称", trigger: "blur" },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur",
          },
        ],
        semesterId: [
          { required: true, message: "请选择开设学期", trigger: "blur" },
        ],
        numberLimit: [
          {
            type: "number",
            required: true,
            message: "请输入人数限制",
            trigger: "blur",
          },
        ],
        courseLocation: [
          { required: true, message: "请设置活动地点", trigger: "blur" },
        ],
        applicationStart: [
          { required: true, message: "请报名时间", trigger: "blur" },
        ],
        hostingStart: [
          { required: true, message: "请举办时间", trigger: "blur" },
        ],
        courseCategory: [
          { required: true, message: "请选择活动分类", trigger: "blur" },
        ],
        auditPolicy: [
          { required: true, message: "请选择审核方式", trigger: "blur" },
        ],
        scoringStandards: [
          { required: true, message: "请选择计分标准", trigger: "blur" },
        ],
        pointsRules: [
          { required: true, message: "请输入积分规则", trigger: "blur" },
        ],
      },
      hasCover: false,
      loading: false,
      uploadUrl: process.env.VUE_APP_BASE_API + process.env.VUE_APP_UPLOAD_URL,
      attachmentList: [],
      category: [
        "公益服务劳动",
        "劳动理论学习",
        "日常生活劳动",
        "生产顶岗劳动",
        "其他方式劳动",
      ],
    };
  },
  watch: {
    lessonId(val) {
      this.courseId = val;
      this.loadInfo();
    },
    isUpdate(val) {
      if (!val) {
        this.isUpdate = val;
      } else {
        this.loadInfo();
      }
    },
    hasCover: {
      handler(newV, oldV) {
        document.querySelector(".el-upload--picture-card").style.display = newV
          ? "none"
          : "flex";
      },
    },
  },
  mounted() {
    this.courseId = this.lessonId;
    this.loadInfo();
  },
  created() {
    this.loadSemesterList();
  },
  beforeDestroy() {
    this.clearFormContext();
  },
  methods: {
    loadSemesterList() {
      getAllSemesters().then((res) => {
        this.semesterList = res.data;
      });
    },
    loadInfo() {
      if (this.isUpdate) {
        this.formLoading = true;
        backInfo(this.courseId)
          .then((res) => {
            this.course = res.data;
          })
          .finally(() => {
            this.formLoading = false;
          });
      }
    },
    handleRemove(file, fileList) {
      this.hasCover = false;
      this.course.cover = "";
    },
    handleChange(file, fileList) {
      this.hasCover = fileList.length >= 1;
    },
    handleSuccess(res, file) {
      if (res.code == 200) {
        this.course.cover = res.data;
        this.hasCover = true;
        this.$message.success("上传成功");
      } else if (res.message == "系统异常=>Maximum upload size exceeded") {
        this.$message.error("文件大小不能超过20M");
      }
    },
    removeAttachment(file, fileList) {
      deleteFile(file.url).then((res) => {
        if (res.code == 200) {
          this.$message.success("删除成功");
          this.$refs.uploadAtt.clearFiles();
          this.course.attachment = "";
        } else {
          this.$message.error("服务器异常, 删除失败");
        }
      });
    },
    fileListSuccess(res, file) {
      if (res.code == 200) {
        this.course.attachment = res.data;
        this.$message.success("上传成功");
      } else if (res.message == "系统异常=>Maximum upload size exceeded") {
        this.$message.error("文件大小不能超过20M");
      }
    },
    clearFormContext() {
      this.$refs.ruleForm1.resetFields();
      this.$refs.ruleForm2.resetFields();
      this.course.hostingEnd = "";
      this.course.applicationEnd = "";
      if (this.$refs.uploadAtt) {
        this.$refs.uploadAtt.clearFiles();
      }
      if (this.$refs.uploadFile) {
        this.$refs.uploadFile.clearFiles();
      }
      this.hasCover = false;
    },
    cancelAddLesson() {
      this.$emit("onClose");
    },
    openUpdateLesson(row) {
      this.semesterTime = this.course.semester.substring(0, 4);
      this.whichSemester = this.course.semester.substring(length - 4, length);
    },
    delLesson(id) {
      this.$confirm("确认要删除该课程吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$message.success("删除成功");
          if (this.showLessons.length == 1 && this.page.currentPage > 1) {
            this.page.currentPage--;
          }
        })
        .catch((e) => {
          this.$message.warning("已取消删除");
        });
    },
    updateLesson() {
      this.$confirm("确认要修改课程信息吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const data = JSON.parse(JSON.stringify(this.course));
          updateLesson(data).then((res) => {
            if (res) {
              this.$message.success("修改成功");
              this.$emit("successCourseFrom");
            }
          });
        })
        .catch((e) => {
          this.$message.warning("已取消修改");
        })
        .finally(() => {});
    },
    addLesson() {
      this.$refs.ruleForm1.validate((valid) => {
        if (valid) {
          this.$refs.ruleForm2.validate((valid) => {
            if (valid) {
              addLesson(this.course).then((res) => {
                if (res.code == 200) {
                  this.$message.success("课程创建成功!");
                  this.$emit("successCourseFrom");
                } else {
                  this.$message.error("网络故障，添加失败");
                }
              });
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep {
  .el-textarea {
    .el-textarea__inner {
      height: fit-content;
      overflow-y: auto;
      height: 150px !important;
      padding-bottom: 40px;
    }
  }
}
</style>
