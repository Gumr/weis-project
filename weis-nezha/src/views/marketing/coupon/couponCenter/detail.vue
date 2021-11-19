<template>
  <div class="page-container">
    <ReturnButton back/>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="100"
        :span="5"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
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
import ReturnButton from '@/components/ReturnButton.vue';

export default {
  name: 'marketing_coupon_couponCenter_detail',
  components: {
    QueryComponents,
    BasePageTable,
    ReturnButton
  },
  created() {
    this.queryParams.activityId = this.$route.query.id;
    this.getCouponStateOptions();
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: 50,
        },
        {
          label: '券ID',
          prop: 'couponShowId',
        },
        {
          label: '券名称',
          prop: 'couponName'
        },
        {
          label: '券类型',
          prop: 'type'
        },
        {
          label: '面额',
          prop: 'amount'
        },
        {
          label: '当前状态',
          prop: 'stt'
        },
        {
          label: '领取人昵称',
          prop: 'uname'
        },
        {
          label: '领取人手机',
          prop: 'phone'
        },
        {
          label: '领取时间',
          prop: 'ctime'
        },
        {
          label: '领券来源',
          prop: 'markt'
        },
        {
          label: '用券订单',
          prop: 'orderId'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        ctime: '',
        uPhone: '',
        stt: '',
        market: '',
        activityId: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'ctime',
          label: '领取时间',
          props: {
            type: 'date',
            'value-format': 'yyyy-MM-dd'
          }
        },
        {
          component: 'el-input',
          key: 'uPhone',
          label: '领取人手机',
          placeholder: '请输入领取人手机',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '当前状态',
          props: {
            clearable: true,
            options: [
              { label: '全部', value: '' },
              { label: '已激活', value: '00' },
              { label: '已使用', value: '10' },
              { label: '已失效', value: '20' },
            ]
          }
        },
        // {
        //   component: 'BaseSelect',
        //   key: 'market',
        //   label: '领券来源',
        //   props: {
        //     clearable: true,
        //     options: [
        //       { label: '全部', value: '' },
        //       { label: '饮食小程序', value: '10' },
        //       { label: '糖三彩', value: '20' },
        //       { label: '数搭', value: '30' },
        //     ]
        //   }
        // },
      ],
    };
  },
  methods: {
    getCouponStateOptions() {
      this.$request('coupon.ActivityCoupon/getCouponStateList', {})
        .then(this.$rw((err, data) => {
          if (!err) {
            this.queryComps[2].props.options = data.result.filter(({ value }) => ['00', '02'].indexOf(value) === -1);
          }
        }));
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      const res = await this.$http('coupon.Hotlist/getConfSendCouponInfo', params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.genQueryParams(),
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('coupon.Hotlist/getConfSendCouponInfo', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
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
.page-container {
  padding-top: 20px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
</style>
