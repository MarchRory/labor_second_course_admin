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
          <div style="width: 350px; color: #828486">
            <span>评分区间:</span>
            <el-input-number
              v-model="levelMin"
              size="mini"
              :min="1"
              :max="levelMax"
            />~
            <el-input-number
              v-model="levelMax"
              size="mini"
              :min="levelMin"
              :max="10"
            />
          </div>
          <div
            v-permission="['templateAndWord.word', 'templateAndWord.word.add']"
          >
            <el-button
              type="success"
              icon="el-icon-circle-plus-outline"
              @click="upload"
              >导入词语</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-circle-plus-outline"
              @click="open(undefined)"
              >添加词语</el-button
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
            :data="wordList"
            border
            height="100%"
            :row-style="{ minHeight: 50 + 'px', height: 'auto' }"
            :cell-style="{ padding: 5 + 'px' }"
            style="width: 100%"
            @sort-change="sortChange"
            @filter-change="filterChangeHandler"
          >
            <el-table-column fixed align="center" prop="word" label="词汇">
              <template slot-scope="scope">
                <el-tag
                  color="success"
                  style="margin-left: 10px; font-size: 16px"
                  >{{ scope.row.word }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="level"
              label="评分"
              min-width="120"
              sortable="custom"
            >
              <template slot-scope="scope">
                <el-rate
                  v-model="scope.row.level"
                  disabled
                  :colors="rateColors"
                  :max="10"
                  show-score
                  text-color="#ff9900"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              min-width="80"
              column-key="type"
              :filter-multiple="false"
              :filters="typeFilters"
            >
              <template slot-scope="scope">
                <el-link type="primary">{{ scope.row.type }}</el-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="partOfSpeech"
              label="词性"
              min-width="80"
              column-key="partOfSpeech"
              :filters="partOfSpeechFilters"
              :filter-multiple="false"
            >
              <template v-slot:default="scope">
                <el-tag
                  v-if="scope.row.partOfSpeech === '名词'"
                  type="primary"
                  >{{ scope.row.partOfSpeech }}</el-tag
                >
                <el-tag
                  v-else-if="scope.row.partOfSpeech === '动词'"
                  type="success"
                  >{{ scope.row.partOfSpeech }}</el-tag
                >
                <el-tag
                  v-else-if="scope.row.partOfSpeech === '形容词'"
                  type="warning"
                  >{{ scope.row.partOfSpeech }}</el-tag
                >
                <el-tag
                  v-else-if="scope.row.partOfSpeech === '副词'"
                  type="danger"
                  >{{ scope.row.partOfSpeech }}</el-tag
                >
                <el-tag v-else type="info">{{ scope.row.partOfSpeech }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="gmtCreate" label="创建时间" width="180" />
            <el-table-column prop="gmtModified" label="更新时间" width="180" />
            <el-table-column
              v-permission="[
                'templateAndWord.word.update',
                'templateAndWord.word.delete',
              ]"
              fixed="right"
              label="操作"
              width="150"
            >
              <template slot-scope="scope">
                <el-button
                  v-permission="[
                    'templateAndWord.word',
                    'templateAndWord.word.update',
                  ]"
                  icon="el-icon-edit-outline"
                  type="text"
                  @click="open(scope.row.id, true)"
                  >编辑</el-button
                >
                <el-button
                  v-permission="[
                    'templateAndWord.word',
                    'templateAndWord.word.delete',
                  ]"
                  type="text"
                  style="color: red"
                  icon="el-icon-delete"
                  @click="deleteWord(scope.row)"
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
    <WordModal
      v-permission="[
        'templateAndWord.word',
        'templateAndWord.word.add',
        'templateAndWord.word.update',
      ]"
      :word-modal-visible="wordModalVisible"
      :word-id="currentId"
      :is-update="isUpdate"
      @success="handleSuccess"
      @close="handleClose"
    />

    <el-dialog
      v-permission="['templateAndWord.word', 'templateAndWord.word.add']"
      title="词语导入"
      :visible.sync="uploadDialogVisible"
      width="30%"
      :before-close="handleUploadClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      center
      accept="xlsx"
    >
      <div style="display: flex; flex-direction: column; align-items: center">
        <el-upload
          drag
          action=""
          :show-file-list="false"
          :http-request="handelUpload"
          multiple
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处自动上传, 或<em>点击上传</em>
          </div>
          <div
            slot="tip"
            class="el-upload__tip"
            style="color: red; margin-top: 10px"
          >
            只能上传xlsx文件, 上传过程不可逆
          </div>
        </el-upload>
        <span
          slot="footer"
          class="dialog-footer"
          style="
            width: 200px;
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
          "
        >
          <el-button @click="handleUploadClose">关闭</el-button>
          <el-button @click="downLoad">下载导入模板</el-button>
          <el-button v-debounce type="success" @click="handleUpdateOver"
            >完成上传</el-button
          >
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  deleteWord,
  downloadUploadTemplate,
  uploadWord,
  wordPage,
} from "@/api/word/word";
import { wordTypePage } from "@/api/word/wordType";
import WordModal from "@/views/word/components/wordModal.vue";
import { handleDownload } from "@/utils/file";

