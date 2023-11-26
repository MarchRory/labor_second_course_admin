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
        <h1>课程目标 — {{ courseObjectives.objectivesName }}</h1>
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
            v-debounce
            type="primary"
            icon="el-icon-search"
            :disabled="keyWords == ''"
            @click="search"
            >搜索</el-button
          >
        </div>

        <div>
          <el-button
            v-debounce
            type="primary"
            icon="el-icon-s-grid"
            @click="edit"
            >批量绑定课程</el-button
          >
        </div>
      </el-col>
    </el-row>

    <el-row id="sec" v-loading="loading" :gutter="0">
      <el-col style="height: 85%">
        <el-table
          :data="showData.slice((page - 1) * pageSize, page * pageSize)"
          height="100%"
        >
          <el-table-column label="序号" align="center" min-width="60">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            label="绑定课程"
            align="center"
            prop="title"
            min-width="150"
          />
          <el-table-column
            label="分类"
            prop="courseCategory"
            :filters="[
              { text: '日常生活劳动', value: '日常生活劳动' },
              { text: '公益服务劳动', value: '公益服务劳动' },
              { text: '生产顶岗劳动', value: '生产顶岗劳动' },
              { text: '劳动理论学习', value: '劳动理论学习' },
              { text: '其他方式劳动', value: '其他方式劳动' },
            ]"
            :filter-method="filterCategory"
            align="center"
            min-width="150"
          />
          <el-table-column
            label="课程状态"
            align="center"
            :filters="[
              { text: '筹备中', value: 1 },
              { text: '报名中', value: 2 },
              { text: '进行中', value: 3 },
              { text: '已结束', value: 4 },
            ]"
            :filter-method="filterStatus"
            min-width="80"
          >
            <template slot-scope="scope">
              <div>
                <el-tag v-if="scope.row.state == 1" type="warning"
                  >筹备中</el-tag
                >
                <el-tag v-else-if="scope.row.state == 2" type="primary"
                  >报名中</el-tag
                >
                <el-tag v-else-if="scope.row.state == 3" type="success"
                  >进行中</el-tag
                >
                <el-tag v-else type="info">已结束</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="课程类型" align="center" min-width="80">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.objectivesType"
                style="display: block"
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="必修"
                inactive-text="选修"
                :active-value="1"
                :inactive-value="0"
                @change="
                  handelObjectivesTypeChange(
                    scope.row.id,
                    scope.row.objectivesType
                  )
                "
              />
            </template>
          </el-table-column>
          <el-table-column
            v-if="false"
            label="操作"
            align="center"
            min-width="80"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-tickets"
                @click="openDetail(scope.row)"
                >查看详情</el-button
              >
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

    <el-dialog
      title="批量绑定课程"
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
          filterable
          filter-placeholder="输入课程名关键词搜索"
          :render-content="renderFunc"
          :titles="['筹备中课程列表', '已绑定课程']"
          :button-texts="['解绑', '绑定']"
          :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}',
          }"
          :data="coursesWareHouse"
        >
          <el-button
            slot="left-footer"
            v-debounce
            class="transfer-footer"
            type="text"
            style="color: rgb(17, 215, 109)"
            icon="el-icon-refresh-right"
            size="middle"
            :disabled="datadisable"
            @click="getCoursesWareHouse"
            >获取数据</el-button
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
  </div>
</template>

<script>
import {
  batchBind,
  getCourseByObject,
  searchObjectivesDetail,
  updateType,
} from "@/api/semesterAndObjectives/objectives";
import { selectCoursePage } from "@/api/lessons";
export default {
  name: "CourseBind",
  props: {
    objectId: {
      type: Number,
      required: true,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    semesterId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      datadisable: false,
      loading: false,
      courseObjectives: {},
      courseList: [],
      showData: [],
      total: 0,
      coursesWareHouse: [],
      page: 1,
      pageSize: 10,
      keyWords: "",
      checkedArray: [],
      dialogTableVisible: false,
      checkedCopy: [],
      renderFunc(h, option) {
        return <span> {option.label} </span>;
      },
      whPage: 1,
      whKeyWords: null,
    };
  },
  computed: {
    bindDisabled() {
      return !this.checkedArray.length;
    },
  },
  watch: {
    keyWords(newer) {
      if (newer == "") {
        this.showData = this.courseList;
      }
    },
    whKeyWords(newer) {
      if (!newer) {
        this.whPage = 1;
        this.getCoursesWareHouse();
      }
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.loading = true;
      searchObjectivesDetail(this.objectId)
        .then((res) => {
          if (res.code == 200) {
            this.courseObjectives = res.data;
          }
        })
        .finally(() => {
          this.loading = false;
        });
      getCourseByObject(this.objectId, {
        pageNum: this.page,
        pageSize: this.pageSize,
      }).then(({ data }) => {
        const { list, total } = data;
        this.showData = list ?? [];
        this.courseList = list ?? [];
        this.coursesWareHouse = this.showData.map((item) => {
          return {
            key: Number(item.id),
            label: item.title,
            disabled: false,
          };
        });
        this.checkedArray = this.showData.map((item) => Number(item.id));
        this.total = Number(total);
      });
    },
    handelObjectivesTypeChange(courseId, objectivesType) {
      updateType(courseId, this.objectId, objectivesType).then((res) => {
        this.$message.success("修改成功");
      });
    },
    getCoursesWareHouse() {
      this.loading = true;
      // 这里默认获取筹备中的课程，因为如果课程都进入报名状态了才添加课程，就太晚了
      selectCoursePage(
        this.keyWords,
        null,
        this.whPage,
        15,
        null,
        null,
        this.semesterId,
        1,
        0
      )
        .then((res) => {
          if (res.code == 200) {
            res.data.list.forEach((item, index) => {
              let tIndex = this.showData.findIndex(
                (ever) => ever.id == item.id
              );
              if (tIndex == -1) {
                this.coursesWareHouse.push({
                  key: Number(item.id),
                  label: item.title,
                  disabled: false,
                });
              }
            });
            if (this.coursesWareHouse.length < res.data.total) {
              this.whPage++;
            } else {
              this.datadisable = true;
            }
          } else {
            this.$message.error("服务器异常, 学期课程库获取失败");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
    },
    handleCurrentChange(currenrPage) {
      this.page = currenrPage;
    },
    /*     openDetail(info) {
      this.$emit("onOpenCourseDetail", { id: info.id, status: info.state });
    }, */
    search() {
      this.loading = true;
      this.page = 1;
      this.showData = this.courseList.filter((item) => {
        return item.title.includes(this.keyWords);
      });
      this.loading = false;
    },
    filterStatus(value, row) {
      return row.status === value;
    },
    filterCategory(value, row) {
      return row.courseCategory === value;
    },
    edit() {
      this.dialogTableVisible = true;
      if (this.whPage == 1) {
        this.getCoursesWareHouse();
      }
    },
    BatchBind() {
      this.$confirm("确定更改该目标绑定的课程吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        batchBind(this.objectId, this.checkedArray).then((res) => {
          if (res.code == 200) {
            this.$message.success("更改绑定成功");
            this.dialogTableVisible = false;
            this.init();
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
