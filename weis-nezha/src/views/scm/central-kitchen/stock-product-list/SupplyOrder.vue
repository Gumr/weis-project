<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="60"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
          <span>（售卖日期：{{ saleDate }}）</span>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="loading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        :visible="false"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in tableCols" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
// import ButtonTabs from '@/components/ButtonTabs.vue'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import exportExcel from '@/utils/export-excel'
// import ConfirmDialog from '@/components/ConfirmDialog.vue'
// import { getLodop } from '@/utils/LodopFuncs'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'scm_central-kitchen_stock-product-list',
  components: {
    // ButtonTabs,
    QueryComponents,
    BasePageTable
    // ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      printType: 0,
      printNum: 0,
      currentDish: [],
      printDate: new Date(Date.now() + 86400000),
      loading: false,
      heatPointOptions: [{ label: '全部加热点', value: '' }],
      activeTab: '02',
      queryParams: {
        date: new Date(Date.now() + 86400000),
        heatPointId: ''
      },
      tableCols: [
        {
          type: 'index',
          label: '序号',
          width: 60
        },
        {
          label: '菜品名称',
          prop: 'tfsSkuname'
        },
        {
          label: '菜品编码',
          prop: 'tdodCid'
        },
        {
          label: '备货补生产单',
          prop: 'replenishmentNum'
        },
        // {
        //   label: '备货生产合计',
        //   prop: 'num'
        // },
        {
          label: '单价（元）',
          prop: 'tfsPrice'
        },
        {
          label: '总额',
          prop: 'sum'
        }
      ],
      exportCols: [
        {
          type: 'index',
          label: '序号',
          width: 60
        },
        {
          label: '菜品名称',
          prop: 'tfsSkuname'
        },
        {
          label: '金蝶物料编码',
          prop: 'tfsKingdeeId'
        },
        {
          label: '规格',
          prop: 'tfsQuality',
          formatter: (row) => (row.tfsQuality + row.tfsUnit)
        },
        {
          label: '备货生产数量',
          prop: 'num'
        },
        {
          label: '单价（元）',
          prop: 'tfsPrice'
        },
        {
          label: '总额',
          prop: 'sum'
        }
      ],
      dishStatusTabs: [
        {
          label: '补货生产单',
          value: '03'
        },
        {
          label: '总生产单',
          value: '01'
        },
        {
          label: '备货生产单',
          value: '02'
        }
      ],
      tableSelection: [],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      saleDate: '',
      url: ''
    }
  },
  computed: {
    queryComps() {
      return [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '生产日期',
          placeholder: '选择日期',
          props: {
            type: 'date',
            editable: false,
            clearable: false,
            'value-format': 'yyyy-MM-dd'
          }
        }
      ]
    }
  },
  watch: {
    'queryParams.date': {
      flush: 'sync',
      immediate: true,
      handler(date) {
        this.saleDate = this.$day(date).add(1, 'day').format('YYYY-MM-DD')
      }
    }
  },
  created() {
    this.getHeatList()
    this.getList()
  },
  methods: {
    getHeatList() {
      this.$request('OrderPrint/hpInfo', {}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.heatPointOptions = this.heatPointOptions.concat(dataPage.res)
          }
        })
      )
    },
    searchClick() {
      this.printDate = this.queryParams.date
      this.getList()
    },
    changes() {
      this.getList()
    },
    getList() {
      this.loading = true
      this.tableData = []
      this.$request('OrderPrint/queryProductionList', {
        type: '02',
        date: this.saleDate.split('-').join('')
      }).then(
        this.$rw((err, dataPage) => {
          this.loading = false
          if (!err) {
            this.tableData = dataPage
          }
        })
      )
    },
    handleExport() {
      const file = this.dishStatusTabs.find((tab) => tab.value === this.activeTab).label
      const date = this.$day(this.printDate).format('YYYY-MM-DD')
      const filename = `${file}-导出(${date})`
      this.$store.state.bloading = true
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: this.exportCols,
            filename,
            data: res
          })
        })
      )
    },
    reqAllUserData() {
      return this.$request('OrderPrint/queryProductionList', {
        type: '02',
        date: this.saleDate.split('-').join('')
      })
    }
  }
})
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}

.food-cover {
  max-height: 100%;
  max-width: 100%;
}
.dialogTxt {
  height: 60px;
  font-size: 17px;
  line-height: 60px;
  span {
    color: red;
    margin: 0 20px;
  }
}
</style>
