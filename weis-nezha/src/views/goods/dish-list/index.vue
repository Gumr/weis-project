<template>
  <div class="page-container">
    <!-- <div style="margin-top: 20px;">
      <ButtonTabs v-model="activeTab" :tabs="dishStatusTabs" @change="changes" />
    </div> -->
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="6"
        :label-width="70"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button
          >
        </template>
      </QueryComponents>
      <!-- <el-button class="float-right" type="primary" @click="goDishPage('create')">新建菜品</el-button> -->
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
        @current-page-change="getOrderList"
        @size-change="getOrderList"
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="菜品编码" prop="tfsCid"></el-table-column>
        <el-table-column
          label="菜品名称"
          prop="tfsSuggestedSkuname"
        ></el-table-column>
        <el-table-column label="菜品规格">
          <template #default="{ row }"
            >{{ row.tfsQuality }}{{ row.tfsUnit }}</template
          >
        </el-table-column>
        <el-table-column label="菜品能量" prop="tfsEnergy"></el-table-column>
        <el-table-column
          label="建议餐别分类"
          prop="tfsCategory"
        ></el-table-column>
        <el-table-column label="当前版本号" prop="tfsVersion"></el-table-column>
        <el-table-column label="提交人" prop="tfsOperator"></el-table-column>
        <el-table-column label="提交时间" prop="utime"></el-table-column>
        <el-table-column label="状态" prop="tfsSttStr"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="goDishPage('edit', row)"
              >编辑</span
            >
            <span class="brand-color cursor-pointer" @click="goDetai(row)"
              >详情</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import ButtonTabs from '@/components/ButtonTabs.vue'
// import { mapToOptions } from '@/utils/data-map';
import exportExcel from '@/utils/export-excel'
import { transformDaterange } from '@/utils/transform'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'goods_dish-list',
  components: {
    BasePageTable,
    ButtonTabs,
  },
  data() {
    return {
      height: window.innerHeight - 330,
      loading: false,
      tableData: [],
      activeTab: '-1',
      dishStatusTabs: [
        {
          label: '已提交',
          value: -1,
        },
        {
          label: '草稿箱',
          value: 10,
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      queryParams: {
        date: [],
        skuName: '',
        tfsstt: '-1',
        libraryStt: '30',
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
          },
        },
        {
          component: 'el-input',
          key: 'skuName',
          label: '菜品名称',
          placeholder: '请输入菜品名称',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'tfsstt',
          label: '状态',
          placeholder: '请选择状态',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '-1' },
              { label: '预上架', value: '50' },
              { label: '已上架', value: '60' },
              { label: '已下架', value: '70' },
            ],
          },
        },
      ],
    }
  },
  watch: {
    $route() {
      if (this.$mounted) {
        this.getOrderList()
      }
    },
  },
  mounted() {
    this.$mounted = true
    this.getOrderList()
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1
      this.getOrderList()
    },
    changes() {
      this.page.pageNo = 1
      this.queryParams.tfsStt = this.activeTab
      if (this.activeTab == -1) {
        this.queryComps[2] = {
          component: 'BaseSelect',
          key: 'tfsstt',
          label: '状态',
          placeholder: '请选择状态',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '-1' },
              { label: '预上架', value: '50' },
              { label: '已上架', value: '60' },
              { label: '已下架', value: '70' },
            ],
          },
        }
      } else {
        this.queryComps[2] = {}
      }
      this.queryComps.push({})
      this.queryComps.pop()
      this.getOrderList()
    },
    goDishPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          tfsId: type == 'create' ? null : row.tfsId,
        },
      })
    },
    goDetai(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          tfsId: row.tfsId,
          tfsCid: row.tfsCid,
          tfsVersion: row.tfsVersion,
        },
      })
    },
    getOrderList() {
      this.$store.state.vloading = true
      this.$request('Sku/querySkuList', {
        ...this.page,
        ...this.genQueryParams(),
      }).then(
        this.$rw((err, { dataPage }) => {
          this.$store.state.vloading = false
          if (!err) {
            this.tableDataTotal = dataPage.totalRecordCount
            this.tableData = dataPage.record
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
        params.startDate = +startDate
        params.endDate = +endDate
      }
      delete params.date
      return params
    },
    handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const col = [
        { type: 'index', label: '序号' },
        { label: '菜品编码', prop: 'tfsCid' },
        { label: '菜品名称', prop: 'tfsSuggestedSkuname' },
        {
          label: '菜品规格',
          prop: 'parentPhone',
          formatter: (row) => `${row.tfsQuality}/${row.tfsUnit}`,
        },
        { label: '菜品能量', prop: 'tfsEnergy' },
        { label: '建议餐别分类', prop: 'tfsCategory' },
        { label: '当前版本号', prop: 'tfsVersion' },
        { label: '提交人', prop: 'tfsOperator' },
        { label: '提交时间', prop: 'utime' },
        { label: '状态', prop: 'tfsSttStr' },
      ]
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: col,
            filename,
            data: res.dataPage.record,
          })
        })
      )
    },
    reqAllUserData() {
      return this.$request('Sku/querySkuList', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      })
    },
  },
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
</style>
