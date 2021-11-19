<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="150"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
        :columns="tableCol"
      >
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'


export default {
 
  data() {
    return {
    
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '外部客户经理名称',
          prop: 'semName'
        },
        {
          label: '外部客户经理手机号',
          prop: 'semPhone'
        },
        {
          label: '关联的维士销售名称',
          prop: 'sexName'
        },
        {
          label: '关联的维士销售手机号',
          prop: 'sexPhone'

        },
        {
          label: '绑定的客户名称',
          prop: 'userName',
      
        },
        {
          label: '绑定的客户手机号',
          prop: 'userPhone'
        },
        {
          label: '当前绑定状态',
          prop: 'bdState'
        },
        {
          label: '该客户累计用餐数',
          prop: 'totalNum'
        },
        {
          label: '最后一次用餐日期',
          prop: 'lastOrderTime'
        },
        {
          label: '归属给外部客户经理的餐单数',
          prop: 'belongNum'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        semPhone: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'semPhone',
          label: '外部客户经理手机号',
          props: {
            clearable: true
          }
        }
      ]
    }
  },
  created() {
  },
  methods: {
    async getList() {
      this.$store.state.vloading = true
      const res = await this.$http('data.OuterPersonnel/queryOuterPersonnelUserBdData', {
        ...this.page,
        ...this.queryParams
      })
      if (!res.errMsg) {
       
        this.tableData = res.obj.result.record
        this.tableDataTotal = res.obj.result.totalRecordCount
      } else {
        // this.errMsg(res.errMsg,error)
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

      const res = await this.$http('data.OuterPersonnel/queryOuterPersonnelUserBdData', {
        pageNo:1,
        pageSize:this.tableDataTotal || 99999,
        ...this.queryParams
      })
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.result.record
      })
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
