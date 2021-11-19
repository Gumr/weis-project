<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="6"
        :label-width="80"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
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
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
// import { transformDaterange } from '@/utils/transform'

export default {
  components: {
    QueryComponents,
    BasePageTable
  },
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
          label: '下单人昵称',
          prop: 'orderUname'
        },
        {
          label: '手机号',
          prop: 'orderPhone'
        },
        {
          label: '配送日期',
          prop: 'shipDate'
        },
        {
          label: '配送地址',
          prop: 'shipAddress'
        },
        {
          label: '餐别',
          prop: 'category'
        },
        {
          label: '菜品',
          prop: 'skuName'
        },
        {
          label: '应收数量',
          prop: 'shouldNum'
        },
        {
          label: '实收数量',
          prop: 'practicalNum'
        },
        // {
        //   label: '签收日期',
        //   prop: 'signDate'
        // },
        {
          label: '签收人昵称',
          prop: 'signer'
        },
        {
          label: '签收人手机号',
          prop: 'signerPhone'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        shipDate: '', //时间
        shipAddress: '', //地址
        corpId: '' //企业Id
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'shipDate',
          label: '配送时间',
          placeholder: '请选择配送时间',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'shipAddress',
          label: '配送地址',
          placeholder: '请选择配送地址',
          props: {
            options: [],
            props: {
              label: 'addressName',
              value: 'addressId'
            },
            clearable: true
          }
        }
      ]
    }
  },
  created() {
    this.queryParams.corpId = this.$route.query.id
    this.getList()
    this.getCorpAddress()
  },
  methods: {
    getList(page = this.page) {
      const params = {
        ...page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      return this.$http('groupmeal.Corp/getGroupCorpOrderSign', params)
        .thenwrap((err, data) => {
          if (!err) {
            this.tableData = data.record
            this.tableDataTotal = data.totalRecordCount
          } else {
            this.$message.error(err.errMsg)
          }

          return err ? [] : data.record
        })
    },
    getCorpAddress() {
      this.$request('groupmeal.Corp/getCorpAddress', {
        corpId: this.queryParams.corpId
      }).thenwrap((err, data) => {
        if (!err) {
          this.queryComps[1].props.options = data
        }
      })
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    handleExport() {
      this.getList({
        pageNo: 1,
        pageSize: this.tableDataTotal
      }).then(data => {
        exportExcel({
          columns: this.tableCol,
          data
        })
      })
    },
    goDetail(type, row) {
      this.$router.push({
        path: `/business/fast-foods/order-list/${type}`,
        query: {
          id: row.orderId
        }
      })
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.shipDate) params.shipDate = this.$day(params.shipDate).format('YYYY-MM-DD')
      return params
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
