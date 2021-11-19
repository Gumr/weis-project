<template>
  <div class="page-container">
    <div style="margin: 20px 0;">
      注册时间：
      <el-date-picker
        v-model="tableQuery.date"
        clearable
        type="daterange"
        style="width: 200px;margin-right: 20px;"
      />渠道：
      <SelectTree
        v-model="tableQuery.tcqDesc"
        :options="tcqDescOptions"
        :default-props="defaultProps"
        clearable
        style="width: 150px;margin-right: 20px;"
        @nodeClick="nodeClick"
      />来源：
      <BaseSelect
        v-model="tableQuery.appType"
        :options="appTypeOptions"
        filterable
        clearable
        style="width: 150px;margin-right: 20px;"
      />用户手机：
      <el-input
        v-model="tableQuery.phone"
        class="txt"
        clearable
        style="width: 150px;margin-right: 20px;"
      />是否折扣：
      <BaseSelect
        v-model="tableQuery.isDiscount"
        :options="isDiscountOptions"
        filterable
        clearable
        style="width: 150px;margin-right: 20px;"
      />
      <el-button type="primary" @click="searckClick">搜索</el-button>
      <el-button
        type="primary"
        :loading="$store.state.bloading"
        @click="handleExport"
      >
        {{ $store.state.bloading ? '导出中' : '导出' }}
      </el-button>
    </div>
    <BasePageTable
      ref="table"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      border
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column v-for="col in table.col" :key="col.prop" v-bind="col" />
      <el-table-column label="操作" width="250px" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="goDetail(row.uid)">明细</el-button>
          <el-button size="small" @click="memberDiscountClick(row)">设置折扣</el-button>
          <el-button size="small" type="primary" @click="refundClick(row)">退余额</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="rechargeVisible"
      title="会员余额充值"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="handleRechargeConfirm"
    >
      <div class="section-item">
        <span class="section-label label-1">会员名：</span>
        <span>{{ uname }}</span>
      </div>
      <div v-for="(item, index) in member" :key="index" class="section-item">
        <span class="section-label label-1">{{ item.portStr + '\xa0' }}</span>
        <span class="section-label">折扣：</span>
        <el-input v-model="item.discount" clearable class="medium-input" @blur="chekText(index)" />
        <span class="section-label">折扣时间：</span>
        <DatePicker v-model="item.date" class="medium-input" type="daterange" />
      </div>
      <div class="section-item">
        <span class="section-label label-1" />
        <span class="section-label">折扣是对订单总金额（不包含配送费）的优惠</span>
      </div>
      <div class="section-item">
        <span class="section-label label-1" />
        <span class="section-label">输入数字7，即是7折，折扣输入范围为0＜值≤10</span>
      </div>
    </ConfirmDialog>
    <ConfirmDialog v-model="refundDialog" title="退余额" center async-confirm @on-confirm="handleRefundConfirm">
      <el-form label-width="120px">
        <el-form-item label="剩余余额">
          {{ wallet.$total }}
        </el-form-item>
        <el-form-item label="输入退款本金">
          <NumberInput v-model="wallet.recharge" mode="digit" :precision="2" :max="wallet.$recharge" />
        </el-form-item>
        <el-form-item label="输入退款赠送金">
          <NumberInput v-model="wallet.donation" mode="digit" :precision="2" :max="wallet.$donation" />
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import SelectTree from '@/components/SelectTree.vue'
import format from '@/utils/format'
import { transformDaterange } from '@/utils/transform'
import { catchNonNumberKeydown } from '@/utils/event-catcher'
import exportExcel from '@/utils/export-excel'
import { round } from '@/utils/common'
export default {
  name: 'finance_member-management_member-list',
  components: {
    BasePageTable,
    ConfirmDialog,
    SelectTree
  },
  data() {
    return {
      height: window.innerHeight - 280,
      printDate: '',
      pickerOptions: {
        disabledDate: d => d < (new Date() - (24 * 60 * 60000))
      },
      rechargeModel: {
        recharge: 0,
        donation: 0,
        remarks: ''
      },
      discount: {
        date: [],
        discount: 0
      },
      uid: '',
      uname: '',
      member: [],
      rechargeVisible: false,
      confirmRechargeVisible: false,
      tableQuery: {
        phone: ''
      },
      tcqDescOptions: [],
      defaultProps: {
        children: 'kvos',
        label: 'label'
      },
      appTypeOptions: [
      ],
      isDiscountOptions: [
        { label: '有折扣', value: '1' },
        { label: '无折扣', value: '2' }
      ],
      refundDialog: false, // 退款弹窗
      page: {
        pageNo: 1,
        pageSize: 10
      },
      wallet: {
        donation: 0, // 赠送金
        recharge: 0 // 本金
      },
      table: {
        total: 0,
        data: [],
        col: [{
          type: 'index',
          label: '序号'
        }, {
          label: '会员ID',
          prop: 'uid'
        },  {
          label: '会员名称',
          prop: 'uname'
        }, {
          label: '性别',
          prop: 'sex',
          formatter: row => row.sex ? row.sex :　'无'
        }, {
          label: '年龄',
          prop: 'age',
          formatter: row => row.age ? row.age :　'无'
        }, {
          label: '身高',
          prop: 'stature',
          formatter: row => row.stature ? row.stature + 'cm' :　'无'
        }, {
          label: '体重',
          prop: 'weight',
          formatter: row => row.weight ? row.weight + 'kg' :　'无'
        },{
          label: '手机',
          prop: 'phone'
        },{
          label: '注册时间',
          prop: 'ctime',
          formatter: row => format.date(row.ctime)
        }, {
          label: '用户来源',
          prop: 'tcqDesc'
        },  {
          label: '来源端口',
          prop: 'appidDesc'
        },  {
          label: '会员类型',
          prop: 'membertype'
        },
        {
          label: '注册渠道',
          prop: 'registerChannelName'
        },
        {
          label: '注册渠道手机',
          prop: 'registerChannelPhone'
        },
        {
          label: '注册时客户经理/营养师',
          prop: 'inviterName'
        },
        {
          label: '手机',
          prop: 'inviterPhone'
        },
        {
          label: '当前绑定客户经理',
          prop: 'counselorName',
          formatter: row => row.counselorName || '无'
        }, {
          label: '当前绑定客户经理手机',
          prop: 'counselorPhone',
          formatter: row => row.counselorPhone || '无'
        },
        {
          label: '当前绑定营养师',
          prop: 'dieticianName',
          formatter: row => row.dieticianName || '无'
        },
        {
          label: '当前绑定营养师手机',
          prop: 'dieticianPhone',
          formatter: row => row.dieticianPhone || '无'
        },{
          label: '账户当前资产',
          prop: 'gold',
          formatter: row => `￥${row.gold}`
        }, {
          label: '本金',
          prop: 'tacResidualRecharge',
          formatter: row => `￥${row.tacResidualRecharge}`
        }, {
          label: '赠送金',
          prop: 'tacResidualDonation',
          formatter: row => `￥${row.tacResidualDonation}`
        }, {
          label: '会员折扣',
          prop: 'isDiscount'
        }]
      }
    }
  },
  created() {
    this.getAppAll()
    this.getActivity()
    this.getTableData()
  },
  methods: {
    async handleRefundConfirm(done) {
      this.$request('Member/deductUserAmount', {
        uid: this.uid,
        deductRecharge: this.wallet.recharge,
        deductDonation: this.wallet.donation
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('操作成功')
          this.getTableData()
          this.refundDialog = false
        } else {
          this.$message.error(err.errMsg)
        }
      }).finally(done)
    },
    refundClick(row) {
      this.uid = row.uid
      this.getUserAmount(row.uid)
        .thenwrap((err, data) => {
          if (!err) {
            this.refundDialog = true
            data = Object.assign({
              donation: 0,
              recharge: 0
            }, data)
            this.wallet = {
              ...data,
              $donation: data.donation,
              $recharge: data.recharge,
              $total: data.donation + data.recharge
            }
          }
        })
    },
    getUserAmount(uid) {
      return this.$request('Member/getUserAmount', {
        uid
      })
    },
    async getAppAll() {
      const res = await this.$http('Dictionaries/getAppidAll', {})
      this.appTypeOptions = res.obj
    },
    nodeClick(data) {
      this.tableQuery.tcqDesc = data.value
    },
    catchNonNumberKeydown,
    handleDiscountInput(val) {
      let dis = val.match(/^(10|[0-9])(\.\d?)?/)

      dis = (dis && dis[0]) || ''
      dis = dis > 10 ? 10 : dis

      this.discount.discount = dis
    },
    async memberDiscountClick(member) {
      this.uid = member.uid
      this.uname = member.uname
      const res = await this.$http('Member/getMenberDiscountInfo', { uid: this.uid })
      this.member = res.obj.memberDiscount.map(item => {
        return {
          port: item.port,
          portStr: item.portStr,
          date: [item.staTime || '' , item.endTime || ''],
          discount: item.discount || ''
        }
      })
      this.rechargeVisible = true
    },
    chekText(index) {
      if (this.member[index].discount == '') return
      this.member[index].discount = isNaN(this.member[index].discount) ? '' : Math.abs(this.member[index].discount).toFixed(2)
      this.member[index].discount = this.member[index].discount > 10 ? '10.00' : (this.member[index].discount <= 0 ? '' : this.member[index].discount)
    },
    async handleRechargeConfirm(done) {
      const member = this.member.map(item => {
        return {
          ...item,
          staTime: item.date ? (item.date[0] ? this.$day(item.date[0]).format('YYYYMMDD') : '') : '',
          endTime: item.date ? (item.date[1] ? this.$day(item.date[1]).format('YYYYMMDD') : '') : ''
        }
      })
      for (const item of member) {
        if ((item.discount && !item.staTime) || (!item.discount && item.staTime)) {
          this.$msg('请输入正确的折扣信息', 'error')
          done()
          return
        }
      }
      const params = {
        uid: this.uid,
        memberDiscount: member
      }
      const res = await this.$http('Member/addMemberDiscount', params)
      if (res.errMsg) {
        this.$msg(res.errMsg, 'error')
        done()
      } else {
        this.$msg('添加成功', 'success')
        this.getTableData()
        this.rechargeVisible = false
        this.$nt(() => {
          setTimeout(done(), 800)
        })
      }
    },
    updateMemberDiscount() {
      const [staTime,
        endTime] = transformDaterange(this.discount.date)

      return this.$request('Member/addMemberDiscount', {
        uid: this.member.uid,
        discount: round(this.discount.discount / 10, 2),
        staTime: staTime.format('YYYYMMDD'),
        endTime: endTime.format('YYYYMMDD')
      })
    },
    rechargeClick(row) {
      this.member = row
      this.rechargeVisible = true
      this.rechargeModel = {
        recharge: 0,
        donation: 0,
        remarks: ''
      }
    },
    searckClick() {
      this.page.pageNo = 1
      const params = this.genQueryParams()
      this.printDate = params.startDate ? `(${params.startDate}至${params.endDate})` : ''
      this.getTableData()
    },
    goDetail(id) {
      this.$pushRoute('detail', {
        query: {
          id
        }
      })
    },
    async getActivity() {
      const res = await this.$http('Member/queryChannel', {})
      this.tcqDescOptions = res.obj
    },
    getTableData() {
      this.$store.state.vloading = true
      this.$request('Member/getMembersForFinancing', {
        ...this.page,
        ...this.genQueryParams()
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$store.state.vloading = false
          data = data.obj
          this.table.total = data.totalRecordCount
          this.table.data = data.record.map(item => ({
            ...item,
            tmdDiscount: round(item.tmdDiscount * 10, 1)
          }))
          this.$nt(() => {
            this.$refs.table.doLayout()
          })
        }
      })
    },
    genQueryParams() {
      const params = { ...this.tableQuery }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate.format('YYYY-MM-DD')
        params.endDate = endDate.format('YYYY-MM-DD')
      }
      delete params.date
      return params
    },
    handleExport() {
      this.$store.state.bloading = true
      const filename = `${this.$route.meta.title}-导出${this.printDate}`
      this.reqAllUserData().then(
        this.$rw((err, data) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: this.table.col,
            filename,
            data: data.record
          })
        })
      )
    },
    reqAllUserData() {
      return this.$request('Member/getMembers', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.table.total
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../../styles/base.less";

.query-component {
  margin: 12px 0;
}

.recharge-label {
  display: inline-block;
  text-align: right;
  width: 88px;
  padding-right: 12px;
}

.recharge-confirm-label {
  margin-right: 12px;
}

.recharge-item {
  margin-bottom: 8px;
}

.recharge-phone {
  color: @warning-color;
  font-weight: bold;
}

.recharge-money {
  color: @danger-color;
  font-weight: bold;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-input {
  width: 240px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}
</style>
