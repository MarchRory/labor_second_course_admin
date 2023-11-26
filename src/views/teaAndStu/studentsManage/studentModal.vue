<template>
  <div class="container">
    <el-dialog
      title="学生信息"
      top="4vh"
      :visible.sync="dialogTableVisible"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="close"
    >
      <el-form :model="studentInfo" label-width="80px">
        <el-row>
          <el-col :span="11">
            <el-form-item label="学号">
              <el-input
                v-model="studentInfo.studentId"
                :readonly="isUpdate"
                show-word-limit
                style="width: 80%"
                @input="onInput"
              />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input
                v-model="studentInfo.name"
                style="width: 80%"
                @input="onInput"
              />
            </el-form-item>
            <el-form-item label="当前年级">
              <el-input-number
                v-model="studentInfo.currentGrade"
                :min="2020"
                style="width: 80%"
                @input="onInput"
              />
            </el-form-item>
            <el-form-item label="性别">
              <el-select
                v-model="sex"
                placeholder="请选择性别"
                style="width: 80%"
                @input="onInput"
              >
                <el-option label="男" value="1" />
                <el-option label="女" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="学院">
              <el-select
                v-model="studentInfo.departmentId"
                placeholder="请选择学院"
                style="width: 80%"
                @change="loadMajorSelect"
              >
                <el-option
                  v-for="item in department"
                  :key="item.id"
                  :label="item.departmentName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="专业">
              <el-select
                v-model="studentInfo.majorId"
                :disabled="!studentInfo.departmentId"
                style="width: 80%"
                collapse-tags
                filterable
                clearable
                placeholder="请选择专业"
              >
                <el-option
                  v-for="item in majorSelect"
                  :key="item.id"
                  :label="item.majorName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="校区">
              <el-select v-model="studentInfo.campus">
                <el-option label="成都校区" value="成都" />
                <el-option label="南充校区" value="南充" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="出生日期">
              <el-date-picker
                v-model="studentInfo.birth"
                type="date"
                placeholder="选择日期"
                format="yyyy-MM-dd"
                @input="onInput"
              />
            </el-form-item>
            <el-form-item label="入学日期">
              <el-date-picker
                v-model="studentInfo.enrollmentYear"
                type="date"
                placeholder="选择日期"
                format="yyyy-MM-dd"
                @input="onInput"
              />
            </el-form-item>
            <el-form-item label="联系方式">
              <el-input
                v-model="studentInfo.contact['电话']"
                placeholder="请输入内容"
                style="width: 80%; margin-bottom: 10px"
                @input="onInput"
              >
                <template slot="prepend">电话 </template>
              </el-input>
              <el-input
                v-model="studentInfo.contact['邮箱']"
                placeholder="请输入内容"
                style="width: 80%; margin-bottom: 10px"
                @input="onInput"
              >
                <template slot="prepend">邮箱 </template>
              </el-input>
              <el-input
                v-model="studentInfo.contact['QQ']"
                placeholder="请输入内容"
                style="width: 80%; margin-bottom: 10px"
                @input="onInput"
              >
                <template slot="prepend">QQ </template>
              </el-input>
              <el-input
                v-model="studentInfo.contact['微信']"
                placeholder="请输入内容"
                style="width: 80%"
                @input="onInput"
              >
                <template slot="prepend">微信 </template>
              </el-input>
            </el-form-item>
            <el-form-item label="学籍状态">
              <el-switch
                v-model="studentInfo.state"
                :active-value="1"
                :inactive-value="0"
                active-text="正常"
                inactive-text="异常"
                inactive-color="red"
              />
            </el-form-item>
            <el-form-item label="重置密码" v-show="isUpdate">
              <el-input v-model="password" show-password style="width: 60%" />
              <el-button
                style="color: #f56c6c"
                type="text"
                icon="el-icon-refresh-left"
                :disabled="!isUpdate"
                @click="resetPwd()"
                >重置</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button v-if="!isUpdate" type="primary" @click="handleCreate"
          >提交</el-button
        >
        <el-button
          v-else
          type="primary"
          :disabled="updateDisabled"
          @click="handleUpdate"
          >修改</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addStudent, updateStudent } from "@/api/student";
