<template>
  <div
    v-permission="['annulReportManage']"
    class="app-container"
    ref="pageContainer"
  >
    <div class="inner">
      <el-card title="详情">
        <div
          slot="header"
          style="display: flex; justify-content: space-between"
        >
          <el-button round @click="goBack">返回</el-button>
          <el-button
            type="primary"
            :disabled="batchReportDetail.state < 3"
            @click="openDrawer"
            >关键词解读</el-button
          >
        </div>
        <div v-loading="loading">
          <el-descriptions
            v-loading="loading"
            :title="batchReportDetail.reportBatchName"
          >
            <el-descriptions-item label="数据收集开始时间">{{
              batchReportDetail.start
            }}</el-descriptions-item>
            <el-descriptions-item label="数据收集结束时间">{{
              batchReportDetail.end
            }}</el-descriptions-item>
            <el-descriptions-item label="可见性">
              <el-tag v-if="batchReportDetail.visibility" size="small"
                >用户可见<i class="el-icon-success"
              /></el-tag>
              <el-tag v-else type="danger" size="small"
                >用户不可见<i class="el-icon-error"
              /></el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag
                v-if="batchReportDetail.state === 3"
                size="small"
                type="success"
                ><i class="el-icon-circle-check" />完成</el-tag
              >
              <el-tag
                v-else-if="batchReportDetail.state === -1"
                size="small"
                type="danger"
                ><i class="el-icon-error" />错误</el-tag
              >
              <el-tag v-else size="small"
                ><i class="el-icon-loading" />生成中</el-tag
              >
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              batchReportDetail.gmtCreate
            }}</el-descriptions-item>
            <el-descriptions-item label="创建者">{{
              batchReportDetail.createBy
            }}</el-descriptions-item>
          </el-descriptions>
          <el-divider content-position="left">生成进度</el-divider>
          <el-steps :active="Number(batchReportDetail.state)" align-center>
            <el-step
              title="创建"
              description="任务创建"
              icon="el-icon-upload"
            />
            <el-step
              title="生成"
              :description="
                Number(batchReportDetail.state) <= 2
                  ? '报告生成中'
                  : '报告生成完成'
              "
              :icon="
                Number(batchReportDetail.state) <= 2
                  ? 'el-icon-loading'
                  : 'el-icon-success'
              "
            />
            <el-step
              title="完成"
              description="生成完成,请查收"
              icon="el-icon-data-analysis"
            />
          </el-steps>
          <el-divider content-position="left">报告数据</el-divider>
          <div>
            <el-empty v-if="batchReportDetail.state < 3">
              <template slot="description">
                <i class="el-icon-loading" /><span style="color: #606266"
                  >数据生成中</span
                >
              </template>
              <el-button
                type="primary"
                icon="el-icon-refresh"
                :disabled="loading"
                @click="refresh()"
                >刷新</el-button
              >
            </el-empty>
            <div v-else class="statistics">
              <el-card v-loading="loading" header="课程月度汇总" shadow="never">
                <course-month-statistics
                  :use-resize="useResize"
                  :monthly-statistics="batchReportDetail.courseMonthList"
                  style="width: 100%; height: 55vh"
                />
              </el-card>
              <el-row>
                <el-col :span="12">
                  <el-card
                    v-loading="loading"
                    header="课程分类分布"
                    shadow="never"
                  >
                    <course-category
                      :use-resize="useResize"
                      :course-category="batchReportDetail.categoryDist"
                      style="width: 100%; height: 40vh"
                    />
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card
                    v-loading="loading"
                    header="分数分段数据"
                    shadow="never"
                  >
                    <fractional-segment
                      :use-resize="useResize"
                      :fractional-segment="batchReportDetail.factionalSegments"
                      style="width: 100%; height: 40vh"
                    />
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card
                    v-loading="loading"
                    header="学生自评评价词云"
                    shadow="never"
                  >
                    <course-word-cloud
                      :use-resize="useResize"
                      title=""
                      style="width: 100%; height: 40vh"
                      :words="batchReportDetail.selfKeywords"
                    />
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card
                    v-loading="loading"
                    header="课程评价词云"
                    shadow="never"
                  >
                    <course-word-cloud
                      :use-resize="useResize"
                      title=""
                      style="width: 100%; height: 40vh"
                      :words="batchReportDetail.courseKeywords"
                    />
                  </el-card>
                </el-col>
                <el-col :span="24">
                  <el-card
                    v-loading="loading"
                    header="教师评价词云"
                    shadow="hover"
                  >
                    <course-word-cloud
                      :use-resize="useResize"
                      title=""
                      style="width: 100%; height: 50vh"
                      :words="batchReportDetail.teacherKeywords"
                    />
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-card>
      <el-drawer
        title="关键词解读"
        :with-header="false"
        :visible.sync="drawer"
        size="35%"
      >
        <keyword-interpretation :batch-id="batchId" />
      </el-drawer>
      <el-backtop target=".inner" :bottom="100" />
    </div>
  </div>
</template>

<script>
import { getReportBatchDetail } from "@/api/report/AcademicYearReport";
import { debunce } from "@/utils/debounce";
export default {
  name: "BatchReportDetails",
  components: {
    KeywordInterpretation: () =>
      import("./components/keywordInterpretation.vue"),
    FractionalSegment: () => import("./components/fractionalSegment.vue"),
    CourseWordCloud: () => import("./components/courseWordCloud.vue"),
    CourseMonthStatistics: () =>
      import("./components/courseMonthStatistics.vue"),
    CourseCategory: () => import("./components/courseCategory.vue"),
  },
  data() {
    return {
      batchId: "",
      drawer: false,
      loading: false,
      batchReportDetail: {
        id: 0,
        reportBatchName: "",
        start: "",
        end: "",
        cover: null,
        visibility: null,
        state: 2,
        categoryDist: {},
        courseMonthList: [],
        selfKeywords: [],
        teacherKeywords: [],
        courseKeywords: [],
        factionalSegments: [],
        gmtCreate: "",
        gmtModified: "",
        createBy: "",
      },
      watchChart: null,
      useResize: false,
    };
  },
  created() {
    this.batchId = this.$route.query.batchId;
    this.loadData();
  },
  mounted() {
    this.createResizeObserver();
  },
  watch: {
    useResize: {
      handler(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.useResize = false;
          }, 280);
        }
      },
    },
  },
  beforeDestroy() {
    this.watchChart.unobserve(this.$refs.pageContainer);
    this.watchChart = null;
  },
  methods: {
    refresh() {
      this.loading = true;
      setTimeout(() => {
        this.loadData();
        this.loading = false;
        this.$message.success("刷新成功");
      }, 1.25 * 1000);
    },
    loadData() {
      this.loading = true;
      getReportBatchDetail(this.batchId).then((res) => {
        const { data } = res;
        this.batchReportDetail = data;
        this.loading = false;
      });
    },
    openDrawer(batchId) {
      this.drawer = true;
    },
    goBack() {
      this.$router.back();
    },
    createResizeObserver() {
      this.watchChart = new ResizeObserver(() => {
        debunce(() => {
          this.useResize = true;
        }, 280);
      });
      this.watchChart.observe(this.$refs.pageContainer);
    },
  },
};
</script>

<style scoped>
.inner {
  height: 100vh;
  overflow-x: hidden;
}
</style>
