<template>
  <div
    :id="id"
    ref="courseStatisticsRef"
    :class="className"
    style="height: 100%; width: 100%;"
  />
</template>

<script>
import { statisticalScore } from '@/api/chartsData/chartsData'
import { debunce } from '@/utils/debounce'
export default {
  name: 'CourseStatistics',
  props: {
    className: {
      type: String,
      default: 'base-echart'
    },
    id: {
      type: String,
      default: 'base-echart'
    },
    width: {
      type: String,
      default: '600px'
    },
    height: {
      type: String,
      default: '250px'
    },
    type: {
      type: Number
    },
    courseId: {
      type: Number | String,
      required: true
    },
    title: {
      type: String,
      default: '折线图'
    }
  },
  data() {
    return {
      chart: null,
      courseData: [],
      total: 0,
      watchChart: null
    }
  },
  watch: {
    courseId: {
      handler(newval, oldval) {
        if (newval) {
          if (this.chart) {
            this.chart.setOption(this.getOpts())
          } else {
            this.loadData()
          }
        }
        return newval
      },
      deep: true
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.clear()
      this.chart.dispose()
      this.chart = null
      this.watchChart
      this.watchChart.unobserve(this.$parent.$el)
      this.watchChart = null
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    loadData() {
      statisticalScore(this.courseId, this.type).then(res => {
        this.courseData = res.data
        this.initChart()
      })
    },
    getOpts() {
      return {
        title: {
          left: 'center',
          text: this.title,
          show: true // 是否显示标题组件
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}分: {c}人 ({d}%)'
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: this.total > 0 ? '总计' + // 圆饼中心显示数据，这里是显示得总数
                  '\n\n' +
                  String(this.total).replace(
                    /(\d)(?=(?:\d{6})+$)/g,
                    '$1.'
                  ) : '暂无数据',
            textAlign: 'center',
            fill: '#000',
            width: 30,
            height: 30,
            fontSize: 14,
            fontWeight: 600
          }
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          itemStyle: {
            normal: {
              label: {
                show: true,
                textStyle: {
                  color: '#3c4858',
                  fontSize: '14'
                },
                formatter: function(val) {
                  return val.name + ': ' + val.percent + '%'
                }
              },
              labelLine: {
                show: true,
                lineStyle: {
                  color: '#3c4858'
                }
              }
            },
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              textColor: '#000'
            }
          },
          data: this.courseData.filter((date) => {
            return date.name
          }) // 数据
        }],
        color: ['#f18080', '#36cbcb', '#4dcb73', '#975fe4', '#3aa0ff'] // 颜
      }
    },
    initChart() {
      const len = this.courseData.length
      if (len > 0) {
        this.total = 0
        this.courseData.map((item) => {
          if (item.name) {
            this.total += Number(item.value)
          }
        })
      }
      this.chart = this.$echarts.init(this.$refs.courseStatisticsRef)

      this.chart.setOption(this.getOpts())

      this.watchChart = new ResizeObserver(() => {
        debunce(this.chart.resize(), 300)
      })
      this.watchChart.observe(this.$parent.$el) // 这里因为只有侧边栏变化会触发，而侧边栏变化会引起右边container的变化，所以监听container和监听父div是等效的
    }

  }
}
</script>

<style scoped>

</style>
