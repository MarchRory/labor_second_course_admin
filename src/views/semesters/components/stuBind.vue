<template>
  <div id="container" v-permission="['curriculum.courseObjectives.update']">
    <el-row
      :gutter="0"
      type="flex"
      justify="space-between"
      align="middle"
      style="margin-bottom: 10px; flex-direction: column"
    >
      <el-col :span="10" style="position: relative; left: -28%">
        <h1>目标 —— 学生绑定</h1>
      </el-col>
      <el-col :span="23" style="display: flex; justify-content: space-between">
        <div id="searchBar">
          <el-input
            placeholder="输入关键词搜索目标"
            v-model="keyWords"
            style="margin-right: 15px"
          />
          <el-button
            @click="
              () => {
                keyWords = '';
                isFilter = false;
              }
            "
            :disabled="keyWords == ''"
            >重置</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-search"
            :disabled="keyWords == ''"
            @click="isFilter = true"
            >搜索</el-button
          >
        </div>

        <div>
          <el-button
            type="success"
            icon="el-icon-s-grid"
            @click="openFileReader"
            >上传学生excel表格一键绑定</el-button
          >
          <el-button
            v-if="false"
            type="primary"
            icon="el-icon-s-grid"
            @click="edit"
            >手动选择绑定</el-button
          >
        </div>
      </el-col>
    </el-row>

    <el-row id="sec" v-loading="loading" :gutter="0">
      <el-col style="height: 85%">
        <el-table
          :data="
            showList.slice(
              (this.page - 1) * this.pageSize,
              this.page * this.pageSize
            )
          "
          height="100%"
        >
          <el-table-column label="序号" align="center" min-width="30">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            label="学号"
            align="center"
            prop="studentId"
            min-width="70"
          />
          <el-table-column
            label="学生"
            align="center"
            prop="name"
            min-width="80"
          />
          <el-table-column
            label="年级"
            align="center"
            prop="currentGrade"
            min-width="70"
          />
          <el-table-column
            label="校区"
            align="center"
            prop="campus"
            min-width="30"
          />
          <el-table-column
            label="学院"
            align="center"
            prop="department"
            min-width="80"
          >
          </el-table-column>
          <el-table-column
            label="专业"
            align="center"
            prop="major"
            min-width="80"
          >
          </el-table-column>

          <!--                   <el-table-column
                      label="年级"
                      prop="courseCategory"
                      align="center"
                      min-width="150">
                  </el-table-column> -->
          <el-table-column label="操作" align="center" min-width="80">
            <template slot-scope="scope">
              <el-button
                type="text"
                style="color: red"
                icon="el-icon-circle-close"
                @click="delBatch(scope.row)"
                >解绑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-col>

      <el-col id="block">
        <el-pagination
          background
          :page-size="pageSize"
          :current-change="page"
          :page-sizes="[50, 60, 70]"
          layout="total,sizes, prev, pager, next, jumper"
          :total="showList.length"
          @size-change="
            (newSize) => {
              pageSize = newSize;
            }
          "
          @current-change="
            (newPage) => {
              page = newPage;
            }
          "
        />
      </el-col>
    </el-row>

    <el-dialog
      v-if="false"
      title="批量绑定学生"
      :visible.sync="dialogTableVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div style="text-align: center">
        <el-transfer
          v-model="checkedArray"
          v-loading="loading"
          style="text-align: left; display: inline-block"
          :total="total"
          filterable
          filter-placeholder="输入学生姓名或学号查询"
          :render-content="renderFunc"
          :titles="['未绑定的学生', '已绑定的学生']"
          :button-texts="['解绑', '绑定']"
          :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}',
          }"
          :data="stuWareHouse"
        >
          <el-button
            slot="left-footer"
            class="transfer-footer"
            type="text"
            style="color: rgb(17, 215, 109)"
            icon="el-icon-refresh-right"
            size="middle"
            @click="getStuWareHouse"
            >获取更多</el-button
          >
          <el-button
            slot="right-footer"
            class="transfer-footer"
            type="text"
            icon="el-icon-check"
            size="middle"
            :disabled="bindDisabled"
            @click="BatchBind"
            >确认</el-button
          >
        </el-transfer>
      </div>
    </el-dialog>

    <el-dialog
      v-loading="uploadLoading"
      title="上传学生表格"
      :visible.sync="isOpenFileReader"
      width="60%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :append-to-body="true"
      element-loading-text="正在上传数据"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div class="fileReaderContainer">
        <div class="uploadBotton">
          <el-upload
            :action="uploadUrl"
            :on-success="handleUploadSuccess"
            :file-list="fileList"
          >
            <el-button size="small" type="primary" class="el-btn"
              >点击上传</el-button
            >
            <div slot="tip" style="padding: 10px 0 10px 0">
              只能上传xlsx文件, 且表头应为: 学号、性别、姓名
            </div>
          </el-upload>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取消上传</el-button>
        <el-button
          type="primary"
          :disabled="!fileList.length"
          @click="loadInSys"
          >批量绑定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  objectivesBindUser,
  getObjStuList,
  unBind,
} from "@/api/semesterAndObjectives/objectives";
import { readExcel } from "@/utils/xlsx";
export default {
  name: "CourseBind",
  props: {
    objectId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      courseObjectives: {},
      isFilter: false,
      stuList: [],
      total: 0,
      showData: [],
      stuWareHouse: [],
      page: 1,
      whPage: 1,
      whTotal: 60,
      pageSize: 10,
      keyWords: "",
      // dialogTableVisible: false,
      checkedArray: [],
      checkedCopy: [],
      renderFunc(h, option) {
        return <span> {option.label} </span>;
      },
      isOpenFileReader: false,
      uploadUrl: process.env.VUE_APP_BASE_API + process.env.VUE_APP_UPLOAD_URL,
      fileList: [],
      fileTableHead: [],
      fileTableData: [],
      uploadLoading: false,
    };
  },
  computed: {
    bindDisabled() {
      return (
        this.checkedArray.length == this.checkedCopy.length &&
        this.checkedArray.sort().toString() ==
          this.checkedCopy.sort().toString()
      );
    },
    showList() {
      console.log(this.keyWords);
      if (this.keyWords == "") {
        this.isFilter = false;
        return this.stuList;
      } else if (this.keyWords != "" && this.isFilter) {
        return this.stuList.filter((stu) => stu.name.includes(this.keyWords));
      } else {
        return this.stuList;
      }
    },
  },
  watch: {
    keyWords(newer, older) {
      if (newer == "") {
        this.showData = this.stuList;
      }
    },
    isOpenFileReader(newer) {
      if (!newer) {
        setTimeout(() => {
          this.fileTableHead = [];
          this.fileTableData = [];
          this.checkedArray = [];
          this.fileList = [];
        }, 300);
      }
    },
  },
  mounted() {
    this.loadList();
  },
  methods: {
    loadList() {
      this.loading = true;
      // 先一次性拿完，然后, slice分页,
      // 学生绑定这里因为学生数量庞大, 误操作的后果严重, 这一块以后要重写, 相信后人的智慧
      getObjStuList(this.objectId, this.page, 4 * 1000 * 10, 1)
        .then(async (res) => {
          if (res.code == 200) {
            const { data } = res;
            this.total = data.total;
            this.courseObjectives = data.courseObjectives;
            this.stuList = await data.list;
          } else {
            this.$message.error("网络异常, 学生数据获取失败, 请稍后重试");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getStuWareHouse() {
      if (this.stuWareHouse.length >= this.whTotal && this.whTotal != 0) {
        this.$message.warning("没有更多数据了");
        return;
      }
      this.loading = true;
      getObjStuList(this.objectId, this.whPage, 50, 2)
        .then((res) => {
          if (res.code == 200) {
            this.checkedCopy = [];
            this.stuWareHouse = [];
            this.checkedArray = [];
            this.whTotal = res.data.total;
            res.data.list.forEach((item, index) => {
              this.stuWareHouse.push({
                key: item.userId,
                label: item.name,
                disabled: false,
              });
              if (this.stuList.findIndex((each) => each.id === item.id) != -1) {
                this.checkedArray.push(item.id);
              }
            });
            this.checkedCopy = JSON.parse(JSON.stringify(this.checkedArray));
            this.whPage++;
          } else {
            this.$message.error("服务器异常, 学生信息获取失败");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.loadList();
    },
    handleCurrentChange(currenrPage) {
      this.page = currenrPage;
      this.loadList();
    },
    async search() {
      this.loading = true;
      this.page = 1;
      await this.init(this.keyWords, this.objectId, this.page, this.pageSize);
      this.loading = false;
    },
    /*     edit() {
      this.dialogTableVisible = true;
      if (this.whPage == 1) {
        this.getStuWareHouse();
      }
    }, */
    BatchBind() {
      this.$confirm("确定更改该目标绑定的学生吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 后端需要修改，这里我们绑定一个学生的id数组
        objectivesBindUser(this.objectId, this.checkedArray).then((res) => {
          if (res.code == 200) {
            this.$message.success("绑定成功");
            this.checkedArray = [];
            this.dialogTableVisible = false;
            this.loadList();
          }
        });
      });
    },
    openFileReader() {
      this.isOpenFileReader = true;
    },
    handleUploadSuccess(res, file, fileList) {
      if (res.code == 200) {
        this.fileList = fileList;
      } else {
        this.$message.error("遇到错误, 文件上传失败");
      }
    },
    handleClose() {
      if (this.fileList.length > 0) {
        this.$confirm(
          "有文件中的学生没有绑定, 确定取消绑定所有已上传文件中的学生吗?",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          this.isOpenFileReader = false;
        });
      } else {
        this.isOpenFileReader = false;
      }
    },
    loadInSys() {
      this.$confirm(
        "即将将已上传文件中的所有学生全部绑定至改课程目标, 请确认?",
        "提示",
        {
          confirmButtonText: "确认绑定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.uploadLoading = true;
          this.fileList.forEach(async (file) => {
            await readExcel(file.raw, this.fileTableHead, this.fileTableData);
          });
          // 定时器解决observer问题， 需要延迟才能获取到数据, 但如果表格数据量很大，可能就不太行, 还需要以后进行优化
          setTimeout(() => {
            if (this.fileTableData.length) {
              this.fileTableData.forEach((each) => {
                each.forEach((ever) => {
                  this.checkedArray.push(ever["学号"]);
                });
              });
            }
            this.checkedArray = [...new Set([...this.checkedArray])];
            objectivesBindUser(this.objectId, this.checkedArray)
              .then((res) => {
                if (res.code == 200) {
                  this.$message.success("批量绑定学生成功");
                  this.isOpenFileReader = false;
                  this.loadList();
                } else {
                  this.$message.error("遇到错误, 数据上传失败, 请稍后重试");
                }
              })
              .finally(() => {
                this.uploadLoading = false;
              });
          }, 800);
        })
        .catch(() => {
          this.$message.warning("已取消上传");
        });
    },
    delBatch(info) {
      this.$confirm(`该操作将从本课程目标中删除学生${info.name}?`, "提示", {
        confirmButtonText: "我已知晓自己操作的风险, 确定解绑",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        unBind(this.objectId, info.userId).then((res) => {
          if (res.code == 200) {
            this.$message.success("解绑成功");
            this.loadList();
          } else {
            this.$message.error("网络异常, 解绑失败, 请稍后重试");
          }
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  #searchBar {
    .el-input {
      input {
        height: 32px;
      }
    }
  }
  .el-button {
    letter-spacing: 2px;
    padding: 8px 12px;
  }
  .el-dialog {
    width: 58%;
    min-width: 890.975px;
    max-width: 979.188px;
    .el-transfer-panel {
      height: 460px;
      width: 243px;
      .el-transfer-panel__list.is-filterable {
        height: 318px;
        overflow-y: auto;
      }
      .el-transfer-panel__filter .el-input__inner {
        border-radius: 5px;
      }
      .el-transfer-panel__footer {
        padding: 0 10px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
    }
  }
}
#container {
  padding: 10px 20px;
  #searchBar {
    display: flex;
  }
  #sec {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding: 8px 0.5% 20px 0.5%;
    height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
    align-items: center;
    #block {
      height: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
