<template>
  <div class="app">
    <audio ref="audio01" controls="controls" src="/01.mp3" hidden></audio>
    <audio ref="audio02" controls="controls" src="/02.mp3" hidden></audio>
    <audio ref="audio03" controls="controls" src="/01.mp3" hidden></audio>
    <audio ref="audio11" controls="controls" src="/11.mp3" hidden></audio>
    <audio ref="audio12" controls="controls" src="/12.mp3" hidden></audio>
    <audio ref="audio04" controls="controls" src="/01.mp3" hidden></audio>
    <audio ref="audio31" controls="controls" src="/01.mp3" hidden></audio>
    <audio ref="audio32" controls="controls" src="/02.mp3" hidden></audio>
    <audio ref="audio33" controls="controls" src="/01.mp3" hidden></audio>
    <audio ref="audio34" controls="controls" src="/02.mp3" hidden></audio>
    <HomeHeader @on-create-page="handleCreatePage" />
    <div class="app-container">
      <HomeSidebar />
      <div class="app-main-wrap">
        <TagViews class="app-breadcrumb"></TagViews>
        <div class="app-main-container" style="height: calc(100vh - 110px)">
          <HomeMain></HomeMain>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="passwordVisible"
      title="修改密码"
      :show-close="false"
      :close-on-click-modal="false"
      center
    >
      <el-form
        ref="pwd"
        :model="password"
        :rules="passwordRules"
        label-width="120px"
      >
        <el-form-item label="新密码：" prop="pwd">
          <el-input
            v-model="password.pwd"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认新密码：" prop="pwd2">
          <el-input
            v-model="password.pwd2"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmPasswordClick">确认</el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="box"
      title="警告"
      :modal="true"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="30vh"
      width="30%"
    >
      <span style="color: red">{{ msg }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="danger" @click="closeBox">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import * as mutationTypes from '@/store/types'
import HomeHeader from './components/HomeHeader.vue'
import HomeSidebar from './components/HomeSidebar.vue'
import HomeMain from './components/HomeMain.vue'
import TagViews from './components/TagViews.vue'
import CreateOneFormPage, {
  printOrder,
  printSpellOrder,
  printMeiTuanOrder,
  printEleOrder,
} from '../../utils/pushPrint.js'

export default {
  components: {
    HomeHeader,
    HomeSidebar,
    HomeMain,
    TagViews,
  },
  computed: {
    ...mapGetters(['passwordStatus', 'activeHeaderMenu', 'userData']),
  },
  watch: {},
  created() {
    if (this.passwordStatus) {
      this.passwordVisible = true
    }

    window.addEventListener('beforeunload', () => {
      if (this.page) {
        localStorage.setItem('address', this.page)
      } else {
        const { fullPath } = this.$route

        const isCachePage = [/404$/, /login$/].every(
          (regExp) => !regExp.test(fullPath)
        )
        if (isCachePage) localStorage.setItem('address', fullPath)
      }
    })
  },
  mounted() {
    console.log('isShopLeader', this.userData.shopLeader)

    if (this.userData.shopLeader) {
      this.internetStatus()
      setTimeout(this.initWebSocket(), 1000)
    }
  },
  unmounted() {
    if (this.userData.shopLeader) {
      this.$store.state.online = false     
      console.log('websocket断开连接')
      this.websock.close() // 离开路由之后断开websocket连接
      this.isLogout = true
    }
  },
  data() {
    return {
      box: false,
      msg: '',
      reqData: '',
      src: '',
      number: 0,
      timer: null,
      isLogout: false,
      websock: null,
      password: {
        pwd: '',
        pwd2: '',
      },
      passwordRules: {
        pwd: [
          {
            required: true,
            type: 'string',
            message: '请输入密码',
            trigger: 'blur',
          },
        ],
        pwd2: [
          {
            required: true,
            type: 'string',
            message: '请再次输入确认密码',
            trigger: 'blur',
          },
        ],
      },
      passwordVisible: false,
    }
  },
  methods: {
    ...mapMutations({
      setActiveHeaderMenu: mutationTypes.SET_ACTIVE_HEADER_MENU,
      setPasswordStatus: mutationTypes.SET_PASSWORD_STATUS,
      setOnLine:mutationTypes.SET_ONLINE,
    }),
    handleCreatePage(path) {
      console.log(path, 'path')
      this.page = path
    },

    changePassword() {
      this.$request('sys.User/changUserPwd', {
        password: this.password.pwd,
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '修改密码成功！',
          })
          this.passwordVisible = false
          this.setPasswordStatus(false)
        }
      })
    },
    confirmPasswordClick() {
      if (this.password.pwd !== this.password.pwd2) {
        this.$message({
          type: 'error',
          message: '两次输入密码不一致',
        })
        return
      }

      this.$refs.pwd.validate((valid) => {
        if (valid) {
          this.changePassword()
        }
      })
    },
    // websocket
    initWebSocket() {
      // 初始化weosocket
      const token = sessionStorage.getItem('token')
      let wsuri = ''
      if (window.location.href.includes('prodnezha')) {
        wsuri = `wss://prodnezha.weis1606.cn/websocket/websocket?token=${token}`
      } else if (window.location.href.includes('pre-nezha')) {
        wsuri = `wss://pre-nezha.weis1606.cn/websocket/websocket?token=${token}`
      } else {
        wsuri = `wss://nezha.weis1606.cn/websocket/websocket?token=${token}`
      }

      this.websock = new WebSocket(wsuri)
      clearInterval(this.timer)
      console.log('测试websocket')
      // this.number++;
      console.log('websocket链接成功')
      // sessionStorage.setItem("offLine", false);
      //  this.$store.state.online = true   
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() {
      // 连接建立之后执行send方法发送数据
    
      const actions = { test: '12345' }
      this.setOnLine(true)
      this.websocketsend(JSON.stringify(actions))
    },
    websocketonerror() {
      // 连接建立失败重连
      console.log('连接失败', e)

      this.cloaseSocket(this.websock)
      if (!this.isLogout) {
        this.initWebSocket()
      }
    },
    websocketonmessage(e) {
      // 数据接收
      console.log('数据接收')
      const redata = JSON.parse(e.data)
      const date = this.$day(new Date()).format('YYYY-MM-DD HH:mm:ss') //接收时间
      for (const item of redata) {
        if (!item.type) continue
        if (item.type === '21' || item.type === '22') {
          const message =
            item.type === '21'
              ? '未填写营业盘点数据，请尽快填写！'
              : '未填写打烊盘点数据，请尽快填写！'
          this.msg = message
          this.box = true
          this.reqData = JSON.stringify({
            oid: item.oid,
            type: item.type,
            hpId: item.hpId,
          })
        } else {
          this.$refs[`audio${item.type}`].currentTime = 0
          this.$refs[`audio${item.type}`].play()
          // const message = {
          // '01': '你有一条新的订单',
          // '02': '你有一条新的取消订单',
          // '03': '你有一条新的变更订单',
          //   '31': "你有一条新的美团订单",
          // '32': "你有一条新的美团取消订单",
          // 11: '你有一订单配送超时',
          // 12: '你有一订单无人接单'
          // }[item.type]

          // this.$notify({
          //   title: "提示",
          //   message: `${message} - ${item.oid}`,
          //   duration: item.type == '11' ? 10000 : 0,
          //   position: 'bottom-right',
          //   type: 'warning'
          // })

          if (item.type == '03') {
            const dish = JSON.parse(item.orderData)
            CreateOneFormPage(dish, item.type) ///自取
          } else if (item.type == '01' || item.type == '02') {
            //配送  新增or取消
            const dish = JSON.parse(item.orderData)
            if (dish.mergeFlag === '10') printSpellOrder(dish) //拼单
            if (dish.mergeFlag === '00') printOrder(dish, item.type)
          } else if (item.type == '04') {
            //冷藏柜自取
            const dish = JSON.parse(item.orderData)
            CreateOneFormPage(dish, item.type)
          } else if (item.type == '31' || item.type == '32') {
            // 美团新增or取消
            const dish = JSON.parse(item.orderData)
            printMeiTuanOrder(dish, item.type)
          } else if (item.type == '33' || item.type == '34') {
            // 饿了么新增or取消
            const dish = JSON.parse(item.orderData)
            printEleOrder(dish, item.type)
          }
          this.websocketsend(
            JSON.stringify({ oid: item.oid, type: item.type, time: date })
          )
        }
      }
    },
    websocketsend(Data) {
      // 数据发送
      // debugger
      this.websock.send(Data)
    },
    cloaseSocket(socket) {
      socket.onmessage = undefined
      socket.onopen = undefined
      socket.onerror = undefined
      socket.onclose = undefined
      socket.close()
    },
    websocketclose(e) {
      // 关闭
      console.log('断开连接', e)
      // clearTimeout(this.timer)
      this.box = true
      this.msg = '当前网络已断开，请店长及时处理！！！！'   
      // sessionStorage.setItem("offLine", true);
      this.setOnLine(false)

      
      this.cloaseSocket(this.websock)
    

      this.timer = setInterval(() => {
        if (!this.isLogout) {
          this.initWebSocket()
        }
      }, 3000)

      // this.timer = setTimeout(() => {
      //   if (!this.isLogout) {
      //     this.initWebSocket()
      //   }
      // }, 30000)
    },
    closeBox() {
      this.box = false
      this.websocketsend(this.reqData)
    },
    internetStatus() {
      window.addEventListener('offline', () => {
        this.box = true
        this.msg = '当前网络已断开，请店长及时处理！！！！'
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../styles/common.less';

.app {
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  height: calc(100vh - 50px);
}

.app-breadcrumb {
  margin-top: 1px;
  background-color: #fff;
  height: 45px;
  box-sizing: border-box;
}

.app-main-wrap {
  width: calc(100% - @side-width);
}

.app-main-container {
  min-height: 100vh;
  padding: 10px 10px 0;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