import { mapGetters } from "vuex";
import { majorPage } from "@/api/department/major";
import { resetPassword } from "@/api/user";
export default {
  name: "StudentModal",
  props: ["student", "dialogTableVisible", "isUpdate"],
  data() {
    return {
      password: "",
      majorSelect: [],
      studentInfo: {
        studentId: null,
        majorId: null,
        name: "",
        sex: "",
        departmentId: null,
        birth: null,
        enrollmentYear: null,
        campus: 0,
        currentGrade: null,
        state: 1,
        contact: {
          电话: "",
          邮箱: "",
          QQ: "",
          微信: "",
        },
      },
      departmentName: "",
      copy: null,
      sex: null,
    };
  },
  watch: {
    student: {
      handler(newer, older) {
        const flag = Object.keys(newer).length;
        if (flag !== 0) {
          this.studentInfo = JSON.parse(JSON.stringify(newer));
          if (this.student.sex == 1) {
            this.sex = "男";
          }
          if (this.student.sex === 0) {
            this.sex = "女";
          }
          this.copy = JSON.stringify(newer);
          const department = this.department.find(
            (item) => item.id === newer.departmentId
          );
          this.departmentName = department
            ? department.departmentName
            : "暂无学院";
          this.loadMajorSelect();
        } else {
          this.studentInfo = {
            studentId: null,
            name: "",
            sex: "",
            birth: null,
            departmentId: null,
            enrollmentYear: null,
            contact: {
              电话: "",
              邮箱: "",
              QQ: "",
              微信: "",
            },
          };
          this.departmentName = null;
          this.sex = null;
          this.copy = null;
        }
      },
    },
    departmentName(newer) {
      if (!newer) {
        return;
      }
      if (newer != "暂无学院") {
        this.studentInfo.departmentId = this.department.find(
          (item) => item.departmentName === newer
        ).id;
      } else {
        this.studentInfo.departmentId = 1;
      }
    },
    sex: {
      handler(newer) {
        // sex可能为null
        if (newer == 1) {
          this.studentInfo.sex = 1;
        }
        if (newer === 0) {
          this.studentInfo.sex = 0;
        }
      },
      immediate: true,
    },
  },
  computed: {
    createDisabled() {
      if (this.studentInfo.sex != 0 && this.studentInfo.sex != 1) {
        return true;
      } else {
        const values = Object.values(this.studentInfo.contact);
        if (values.every((item) => !item)) {
          return true;
        } else {
          return Object.values(this.studentInfo).some((item) => !item);
        }
      }
    },
    updateDisabled() {
      return this.copy === JSON.stringify(this.studentInfo);
    },
    ...mapGetters(["department"]),
  },
  created() {},
  methods: {
    loadMajorSelect() {
      this.majorId = null;
      majorPage({
        page: 1,
        pageSize: 100,
        departmentId: this.studentInfo.departmentId,
      }).then((res) => {
        const { data } = res;
        this.majorSelect = data.list;
      });
    },
    resetPwd() {
      console.log(this.studentInfo);
      resetPassword(this.studentInfo.uid, this.password)
        .then((res) => {
          this.$message.success("重置成功");
        })
        .catch((_) => {
          this.$message.error("重置失败");
        });
    },
    onInput() {
      this.$forceUpdate();
    },
    close() {
      this.$parent.handleClose();
    },
    handleCreate() {
      addStudent(this.studentInfo).then((res) => {
        if (res.code == 200) {
          this.$message.success("添加成功");
          this.close();
          this.$parent.loadList();
        }
      });
    },
    handleUpdate() {
      if (this.studentInfo.sex == "男") {
        this.studentInfo.sex = 1;
      } else if (this.studentInfo.sex == "女") {
        this.studentInfo.sex = 0;
      }
      updateStudent(this.studentInfo).then((res) => {
        if (res.code == 200) {
          this.$message.success("更新成功");
          this.close();
          this.$parent.loadList();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-scrollbar__wrap {
    overflow: auto;
  }
  .el-input-group__prepend {
    padding: 0 15px;
  }
}
.dialog-footer {
  display: flex;
  flex-direction: row;
  margin-left: 60%;
}
</style>
