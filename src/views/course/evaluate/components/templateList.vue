<template>
  <div v-permission="['curriculum.evaluate']">
    <el-drawer
      title="模板列表"
      :visible.sync="drawerVisible"
      size="30%"
      :wrapper-closable="false"
      :close-on-press-escape="false"
      :append-to-body="true"
      @close="close"
    >
      <div v-if="templateTotal" v-loading="templateListLoad" class="mainBox">
        <header>此分段可用模板总数: {{ templateTotal }}</header>
        <div class="listContainer">
          <el-card
            v-for="Template in TemplateList"
            :key="Template.id"
            style="z-index: 999; margin-bottom: 15px; cursor: pointer"
            shadow="hover"
            @click.native="chooseTemplate(Template)"
          >
            <div style="font-size: 12px">
              <el-divider
                ><el-tag size="small">{{
                  Template.level * 10
                }}</el-tag></el-divider
              >
              <div
                style="text-indent: 2em; line-height: 27px"
                v-html="Template.templateText"
              />
            </div>
          </el-card>
        </div>
        <footer>
          <el-pagination
            style="margin-top: 10px; width: fit-content; margin: 10px auto"
            @size-change="handleSizeChange"
            layout="total, prev, pager, next,sizes"
            :pager-count="5"
            :page-sizes="[5, 10, 20, 30]"
            :total="templateTotal"
            @current-change="currentTemplatePage"
          />
        </footer>
      </div>
      <el-empty v-else description="该分段暂无模板" />
    </el-drawer>
  </div>
</template>

<script>
import { getTemplate } from "@/api/curpos/curpos";
export default {
  components: {
    EvaluateTemplate: () =>
      import("@/components/templateCreatedArea/index.vue"),
  },
  props: {
    level: {
      type: Number,
      required: true,
      default: -1,
    },
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },
    hasTemplateEdited: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  data() {
    return {
      pagination: {
        pageNum: 1,
        pageSize: 10,
        key: "",
        level: -1,
      },
      drawerVisible: false,
      TemplateList: [],
      templateListLoad: true,
      templateTotal: 0,
    };
  },
  watch: {
    visible: {
      handler(newVal, oldVal) {
        this.drawerVisible = newVal;
      },
    },
    level: {
      handler(newVal, oldVal) {
        this.pagination.level = newVal;
        this.loadTemplateList();
      },
    },
    "pagination.pageNum": {
      handler(newVal, oldVal) {
        this.loadTemplateList();
      },
    },
    "pagination.pageSize": {
      handler(newVal, oldVal) {
        this.loadTemplateList();
      },
    },
  },
  created() {
    this.loadTemplateList();
  },
  mounted() {},
  methods: {
    chooseTemplate(template) {
      if (this.hasTemplateEdited) {
        this.$confirm(
          "有正在使用的模板, 更换模板将导致已编辑内容清空",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            this.$emit("onChange", template.templateText);
            this.close();
          })
          .finally(() => {});
      } else {
        this.$emit("onChange", template.templateText);
        this.close();
      }
    },
    close(done) {
      this.drawerVisible = false;
      this.$emit("onClose", false);
    },
    loadTemplateList() {
      this.templateListLoad = true;
      getTemplate({ ...this.pagination })
        .then((res) => {
          const { list, total } = res.data;
          this.templateTotal = parseInt(total);
          this.TemplateList = list;
        })
        .finally(() => {
          this.templateListLoad = false;
        });
    },
    currentTemplatePage(current) {
      this.pagination.pageNum = current;
    },
    handleSizeChange(currentSize) {
      this.pagination.pageSize = currentSize;
    },
  },
};
</script>

<style scoped lang="scss">
.mainBox {
  padding: 0 30px;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  header {
    width: 100%;
    height: 5%;
    font-weight: bold;
  }
  .listContainer {
    width: 100%;
    height: 88%;
    padding: 10px 0;
    overflow-y: auto;
  }
  footer {
    width: 100%;
    height: 7%;
  }
}
</style>
