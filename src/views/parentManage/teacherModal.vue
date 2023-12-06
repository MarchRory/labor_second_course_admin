<template>
  <div class="container">
    <el-dialog title="教师信息" :visible.sync="dialogTableVisible" width="30%" :close-on-click-modal ="false" :before-close="close">
      <el-form :model="teacherInfo" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="teacherInfo.name" show-word-limit style="width: 80%" />
        </el-form-item>
        <el-form-item label="职称">
          <el-input v-model="teacherInfo.title" show-word-limit style="width: 80%" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input placeholder="请输入内容" v-model="teacherInfo.contact.电话" style="width: 80%; margin-bottom: 10px;">
            <template slot="prepend">电话 </template>
          </el-input>
          <el-input placeholder="请输入内容" v-model="teacherInfo.contact.邮箱" style="width: 80%; margin-bottom: 10px;">
            <template slot="prepend">邮箱 </template>
          </el-input>
          <el-input placeholder="请输入内容" v-model="teacherInfo.contact.QQ" style="width: 80%; margin-bottom: 10px;">
            <template slot="prepend">QQ </template>
          </el-input>
          <el-input placeholder="请输入内容" v-model="teacherInfo.contact.微信" style="width: 80%">
            <template slot="prepend">微信 </template>
          </el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select placeholder="请选择性别" v-model="teacherInfo.sex" :value="teacherInfo.sex==1 ? '男' : `${teacherInfo.sex===0 ? '女' : ''}`" style="width: 80%;">
            <el-option label="男" value="1" />
            <el-option label="女" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" v-if="!isUpdate" @click="handleCreate" :disabled="createDisabled">提交</el-button>
        <el-button type="primary" v-else @click="handleUpdate" :disabled="updateDisabled">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addTeacher, updateTeacher } from '@/api/teacher'

export default {
  name: 'TeacherModal',
  props: ['teacher', 'dialogTableVisible','isUpdate'],
  data() {
    return {
      teacherInfo: {
        name: '',
        title: '',
        contact: {
          '电话': '',
          '邮箱': '',
          'QQ': '',
          '微信': ''
        },
        sex: ''
      },
      copy: null,
    }
  },
  watch: {
    teacher: {
      handler(newer, older){
        let flag = Object.keys(this.teacher).length
        if (flag !== 0) {
          this.teacherInfo = this.teacher
          this.copy = JSON.stringify(this.teacher)
        } else {
          this.teacherInfo = {
              name: '',
              title: '',
              contact: {
                '电话': '',
                '邮箱': '',
                'QQ': '',
                '微信': ''
              },
              sex: ''
            }
        }
      }
    }
  },
  computed:{
    createDisabled() {
      if(this.teacherInfo.sex!=0 && this.teacherInfo.sex!=1){
        return true
      }else{
        let values = Object.values(this.teacherInfo.contact)
        if(values.every((item) => !Boolean(item))){
          return true
        }else{
          return Object.values(this.teacherInfo).some(item => !Boolean(item))
        }
      }
    },
    updateDisabled() {
      return this.copy === JSON.stringify(this.teacher)
    }
  },
  mounted(){
  },
  methods: {
    close(){
      this.$parent.handleClose()
      this.$parent.loadList()
    },
    handleCreate() {
        addTeacher(this.teacherInfo).then(res =>{
          if(res.code == 200){
            this.$message.success('添加成功')
            this.close()
          }
        })
    },
    handleUpdate() {
      updateTeacher(this.teacherInfo).then(res =>{
        if(res.code == 200){
          this.$message.success('更新成功')
          this.close()
        }
      })
     }
  }
}
</script>

<style lang="scss" scoped>
::v-deep{
  .el-scrollbar__wrap{
    overflow: auto;
  }
  .el-input-group__prepend{
    padding: 0 15px;
  }
}
.dialog-footer{
  display: flex;
  flex-direction: row;
  margin-left: 60%;
}
</style>
