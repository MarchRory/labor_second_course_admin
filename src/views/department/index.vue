<template>
  <div class="container">
    <el-row
      :gutter="24"
      type="flex"
      justify="space-between"
      align="middle"
      style="flex-direction: column; height: 100%"
    >
      <el-col :span="24" class="box toolbar">
        <div class="searchBar">
          <div>
            <div id="keyWords">
              <div style="width: 45%">关键词:&nbsp;</div>
              <el-input
                v-model="key"
                placeholder="根据昵称查找用户"
                clearable
              />
              <div class="searchButtons">
                <el-button :disabled="key == ''" @click="key = ''"
                  >重置</el-button
                >
                <el-button type="primary" :disabled="key == ''" @click="search"
                  >搜索</el-button
                >
              </div>
            </div>
          </div>
          <el-button
            v-permission="['user.department.add']"
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="create"
            >添加学院</el-button
          >
        </div>
      </el-col>

      <el-col v-loading="loading" :span="24" class="box mainArea">
        <div style="width: 100%; height: 90%; overflow-y: scroll">
          <el-table
            :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
            height="100%"
            border
            style="width: 100%"
          >
            <el-table-column label="学院Logo" width="200">
              <template slot-scope="scope">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <el-image
                    style="height: 60px"
                    :src="scope.row.departmentCover || defaultCover"
                    lazy
                    fit="cover"
                  >
                    <div slot="error" style="text-align: center">
                      <i class="el-icon-picture-outline"></i><br />
                      <span>仅在校园网环境下可访问</span>
                    </div>
                  </el-image>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="departmentName"
              label="学院名称"
              min-width="200"
            />
            <el-table-column label="学院别名" min-width="300">
              <template slot-scope="scope">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                  "
                >
                  {{ scope.row.alias.join("、") }}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-permission="[
                'user.department.delete',
                'user.department.update',
              ]"
              label="操作"
              min-width="80"
            >
              <template slot-scope="scope">
                <div>
                  <el-button
                    v-permission="['user.department.update']"
                    type="text"
                    icon="el-icon-edit"
                    @click="edit(scope.row)"
                    >编辑</el-button
                  >
                  <el-button
                    v-permission="['user.department.delete']"
                    style="color: red"
                    type="text"
                    icon="el-icon-delete"
                    @click="del(scope.row.id)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div style="display: flex; align-items: flex-start; height: 8%">
          <el-pagination
            :current-page="pageNum"
            :page-sizes="[10, 15, 20, 30]"
            :page-size.sync="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-loading="dialogLoading"
      :title="isUpdate ? '修改信息' : '新增学期'"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="30%"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="学院名称" prop="departmentName">
          <el-input v-model="form.departmentName" />
        </el-form-item>

        <el-form-item label="学院Logo" prop="departmentCover">
          <el-upload
            ref="uploadFile"
            class="uploadCover"
            :action="uploadUrl"
            list-type="picture-card"
            accept="image/jpeg,image/jpg,image/png"
            :limit="1"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :on-success="handleSuccess"
          >
            <img
              v-if="form.departmentCover"
              :src="form.departmentCover"
              style="width: 112px; height: 112px"
            />
            <i v-else class="el-icon-plus" />
          </el-upload>
          <div style="color: red; font-size: 13px">
            上传图片, 建议.jpg格式, 大小20M以内
          </div>
        </el-form-item>

        <el-form-item
          v-for="(alia, index) in form.alias"
          :key="index"
          :label="'学院别名' + `${index + 1}`"
          :prop="'alias'"
        >
          <div
            style="
              width: 90%;
              display: flex;
              align-items: center;
              justify-content: space-around;
            "
          >
            <el-input v-model="alia.value" size="medium" />
            <el-button
              v-if="!index"
              type="success"
              style="margin-left: 20px; padding: 10px; letter-spacing: 2px"
              @click.prevent="addAlia"
              >新增</el-button
            >
            <el-button
              v-if="index"
              type="danger"
              style="margin-left: 20px; padding: 10px; letter-spacing: 2px"
              @click.prevent="removeAlia(alia)"
              >删除</el-button
            >
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="submitDisabled" @click="submit">{{
          isUpdate ? "修改" : "创建"
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import rq from "@/api/department/department";
import { isArrEqual } from "@/api/common";
import { mapGetters } from "vuex";
export default {
  name: "departmentTable",
  data() {
    return {
      uploadUrl: process.env.VUE_APP_BASE_API + "/user/file/upload",
      chosenId: null,
      key: "",
      pageNum: 1,
      pageSize: 10,
      aliasNum: 1,
      form: {
        departmentName: "",
        departmentCover: "",
        alias: [{ value: "" }],
      },
      defaultCover: require("@/assets/swpu_Logo/logo_blue.jpg"),
      list: [],
      total: null,
      formCopy: {},
      loading: false,
      dialogVisible: false,
      dialogLoading: false,
      isUpdate: false,
      fileList: [],
      hasCover: false,
      rules: {
        name: [{ required: true, message: "请输入学院名称", trigger: "blur" }],
        cover: [
          { required: true, message: "需要上传学院Logo", trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    submitDisabled() {
      return (
        Object.values(this.form).every((item) => item == "") &&
        isArrEqual(Object.values(this.form), Object.values(this.formCopy))
      );
    },
    ...mapGetters(["department"]),
  },
  watch: {
    dialogVisible(newVal) {
      if (!newVal) {
        this.chosenId = null;
        this.isUpdate = false;

        setTimeout(() => {
          this.$refs.form.resetFields();
          this.$refs.uploadFile.clearFiles();
          this.form.alias = [{ value: "" }];
          this.formCopy = {};
        }, 480);
      }
    },
    key(newVal) {
      if (!newVal) {
        this.pageNum = 1;
        this.list = this.department;
      }
    },
    hasCover(newVal) {
      document.querySelector(".el-upload--picture-card").style.display = newVal
        ? "none"
        : "flex";
    },
  },
  created() {
    this.loadList();
  },
  mounted() {},
  methods: {
    loadList() {
      this.loading = true;
      this.$store
        .dispatch("department/init")
        .then(() => {
          this.list = this.department;
          this.total = this.department.length;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    del(id) {
      this.$confirm(
        "该操作存在巨大风险, 若已有学生绑定该学院, 删除学院后将导致学生无法登录, 请确保没有学生绑定该学院后再删除课程?\n",
        "警告",
        {
          confirmButtonText: "我已知晓风险并确保无学生绑定该学院, 确定删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          rq.deleteDepartment(id).then((res) => {
            if (res.code == 200) {
              if (this.pageNum > 1 && this.list.length === 1) {
                this.pageNum--;
              }
              this.$message.success("学院删除成功");
              this.dialogVisible = false;
              if (this.key != "") {
                this.key = ""; // 触发watcher
              } else {
                this.loadList();
              }
            }
          });
        })
        .catch(() => {
          this.dialogVisible = false;
        });
    },
    create() {
      this.formCopy = JSON.parse(JSON.stringify(this.form));
      this.formCopy.alias = this.formCopy.alias.map((item) => {
        return { value: item };
      });
      this.dialogVisible = true;
    },
    edit(info) {
      this.chosenId = info.id;
      this.form.departmentName = info.departmentName;
      this.form.departmentCover = info.departmentCover;
      this.form.alias = info.alias.map((item) => {
        return { value: item };
      });
      this.formCopy = JSON.parse(JSON.stringify(this.form));
      this.isUpdate = true;
      this.dialogVisible = true;
    },
    submit() {
      if (!this.form.departmentName || !this.form.departmentCover) {
        this.$message.warning("请检查信息是否完整");
        return;
      }
      if (!/^[\u4e00-\u9fa5]+$/.test(this.form.departmentName)) {
        this.$message.warning("学院名只能包含中文");
        return;
      }

      this.dialogLoading = true;
      this.form.alias = this.form.alias.map((item) => item.value);
      if (!this.isUpdate) {
        rq.createDepartment(JSON.parse(JSON.stringify(this.form)))
          .then((res) => {
            if (res.code == 200) {
              this.$message.success("学院创建成功");
              this.dialogVisible = false;
              if (this.key != "") {
                this.key = ""; // 触发watcher
              } else {
                this.loadList();
              }
            }
          })
          .finally(() => {
            this.dialogLoading = false;
          });
      } else {
        const obj = JSON.parse(JSON.stringify(this.form));
        obj["id"] = this.chosenId;
        rq.updateDepartment(obj)
          .then((res) => {
            if (res.code == 200) {
              this.$message.success("信息更新成功");
              this.dialogVisible = false;
              if (this.key != "") {
                this.key = ""; // 触发watcher
              } else {
                this.loadList();
              }
            }
          })
          .finally(() => {
            this.dialogLoading = false;
          });
      }
    },
    search() {
      this.pageNum = 1;
      this.list = this.list.filter((item) =>
        item.departmentName.includes(this.key)
      );
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
    },
    handlePageChange(newPage) {
      this.pageNum = newPage;
    },
    handleRemove(file, fileList) {
      this.hasCover = false;
      this.form.departmentCover = "";
    },
    handleChange(file, fileList) {
      this.hasCover = fileList.length >= 1;
    },
    handleSuccess(res, file) {
      if (res.code == 200) {
        this.form.departmentCover = res.data;
        this.hasCover = true;
        this.$message.success("上传成功");
      } else if (res.message == "系统异常=>Maximum upload size exceeded") {
        this.$message.error("文件大小不能超过20M");
      }
    },
    removeAlia(alia) {
      const index = this.form.alias.indexOf(alia);
      if (index != -1) {
        this.form.alias.splice(index, 1);
      }
    },
    addAlia() {
      this.form.alias.push({
        value: "",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-upload--picture-card {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.container {
  width: 100%;
  height: calc(100vh - 50px);
  min-width: 1326px;
  min-height: 665.2px;
  padding: 10px;
  display: flex;
  justify-content: center;
  .el-row {
    width: calc(100%);
    .el-col {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    .box {
      padding-left: 10px;
      border-radius: 4px;
      height: calc(100vh - 70px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
    }
    .toolbar {
      height: 8%;

      .searchBar {
        height: 60px;
        padding: 5px 5% 5px 10%;
        width: 100%;
        background-color: #ffffff;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        transition: box-shadow 0.25s ease-in;
        #keyWords {
          display: flex;
          flex-direction: row;
          align-items: center;
          width: 100%;
          color: #838383;
        }
        .searchButtons {
          display: flex;
          flex-direction: row;
          margin-left: 15px;
        }
      }
    }
    .mainArea {
      height: 90.5%;
      justify-content: space-between;
    }
  }
}
</style>
