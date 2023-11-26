<template>
  <div
    v-loading="chartLoading"
    ref="stageChart"
    style="height: 100%; width: 100%"
  />
</template>

<script>
import { debunce } from "@/utils/debounce";
import { statisticalScore } from "@/api/chartsData/chartsData";
export default {
  name: "stageChart",
  props: {
    courseId: {
      type: String | Number,
      required: true,
    },
    type: {
      type: String | Number,
      default: 0,
    },
  },
  data() {
    return {
      chart: null,
      total: 0,
      chartLoading: true,
    };
  },
  watch: {
    stageData: {
      handler(newVal) {
        if (this.chart) {
          this.chart.setOption(this.getOpts());
        }
      },
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.clear();
      this.chart.dispose();
      this.chart = null;
      window.removeEventListener("resize", () => {});
    }
  },
  created() {},
  mounted() {
    this.init();
  },
  methods: {
    getOpts(xData, yData) {
      return {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "none",
          },
        },
        title: {
          text: "学生得分图",
          textStyle: {
            fontSize: 16,
          },
          top: 0,
          subtext: "分段赋分的依据",
          left: "center",
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: true },
            saveAsImage: { show: true },
          },
        },
        grid: {
          top: "30%",
          left: "4%",
          right: "10%",
          bottom: "2%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            name: "分数段",
            data: xData,
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "人数/人",
            min: 0,
            interval: 1,
          },
        ],
        series: [
          {
            name: "人数",
            color: "#16a59f",
            type: "bar",
            barWidth: "5%",
            data: yData,
            emphasis: {
              itemStyle: {
                color: "rgba(86, 123, 217, 1)",
              },
            },
            tooltip: {
              valueFormatter: function (value) {
                return value + "人";
              },
            },
          },
        ],
      };
    },
    initChart(xData, yData) {
      if (!this.chart) {
        this.chart = this.$echarts.init(this.$refs.stageChart);
      }
      this.chart.setOption(this.getOpts(xData, yData));
      if (this.chart) {
        const that = this;
        window.addEventListener("resize", () => {
          debunce(() => {
            if (this.chart && this.chart.resize) that.chart.resize();
          });
        });
      }
    },
    init() {
      this.chartLoading = true;
      statisticalScore(this.courseId, this.type, { interval: 10 })
        .then(({ data }) => {
          const xData = data.map((item) => item.name);
          const yData = data.map((item) => parseInt(item.value));
          this.initChart(xData, yData);
        })
        .finally(() => {
          this.chartLoading = false;
        });
    },
  },
};
</script>

<style scoped></style>
