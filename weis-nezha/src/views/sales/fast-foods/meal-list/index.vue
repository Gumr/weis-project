<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="7"
        :label-width="70"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
      <div class="flex-items-center">
        <el-button type="primary" @click="batchDeleteClick">批量删除</el-button>
        <ImportExcel @file="handleBatchImport">
          <el-button style="margin: 0 8px;" type="primary">批量导入</el-button>
        </ImportExcel>
        <el-button style="margin-right: 8px;" type="danger" @click="toCreate('edit', '')">新建套餐</el-button>
        <span class="table-action-label" @click="downloadTemplateClick">下载导入模板</span>
      </div>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:selection="tableSelection"
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
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goPage('edit', row)"
            >编辑</span>
            <span
              v-if="row.tgcStt == '01'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toOperate('close', row)"
            >下线</span>
            <span
              v-if="row.tgcStt == '00'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toOperate('open', row)"
            >上线</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="toOperate('del', row)"
            >删除</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 10px"
              @click="goPage('detail', row)"
            >详情</span>
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
import exportExcel from '@/utils/export-excel'
import { getSetMealTypeOptions } from '@/utils/data-getter'
// import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImportExcel from '@/components/ImportExcel.vue'
// import FormItem from '@/components/FormItem.vue'
import axios from 'axios'
export default {
  name: 'goods_fast-foods_meal-list',
  components: {
    QueryComponents,
    // ConfirmDialog,
    ImportExcel,
    // FormItem,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        stt: '',
        name: '',
        tgccId: '',
        skuName:''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'name',
          label: '套餐名称',
          placeholder: '请输入套餐名称',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '套餐状态',
          placeholder: '请选择状态',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '上线', value: '01' },
              { label: '下线', value: '00' }
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'tgccId',
          label: '套餐类型',
          placeholder: '请选择套餐类型',
          props: {
            props: { label: 'tgccName', value: 'tgccId' },
            clearable: true,
            options: []
          }
        },
          {
          component: 'el-input',
          key: 'skuName',
          label: '菜品名称',
          placeholder: '请输入菜品名称',
          props: {
            clearable: true
          }
        },
      ],
      tableSelection: [],
      tableCol: [
        { type: 'selection', width: '60' },
        { label: '序号', type: 'index', width: '80' },
        { label: '套餐ID', prop: 'tgcPageId' },
        { label: '套餐名称', prop: 'tgcName' },
        { label: '套餐内容', prop: 'tgcContent' },
        { label: '套餐类型', prop: 'tgcCategory' },
        { label: '商品合计价格', prop: 'tgcTotalAmount' },
        { label: '套餐价格', prop: 'tgcAmount' },
        { label: '当前状态', prop: 'tgcSttDesc' }
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
    this.queryParams.skuName= this.$route.query.skuName?this.$route.query.skuName:''
    this.getList()
    this.queryComboCategoryList()
  },
  methods: {
    downloadTemplateClick() {
      exportExcel({
        data: [],
        columns: [
          {
            type: '售卖时间',
            label: '售卖时间'
          },
          {
            prop: '套餐名称',
            label: '套餐名称'
          },
          {
            prop: '套餐内容',
            label: '套餐内容'
          },
          {
            prop: '套餐类别',
            label: '套餐类别'
          },
          {
            prop: '适用人群',
            label: '适用人群'
          }
        ],
        filename: '套餐导入模板'
      })
    },
    async batchDeleteClick() {
      const { tableSelection } = this
      if (tableSelection.length <= 0) {
        this.$message.error('请选择至少一条套餐数据')
        return
      }

      await this.$messageBox.confirm(`是否删除这${tableSelection.length}条套餐数据？`, '提示')

      this.$request('groupmeal.Combo/batchDeleteCombo', {
        tgcIds: tableSelection.map(({ tgcId }) => tgcId)
      }).thenwrap((err) => {
        if (!err) {
          this.$message.success('删除成功')
          this.getList()
        } else {
          this.$message.error(err.errMsg)
        }
      })
    },
    handleBatchImport(data) {
      const formData = new FormData()
      formData.append('file', data)
      axios.post('/import/excel/cn.nezha.impl.groupmeal.ComboImpl/corpComboImport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: sessionStorage.getItem('token')
        }
      }).thenwrap((err) => {
        if (!err) {
          this.getList()
          this.$message.success('导入成功')
        } else {
          this.$message.error(err.errMsg)
        }
      })
      // console.log(data)
    },
    batchImportClick() {
      this.batchDialog = true
    },
    queryComboCategoryList() {
      getSetMealTypeOptions()
        .then(data => {
          const item = this.queryComps.find(item => item.label === '套餐类型')
          if (item) {
            item.props.options = data
          }
        })
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    toCreate() {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {}
      })
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          tgcId: row.tgcId
        }
      })
    },
    async toOperate(type, row) {
      let url = {
        close: 'groupmeal.Combo/updateComboState',
        open: 'groupmeal.Combo/updateComboState',
        del: 'groupmeal.Combo/deleteCombo'
      }[type]
      const params = { tgcId: row.tgcId }
      if (type == 'close' || type == 'open') {
        params.opType = row.tgcStt == '00' ? '01' : '00'
      }
      const res = await this.$http(url, params)
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('groupmeal.Combo/queryList', params)
      if (!res.errMsg) {
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
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
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('groupmeal.Combo/queryList', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
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

.section-item {
  min-width: 200px;
  margin-right: 20px;
}
.detail-footer {
  text-align: center;
}

.vertical-top {
  vertical-align: top;
}

.section-label {
  display: inline-block;
  min-width: 50px;
  text-align: left;
}

.detail-section {
  margin: 22px 0 22px 0;
}

.flex-grow-1 {
  flex-basis: 25%;
}

.card-image-box {
  margin: 0 0 8px 12px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  display: inline-block;

  .certificate-img {
    max-width: 320px;
    max-height: 160px;
  }
}

.qrcode-image {
  max-width: 200px;
  max-height: 200px;
}

.phone-image {
  margin: 0 8px;
  max-width: 200px;
  max-height: 200px;
}
.count-label {
  margin-left: 20px;
}
.display-flex {
  padding: 0;
}
</style>
