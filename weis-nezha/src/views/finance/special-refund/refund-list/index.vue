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
        <el-table-column v-for="col in table.col" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center" width="150">
          <template class="action-cell" v-slot="{ row }">
            <el-button size="small" @click="refund(row)">退款</el-button>
            <el-button size="small" @click="goDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="退款"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-form :model="current" label-width="130px">
        <el-form-item label="订单号">{{current.orderNo}}</el-form-item>
        <el-form-item label="订单单类型">{{current.orderMethod}}</el-form-item>
        <el-form-item label="下单人昵称">{{current.uname}}</el-form-item>
        <el-form-item label="实付金额">{{current.actualPrice}}</el-form-item>
        <el-form-item label="请输入退款金额">
          <el-input
            class="small-input"
            type="number"
            min="0"
            v-model="refundPrice"
            @blur="checkInput"
            maxlength="10"
          ></el-input>
          <div style="color:#999999">不可超过订单实付金额</div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input class="small-input" type="text" min="0" v-model="remark" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'finance_special-refund_refund-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
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
      loading: false,
      hasDialog: false,
      current: {},
      refundPrice: 0,
      remark: '',
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [],
        distributionMode: '',
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
          label: '下单手机',
          placeholder: '请输入下单人手机',
          props: {
            clearable: true
          }
        },
        {
          component: 'el-input',
          key: 'consigneePhone',
          maxlength: '30',
          label: '收货手机',
          placeholder: '请输入收货人手机',
          props: {
            clearable: true
          }
        },
        {
          component: 'BaseSelect',
          key: 'distributionMode',
          label: '配送方式',
          props: {
            clearable: true,
            options: [
              {
                label: '自取',
                value: '1'
              },
              {
                label: '配送',
                value: '0'
              },
            ]
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
          label: '订单类型',
          prop: 'orderMethod'
        }, {
          label: '餐别',
          prop: 'category'
        }, {
          label: '配送方式',
          prop: 'distributionMode'
        }, {
          label: '下单时间',
          prop: 'ctime'
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
          label: '菜品详情',
          prop: 'dishesDetails'
        }, {
          label: '菜品数量',
          prop: 'dishesAmount'
        }, {
          label: '配送/自取地址',
          prop: 'address'
        }, {
          label: '收货人',
          prop: 'consignee'
        }, {
          label: '收货人手机',
          prop: 'consigneePhone'
        }, {
          label: '当前状态',
          prop: 'stt'
        }],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    checkInput() {
      this.refundPrice = Number(this.refundPrice).toFixed(2);
      this.refundPrice = this.refundPrice < 0 ? 0 : this.refundPrice;
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('refund.SpecialRefund/getAll', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false;
          if (!err) {
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
    refund(row) {
      this.hasDialog = true;
      this.remark = '';
      this.refundPrice = 0;
      this.current = row;
    },
    onconfirm() {
      if (Number(this.refundPrice) === NaN) {
        this.$message({type: 'error', message: '请输入正确的退款金额！'});
        return;
      }
      if (Number(this.refundPrice) > this.current.actualPrice) {
        this.$message({type: 'error', message: '不可超过订单实付金额！'});
        return;
      }
      this.$request('refund.SpecialRefund/refund', {
        id: this.current.id,
        amount: this.refundPrice,
        remark: this.remark
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({type: 'success', message: '退款成功！'});
            this.hasDialog = false;
            this.getList();
          } else {
            this.$message({type: 'error', message: err.errMsg});
          }
        })
      );
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          id: row.orderNo
        }
      });
    },

  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.small-input {
  width: 200px;
}
</style>
