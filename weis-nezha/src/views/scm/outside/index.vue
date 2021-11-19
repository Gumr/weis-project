<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="5"
        :label-width="60"
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
          <el-button type="danger" @click="showDialog">盘点录入</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">编辑</span>
            <span class="brand-color cursor-pointer action-label" @click="toDel(row)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
      <ConfirmDialog
        v-model="hasDialog"
        title="盘点录入"
        :close-on-click-modal="false"
        :auto-confirm="false"
        :async-confirm="true"
        @on-confirm="onConfirm"
      >
        <div style="padding: 20px 0;">
          <span
            v-if="isEdit"
            class="section-label label-1"
            style="width: 421px;color:red;"
          >该盘点单已存在，是否继续编辑？</span>
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color:red">*</span>供餐点选择：
            </span>
            <BaseSelect
              v-model="current.tmtHeatingPoint"
              :disabled="current.tmtId ? true: false"
              :options="heatPointOptions"
              filterable
              clearable
              class="small-input"
              @change="checkTurnover"
            ></BaseSelect>
          </div>
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color:red">*</span>盘点日期：
            </span>
            <el-date-picker
              v-model="current.tmtDate"
              :disabled="current.tmtId ? true: false"
              class="small-input"
              value-format="yyyy-MM-dd"
              @change="checkTurnover"
            ></el-date-picker>
          </div>
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color:red">*</span>来源：
            </span>
            <BaseSelect
              v-model="current.tmtSource"
              :options="sourceOptions"
              filterable
              clearable
              class="small-input"
            ></BaseSelect>
          </div>
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color:red">*</span>订单量：
            </span>
            <el-input
              v-model="current.tmtOrderNum"
              class="small-input"
              @blur="checkText('tmtOrderNum')"
            ></el-input>单
          </div>
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color:red">*</span>营业额：
            </span>
            <el-input
              v-model="current.tmtTurnover"
              class="small-input"
              @blur="checkText('tmtTurnover')"
            ></el-input>元
          </div>
          <div class="section-item">
            <span class="section-label label-1">
              <span style="color:red">*</span>实际收入：
            </span>
            <el-input
              v-model="current.tmtIncome"
              class="small-input"
              @blur="checkText('tmtIncome')"
            ></el-input>元
          </div>
        </div>
      </ConfirmDialog>
    </div>
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
      height: window.innerHeight - 280,
      hasDialog: false,
      isEdit: false,
      tableData: [],
      heatPointOptions: [],
      sourceOptions: [
        { label: '美团', value: '01' },
        // {label: '线下活动', value: '02'},
        // { label: '大众市场', value: '04' },
        // { label: '健身市场', value: '05' },
        // { label: '快餐市场', value: '06' },
        // { label: '泛医疗市场', value: '07' },
        { label: '饿了么', value: '08' },
        { label: '其他', value: '03' }
      ],
      current: {},
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '供餐点',
          prop: 'tmtHeatingPointName'
        },
        {
          label: '来源',
          prop: 'tmtSourceDesc'
        },
        {
          label: '订单量（单）',
          prop: 'tmtOrderNum'
        },
        {
          label: '营业额（元）',
          prop: 'tmtTurnover'
        },
        {
          label: '收入（元）',
          prop: 'tmtIncome'
        },
        {
          label: '盘点日期',
          prop: 'tmtDate',
          formatter: row => this.$day(row.tmtDate).format('YYYY-MM-DD')
        },
        {
          label: '操作人',
          prop: 'tmtUpdatorName'
        },
        {
          label: '操作日期',
          prop: 'tmtUtime'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        // date: this.$day(new Date(Date.now())).format('YYYY-MM-DD'),
        date: [new Date(Date.now()), new Date(Date.now())],
        pointId: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          placeholder: '选择日期',
          props: {
            type: 'daterange',
            clearable: true,
            'value-format': 'yyyy-MM-dd'
          }
        },
        {
          component: 'BaseSelect',
          key: 'pointId',
          label: '供餐点',
          props: {
            clearable: true,
            options: []
          }
        }
      ]
    }
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    }
  },
  created() {
    this.getHeatPoint()
    this.getList()
  },
  methods: {
    checkText(type) {
      this.current[type] = isNaN(this.current[type]) ? '' : this.current[type]
      let toFixed = 0
      if (type == 'tmtTurnover' || type == 'tmtIncome') {
        toFixed = 2
      }
      this.current[type] = this.current[type] == '' ? '' : Number(Math.abs(this.current[type])).toFixed(toFixed)
    },
    async getHeatPoint() {
      const res = await this.$request('HeatingPoint/queryEnabledHeat')
      this.queryComps[1].props.options = res.data.obj.heatVos
      this.heatPointOptions = res.data.obj.heatVos
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
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('MeituanTurnover/queryList', params)
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record
        this.tableDataTotal = res.obj.dataPage.totalRecordCount
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('MeituanTurnover/queryList', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      })
    },
    showDialog() {
      this.isEdit = false
      this.hasDialog = true
      this.current = {
        tmtHeatingPoint: '',
        tmtOrderNum: '',
        tmtTurnover: '',
        tmtIncome: '',
        tmtComboNum: '',
        tmtSource: '',
        tmtSingleNum: '',
        tmtDate: this.$day(new Date(Date.now())).format('YYYY-MM-DD')
      }
    },
    async toEdit(row) {
      const res = await this.$http('MeituanTurnover/queryTurnoverById', { tmtId: row.tmtId })
      this.current = {
        tmtId: res.obj.tmtId,
        tmtHeatingPoint: res.obj.tmtHeatingPoint,
        tmtOrderNum: res.obj.tmtOrderNum,
        tmtTurnover: res.obj.tmtTurnover,
        tmtIncome: res.obj.tmtIncome,
        tmtSource: res.obj.tmtSource,
        tmtComboNum: res.obj.tmtComboNum,
        tmtSingleNum: res.obj.tmtSingleNum,
        tmtDate: this.$day(res.obj.tmtDate).format('YYYY-MM-DD')
      }
      this.isEdit = false
      this.hasDialog = true
    },
    async checkTurnover() {
      // if (this.current.tmtHeatingPoint && this.current.tmtDate) {
      //   const res = await this.$http('MeituanTurnover/checkTurnover', { tmtHeatingPoint: this.current.tmtHeatingPoint, tmtDate: this.current.tmtDate });
      //   if (res.obj.result != '0') {
      //     this.isEdit = true;
      //     this.current.tmtId = res.obj.result;
      //     this.toEdit({tmtId: this.current.tmtId});
      //   }
      // }
    },
    async onConfirm(done) {
      if (!this.current.tmtHeatingPoint) {
        this.$msg('请选择供餐点', 'error')
        done()
        return
      }
      if (!this.current.tmtDate) {
        this.$msg('请选择盘点日期', 'error')
        done()
        return
      }
      if (!this.current.tmtOrderNum) {
        this.$msg('请选择来源', 'error')
        done()
        return
      }
      if (!this.current.tmtOrderNum) {
        this.$msg('请输入订单量', 'error')
        done()
        return
      }
      if (!this.current.tmtTurnover) {
        this.$msg('请输入营业额', 'error')
        done()
        return
      }
      if (!this.current.tmtIncome) {
        this.$msg('请输入实际收入', 'error')
        done()
        return
      }
      const params = this.$deepClone(this.current)
      const res = await this.$http('MeituanTurnover/updateTurnover', params)
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
        this.hasDialog = false
        this.$nt(() => {
          setTimeout(done, 500)
        })
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    },
    async toDel(row) {
      this.$confirm('确定删除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('MeituanTurnover/deleteTurnover', { tmtId: row.tmtId })
        if (res.obj.result == '1') {
          this.$msg('删除成功', 'success')
          this.getList()
        } else {
          this.$msg(res.errMsg, 'error')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  padding: 20px 0;
}
h3 {
  margin-right: 20px;
}
h4 {
  margin: 10px 0;
}
section {
  padding-top: 30px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 500px;
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
  width: 300px;
  margin-right: 10px;
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
  flex-wrap: wrap;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 200px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
.action-label {
  margin-right: 10px;
}
</style>
