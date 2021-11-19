<template>
  <div class="page-container">
    <div style="margin: 20px 0;display: flex;">
      <QueryComponents
        v-model="tableQuery"
        :query-list="queryComps"
        :span="6"
        :label-width="60"
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="$pushRoute('create')">添加活动</el-button>
    </div>
    <BasePageTable
      ref="table"
      v-model:current-page="table.page.pageNo"
      v-model:page-size="table.page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      border
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column
        v-for="col in table.col"
        :key="col.prop"
        v-bind="col"
      ></el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="rowDetailClick(row.taId)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import format from '@/utils/format'
import { mapToOptions } from '@/utils/data-map'

const StatusMap = {
  '00': '待开始',
  '01': '进行中',
  '02': '已完结'
}

export default {
  name: 'marketing_activity-list',
  components: {
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableQuery: {
        stt: '',
        staname: ''
      },
      queryComps: [{
        component: 'BaseSelect',
        key: 'stt',
        label: '状态',
        props: {
          clearable: true,
          options: mapToOptions(StatusMap, { label: '全部', value: '' })
        }
      }, {
        component: 'el-input',
        key: 'staname',
        label: '活动名称',
        props: {
          clearable: true
        }
      }],
      table: {
        page: {
          pageNo: 1,
          pageSize: 10
        },
        data: [],
        col: [{
          label: '序号',
          type: 'index'
        }, {
          label: '活动ID',
          prop: 'taId'
        }, {
          label: '活动名称',
          prop: 'taAname'
        }, {
          label: '持续时间',
          prop: 'taPeriod',
          formatter: row => `${row.taPeriod}天`
        }, {
          label: '状态',
          prop: 'taStt',
          formatter: row => StatusMap[row.taStt]
        }, {
          label: '创建时间',
          prop: 'taCtime',
          formatter: row => format.date(row.taCtime)
        }],
        total: 0
      }
    }
  },
  watch: {
    $route(to,from){
      this.getTableData()
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    rowDetailClick(id) {
      this.$pushRoute('detail', {
        query: {
          id
        }
      })
    },
    searchClick() {
      this.table.page.pageNo = 1
      this.getTableData()
    },
    getTableData() {
      this.$store.state.vloading = true
      this.$request('BusinessActivities/getActivity', {
        ...this.table.page,
        ...this.tableQuery
      }).then(({ data }) => {
        this.$store.state.vloading = false
        if (data.errCode === 0) {
          data = data.obj
          this.table.total = data.totalRecordCount
          this.table.data = data.record
        }
      })
    }
  }
}
</script>
