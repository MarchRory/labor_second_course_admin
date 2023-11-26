<template>
  <div>
    <el-select
      multiple
      v-model="chosenTagsName"
      :collapse-tags="collapse"
      :disabled="disabled"
      :style="selectStyle"
      :placeholder="placeholder"
      @visible-change="handleCheckChange"
    >
      <el-option :value="chosenValue">
        <el-tree
          ref="tree"
          show-checkbox
          :data="tree"
          :props="treeProps"
          :node-key="treeProps.id"
          :default-checked-keys="chosenValue"
        />
      </el-option>
    </el-select>
  </div>
</template>

<script>
// 改良版 el-select-tree
import { faltten } from "@/api/common";
import { filterParentId } from "@/utils/filterUtils";
export default {
  name: "selectTree",
  props: {
    // 即collapse-tags, false则将tag默认合并, true则显示每一个选择的tag, 默认为true
    collapse: {
      type: Boolean,
      default: true,
    },
    // 是否禁用select
    disabled: {
      type: Boolean,
      default: false,
    },
    // 选择框样式
    selectStyle: {
      type: Object,
      default: () => {
        return {
          width: "100%",
        };
      },
    },
    // 初始选择的节点的id数组
    originValue: {
      type: [String, Array, Number],
      default: [],
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
    // 树节点的数据结构
    treeProps: {
      type: Object,
      default: () => {
        return {
          id: "id",
          label: "name",
          children: "children",
          disabled: false,
        };
      },
    },
    // 树
    tree: {
      type: Array,
      default: [],
    },
  },
  computed: {
    chosenValue() {
      if (!this.copyOriginValue.includes("301")) {
        this.copyOriginValue.push("301");
      }
      return this.copyOriginValue;
    },
    flatTree() {
      return faltten(this.tree);
    },
    chosenTagsName() {
      let chosenNames = [];
      this.chosenValue.forEach((chosenId) => {
        let findObj = this.flatTree.find((item) => item.id == chosenId);
        if (findObj) {
          chosenNames.push(findObj[`${this.treeProps.label}`]);
        }
      });
      return chosenNames;
    },
  },
  watch: {
    originValue: {
      handler(newVal, oldVal) {
        this.copyOriginValue = newVal;
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys([301, ...newVal]);
        });
      },
      immediate: true,
    },
  },
  data() {
    return {
      copyOriginValue: [],
    };
  },
  methods: {
    // 出于性能考虑, 选中值在表单数据的更新过程在下拉框收起时进行
    async handleCheckChange(isVisible) {
      if (!isVisible) {
        let checkedNodes = this.$refs.tree.getCheckedNodes();
        let checkedKeys = this.$refs.tree.getCheckedKeys();
        this.copyOriginValue = await filterParentId(
          checkedNodes,
          checkedKeys,
          this.flatTree
        );
        this.$emit("receiveData", this.chosenValue);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-tree {
    .is-current {
      .el-tree-node__label {
        color: #1b65b9;
        font-weight: 700;
      }
      .el-tree-node__children .el-tree-node__label {
        color: #606266;
        font-weight: normal;
      }
    }
  }
  // 取消 le-select 中tag的删除功能
  .el-tag__close {
    display: none;
  }
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  padding: 0;
  overflow: hidden;
}

.el-scrollbar .el-select-dropdown__item.selected {
  font-weight: normal;
}

// 横向滚动条
.el-scrollbar__bar.is-horizontal {
  height: 6px;
  left: 2px;
}
// 纵向滚动条
.el-scrollbar__bar.is-vertical {
  width: 6px;
  top: 2px;
}

// 字体和大小
.custom-tree-node {
  font-family: "Microsoft YaHei";
  font-size: 14px;
  position: relative;
}

// 原生el-tree-node的div是块级元素，需要改为inline-block，才能显示滚动条
.treeSelect .el-tree > .el-tree-node {
  display: inline-block;
  min-width: 100%;
}
</style>
