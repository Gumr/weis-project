<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column v-for="col in table.col" :key="col.prop" v-bind="col"></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  name: 'finance_recharge',
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        phone: '',
        type: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          maxlength: '30',
          label: '手机号',
          placeholder: '请输入充值人手机',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'type',
          label: '充值类别',
          placeholder: '充值类别',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '线上卡激活', value: '01' },
              { label: '线下卡激活', value: '02' },
              { label: '直接充值', value: '03' },
              { label: '赠送', value: '04' },
            ]
          }
        },
      ],
      table: {
        col: [{
          type: 'index',
          label: '序号'
        },
        {
          label: '微信交易单号',
          prop: 'tpoThirdNo'
        }, 
        
        {
          label: '微信商户单号',
          prop: 'tcfOid'
        }, {
          label: '充值金额',
          prop: 'tcfAmount'
        }, {
          label: '实付金额',
          prop: 'tcfPayAmount'
        }, {
          label: '本金金额',
          prop: 'tcfPrincipalAmount'
        }, {
          label: '赠送金额',
          prop: 'tcfDonation'
        }, {
          label: '到账金额',
          prop: 'tcfArrivalAmount'
        }, {
          label: '充值人昵称',
          prop: 'tcfUname'
        }, {
          label: '充值人手机',
          prop: 'tcfUphome'
        }, {
          label: '充值时间',
          prop: 'tcfCtime'
        }, {
          label: '端口',
          prop: 'market'
        }, {
          label: '状态',
          prop: 'tcfStt'
        }, {
          label: '充值类别',
          prop: 'tcfChannel'
        }, {
          label: '充值时绑定客户经理',
          prop: 'counselorName'
        }, {
          label: '手机',
          prop: 'counselorPhone'
        }, {
          label: '充值时绑定营养师',
          prop: 'dieticianName'
        }, {
          label: '手机',
          prop: 'dieticianPhone'
        }, {
          label: '分佣的渠道',
          prop: 'channelName'
        }, {
          label: '手机',
          prop: 'channelPhone'
        }, {
          label: '分佣客户经理/营养师',
          prop: 'incomeCounselorName'
        },
        {
          label: '手机',
          prop: 'incomeCounselorPhone'
        }],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('CapitalFlow/queryRechargeFlowList', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        })
      );
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal
      };
      const res = await this.$http('CapitalFlow/queryRechargeFlowList', params);
      exportExcel({
        columns: this.table.col,
        filename,
        data: res.obj.dataPage.record
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
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
  margin: 22px 0 22px 0;
}
</style>
