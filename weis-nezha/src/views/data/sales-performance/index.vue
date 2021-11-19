<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="120"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <div style="margin:20px 0;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" @change="changes" />
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :total="tableDataTotal"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ButtonTabs from '@/components/ButtonTabs.vue';

export default {
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.refreshCol();
    // this.getList();
  },
  data() {
    return {
      activeTab: '01',
      tabs: [
        {
         label: '点餐',
         value: '01'
        },
        {
         label: '充值',
         value: '02'
        }
      ],
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        type: '01',
        date: [new Date(), new Date()],
        phone: '',
        fullTimePhone: '',
        partTimePhone: '',
        channelPhone: '',
        helperPhone: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            'value-format': 'yyyy-MM-dd'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '会员手机',
          placeholder: '会员手机',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'fullTimePhone',
          label: '全职客户经理手机',
          placeholder: '全职客户经理手机',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'partTimePhone',
          label: '兼职客户经理手机',
          placeholder: '兼职客户经理手机',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'channelPhone',
          label: '渠道手机',
          placeholder: '渠道手机',
          props: {
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'helperPhone',
          label: '助手手机',
          placeholder: '助手手机',
          props: {
            clearable: true,
          },
        },
      ],
    };
  },
  methods: {
    changes() {
      this.queryParams.type = this.activeTab;
      this.refreshCol();
      this.getList();
    },
    refreshCol() {
      if (this.activeTab == '01') {
        this.tableCol = [
          {
            label: '序号',
            type: 'index',
            width: '80'
          },
          {
            label: '端口',
            prop: 'market'
          },
          {
            label: '订单号',
            prop: 'orderId',
          },
          {
            label: '交易单金额',
            prop: 'orderPrice',
          },
          {
            label: '本金',
            prop: 'paidPrincipal',
          },
          {
            label: '赠送金',
            prop: 'paidGiftPrice'
          },
          {
            label: '订单创建日期',
            prop: 'ctime',
          },
          {
            label: '配送日期',
            prop: 'date'
          },
          {
            label: '分润类型',
            prop: 'incomeType',
          },
          {
            label: '支付方式',
            prop: 'payWay',
          },
          {
            label: '会员名称',
            prop: 'uname',
          },
          {
            label: '会员ID',
            prop: 'uid'
          },
          {
            label: '会员手机号',
            prop: 'phone',
          },
          {
            label: '订单生成时绑定的助手ID',
            prop: 'helperId' ,
            formatter: row => row.helperId || '无'
          },
          {
            label: '订单生成时绑定的助手名称',
            prop: 'helperName',
            formatter: row => row.helperName || '无'
          },
          {
            label: '订单生成时绑定的助手手机号',
            prop: 'helperPhone',
            formatter: row => row.helperPhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'helperIncome',
            formatter: row => row.helperIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'helperIncomeStatus',
            formatter: row => row.helperIncomeStatus || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道码ID',
            prop: 'qrcodeId',
            formatter: row => row.qrcodeId || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道码名称',
            prop: 'qrcodeName',
            formatter: row => row.qrcodeName || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道ID',
            prop: 'channelId',
            formatter: row => row.channelId || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道名称',
            prop: 'channelName',
            formatter: row => row.channelName || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道手机号',
            prop: 'channelPhone',
            formatter: row => row.channelPhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'channelIncome',
            formatter: row => row.channelIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'channelIncomeStatus',
            formatter: row => row.channelIncomeStatus || '无'
          },
          {
            label: '订单生成时绑定的兼职客户经理ID',
            prop: 'partTimeId',
            formatter: row => row.partTimeId || '无'
          },
          {
            label: '订单生成时绑定的兼职客户经理名称',
            prop: 'partTimeName',
            formatter: row => row.partTimeName || '无'
          },
          {
            label: '订单生成时绑定的兼职客户经理手机号',
            prop: 'partTimePhone',
            formatter: row => row.partTimePhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'partTimeIncome',
            formatter: row => row.partTimeIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'partTimeIncomeStatus',
            formatter: row => row.partTimeIncomeStatus || '无'
          },
          {
            label: '订单生成时绑定的全职客户经理ID',
            prop: 'fullTimeId',
            formatter: row => row.fullTimeId || '无'
          },
          {
            label: '订单生成时绑定的全职客户经理名称',
            prop: 'fullTimeName',
            formatter: row => row.fullTimeName || '无'
          },
          {
            label: '订单生成时绑定的全职客户经理手机号',
            prop: 'fullTimePhone',
            formatter: row => row.fullTimePhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'fullTimeIncome',
            formatter: row => row.fullTimeIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'fullTimeIncomeStatus',
            formatter: row => row.fullTimeIncomeStatus || '无'
          },
        ];
      } else {
        this.tableCol = [
          {
            label: '序号',
            type: 'index',
            width: '80'
          },
          {
            label: '市场',
            prop: 'market'
          },
          {
            label: '端口',
            prop: 'port'
          },
          {
            label: '订单号',
            prop: 'orderId',
          },
          {
            label: '交易单金额',
            prop: 'orderPrice',
          },
          {
            label: '本金',
            prop: 'paidPrincipal',
          },
          {
            label: '赠送金',
            prop: 'paidGiftPrice'
          },
          {
            label: '订单创建日期',
            prop: 'ctime',
          },
          {
            label: '分润类型',
            prop: 'incomeType',
          },
          {
            label: '支付方式',
            prop: 'payWay',
          },
          {
            label: '会员名称',
            prop: 'uname',
          },
          {
            label: '会员ID',
            prop: 'uid'
          },
          {
            label: '会员手机号',
            prop: 'phone',
          },
          {
            label: '订单生成时绑定的助手ID',
            prop: 'helperId',
            formatter: row => row.helperId || '无'
          },
          {
            label: '订单生成时绑定的助手名称',
            prop: 'helperName',
            formatter: row => row.helperName || '无'
          },
          {
            label: '订单生成时绑定的助手手机号',
            prop: 'helperPhone',
            formatter: row => row.helperPhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'helperIncome',
            formatter: row => row.helperIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'helperIncomeStatus',
            formatter: row => row.helperIncomeStatus || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道码ID',
            prop: 'qrcodeId',
            formatter: row => row.qrcodeId || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道码名称',
            prop: 'qrcodeName',
            formatter: row => row.qrcodeName || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道ID',
            prop: 'channelId',
            formatter: row => row.channelId || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道名称',
            prop: 'channelName',
            formatter: row => row.channelName || '无'
          },
          {
            label: '订单生成时绑定的助手关联的渠道手机号',
            prop: 'channelPhone',
            formatter: row => row.channelPhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'channelIncome',
            formatter: row => row.channelIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'channelIncomeStatus',
            formatter: row => row.channelIncomeStatus || '无'
          },
          {
            label: '订单生成时绑定的兼职客户经理ID',
            prop: 'partTimeId',
            formatter: row => row.partTimeId || '无'
          },
          {
            label: '订单生成时绑定的兼职客户经理名称',
            prop: 'partTimeName',
            formatter: row => row.partTimeName || '无'
          },
          {
            label: '订单生成时绑定的兼职客户经理手机号',
            prop: 'partTimePhone',
            formatter: row => row.partTimePhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'partTimeIncome',
            formatter: row => row.partTimeIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'partTimeIncomeStatus',
            formatter: row => row.partTimeIncomeStatus || '无'
          },
          {
            label: '订单生成时绑定的全职客户经理ID',
            prop: 'fullTimeId',
            formatter: row => row.fullTimeId || '无'
          },
          {
            label: '订单生成时绑定的全职客户经理名称',
            prop: 'fullTimeName',
            formatter: row => row.fullTimeName || '无'
          },
          {
            label: '订单生成时绑定的全职客户经理手机号',
            prop: 'fullTimePhone',
            formatter: row => row.fullTimePhone || '无'
          },
          {
            label: '分佣金额',
            prop: 'fullTimeIncome',
            formatter: row => row.fullTimeIncome || '无'
          },
          {
            label: '分佣金额状态',
            prop: 'fullTimeIncomeStatus',
            formatter: row => row.fullTimeIncomeStatus || '无'
          },
        ];
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('data.SalesPerformance/querySalesPerformancePage', params);
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record;
        this.tableDataTotal = res.obj.dataPage.totalRecordCount;
        this.$nt(() => {
          this.$refs.table.doLayout();
        });
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('data.SalesPerformance/querySalesPerformancePage', params);
      exportExcel({
        columns: this.tableCol,
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
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>
