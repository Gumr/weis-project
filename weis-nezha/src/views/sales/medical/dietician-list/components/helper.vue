<template>
  <div class style="padding: 20px 0">
    <div style="width: 100%;">
      <el-button style="float:right;margin-bottom: 20px;" type="primary" @click="addHepler">添加助手</el-button>
      <el-button style="float:right;margin:0 10px 20px 0;" type="primary" @click="transfer">转移助手</el-button>
    </div>
    <div>
      <BasePageTable
        v-model:selection="tableSelection"
        :data="tableData"
        :visible="false"
        :height="height"
        border
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span v-if="row.tcrState == '01'" class="span" @click="relation(row)">关联渠道</span>
            <span v-if="row.tcrState == '01'" class="span" @click="unBinding(row)">解绑</span>
            <span v-if="row.tcrState == '01'" class="span" @click="transferSingle(row)">转移</span>
            <span v-else class="span">已解绑</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="助手"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-form label-width="130px">
        <el-form-item label="助手电话">
          <el-input
            v-model="current.phone"
            class="small-input"
            maxlength="11"
            style="width: 350px;"
            @blur="broderPhoneBlur"
          ></el-input>
        </el-form-item>
        <el-form-item label="助手名称">{{ current.uname }}</el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="box"
      title="关联渠道"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="boxConfirm"
    >
      <el-form label-width="130px">
        <el-form-item label="关联渠道">
          <BaseSelect v-model="qrCode" clearable :options="options"></BaseSelect>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="box2"
      title="选择客户经理"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="boxConfirm2"
    >
      <div style="margin: 0 0 20px 22px">确定将这{{ tableSelection.length }}个助手及服务用户转移给下方客户经理</div>
      <el-form label-width="130px">
        <el-form-item label="请选择客户经理">
          <BaseSelect v-model="targetId" clearable :options="options2"></BaseSelect>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="box3"
      title="转移"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      :comfirm-visible="false"
    >
      <el-button
        style="float:right;margin:0 10px 20px 0;"
        type="primary"
        @click="transferAllHeplper"
      >
        全部转移
      </el-button>
      <BasePageTable :data="boxTable" :visible="false" height="500" border>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="uname" label="客户昵称"></el-table-column>
        <el-table-column prop="phone" label="手机"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="span" @click="unBindHepler(row)">删除</span>
            <span class="span" @click="transferHelper(row)">转移</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="box4"
      title="选择助手"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="boxConfirm4"
    >
      <div style="margin: 0 0 20px 22px">{{ msg }}</div>
      <el-form label-width="130px">
        <el-form-item label="选择助手">
          <BaseSelect v-model="targetId" clearable :options="options3"></BaseSelect>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    BaseSelect
  },
  data() {
    return {
      height: window.innerHeight - 350,
      id: '',
      hasDialog: false,
      box: false,
      box2: false,
      box3: false,
      box4: false,
      msg: '',
      uid: [],
      oldId: '',
      options: [],
      options2: [],
      options3: [],
      helperId: '',
      boxTable: [],
      qrCode: '',
      targetId: '',
      tableSelection: [],
      tableData: [],
      tableCol: [
        {
          label: '序号',
          type: 'selection',
          width: 50
        },
        {
          label: '序号',
          type: 'index',
          width: 50
        },
        {
          label: '助手ID',
          prop: 'helperId'
        },
        {
          label: '助手名称',
          prop: 'helperName'
        },
        {
          label: '电话号码',
          prop: 'helperPhone'
        },
        {
          label: '全职客户经理',
          prop: 'counselorName'
        },
        {
          label: '全职客户经理电话',
          prop: 'counselorPhone'
        },
        {
          label: '关联的渠道码名称',
          prop: 'qrcodeName'
        },
        {
          label: '渠道码',
          prop: 'qrcode'
        },
        {
          label: '渠道名称',
          prop: 'channelName'
        },
        {
          label: '渠道手机',
          prop: 'channelPhone'
        }
      ],
      queryParams: {
        counselorId: '',
        marketType: '03'
      },
      current: {
        phone: '',
        uname: '',
        uid: ''
      }
    }
  },
  created() {
    this.id = this.$route.query && this.$route.query.id
    this.queryParams.counselorId = this.$route.query && this.$route.query.counselorId
    this.getList()
  },
  methods: {
    addHepler() {
      this.current = {
        phone: '',
        uname: '',
        uid: ''
      }
      this.hasDialog = true
    },
    async broderPhoneBlur() {
      if (this.current.phone.length === 11) {
        const res = await this.$http('Customer/queryCustomerByPhone', { phone: this.current.phone })
        Object.assign(this.current, res.obj)
      } else {
        this.current = {
          phone: '',
          uname: '',
          uid: ''
        }
      }
    },
    async getList() {
      const res = await this.$http('Channel/queryHelperList', { ...this.queryParams })
      this.tableData = res.obj
    },
    async onconfirm(done) {
      if (!this.current.uid) {
        this.$msg('请输入正确的助手手机', 'error')
        done()
        return
      }
      const res = await this.$http('Channel/bandingHelper', { id: this.id, marketType: '03', uid: this.current.uid })
      if (!res.errMsg) {
        this.$msg('绑定成功', 'success')
        this.hasDialog = false
        this.current.phone = {
          phone: '',
          uname: '',
          uid: ''
        }
        this.getList()
        this.$nt(() => {
          setTimeout(done, 500)
        })
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    },
    async unBinding(row) {
      this.$confirm('确认解绑？', '确认解绑？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('Channel/unbandingHelper', { id: this.id, helperId: row.helperId })
        if (!res.errMsg) {
          this.$msg('解绑成功', 'success')
          this.getList()
        } else {
          this.$msg(res.errMsg, 'error')
        }
      })
    },
    async relation(row) {
      const res = await this.$http('Channel/queryQrcodeByTcaId', { tcaId: this.id })
      this.options = res.obj.map(val => ({ label: `${val.qrcodeName} ${val.qrcode}`, value: val.qrcode }))
      this.box = true
      this.qrCode = ''
      this.helperId = row.helperId
    },
    async boxConfirm(done) {
      const res = await this.$http('Channel/bangdingHelperQrcode', { helperId: this.helperId, qrCode: this.qrCode })
      if (!res.errMsg) {
        this.$msg('关联成功', 'success')
        this.getList()
        this.box = false
        setTimeout(() => {
          done()
        }, 500)
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async transfer() {
      if (!this.tableSelection.length) {
        this.$msg('请选择要转移的助手', 'error')
        return
      }
      this.targetId = ''
      const res = await this.$http('Channel/queryOwnCounselor', { marketType: '03', status: '03', channel: '01,02' })
      this.options2 = res.obj.map(val => ({ label: `${val.counselorName} - ${val.counselorPhone}`, value: val.id }))
      this.box2 = true
    },
    async boxConfirm2(done) {
      if (!this.targetId) {
        this.$msg('请选择客户经理', 'error')
        done()
        return
      }
      const helperIds = this.tableSelection.map(val => val.helperId)
      const res = await this.$http('Channel/helperTransfer', { helperIds, id: this.id, targetId: this.targetId })
      if (!res.errMsg) {
        this.$msg('转移成功', 'success')
        this.box2 = false
        this.getList()
        setTimeout(done, 500)
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    },
    async transferSingle(row) {
      this.box3 = true
      const res = await this.$http('Channel/queryHelperCustomer', { id: row.id })
      this.boxTable = res.obj
      this.oldId = row.id
    },
    async transferAllHeplper() {
      this.box4 = true
      this.msg = `确定将这${this.boxTable.length}个用户转移给下方助手`
      this.uid = this.boxTable.map(val => val.uid)
      const res = await this.$http('Channel/queryHelperList', { counselorId: this.$route.query.counselorId, marketType: '03' })
      this.options3 = res.obj.map(val => ({ label: val.helperName, value: val.id }))
    },
    async unBindHepler(row) {
      this.$confirm('确认解绑？', '确认解绑？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('Channel/unbindHelper', { id: this.oldId, uid: row.uid })
        if (!res.errMsg) {
          this.$msg('解绑成功', 'success')
          this.getList()
          this.box3 = false
        } else {
          this.$msg(res.errMsg, 'error')
        }
      })
    },
    async transferHelper(row) {
      this.box4 = true
      this.msg = `确定将用户${row.uname}转移给下方助手`
      this.uid = [row.uid]
      const res = await this.$http('Channel/queryHelperList', { counselorId: this.$route.query.counselorId, marketType: '03' })
      this.options3 = res.obj.map(val => ({ label: val.helperName, value: val.id }))
    },
    async boxConfirm4(done) {
      const res = await this.$http('Channel/helperConsumerTransfer', { uid: this.uid, targetId: this.targetId, id: this.oldId })
      if (!res.errMsg) {
        this.$msg('转移成功', 'success')
        this.box4 = false
        this.box3 = false
        this.getList()
        setTimeout(done, 500)
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  flex-wrap: wrap;
  margin: 22px 0 22px 0;
}
.span {
  cursor: pointer;
  color: #409eff;
  margin: 0 5px;
  display: inline-block;
}
.medium-input {
  width: 240px;
  margin-right: 10px;
}
</style>
