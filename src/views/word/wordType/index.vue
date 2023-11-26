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
                v-model="key"
                placeholder="查询你需要的词汇"
                clearable
              />
              <div class="searchButtons">
                <el-button @click="key = ''">重置</el-button>
                <el-button type="primary" @click="search">搜索</el-button>
              </div>
            </div>
          </div>
          <div>
            <el-button
              v-permission="[
                'templateAndWord.wordType',
                'templateAndWord.wordType.add',
              ]"
              type="primary"
              icon="el-icon-circle-plus-outline"
              @click="open({})"
              >添加类型</el-button
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
            :data="typeList"
            border
            height="100%"
            style="width: 100%"
            :row-style="{ minHeight: 50 + 'px', height: 'auto' }"
            :cell-style="{ padding: 5 + 'px' }"
          >
            <el-table-column prop="type" label="类型" align="center">
              <template slot-scope="scope">
                <el-link type="primary">{{ scope.row.type }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="gmtCreate" label="创建时间" />
            <el-table-column prop="gmtModified" label="更新时间" />
            <el-table-column
              v-permission="[
                'templateAndWord.wordType',
                'templateAndWord.wordType.delete',
                'templateAndWord.wordType.update',
              ]"
              fixed="right"
              label="操作"
              width="150"
            >
              <template slot-scope="scope">
                <el-button
                  v-permission="[
                    'templateAndWord.wordType',
                    'templateAndWord.wordType.update',
                  ]"
                  type="text"
                  icon="el-icon-edit-outline"
                  @click="open(scope.row, true)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="[
                    'templateAndWord.wordType',
                    'templateAndWord.wordType.delete',
                  ]"
                  type="text"
                  style="color: #f56c6c"
                  icon="el-icon-delete"
                  @click="deleteWordType(scope.row)"
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
    <el-dialog title="词汇分类" :visible.sync="dialogFormVisible" width="30%">
      <el-form :model="currentType">
        <el-form-item label="类型">
          <el-input v-model="currentType.type" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSuccess">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  deleteWordType,
  saveWordType,
  updateWordType,
  wordTypePage,
} from "@/api/word/wordType";

export default {
  name: "wordTypeTable",
  data() {
    return {
      currentType: {
        id: "",
        type: "",
      },
      isUpdate: false,
      dialogFormVisible: false,
      newType: "",
      loading: false,
      typeList: [],
      page: 1,
      pageSize: 5,
      total: 0,
      key: "",
    };
  },
  created() {
    this.loadList();
  },
  methods: {
    loadList() {
      this.loading = true;
      wordTypePage({
        page: this.page,
        pageSize: this.pageSize,
        key: this.key,
        withDate: false,
      }).then((res) => {
        const { data } = res;
        this.typeList = data.list;
        this.total = Number(data.total);
        this.loading = false;
      });
    },
    search() {
      this.loadList();
    },
    // 删除
    deleteWordType(type) {
      this.$confirm(`确认删除词汇<${type.type}>吗?`, "警告", {
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteWordType(type.id);
        })
        .finally((res) => {
          this.loadList();
        });
    },
    // 打开
    open(type, isUpdate = false) {
      this.dialogFormVisible = true;
      this.isUpdate = isUpdate;
      if (isUpdate) {
        this.currentType = type;
      } else {
        this.currentType = {};
      }
    },
    // 成功
    handleSuccess() {
      if (this.isUpdate) {
        updateWordType(this.currentType).then((res) => {
          this.$message.success("更新成功");
        });
      } else {
        saveWordType(this.currentType).then((res) => {
          this.$message.success("添加成功");
        });
      }
      this.dialogFormVisible = false;
      this.loadList();
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.loadList();
    },
    handlePageChange(newPage) {
      this.page = newPage;
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
