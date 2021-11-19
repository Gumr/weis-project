<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
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
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
      <el-button type="danger" @click="goDetail('edit', '')">新建企业</el-button>
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
            <div>
              <span
                class="brand-color cursor-pointer action-label"
                @click="goDetail('edit', row)"
              >编辑</span>
            </div>
            <div>
              <span
                v-if="row.tgcStt == '00'"
                class="brand-color cursor-pointer action-label"
                @click="goOperate('close', row)"
              >上线</span>
            </div>
            <div>
              <span
                v-if="row.tgcStt == '01'"
                class="brand-color cursor-pointer action-label"
                @click="goOperate('open', row)"
              >下线</span>
            </div>
            <div>
              <span
                class="brand-color cursor-pointer action-label"
                @click="goOperate('del', row)"
              >删除</span>
            </div>
            <div>
              <span
                class="brand-color cursor-pointer action-label"
                @click="goDetail('detail', row)"
              >详情</span>
            </div>
            <div>
              <span
                v-if="row.tgcType === '00'"
                class="brand-color cursor-pointer action-label"
                @click="resetPasswordClick(row)"
              >重置密码</span>
            </div>
          </template>
        </el-table-column>
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
  name: 'sales_fast-foods_company',
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '企业ID',
          prop: 'tgcId'
        },
        {
          label: '企业名称',
          prop: 'tgcName'
        },
        {
          label: '合作类型',
          prop: 'tgcTypeDesc'
        },
        {
          label: '企业类型',
          prop: 'tgcAreaTypeDesc'
        },
        {
          label: '当前折扣',
          prop: 'tgcEmpDiscount'
        },
        // {
        //   label: '企业负责人名称',
        //   prop: 'tgcLeaderName'
        // },
        // {
        //   label: '负责人电话',
        //   prop: 'tgcLeaderPhone'
        // },
        {
          label: '承包人',
          prop: 'tgcPartnerName'
        },
        {
          label: '承包人比例',
          prop: 'tgcProfitRatio',
          formatter: (row) => `${row.tgcProfitRatio || 0}%`
        },
        {
          label: '企业接口人',
          prop: 'tgcWeisName'
        },
        {
          label: '企业接口人电话',
          prop: 'tgcWeisPhone'
        },
        { label: '创建时间',
          prop:'tgcCtime'
        },
        {
          label: '当前状态',
          prop: 'tgcSttDesc'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        stt: '',
        leaderPhone: '',
        tgcAreaType: '',
        name: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'name',
          label: '企业名称',
          placeholder: '请输入企业名称',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'el-input',
          key: 'leaderPhone',
          label: '手机',
          placeholder: '请输入负责人手机',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '企业状态',
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
          key: 'tgcAreaType',
          label: '企业类型',
          placeholder: '请选择类型',
          props: {
            clearable: true,
            options: [
              { label: '企业专区', value: '00' },
              { label: '幼托(2-6)岁', value: '01' }
            ]
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
  // watch: {
  //   $route(to, from) {
  //     this.getList();
  //   }
  // },
  activated() {
    this.getList()
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('groupmeal.Corp/queryList', params)
      if (!res.errMsg) {
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
        this.$nt(() => {
          this.$refs.table && this.$refs.table.doLayout()
        })
      }
    },
    resetPasswordClick(row) {
      this.$messageBox.confirm('是否重置该企业接口人密码?', '提示')
        .then(() => {
          this.$request('groupmeal.Corp/restCorpEmpPwd', {
            corpId: row.tgcId
          }).thenwrap((err) => {
            if (!err) {
              this.$message.success('重置密码成功')
            } else {
              this.$message.error(err.errMsg)
            }
          })
        })
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
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('groupmeal.Corp/queryList', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      })
    },
    async goOperate(type, row) {
      const url = {
        close: 'groupmeal.Corp/updateCorpState',
        open: 'groupmeal.Corp/updateCorpState',
        del: 'groupmeal.Corp/deleteCorp'
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
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tgcId,
          // tgcType:row.tgcType
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
  margin-right: 10px;
}
</style>
