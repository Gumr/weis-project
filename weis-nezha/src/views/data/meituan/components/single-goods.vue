<template>
  <div class="">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="6"
        :label-width="70"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button type="primary" :loading="$store.state.bloading" @click="handleExport">{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
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
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'

export default {
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      box: false,
      token: sessionStorage.getItem('token'),
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '日期',
          prop: 'tmfddDate'
        },
        {
          label: '门店名称',
          prop: 'tmfddShopName'
        },
        {
          label: '门店id',
          prop: 'tmfddShopId'
        },
        {
          label: '门店所在城市',
          prop: 'tmfddCity'
        },
        {
          label: '商品名',
          prop: 'tmfddFoodName'
        },
        {
          label: '商品销量',
          prop: 'tmfddSalesVolume'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        shopName: '',
        date: []
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            'value-format': 'yyyy-MM-dd'
          }
        },
        {
          label: '门店名称',
          component: 'el-input',
          key: 'shopName',
          props: {
            clearable: true
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
    this.getList()
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('meituan.Meituan/queryFoodDetailDataPage', params)
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record
        this.tableDataTotal = res.obj.dataPage.totalRecordCount
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
        ...this.page,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('meituan.Meituan/queryFoodDetailDataPage', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      })
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
    // 导入
    handleImport() {
      this.box = true
    },
    beforeUpload(file) {
      const extension = file.name.substring(file.name.lastIndexOf('.')+1)
      if (extension !== 'xlsx') {
        this.$message.warning('只能上传后缀是.xlsx的文件')
      }
    },
    onSuccess() {
      this.$msg('上传成功', 'success')
      this.getList()
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
