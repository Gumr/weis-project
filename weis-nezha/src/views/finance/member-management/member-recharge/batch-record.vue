<template>
  <div class="padding-20">
    <BasePageTable
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :data="table.list"
      :total="table.total"
      @current-page-change="getList"
      @size-change="getList"
    >
      <el-table-column v-for="col in table.columns" v-bind="col" :key="col.label"></el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <span class="table-action-label" @click="detailClick(row)">充值明细</span>
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      table: {
        list: [],
        columns: [
          {
            type: 'index',
            label: '序号'
          },
          {
            prop: 'personNum',
            label: '充值人数'
          },
          {
            prop: 'recharge',
            label: '充值本金'
          },
          {
            prop: 'donation',
            label: '充值赠送金'
          },
          {
            prop: 'total',
            label: '合计'
          },
          {
            prop: 'ctime',
            label: '充值时间'
          },
          {
            prop: 'operator',
            label: '操作人'
          },
          {
            prop: 'remark',
            label: '备注'
          }
        ],
        total: 0
      },
      page: {
        pageNo: 1,
        pageSize: 10
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    detailClick(row: any) {
      this.$router.push({
        path: '/finance/member-management/member-recharge/record-detail',
        query: {
          batchNo: row.batchNo
        }
      })
    },
    getList() {
      this.$request('Member/queryRechargeRecord', this.page)
        .thenwrap((err, data) => {
          if (!err) {
            this.table.list = data.record
            this.table.total = data.totalRecordCount
          }
        })
    }
  }
})

</script>