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
        <el-table-column
          v-for="col in table.col"
          :key="col.prop"
          v-bind="col">
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  name: 'finance_special-refund_refund-record',
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
          placeholder: '请输入下单人手机',
          props: {
            clearable: true
          }
        },
      ],
      table: {
        col: [{
          type: 'index',
          label: '序号'
        }, {
          label: '订单号',
          prop: 'orderNo'
        }, {
          label: '下单人昵称',
          prop: 'uname'
        }, {
          label: '下单人手机',
          prop: 'phone'
        }, {
          label: '订单金额',
          prop: 'orderPrice'
        }, {
          label: '配送费',
          prop: 'foodDeliveryPrice'
        }, {
          label: '折扣后金额',
          prop: 'accountsPay'
        }, {
          label: '抵扣金额',
          prop: 'discountPrice'
        }, {
          label: '实付金额',
          prop: 'actualPrice'
        }, {
          label: '退款金额',
          prop: 'refundPrice'
        }, {
          label: '退款时间',
          prop: 'refundDate'
        }, {
          label: '退款人',
          prop: 'refundName'
        }, {
          label: '退款人手机',
          prop: 'refundPhone'
        }, {
          label: '备注',
          prop: 'remark'
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
      this.$request('refund.SpecialRefundRecord/getAll', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
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
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [staDate, endDate] = transformDaterange(params.date);
        params.staDate = staDate.format('YYYY-MM-DD');
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
