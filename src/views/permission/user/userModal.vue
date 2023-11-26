<template>
  <div v-permission="['user.user.add', 'user.user.update']" class="container">
    <el-dialog
      title="用户信息"
      :visible.sync="dialogTableVisible"
      width="30%"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :before-close="close"
    >
      <el-form :model="userInfo" label-width="80px">
        <el-form-item label="账号">
          <el-input
            v-model="userInfo.userName"
            placeholder="设置用户登录账号"
            show-word-limit
            style="width: 80%"
            @input="onInput"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="userInfo.password"
            :placeholder="`${isUpdate ? '修改用户密码' : '设置密码'}`"
            show-word-limit
            style="width: 80%"
            @input="onInput"
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input
            v-model="userInfo.nickname"
            show-word-limit
            style="width: 80%"
            @input="onInput"
          />
        </el-form-item>
        <el-form-item label="类别">
          <el-select
            v-model="userInfo.type"
            placeholder="用户类别"
            :value="
              userInfo.type == 1
                ? '教师'
                : `${userInfo.type == 0 ? '学生' : ''}`
            "
            style="width: 80%"
            @input="onInput"
          >
            <el-option label="教师" value="1" />
            <el-option label="学生" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button
          v-if="!isUpdate"
          type="primary"
          :disabled="submitDisabled"
          @click="handleCreate"
          >提交</el-button
        >
        <el-button
          v-else
          type="primary"
          :disabled="submitDisabled"
          @click="handleUpdate"
          >修改</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addUser, updateUser } from "@/api/user";

export default {
  name: "UserModal",
  props: ["user", "dialogTableVisible", "isUpdate"],
  data() {
    return {
      userInfo: {
        userName: "",
        nickname: "",
        password: "",
        type: null,
      },
      copy: null,
    };
  },
  computed: {
    submitDisabled() {
      if (this.isUpdate) {
        return this.copy === JSON.stringify(this.userInfo);
      } else {
        return Object.values(this.userInfo).some((v) => !v);
      }
    },
  },
  watch: {
    user: {
      handler(newer, older) {
        if (newer.id && newer.id != 0) {
          this.userInfo = JSON.parse(JSON.stringify(newer));
          this.copy = JSON.stringify(this.userInfo);
        } else {
          this.userInfo = {
            userName: "",
            nickname: "",
            password: "",
            type: null,
          };
          this.copy = null;
        }
      },
    },
  },
  mounted() {},
  methods: {
    onInput() {
      this.$forceUpdate();
    },
    close() {
      this.$parent.handleClose();
    },
    handleCreate() {
      addUser(this.userInfo).then((res) => {
        if (res.code == 200) {
          this.$message.success("添加成功");
          this.close();
          this.$parent.loadList();
        }
      });
    },
    handleUpdate() {
      updateUser(this.userInfo).then((res) => {
        if (res.code == 200) {
          this.$message.success("更新成功");
          this.close();
          this.$parent.loadList();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-scrollbar__wrap {
    overflow: auto;
  }
  .el-input-group__prepend {
    padding: 0 15px;
  }
}
.dialog-footer {
  display: flex;
  flex-direction: row;
  margin-left: 60%;
}
</style>
