<template>
  <div class="box">
    <el-divider content-position="right">
      <div style="font-size: 23px; font-weight: 700">
        全部评价<span style="margin-left: 15px; font-size: 25px">{{
          total
        }}</span>
      </div>
    </el-divider>
    <div style="overflow-y: auto; flex: 1">
      <div v-if="total != 0" style="max-height: 400px">
        <div
          v-for="(comment, index) in evaluateList"
          :key="index"
          class="everComment"
        >
          <el-avatar
            v-if="comment.createBy.id != '****'"
            :size="45"
            :src="comment.createBy.avatar || defaultAvatar"
          />
          <el-avatar v-else :size="45" icon="el-icon-user-solid" />
          <div class="main">
            <div class="userInfo">
              <div class="baseInfo">
                {{
                  comment.createBy.id != "****"
                    ? comment.createBy.name
                    : "匿名用户"
                }}
                <div class="institude">
                  {{
                    comment.createBy.id != "****"
                      ? comment.createBy.department
                      : " "
                  }}
                </div>
              </div>
              <div class="time">
                {{ comment.gmtCreate }}
              </div>
            </div>
            <div class="texts">
              {{ comment.evaluateText }}
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无评论" />
    </div>
    <div style="height: 4%; width: 100%">
      <el-pagination
        style="margin: 0 auto; width: fit-content"
        :page-size="Pagination.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 15, 20, 25, 30]"
        medium
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
// import { pageCourseEvaluate } from "@/api/selfEvaluate";
import { getCommentsToLessons } from "@/api/lessons";
import { mapGetters } from "vuex";
export default {
  name: "CommentsList",
  props: {
    id: {
      type: Number | String,
    },
  },
  created() {},
  computed: {
    ...mapGetters(["defaultAvatar"]),
  },
  watch: {
    id: {
      handler(n, o) {
        if (n) {
          this.Pagination.courseId = n;
          this.loadList();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      Pagination: {
        courseId: 1,
        page: 1,
        pageSize: 10,
      },
      evaluateList: [],
      total: 0,
      currentPage: 1,
    };
  },
  methods: {
    handleSizeChange(size) {
      this.Pagination.pageSize = size;
      this.loadList();
    },
    handleCurrentChange(page) {
      this.Pagination.page = page;
      this.loadList();
    },
    loadList() {
      getCommentsToLessons({
        ...this.Pagination,
      }).then((res) => {
        const { list, total } = res.data;
        this.evaluateList = list;
        this.total = Number(total);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.texts {
  font-size: 16px;
  color: rgba(70, 69, 69, 0.719);
  line-height: normal;
  word-break: break-all;
  letter-spacing: 1px;
  margin-top: 10px;
}
.box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.everComment {
  padding: 20px 30px 15px 30px;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: auto;
  min-height: 150px;
  .main {
    display: flex;
    flex-direction: column;
    width: 90%;
    margin-left: 17px;
    height: auto;
    min-height: 130px;
    .userInfo {
      font-weight: 500;
      font-size: 22px;
      display: flex;
      justify-content: space-between;
      .baseInfo {
        display: flex;
        flex-direction: column;
      }
      .institude {
        font-size: 13px;
        height: 13px;
        margin-top: 5px;
        color: grey;
      }
      .time {
        font-size: 16px;
        color: #8080807d;
        margin-top: 5px;
      }
    }
  }
}
</style>
