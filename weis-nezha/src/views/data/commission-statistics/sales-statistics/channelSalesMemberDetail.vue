<template>
  <div class="page-container"  style="margin-top: 20px;">
    <div style="margin: 20px 0;">
      <QueryComponents v-model="queryParams" :queryList="queryComps" :span="4">
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="exportClick">导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      :data="table.data"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
      border
    >
      <el-table-column
        v-for="(col, index) in table.col"
        v-bind="col"
        :key="index"
      ></el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
// import { mapToOptions } from '@/utils/data-map';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';


export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {

    tableRequestParams() {
      const params = {
        ...this.page,
        ...this.queryParams,
        marketType: '02',
      };

      if (validArray(params.date)) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }

      if (!params.channel) {
        delete params.channel;
      }

      delete params.date;

      return params;
    }
  },
  data() {
    return {
      type: '',
      marketType: '',
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      table: {
        data: [],
        total: 0,
        col: [{
          type: 'index',
          label: '序号',
        }, {
          label: '渠道兼职客户经理ID',
          prop: 'counselorId'
        }, {
          label: '渠道兼职客户经理名称',
          prop: 'counselorName'
        }, {
          label: '渠道兼职客户经理手机号',
          prop: 'counselorPhone'
        }, {
          label: '会员名称',
          prop: 'memberName'
        }, {
          label: '会员ID',
          prop: 'memberId'
        }, {
          label: '会员手机',
          prop: 'memberPhone',
        }, {
          label: '会员订单号',
          prop: 'orderNumber'
        }, {
          label: '订单金额',
          prop: 'orderAmount',
          formatter: row => `￥${row.orderAmount || 0}`
        }, {
          label: '下单日期',
          prop: 'orderCdate'
        }, {
          label: '配送/自取日期',
          prop: 'orderMealTakingDate'
        }, {
          label: '消费类型',
          prop: 'orderType',
          formatter: row => `${row.orderType == '01' ? '消费' : '充值'}`
        }]
      },
      queryParams: {
        date: [],
        pCounselorId: '',
        counselorId: '',
        counselorPhone: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '编辑时间',
          props: {
            clearable: true,
            type: 'daterange'
          }
        },
        {
          component: 'el-input',
          key: 'counselorPhone',
          label: '手机号',
          props: {
            clearable: true,
          }
        }
      ]
    };
  },
  created() {
    if (this.$route.query.startTime) {
      this.queryParams.date[0] = this.$route.query.startTime;
      this.queryParams.date[1] = this.$route.query.endTime;
    }
    this.queryParams.pCounselorId  = this.$route.query.pCounselorId;
    this.queryParams.counselorId  = this.$route.query.counselorId;
    this.getTableData();
  },
  methods: {
    async exportClick() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;

      const data = await this.getAllTableData();

      exportExcel({
        filename,
        data,
        columns: this.table.col
      });
    },
    getAllTableData() {
      return this.$request('Channel/marketCounselorMemberTurnover', {
        ...this.tableRequestParams,
        pageNo: 1,
        pageSize: 9999,
      }).then(({ data }) => (data.errCode === 0 ? data.obj.dataPage.record : Promise.reject()));
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    getTableData() {
      this.$request('Channel/marketCounselorMemberTurnover', this.tableRequestParams).then(
        this.$rw((err, result) => {
          if (!err) {
            result = result.dataPage;
            this.table.total = result.totalRecordCount;
            this.table.data = result.record;
          }
        })
      );
    },
  },
};

</script>
