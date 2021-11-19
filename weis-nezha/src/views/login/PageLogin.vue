<template>
  <div class="login-container">
    <header class="login-header">
      <img class="login-header-image" src="/images/signin_logo.png" alt="weis维士运营综合平台" />
    </header>
    <main class="login-main">
      <div>
        <div>
          <el-tabs
            v-if="systemConfig.includes('account_login')"
            v-model="loginTab"
            class="login-tabs"
            type="card"
          >
            <el-tab-pane label="账户登录" name="账户登录"></el-tab-pane>
            <el-tab-pane label="扫码登录" name="扫码登录"></el-tab-pane>
          </el-tabs>
        </div>
        <div class="login-box">
          <div v-show="loginTab === '账户登录'" class="account-login">
            <el-alert
              v-show="showTips"
              title="登录名或登录密码不正确"
              type="warning"
              show-icon
              @close="showTips = false"
            ></el-alert>
            <div class="login-item">
              <el-input v-model="loginModel.phone" placeholder="账户" prefix-icon="el-icon-user"></el-input>
            </div>
            <div class="login-item">
              <el-input
                v-model="loginModel.password"
                type="password"
                placeholder="密码"
                prefix-icon="el-icon-lock"
                @keydown.enter="loginClick"
              ></el-input>
            </div>
            <div class="login-btn-item">
              <el-button class="login-btn" type="primary" @click="loginClick">登录</el-button>
            </div>
            <img class="signin-image-1" src="/images/signin_1.png" alt />
            <img class="signin-image-2" src="/images/signin_2.png" alt />
            <img class="signin-image-3" src="/images/signin_3.png" alt />
            <img class="signin-image-4" src="/images/signin_4.png" alt />
          </div>
          <div v-show="loginTab === '扫码登录'" id="dd_login"></div>
        </div>
      </div>
    </main>
    <HomeCopyFooter class="login-footer"></HomeCopyFooter>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapGetters } from 'vuex'
import * as mutationTypes from '@/store/types'
import HomeCopyFooter from '@/views/layout/components/HomeCopyFooter.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    HomeCopyFooter
  },
  computed: mapGetters(['systemConfig']),
  data() {
    return {
      loginTab: '扫码登录',
      showTips: false,
      loginModel: {
        phone: '',
        password: ''
      },
      loginRules: {
        phone: { required: true, message: '请输入账号', trigger: 'blur' },
        password: { required: true, message: '请输入密码', trigger: 'blur' }
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('message', this.messageHandler)
  },
  mounted() {
    // http://prodnezha.weis1606.cn/images/sideba_logo.png	http://nezha.weis1606.cn/dingtalk_login
    const script = document.createElement('script')
    script.src = 'https://g.alicdn.com/dingding/dinglogin/0.0.5/ddLogin.js'
    document.body.appendChild(script)
    this.appid = {
      'localhost': 'dingoahykdvzbhgmqytgcw',
      'nezha.weis1606.cn': 'dingoaf3apmry6fl6e1h1b',
      'prodnezha.weis1606.cn': 'dingoa29zlc9dzvhhccf8c'
    }[window.location.hostname]
    this.redirUrl = encodeURIComponent(`${window.location.origin}/#/login`)

    script.onload = () => { // 钉钉扫码登录
      const goto = encodeURIComponent(`https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${this.appid}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${this.redirUrl}`)
      window.DDLogin({
        id: 'dd_login',//这里需要你在自己的页面定义一个HTML标签并设置id，例如<div id="login_container"></div>或<span id="login_container"></span>
        goto: goto, //请参考注释里的方式
        style: 'border:none;background-color:#FFFFFF;',
        width: '365',
        height: '400'
      })
      window.addEventListener('message', this.messageHandler)
    }
  },
  methods: {
    messageHandler(event) {
      const origin = event.origin
      if (origin == 'https://login.dingtalk.com') { //判断是否来自ddLogin扫码事件。
        const loginTmpCode = event.data
        // eslint-disable-next-line
        window.location.href = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${this.appid}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${encodeURIComponent(`${window.location.origin}/#/welcome`)}&loginTmpCode=${loginTmpCode}`
      }
    },
    ...mapMutations({
      setPasswordStatus: mutationTypes.SET_PASSWORD_STATUS
    }),
    ...mapActions(['getUserData']),
    handleLogin() {
      return this.$request('sys.User/login', this.loginModel)
    },
    loginClick() {
      if (this.loginModel.phone.length <= 0 || this.loginModel.password.length <= 0) {
        this.$message({
          type: 'error',
          message: '请填写完整的账号信息'
        })
      } else {
        this.handleLogin()
          .then(({ data }) => {
            if (data.errCode === 0) {
              const { token, needNewPwd } = data.obj
              if (needNewPwd) {
                this.setPasswordStatus(true)
              }
              sessionStorage.setItem('token', token)
              this.getUserData()
                .then(() => {
                  this.$router.replace('/welcome')
                })
            } else if (data.errCode === 1012) { // 1012码为登录失效 跳转login页面
              this.$pushRoute('/login')
            } else if (data.errCode === 1001) {
              this.showTips = true
            } else {
              this.$message({
                type: 'error',
                message: data.errMsg
              })
            }
          })
      }
    }
  }
})
</script>

<style lang="less" scoped>
@import "../../styles/base.less";

.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f3f7;
  overflow: hidden;
}

.login-header {
  text-align: center;
  margin: 12.4vh 0 50px;
  .login-header-image {
    width: 370px;
    height: 78px;
  }
}

.login-main {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.login-tabs .el-tabs__header) {
  margin-bottom: 0;
}

:deep(.login-tabs .el-tabs__nav) {
  background-color: #fff;
}

.login-box {
  width: 380px;
  position: relative;
  background-color: #fff;
  padding: 40px 40px 60px;
  box-shadow: 0px 17px 37px 0px rgba(19, 22, 30, 0.03);
  .login-label {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 30px;
  }
  .login-item {
    margin: 24px 0;
  }
  .login-btn-item {
    margin-top: 40px;
  }
  .signin-image-1 {
    position: absolute;
    top: -106px;
    left: -352px;
  }
  .signin-image-2 {
    position: absolute;
    top: -136px;
    right: -249px;
  }
  .signin-image-3 {
    position: absolute;
    top: 178px;
    right: -500px;
  }
  .signin-image-4 {
    position: absolute;
    bottom: 16px;
    left: -316px;
  }
}

.login-footer {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.login-btn {
  width: 100%;
}
</style>
