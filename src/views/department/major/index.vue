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
                v-model="pagination.key"
                placeholder="查询你需要的专业"
                clearable
              />
              <div class="searchButtons">
                <el-button
                  @click="
                    pagination.key = '';
                    loadList();
                  "
                  >重置</el-button
                >
                <el-button
                  type="primary"
                  :disabled="!pagination.key"
                  @click="loadList()"
                  >搜索</el-button
                >
              </div>
            </div>
          </div>
          <div>
            <span style="color: #5a5e66">学院筛选:&nbsp;</span>
            <el-select
              v-model="departmentIdList"
              multiple
              collapse-tags
              filterable
              clearable
              placeholder="筛选学院"
              style="width: 380px"
              @change="loadList"
            >
              <el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.departmentName"
                :value="item.id"
              />
            </el-select>
          </div>
          <div>
            <el-button
              v-permission="['user.major', 'user.major.add']"
              type="primary"
              icon="el-icon-circle-plus-outline"
              @click="openModal(undefined)"
              >添加专业</el-button
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
            :data="majorList"
            border
            height="100%"
            style="width: 100%"
            :row-style="{ minHeight: 50 + 'px', height: 'auto' }"
            :cell-style="{ padding: 5 + 'px' }"
          >
            <el-table-column
              fixed
              align="center"
              prop="majorName"
              label="专业名"
            />
            <el-table-column
              prop="department"
              label="学院"
              width="350"
              align="center"
              column-key="department"
            >
              <template slot-scope="scope">
                <el-tag>{{ scope.row.department }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="gmtCreate" label="创建时间" width="180" />
            <el-table-column prop="gmtModified" label="更新时间" width="180" />
            <el-table-column
              v-permission="[
                'user.major',
                'user.major.update',
                'user.major.delete',
              ]"
              fixed="right"
              label="操作"
              width="150"
            >
              <template slot-scope="scope">
                <el-button
                  v-permission="['user.major', 'user.major.update']"
                  type="text"
                  icon="el-icon-edit-outline"
                  @click="openModal(scope.row.id, true)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="['user.major', 'user.major.delete']"
                  type="text"
                  style="color: #f56c6c"
                  icon="el-icon-delete"
                  @click="removeMajor(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div style="display: flex; align-items: flex-start; height: 8%">
          <el-pagination
            :current-page="pagination.page"
            :page-sizes="[10, 15, 20, 30]"
            :page-size.sync="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-col>
    </el-row>
    <major-modal
      :major-id="currentMajorId"
      :is-update="isUpdate"
      :major-modal-visible="majorModalVisible"
      @success="handleSuccess"
      @close="handleClose"
    />
  </div>
</template>
<script>
import { deleteMajor, majorPage } from "@/api/department/major";
import departmentApi from "@/api/department/department";
import MajorModal from "@/views/department/major/majorModal.vue";
export default {
  name: "majorTable",
  components: { MajorModal },
  data() {
    return {
      majorModalVisible: false,
      currentMajorId: undefined,
      isUpdate: false,
      pagination: {
        key: "",
        page: 1,
        pageSize: 10,
        departmentId: -1,
      },
      loading: false,
      departmentIdList: [],
      majorList: [],
      departmentList: [],
      total: 0,
    };
  },
  created() {
    this.initializeFilter();
    this.loadList();
  },
  methods: {
    openModal(majorId, isUpdate = false) {
      this.currentMajorId = majorId;
      this.isUpdate = isUpdate;
      this.majorModalVisible = true;
    },
    initializeFilter() {
      departmentApi.getDepartmentList("", 1, 100).then((res) => {
        const { data } = res;
        this.departmentList = data.list;
      });
    },
    loadList() {
      this.loading = true;
      majorPage({ ...this.pagination }, this.departmentIdList).then((res) => {
        const { data } = res;
        this.majorList = data.list;
        this.total = Number(data.total);
        this.loading = false;
      });
    },
    removeMajor(major) {
      this.$confirm(`确认删除专业<${index.majorName}>吗?`, "警告", {
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteMajor(index.id).then((res) => {
            this.$message.success("删除成功");
          });
        })
        .finally(() => {
          this.loadList();
        });
    },
    handleSuccess() {
      this.majorModalVisible = false;
      this.loadList();
    },
    handleClose() {
      this.majorModalVisible = false;
    },
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize;
      this.loadList();
    },
    handlePageChange(newPage) {
      this.pagination.page = newPage;
      this.loadList();
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
