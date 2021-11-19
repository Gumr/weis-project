<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="80"
        :span="6"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="resetPageRequestData">搜索</el-button>
          <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
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
        @current-page-change="getOrderList"
        @size-change="getOrderList"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="orderNo"></el-table-column>
        <el-table-column label="下单人ID" prop="uid"></el-table-column>
        <el-table-column label="下单人手机" prop="phone"></el-table-column>
        <el-table-column label="入场时间" prop="enterTime">
          <template v-slot="{ row }">
            {{ $day(+row.enterTime).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column label="出场时间" prop="outTime">
          <template v-slot="{ row }">
            {{ $day(+row.outTime).format("YYYY-MM-DD HH:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column label="持续时间" prop="duration">
          <template v-slot="{ row }">
            {{ transformDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="应付金额" prop="payAmount"></el-table-column>
        <el-table-column label="实付金额" prop="actualPaid"></el-table-column>
        <el-table-column label="付款时间" prop="utime">
          <template v-slot="{ row }">
            {{ formatUtime(row.utime) }}
          </template>
        </el-table-column>
        <el-table-column label="订单状态" prop="orderStatus">
          <template v-slot="{ row }">
            {{ formatOrderStatus(row.orderStatus) }}
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import { mapToOptions } from '@/utils/data-map';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

const orderStatusMap = {
  // 2: '进行中',
  3: '已完成',
  // 4: '异常'
};

export default {
  name: 'order_sport_entry-list',
  components: {
    BasePageTable
  },
  created() {
    const { phone } = this.$route.query;
    if (phone) {
      this.queryParams.phone = phone;
    }

    this.getOrderList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableDataTotal: 0,
      queryParams: {
        date: [],
        status: '-1',
        phone: ''
      },
      tableCol: [{
        label: '序号',
        type: 'index'
      }, {
        label: '订单编号',
        prop: 'orderNo'
      }, {
        label: '下单人ID',
        prop: 'uid'
      }, {
        label: '下单人手机',
        prop: 'phone'
      }, {
        label: '入场时间',
        prop: 'enterTime',
        formatter: row => this.$day(+row.enterTime).format('YYYY-MM-DD HH:mm:ss')
      }, {
        label: '出场时间',
        prop: 'outTime',
        formatter: row => this.$day(+row.outTime).format('YYYY-MM-DD HH:mm:ss')
      }, {
        label: '持续时间',
        prop: 'duration',
        formatter: row => this.transformDuration(row.duration)
      }, {
        label: '应付金额',
        prop: 'payAmount'
      }, {
        label: '实付金额',
        prop: 'actualPaid'
      }, {
        label: '付款时间',
        prop: 'utime',
        formatter: row => this.formatUtime(row.utime)
      }, {
        label: '订单状态',
        prop: 'orderStatus',
        formatter: row => this.formatOrderStatus(row.orderStatus)
      }],
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
          component: 'BaseSelect',
          key: 'status',
          label: '订单状态',
          plceholder: '订单状态选择',
          props: {
            options: mapToOptions(orderStatusMap)
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '下单人手机',
          placeholder: '请输入下单人手机号',
          props: {
            clearable: true
          }
        }
      ]
    };
  },
  methods: {
    handleExport() {
      this.$store.state.bloading = true;
      const filename = `${this.$route.meta.title}-导出`;

      this.reqOrderrData({
        pageNo: 1,
        pageSize: this.tableDataTotal
      }).then(this.$rw((err, { dataPage }) => {
        this.$store.state.bloading = false;
        exportExcel({
          columns: this.tableCol,
          filename,
          data: dataPage.record
        });
      }));
    },
    formatUtime(timestamp) {
      let [years, hours] = timestamp.match(/(\w{8})(\w{6})/).slice(1);

      years = years.match(/(\w{4})(\w{2})(\w{2})/).slice(1).join('-');
      hours = hours.match(/(\w{2})(\w{2})(\w{2})/).slice(1).join(':');

      return `${years} ${hours}`;
    },
    resetPageRequestData() {
      this.page.pageNo = 1;
      this.getOrderList();
    },
    reqOrderrData(page = {}) {
      return this.$request('Order/queryEnterHist', {
        ...page,
        ...this.genQueryParams()
      });
    },
    getOrderList() {
      this.$store.state.vloading = true;
      this.reqOrderrData(this.page)
        .then(this.$rw((err, { dataPage }) => {
          this.$store.state.vloading = false;
          if (!err) {
            this.tableDataTotal = dataPage.totalRecordCount;
            this.tableData = dataPage.record;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
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
    formatOrderStatus(status) {
      return orderStatusMap[status];
    },
    transformDuration(duration = 0) {
      // eslint-disable-next-line
      let time = duration * 60 | 0;
      const seconds = time % 60;
      time = (time - seconds) / 60; // 转成分钟
      const minutes = time % 60;
      time = (time - minutes) / 60; // 转成小时
      const hours = time % 60;
      // eslint-disable-next-line
      const day = ((time - hours) / 24) | 0; // 转成天数

      let res = '';
      if (day) res += `${day}天`;
      if (hours) res += `${hours}小时`;
      if (minutes) res += `${minutes}分钟`;
      if (seconds) res += `${seconds}秒`;

      return res || '0秒';
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 12px 22px 0;
}
</style>
