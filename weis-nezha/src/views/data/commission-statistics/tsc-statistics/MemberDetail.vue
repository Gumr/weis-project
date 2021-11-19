<template>
  <div class="page-container">
    <div style="margin: 14px 0;">
    </div>
    <div style="margin: 20px 0;">
      <QueryComponents v-model="queryParams" :queryList="queryComps" :span="4">
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="info" @click="exportClick">导出</el-button>
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
      <!-- <el-table-column width="80" label="操作">
        <template v-slot="{ row }">
          <el-button size="small" @click="goDetail(row.parentId)"
            >详情</el-button
          >
        </template>
      </el-table-column> -->
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

const RoyaltyMap = {
  '00': '未确认',
  '01': '已确认',
  '02': '已取消'
};

export default {
  components: {
    QueryComponents,
    BasePageTable,
  },
  computed: {

    tableRequestParams() {
      const params = {
        ...this.page,
        ...this.queryParams
      };

      if (validArray(params.date)) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = +startDate;
        params.endDate = +endDate;
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
      page: {
        pageNo: 1,
        pageSize: 10,
        marketType: '03'
      },
      table: {
        data: [],
        total: 0,
        col: [{
          type: 'index',
          label: '序号',
        }, {
          label: '营养师ID',
          prop: 'counselorId'
        }, {
          label: '营养师名称',
          prop: 'counselorName'
        }, {
          label: '营养师手机',
          prop: 'counselorPhone'
        }, {
          label: '会员名称',
          prop: 'uname'
        }, {
          label: '会员ID',
          prop: 'memberUid'
        }, {
          label: '会员手机',
          prop: 'memberPhone',
        }, {
          label: '会员订单号',
          prop: 'orderNumber'
        }, {
          label: '订单金额',
          prop: 'orderPrice'
        }, {
          label: '本金',
          prop: 'actualConsumption'
        }, {
          label: '赠送金',
          prop: 'donateConsumption'
        }, {
          label: '分润',
          prop: 'royaltyIncome'
        }, {
          label: '分润类型',
          prop: 'orderType',
          formatter: this.orderTypeFormatter
        }, {
          label: '分润状态',
          prop: 'royaltyStatus ',
          formatter: row => RoyaltyMap[row.royaltyStatus]
        }]
      },
      queryParams: {
        date: [],
        channel: null,
        phone: ''
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
        }
      ]
    };
  },
  methods: {
    orderTypeFormatter(row) {
      return {
        '01': '消费',
        '02': '充值',
        '03': '消费'
      }[row.orderType];
    },
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
      return this.$request('Channel/queryProfitByMembersDetail', {
        ...this.tableRequestParams,
        pageNo: 1,
        pageSize: 9999,
        marketType: '03'
      }).then(({ data }) => (data.errCode === 0 ? data.obj.dataPage.record : Promise.reject()));
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getTableData();
    },
    getTableData() {
      this.$request('Channel/queryProfitByMembersDetail', this.tableRequestParams).then(
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
  created() {
    const { query } = this.$route;

    if (query.uid && query.bid) {
      this.queryParams.uid = query.uid;
      this.queryParams.parentId = query.bid;
      this.getTableData();
    }
  }
};

</script>
