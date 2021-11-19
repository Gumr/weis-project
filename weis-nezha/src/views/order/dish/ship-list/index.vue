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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="goDetail(row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import { spellOrderOptions } from '@/utils/data-map';
export default {
  name: 'order_dish_ship-list',
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
  created() {
    // this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '50'
        },
        {
          label: '配送单ID',
          prop: 'shipOrderId'
        },
        {
          label: '支付单ID',
          prop: 'payNum'
        },
        {
          label: '用户昵称',
          prop: 'uname'
        },
        {
          label: '手机',
          prop: 'phone'
        },
        {
          label: '餐单数',
          prop: 'orderNum'
        },
        {
          label: '配送类型',
          prop: 'shipType'
        },
        {
          label: '配送日期',
          prop: 'shipTime'
        },
        {
          label: '送餐地址',
          prop: 'shipAddres'
        },
        {
          label: '送餐加热点',
          prop: 'heatedPoint'
        },
        {
          label: '实付配送费',
          prop: 'shipPrice'
        },
        {
          label: '最终补差金额',
          prop: 'operationPrice'
        },
        {
          label: '配送公司',
          prop: 'shipCompany'
        },
        {
          label: '生成时间',
          prop: 'ctime'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        date: [new Date(), new Date()],
        shipdate: [],
        shipOrderId: '',
        phone: '',
        shipType: '',
        mergeFlag: ''

      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '生成时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            clearable: true,
          }
        },
        {
          component: 'el-date-picker',
          key: 'shipdate',
          label: '配送日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期',
            clearable: true,
          }
        },
        {
          component: 'el-input',
          key: 'shipOrderId',
          label: '配送单ID',
          placeholder: '配送单ID',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机',
          placeholder: '手机',
          props: {
            clearable: true
          },
          maxlength: 30
        },
        {
          component: 'BaseSelect',
          key: 'shipType',
          label: '配送类型',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '热食',
                value: '00'
              },
              {
                label: '冷链',
                value: '01'
              },
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'mergeFlag',
          label: '是否拼单',
          placeholder: '是否拼单',
          props: {
            clearable: true,
            options: spellOrderOptions
          }
        }
      ],
    };
  },
  methods: {
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('OrderManage/getShipOrder', { ...this.page, ...this.genQueryParams() });
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const res = await this.$http('OrderManage/getShipOrder', { pageNo: 1, pageSize: this.tableDataTotal, ...this.genQueryParams() });
      exportExcel({
        columns: [...this.tableCol, {
          label: '拼单',
          prop: 'mergeFlag'
        }],
        filename,
        data: res.obj.record
      });
    },
    goDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          shipOrderId: row.shipOrderId,
        }
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }
      if (params.shipdate && params.shipdate.length > 0) {
        const [startShipDate, endShipDate] = transformDaterange(params.shipdate);
        params.startShipDate = startShipDate.format('YYYY-MM-DD');
        params.endShipDate = endShipDate.format('YYYY-MM-DD');
      }
      delete params.date;
      delete params.shipdate;
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
