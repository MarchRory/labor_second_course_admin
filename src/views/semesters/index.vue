<template>
  <div class="container">
    <el-row
      id="fir"
      :gutter="0"
      type="flex"
      justify="space-between"
      align="middle"
    >
      <el-col :span="5" class="guideFont"> 学期安排 </el-col>
      <el-col :span="5">
        <el-button
          v-permission="['curriculum.semester.add']"
          v-debounce
          type="primary"
          icon="el-icon-circle-plus-outline"
          @click="openCorpus"
          >新增学期</el-button
        >
      </el-col>
    </el-row>

    <el-row id="sec" v-loading="loading" :gutter="0">
      <el-col style="height: 90%">
        <el-table
          :data="showData.slice((page - 1) * pageSize, page * pageSize)"
          height="100%"
        >
          <el-table-column label="序号" align="center" min-width="100">
            <template slot-scope="scope"> {{ scope.$index + 1 }} </template>>
          </el-table-column>
          <el-table-column
            label="学期"
            align="center"
            prop="semesterName"
            min-width="150"
          />
          <el-table-column
            label="开始时间"
            prop="start"
            align="center"
            min-width="180"
          >
            <template slot-scope="scope">
              <div>
                {{ scope.row.start.substring(0, 11) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="离校时间"
            prop="end"
            align="center"
            min-width="180"
          >
            <template slot-scope="scope">
              <div>
                {{ scope.row.end.substring(0, 11) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="课程目标" align="center" min-width="80">
            <template slot-scope="scope">
              <div>
                <el-button
                  v-permission="[
                    'curriculum.courseObjectives.add',
                    'curriculum.courseObjectives.update',
                    'curriculum.courseObjectives.delete',
                  ]"
                  type="text"
                  icon="el-icon-date"
                  @click="openDetail(scope.row)"
                  >查看</el-button
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="100">
            <template slot-scope="scope">
              <div style="display: flex; justify-content: space-around">
                <el-button
                  v-permission="['curriculum.semester.update']"
                  type="text"
                  icon="el-icon-edit-outline"
                  @click="update(scope)"
                  >编辑</el-button
                >
                <el-button
                  v-if="now < parseInt(scope.row.start.replaceAll('-', ''))"
                  v-permission="['curriculum.semester.delete']"
                  type="text"
                  style="color: rgb(237, 34, 34)"
                  icon="el-icon-delete"
                  @click="del(scope.row.id)"
                  >删除</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>

      <el-col id="block">
        <el-pagination
          background
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 40]"
          layout="total ,sizes, prev, pager, next, jumper"
          :current-page="page"
          :total="showData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-col>
    </el-row>

    <el-dialog
      title="新增学期"
      :visible.sync="centerDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
    >
      <el-form label-position="right" label-width="80px">
        <el-form-item label="学期">
          <div style="display: flex; justify-content: flex-start">
            <el-date-picker
              v-model="semesterTime"
              style="width: 40%"
              type="year"
              value-format="yyyy"
              placeholder="选择年"
            />
            <el-select
              v-model="whichSemester"
              collapse-tags
              style="margin-left: 10px; width: 50%"
              placeholder="请选择学期"
            >
              <el-option label="春季学期" value="春季学期" />
              <el-option label="秋季学期" value="秋季学期" />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item label="始末时间">
          <div
            style="
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-around;
              width: 98%;
              margin-left: -3%;
            "
          >
            <el-date-picker
              v-model="semesterInfo.start"
              style="width: 40%"
              type="date"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="开学时间"
            />
            <div>至</div>
            <el-date-picker
              v-model="semesterInfo.end"
              style="width: 40%"
              type="date"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="离校时间"
            />
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button
          v-permission="[
            'curriculum.semester.add',
            'curriculum.semester.update',
          ]"
          type="primary"
          :disabled="submitDisabled"
          @click="submit"
          >{{ isUpdate ? "修改" : "创建" }}</el-button
        >
      </span>
    </el-dialog>

    <el-drawer
      v-permission="[
        'curriculum.courseObjectives.add',
        'curriculum.courseObjectives.update',
        'curriculum.courseObjectives.delete',
      ]"
      title="学期目标"
      :visible.sync="objectivesVisible"
      :close-on-press-escape="false"
      :wrapper-closable="false"
      direction="rtl"
      size="90%"
    >
      <semesters-objectives
        v-if="objectivesVisible"
        :semester-info="JSON.parse(JSON.stringify(semesterInfo))"
      />
    </el-drawer>
  </div>
</template>

