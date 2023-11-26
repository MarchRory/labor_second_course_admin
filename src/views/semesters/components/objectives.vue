<template>
  <div
    id="container"
    v-permission="[
      'curriculum.courseObjectives.add',
      'curriculum.courseObjectives.update',
      'curriculum.courseObjectives.delete',
    ]"
  >
    <el-row
      :gutter="0"
      type="flex"
      justify="space-between"
      align="middle"
      style="margin-bottom: 10px; flex-direction: column"
    >
      <el-col :span="5" style="position: relative; left: -39%">
        <h1>{{ semesterInfo.semesterName }}</h1>
      </el-col>
      <el-col :span="23" style="display: flex; justify-content: space-between">
        <div id="searchBar">
          <el-input
            v-model="keyWords"
            placeholder="输入关键词搜索目标"
            style="margin-right: 15px"
          />
          <el-button :disabled="keyWords == ''" @click="keyWords = ''"
            >重置</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-search"
            :disabled="keyWords == ''"
            @click="search"
            >搜索</el-button
          >
        </div>
        <el-popover
          v-model="addVisible"
          v-permission="['curriculum.courseObjectives.add']"
          placement="left"
          width="300"
        >
          <div id="create">
            <el-form
              ref="ruleForm"
              :model="newObject"
              label-width="120px"
              :rules="rules"
            >
              <el-form-item
                label="课程目标"
                :rules="[
                  { required: true, message: '目标名不能为空' },
                  { type: 'string', message: '目标名应当为字符串' },
                ]"
              >
                <el-input
                  v-model="newObject.objectivesName"
                  placeholder="请输入内容"
                />
              </el-form-item>
              <el-form-item label="最低修读学分" prop="fixRestrictions">
                <el-input
                  v-model.number="newObject.fixRestrictions"
                  placeholder="> 0"
                />
              </el-form-item>
              <el-form-item>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="addVisible = false"
                    >取消</el-button
                  >
                  <el-button
                    type="primary"
                    size="mini"
                    @click="addObject('ruleForm')"
                    >新建</el-button
                  >
                </div>
              </el-form-item>
            </el-form>
          </div>
          <el-button
            slot="reference"
            style="margin-right: 10px"
            type="primary"
            plain
            icon="el-icon-circle-plus-outline"
            >创建目标</el-button
          >
        </el-popover>
      </el-col>
    </el-row>

    <el-row id="sec" v-loading="loading" :gutter="0">
      <el-col style="height: 85%">
        <el-table :data="objectivesList" height="100%">
          <el-table-column label="序号" align="center" min-width="100">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="目标" align="center" min-width="150">
            <template slot-scope="scope">
              <div>
                <span v-if="!scope.row.isEdit">{{
                  scope.row.objectivesName
                }}</span>
                <el-input v-else v-model="scope.row.objectivesName" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="最低修读学分" align="center" min-width="50">
            <template slot-scope="scope">
              <div>
                <span v-if="!scope.row.isEdit">{{
                  scope.row.fixRestrictions
                }}</span>

                <el-input v-else v-model.number="scope.row.fixRestrictions" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="绑定课程" align="center" min-width="80">
            <template slot-scope="scope">
              <div>
                <el-button
                  type="text"
                  icon="el-icon-date"
                  @click="openCourses(scope.row.id)"
                  >查看</el-button
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-permission="['curriculum.course.student']"
            label="绑定学生"
            align="center"
            min-width="80"
          >
            <template slot-scope="scope">
              <div>
                <el-button
                  type="text"
                  icon="el-icon-date"
                  @click="openBindUser(scope.row.id)"
                  >查看</el-button
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-permission="[
              'curriculum.courseObjectives.update',
              'curriculum.courseObjectives.delete',
            ]"
            label="操作"
            align="center"
            min-width="80"
          >
            <template slot-scope="scope">
              <div v-if="!scope.row.isEdit">
                <el-button
                  v-permission="['curriculum.courseObjectives.update']"
                  type="text"
                  icon="el-icon-setting"
                  @click="edit(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="['curriculum.courseObjectives.delete']"
                  type="text"
                  style="color: rgb(237, 34, 34)"
                  icon="el-icon-delete"
                  @click="del(scope.row.id)"
                  >删除</el-button
                >
              </div>
              <div v-else>
                <el-button
                  type="text"
                  icon="el-icon-close"
                  @click="quit(scope.$index, scope.row)"
                  >取消</el-button
                >
                <el-button
                  v-permission="['curriculum.courseObjectives.update']"
                  type="text"
                  icon="el-icon-edit-outline"
                  @click="modify(scope.$index, scope.row)"
                  >修改</el-button
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
          layout="total,sizes, prev, pager, next, jumper"
          :current-page="page"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-col>
    </el-row>

    <el-drawer
      v-permission="['curriculum.courseObjectives.update']"
      title="课程绑定"
      :visible.sync="courseBindVisible"
      :close-on-press-escape="false"
      :wrapper-closable="false"
      :append-to-body="true"
      direction="rtl"
      size="80%"
    >
      <courseBind
        v-if="courseBindVisible"
        :object-id="Number(objectId)"
        :start="semesterInfo.start"
        :end="semesterInfo.end"
        :semester-id="Number(semesterInfo.id)"
      />
    </el-drawer>

    <el-drawer
      v-permission="['curriculum.courseObjectives.student']"
      title="学生绑定"
      :visible.sync="stuBindVisible"
      :close-on-press-escape="false"
      :wrapper-closable="false"
      :append-to-body="true"
      direction="rtl"
      size="80%"
    >
      <stuBind v-if="stuBindVisible" :object-id="Number(objectId)" />
    </el-drawer>
  </div>
