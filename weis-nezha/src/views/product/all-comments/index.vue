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
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column v-for="col in columns" :key="col.label" v-bind="col">
          <template v-if="col.label === '图片' || col.label === '描述'" #default="{ row }">
            <div v-if="col.label === '图片' && row.img">
              <el-image
                v-for="(img,index) in row.img"
                :key="index"
                :src="img"
                :preview-src-list="row.img"
                style="max-height: 50px; max-width: 50px"
              />
            </div>
            <el-tooltip v-if="col.label === '描述'" :content="row.econtent">
              <span>{{ row.econtent.length > 10 ? `${row.econtent.slice(0, 10)}...` : row.econtent }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import exportExcel from '@/utils/export-excel'
export default defineComponent({
  name: 'product_all-comments',
  data() {
    return {
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      columns: [
        {
          type: 'index',
          label: '序号'
        },
        {
          label: '创建时间',
          prop: 'ctime'
        },
        {
          label: '类型',
          prop: 'typeStr'
        },
        {
          label: '加热点',
          prop: 'thpName'
        },
        {
          label: '配送单',
          prop: 'shipOid'
        },
        {
          label: '餐单',
          prop: 'orderOid'
        },
        {
          label: '菜品编码',
          prop: 'skuNo'
        },
        {
          label: '菜品名称',
          prop: 'skuName'
        },
        {
          label: '规格',
          prop: 'spec'
        },
        {
          label: '昵称',
          prop: 'uname'
        },
        {
          label: '手机号码',
          prop: 'uphone'
        },
        {
          label: '评价（满5星）',
          prop: 'evaluate'
        },
        // {
        //   label: '口味（满10分）',
        //   prop: 'ctime'
        // },
        // {
        //   label: '包装（满10分）',
        //   prop: 'ctime'
        // },
        {
          label: '描述',
          prop: 'econtent'
        },
        {
          label: '图片',
          prop: 'imgStr'
        }
      ],
      typeOptions: [
        {
          label: '菜品评价',
          value: '01'
        },
        {
          label: '配送评价',
          value: '02'
        },
        {
          label: '意见反馈',
          value: '03'
        },
        {
          label: '申请售后',
          value: '04'
        }
      ],
      queryParams: {
        uphone: '',
        type: '',
        date: [],
        econtent: '',
        startCtime: '', //开始时间 yyyy-mm-dd
        endCtime: '' //结束时间 yyyy-mm-dd
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '创建日期',
          props: {
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            type: 'daterange',
            clearable: true
          },
          listeners: {
            change: (value: Date[]) => {
              const queryParams = this.queryParams as Record<string, any>
              queryParams.startCtime = this.$day(value[0]).format('YYYY-MM-DD')
              queryParams.endCtime = this.$day(value[1]).format('YYYY-MM-DD')
            }
          }
        },
        {
          component: 'BaseSelect',
          key: 'type',
          label: '类型',
          props: {
            options: [
              {
                label: '菜品评价',
                value: '01'
              },
              {
                label: '配送评价',
                value: '02'
              },
              {
                label: '意见反馈',
                value: '03'
              },
              {
                label: '申请售后',
                value: '04'
              }
            ],
            clearable: true
          }
        },
        {
          component: 'el-input',
          key: 'uphone',
          label: '手机号码',
          placeholder: '请输入手机号',
          props: {
            clearable: true
          }
        },
        {
          component: 'el-input',
          key: 'econtent',
          label: '描述',
          placeholder: '请输入描述',
          props: {
            clearable: true
          }
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getEvaluateConformity(page: { pageNo: number, pageSize: number }) {
      return this.$request('OrderEvaluate/getEvaluateConformity', {
        ...page,
        ...this.queryParams
      })
    },
    getList() {
      this.$store.state.vloading = true
      this.getEvaluateConformity(this.page)
        .thenwrap((err, res) => {
          if (!err) {
            this.tableData = res.record
            this.tableDataTotal = res.totalRecordCount
          }

          this.$store.state.vloading = false
        })
    }, 
    async handleExport() {
      this.$store.state.bloading = true
      this.getEvaluateConformity({
        pageNo: 1,
        pageSize: 99999
      }).thenwrap((err, res) => {
        if (!err) {
          exportExcel({
            data: res.record,
            columns: this.columns,
            filename:'全部评价-导出'
          })
        }
      }).finally(() => {
        this.$store.state.bloading = false
      })
    }
  }
})
</script>

<style>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
