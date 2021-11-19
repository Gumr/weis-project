<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button
          >
        </template>
      </QueryComponents>
      <el-button style="float: right" type="danger" @click="handleEffect"
        >生效</el-button
      >
      <el-button style="float: right" type="warning" @click="handleDistri"
        >分配</el-button
      >
    </div>
    <div>
      <BasePageTable
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="effectDialog"
      title="选择生效卡片"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="effectConfirm"
    >
      <el-form>
        <el-form-item label="卡批次号:" label-width="120px">
          <span>{{ effectInfo.pid }}</span>
        </el-form-item>
        <el-form-item label="总卡数:" label-width="120px">
          <span>{{ effectInfo.count }}</span>
        </el-form-item>
        <el-form-item label="未生效卡数:" label-width="120px">
          <span>{{ effectInfo.undistributedCount }}</span>
        </el-form-item>
        <el-form-item label="输入生效张数:" label-width="120px">
          <el-input
            class="small-input"
            v-model="effectCount"
            @keydown="catchNonIntKeydown"
          />张
        </el-form-item>
        <el-form-item label="提示：" label-width="120px">
          <span>会按照卡ID的顺序进行生效</span>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import exportExcel from '@/utils/export-excel'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import {
  catchNonIntKeydown,
  catchNonNumberKeydown,
} from '@/utils/event-catcher'

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    },
  },
  data() {
    return {
      height: window.innerHeight - 280,
      effectDialog: false,
      effectInfo: {},
      distriInfo: {},
      effectCount: 0,
      distriDialog: false,
      distriData: [],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        pid: '',
        stt: '',
        cid: '',
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部状态',
                value: '',
              },
              {
                label: '未生效',
                value: '00',
              },
              {
                label: '未使用',
                value: '01',
              },
              {
                label: '已使用',
                value: '02',
              },
              {
                label: '已失效',
                value: '03',
              },
              {
                label: '已转让',
                value: '04',
              },
            ],
          },
        },
        {
          component: 'el-input',
          key: 'cid',
          label: '卡ID',
          placeholder: '请输入卡券ID',
          props: {
            clearable: true,
          },
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index',
        },
        {
          label: '卡ID',
          prop: 'cid',
        },
        {
          label: '卡兑换码',
          prop: 'code',
        },
        {
          label: '卡面额',
          prop: 'amount',
        },
        {
          label: '卡兑换有效期至',
          prop: 'exchangeTime',
        },
        {
          label: '状态',
          prop: 'strStt',
        },
        {
          label: '是否分配',
          prop: 'isAllocation',
        },
        {
          label: '分配渠道',
          prop: 'sellChannel',
        },
        {
          label: '分配类型',
          prop: 'allotTypeStr',
        },
      ],
    }
  },
  created() {
    this.queryParams.pid = this.$route.query.id
    this.getList()
  },
  methods: {
    catchNonNumberKeydown,
    catchNonIntKeydown,
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    getList() {
      this.$store.state.vloading = true
      this.$request('card.CreateOffline/get', {
        ...this.page,
        ...this.genQueryParams(),
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false
          if (!err) {
            this.tableData = dataPage.record
            this.tableDataTotal = dataPage.totalRecordCount
          }
        })
      )
    },
    genQueryParams() {
      const params = { ...this.queryParams }
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
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      this.reqAllUserData().then(
        this.$rw((err, dataPage) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: this.tableCol,
            filename,
            data: dataPage.record,
          })
        })
      )
    },
    reqAllUserData() {
      return this.$request('card.CreateOffline/get', {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      })
    },
    handleEffect() {
      this.$request('card.CreateOffline/getTakeEffectInfo', {
        pid: this.queryParams.pid,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.effectCount = ''
            this.effectDialog = true
            Object.assign(this.effectInfo, dataPage)
          }
        })
      )
    },
    handleDistri() {
      this.$router.push({
        path: `${this.$route.path}/distribution`,
        query: {
          batchNumber: this.queryParams.pid,
        },
      })
    },
    effectConfirm(done) {
      if (this.effectCount > this.effectInfo.undistributedCount) {
        this.$message({
          type: 'error',
          message: '不能大于未生效卡数',
        })
        done()
        return
      }
      if (this.effectCount < 0) {
        this.$message({
          type: 'error',
          message: '不能小于0',
        })
        done()
        return
      }
      this.$request('card.CreateOffline/takeEffect', {
        pid: this.effectInfo.pid,
        count: this.effectCount,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({
              type: 'success',
              message: '操作成功',
            })
            this.getList()
            this.effectDialog = false
            this.$nt(() => {
              setTimeout(done, 300)
            })
          } else {
            this.$message({
              type: 'error',
              message: err.errMsg,
            })
            done()
          }
        })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}

.small-input {
  margin: 0 8px;
  width: 300px;
}

.tiny-input {
  margin: 0 8px;
  width: 100px;
}

.food-cover {
  max-height: 100%;
  max-width: 100%;
}

section {
  padding-top: 30px;
}

.medium-input {
  width: 240px;
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

  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}

.label-1 {
  min-width: 100px;
  margin-right: 20px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
