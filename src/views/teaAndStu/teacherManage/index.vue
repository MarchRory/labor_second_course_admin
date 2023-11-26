<template>
  <div class="app-container" v-loading="loading">
    <div class="searchBar">
      <div>
        <div id="keyWords">
          <div style="width: 45%;">关键词:&nbsp;</div>
          <el-input
            v-model="keyWords"
            placeholder="请输入内容"
            clearable
          />
          <div class="searchButtons">
            <el-button @click="keyWords=''">重置</el-button>
            <el-button type="primary" :disabled="searchDisabled" @click="loadList">搜索</el-button>
          </div>
        </div>
      </div>
      <div class="buttons">
        <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">添加教师</el-button>
      </div>
    </div>

    <div class="teacher-list">
      <el-table
        :data="teacherList"
        :row-style="{ height: '30px' }"
        stripe
        height="100%"
        style="width: 100%"
      >
      <el-table-column
          label="序号"
          min-width="50"
          align="center"
        >
          <template slot-scope="scope">
              <div>
                  {{ scope.$index+1 }}
              </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          min-width="50"
          align="center"
        />
        <el-table-column
          prop="sex"
          label="性别"
          min-width="50"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.sex===1" size="medium">男</el-tag>
            <el-tag v-else size="medium" type="danger">女</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="职称"
          min-width="120"
          align="center"
        />
        <el-table-column
          prop="contact"
          label="联系方式"
          min-width="120"
          align="center"
        >
          <template slot-scope="scope">
            <div>
              <el-popover
                placement="right"
                width="250"
                title="联系方式"
                trigger="click">
                <div style="display: flex; flex-direction: column;">
                  <div v-for="(value, key, index) in scope.row.contact" :key="index"
                       style="display: flex; flex-direction: row; justify-content: space-between;
                              width: 100%; margin-top: 10px;
                              font-weight: bold;">
                    <div style="width: 30%; border-left: 4px solid #409EFF; padding-left: 8px;">
                      {{ key }}
                    </div>
                    <div style="width: 70%;">
                      {{ value }}
                    </div>
                  </div>
                </div>
                <el-button slot="reference" type="text">查看</el-button>
              </el-popover>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          min-width="50"
          align="center"
        >
          <template slot-scope="scope">
            <div class="buttons">
              <el-button type="primary" size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-popconfirm
                confirm-button-text="好的"
                cancel-button-text="不用了"
                icon="el-icon-info"
                icon-color="red"
                :title="`确认删除${scope.row.name}吗?`"
                @onConfirm="handleDel(scope.row.id)"
              >
                <el-button slot="reference" type="danger" size="small">删除</el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="block">
        <el-pagination
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 40]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
    </div>
    </div>
    <TeacherModal :dialog-table-visible="dialogTableVisible" :teacher="JSON.parse(JSON.stringify(currentTeacher))" :is-update="isUpdate"/>
  </div>
</template>

<script>
import { clearObj } from '@/api/common'
import { deleteTeacher, teacherList } from '@/api/teacher'
import TeacherModal from '@/views/teaAndStu/teacherManage/teacherModal.vue'
export default {
  components: { TeacherModal },
  data() {
    return {
      teacherList: [],
      keyWords: '',
      total: 1,
      page: 1,
      pageSize: 10,
      currentTeacher: {},
      dialogTableVisible: false,
      isUpdate: false,
      loading: false
    }
  },
  watch: {
    keyWords: {
      handler(newV, oldV){
        if(newV == ''){
          this.page = 1
          this.loadList()
        }
      }
    }
  },
  computed:{
    searchDisabled(){
      return this.keyWords === ''
    }
  },
  created() {
    this.loadList()
  },
  mounted() {
  },
  methods: {
    handleCreate() {
      this.isUpdate = false
      clearObj(this.currentTeacher)
      this.dialogTableVisible = true
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize
      this.loadList()
    },
    handleCurrentChange(newPage) {
      this.page = newPage
      this.loadList()
    },
    handleUpdate(row) {
      this.isUpdate = true
      this.currentTeacher = row
      this.dialogTableVisible = true
    },
    handleClose() {
      this.dialogTableVisible = false
    },
    handleDel(row) {
      deleteTeacher(row).then(res => {
        if(res.code == 200){
          this.$message.success('删除成功')
          this.loadList()
        }
      })
    },
    loadList() {
      this.loading = true
      teacherList({ pageNum: this.page, pageSize: this.pageSize, keyWords: this.keyWords })
      .then(res => {
        this.teacherList = res.data.list
        this.total = res.data.total
      })
      .finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep{
  .el-button{
    letter-spacing: 1px;
    padding: 10px 13px 10px 13px;
  }
  .el-popconfirm__action{
    display: flex;
    margin-left: 10px;
  }
}
.app-container {
  background-color:#d6d6d640;
  height: calc(100vh - 50px);
  overflow-y: auto;
  overflow-x: hidden;
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
  .searchBar{
    height: 60px;
    padding: 5px 5% 5px 10%;
    width: 100%;
    background-color: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    transition: box-shadow 0.25s ease-in;
    &:hover{
      box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
    }
    #keyWords{
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      color: #838383;
    }
    .searchButtons{
      display: flex;
      flex-direction: row;
      margin-left: 15px;
    }
  }
  .buttons{
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 30px;
    }
  .teacher-list{
    margin-top: 10px;
    height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0.5% 20px 0.5%;
    background-color: #ffffff;
    transition: box-shadow 0.25s ease-in;
    div{
      margin-bottom: 10px;
    }
    &:hover{
      box-shadow: 0 0 20px rgba(192, 192, 192, 0.405);
    }
  }
}
</style>
