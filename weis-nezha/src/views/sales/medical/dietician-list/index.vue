<template>
  <div class="page-container">
    <div style="margin: 20px 0;display: flex;">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :label-width="110"
        :span="6"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
      <el-button type="danger" @click="addBrokerClick">添加营养师</el-button>
    </div>
    <BasePageTable
      ref="table"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="tableData"
      :total="tableDataTotal"
      border
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column v-for="(col, index) in tableCol" v-bind="col" :key="index"></el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button type="success" size="small" @click="loseClick(row)">转移</el-button>
          <el-button
            v-if="row.statusDesc == '正常'"
            type="warning"
            size="small"
            @click="updateState(row, '0')"
          >
            失效
          </el-button>
          <el-button
            v-if="row.statusDesc == '失效'"
            type="danger"
            size="small"
            @click="updateState(row, '1')"
          >
            启动
          </el-button>
          <el-button
            v-if="row.counselorType == '01'"
            type="primary"
            size="small"
            @click="outDetailClick(row)"
          >
            详情
          </el-button>
          <el-button
            v-if="row.counselorType == '02'"
            type="primary"
            size="small"
            @click="detailClick(row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="createDialogVisible"
      title="添加营养师"
      :auto-confirm="false"
      center
      @on-confirm="handleCreateConfirm"
    >
      <el-form ref="broderForm" :model="counselor" :rules="counselorRules" label-width="140px">
        <el-form-item label="绑定营养师主管" prop="ownCounselorId">
          <el-select v-model="counselor.ownCounselorId">
            <el-option
              v-for="item in chargeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机" prop="counselorPhone">
          <el-input v-model="counselor.counselorPhone" @blur="broderPhoneBlur"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <span>{{ counselor.nickname }}</span>
        </el-form-item>
        <el-form-item label="名称" prop="counselorName">
          <el-input v-model="counselor.counselorName" :disabled="consleorNameDisabled"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import QueryComponents from '@/components/QueryComponents.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { validArray } from '@/utils/common'
import { transformDaterange } from '@/utils/transform'
import exportExcel from '@/utils/export-excel'

