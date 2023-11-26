<template>
  <div class="app-container">
    <div class="searchBar">
      <div>
        <div id="keyWords">
          <div style="width: 45%">关键词:&nbsp;</div>
          <el-input v-model="keyWords" placeholder="请输入内容" clearable />
          <div class="searchButtons">
            <el-button @click="keyWords = ''">重置</el-button>
            <el-button
              type="primary"
              :disabled="searchDisabled"
              @click="loadList()"
              >搜索</el-button
            >
          </div>
        </div>
      </div>
      <div>
        <el-row>
          <el-col :span="13">
            <span style="color: #5a5e66; width: 30%">学院:&nbsp;</span>
            <el-select
              v-model="departmentId"
              style="width: 70%"
              collapse-tags
              filterable
              clearable
              placeholder="选择学院"
              @change="
                loadMajorSelect();
                loadList();
              "
            >
              <el-option
                v-for="item in selectDepartment"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              /> </el-select
          ></el-col>
          <el-col :span="11">
            <span style="color: #5a5e66; width: 30%">专业:&nbsp;</span>
            <el-select
              v-model="majorId"
              :disabled="!departmentId"
              style="width: 70%"
              collapse-tags
              filterable
              clearable
              placeholder="请选择专业"
              @change="loadList()"
            >
              <el-option
                v-for="item in majorSelect"
                :key="item.id"
                :label="item.majorName"
                :value="item.id"
              /> </el-select
          ></el-col>
        </el-row>
      </div>
      <div class="buttons">
        <el-button
          v-permission="['user.student.add']"
          type="primary"
          icon="el-icon-circle-plus-outline"
          @click="handleCreate"
          >添加学生</el-button
        >
        <el-button
          v-permission="['user.student.add']"
          type="success"
          icon="el-icon-s-grid"
          @click="uploadDialogVisible = true"
          >导入学生Excel</el-button
        >
      </div>
    </div>

    <div v-loading="loading" class="students-list">
      <el-table
        :data="studentList"
        stripe
        border
        height="100%"
        style="width: 100%"
        :row-style="{ minHeight: 50 + 'px', height: 'auto' }"
        :cell-style="{ padding: 5 + 'px' }"
      >
        <el-table-column label="序号" width="50" align="center">
          <template slot-scope="scope">
            <div>
              {{ scope.$index + 1 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          min-width="60"
          align="center"
        />
        <el-table-column
          prop="studentId"
          label="学号"
          min-width="50"
          align="center"
        />
        <el-table-column
          prop="major"
          label="专业"
          sortable="custom"
          align="center"
        />
        <el-table-column
          prop="department"
          min-width="80"
          label="学院"
          sortable="custom"
          align="center"
        >
          <el-tag slot-scope="scope">{{ scope.row.department }}</el-tag>
        </el-table-column>
        <el-table-column prop="sex" label="性别" min-width="50" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.sex == 1" size="medium">男</el-tag>
            <el-tag v-else-if="scope.row.sex == 0" size="medium" type="danger"
              >女</el-tag
            >
            <span v-else>未设置</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="currentGrade"
          label="当前年级"
          sortable="custom"
          min-width="60"
          align="center"
        >
          <template slot-scope="scope">
            {{
              scope.row.currentGrade ? scope.row.currentGrade + "级" : "暂无"
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="campus"
          label="校区"
          min-width="30"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.campus === '南充'" color="success">{{
              scope.row.campus
            }}</el-tag>
            <el-tag v-else>{{ scope.row.campus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="contact"
          label="联系方式"
          min-width="50"
          align="center"
        >
          <template slot-scope="scope">
            <div>
              <el-popover
                placement="right"
                width="350"
                title="联系方式"
                trigger="click"
              >
                <div style="display: flex; flex-direction: column">
                  <div
                    v-for="(value, key, index) in scope.row.contact"
                    :key="index"
                    style="
                      display: flex;
                      flex-direction: row;
                      justify-content: space-between;
                      width: 100%;
                      margin-top: 10px;
                      font-weight: bold;
                    "
                  >
                    <div
                      style="
                        width: 30%;
                        border-left: 4px solid #409eff;
                        padding-left: 8px;
                      "
                    >
                      {{ key }}
                    </div>
                    <div style="width: 70%">
                      {{ value == "" ? "暂无" : value }}
                    </div>
                  </div>
                </div>
                <el-button slot="reference" type="text">查看</el-button>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="
            ['user.student.update', 'user.student.delete'].some((p) =>
              userPermissions.includes(p)
            )
          "
          fixed="right"
          label="操作"
          min-width="80"
          align="center"
        >
          <template slot-scope="scope">
            <div class="buttons">
              <el-button
                v-permission="['user.student.update']"
                type="text"
                style="color: #409eff"
                icon="el-icon-edit-outline"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-popconfirm
                confirm-button-text="确定删除"
                cancel-button-text="取消"
                confirm-button-type="danger"
                icon="el-icon-info"
                icon-color="red"
                :title="`确认删除学生${scope.row.name}吗?`"
                @confirm="handleDel(scope.row.id)"
              >
                <el-button
                  slot="reference"
                  v-permission="['user.student.delete']"
                  style="color: #f56c6c"
                  type="text"
                  icon="el-icon-delete"
                  >删除</el-button
                >
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="block">
        <el-pagination
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-permission="['user.student.add']"
      title="学生信息导入"
      :visible.sync="uploadDialogVisible"
      width="30%"
      :before-close="handleUploadClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
      accept="xlsx"
    >
      <div style="display: flex; flex-direction: column; align-items: center">
        <el-upload
          drag
          :action="uploadUrl"
          :show-file-list="false"
          :http-request="handelUpload"
          multiple
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处自动上传, 或<em>点击上传</em>
          </div>
          <div
            slot="tip"
            class="el-upload__tip"
            style="color: red; margin-top: 10px"
          >
            只能上传xlsx文件, 上传过程不可逆
          </div>
        </el-upload>
        <span
          slot="footer"
          class="dialog-footer"
          style="
            width: 150px;
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
          "
        >
          <el-button @click="handleUploadClose">关闭</el-button>
          <el-button
            v-permission="['curriculum.corpus.add']"
            v-debounce
            type="success"
            @click="handleUpdateOver"
            >完成上传</el-button
          >
        </span>
      </div>
    </el-dialog>

    <StudentModal
      v-permission="['user.student.add', 'user.student.update']"
      :dialog-table-visible="dialogTableVisible"
      :student="currentStudent"
      :is-update="isUpdate"
    />
  </div>
</template>

<script>
import { deleteStudent, studentList, uploadStu } from "@/api/student";
import { mapGetters } from "vuex";
import { majorPage } from "@/api/department/major";
export default {
  name: "stuTable",
  components: { StudentModal: () => import("./studentModal.vue") },
  data() {
    return {
      studentList: [],
      uploadDialogVisible: false,
      keyWords: "",
      uploadUrl: process.env.VUE_APP_BASE_API + "/user/student/excel",
      total: 1,
      page: 1,
      pageSize: 10,
      departmentId: null,
      majorId: null,
      currentStudent: {},
      dialogTableVisible: false,
      isUpdate: false,
      loading: false,
      majorSelect: [],
    };
  },
  watch: {
    keyWords: {
      handler(newV, oldV) {
        if (newV == "") {
          this.page = 1;
          this.loadList();
        }
      },
    },
  },
  computed: {
    searchDisabled() {
      return this.keyWords === "";
    },
    ...mapGetters(["department", "userPermissions"]),
    selectDepartment() {
      if (this.department.length) {
        const departmentList = JSON.parse(JSON.stringify(this.department));
        return departmentList
          .filter((item) => {
            return item.id > 1;
          })
          .map((item) => {
            return {
              text: item.departmentName,
              value: item.id,
            };
          });
      }
    },
  },
  created() {
    this.$store.dispatch("department/init");
    this.loadList();
  },
  mounted() {},
  methods: {
    handelSortChange(column) {
      console.log(column);
    },
    loadMajorSelect() {
      this.majorId = null;
      majorPage({
        page: 1,
        pageSize: 100,
        departmentId: this.departmentId,
      }).then((res) => {
        const { data } = res;
        this.majorSelect = data.list;
      });
    },
    handleCreate() {
      this.dialogTableVisible = true;
      this.isUpdate = false;
      this.currentStudent = {};
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.loadList();
    },
    handleCurrentChange(newPage) {
      this.page = newPage;
      this.loadList();
    },
    handleUpdate(row) {
      console.log(row);
      this.isUpdate = true;
      this.currentStudent = row;
      this.dialogTableVisible = true;
    },
    handleClose() {
      this.dialogTableVisible = false;
    },
    handleDel(row) {
      deleteStudent(row).then((res) => {
        if (res.code == 200) {
          if (this.page > 1 && this.studentList.length === 1) {
            this.page--;
          }
          this.$message.success("删除成功");
          this.loadList();
        } else {
          this.$message.error("服务器异常, 删除失败");
        }
      });
    },
    loadList() {
      this.loading = true;
      studentList({
        key: this.keyWords,
        pageNum: this.page,
        pageSize: this.pageSize,
        departmentId: this.departmentId,
      })
        .then((res) => {
          res.data.list.forEach((stu, index) => {
            if (stu.contact == null) {
              res.data.list[index].contact = {
                电话: "",
                邮箱: "",
                QQ: "",
                微信: "",
              };
            }
          });
          this.studentList = res.data.list;
          this.total = Number(res.data.total);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleUploadClose() {
      this.uploadDialogVisible = false;
    },
    handelUpload(params) {
      uploadStu(params.file).then((res) => {
        if (res.code == 200) {
          this.$message.success("上传成功");
        } else {
          this.$message.error(res.message);
        }
      });
    },
    handleUpdateOver() {
      this.uploadDialogVisible = false;
      this.loadList();
    },
    filterChange(value) {
      this.departmentId =
        typeof value === "undefined" ? null : value.chosenDepartment[0];
      this.page = 1;
      this.loadList();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-button {
    letter-spacing: 1px;
    padding: 10px 13px 10px 13px;
  }
  .el-popconfirm__action {
    display: flex;
    margin-left: 10px;
  }
}
.app-container {
  background-color: #d6d6d640;
  height: calc(100vh - 50px);
  overflow-y: auto;
  overflow-x: hidden;
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
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
    &:hover {
      box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
    }
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
  .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 30px;
  }
  .students-list {
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
    &:hover {
      box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
    }
  }
}
</style>
