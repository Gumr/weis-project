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
            prop: 'name',
            label: '姓名'
          },
          {
            prop: 'phone',
            label: '手机号'
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
    getList() {
      this.$request('Member/queryRechargeDetailsRecord', {
        batchNo: this.$route.query.batchNo,
        ...this.page
      })
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