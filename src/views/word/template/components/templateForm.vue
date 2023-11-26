<template>
  <div>
    <el-dialog
      v-permission="[
        'templateAndWord.template',
        'templateAndWord.template.update',
        'templateAndWord.template.add',
      ]"
      :title="`${isUpdate ? '编辑' : '创建'}模板`"
      :visible.sync="formVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="30%"
      center
    >
      <el-form label-position="right" label-width="80px">
        <el-form-item label="评分" id="rateBox">
          <el-rate
            :max="10"
            v-model="templateInfoCopy.level"
            :colors="rateColors"
            @change="getRate"
            :allow-half="false"
            show-text
            :texts="texts"
            text-color="#ff9900"
          >
          </el-rate>
        </el-form-item>

        <el-form-item label="评价模板">
          <TemplateEditArea
            :is-edit="isUpdate"
            :template-text="templateText"
            :is-show="templateVisible"
            :is-use-right-menu="true"
            @onChange="handleReceiveTemplate"
          />
          <span class="templateTip"
            >模板输入区内, 在光标位置按下鼠标右键, 即可打开词汇选择器</span
          >
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button
          v-permission="[
            'templateAndWord.template',
            'templateAndWord.template.update',
            'templateAndWord.template.add',
          ]"
          type="primary"
          :disabled="isDisabled"
          @click="submit"
          >{{ isUpdate ? "修改" : "创建" }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: {
    TemplateEditArea: () =>
      import("@/components/templateCreatedArea/index.vue"),
  },
  props: {
    isUpdate: {
      type: Boolean,
      default: false,
    },
    templateInfo: {
      type: Object,
      required: true,
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: false,
    },
    rateColors: {
      type: Array,
      require: true,
    },
  },
  data() {
    return {
      templateInfoCopy: {},
      texts: [
        "10分",
        "20分",
        "30分",
        "40分",
        "50分",
        "60分",
        "70分",
        "80分",
        "90分",
        "100分",
      ],
      formVisible: false,
      templateText: "",
      templateVisible: false,
    };
  },
  created() {},
  mounted() {},
  watch: {
    templateInfo: {
      handler(newVal, oldVal) {
        this.templateText = newVal.templateText;
        this.templateInfoCopy = JSON.parse(JSON.stringify(newVal));
      },
      immediate: true,
      deep: true,
    },
    isVisible: {
      handler(newVal, oldVal) {
        this.formVisible = newVal;
      },
    },
    formVisible: {
      handler(newVal) {
        this.templateVisible = newVal;
      },
    },
  },
  computed: {
    isDisabled() {
      return (
        JSON.stringify(this.templateInfo) ==
        JSON.stringify(this.templateInfoCopy)
      );
    },
  },
  methods: {
    getRate(rate) {
      this.templateInfoCopy.level = rate;
    },
    handleReceiveTemplate(templateHTML) {
      this.templateInfoCopy.templateText = templateHTML;
    },
    submit() {
      this.$emit(
        "onSuccess",
        JSON.parse(JSON.stringify(this.templateInfoCopy))
      );
    },
    close() {
      this.formVisible = false;
      this.$emit("onClose", false);
    },
  },
};
</script>

<style lang="scss" scoped>
.templateTip {
  font-size: 12px;
  font-weight: bold;
  color: #116b83;
}
</style>
