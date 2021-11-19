<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :label-width="100"
        :span="4"
        semi
      >
        <template #action>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
      <el-button style="float: right" type="primary" @click="goDetail('edit', '')">新建活动</el-button>
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
                style="margin-right: 8px"
                @click="goDetail('edit', row)"
              >编辑</span>
              <span class="brand-color cursor-pointer action-label" @click="detailClick(row)">详情</span>
            </div>
            <div>
              <el-popover v-if="row.activityAddres" trigger="click" placement="bottom">
                <template #reference>
                  <el-tag class="cursor-pointer" style="margin-right: 8px">链接</el-tag>
                </template>
                <span>{{ row.activityAddres }}</span>
              </el-popover>
              <el-popover v-if="row.activityQrcode" trigger="click" placement="bottom">
                <template #reference>
                  <el-tag class="cursor-pointer" type="success">二维码</el-tag>
                </template>
                <el-image class="qrcode" :src="row.activityQrcode"></el-image>
              </el-popover>
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
  name: 'marketing_coupon_link-dispatch-coupon',
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
          width: 50
        },
        {
          label: '发券活动ID',
          prop: 'activityShowId'
        },
        {
          label: '活动名称',
          prop: 'activityName'
        },
        {
          label: '发券张数',
          prop: 'couponNum'
        },
        {
          label: '发券时间',
          prop: 'activityDate'
        },
        {
          label: '领券数',
          prop: 'getCouponNum'
        },
        {
          label: '领取人数',
          prop: 'getNum'
        },
        {
          label: '备注',
          prop: 'remark'
        },
        {
          label: '创建人姓名',
          prop: 'creator'
        },
        {
          label: '创建人手机',
          prop: 'cphone'
        },
        {
          label: '创建时间',
          prop: 'ctime'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        creator: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '发券时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'creator',
          label: '创建人',
          placeholder: '请输入创建人',
          props: {
            clearable: true
          },
          maxlength: 30
        }
      ]
    }
  },
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
      const res = await this.$http('coupon.Hotlist/getLinkSendCoupon', params)
      if (!res.errMsg) {
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
        this.$nt(() => {
          this.$refs.table.doLayout()
        })
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.page,
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal
      }
      this.$store.state.bloading = true
      const res = await this.$http('coupon.Hotlist/getConfSendCoupon', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      })
    },
    goDetail(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.activityId
        }
      })
    },
    detailClick(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.activityId
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

.qrcode {
  width: 148px;
  height: 148px;
}
</style>