export default {
  // name: 'medical_dietician-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      consleorNameDisabled: false,
      chargeOptions: [],
      counselor: {
        ownCounselorId: '',
        nickname: '',
        counselorId: '',
        counselorName: '',
        counselorPhone: '',
        channel: '02',
        marketType: '03'
      }, // 当前操作的客户经理
      counselorRules: {
        ownCounselorId: [{
          trigger: 'change',
          message: '请选择营养师主管',
          required: true
        }],
        counselorPhone: [{
          pattern: /\d{11}/,
          type: 'string',
          trigger: 'blur',
          message: '请输入规范的手机号',
          required: true
        }],
        counselorName: [{
          type: 'string',
          trigger: 'blur',
          message: '请输入姓名',
          required: true
        }]
      },
      createDialogVisible: false, // 审核备注确认框
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableCol: [{
        type: 'index',
        label: '序号'
      }, {
        label: '营养师ID',
        prop: 'counselorId'
      }, {
        label: '营养师名称',
        prop: 'counselorName'
      }, {
        label: '手机',
        prop: 'counselorPhone'
      }, {
        label: '营养师类型',
        prop: 'counselorType',
        formatter: row => (row.counselorType == '02' ? '自有' : '外部')
      }, {
        label: '直级会员人数',
        prop: 'memberNum'
      }, {
        label: '兼职营养师人数',
        prop: 'counselorNum'
      }, {
        label: '所属营养师主管名称',
        prop: 'inviterName',
        formatter: row => row.ownManagerName || '无'
      }, {
        label: '所属营养师主管手机号',
        prop: 'inviterPhone',
        formatter: row => (row.ownManagerPhone || '无')
      }, {
        label: '当前状态',
        prop: 'statusDesc'
      },
      {
        label: '最后编辑时间',
        prop: 'lastModifyTime'
      }],
      queryParams: {
        date: [],
        channel: '02',
        phone: '',
        status: '',
        marketType: '03'
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '编辑时间',
          props: {
            clearable: true,
            type: 'daterange'
          }
        },
        {
          component: 'BaseSelect',
          key: 'parentId',
          label: '所属营养师主管',
          props: {
            clearable: true,
            options: []
          }
        },
        // {
        //   component: 'BaseSelect',
        //   key: 'channel',
        //   label: '营养师类型',
        //   props: {
        //     clearable: true,
        //     options: [{label: '全部', value: ''}, { label: '自有', value: '02'}, { label: '外部', value: '01'}]
        //   }
        // },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '状态',
          props: {
            options: [{ label: '全部', value: '' }, { label: '正常', value: '03' }, { label: '失效', value: '04' }]
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入营养师手机号',
          props: {
            clearable: true
          }
        }
      ]
    }
  },
  computed: {
    tableRequestParams() {
      const params = {
        ...this.page,
        ...this.queryParams
      }

      if (validArray(params.date)) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = +startDate
        params.endDate = +endDate
      }

      if (!params.channel) {
        delete params.channel
      }

      delete params.date

      return params
    }
  },
  created() {
    this.getCharge('created')
    this.getTableData()
  },
  methods: {
    getCharge(type) {
      const status = type === 'add' ? '03' : ''
      const params = { marketType: '03', status }
      this.$request('Channel/queryOwnCounselor', params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            const result = dataPage.map(item => ({
              label: item.counselorName,
              value: item.counselorId,
              phone: item.counselorPhone
            }))
            if (type === 'created') {
              this.queryComps[1].props.options = result
            } else {
              this.chargeOptions = result
            }
          }
        })
      )
    },
    async broderPhoneBlur() {
      const phone = this.counselor.counselorPhone
      if (phone.length === 11) {
        const user = await this.getUserByPhone()

        this.counselor.nickname = user.uname
        this.counselor.counselorId = user.uid
      } else {
        this.counselor.counselorName = ''
      }
    },
    getUserByPhone(phone = this.counselor.counselorPhone) {
      return this.$request('Customer/queryCustomerByPhone', {
        phone
      }).then(({ data }) => (data.errCode === 0 ? data.obj : Promise.reject()))
    },
    searchClick() {
      this.page.pageNo = 1
      this.getTableData()
    },
    addBrokerClick() {
      this.counselor = {
        nickname: '',
        counselorId: '',
        counselorName: '',
        counselorPhone: '',
        channel: '02',
        marketType: '03',
        ownCounselorId: ''
      }
      this.getCharge('add')
      this.createDialogVisible = true
      this.$nt(() => {
        this.$refs.broderForm.resetFields()
      })
    },
    getTableData() {
      this.$store.state.vloading = true
      this.$request('Channel/queryAgentList', this.tableRequestParams).then(
        this.$rw((err, result) => {
          this.$store.state.vloading = false
          if (!err) {
            result = result.dataPage
            this.tableDataTotal = result.totalRecordCount
            this.tableData = result.record
            this.$nt(() => {
              this.$refs.table.doLayout()
            })
          }
        })
      )
    },
    loseClick(row) {
      this.$pushRoute('lose', {
        query: {
          id: row.id,
          counselorId: row.counselorId,
          name: row.counselorName,
          counselorType: row.counselorType
        }
      })
    },
    outDetailClick(row) {
      this.$pushRoute('outDetail', {
        query: {
          id: row.id,
          counselorId: row.counselorId
        }
      })
    },
    detailClick(row) {
      this.$pushRoute('detail', {
        query: {
          id: row.id,
          counselorId: row.counselorId
        }
      })
    },
    handleCreateConfirm() {
      this.$refs.broderForm.validate((valid) => {
        if (valid) {
          this.addBroker().then(({ data }) => {
            if (data.errCode === 0) {
              this.$message({
                message: '添加客户经理成功',
                type: 'success'
              })
              this.page.pageNo = 1
              this.getTableData()
              this.createDialogVisible = false
            } else {
              this.$message({
                type: 'error',
                message: data.errMsg
              })
            }
          })
        }
      })
    },
    addBroker() {
      return this.$request('Channel/addAgent', this.counselor)
    },
    rejectReviewClick(row) {
      this.counselor = { ...row }
      this.rejectMessage = ''
      this.id = ''
      this.createDialogVisible = true
    },
    updateState(row, type) {
      this.$request('Channel/updateAgentState', {
        counselorId: row.counselorId,
        id: row.id,
        marketType: '03',
        type
      }).then(this.$rw((err) => {
        if (!err) {
          this.$message({ type: 'success', message: '操作成功！' })
          this.getTableData()
        } else {
          this.$message({ type: 'error', message: err.errMsg })
        }
      }))
    },
    handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: this.tableCol,
            filename,
            data: res.dataPage.record
          })
        })
      )
    },
    reqAllUserData() {
      return this.$request('Channel/queryAgentList', {
        ...this.tableRequestParams,
        pageNo: 1,
        pageSize: this.tableDataTotal
      })
    }
  }
}

</script>
