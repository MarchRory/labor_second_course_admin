<template>
  <div v-permission="['user.major', 'user.major.add', 'user.major.update']">
    <el-dialog
      :title="isUpdate ? '更新专业' : '添加专业'"
      :visible.sync="majorModalVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form :model="major" label-position="left">
        <el-form-item label="专业名称">
          <el-input v-model="major.majorName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="归属学院">
          <el-select
            v-model="major.departmentId"
            filterable
            placeholder="请选择活动区域"
          >
            <el-option
              v-for="department in departmentList"
              :key="department.id"
              :label="department.departmentName"
              :value="department.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSuccess">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getMajor, saveMajor, updateMajor } from "@/api/department/major";
import departmentApi from "@/api/department/department";

export default {
  name: "MajorModal",
  emits: ["close", "success"],
  props: {
    majorId: {
      // eslint-disable-next-line vue/require-prop-type-constructor
      type: Number | String,
      required: true,
    },
    majorModalVisible: {
      type: Boolean,
      default: false,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      departmentList: [],
      major: {
        departmentId: undefined,
        majorName: "",
      },
    };
  },
  watch: {
    majorId: function (newVal, oldVal) {
      if (this.isUpdate) {
        this.loading = true;
        getMajor(newVal).then((res) => {
          const { data } = res;
          this.major = data;
          this.loading = false;
        });
      } else {
        this.major = {};
      }
    },
  },
  created() {
    this.loadDepartmentSelect();
  },
  methods: {
    loadDepartmentSelect() {
      departmentApi.getDepartmentList("", 1, 100).then((res) => {
        const { data } = res;
        this.departmentList = data.list.filter((department) => {
          // 排除默认占位学院
          return department.id !== 1;
        });
      });
    },
    handleClose() {
      this.$emit("close");
    },
    async handleSuccess() {
      if (this.isUpdate) {
        this.major.id = this.majorId;
        await updateMajor(this.major);
      } else {
        await saveMajor(this.major);
      }
      this.$emit("success");
    },
  },
};
</script>

<style scoped></style>
