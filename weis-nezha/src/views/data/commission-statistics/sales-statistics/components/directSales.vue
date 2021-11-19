<template>
  <div>
    <div style="margin: 20px 0;">
      日期：<el-date-picker clearable type="daterange" style="width: 250px;margin-right: 20px;" v-model="queryParams.date"></el-date-picker>
      全职客户经理：<BaseSelect v-model="queryParams.counselorId" :options="counselorOptions" filterable clearable style="width: 200px;margin-right: 20px;"></BaseSelect>
      客户经理主管：<BaseSelect v-model="queryParams.pCounselorId" :options="pCounselorOptions" filterable clearable style="width: 200px;margin-right: 20px;"></BaseSelect>
      充值额：<el-input class="txt" clearable v-model="queryParams.startRecharge" @blur="checkText('startRecharge')"></el-input>
             <el-input class="txt" clearable v-model="queryParams.endRecharge" @blur="checkText('endRecharge')"></el-input>
      微信支付金额：<el-input class="txt" clearable v-model="queryParams.startWechat" @blur="checkText('startWechat')"></el-input>
                   <el-input class="txt" clearable v-model="queryParams.endWechat" @blur="checkText('endWechat')"></el-input>
      <el-button type="primary" @click="searchClick">搜索</el-button>
      <el-button type="primary" @click="exportClick" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
    </div>
    <BasePageTable
      ref="table"
      v-loading="loading"
      :height="height"
      :data="table.data"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
      border
      highlight-current-row>
      <el-table-column
        v-for="(col, index) in table.col"
        v-bind="col"
        :key="index"
      ></el-table-column>
      <el-table-column width="80" label="操作">
        <template v-slot="{ row }">
          <el-button size="small" @click="goDetail(row.counselorId)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import ButtonTabs from '@/components/ButtonTabs.vue';
import { mapToOptions } from '@/utils/data-map';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
    ButtonTabs,
  },
  data() {
    return {
      height: window.innerHeight - 380,
      loading: false,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      table: {
        data: [],
        total: 0,
        col: [
          { type: 'index', label: '序号'},
          { label: '客户经理ID', prop: 'counselorId' },
          { label: '客户经理', prop: 'counselorName' },
          { label: '客户经理主管', prop: 'parentName', formatter: row => `${row.parentName || '无'}` },
          { label: '客户经理总营业额', prop: 'turnoverTotal', formatter: row => `￥${row.turnoverTotal || 0}`},
          { label: '充值总额', prop: 'rechargeTotal' },
          { label: '微信支付总额', prop: 'wechatTotal' },
          { label: '直级会员', prop: 'memberNum' },
          { label: '兼职客户经理人数', prop: 'lowerCounselorNum' },
          { label: '兼职客户经理会员', prop: 'lowerMemberNum' }
        ]
      },
      queryParams: {
        marketType: '01',
        counselorId: '',
        pCounselorId: '',
        startRecharge: '',
        endRecharge: '',
        startWechat: '',
        endWechat: '',
        date: [],
      },
      counselorOptions: [],
      pCounselorOptions: [],
    };
  },
  created() {
    this.queryParams.date = [this.$day().format('YYYY-MM-DD'), this.$day().format('YYYY-MM-DD')];
    this.getCounsolr('counselor');
    this.getCounsolr('pCounselor');
    this.getTableData();
  },
  methods: {
    checkText(type) {
      let number = this.queryParams[type];
      number = isNaN(number) ? 0 : (Number(number) < 0 ? 0 : Number(number));
      number = number.toFixed(0);
      this.queryParams[type] = number;
    },
    changes() {
      this.getTableData();
    },
    async exportClick() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.table.col,
            filename,
            data: res.dataPage.record
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('Channel/marketTurnover', {
        ...this.genQueryParams(),
        pageNo: 0,
        pageSize: this.table.total,
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
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    goDetail(id, type) {
      let date = {}
      if (this.queryParams.date && this.queryParams.date.length) {
        date = {
          startTime: this.$day(this.queryParams.date[0]).format('YYYY-MM-DD'),
          endTime: this.$day(this.queryParams.date[1]).format('YYYY-MM-DD')
        }
      }
      this.$pushRoute('directSalesDetail', {
        query: {
          id,
          ...date,
        }
      });
    },
    getCounsolr(type) {
      const url = {
        counselor: 'Channel/queryCounselorList',
        pCounselor: 'Channel/queryOwnCounselor'
      }[type];
      const params = { marketType: '01' };
      if (type == 'counselor') {
        params.counselorType = '02'
      }
      this.$request(url, params).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            const result = dataPage.map((item) => {
              return {
                label: item.counselorName,
                value: item.counselorId,
                phone: item.counselorPhone,
              };
            });
            if (type == 'counselor') {
              this.counselorOptions = result;
            } else {
              this.pCounselorOptions = result;
            }
          }
        })
      );
    },
    getTableData() {
      this.loading = true;
      this.$request('Channel/marketTurnover', { ...this.genQueryParams(), ...this.page }).then(
        this.$rw((err, result) => {
          this.loading = false;
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

<style>
.txt {
  width: 100px;
  margin-right: 10px;
}
</style>
