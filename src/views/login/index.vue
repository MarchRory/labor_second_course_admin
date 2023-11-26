<template>
  <div class="login-container">
    <div class="bg">
      <div class="mask"></div>
      <video class="maskVideo" autoplay loop preload muted>
        <source src="./seaCloud.mp4" type="video/mp4" />
      </video>
    </div>

    <div class="mainArea">
      <video class="topVideo" autoplay loop preload muted>
        <source src="./seaCloud.mp4" type="video/mp4" />
      </video>

      <div class="menu">
        <div class="info">
          <ul>
            <li>课程考评系统</li>
            <li>Welcome!</li>
            <li>Back To Admin!</li>
          </ul>
        </div>

        <div class="loginArea">
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            auto-complete="on"
            label-position="left"
          >
            <div class="title-container">
              <h3 class="title">登录</h3>
            </div>
            <el-form-item prop="username">
              <span class="svg-container">
                <svg-icon icon-class="user" style="color: white" />
              </span>
              <el-input
                ref="username"
                v-model="loginForm.username"
                placeholder="账号"
                name="username"
                type="text"
                tabindex="1"
                auto-complete="on"
              />
            </el-form-item>

            <el-form-item prop="password">
              <span class="svg-container">
                <svg-icon icon-class="password" style="color: white" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                tabindex="2"
                auto-complete="on"
                @keyup.enter.native="handleLogin"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon
                  :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                />
              </span>
            </el-form-item>

            <el-button
              v-debounce
              :loading="loading"
              type="primary"
              style="
                width: 100%;
                margin-bottom: 30px;
                display: flex;
                justify-content: center;
                letter-spacing: 5px;
              "
              @click.native.prevent="handleLogin"
            >
              登&nbsp;录
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";
export default {
  name: "Login",
  data() {
    const validateUsername = (rule, value, callback) => {
      if (validUsername(value)) {
        callback(new Error("用户名不能含有特殊字符"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      //密码格式限制，以后看有没有需要改
      if (value.length < 4) {
        callback(new Error("密码不得少于4个字符"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.redirect = "DashBoard";
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
video {
  z-index: -10;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.bg {
  width: 100%;
  height: 100vh;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  overflow: hidden;
  .mask {
    width: 100%;
    height: 100vh;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    backdrop-filter: blur(20px);
  }
  .maskVideo {
    z-index: -10;
    min-width: 100%;
    min-height: 100%;
  }
}
/*   @media (min-aspect-ratio: 16/9){
      video{
        width: 100%;
        height: auto;
      }
    } */
@media (max-aspect-ratio: 16/9) {
  video {
    height: 100%;
    width: auto;
  }
}

.topVideo {
  z-index: -1;
  min-height: 40%;
  min-width: 80%;
}

.login-container {
  min-height: 100%;
  width: 100%;
  // background-color: $bg;

  overflow: hidden;

  .login-form {
    z-index: 20;
    position: relative;
    width: 25vw;
    max-width: 100%;
    padding: 3vw 2vw 0;
    margin: 0 auto;
    overflow: hidden;
    backdrop-filter: blur(10px);
    border-radius: 30px;
    border: solid 3px rgba(246, 241, 241, 0);
    transition: all 0.2s ease;
    &:hover {
      border: solid 3px rgba(246, 241, 241, 0.87);
    }
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
.mainArea {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-width: 80%;
  min-height: 70vh;
  border-radius: 30px;
  box-shadow: 0 0 30px rgba(188, 187, 187, 0.2);
  overflow: hidden;
  video {
    z-index: 10;
  }
}

.menu {
  z-index: 50;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  min-width: 90%;
}
.info {
  color: white;
  font-weight: 900;
  height: 100%;
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    li:first-child {
      font-size: 4em;
      letter-spacing: 5px;
      position: relative;
      top: -21vh;
    }
    li:nth-child(2),
    li:nth-child(3) {
      font-size: 2em;
    }
  }
  ul:hover {
    cursor: default;
  }
}
</style>