<script>
import * as rq from "@/api/semesterAndObjectives/semester";
import { clearObj } from "@/api/common";
import { mapGetters } from "vuex";
export default {
  name: "semesterTable",
  injects: ["reload"],
  components: {
    semestersObjectives: () => import("./components/objectives.vue"),
  },
  data() {
    return {
      now: null,
      page: 1,
      pageSize: 10,
      keywode: "",
      loading: false,
      showData: [],
      centerDialogVisible: false,
      semesterTime: "",
      whichSemester: "",
      objectivesVisible: false,
      semesterInfo: {
        semesterName: "",
        start: "",
        end: "",
      },
      isUpdate: false,
    };
  },
  create() {},
  watch: {
    centerDialogVisible(newer, older) {
      if (!newer) {
        setTimeout(() => {
          this.semesterTime = this.whichSemester = "";
          this.semesterInfo = {
            semesterName: "",
            start: "",
            end: "",
          };
        }, 800);
      }
    },
  },
  mounted() {
    this.getList();
    this.now = parseInt(
      new Date().toISOString().slice(0, 11).replaceAll("-", "")
    );
  },
  computed: {
    submitDisabled() {
      return (
        this.semesterTime == "" ||
        this.whichSemester == "" ||
        this.semesterInfo.start == "" ||
        this.semesterInfo.end == ""
      );
    },
    ...mapGetters(["semesterId"]),
  },
  methods: {
    getList() {
      this.loading = true;
      rq.getAllSemesters().then((res) => {
        if (res.code === 200) {
          this.showData = res.data;
        } else {
          this.$message.error("服务器异常, 获取数据失败");
        }
      });
      this.loading = false;
    },
    del(id) {
      this.loading = true;
      this.$confirm("此操作将永久删除该学期及其相关数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        rq.deleteSemester(id).then((res) => {
          if (res.code == 200) {
            const index = this.showData.findIndex((item) => item.id === id);
            this.showData.splice(index, 1);
            const length = this.showData.slice(
              (this.page - 1) * this.pageSize,
              this.page * this.pageSize
            ).length;
            if (length === 1 && this.page > 1) {
              this.page -= 1;
            }
            this.$message.success("删除成功");
          } else {
            this.$message.error("服务器异常, 请稍后重试");
          }
        });
      });
      this.loading = false;
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.getList();
    },
    handleCurrentChange(newPage) {
      this.page = newPage;
      this.getList();
    },
    openCorpus() {
      clearObj(this.semesterInfo);
      this.centerDialogVisible = true;
    },
    openDetail(info) {
      this.semesterInfo = JSON.parse(JSON.stringify(info));
      this.objectivesVisible = true;
    },
    update(scope) {
      this.semesterInfo = JSON.parse(JSON.stringify(scope.row));
      const length = [...scope.row.semesterName].length;
      this.semesterTime = scope.row.semesterName.substring(0, length - 5);
      this.whichSemester = scope.row.semesterName.substring(length - 4);
      this.centerDialogVisible = this.isUpdate = true;
    },
    submit() {
      // isUpdate为true则是修改, 反之为创建
      if (this.isUpdate) {
        this.semesterInfo.semesterName =
          this.semesterTime + "年" + this.whichSemester;
        rq.modifySemester(this.semesterInfo).then((res) => {
          if (res.code === 200) {
            const index = this.showData.findIndex(
              (item) => item.id === this.semesterInfo.id
            );
            this.showData[index] = JSON.parse(
              JSON.stringify(this.semesterInfo)
            );
            this.$message.success("更新成功");
          }
        });
      } else {
        this.loading = true;
        if (this.semesterInfo.hasOwnProperty("id")) {
          delete this.semesterInfo["id"];
        }
        this.semesterInfo.semesterName =
          this.semesterTime + "年" + this.whichSemester;
        rq.addSemester(this.semesterInfo).then((res) => {
          if (res.code == 200) {
            this.getList();
            this.$message.success("添加成功");
          } else {
            this.$message.error("服务器异常, 修改失败");
          }
        });
        this.loading = false;
      }
      this.centerDialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-button {
    letter-spacing: 2px;
    padding: 8px 12px;
  }
  #rateBox {
    display: flex;
    align-items: center;
    .el-form-item__content {
      margin-left: 0 !important;
      .el-rate__text {
        font-size: 17px;
      }
    }
  }
  .el-dialog {
    width: 33%;
    min-width: 500px !important;
  }
  .el-drawer__header {
    margin-bottom: 10px;
  }
}
.container {
  width: 100%;
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  align-content: center;
  background-color: #d6d6d640;
  padding: 10px;
  #fir {
    width: 100%;
    height: 60px;
    margin: 0 auto;
    margin-left: 0;
    margin-right: 0;
    padding: 5px 5% 5px 10%;
    background-color: #ffffff;
    margin-bottom: 10px;
    transition: box-shadow 0.25s ease-in;
  }
  #sec {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    background-color: #ffffff;
    padding: 8px 0.5% 20px 0.5%;
    transition: box-shadow 0.25s ease-in;
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
  #fir:hover,
  #sec:hover {
    box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
  }
  .guideFont {
    font-size: 1.6em;
    letter-spacing: 5px;
    font-weight: 700;
  }
  #drawerBox {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
