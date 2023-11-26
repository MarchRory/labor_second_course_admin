<template>
  <div v-permission="['curriculum.evaluate']">
    <el-drawer
      title="词汇列表"
      :visible.sync="drawerVisible"
      size="25%"
      :wrapper-closable="false"
      :close-on-press-escape="false"
      :append-to-body="true"
      @close="close"
    >
      <header>待填词汇类型: {{ typeDescription }}</header>
      <div class="mainBox">
        <div class="searchBar">
          <div id="keyWords">
            <el-input
              v-model="pagination.key"
              clearable
              style="width: 95%; display: flex; align-items: center"
              placeholder="关键词查询"
            />
          </div>
          <el-button
            v-debounce
            type="primary"
            size="medium"
            icon="el-icon-search"
            :disabled="pagination.key == ''"
            @click="loadVocabularyList"
            >搜索</el-button
          >
        </div>
        <el-table
          ref="vocabularyTable"
          v-loading="pageLoad"
          :data="vocabularyList"
          highlight-current-row
          style="width: 100%; height: 90%"
          @current-change="handleCurrentChange"
        >
          <el-table-column type="index" min-width="50" label="序号" />
          <el-table-column property="word" label="词汇">
            <template slot-scope="scope">
              <div>
                <el-tag style="cursor: pointer">{{ scope.row.word }}</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <footer>
        <el-pagination
          style="margin-top: 10px; width: fit-content; margin: 10px auto"
          layout="total, prev, pager, next,sizes"
          :pager-count="5"
          :page-sizes="[5, 10, 20, 30]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleVocabularyCurrentChange"
        />
      </footer>
    </el-drawer>
  </div>
</template>

<script>
import { wordPage } from "@/api/word/word";
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false,
      required: true,
    },
    searchParams: {
      type: Object,
      required: true,
      default: {},
    },
    typeDescription: {
      type: String,
    },
  },
  data() {
    return {
      pagination: {
        page: 1,
        pageSize: 30,
        key: "",
        withDate: false,
      },
      drawerVisible: false,
      pageLoad: false,
      vocabularyList: [],
      total: 0,
    };
  },
  computed: {},
  watch: {
    "pagination.page": {
      handler(newVal) {
        this.loadVocabularyList();
      },
    },
    "pagination.page": {
      handler(newVal) {
        this.loadVocabularyList();
      },
    },
    "pagination.key": {
      handler(newVal) {
        if (!newVal) {
          if (this.pagination.page == 1) {
            this.loadVocabularyList();
          } else {
            this.pagination.page = 1;
          }
        }
      },
    },
    searchParams: {
      handler(newVal, oldVal) {
        this.loadVocabularyList();
      },
      deep: true,
      immediate: true,
    },
    isVisible: {
      handler(newVal, oldVal) {
        this.drawerVisible = newVal;
      },
    },
  },
  created() {},
  mounted() {},
  methods: {
    loadVocabularyList() {
      this.pageLoad = true;
      wordPage({
        ...this.pagination,
        ...this.searchParams,
        levelMax: this.searchParams.level,
        levelMin: this.searchParams.level,
      })
        .then((res) => {
          const { list, total } = res.data;
          this.vocabularyList = list.map((item) => {
            return { id: item.id, word: item.word };
          });
          this.total = parseInt(total);
        })
        .finally(() => {
          this.pageLoad = false;
        });
    },
    chooseVocabulary(vocabularyItem) {
      if (vocabularyItem && vocabularyItem.word) {
        this.$emit("onChange", vocabularyItem.word);
        this.close();
      }
    },
    close() {
      this.$emit("onClose", false);
      this.drawerVisible = false;
    },
    handleVocabularyCurrentChange(current) {
      this.pagination.page = current;
    },
    handleCurrentChange(data) {
      if (!data) {
        this.loadVocabularyList();
      }
      this.chooseVocabulary(data);
    },
    handleSizeChange(currentSize) {
      this.pagination.pageSize = currentSize;
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep {
  .searchBar {
    #keyWords {
      .el-input {
        .el-input__inner {
          height: 30px;
          font-size: 13px;
        }
      }
    }
    .el-button {
      height: 30px;
      display: flex;
      align-items: center;
    }
  }

  .el-table__row {
    cursor: pointer;
  }
}
header {
  width: 100%;
  height: 5%;
  padding: 0 30px;
  font-size: 0.9rem;
  font-weight: bold;
}
.mainBox {
  padding: 0 30px;
  width: 100%;
  height: 86%;
  overflow-y: hidden;
  .searchBar {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    #keyWords {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }

  .listContainer {
    width: 100%;
    height: 88%;
    padding: 10px 0;
    overflow-y: auto;
  }
}
footer {
  width: 100%;
  height: 7%;
}
</style>
