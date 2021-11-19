<template>
  <div class="page-container">
    <QueryComponents
      v-model="tableQuery"
      style="margin: 20px 0;"
      :query-list="queryComps"
      :span="6"
      :label-width="100"
      :action="false"
      semi
    >
      <template #search>
        <el-button type="primary" @click="searchClick">搜索</el-button>
      </template>
      <template #create>
        <div style="text-align: right;">
          <!-- <el-button @click="$pushRoute('create')">添加券模板</el-button> -->
          <el-button type="warning" @click="toPage()">添加券模板</el-button>
        </div>
      </template>
    </QueryComponents>
    <BasePageTable
      ref="table"
      v-model:current-page="table.page.pageNo"
      v-model:page-size="table.page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
    >
      <el-table-column v-for="col in table.col" v-bind="col" :key="col.prop"></el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <span class="action-label cursor-pointer" @click="editPrizeClick(row.tcsId)">编辑</span>
          <span
            class="action-label cursor-pointer"
            @click="changePrizeStatusClick(row)"
          >{{ row.tcsStt === "上线" ? "下线" : "上线" }}</span>
          <span class="action-label cursor-pointer" @click="deletePrizeClick(row.tcsId)">删除</span>
          <span class="action-label cursor-pointer" @click="prizeDetailClick(row.tcsId)">详情</span>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'

export default {
  components: {
    QueryComponents,
    BasePageTable
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableQuery: {
        couponname: '',
        type: undefined
      },
      table: {
        data: [],
        col: [
          {
            label: '序号',
            type: 'index',
            width: 80
          },
          {
            label: '券模板ID',
            prop: 'tcsKid'
          },
          {
            label: '券模板类型',
            prop: 'tcsType'
          },
          {
            label: '券使用类型',
            prop: 'tcsUseType'
          },
          {
            label: '券模板名称',
            prop: 'tcsName'
          },
          {
            label: '面额',
            prop: 'tcsAmount'
          },
          {
            label: '使用金额门槛',
            prop: 'tcsRestrictAmount'
          },
          {
            label: '指定菜品',
            prop: 'skuName'
          },
          {
              label: '适用点餐门槛',
              prop:'tcsOrderThreshold',
              formatter: row => row.tcsOrderThreshold == '00' ?'无门槛':'预定单使用'
              

          },
          {
            label: '有效期',
            prop: 'tcsPeriodValid'
          },
          {
            label: '简介',
            prop: 'tcsIntro',
            formatter: row => row.tcsIntro ? (row.tcsIntro.length > 30 ? row.tcsIntro.substring(0, 30) + '...' : row.tcsIntro) : '无'
          },
          {
            label: '当前状态',
            prop: 'tcsStt'
          },
          {
            label: '最后编辑人',
            prop: 'tcsUtime'
          },
          {
            label: '最后编辑时间',
            prop: 'tcsUtime'
          }
        ],
        total: 0,
        page: {
          pageNo: 1,
          pageSize: 10
        }
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'type',
          label: '当前状态',
          props: {
            options: []
          }
        },
        {
          label: '券模板名称',
          component: 'el-input',
          key: 'couponname',
          placeholder: '券模板名称',
          props: {
            clearable: true
          }
        },
        {
          slot: 'search'
        },
        {
          slot: 'create'
        }
      ]
    }
  },
  created() {
    this.getStatusOptions()
    this.getTableData()
  },
  methods: {
    searchClick() {
      this.table.page.pageNo = 1
      this.getTableData()
    },
    getTableData() {
      const handler = (err, data) => {
        this.$store.state.vloading = false
        if (!err) {
          this.table.data = data.record
          this.table.total = data.totalRecordCount
        }
      }
      this.$store.state.vloading = true
      this.$request('coupon.Coupon/getCouponAll', {
        ...this.table.page,
        ...this.tableQuery
      }).then(this.$rw(handler))
    },
    toPage(id) {
      this.$pushRoute('edit', {
        query: {
          id
        }
      })
    },
    editPrizeClick(id) {
      this.$pushRoute('edit', {
        query: {
          id
        }
      })
    },
    getStatusOptions() {
      this.$request('coupon.Coupon/getStateInfo', {})
        .then(this.$rw((err, data) => {
          if (!err) {
            this.queryComps[0].props.options = [{ value: undefined, label: '全部状态' }, ...data.couponstt]
          }
        }))
    },
    changePrizeStatusClick(prize) {
      const url = prize.tcsStt === '上线'
        ? 'coupon.Coupon/couponClose'
        : 'coupon.Coupon/couponOpen'

      this.$request(url, {
        tcsId: prize.tcsId
      }).then(this.$rw((err) => {
        if (!err) {
          this.$message({
            type: 'success',
            message: '修改状态成功'
          })

          this.getTableData()
        }

        this.$errorNotify(err)
      }))
    },
    deletePrizeClick(tcsId) {
      this.$request('coupon.Coupon/couponDel', { tcsId })
        .then(this.$rw((err) => {
          if (!err) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })

            this.getTableData()
          }
          this.$errorNotify(err)
        }))
    },
    prizeDetailClick(id) {
      this.$pushRoute('detail', {
        query: {
          id
        }
      })
    }
  }
}

</script>

<style lang="less" scoped>
@import "../../../../styles/base.less";

.action-label {
  color: @brand-color;
  display: inline-block;
  margin-left: 8px;
}
</style>
