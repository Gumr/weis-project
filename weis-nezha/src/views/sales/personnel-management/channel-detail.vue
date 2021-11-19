<template>
  <div class="page-container">
    <ReturnButton />
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="120"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">添加渠道码</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">编辑</span>
            <span class="brand-color cursor-pointer action-label" @click="detailClick(row)">详情</span>
            <!-- <span class="brand-color cursor-pointer action-label" @click="toDel(row)">删除</span> -->
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog v-model="detailDialogVisible">
      <div>
        <div class="section-item">
          <span class="section-label label-1">渠道码ID：</span>
          <span>{{ currentTag.tprcPageId }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>渠道码名称：
          </span>
          <span>{{ currentTag.tprcName }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">关联客户经理：</span>
          <BaseSelect
            v-model="currentTag.tcaId"
            disabled
            class="medium-input"
            :options="options"
            clearable
            filterable
          ></BaseSelect>
        </div>
        <div class="section-item">
          <span class="section-label label-1">当前拓展人数：</span>
          <span>{{ currentTag.customerCount }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">当前总业绩：</span>
          <span>{{ currentTag.totalPerfor }}</span>
        </div>
        <!-- <div class="section-item">
          <span class="section-label label-1">当前点餐业绩：</span>
          <span>{{ currentTag.consumePerfor }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">当前充值业绩：</span>
          <span>{{ currentTag.rechargePerfor }}</span>
        </div> -->
        <div class="section-item">
          <span class="section-label label-1">渠道码：</span>
          <div class="qrcode">
            <img :src="currentTag.qrCodeUrl" />
            <span>渠道码（{{ currentTag.qrCode }}）</span>
          </div>
        </div>
        <div class="section-item">
          <HelperTable :data="currentTag.helperList" />
        </div>
      </div>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="title"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div v-if="title != '添加渠道码'" class="section-item">
          <span class="section-label label-1">渠道码ID：</span>
          <span>{{ currentTag.tprcPageId }}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>渠道码名称：
          </span>
          <el-input v-model="currentTag.tprcName" clearable class="medium-input"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">关联客户经理：</span>
          <BaseSelect
            v-model="currentTag.tcaId"
            class="medium-input"
            :options="options"
            clearable
            filterable
          ></BaseSelect>
        </div>
        <div v-if="title != '添加渠道码'" class="section-item">
          <span class="section-label label-1">当前拓展人数：</span>
          <span>{{ currentTag.customerCount }}</span>
        </div>
        <div v-if="title != '添加渠道码'" class="section-item">
          <span class="section-label label-1">当前总业绩：</span>
          <span>{{ currentTag.totalPerfor }}</span>
        </div>
        <div v-if="title != '添加渠道码'" class="section-item">
          <span class="section-label label-1">当前点餐业绩：</span>
          <span>{{ currentTag.consumePerfor }}</span>
        </div>
        <div v-if="title != '添加渠道码'" class="section-item">
          <span class="section-label label-1">当前充值业绩：</span>
          <span>{{ currentTag.rechargePerfor }}</span>
        </div>
        <div v-if="title != '添加渠道码'" class="section-item">
          <span class="section-label label-1">渠道码：</span>
          <div class="qrlist">
            <div class="qrcode">
              <img :src="currentTag.qrCodeUrl" />
              <span>渠道码</span>
            </div>
          </div>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ReturnButton from '@/components/ReturnButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { requestFactor } from '@/utils/request'
import HelperTable from '@/views/sales/components/HelperTable'
const { request: req } = requestFactor('sale.SaleEmployee')

export default {
  name: 'sales_personnel-management_channel-detail',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ReturnButton,
    HelperTable,
    BaseSelect
  },
  data() {
    return {
      height: window.innerHeight - 330,
      detailDialogVisible: false,
      editDialogVisible: false,
      title: '',
      options: [],
      currentTag: {
        tprcName: '',
        tprcPhone: '',
        tcaId: ''
      },
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '渠道码名称',
          prop: 'tprcName'
        },
        {
          label: '渠道码',
          prop: 'qrCode'
        },
        {
          label: '拓客数',
          prop: 'customerCount'
        },
        {
          label: '总业绩',
          prop: 'totalPerfor'
        },
        {
          label: '关联饮食顾问',
          prop: 'tcaName'
        },
        {
          label: '创建时间',
          prop: 'ctime'
        },
        {
          label: '创建人',
          prop: 'creator'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        tseId: '',
        name: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'name',
          label: '渠道码名称',
          placeholder: '渠道码名称',
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
    this.getManager()
    this.queryParams.tseId = this.$route.query.id || ''
    this.getList()
  },
  methods: {
    async getManager() {
      const params = {
        openMarket: '10'
      }
      const res = await this.$http('partner.Channel/queryCounselorList', params)
      if (!res.errMsg) {
        this.options = res.obj.map(val => ({ label: `${val.counselorName} ${val.counselorPhone}`, value: val.id }))
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      // this.$store.state.vloading = true;
      const res = (await req('queryChannelQrcodePage', params)).data
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
      const res = (await req('queryChannelQrcodePage', params)).data
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      })
      this.$store.state.bloading = false
    },
    toCreate() {
      this.title = '添加渠道码'
      this.currentTag = {
        tprcName: '',
        tprcPhone: '',
        tcaId: ''
      }
      this.editDialogVisible = true
    },

    async detailClick(row) {
      this.detailDialogVisible = true
      const res = await this.$http('partner.Channel/queryChannelRepresentInfo', { tprcId: row.tprcId })
      Object.assign(this.currentTag, res.obj)
    },
    async toEdit(row) {
      this.editDialogVisible = true
      const res = await this.$http('partner.Channel/queryChannelRepresentInfo', { tprcId: row.tprcId })
      this.title = `${res.obj.tprcName}的详情`
      Object.assign(this.currentTag, res.obj)
      this.currentTag.tcaId = this.currentRow.tcaId == '0' ? '' : this.currentRow.tcaId
      const item = this.options.find(val => val.value == this.currentTag.tcaId)
      this.currentTag.tcaId = item ? this.currentTag.tcaId : ''
    },
    async toDel(row) {
      this.$confirm('确定删除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('FoodUnit/deleteUnit', { tfsId: row.tfsId })
        if (!res.errMsg) {
          this.$msg('操作成功', 'success')
          this.getList()
        } else {
          this.$msg(res.errMsg, 'error')
        }
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
    async tagConfirm(done) {
      if (!this.currentTag.tprcName) {
        this.$msg('请输入渠道码', 'error')
        done()
        return
      }
      const params = this.$deepClone(this.currentTag)
      params.tseId = this.$route.query.id
      const res = (await req('editChannelQrcode', params)).data
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.editDialogVisible = false
        this.getList()
        setTimeout(done(), 800)
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.page-container {
  padding-top: 20px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 10px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 30px;
    line-height: 5px;
  }
  .qrlist {
    width: 700px;
    display: flex;
    flex-wrap: wrap;
  }
  .qrcode {
    width: 200px;
    height: 250px;
    display: flex;
    flex-wrap: wrap;
    margin-right: 10px;
    img {
      width: 200px;
      height: 200px;
    }
    span {
      width: 100%;
      text-align: center;
    }
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
