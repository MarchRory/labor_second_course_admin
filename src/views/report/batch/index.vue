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
        <div
          class="searchBar"
          style="display: flex; justify-content: space-between"
        >
          <div style="display: flex; flex-direction: row; align-items: center">
            <div style="width: 15%">关键词:&nbsp;</div>
            <el-input
              v-model="key"
              style="width: 180px"
              placeholder="查询..."
              clearable
            />
            <div class="searchButtons">
              <el-button
                @click="
                  key = '';
                  loadList();
                "
                >重置</el-button
              >
              <el-button type="primary" :disabled="!key" @click="loadList"
                >搜索</el-button
              >
            </div>
          </div>
          <div>
            <el-button
              v-permission="['curriculum.report', 'curriculum.report.add']"
              type="primary"
              icon="el-icon-circle-plus-outline"
              @click="open(undefined, false)"
              >生成报告</el-button
            >
          </div>
        </div>
      </el-col>
      <el-col :span="24" class="box mainArea">
        <div
          style="width: 100%; height: 90%; margin-top: 10px; overflow-y: scroll"
        >
          <el-table
            v-loading="loading"
            :data="batchList"
            border
            stripe
            height="100%"
            style="width: 100%"
            @filter-change="filterChangeHandler"
          >
            <el-table-column
              v-loading="loading"
              fixed
              min-width="60"
              prop="cover"
              label="封面"
            >
              <template slot-scope="scope">
                <div style="width: 100%; display: flex">
                  <el-image
                    lazy
                    style="height: 100px; margin: 0 auto"
                    :src="scope.row.cover"
                    fit="contain"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-loading="loading"
              fixed
              prop="reportBatchName"
              label="名称"
            >
              <template slot-scope="scope">
                <el-button type="text" @click="openDetails(scope.row.id)">
                  <span class="batch-name">
                    {{ scope.row.reportBatchName }}
                  </span>
                </el-button>
              </template>
            </el-table-column>

            <el-table-column prop="start" label="数据收集时间" width="155">
              <template slot-scope="scope">
                <div style="text-align: center">
                  <el-tag>{{ scope.row.start }}</el-tag>
                  <i
                    style="display: block; margin: 0 auto; color: #1b65b9"
                    class="el-icon-d-caret"
                  />
                  <el-tag>{{ scope.row.end }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="state"
              label="状态"
              width="120"
              column-key="state"
              :filter-multiple="false"
              :filters="stateFilters"
            >
              <template slot-scope="scope">
                <el-tag v-if="scope.row.state === 3" type="success">
                  <i class="el-icon-document-checked" />已完成
                </el-tag>
                <el-tag v-else-if="scope.row.state === -1" type="danger">
                  <i class="el-icon-s-release" />错误...
                </el-tag>
                <el-tag v-else type="info">
                  <i class="el-icon-loading" />生成中
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="visibility"
              label="学生可见"
              width="150"
              column-key="visibility"
              :filter-multiple="false"
              :filters="visibleFilters"
            >
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.visibility"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  active-text="可见"
                  inactive-text="隐藏"
                  :active-value="1"
                  :inactive-value="0"
                  @change="(type) => updateVisible(scope.row.id, type)"
                />
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  style="color: #67c23a"
                  icon="el-icon-tickets"
                  @click="openDetails(scope.row.id)"
                  >详情</el-button
                >
                <el-button
                  v-permission="[
                    'curriculum.report',
                    'curriculum.report.update',
                  ]"
                  type="text"
                  style="color: #409eff"
                  icon="el-icon-edit-outline"
                  @click="open(scope.row.id)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="[
                    'curriculum.report',
                    'curriculum.report.delete',
                  ]"
                  type="text"
                  style="color: #f56c6c"
                  icon="el-icon-delete"
                  @click="removeBatch(scope.row.id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div style="display: flex; align-items: flex-start; height: 8%">
          <el-pagination
            :current-page="page"
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
    <batch-modal
      :batch-id="currentBatchId"
      :is-update="isUpdate"
      :batch-modal-visible="batchModalVisible"
      @close="handleClose"
      @success="handleSuccess"
    />
  </div>
</template>

<script>
import {
  batchPage,
  deleteReportBatch,
  updateReportBatch,
} from "@/api/report/AcademicYearReport";
export default {
  name: "reportBatchTable",
  components: { BatchModal: () => import("./batchModal.vue") },
  data() {
    return {
      key: undefined,
      state: 0,
      visibility: -1,
      currentBatchId: "",
      isUpdate: false,
      batchModalVisible: false,
      loading: false,
      batchList: [],
      page: 1,
      pageSize: 5,
      total: 0,
      stateFilters: [
        { text: "完成", value: 3 },
        { text: "生成中", value: 2 },
        { text: "异常", value: -1 },
      ],
      visibleFilters: [
        { text: "可见", value: 1 },
        { text: "隐藏", value: 0 },
      ],
    };
  },
  created() {
    this.loadList();
  },
  watch: {
    key: {
      handler(newVal) {
        if (newVal == "") {
          this.loadList();
        }
      },
    },
  },
  methods: {
    updateVisible(id, visibility) {
      updateReportBatch({ id, visibility })
        .then((res) => {
          this.$message.success("设置成功");
        })
        .catch((res) => {
          this.$message.error("失败");
        })
        .finally(() => {
          this.loadList();
        });
    },
    loadList() {
      this.loading = true;
      batchPage({
        page: this.page,
        pageSize: this.pageSize,
        visibility: this.visibility,
        key: this.key,
        state: this.state,
      }).then((res) => {
        const { data } = res;
        this.batchList = data.list;
        this.total = Number(data.total);
        this.loading = false;
      });
    },
    openDetails(batchId) {
      this.$router.push({ name: "BatchReportDetails", query: { batchId } });
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.loadList();
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.loadList();
    },
    removeBatch(id) {
      this.$confirm(`确认删除吗?`, "警告", {
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteReportBatch(id)
            .then((res) => {
              this.$message.success(res.message);
            })
            .catch((res) => {
              this.$message.error(res.message);
            });
        })
        .finally(() => {
          this.loadList();
        });
    },
    open(batchId, isUpdate = true) {
      this.currentBatchId = batchId;
      this.isUpdate = isUpdate;
      this.batchModalVisible = true;
    },
    filterChangeHandler(filter) {
      const key = Object.keys(filter)[0];
      if (key === "visibility") {
        this.visibility = filter?.visibility?.at(0);
      }
      if (key === "state") {
        this.state = filter?.state?.at(0);
      }
      //   重新加载数据
      this.loadList();
    },
    handleSuccess() {
      this.batchModalVisible = false;
      this.loadList();
    },
    handleClose() {
      this.batchModalVisible = false;
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
      height: 9%;
      .searchBar {
        height: 60px;
        padding: 5px 5% 5px 1%;
        width: 100%;
        background-color: #ffffff;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end; /* 子元素右对齐 */
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
        .searchBar {
          display: flex;
          flex-direction: row;
          justify-content: flex-end; /* 子元素右对齐 */
        }
      }
    }
    .mainArea {
      height: 90.5%;
      justify-content: space-between;
    }
  }
  .batch-name {
    margin-left: 10px;
    font-size: 24px;
    color: #409dfd;
  }
  .batch-name:hover {
    text-decoration: underline;
  }
}
</style>
