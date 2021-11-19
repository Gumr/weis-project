<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="7"
        :label-width="80"
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
        </template>
      </QueryComponents>
      <el-button type="primary" @click="addtype('add')">添加合伙人</el-button>
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
        <el-table-column label="操作" align="center" width="180">
          <template #default="{ row }" class="action-cell">
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="addtype(row)"
            >编辑</span>
            <span
              v-if="row.tpiStatus === '20'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="updateTag(row.tpiId, '10')"
            >启用</span>
            <span
              v-if="row.tpiStatus === '10'"
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="updateTag(row.tpiId, '20')"
            >禁用</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right: 8px;"
              @click="goDetail(row)"
            >详情</span>
            <!-- <span class="brand-color cursor-pointer action-label" style="margin-right: 8px;" @click="del(row)">删除</span> -->
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      title="合伙人"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <el-form :model="currentTag" label-width="200px">
        <el-form-item label="合伙人等级">
          <BaseSelect
            v-model="currentTag.tpiType"
            class="small-input"
            :disabled="isEdit"
            :options="partnerLevel"
          ></BaseSelect>
        </el-form-item>
        <el-form-item v-if="currentTag.tpiType == '20'" label="上级合伙人">
          <BaseSelect
            v-model="currentTag.tpiLeaderPid"
            class="small-input"
            :options="partnerLeader"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="合伙人姓名">
          <el-input v-model="currentTag.tpiName" class="small-input" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="合伙人手机">
          <el-input v-model="currentTag.tpiPhone" class="small-input" maxlength="11"></el-input>
        </el-form-item>
        <el-form-item label="合伙人提成点">
          <el-input
            v-model="currentTag.tpiProfitRatio"
            class="small-input"
            @blur="checkText('tpiProfitRatio')"
          ></el-input>%
        </el-form-item>
        <el-form-item v-if="currentTag.tpiType == '20'" label="上级合伙人提成">
          <el-input
            v-model="currentTag.tpiLeaderRatio"
            class="small-input"
            @blur="checkText('tpiLeaderRatio')"
          ></el-input>%
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import exportExcel from '@/utils/export-excel'

export default {
  name: 'sales_fast-foods_partner-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    BaseSelect,
    ImageUpload
  },
  data() {
    return {
      height: window.innerHeight - 280,
      isEdit: false,
      tclCid: '',
      currentTag: {
        tpiType: '',
        tpiLeaderPid: '',
        tpiName: '',
        tpiPhone: '',
        tpiProfitRatio: '',
        tpiLeaderRatio: ''
      },
      editDialogVisible: false,
      partnerLevel: [
        { label: '一级', value: '10' },
        { label: '二级', value: '20' }
      ],
      partnerLeader: [],
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: 50
        },
        {
          label: '合伙人ID',
          prop: 'tpiId'
        },
        {
          label: '合伙人姓名',
          prop: 'tpiName'
        },
        {
          label: '合伙人电话',
          prop: 'tpiPhone'
        },
        {
          label: '合伙人提成比',
          prop: 'tpiProfitRatio',
          formatter: row => `${row.tpiProfitRatio}%`
        },
        {
          label: '合伙人级别',
          prop: 'tpiTypeStr'
        },
        {
          label: '当前合伙渠道数',
          prop: 'custNum'
        },
        {
          label: '当前状态',
          prop: 'tpiStatusName'
        },
        {
          label: '创建人',
          prop: 'tpiCreatorName'
        },
        {
          label: '创建时间',
          prop: 'tpiCtimeStr'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        date: [],
        phone: '',
        status: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '创建日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          label: '合伙人手机',
          key: 'phone',
          maxlength: '30',
          placeholder: '请输入合伙人手机',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '状态',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '启用',
                value: '10'
              },
              {
                label: '禁用',
                value: '20'
              }
            ]
          }
        }
      ]
    }
  },
  computed: {
  },
  watch: {

  },
  created() {
    this.getList()
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    checkText(type) {
      let num = this.currentTag[type]
      num = isNaN(num) ? '' : Number(num).toFixed(2)
      num = num > 100 ? 100 : (num < 0 ? 0 : num)
      this.currentTag[type] = num
    },
    async getList() {
      this.$store.state.vloading = true
      const res = await this.$http('partner.Partner/queryPartnerInfos', { ...this.page, ...this.genQueryParams() })
      this.tableData = res.obj.record
      this.tableDataTotal = res.obj.totalRecordCount
      this.$nt(() => {
        this.$refs.table.doLayout()
      })
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate.valueOf()
        params.endDate = endDate.valueOf()
      }
      delete params.date
      return params
    },
    async addtype(dataList) {
      if (dataList.tpiId) {
        this.isEdit = true
        this.currentTag = { ...dataList }
        this.currentTag.tpiId = dataList.tpiId
        this.currentTag.tpiLeaderRatio = String(this.currentTag.tpiLeaderRatio)
        if (this.currentTag.tpiLeaderRatio === 'undefined') {
          delete this.currentTag.tpiLeaderRatio
        }
      } else {
        this.isEdit = false
        this.currentTag = {
          tpiType: '',
          tpiLeaderPid: '',
          tpiName: '',
          tpiPhone: '',
          tpiProfitRatio: '',
          tpiLeaderRatio: ''
        }
      }
      const res = await this.$request('partner.Partner/queryEnablePartners', { tpiType: '10' })
      this.partnerLeader = res.data.obj.map(item => ({ label: item.tpiName, value: item.tpiId }))
      this.editDialogVisible = true
    },
    async onconfirm(done) {
      if (!this.currentTag.tpiType || this.currentTag.tpiName === '' || this.currentTag.tpiPhone === '' || this.currentTag.tpiProfitRatio === '') {
        this.$message({ type: 'error', message: '合伙人信息不完整!' })
        done()
        return
      }
      const url = 'partner.Partner/addPartnerInfo'
      const res = await this.$http(url, this.currentTag)
      if (res.errMsg) {
        this.$message({ type: 'error', message: res.errMsg })
        done()
      } else {
        this.$message({ type: 'success', message: '操作成功' })
        this.getList()
        this.editDialogVisible = false
        setTimeout(done, 500)
      }
    },
    async del(row) {
      this.$confirm('确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('partner.Partner/deletePartnerInfo', { tpiId: row.tpiId })
        if (res.errMsg) {
          this.$msg(res.errMsg, 'error')
        } else {
          this.$msg('删除成功', 'success')
          this.getList()
        }
      })
    },
    async updateTag(tpiId, tpiStatus) {
      const params = {
        tpiId,
        tpiStatus
      }
      const res = await this.$http('partner.Partner/updatePartnerInfo', params)
      if (res.errMsg) {
        this.$msg(res.errMsg, 'error')
      } else {
        this.$msg('操作成功', 'success')
        this.getList()
      }
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.tpiId
        }
      })
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      this.$store.state.bloading = true
      const res = await this.$http('partner.Partner/queryPartnerInfos', params)
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
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