export default {
  name: "wordTable",
  components: { WordModal },
  data() {
    return {
      levelMin: 1,
      levelMax: 10,
      currentId: "",
      isUpdate: false,
      uploadDialogVisible: false,
      wordModalVisible: false,
      loading: false,
      key: "",
      page: 1,
      pageSize: 10,
      total: 0,
      rateColors: ["#99A9BF", "#f3a838", "#f9681f"],
      wordList: [],
      partOfSpeech: null,
      partOfSpeechFilters: [
        { text: "其他", value: 0 },
        { text: "名词", value: 1 },
        { text: "动词", value: 2 },
        { text: "形容词", value: 3 },
        { text: "副词", value: 4 },
      ],
      typeId: undefined,
      typeFilters: [],
      sort: 0,
    };
  },
  created() {
    this.initializeTypeFilter();
    this.loadList();
  },
  methods: {
    // 加载数据
    loadList() {
      this.loading = true;
      wordPage({
        page: this.page,
        pageSize: this.pageSize,
        key: this.key,
        sort: this.sort,
        partOfSpeech: this.partOfSpeech,
        typeId: this.typeId,
        levelMin: this.levelMin - 1,
        levelMax: this.levelMax + 1,
        withDate: true,
      }).then((res) => {
        this.wordList = res.data.list;
        this.total = Number(res.data.total);
        this.loading = false;
      });
    },
    // 加载类型选项
    initializeTypeFilter() {
      wordTypePage({ page: 1, pageSize: 20, withDate: false }).then((res) => {
        const { data } = res;
        this.typeFilters = data.list.map((item) => {
          return { text: item.type, value: item.id };
        });
      });
    },
    // 删除词汇
    deleteWord(word) {
      this.$confirm(`确认删除词汇<${index.word}>吗?`, "警告", {
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteWord(index.id).then((res) => {
            this.$message.success("删除成功");
          });
        })
        .finally(() => {
          this.loadList();
        });
    },
    // 上传点击事件
    upload() {
      this.uploadDialogVisible = true;
    },
    // 过滤器事件
    filterChangeHandler(filter) {
      //   设置词性
      const key = Object.keys(filter)[0];
      if (key === "partOfSpeech") {
        this.partOfSpeech = filter?.partOfSpeech?.at(0);
      }
      if (key === "type") {
        this.typeId = filter?.type?.at(0);
      }
      //   重新加载数据
      this.loadList();
    },
    // 排序事件
    sortChange(column) {
      switch (column.order) {
        case "descending":
          this.sort = 1;
          break;
        case "ascending":
          this.sort = -1;
          break;
        default:
          this.sort = 0;
      }
      this.loadList();
    },
    // 真正的文件下载接口
    downLoad() {
      downloadUploadTemplate()
        .then((data) => {
          if (!data) {
            this.$message.error("获取Excel文件失败");
            return;
          }
          handleDownload("词汇上传模板.xlsx", data);
        })
        .catch((e) => {
          this.$message.error("处理文件时遇到错误");
        });
    },
    // 文件上传
    handelUpload(params) {
      uploadWord(params.file).then((res) => {
        if (res.code == 200) {
          this.$message.success("上传成功");
        } else {
          this.$message.error(res.message);
        }
      });
    },
    // 搜索
    search() {
      this.loadList();
    },
    /**
     * 打开modal
     * @param wordId {string | number}
     * @param isUpdate {boolean}
     */
    open(wordId, isUpdate = false) {
      this.wordModalVisible = true;
      this.isUpdate = isUpdate;
      this.currentId = wordId;
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.loadList();
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.loadList();
    },
    handleSuccess() {
      this.wordModalVisible = false;
      this.loadList();
    },
    handleClose() {
      this.wordModalVisible = false;
    },
    handleUploadClose() {
      this.uploadDialogVisible = false;
    },
    handleUpdateOver() {
      this.uploadDialogVisible = false;
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
