<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents v-model="queryParams" :query-list="queryComps" :label-width="90" :span="6">
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
      <el-button type="primary" @click="createManager">添加兼职客户经理</el-button>
    </div>
    <BasePageTable
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :data="tableData"
      :total="tableDataTotal"
      border
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column v-for="(col, index) in tableCol" v-bind="col" :key="index"></el-table-column>
      <el-table-column width="220" align="center" label="操作">
        <template #default="{ row }">
          <el-button type="success" size="small" @click="loseClick(row)">转移</el-button>
          <el-button
            v-if="row.status == '03'"
            type="warning"
            size="small"
            @click="updateState(row, '0')"
          >
            失效
          </el-button>
          <el-button
            v-if="row.status == '04'"
            type="danger"
            size="small"
            @click="updateState(row, '1')"
          >
            启动
          </el-button>
          <el-button size="small" @click="detailClick(row)">详情</el-button>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="box"
      title="添加兼职客户经理"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">上级全职客户经理：</span>
          <BaseSelect
            v-model="currentTag.parentCounselorId"
            class="medium-input"
            clearable
            filterable
            :options="options"
          ></BaseSelect>
        </div>
        <div class="section-item">
          <span class="section-label label-1">姓名：</span>
          <el-input v-model="currentTag.counselorName" clearable class="medium-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">手机号：</span>
          <el-input
            v-model="currentTag.counselorPhone"
            clearable
            class="medium-input"
            maxlength="11"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">身份证号：</span>
          <el-input v-model="currentTag.idCardNumber" clearable class="medium-input" maxlength="18"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">邮箱：</span>
          <el-input v-model="currentTag.mailBox" clearable class="medium-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">银行卡号：</span>
          <el-input v-model="currentTag.bankCardNumber" clearable class="medium-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">开户银行：</span>
          <el-input v-model="currentTag.bankName" clearable class="medium-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">开户支行：</span>
          <el-input v-model="currentTag.bankBranch" clearable class="medium-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">纳税人类型：</span>
          <el-select v-model="currentTag.taxpayerType" class="medium-input">
            <el-option label="自然人" value="01"></el-option>
            <el-option label="个体户" value="02"></el-option>
            <el-option label="法人" value="03"></el-option>
          </el-select>
        </div>
        <div class="section-item">
          <span class="section-label label-1">开户人姓名：</span>
          <el-input v-model="currentTag.accountName" clearable class="medium-input"></el-input>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import QueryComponents from '@/components/QueryComponents.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import exportExcel from '@/utils/export-excel'

const StatusOpts = [{
  label: '全部',
  value: null
}, {
  label: '驳回',
  value: '01'
}, {
  label: '待审核',
  value: '02'
}, {
  label: '通过',
  value: '03'
}]

