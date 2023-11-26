<template>
  <div v-permission="['annulReportManage']" class="app-container">
    <div class="title">
      <h3 style="color: #303133">关键词解读</h3>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>
    <el-collapse v-loading="loading" accordion>
      <el-collapse-item v-for="keyword in keywords" :key="keyword.id">
        <template slot="title">
          <el-checkbox v-model="keyword.state == 1" label=""
            ><el-tag
              >{{ keyword.keyword }}*{{ keyword.frequency }}</el-tag
            ></el-checkbox
          >
        </template>
        <div>
          <el-input
            v-model="keyword.unscramble"
            type="textarea"
            :rows="2"
            placeholder="写下关键词的解读"
            maxlength="300"
          />
          <div
            style="
              display: flex;
              justify-content: space-between;
              margin-top: 4px;
            "
          >
            <el-switch
              v-model="keyword.state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="启用"
              inactive-text="弃用"
              :active-value="1"
              :inactive-value="0"
            />
            <el-button type="primary" @click="saveKeywordStatus(keyword)"
              >保存</el-button
            >
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { reportKeyPage, updateReportKey } from "@/api/report/reportKey";

export default {
  name: "KeywordInterpretation",
  props: {
    batchId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      keywords: [],
    };
  },
  watch: {
    batchId: {
      handler(newval, oldval) {
        if (newval) {
          this.loadData();
        }
        return newval;
      },
      deep: true,
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      reportKeyPage({ page: 1, pageSize: 500, batchId: this.batchId })
        .then((res) => {
          const { data } = res;
          this.keywords = [];
          this.keywords = data.list;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    saveKeywordStatus(keyword) {
      updateReportKey(keyword)
        .then((res) => {
          this.$message.success("成功");
        })
        .catch((res) => {
          this.$message.error("保存失败");
        })
        .finally(() => {
          this.loadData();
        });
    },
  },
};
</script>

<style scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
