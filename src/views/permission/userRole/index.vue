<template>
  <div v-loading="loading" class="page">
    <div class="header">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="item">
            <div class="label">用户名：</div>
            <el-input
              v-model="keyWords"
              placeholder="请输入角色名"
              clearable
              size="small"
            />
          </div>
        </el-col>
        <el-col :span="4">
          <el-button size="small" @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="!keyWords"
            @click="queryTableData"
            >搜索</el-button
          >
        </el-col>
      </el-row>
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      height="calc(100% - 104px)"
      :row-style="{ height: 50 + 'px' }"
      :cell-style="{ padding: 0 + 'px' }"
    >
      <el-table-column prop="userName" align="center" label="用户名" />
      <el-table-column prop="roleNames" align="center" label="角色">
        <template slot-scope="scope">
          {{
            scope.row.roleNames && scope.row.roleNames.length
              ? scope.row.roleNames.join("、")
              : ""
          }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="
          ['user.user.update', 'user.user.delete'].some((p) =>
            userPermissions.includes(p)
          )
        "
        align="center"
        label="操作"
        width="200"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.id != 1"
            type="text"
            icon="el-icon-edit-outline"
            @click="handleRole(scope.row)"
            >修改角色</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="queryParams.pageNum"
      :page-sizes="[10, 15, 20, 30]"
      :page-size.sync="queryParams.pageSize"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <el-dialog
      v-permission="['user.user.add', 'user.user.update', 'user.user.delete']"
      title="选择角色"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="25vh"
      width="30%"
    >
      <el-select
        v-model="selectedRolesCopy"
        style="width: 100%"
        multiple
        placeholder="请选择"
      >
        <el-option
          v-for="item in roleList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id"
        />
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :disabled="submitDiabled"
          @click="hanldeChange"
          >修 改</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { bindRoleApi, unbindRoleApi, userPageApi } from "@/api/user";
import { getRoles } from "@/api/role";
import { isArrEqual } from "@/api/common";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      loading: false,
      tableData: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      keyWords: "",
      dialogVisible: false,
      total: 0,
      roleList: [],
      selectRoles: [],
      selectedRolesCopy: [],
      userId: null,
    };
  },
  computed: {
    submitDiabled() {
      return isArrEqual(this.selectRoles, this.selectedRolesCopy);
    },
    ...mapGetters(["userPermissions"]),
  },
  watch: {
    keyWords(newVal) {
      if (!newVal) {
        this.queryRoleList();
      }
    },
    dialogVisible(newVal) {
      if (!newVal) {
        setTimeout(() => {
          this.userId = null;
          this.selectRoles = [];
          this.selectedRolesCopy = [];
        }, 480);
      }
    },
    queryParams: {
      handler() {
        this.queryTableData();
      },
      deep: true,
    },
  },
  created() {
    this.queryTableData();
    this.queryRoleList();
  },
  methods: {
    handleReset() {
      this.keyWords = null;
      this.queryTableData();
    },
    queryTableData() {
      this.loading = true;
      userPageApi({
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        key: this.keyWords,
        type: 1,
        withRole: 1,
      })
        .then((res) => {
          this.tableData = res.data.list ?? [];
          this.total = Number(res.data.total ?? 0);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    queryRoleList() {
      getRoles().then((res) => {
        this.roleList = res.data ?? [];
      });
    },
    hanldeChange() {
      this.$confirm("此操作将改变用户的权限, 确定继续吗?", "提示", {
        confirmButtonText: "我已知晓风险, 确定修改",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 绑定的id
        const bindIds = this.selectedRolesCopy.filter(
          (addId) => !this.selectRoles.includes(addId)
        );

        // 删除的id
        const unBindIds = this.selectRoles.filter(
          (delId) => !this.selectedRolesCopy.includes(delId)
        );

        const addFetchs = bindIds.map((addId) =>
          bindRoleApi(this.userId, addId)
        );
        const delFetchs = unBindIds.map((delId) =>
          unbindRoleApi(this.userId, delId)
        );

        Promise.all([...addFetchs, ...delFetchs]).then((res) => {
          if (res.every((item) => item.code === 200)) {
            this.$message.success("修改成功");
            this.dialogVisible = false;
            this.queryTableData();
          } else {
            this.$message.error("发生错误, 请稍后再试");
          }
        });
      });
    },
    handleRole(row) {
      this.userId = row.id;
      this.selectRoles = row.roleIds;
      this.selectedRolesCopy = JSON.parse(JSON.stringify(row.roleIds));
      this.dialogVisible = true;
    },
    handlePageChange(newPage) {
      this.queryParams.pageNum = newPage;
    },
    handleSizeChange(newSize) {
      this.queryParams.pageSize = newSize;
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f5f5f5;

  .header {
    padding: 10px;
    background: #fff;
    margin-bottom: 10px;
    padding-left: 10%;
    /*     .createRole{
      position: relative;
      left: 40%;
      ::v-deep{

      }
    } */
    .item {
      display: flex;
      align-items: center;

      .label {
        width: 100px;
        text-align: right;
        margin-right: 10px;
        color: #838383;
      }
    }
  }

  ::v-deep .el-pagination {
    text-align: center;
    margin-top: 10px;
  }
}
</style>