export default {
  // name: 'the-public_part-time-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      counselor: {}, // 当前操作的客户经理
      box: false,
      options: [],
      tableData: [],
      currentTag: {
        parentCounselorId: '',
        counselorName: '',
        counselorPhone: '',
        idCardNumber: '',
        mailBox: '',
        bankCardNumber: '',
        bankName: '',
        bankBranch: '',
        taxpayerType: '01',
        accountName: '',
        marketType: '01'
      },
      rejectMessage: '',
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableCol: [
        {
          type: 'index',
          label: '序号'
        },
        {
          label: '姓名',
          prop: 'counselorName'
        },
        {
          label: '手机号',
          prop: 'counselorPhone'
        },
        {
          label: '身份证号',
          prop: 'idCardNumber'
        },
        {
          label: '银行卡号',
          prop: 'bankCardNumber'
        },
        {
          label: '开户银行全称',
          prop: 'bankName'
        },
        {
          label: '开户支行',
          prop: 'bankBranch'
        },
        {
          label: '开户人姓名',
          prop: 'accountName'
        },
        {
          label: '纳税人类型',
          prop: 'taxpayerType'
        },
        {
          label: '所属全职客户经理名称',
          prop: 'parentCounselorName'
        },
        {
          label: '手机',
          prop: 'parentCounselorPhone'
        },
        {
          label: '当前状态',
          prop: 'status',
          formatter: row => row.status === '03' ? '正常' : '失效'
        },
        {
          label: '会员人数',
          prop: 'memberNum'
        },
        {
          label: '提交时间',
          prop: 'ctimestr'
        }
      ],
      queryParams: {
        stt: '',
        phone: '',
        marketType: '01',
        parentId: ''
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          props: {
            options: [{ label: '全部', value: '' }, { label: '正常', value: '03' }, { label: '失效', value: '04' }]
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入兼职客户经理手机号'
        },
        {
          component: 'BaseSelect',
          key: 'parentId',
          label: '所属客户经理',
          props: {
            clearable: true,
            filterable: true,
            options: []
          }
        }
      ]
    }
  },
  created() {
    this.getCharge()
    this.getTableData()
  },
  methods: {
    async getCharge() {
      const params = { marketType: '01', channel: '02', status: '03' }
      const res = await this.$http('Channel/queryOwnCounselor', params)
      this.queryComps[2].props.options = res.obj.map(val => ({ label: `${val.counselorName} ${val.counselorPhone}`, value: val.counselorId }))
    },
    searchClick() {
      this.page.pageNo = 1
      this.getTableData()
    },
    getTableData() {
      this.$request('Motion/getCounselorApplication', {
        ...this.page,
        ...this.queryParams
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            const { result } = res

            this.tableDataTotal = result.totalRecordCount
            this.tableData = result.record
          }
        })
      )
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.queryParams,
        ...this.page,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('Motion/getCounselorApplication', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.result.record
      })
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
    detailClick(row) {
      this.$pushRoute('detail', {
        query: {
          id: row.id,
          counselorId: row.counselorId,
          status: 0
        }
      })
    },
    // 添加兼职客户经理
    async getCounselor() {
      const res = await this.$http('Channel/queryOwnCounselor', { marketType: '01', channel: '02', status: '03' })
      this.options = res.obj.map(val => ({ label: `${val.counselorName} ${val.counselorPhone}`, value: val.counselorId }))
    },
    async createManager() {
      this.currentTag = {
        parentCounselorId: '',
        counselorName: '',
        counselorPhone: '',
        idCardNumber: '',
        mailBox: '',
        bankCardNumber: '',
        bankName: '',
        bankBranch: '',
        taxpayerType: '01',
        accountName: '',
        marketType: '01'
      }
      this.box = true
      await this.getCounselor()
    },
    async tagConfirm(done) {
      if (!this.currentTag.parentCounselorId) {
        this.$msg('请选择客户经理', 'error')
        done()
        return
      }
      if (!this.currentTag.counselorName) {
        this.$msg('请输入姓名', 'error')
        done()
        return
      }
      if (!this.currentTag.counselorPhone) {
        this.$msg('请输入手机', 'error')
        done()
        return
      }
      if (!this.currentTag.idCardNumber) {
        this.$msg('请输入身份证', 'error')
        done()
        return
      }
      if (!this.currentTag.mailBox) {
        this.$msg('请输入邮箱', 'error')
        done()
        return
      }
      if (!this.currentTag.bankCardNumber) {
        this.$msg('请输入银行卡号', 'error')
        done()
        return
      }
      if (!this.currentTag.bankName) {
        this.$msg('请输入开户银行', 'error')
        done()
        return
      }
      if (!this.currentTag.bankBranch) {
        this.$msg('请输入开户支行', 'error')
        done()
        return
      }
      if (!this.currentTag.accountName) {
        this.$msg('请输入开户人姓名', 'error')
        done()
        return
      }
      const res = await this.$http('Channel/addPartTimeAgent', this.currentTag)
      if (!res.errMsg) {
        this.$msg('添加成功', 'success')
        this.getTableData()
        this.box = false
        setTimeout(() => {
          done()
        }, 500)
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
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>