</template>

<script>
import * as rq from "@/api/semesterAndObjectives/objectives";
export default {
  name: "SemestersObjectives",
  components: {
    stuBind: () => import("./stuBind.vue"),
    courseBind: () => import("./courseBind.vue"),
  },
  props: {
    semesterInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    var checkFixRestrictions = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("学分不能为空"));
      } else if (!Number.isInteger(value) || value < 1) {
        return callback(new Error("学分应为正整数"));
      } else {
        callback();
      }
    };
    return {
      page: 1,
      pageSize: 10,
      keyWords: "",
      newObject: {
        semesterId: null,
        objectivesName: "",
        fixRestrictions: "",
      },
      rules: {
        fixRestrictions: [{ validator: checkFixRestrictions, trigger: "blur" }],
      },
      objectivesList: [],
      addVisible: false,
      delList: [],
      total: 0,
      loading: false,
      isEdit: false,
      tempGoal: null,
      tempScore: null,
      courseBindVisible: false,
      objectId: null,
      stuBindVisible: false,
    };
  },
  computed: {},
  watch: {
    addVisible(newer, older) {
      if (!newer) {
        setTimeout(() => {
          this.newObject.objectivesName = this.newObject.fixRestrictions = "";
        }, 800);
      }
    },
    keyWords(newer, older) {
      if (newer == "") {
        this.page = 1;
        this.getList();
      }
    },
    semesterInfo(newer, older) {
      this.newObject.semesterId = newer.id;
    },
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      rq.searchObjectives(
        this.page,
        this.pageSize,
        this.keyWords,
        this.semesterInfo.id
      )
        .then((res) => {
          if (res.code == 200) {
            res.data.list.forEach((item, index) => {
              res.data.list[index].isEdit = false;
            });
            this.objectivesList = res.data.list;
            this.total = Number(res.data.total);
          } else {
            this.$message.error("服务器异常, 请稍后重试");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.getList();
    },
    handleCurrentChange(newPage) {
      this.page = newPage;
      this.getList();
    },
    addObject(ruleForm) {
      this.$refs[ruleForm].validate((valid) => {
        if (valid) {
          rq.addObjectives(this.newObject).then((res) => {
            if (res.code == 200) {
              this.getList();
              this.addVisible = false;
              this.$message.success("创建成功");
            } else {
              this.$message.error("服务器异常, 请稍后重试");
            }
          });
        } else {
          this.$message.error("请先修正表单的错误");
        }
      });
    },
    del(id) {
      this.$confirm("此操作将永久删除该目标及其相关数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$confirm(
          "再次提醒, 此操作将会删除该课程目标及其所绑定的全部课程数据, 存在重要数据丢失风险, 您已知晓该风险, 并决定继续删除吗?",
          "提示",
          {
            confirmButtonText: "我已知晓风险, 继续删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          rq.deleteObjectives(id).then((res) => {
            if ((res.code = 200)) {
              if (this.objectivesList.length === 1 && this.page > 1) {
                this.page--;
              }
              this.getList();
              this.$message.success("删除成功");
            } else {
              this.$message.error("服务器异常, 请稍后重试");
            }
          });
        });
      });
    },
    openCourses(id) {
      this.objectId = id;
      this.courseBindVisible = true;
    },
    edit(info) {
      this.objectivesList.forEach((item) => {
        item.isEdit = false;
      });
      info.isEdit = true;
      this.tempGoal = info.objectivesName;
      this.tempScore = info.fixRestrictions;
    },
    quit(index, info) {
      info.objectivesName = this.tempGoal;
      info.fixRestrictions = this.tempScore;
      info.isEdit = false;
    },
    modify(index, info) {
      if (
        info.objectivesName == this.tempGoal &&
        info.fixRestrictions == this.tempScore
      ) {
        this.$message.warning("信息无变化");
      } else if (info.objectivesName == "") {
        this.$message.error("目标名不能为空");
      } else if (
        !Number.isInteger(info.fixRestrictions) ||
        info.fixRestrictions < 1
      ) {
        this.$message.error("学分应当为正整数");
      } else {
        const newInfo = JSON.parse(JSON.stringify(info));
        delete newInfo["isEdit"];
        rq.modifyObjectives(newInfo).then((res) => {
          if (res.code == 200) {
            info.isEdit = false;
            this.$message.success("更新成功");
          } else {
            this.$message.error("服务器异常, 请稍后重试");
          }
        });
      }
    },
    openBindUser(objectId) {
      this.stuBindVisible = true;
      this.objectId = objectId;
    },
    search() {
      this.page = 1;
      this.getList();
    },
    /*     handleOpenCourseDetail(query) {
      this.$router.push({
        path: "/nested/lessonsManage/lessonDetail",
        query,
      });
    }, */
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-input-group {
    margin-bottom: 10px;
    .el-input-group__prepend {
      padding: 0 10px;
    }
  }
  #searchBar {
    .el-input {
      input {
        height: 32px;
      }
    }
  }
  .el-drawer__header {
    margin-bottom: 10px;
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
