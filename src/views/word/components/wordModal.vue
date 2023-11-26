<template>
  <div
    v-permission="[
      'templateAndWord.word',
      'templateAndWord.word.add',
      'templateAndWord.word.update',
    ]"
  >
    <el-dialog
      title="词汇"
      :visible.sync="wordModalVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="width: fit-content; height: fit-content" v-loading="loading">
        <div>
          <el-form
            label-position="right"
            ref="wordForm"
            label-width="80px"
            :model="wordForm"
          >
            <el-form-item label="词语" prop="word">
              <el-input v-model="wordForm.word" />
            </el-form-item>
            <el-form-item label="评分" prop="level">
              <el-rate
                v-model="wordForm.level"
                show-score
                :max="10"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item label="类型" prop="typeId">
                  <el-select v-model="wordForm.typeId" value-key="typeId">
                    <el-option
                      v-for="item in wordTypeSelectList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="词性">
                  <el-select
                    v-model="wordForm.partOfSpeech"
                    value-key="partOfSpeech"
                  >
                    <el-option
                      v-for="item in partOfSpeech"
                      :key="item.text"
                      :label="item.text"
                      :value="item.text"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <span slot="footer" style="display: flex; justify-content: center">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSuccess">确 定</el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getWord, saveWord, updateWord } from "@/api/word/word";
import { wordTypePage } from "@/api/word/wordType";

export default {
  name: "WordModal",
  props: {
    wordId: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Number | String,
      required: true,
    },
    wordModalVisible: {
      type: Boolean,
      default: false,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "success"],
  data() {
    return {
      loading: false,
      partOfSpeech: [
        { text: "其他", value: 0 },
        { text: "名词", value: 1 },
        { text: "动词", value: 2 },
        { text: "形容词", value: 3 },
        { text: "副词", value: 4 },
      ],
      wordForm: {
        word: "",
        level: 0,
        typeId: 0,
        partOfSpeech: 0,
      },
      wordTypeSelectList: [],
    };
  },
  watch: {
    wordId: function (newVal, oldVal) {
      if (this.isUpdate) {
        this.loading = true;
        getWord(newVal)
          .then((res) => {
            const { data } = res;
            this.wordForm = data;
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.wordForm = {
          word: "",
          level: 0,
          typeId: 0,
          partOfSpeech: 0,
        };
      }
    },
  },
  created() {
    this.loadWordTypeSelectList();
  },
  methods: {
    loadWordTypeSelectList() {
      wordTypePage({ page: 1, pageSize: 20, withDate: false }).then((res) => {
        const { data } = res;
        this.wordTypeSelectList = data.list.map((item) => {
          return { label: item.type, value: item.id };
        });
      });
    },
    handleClose() {
      this.$emit("close");
      setTimeout(() => {
        this.$refs.wordForm.resetFields();
      }, 300);
    },
    async handleSuccess() {
      if (this.isUpdate) {
        await updateWord(this.word);
      } else {
        await saveWord(this.word);
      }
      setTimeout(() => {
        this.$refs.wordForm.resetFields();
      }, 300);
      this.$emit("success");
    },
  },
};
</script>
