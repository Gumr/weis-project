<template>
  <div class="page-container">
    <div style="margin: 20px 0;">
      注册时间：
      <el-date-picker
        v-model="tableQuery.date"
        clearable
        type="daterange"
        style="width: 200px;margin-right: 20px;"
      ></el-date-picker>渠道：
      <SelectTree
        v-model="tableQuery.tcqDesc"
        :options="tcqDescOptions"
        :default-props="defaultProps"
        clearable
        search
        style="width: 200px;margin-right: 20px;"
        @nodeClick="nodeClick"
      ></SelectTree>来源：
      <BaseSelect
        v-model="tableQuery.appType"
        :options="appTypeOptions"
        filterable
        clearable
        style="width: 200px;margin-right: 20px;"
      ></BaseSelect>用户手机：
      <el-input
        v-model="tableQuery.phone"
        class="txt"
        clearable
        style="width: 200px;margin-right: 20px;"
      ></el-input>是否折扣：
      <BaseSelect
        v-model="tableQuery.isDiscount"
        :options="isDiscountOptions"
        filterable
        clearable
        style="width: 200px;margin-right: 20px;"
      ></BaseSelect>
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
      <el-table-column v-for="col in table.col" :key="col.prop" v-bind="col"></el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button type="primary" @click="goDetail(row.uid)">详情</el-button>
          <!-- <el-button @click="memberDiscountClick(row)">设置折扣</el-button> -->
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="rechargeVisible"
      title="会员余额充值"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="handleRechargeConfirm"
    >
      <div class="recharge-item">
        <span class="recharge-label">会员名</span>
        <span>{{ member.uname }}</span>
      </div>
      <el-form :model="discount" label-width="100px">
        <el-form-item label="有效期" porp="recharge">
          <el-date-picker
            v-model="discount.date"
            type="daterange"
            :picker-options="pickerOptions"
            @keydown="catchNonNumberKeydown"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="折扣" porp="donation">
          <div class="display-flex">
            <el-input
              v-model="discount.discount"
              @input="handleDiscountInput"
              @keydown.enter="handleRechargeConfirm"
              @keydown="catchNonNumberKeydown"
            ></el-input>
            <span>折</span>
          </div>

          <div style="line-height: 1.5;">折扣是对订单总金额（包含配送费）的优惠</div>
          <div style="line-height: 1.5;">输入数字7，即是7折，折扣输入范围为0＜值≤10</div>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import { round } from '@/utils/common'
import BasePageTable from '@/components/BasePageTable.vue'
import SelectTree from '@/components/SelectTree.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import format from '@/utils/format'
import { transformDaterange } from '@/utils/transform'
import { catchNonNumberKeydown } from '@/utils/event-catcher'
import exportExcel from '@/utils/export-excel'

export default {
  name: 'member_member-management_member-list',
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
      member: {},
      rechargeVisible: false,
      confirmRechargeVisible: false,
      tableQuery: {
        date: [],
        phone: '',
        tcqDesc: '',
        appType: '',
        isDiscount: ''
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
      page: {
        pageNo: 1,
        pageSize: 10
      },
      table: {
        total: 0,
        data: [],
        col: [{
          type: 'index',
          label: '序号'
        }, {
          label: '用户ID',
          prop: 'uid'
        }, {
          label: '用户名称',
          prop: 'uname'
        }, {
          label: '性别',
          prop: 'sex',
          formatter: row => (row.sex ? row.sex :　'无')
        }, {
          label: '年龄',
          prop: 'age',
          formatter: row => (row.age ? row.age :　'无')
        }, {
          label: '身高',
          prop: 'stature',
          formatter: row => (row.stature ? `${row.stature}cm` :　'无')
        }, {
          label: '体重',
          prop: 'weight',
          formatter: row => (row.weight ? `${row.weight}kg` :　'无')
        }, {
          label: '手机号',
          prop: 'phone'
        }, {
          label: '当前目标',
          prop: 'planType'
        }, {
          label: '注册时的目标',
          prop: 'registerPlanType'
        }, {
          label: '注册时间',
          prop: 'ctime',
          formatter: row => format.date(row.ctime)
        }, {
          label: '用户来源',
          prop: 'tcqDesc'
        }, {
          label: '来源端口',
          prop: 'appidDesc'
        }, {
          label: '用户类型',
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
        },
        {
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
          label: '当前点餐数',
          prop: 'orderNum'
        }, {
          label: '用户折扣',
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
    memberDiscountClick(member) {
      this.member = member
      this.rechargeVisible = true
      this.discount = {
        date: [+this.$day(member.tmdStatime), +this.$day(member.tmdEndtime)],
        discount: member.tmdDiscount || 0
      }
    },
    handleRechargeConfirm() {
      const { discount } = this
      if (!discount.date.length) {
        this.$message({
          type: 'error',
          message: '请输入折扣有效期'
        })
        return
      }
      // eslint-disable-next-line
      if (discount.discount == 0 || !discount.discount) {
        this.$message({
          type: 'error',
          message: '请输入有效折扣'
        })
        return
      }

      this.updateMemberDiscount().then(({ data }) => {
        if (data.errCode === 0) {
          this.$message({
            type: 'success',
            message: '更新用户折扣成功'
          })
        }

        this.rechargeVisible = false
        this.getTableData()
      })
    },
    updateMemberDiscount() {
      const [staTime, endTime] = transformDaterange(this.discount.date)

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
      this.$request('Member/getMembers', {
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
</style>
