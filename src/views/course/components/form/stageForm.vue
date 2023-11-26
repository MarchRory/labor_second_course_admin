<template>
  <div
    v-permission="[
      'curriculum.course.student',
      'curriculum.course.student.get',
    ]"
  >
    <el-dialog
      :append-to-body="true"
      title="分段赋分"
      width="50%"
      top="5vh"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="isVisible"
    >
      <div class="formContainer">
        <div class="chart">
          <stage-chart :course-id="courseId" :type="2" />
        </div>
        <el-divider></el-divider>
        <el-form
          ref="form"
          :model="form"
          label-width="100px"
          class="demo-ruleForm"
        >
          <div style="height: 30vh; overflow-y: auto">
            <el-form-item
              v-for="(item, index) in form.mapping"
              style="margin-bottom: 10px"
              :key="index"
              :label="'分段' + `${index + 1}`"
              :prop="'mapping.' + index + '.value'"
            >
              <div
                style="
                  width: 90%;
                  display: flex;
                  align-items: center;
                  justify-content: space-around;
                "
              >
                <div
                  style="
                    width: 40%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  "
                >
                  <el-input-number
                    size="mini"
                    v-model="item.stageStart"
                    :disabled="index == 0"
                    :min="index ? form.mapping[index - 1].stageEnd + 1 : 0"
                    :max="item.stageEnd ? item.stageEnd - 1 : 99"
                  />
                  <span style="font-weight: bolder; margin: 0 4px">~</span>
                  <el-input-number
                    size="mini"
                    v-model="item.stageEnd"
                    :min="
                      item.stageStart
                        ? item.stageStart + 1
                        : index
                        ? form.mapping[index - 1].stageEnd + 2
                        : 1
                    "
                    :max="
                      index == form.mapping.length - 1
                        ? 100
                        : form.mapping[index + 1].stageStart
                        ? form.mapping[index + 1].stageStart - 1
                        : 100
                    "
                  />
                </div>
                <i
                  class="el-icon-d-arrow-right"
                  style="margin: 0 15px; font-size: large; font-weight: bolder"
                />
                <el-input
                  style="width: 30%"
                  placeholder="对应二课加分"
                  size="mini"
                  v-model.number="item.score"
                >
                  <template slot="prepend">赋分</template>
                </el-input>

                <el-button
                  v-if="!index"
                  type="success"
                  style="margin-left: 0px; letter-spacing: 2px"
                  @click.prevent="addStage(form.mapping.length - 1)"
                  >新增</el-button
                >
                <el-button
                  v-if="index"
                  type="danger"
                  style="margin-left: 0px; letter-spacing: 2px"
                  @click.prevent="removeStage(index)"
                  >删除</el-button
                >
              </div>
            </el-form-item>
          </div>

          <el-form-item>
            <div
              style="
                width: fit-content;
                position: relative;
                left: 81%;
                top: 30px;
              "
            >
              <el-button @click="quit">取消</el-button>
              <el-button
                type="primary"
                v-loading="submitLoading"
                @click="submitForm()"
                >导出Excel</el-button
              >
            </div>
          </el-form-item>
        </el-form>
        <footer></footer>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { statisticalScore } from "@/api/chartsData/chartsData";
import { downloadStudent } from "@/api/lessons";
import { handleDownload } from "@/utils/file";
export default {
  components: {
    StageChart: () => import("../chart/stageChart.vue"),
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
      required: true,
    },
    courseId: {
      type: String | Number,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isVisible: false,
      stageData: [],
      form: {
        mapping: [{ stageStart: 0, stageEnd: 10, score: null }],
      },
      submitLoading: false,
    };
  },
  watch: {
    isOpen: {
      handler(newVal) {
        this.isVisible = newVal;
      },
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      statisticalScore(this.courseId, 1).then((res) => {
        const { data } = res;
      });
    },
    addStage(index) {
      let preStageEnd = this.form.mapping[index].stageEnd;
      this.form.mapping.push({
        stageStart: preStageEnd + 1,
        stageEnd: preStageEnd + 10,
        score: null,
      });
    },
    removeStage(index) {
      this.form.mapping.splice(index, 1);
    },
    submitForm() {
      if (!this.form.mapping.length) {
        this.$message.warning("请先设置分段赋分");
        return;
      }
      if (this.form.mapping.some((item) => item.score != 0 && !item.score)) {
        this.$message.warning("请先完成赋分");
        return;
      }
      this.submitLoading = true;
      const scoreMap = this.form.mapping.map((item, index, self) => {
        let floor;
        if (index != 0) {
          floor =
            item.stageStart > self[index - 1].stageEnd
              ? self[index - 1].stageEnd + 1
              : item.stageStart;
        } else {
          floor = 0;
        }
        return {
          stage: floor,
          score: item.score,
        };
      });
      downloadStudent(this.courseId, scoreMap).then((data) => {
        let fileName = `${this.courseName}赋分结果.xlsx`;
        handleDownload(fileName, data);
        this.submitLoading = false;
      });
    },
    quit() {
      this.isVisible = false;
      this.$emit("onClose");
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep {
  .el-input-group__prepend {
    padding: 0 10px;
  }
  .el-button {
    padding: 8px !important;
    font-size: 12px;
  }
}
.formContainer {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: fit-content;
}
.chart {
  width: 90%;
  height: 200px;
}
</style>
