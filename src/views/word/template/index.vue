<template>
  <div style="padding: 10px; height: calc(100vh - 50px)">
    <div class="container">
      <el-row
        id="fir"
        :gutter="0"
        type="flex"
        justify="space-between"
        align="middle"
        style="overflow-x: hidden"
      >
        <el-col :span="5" class="guideFont"> 模板库 </el-col>
        <el-col
          :span="6"
          style="
            display: flex;
            align-items: cenetr;
            justify-content: flex-start;
          "
        >
          <el-button
            v-permission="['templateAndWord.template.add']"
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="openCorpus"
            >创建模板</el-button
          >
        </el-col>
      </el-row>

      <el-row id="sec" v-loading="loading" :gutter="0">
        <el-col style="height: 90%">
          <el-table :data="showData" height="100%" @filter-change="filterLevel">
            <el-table-column label="序号" min-width="30">
              <template slot-scope="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column
              label="评分"
              prop="level"
              :filters="levels"
              :filter-multiple="false"
              min-width="200"
            >
              <template slot-scope="scope">
                <div style="display: flex; justify-content: flex-start">
                  <el-rate
                    :value="scope.row.level"
                    disabled
                    :allow-half="true"
                    :max="10"
                    :colors="rateColors"
                  />
                  <span style="color: #ff9900; margin-left: 5px">{{
                    scope.row.level * 10
                  }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="评价模板"
              prop="templateText"
              min-width="500"
            >
              <template slot-scope="scope">
                <div>
                  <div v-html="scope.row.templateText" />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              v-permission="[
                'templateAndWord.template',
                'templateAndWord.template.update',
                'templateAndWord.template.delete',
              ]"
              label="操作"
              min-width="120"
            >
              <template slot-scope="scope">
                <div style="display: flex; justify-content: space-around">
                  <el-button
                    v-permission="['templateAndWord.template.update']"
                    type="text"
                    icon="el-icon-edit-outline"
                    @click="update(scope)"
                    >编辑</el-button
                  >
                  <el-button
                    v-permission="['templateAndWord.template.delete']"
                    type="text"
                    style="color: red"
                    icon="el-icon-delete"
                    @click="del(scope.row.id)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-col>

        <el-col id="block">
          <el-pagination
            background
            :page-size="pagination.pageSize"
            :page-sizes="[10, 20, 30, 40]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :current-page="pagination.page"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-col>
      </el-row>

      <template-form
        v-permission="[
          'templateAndWord.template',
          'templateAndWord.template.update',
          'templateAndWord.template.add',
        ]"
        :is-update="isUpdate"
        :is-visible="formDialogVisible"
        :template-info="JSON.parse(JSON.stringify(templateInfo))"
        :rate-colors="rateColors"
        @onSuccess="handleReceiveFormData"
        @onClose="handleFormClose"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import store from "@/store";
import * as rq from "@/api/curpos/curpos";
export default {
  name: "templateTable",
  injects: ["reload"],
  components: {
    TemplateForm: () => import("./components/templateForm.vue"),
  },
  data() {
    return {
      pagination: {
        page: 1,
        pageSize: 10,
        level: -1,
        withDate: false,
        type: 0,
      },
      rateColors: ["#99A9BF", "#f3a838", "#f9681f"],
      level: 0,
      chosenIndex: -1,
      showData: [],
      loading: false,
      formDialogVisible: false,
      isUpdate: false,
      templateInfo: {
        level: 0,
        templateText: "",
        type: 0,
      },
      levels: [
        {
          text: "0~20",
          value: 1,
        },
        {
          text: "21~40",
          value: 3,
        },
        {
          text: "41~60",
          value: 5,
        },
        {
          text: "61~80",
          value: 7,
        },
        {
          text: "81~100",
          value: 9,
        },
      ],
      file: [],
    };
  },
  watch: {
    formDialogVisible: {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.chosenIndex = -1;
          setTimeout(() => {
            this.isUpdate = false;
            this.templateInfo = {
              level: 0,
              templateText: "",
              type: 0,
            };
          }, 300);
        }
      },
    },
  },
  created() {
    this.getList();
  },
  mounted() {},
  computed: {
    ...mapState("curpos", ["total"]),
  },
  methods: {
    getList() {
      this.loading = true;
      rq.getTemplate({ ...this.pagination })
        .then((res) => {
          if (res.code === 200) {
            const { list, total } = res.data;
            this.showData = list;
            store.commit("curpos/SET_TOTAL", Number(total));
          } else {
            this.$message.error("服务器异常, 获取数据失败");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    del(id) {
      this.loading = true;
      this.$confirm("此操作将永久删除该语料, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        rq.deleteTemplate(id).then((res) => {
          if (res.code === 200) {
            if (this.showData.length == 1 && this.pagination.page > 1) {
              this.pagination.page--;
            }
            this.getList();
            this.$message.success("删除成功");
          }
        });
      });
      this.loading = false;
    },
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize;
      this.getList();
    },
    handleCurrentChange(newPage) {
      this.pagination.page = newPage;
      this.getList();
    },
    openCorpus() {
      this.templateInfo.level = 0;
      this.templateInfo.templateText = "";
      this.formDialogVisible = true;
    },
    update(scope) {
      this.templateInfo = JSON.parse(JSON.stringify(scope.row));
      this.chosenIndex = scope.$index;
      this.formDialogVisible = this.isUpdate = true;
    },
    submit(data) {
      const request = this.isUpdate
        ? rq.modifyTemplate(data)
        : rq.addTemplate(data);
      this.loading = true;
      request
        .then((res) => {
          const { code } = res;
          if (code == 200) {
            this.getList();
            this.$message.success(`${this.isUpdate ? "更新" : "创建"}成功`);
            this.formDialogVisible = false;
          } else {
            this.$message.error(res.message);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    filterLevel(chosenLevel) {
      let goalLevel = Object.values(chosenLevel)[0][0];
      if (typeof goalLevel === "undefined") {
        goalLevel = undefined;
      }
      this.pagination.level = goalLevel;
      this.getList();
      this.pagination.page = 1;
    },
    handleReceiveFormData(data) {
      this.submit(data);
    },
    handleFormClose(isVisible) {
      this.formDialogVisible = isVisible;
      this.templateInfo.templateText = "";
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-button {
    letter-spacing: 2px;
    padding: 8px 12px;
  }
  #rateBox {
    display: flex;
    align-items: center;
    .el-form-item__content {
      margin-left: 0 !important;
      .el-rate__text {
        font-size: 17px;
      }
    }
  }
}
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: center;
  #fir {
    width: 100%;
    height: 60px;
    margin: 0 auto;
    margin-left: 0;
    margin-right: 0;
    padding: 5px 5% 5px 10%;
    background-color: #ffffff;
    margin-bottom: 10px;
    transition: box-shadow 0.25s ease-in;
  }
  #sec {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    background-color: #ffffff;
    padding: 8px 0.5% 20px 0.5%;
    transition: box-shadow 0.25s ease-in;
    height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
    align-items: center;
    #block {
      height: 10%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  #fir:hover,
  #sec:hover {
    box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
  }
  .guideFont {
    font-size: 1.6em;
    letter-spacing: 5px;
    font-weight: 700;
  }
}
</style>
