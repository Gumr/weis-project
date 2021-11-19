<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="tableQuery"
        :query-list="tableQueryComps"
        :span="6"
        :label-width="60"
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
      <el-button
        type="primary"
        :loading="$store.state.bloading"
        @click="handleExport"
      >
        {{ $store.state.bloading ? '导出中' : '导出' }}
      </el-button>
      <el-button type="warning" @click="batchAllotClick">批量分配</el-button>
    </div>
    <BasePageTable
      ref="table"
      v-model:current-page="table.page.pageNo"
      v-model:page-size="table.page.pageSize"
      v-model:selection="table.selection"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column v-for="(col, index) in table.col" v-bind="col" :key="index"></el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="singleAllotClick(row)">分配</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="allotDialogVisible"
      title="选择分配的渠道经理/直销客户经理"
      :auto-confirm="false"
      :close-on-click-modal="false"
      center
      @on-confirm="handleAllotConfirm"
    >
      <div v-show="this.allotMember.length > 0" class="selection-count">
        选中了
        <span class="red-text">{{ this.allotMember.length }}</span>
        会员
      </div>
      <div class="allot-section display-flex">
        <span class="allot-label" style="line-height: 40px;">客户经理手机:</span>
        <el-input v-model="broker.counselorPhone" @input="handleBrokerPhoneInput"></el-input>
      </div>
      <div class="allot-section">
        <span class="allot-label">客户经理名称:</span>
        <span>{{ broker.counselorName }}</span>
      </div>
      <div class="allot-section">
        <span class="allot-label">角色类型:</span>
        <span>{{ broker.roleDesc }}</span>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import exportExcel from '@/utils/export-excel'

export default {
  name: 'sales_customer-pool',
  components: {
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      allotDialogVisible: false,
      broker: {
        counselorPhone: '',
        counselorName: '',
        roleDesc: ''
      },
      tableQuery: {
        phone: '',
        date: [],
        tcqDesc: '',
        orderNum: ''
      },
      allotMember: [],
      table: {
        data: [],
        selection: [],
        col: [
          {
            type: 'selection'
          },
          {
            type: 'index',
            label: '序号'
          },
          {
            prop: 'uid',
            label: '会员ID'
          },
          {
            prop: 'uname',
            label: '会员名称'
          },
          {
            prop: 'phone',
            label: '手机'
          },
          {
            prop: 'tcqDesc',
            label: '来源'
          },
          {
            prop: 'regTime',
            label: '注册时间'
          },
          {
            prop: 'bingDesc',
            label: '是否绑定过客户经理'
          },
          {
            prop: 'auth',
            label: '会员类型'
          },
          {
            prop: 'orderNum',
            label: '点餐数'
          }
        ],
        total: 0,
        page: {
          pageNo: 1,
          pageSize: 10
        }
      },
      tableQueryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'BaseSelect',
          key: 'tcqDesc',
          label: '会员来源',
          placeholder: '请选择来源',
          props: {
            clearable: true,
            options: [{ label: '活动', value: '1' }, { label: '客户经理拓展', value: '2' }, { label: '自然流入', value: '3' }]
          }
        },
        {
          component: 'BaseSelect',
          key: 'orderNum',
          label: '订餐数',
          placeholder: '请选择',
          props: {
            clearable: true,
            options: [{ label: '大于1（包含1）', value: '1' }, { label: '等于0', value: '0' }]
          }
        },
        {
          component: 'el-input',
          placeholder: '用户手机号',
          label: '手机号',
          key: 'phone',
          props: {
            clearable: true
          }
        }
      ]
    }
  },
  watch: {
    allotDialogVisible(visible) {
      if (!visible) {
        this.broker = {
          counselorPhone: '',
          counselorName: '',
          roleDesc: ''
        }
      }
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    searchClick() {
      this.table.page.pageNo = 1
      this.getTableData()
    },
    getTableData() {
      this.$store.state.vloading = true
      return this.$request('Channel/queryUserNotBind', {
        ...this.genQueryParams(),
        ...this.table.page
      }).then(this.$rw((err, data) => {
        this.$store.state.vloading = false
        if (!err) {
          this.table.data = data.dataPage.record
          this.table.total = data.dataPage.totalRecordCount
          this.$nt(() => {
            this.$refs.table.doLayout()
          })
        }
      }))
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
    handleBrokerPhoneInput(phone) {
      if (phone.length === 11 && !this.querying) {
        this.queryBrokerByPhone()
      }
    },
    queryBrokerByPhone() {
      return this.$request('Channel/queryAgentDetailByPhone', {
        counselorPhone: this.broker.counselorPhone,
        marketType: '01'
      }).then(this.$rw((err, data) => {
        if (err) {
          this.$errorNotify(err)
          this.broker.counselorName = ''

          delete this.broker.counselorId
          return
        }

        this.broker = data.agentDetailVo
      }))
    },
    handleAllotConfirm() {
      if (!this.broker.counselorId) {
        this.$message({
          type: 'error',
          message: '请选择一位客户经理'
        })

        return
      }

      this.allotCustomer()
    },
    singleAllotClick(data) {
      this.allotMember = [data]
      this.allotDialogVisible = true
    },
    batchAllotClick() {
      if (this.table.selection < 1) {
        this.$message({
          type: 'error',
          message: '请至少选择一个会员'
        })

        return
      }
      this.allotMember = this.table.selection
      this.allotDialogVisible = true
    },
    allotCustomer() {
      this.$request('Channel/bindUserToAgent', {
        uids: this.allotMember.map(({ uid }) => uid),
        counselorPhone: this.broker.counselorPhone,
        counselorId: this.broker.counselorId
      }).then(this.$rw((err) => {
        this.$errorNotify(err)

        if (!err) {
          this.getTableData()
          this.allotDialogVisible = false
        }
      }))
    },
    handleExport() {
      this.$store.state.bloading = true
      const filename = `${this.$route.meta.title}-导出`
      this.reqAllUserData().then(
        this.$rw((err, { dataPage }) => {
          this.$store.state.bloading = false
          const columns = this.$deepClone(this.table.col)
          columns.shift()
          exportExcel({
            columns,
            filename,
            data: dataPage.record
          })
        })
      )
    },
    reqAllUserData() {
      return this.$request('Channel/queryUserNotBind', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.table.total
      })
    }
  }
}
</script>

<style lang="less">
@import "../../../../styles/base.less";
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.allot-label {
  display: inline-block;
  vertical-align: middle;
  width: 120px;
}

.allot-section {
  margin: 12px 0;
}

.selection-count {
  font-size: 24px;
  text-align: center;
}

.red-text {
  color: @danger-color;
}

.action-bar {
  text-align: right;
  margin-bottom: 16px;
}
</style>
