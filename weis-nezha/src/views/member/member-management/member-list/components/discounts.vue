<template>
  <base-page-table
    v-model:current-page="table.page.pageNo"
    v-model:page-size="table.page.pageSize"
    :data="table.list"
    :total="table.total"
    :columns="columns"
    @current-page-change="getList"
    @size-change="getList"
  />
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

export default defineComponent({
  setup() {
    const columns = [
      {
        label: '序号',
        type: 'index',
        width: 60
      },
      {
        label: '折扣组名称',
        prop: 'groupName',
      },
      {
        label: '折扣类型',
        prop: 'type',
      },
      {
        label: '折扣',
        prop: 'discount',
      },
      {
        label: '有效时间',
        prop: 'takeEffectTime',
      },
      {
        label: '原价金额上限',
        prop: 'dayLimitAmount',
      },
      {
        label: '端口',
        prop: 'port',
      },
      {
        label: '状态',
        prop: 'stt',
      }
    ]
    const route = useRoute()
    const table = reactive({
      list: [],
      total: 0,
      page: {
        pageNo: 1,
        pageSize: 20
      }
    })

    function getList() {
      request('userdetails.UserDetails/userDiscountRecord', {
        uid: route.query.id,
        ...table.page
      }).thenwrap((err, data) => {
        if (!err) {
          table.total = data.totalRecordCount
          table.list = data.record
        }
      })
    }
    getList()
    return {
      getList,
      columns,
      table
    }
  }
})

</script>