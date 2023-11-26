<template>
  <div v-loading="loading" class="page">
    <div class="header">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="item">
            <div class="label">角色名：</div>
            <el-input
              v-model="queryParams.key"
              placeholder="请输入角色名"
              clearable
              size="small"
            />
          </div>
        </el-col>
        <el-col :span="5">
          <el-button size="small" @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="!queryParams.key"
            @click="queryTableData"
            >搜索</el-button
          >
          <el-button
            v-permission="['user.role.add']"
            type="primary"
            size="small"
            @click="handleAdd"
            >新增角色</el-button
          >
        </el-col>
      </el-row>
    </div>

    <el-table
      :data="tableData"
      border
      stripe
      height="calc(100vh - 174px)"
      :row-style="{ minHeight: 50 + 'px', height: 'auto' }"
      :cell-style="{ padding: 5 + 'px' }"
    >
      <el-table-column prop="roleName" align="center" label="角色名" />
      <el-table-column prop="roleKey" align="center" label="角色关键字" />
      <el-table-column prop="permissionNames" align="center" label="角色权限">
        <template slot-scope="scope">
          {{
            scope.row.permissionNames && scope.row.permissionNames.length
              ? scope.row.permissionNames.join(",")
              : ""
          }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="
          ['user.role.update', 'user.role.delete'].some((p) =>
            userPermissions.includes(p)
          )
        "
        align="center"
        label="操作"
        width="200"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.roleKey != 'root'">
            <el-button
              v-permission="['user.role.update']"
              type="text"
              icon="el-icon-edit-outline"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              v-permission="['user.role.delete']"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </div>
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
      v-permission="['user.role.add', 'user.role.update']"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="40%"
      :before-close="handleClose"
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input
            v-model="form.roleName"
            placeholder="请输入角色名"
            size="small"
            clearable
          />
        </el-form-item>
        <el-form-item label="roleKey" prop="roleKey">
          <el-input
            v-model="form.roleKey"
            placeholder="输入rolekey, 建议英文、直白、易懂, 例如: user、studentManage"
            size="small"
            clearable
          />
        </el-form-item>
        <el-form-item label="配置角色权限" prop="permissions">
          <impovedSelectTree
            width="100%"
            :collapse="false"
            :origin-value="form.permissions"
            :tree="treeSelectList"
            :tree-props="{
              id: 'id',
              label: 'permissionName',
              children: 'children',
            }"
            @receiveData="receiveData"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { rolePageApi, addRole, updateRole, deleteRole } from "@/api/role";
import { getAllPermissions } from "@/api/permissionCtrl";
import { mapGetters } from "vuex";
export default {
  name: "roleTable",
  components: {
    impovedSelectTree: () => import("@/components/improvedSelectTree"),
  },
  data() {
    return {
      loading: false,
      tableData: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        key: "",
      },
      total: 0,
      dialogVisible: false,
      dialogTitle: "新增角色",
      form: {
        roleName: "",
        roleKey: "",
        permissions: [],
      },
      rules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
        ],
        roleKey: [
          { required: true, message: "请输入角色关键字", trigger: "blur" },
        ],
        permissions: [
          { required: true, message: "请选择角色权限", trigger: "blur" },
        ],
      },
      treeSelectList: [],
      formLoading: false,
    };
  },
  created() {
    this.queryTableData();
  },
  mounted() {
    if (
      ["user.permission", "*"].some((p) => this.userPermissions.includes(p))
    ) {
      this.queryPermissionTree();
    }
  },
  computed: {
    ...mapGetters(["userPermissions"]),
  },
  methods: {
    queryPermissionTree() {
      getAllPermissions().then((res) => {
        // 将部分节点设置为默认必选
        const initFn = (arr) => {
          arr.forEach((item) => {
            item["disabled"] = item.id == "301";
            if (item.children && item.children.length > 0) {
              initFn(item.children);
            }
          });
          return arr;
        };
        res.data = initFn(res.data);
        this.treeSelectList = res.data ?? [];
      });
    },
    handleReset() {
      this.queryParams.key = null;
      this.queryTableData();
    },
    queryTableData() {
      this.loading = true;
      rolePageApi(this.queryParams)
        .then(({ data }) => {
          const { list, total } = data;
          this.tableData = list;
          this.total = Number(total);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleClose() {
      setTimeout(() => {
        this.form = {
          roleName: "",
          roleKey: "",
          permissions: [],
        };
      }, 400);
      this.dialogVisible = false;
    },
    handleAdd() {
      this.dialogTitle = "新增角色";
      this.form = {
        roleName: "",
        roleKey: "",
        permissions: [],
      };
      this.dialogVisible = true;
    },
    // 接收子组件处理的更新的值
    receiveData(data) {
      this.form.permissions = JSON.parse(JSON.stringify(data));
    },
    async handleEdit(row) {
      this.dialogTitle = "编辑角色";
      this.form = JSON.parse(JSON.stringify(row));
      this.form.permissions = (await row.permissions)
        ? [...row.permissions]
        : [];
      this.dialogVisible = true;
    },
    handleDelete(row) {
      this.$confirm("确认删除？").then(() => {
        this.loading = true;
        deleteRole(row.id)
          .then(({ code }) => {
            if (code == 200) {
              if (this.queryParams.pageNum > 1 && this.tableData.length === 1) {
                this.queryParams.pageNum--;
              }
              this.queryTableData();
              this.$message.success("删除成功");
            }
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoading = true;
          const method = this.dialogTitle === "新增角色" ? addRole : updateRole;
          method(this.form)
            .then((res) => {
              if (res.code == 200) {
                this.$message.success("操作成功");
                this.handleClose();
                this.queryTableData();
              } else {
                this.$message.error(res.message);
              }
            })
            .finally(() => {
              this.formLoading = false;
            });
        }
      });
    },
    handleSizeChange(newSize) {
      this.queryParams.pageSize = newSize;
      this.queryTableData();
    },
    handlePageChange(newPage) {
      this.queryParams.pageNum = newPage;
      console.log(this.queryParams);
      this.queryTableData();
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100%;
  padding: 10px;

  .header {
    padding: 10px;
    background: #fff;
    margin-bottom: 10px;
    padding-left: 10%;

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
