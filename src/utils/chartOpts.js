import * as echarts from 'echarts'
/**
 * 获取积分占比图的options
 * @param {Array} data [{ name: '', value: 22 }]
 * @returns
 */
export function getScorePieOpts(data) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}分 : {c}人 ({d}%)'
    },
    legend: {
      top: '0%',
      left: 'center'
    },
    series: [
      {
        name: '积分占比',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 30.0,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        hoverAnimation: {
          animationEasing: 'circularInOut'
        },
        data: data
      }
    ]
  }
}

/**
 * 获取年级积分对比图的options
 * @param {Array} xData
 * @param {Array} yData
 * @returns
 */
export function getgradeScorePieOpts(xData, yData) {
  const offsetX = 20
  const offsetY = 10
  const CubeLeft = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0
    },
    buildPath: function(ctx, shape) {
      const xAxisPoint = shape.xAxisPoint
      const c0 = [shape.x, shape.y]
      const c1 = [shape.x - offsetX, shape.y - offsetY]
      const c2 = [xAxisPoint[0] - offsetX, xAxisPoint[1] - offsetY]
      const c3 = [xAxisPoint[0], xAxisPoint[1]]
      ctx.moveTo(c0[0], c0[1]).lineTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).closePath()
    }
  })
  // 绘制右侧面
  const CubeRight = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0
    },
    buildPath: function(ctx, shape) {
      const xAxisPoint = shape.xAxisPoint
      const c1 = [shape.x, shape.y]
      const c2 = [xAxisPoint[0], xAxisPoint[1]]
      const c3 = [xAxisPoint[0] + offsetX, xAxisPoint[1] - offsetY]
      const c4 = [shape.x + offsetX, shape.y - offsetY]
      ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath()
    }
  })
  // 绘制顶面
  const CubeTop = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0
    },
    buildPath: function(ctx, shape) {
      const c1 = [shape.x, shape.y]
      const c2 = [shape.x + offsetX, shape.y - offsetY] // 右点
      const c3 = [shape.x, shape.y - offsetX]
      const c4 = [shape.x - offsetX, shape.y - offsetY]
      ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath()
    }
  })
  // 注册三个面图形
  echarts.graphic.registerShape('CubeLeft', CubeLeft)
  echarts.graphic.registerShape('CubeRight', CubeRight)
  echarts.graphic.registerShape('CubeTop', CubeTop)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params, ticket, callback) {
        const item = params[1]
        return item.name + ' : ' + item.value + '分'
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: '#2B7BD6'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 14
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: '#2B7BD6'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#153D7D'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 14
      }
    },
    series: [
      {
        type: 'custom',
        renderItem: (params, api) => {
          const location = api.coord([api.value(0), api.value(1)])
          return {
            type: 'group',
            children: [
              {
                type: 'CubeLeft',
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0],
                  y: location[1],
                  xAxisPoint: api.coord([api.value(0), 0])
                },
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: '#33BCEB'
                    },
                    {
                      offset: 1,
                      color: '#337CEB'
                    }
                  ])
                }
              },
              {
                type: 'CubeRight',
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0],
                  y: location[1],
                  xAxisPoint: api.coord([api.value(0), 0])
                },
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: '#28A2CE'
                    },
                    {
                      offset: 1,
                      color: '#1A57B7'
                    }
                  ])
                }
              },
              {
                type: 'CubeTop',
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0],
                  y: location[1],
                  xAxisPoint: api.coord([api.value(0), 0])
                },
                style: {
                  fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: '#43C4F1'
                    },
                    {
                      offset: 1,
                      color: '#28A2CE'
                    }
                  ])
                }
              }
            ]
          }
        },
        data: yData
      },
      {
        type: 'bar',
        label: {
          normal: {
            show: true,
            position: 'top',
            formatter: (e) => {
              return e.value + '分'
            },
            fontSize: 16,
            color: '#43C4F1',
            offset: [0, -25]
          }
        },
        itemStyle: {
          color: 'transparent'
        },
        tooltip: {},
        data: yData
      }
    ]
  }
}
