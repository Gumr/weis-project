<template>
  <div class="page-container">
    <div class="overflow-hidden"></div>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :span="5"
        :label-width="80"
        :query-list="computedQueryComps"
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
          <el-button type="warning" @click="multiplePrint">批量打印标签</el-button>
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
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="singlePrint(row)">打印标签</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>
<script>

import { getLodop } from '@/utils/LodopFuncs'
import BasePageTable from '@/components/BasePageTable.vue'
import exportExcel from '@/utils/export-excel'

export default {
  components: {
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      loading: false,
      queryParams: {
        date: this.$day().format('YYYYMMDD'),
        hpid: ''
      },
      printDate: this.$day().format('YYYYMMDD'),
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryComps: [
        {
          component: 'DatePicker',
          label: '选择日期',
          key: 'date',
          props: {
            clearable: false,
            editable: false,
            'value-format': 'YYYYMMDD'
          }
        },
        {
          label: '供餐点名称',
          component: 'BaseSelect',
          key: 'hpid',
          props: {
            clearable: true,
            filterable:true,
            options: []
          }
        }
      ],
      tableSelection: [],
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        { label: '/', type: 'selection', width: '80' },
        { label: '序号', type: 'index', width: '80' },
        { label: '供餐点', prop: 'tdotPointName' },
        { label: '配送单编码', prop: 'tdotShipOid' },
        { label: '取餐码', prop: 'tdotTakeMealCode' },
        { label: '配送方式', prop: 'tdotShipWithCold', formatter: row => (row.tdotShipWithCold == '00' ? '热食配送' : '冷链配送') },
        { label: '收货人', prop: 'tdotConsignee' },
        { label: '收货人电话', prop: 'tdotContactNumber' },
        { label: '配送地址', prop: 'tdotReceivingAddress' },
        { label: '早餐', prop: 'tdotBreakfastContent' },
        { label: '午餐', prop: 'tdotLunchContent' },
        { label: '晚餐', prop: 'tdotDinnerContent' },
        { label: '配送日期', prop: 'tdotDate' }
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
    this.getHintPoint()
    this.getList()
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1
      this.printDate = this.queryParams.date
      this.getList()
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}冷链包裹单-导出(${date})`
      const params = {
        ...this.queryParams,
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      const col = this.$deepClone(this.tableCol)
      col.shift()
      this.$store.state.bloading = true
      const res = await this.$http('OrderPrint/queryColdOrderList', params)
      const data = this.$deepClone(res.obj.dataPage.record)
      data.forEach((item) => {
        item.tdotShipWithCold = item.tdotShipWithCold == '00' ? '热食配送' : '冷链配送'
      })
      exportExcel({
        columns: col,
        filename,
        data
      })
    },
    async getHintPoint() {
      const res = await this.$http('OrderPrint/hpInfo', {})
      this.queryComps[1].props.options = res.obj.res
    },
    async getList() {
      this.$store.state.vloading = true
      const res = await this.$http('OrderPrint/queryColdOrderList', { ...this.queryParams, ...this.page })
      this.tableData = res.obj.dataPage.record
      this.tableDataTotal = res.obj.dataPage.totalRecordCount
      this.$nt(() => {
        this.$refs.table.doLayout()
      })
    },
    singlePrint(row) {
      const params = { date: row.tdotDate, shipOid: [row.tdotShipOid] }
      this.getPrintInfo(params)
    },
    multiplePrint() {
      if (!this.tableSelection.length) {
        this.$msg('请勾选打印标签', 'error')
        return
      }
      const shipOid = this.tableSelection.map(item => item.tdotShipOid)
      const params = { date: this.printDate, shipOid }
      this.getPrintInfo(params)
    },
    async getPrintInfo(params) {
      this.loading = true
      const res = await this.$http('OrderPrint/coldOrderList', params)
      // 处理打印结构
      for (const data of res.obj) {
        const printData = []
        const category = Object.entries(data.categoryInfo)
        for (const cate of category) {
          if (cate[1].length <= 8) {
            printData.push(cate)
          } else {
            for (let i = 0; i < cate[1].length; i += 8) {
              printData.push([cate[0], cate[1].slice(i, i + 8)])
            }
          }
        }
        for (const category of printData) {
          this.pritnt2(data, category)
        }
        this.pritnt(data)
      }
      this.loading = false
    },
    pritnt(data) {
      const LODOP = getLodop()
      LODOP.PRINT_INIT('')
      LODOP.SET_PRINT_PAGESIZE(0, 800, 600)
      LODOP.SET_PRINT_MODE('POS_BASEON_PAPER', true)
      LODOP.ADD_PRINT_RECT(10, 8, 284, 212, 0, 1)
      LODOP.ADD_PRINT_LINE(57, 8, 58, 290, 0, 1)
      LODOP.ADD_PRINT_LINE(108, 8, 107, 290, 0, 1)
      LODOP.ADD_PRINT_LINE(163, 8, 164, 290, 0, 1)

      LODOP.ADD_PRINT_TEXT(15, 73, 214, 20, `${data.tdotPointName} 取餐号:${data.tdotTakeMealCode}`)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 3)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 11)
      LODOP.ADD_PRINT_TEXT(38, 22, 265, 20, `编码:${data.tdotShipOid}`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 3)
      LODOP.ADD_PRINT_IMAGE(15, 17, 153, 36, '<img border=\'0\' src=\'http://prodstatic.weis1606.cn/api/diet/2020070615392845361.png\' />')
      LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)

      LODOP.ADD_PRINT_LINE(59, 74, 106, 75, 0, 1)
      LODOP.ADD_PRINT_LINE(59, 142, 106, 143, 0, 1)
      LODOP.ADD_PRINT_LINE(59, 211, 106, 212, 0, 1)
      LODOP.ADD_PRINT_TEXT(76, 12, 66, 20, '收货人')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.ADD_PRINT_TEXT(67, 78, 72, 37, data.tdotName)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.ADD_PRINT_TEXT(76, 149, 66, 20, '收货人电话')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.ADD_PRINT_TEXT(74, 217, 79, 24, data.tdotPhone)
      LODOP.ADD_PRINT_TEXT(113, 12, 100, 20, '收货地址：')
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.ADD_PRINT_TEXT(128, 12, 293, 20, data.tdotReceivingAddress.replace('广东省', '').replace('深圳市', ''))
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.ADD_PRINT_TEXT(168, 13, 100, 20, '寄送地址')
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.ADD_PRINT_TEXT(186, 12, 270, 31, data.tdotPointAddress.replace('广东省', '').replace('深圳市', ''))
      LODOP.ADD_PRINT_TEXT(168, 90, 197, 20, `电话:${data.tdotPointPhone}`)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 3)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.ADD_PRINT_TEXT(204, 90, 197, 20, '合理膳食 健康基石')
      LODOP.SET_PRINT_STYLEA(0, 'FontColor', '#0D328B')
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 3)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)

      // LODOP.PRINT_DESIGN();
      LODOP.PRINT()
    },
    pritnt2(data, category) {
      const LODOP = getLodop()
      LODOP.PRINT_INIT('')
      LODOP.SET_PRINT_PAGESIZE(0, 800, 600, '')
      LODOP.SET_PRINT_MODE('POS_BASEON_PAPER', true)
      LODOP.ADD_PRINT_RECT(10, 8, 284, 212, 0, 1)
      LODOP.ADD_PRINT_LINE(57, 8, 58, 290, 0, 1)

      const cate = {
        '01': '早餐',
        '02': '午餐',
        '03': '晚餐'
      }[category[0]]

      LODOP.ADD_PRINT_TEXT(16, 167, 118, 20, `${data.tdotPointName}:${cate}`)
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 10)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 3)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.ADD_PRINT_TEXT(30, 22, 265, 20, `编码:${data.tdotShipOid}`)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 3)
      LODOP.ADD_PRINT_TEXT(42, 91, 196, 20, `用餐日期:${category[1][0].eatDate}`)
      LODOP.SET_PRINT_STYLEA(0, 'Alignment', 3)
      LODOP.ADD_PRINT_IMAGE(15, 17, 153, 36, '<img border=\'0\' src=\'http://prodstatic.weis1606.cn/api/diet/2020070615392845361.png\' />')
      LODOP.SET_PRINT_STYLEA(0, 'Stretch', 2)

      LODOP.ADD_PRINT_RECT(66, 16, 129, 115, 0, 1)
      LODOP.ADD_PRINT_RECT(66, 154, 129, 115, 0, 1)
      LODOP.ADD_PRINT_LINE(89, 16, 90, 145, 0, 1)
      LODOP.ADD_PRINT_LINE(112, 16, 113, 145, 0, 1)
      LODOP.ADD_PRINT_LINE(135, 16, 136, 145, 0, 1)
      LODOP.ADD_PRINT_LINE(158, 16, 159, 145, 0, 1)
      LODOP.ADD_PRINT_LINE(66, 113, 180, 114, 0, 1)
      LODOP.ADD_PRINT_TEXT(72, 42, 61, 20, '菜品名称')
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.ADD_PRINT_TEXT(72, 116, 37, 20, '数量')
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)

      LODOP.ADD_PRINT_LINE(89, 154, 90, 282, 0, 1)
      LODOP.ADD_PRINT_LINE(112, 155, 113, 283, 0, 1)
      LODOP.ADD_PRINT_LINE(135, 155, 136, 283, 0, 1)
      LODOP.ADD_PRINT_LINE(158, 155, 159, 283, 0, 1)
      LODOP.ADD_PRINT_LINE(66, 251, 180, 252, 0, 1)
      LODOP.ADD_PRINT_TEXT(71, 179, 61, 20, '菜品名称')
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.ADD_PRINT_TEXT(72, 253, 37, 20, '数量')
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)

      LODOP.ADD_PRINT_TEXT(188, 16, 77, 20, '温馨提示：')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)
      LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      LODOP.ADD_PRINT_TEXT(188, 75, 222, 30, '0-8℃冷藏保存，食用时建议微波炉加热，3-4盒加热2分钟，5-6盒加热2分30秒')
      LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8)

      // 菜品打印的位置
      const seat = [
        {
          top: 94, left: 12, ntop: 94, nleft: 112
        },
        {
          top: 117, left: 12, ntop: 117, nleft: 112
        },
        {
          top: 140, left: 12, ntop: 140, nleft: 112
        },
        {
          top: 163, left: 12, ntop: 160, nleft: 112
        },
        {
          top: 94, left: 151, ntop: 94, nleft: 249
        },
        {
          top: 117, left: 151, ntop: 117, nleft: 249
        },
        {
          top: 140, left: 151, ntop: 140, nleft: 249
        },
        {
          top: 163, left: 151, ntop: 163, nleft: 249
        }
      ]
      for (const i in category[1]) {
        LODOP.ADD_PRINT_TEXT(seat[i].top, seat[i].left, 113, 20, category[1][i].skuname)
        LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
        LODOP.ADD_PRINT_TEXT(seat[i].ntop, seat[i].nleft, 37, 20, category[1][i].num)
        LODOP.SET_PRINT_STYLEA(0, 'Alignment', 2)
        LODOP.SET_PRINT_STYLEA(0, 'Bold', 1)
      }

      // LODOP.PRINT_DESIGN();
      LODOP.PRINT()
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 8px;
}
#container {
  min-width: 600px;
  min-height: 767px;
}
:deep(.el-table .cell) {
  text-align: center !important;
  white-space: pre-line !important; /*保留换行符*/
}
</style>
