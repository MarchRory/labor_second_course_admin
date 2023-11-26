<template>
  <div class="app-container">
    <div class="searchBar">
      <div>
        <div id="keyWords">
          <div style="width: 45%">关键词:&nbsp;</div>
          <el-input
            v-model="keyWords"
            placeholder="根据昵称查找用户"
            clearable
          />
          <div class="searchButtons">
            <el-button :disabled="searchDisabled" @click="keyWords = ''"
              >重置</el-button
            >
            <el-button
              type="primary"
              :disabled="searchDisabled"
              @click="loadList"
              >搜索</el-button
            >
          </div>
        </div>
      </div>
      <div v-permission="['user.user.add']" class="buttons">
        <el-button
          type="primary"
          icon="el-icon-circle-plus-outline"
          @click="handleCreate"
          >添加用户</el-button
        >
      </div>
    </div>

    <div v-loading="loading" class="user-list">
      <el-table
        :data="tableData"
        border
        stripe
        height="calc(100% - 104px)"
        :row-style="{ height: 40 + 'px' }"
        :cell-style="{ padding: 5 + 'px' }"
      >
        <el-table-column label="序号" min-width="50" align="center">
          <template slot-scope="scope">
            <div>
              {{ scope.$index + 1 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="userName"
          label="账号"
          min-width="50"
          align="center"
        />
        <el-table-column
          prop="nickname"
          label="用户名"
          min-width="50"
          align="center"
        />
        <el-table-column label="类别" min-width="50" align="center">
          <template slot-scope="scope">
            <div>
              {{ scope.row.type == 1 ? "教师" : "学生" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="
            ['user.user.update', 'user.user.delete'].some((p) =>
              userPermissions.includes(p)
            )
          "
          fixed="right"
          label="操作"
          min-width="30"
          align="center"
        >
          <template slot-scope="scope">
            <div v-if="scope.row.id != 1" class="buttons">
              <el-button
                v-permission="['user.user.update']"
                type="text"
                icon="el-icon-edit-outline"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-popconfirm
                v-permission="['user.user.delete']"
                confirm-button-text="确定删除"
                cancel-button-text="取消"
                icon="el-icon-info"
                icon-color="red"
                :title="`确认删除用户${scope.row.nickname}吗?`"
                @confirm="handleDel(scope.row.id)"
              >
                <el-button
                  slot="reference"
                  type="text"
                  style="color: #f56c6c"
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
    <UserModal
      v-permission="['user.user.add', 'user.user.update']"
      :dialog-table-visible="dialogTableVisible"
      :user="JSON.parse(JSON.stringify(currentUser))"
      :is-update="isUpdate"
    />
  </div>
</template>

<script>
import { deleteUser, userList, userPageApi } from "@/api/user";
import { mapGetters } from "vuex";
export default {
  name: "userTable",
  components: { UserModal: () => import("./userModal.vue") },
  data() {
    return {
      keyWords: "",
      page: 1,
      pageSize: 10,
      currentUser: {
        userName: "",
        nickname: "",
        password: "",
        type: 1,
      },
      dialogTableVisible: false,
      isUpdate: false,
      loading: false,
      tableData: [],
      total: 0,
      roleList: [],
      selectRoles: [],
    };
  },
  computed: {
    searchDisabled() {
      return this.keyWords === "";
    },
    ...mapGetters(["userPermissions"]),
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
  created() {
    this.loadList();
  },
  mounted() {},
  methods: {
    handleReset() {
      Object.keys(this.queryParams).forEach((key) => {
        if (key !== "pageNum" && key !== "pageSize") {
          this.queryParams[key] = "";
        }
      });
      this.queryTableData();
    },
    handleCreate() {
      this.isUpdate = false;
      Object.keys(this.currentUser).forEach((key) => {
        if (key == "type") {
          this.currentUser[key] = 1;
        } else {
          this.currentUser[key] = "";
        }
      });
      this.dialogTableVisible = true;
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
      this.isUpdate = true;
      this.currentUser = JSON.parse(JSON.stringify(row));
      this.currentUser.password = "";
      this.dialogTableVisible = true;
    },
    handleClose() {
      this.dialogTableVisible = false;
    },
    handleDel(row) {
      deleteUser(row).then((res) => {
        if (res.code == 200) {
          if (this.page > 1 && this.tableData.length === 1) {
            this.page--;
          }
          this.$message.success("删除成功");
          this.loadList();
        }
      });
    },
    loadList() {
      this.loading = true;
      userList({
        pageNum: this.page,
        pageSize: this.pageSize,
        key: this.keyWords,
        type: 1,
      })
        .then((res) => {
          if (res.code === 200) {
            const { list, total } = res.data;
            this.tableData = list;
            this.total = Number(total);
          }
        })
        .finally(() => {
          this.loading = false;
        });
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
  .user-list {
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
