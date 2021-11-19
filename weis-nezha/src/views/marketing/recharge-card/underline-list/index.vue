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
          <el-button type="primary" @click="handleDialog">生成线下卡</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <!-- <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="effect(row)">生效</span> -->
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goPage('detail', row)"
              >明细</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="生成卡"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <el-form>
        <el-form-item label="批次名称" label-width="100px">
          <el-input
            class="small-input"
            maxlength="20"
            v-model="addParams.batchName"
          ></el-input>
        </el-form-item>
        <el-form-item label="线下卡模板" label-width="100px">
          <el-select v-model="addParams.cid" placeholder="请选择线下模板">
            <el-option
              v-for="item in modelOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="输入张数" label-width="100px">
          <el-input
            class="small-input"
            maxlength="20"
            type="number"
            min="0"
            v-model="addParams.count"
          ></el-input>
        </el-form-item>
        <el-form-item label="兑换有效期至" label-width="100px">
          <el-date-picker
            type="date"
            v-model="addParams.exchangeTime"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="批次备注" label-width="100px">
          <el-input
            class="small-input"
            v-model="addParams.batchRemark"
          ></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  name: 'marketing_recharge-card_underline-list',
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
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7 //如果没有后面的-8.64e7就是不可以选择今天的
        },
      },
      hasDialog: false,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        date: [],
        pid: '',
      },
      addParams: {
        cid: '',
        exchangeTime: '',
        count: '',
        batchName: '',
        batchRemark: '',
      },
      modelOptions: [],
      typeOption: [
        {
          label: '本金',
          value: '00',
        },
        {
          label: '赠送金',
          value: '01',
        },
      ],
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '生成时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
          },
        },
        {
          component: 'el-input',
          key: 'pid',
          label: '批次号',
          props: {
            placeholder: '批次号',
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
          label: '批次号',
          prop: 'pid',
        },
        {
          label: '批次名称',
          prop: 'batchName',
        },

        {
          label: '卡数量',
          prop: 'count',
        },
        {
          label: '兑换有效期至',
          prop: 'exchangeDeadline',
        },
        {
          label: '生成时间',
          prop: 'ctime',
        },
        {
          label: '金额',
          prop: 'amount',
        },
        {
          label: '未使用数量',
          prop: 'notUsedCount',
        },
        {
          label: '已使用数量',
          prop: 'useCount',
        },
        {
          label: '已失效数量',
          prop: 'loseEfficacyCount',
        },
        {
          label: '分配类型',
          prop: 'allotTypeStr',
        },
        {
          label: '备注',
          prop: 'batchRemark',
        },

        // {
        //   label: '生效人',
        //   prop: 'operator'
        // },
        // {
        //   label: '生效时间',
        //   prop: 'utime'
        // }
      ],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        // path: `${this.$route.path}/detail`,
        query: {
          id: row.pid,
        },
      })
    },
    getList() {
      this.$store.state.vloading = true
      this.$request('card.CreateOffline/getAll', {
        ...this.page,
        ...this.genQueryParams(),
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false
          if (!err) {
            this.tableData = dataPage.record
            this.tableDataTotal = dataPage.totalRecordCount
            this.$nt(() => {
              this.$refs.table.doLayout()
            })
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
    handleDialog() {
      this.getTamplate()
      this.addParams = {
        cid: '',
        exchangeTime: '',
        count: '',
        batchName: '',
        batchRemark: '',
      }
      this.hasDialog = true
    },
    getTamplate() {
      this.$request('card.Model/getAllForOffline', {
        pageNo: 1,
        pageSize: 99999,
        name: '',
        stt: '00',
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.modelOptions = dataPage.record
          }
        })
      )
    },
    onconfirm(done) {
      const params = this.$deepClone(this.addParams)
      if (!params.batchName) {
        this.$message({ type: 'error', message: '请输入批次名称！' })
        done()
        return
      }
      if (!params.cid) {
        this.$message({ type: 'error', message: '请选择一个模板！' })
        done()
        return
      }
      if (!params.count) {
        this.$message({ type: 'error', message: '请输入数量' })
        done()
        return
      }
      if (params.count < 0) {
        this.$message({ type: 'error', message: '不能小于0' })
        done()
        return
      }
      if (!/^\d+$/.test(params.count)) {
        this.$message({ type: 'error', message: '不能输入小数' })
        done()
        return
      }
      if (!params.exchangeTime) {
        this.$message({ type: 'error', message: '请选择有效期！' })
        done()
        return
      }
      this.$request('card.CreateOffline/add', params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: 'success', message: '添加成功！' })
            this.hasDialog = false
            this.getList()
            this.$nt(() => {
              setTimeout(done, 300)
            })
          } else {
            this.$message({ type: 'error', message: err.errMsg })
            done()
          }
        })
      )
    },
    effect(row) {
      this.$request('card.CreateOffline/takeEffect', {
        pid: row.pid,
        count: -1,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: 'success', message: '生效成功！' })
            this.getList()
          } else {
            this.$message({ type: 'error', message: err.errMsg })
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
.detail-section {
  margin: 22px 0 22px 6%;
}

.flex-grow-1 {
  flex-basis: 25%;
}
.section-item {
  width: 500px;
}
.section-label {
  display: inline-block;
  width: 150px;
  margin-right: 12px;
  text-align: left;
}
</style>
