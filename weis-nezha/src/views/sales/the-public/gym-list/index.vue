<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="7"
        :label-width="40"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="goPage('edit', '1')">添加健身房</el-button>
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
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="goPage('edit', row)">编辑</span>
            <span v-if="row.tuStt === '00'" class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="update(row.tuId, '01')">上线</span>
            <span v-if="row.tuStt === '01'" class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="update(row.tuId, '00')">下线</span>
            <span class="brand-color cursor-pointer action-label" @click="goPage('detail', row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'

export default {
  name: 'sales_bodybuilding_channel-list',
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        phone: ''
      },
      queryComps: [
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
          component: 'el-input',
          key: 'phone',
          label: '电话',
          placeholder: '请输入负责人电话',
          props: {
            clearable: true
          }
        }
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '健身房ID',
          prop: 'tuId'
        },
        {
          label: '健身房名称',
          prop: 'tuName'
        },
        {
          label: '健身房描述',
          prop: 'tuDesc'
        },
        {
          label: '健身房地址',
          prop: 'tuAddress'
        },
        {
          label: '负责人',
          prop: 'tuLeaderName'
        },
        {
          label: '联系电话',
          prop: 'tuLeaderPhone'
        },
        {
          label: '健身房客户经理',
          prop: 'tuCounselorName',
          formatter: row => row.tuCounselorName || '无'
        },
        {
          label: '客户经理手机',
          prop: 'tuCounselorPhone',
          formatter: row => row.tuCounselorPhone || '无'
        },
        {
          label: '状态',
          prop: 'tuSttDesc'
        },
        {
          label: '创建时间',
          prop: 'tuCtime'
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
          type: row === '1' ? 'create' : 'edit',
          id: row.tuId
        }
      })
    },
    getList() {
      this.$store.state.vloading = true
      this.$request('fitness.Fitness/queryUnionList', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$store.state.vloading = false
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
    update(tuId, status) {
      console.log(tuId)
      this.$request('fitness.Fitness/updateUnionState', {
        tuId,
        opType: status
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: 'success', message: '更新成功' })
            this.getList()
          } else {
            this.$message({ type: 'error', message: err.errMsg })
          }
        })
      )
    }
  }
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
</style>
