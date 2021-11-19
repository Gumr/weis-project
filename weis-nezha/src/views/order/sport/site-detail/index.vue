<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="4"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        :height="height"
        :data="tableData"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :total="tableDataTotal"
        @current-page-change="getEnterList"
        @size-change="getEnterList"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="入场ID" prop="uid"></el-table-column>
        <el-table-column label="入场人手机" prop="phone"></el-table-column>
        <el-table-column label="入场人时间" prop="enterTime">
          <template v-slot="{ row }">
            {{ $day(+row.enterTime).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  name: 'order-manage_site-detail',
  components: {
    BasePageTable
  },
  created() {
    this.getEnterList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      queryParams: {
        date: '',
        status: '',
        phone: ''
      },
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableDataTotal: 0,
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          // props: {
          //   type: 'daterange',
          //   startPlaceholder: '开始日期',
          //   endPlaceholder: '结束日期'
          // }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '下单人',
          placeholder: '请输入下单人手机号',
          props: {
            clearable: true
          }
        }]
    };
  },
  methods: {
    searchClick() {
      this.getEnterList();
    },
    getEnterList(reset) {
      this.$request('Order/queryPlaceDetailHist', {
        ...this.page,
        ...this.genQueryParams()
      }).then(this.$rw((err, { dataPage }) => {
        if (!err) {
          if (typeof reset === 'boolean' && reset) this.page.pageNo = 1;
          this.tableDataTotal = dataPage.totalRecordCount;
          this.tableData = dataPage.record;
        }
      }));
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate;
        params.endDate = endDate;
      }
      delete params.date;
      return params;
    },
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 12px 22px 0;
}
</style>
