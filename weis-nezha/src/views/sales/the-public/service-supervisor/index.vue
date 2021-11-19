<template>
  <div class="page-container">
    <div>
      <el-button type="danger" @click="addBrokerClick">添加服务主管</el-button>
    </div>
    <div style="margin: 20px 0;">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :label-width="120"
        :span="4"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
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
          <el-button type="primary" size="small" @click="detailClick(row)">详情</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="createDialogVisible"
      title="添加直销主管"
      :auto-confirm="false"
      center
      @on-confirm="handleCreateConfirm"
    >
      <el-form ref="broderForm" :model="counselor" :rules="counselorRules" label-width="80px">
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
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 330,
      consleorNameDisabled: false,
      counselor: {
        nickname: '',
        counselorId: '',
        counselorName: '',
        counselorPhone: '',
        channel: '03',
        marketType: '01'
      }, // 当前操作的客户经理
      counselorRules: {
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
        label: '服务主管名称',
        prop: 'counselorName'
      }, {
        label: '服务主管手机号',
        prop: 'counselorPhone'
      }, {
        label: '全职客户经理人数',
        prop: 'counselorNum'
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
        channel: '03',
        phone: '',
        status: '',
        marketType: '01'
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
          placeholder: '请输入服务主管手机号',
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
    this.getTableData()
  },
  methods: {
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
        channel: '03',
        marketType: '01'
      }

      this.createDialogVisible = true
      this.$nt(() => {
        this.$refs.broderForm.resetFields()
      })
    },
    getTableData() {
      this.$request('Channel/queryAgentList', this.tableRequestParams).then(
        this.$rw((err, result) => {
          if (!err) {
            result = result.dataPage
            this.tableDataTotal = result.totalRecordCount
            this.tableData = result.record
          }
        })
      )
    },
    loseClick(row) {
      this.$pushRoute('lose', {
        query: {
          id: row.id,
          counselorId: row.counselorId,
          name: row.counselorName
        }
      })
    },
    detailClick(row) {
      this.$pushRoute('detail', {
        query: {
          id: row.id
        }
      })
    },
    handleCreateConfirm() {
      this.$refs.broderForm.validate((valid) => {
        if (valid) {
          this.addBroker().then(({ data }) => {
            if (data.errCode === 0) {
              this.$message({
                message: '添加渠道主管成功',
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
        id: row.id,
        counselorId: row.counselorId,
        marketType: '01',
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
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      this.reqAllUserData().then(
        this.$rw((err, res) => {
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
<style scoped>
.page-container {
  padding-top: 20px;
}
</style>
