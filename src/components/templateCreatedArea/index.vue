<template>
  <div
    class="evaluate"
    :style="{
      border: isContenteditable ? 'solid 2px rgb(224, 224, 224)' : '',
      height: isContenteditable ? 'auto' : 'fit-content',
    }"
  >
    <div
      class="text"
      :contenteditable="isContenteditable"
      ref="templateBox"
      v-html="template"
      @paste="HandlePaste"
      @blur="templateUpdate"
      @contextmenu.stop.prevent="handleOpenMenu"
    />
    <!-- 右键菜单 -->
    <div
      v-if="isUseRightMenu"
      v-show="context.visibleMenu"
      :style="{
        left: context.left + 'px',
        top: context.top + 'px',
        position: 'fixed',
        width: 'fit-content',
      }"
      id="rightMenu"
    >
      <button
        class="el-icon-close"
        id="cancel"
        type="button"
        @click="closeMenu"
      ></button>
      <el-dropdown @command="chooseType">
        <el-button type="primary" style="margin-right: 5px">
          {{ chosenType.id == -1 ? "选择类别" : chosenType.text
          }}<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-infinite-scroll="loadTypesList"
            :infinite-scroll-disabled="wordType.list.length >= wordType.total"
            :infinite-scroll-distance="0"
            :infinite-scroll-immediate="false"
            v-for="(item, index) in wordType.list"
            :key="index"
            :command="item"
            >{{ item.type }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown @command="onAddItem">
        <el-button type="primary" style="margin-right: 5px">
          选择词性<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(item, index) in partOfSpeechList"
            :key="index"
            :command="item"
            >{{ item.text }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { wordTypePage } from "@/api/word/wordType";
export default {
  props: {
    isShow: {
      type: Boolean,
    },
    templateText: {
      type: String,
      required: true,
      default: "",
    },
    isEdit: {
      type: Boolean,
      required: true,
    },
    isUseRightMenu: {
      type: Boolean,
      default: true,
    },
    insertDisabled: {
      type: Boolean,
      default: false,
    },
    isContenteditable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      template: "",
      openMenu: {},
      curposInfo: {},
      context: {
        visibleMenu: false,
        contextLeftMenu: false,
        contextRightMenu: false,
        top: 0,
        left: 0,
      },
      chosenType: {
        id: -1,
        text: "",
      },
      typeTotal: 0,
      sel: null,
      savedRange: null,
      selectObj: null,
      wordType: {
        list: [],
        total: 0,
      },
      partOfSpeechList: [
        { text: "其他", value: 0 },
        { text: "名词", value: 1 },
        { text: "动词", value: 2 },
        { text: "形容词", value: 3 },
        { text: "副词", value: 4 },
      ],
      wordTypePageParams: {
        page: 1,
        pageSize: 10,
        key: "",
        withDate: false,
      },
      pagination: {
        pageNum: 1,
        pageSize: 10,
      },
    };
  },
  watch: {
    isEdit: {
      handler(newVal, oldVal) {
        if (this.isContenteditable) {
          this.template = newVal ? this.templateText : "";
        }
      },
    },
    templateText: {
      handler(newVal, oldVal) {
        if (!this.isContenteditable) {
          this.template = newVal;
        } else {
          if (this.isEdit) {
            this.template = newVal;
          }
        }
      },
      immediate: true,
    },
    isShow: {
      handler(newVal) {
        if (newVal && this.isContenteditable && !this.isEdit) {
          // 模板清空要通过直接操作innerHTML进行
          this.$refs.templateBox.innerHTML = "";
        }
      },
    },
  },
  created() {
    this.loadTypesList();
  },
  mounted() {
    // 将动态生成的DOM上的方法挂载在window上，使其在Vue完成挂载后可以被访问
    window.insertText = this.insertText;
  },
  methods: {
    choosePartOfSpeech(part) {
      this.partOfSpeech = part.value;
    },
    chooseType(TypeItem) {
      this.chosenType.id = TypeItem.id;
      this.chosenType.text = TypeItem.type;
    },
    onAddItem(item) {
      if (this.chosenType.id == -1) {
        this.$message.warning("请先选择词汇类别");
        return;
      }
      let tag = this.createNode(item);
      this.pasteHtmlAtCaret(tag);
    },
    pasteHtmlAtCaret(html) {
      let sel, range;
      // IE9 and non-IE
      if (this.selectObj) {
        sel = this.selectObj;
        if (sel && sel.rangeCount === 0 && this.savedRange !== null)
          sel.addRange(this.savedRange); // 保留光标在文字中间插入的最后位置
        if (sel && sel.rangeCount) range = sel.getRangeAt(0);
        if (["", null, undefined].includes(range)) {
          // 如果div没有光标，则在div内容末尾插入
          range = this.keepCursorEnd(true).getRangeAt(0);
        } else {
          range = this.savedRange;
        }
        let input = range.createContextualFragment(html);
        let lastNode = input.lastChild; // 记录插入input之后的最后节点位置
        range.insertNode(input);
        if (lastNode) {
          // 如果有最后的节点
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else if (
        document["selection"] &&
        document["selection"].type !== "Control"
      ) {
        // IE < 9
        document["selection"].createRange().pasteHTML(html);
      }
      this.closeMenu();
    },
    keepCursorEnd(isReturn) {
      // const div = document.getElementById('edit');
      if (window.getSelection) {
        // ie11 10 9 firefox safari
        this.$refs.templateBox.focus();
        let sel = window.getSelection(); // 创建range
        sel.selectAllChildren(this.$refs.templateBox); // range 选择obj下所有子内容
        sel.collapseToEnd(); // 光标移至最后
        if (isReturn) return sel;
      } else if (document["selection"]) {
        // ie9以下
        let sel = document["selection"].createRange(); // 创建选择对象
        sel.moveToElementText(this.$refs.templateBox); // range定位到编辑器
        sel.collapse(false); // 光标移至最后
        sel.select();
        if (isReturn) return sel;
      }
    },
    handleOpenMenu(e) {
      if (!this.isUseRightMenu) {
        return;
      }
      let x = e.clientX;
      let y = e.clientY;
      this.context.top = y + 20;
      this.context.left = x - 20;
      this.context.visibleMenu = true;
      this.HandleSelectionChange();
    },
    HandleSelectionChange() {
      let sel = window.getSelection && window.getSelection();
      console.log(sel);
      if (sel && sel.rangeCount) {
        this.savedRange = sel.getRangeAt(0);
        this.selectObj = sel;
      }
    },
    HandlePaste(e) {
      e.stopPropagation();
      e.preventDefault();
      var text = "";
      var event = e.originalEvent || e;
      if (event.clipboardData && event.clipboardData.getData) {
        text = event.clipboardData.getData("text/plain");
      } else if (window["clipboardData"] && window["clipboardData"].getData) {
        text = window["clipboardData"].getData("Text");
      }
      if (document.queryCommandSupported("insertText")) {
        document.execCommand("insertText", false, text);
      } else {
        document.execCommand("paste", false, text);
      }
    },
    closeMenu() {
      this.context.contextLeftMenu = false;
      this.context.contextRightMenu = false;
      this.context.visibleMenu = false;
    },
    templateUpdate() {
      //this.HandleSelectionChange();
      this.$emit("onChange", this.$refs.templateBox.innerHTML);
    },
    loadTypesList() {
      wordTypePage({
        ...this.wordTypePageParams,
      }).then((res) => {
        const { list, total } = res.data;
        list.forEach((typeItem) => {
          this.wordType.list.push(typeItem);
        });
        this.wordType.total = total;
      });
    },
    createNode(data) {
      // const text = this.chosenType.text + ": " + data.text;
      const text = data.text;
      const params = {
        word: text,
        typeId: this.chosenType.id,
        partOfSpeech: data.value,
      };
      return `<input type="button" class="templateBtn" onclick='insertText(event, ${JSON.stringify(
        params
      )})' value="${text}" onContextmenu='event.preventDefault(); event.stopPropagation()'>`;
    },
    insertText(e, params) {
      if (this.insertDisabled || this.isContenteditable) {
        this.$emit("onInsertText", e, params);
      }
    },
    getDOM() {
      return this.$refs.templateBox.innerHTML;
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep {
  .el-dropdown-menu {
    width: 100%;
    height: 200px;
  }
}
.evaluate {
  width: 100%;
  min-height: 60px;
  max-height: 350px;
  overflow-y: auto;
  padding: 10px;
  border-radius: 5px;
  border: solid 2px rgb(224, 224, 224);
  line-height: 25px;
  transition: border-color 0.4s ease-in-out;
}
.text {
  width: 100%;
  height: 100%;
  #rightMenu {
  }
}
// 右键菜单关闭按钮
#cancel {
  position: absolute;
  right: -17px;
  top: -17px;
  background-color: transparent;
  border: none;
}
</style>
