<template>
  <div class="page-container">
    <ReturnButton back/>
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="90"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
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
  name: 'goods_dish-unit',
  components: {
    QueryComponents,
    BasePageTable,
    ReturnButton
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.queryParams.uid = this.$route.query.uid || '';
    this.queryParams.qrCode = this.$route.query.qrCode || '';
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
          width: '80'
        },
        {
          label: '单号',
          prop: 'orderId'
        },
        {
          label: '下单人昵称',
          prop: 'name'
        },
        {
          label: '下单人手机',
          prop: 'phone'
        },
        {
          label: '使用时间',
          prop: 'useTime'
        },
        {
          label: '出餐时间',
          prop: 'mealTakingTime'
        },
        {
          label: '餐单实付金额',
          prop: 'totalAmount'
        },
        {
          label: '状态',
          prop: 'statusDesc'
        },
        {
          label: '订单类型',
          prop: 'profitTypeDesc'
        },
        {
          label: '创建时间',
          prop: 'ctime'
        },
        {
          label: '确认时间',
          prop: 'comfirmTime'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        uid: '',
        qrCode: '',
        date: [],
        status: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '创建时间',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'BaseSelect',
          key: 'status',
          label: '状态',
          props: {
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '待确认',
                value: '00'
              },
              {
                label: '已失效',
                value: '10'
              },
              {
                label: '已确认',
                value: '20'
              },
            ]
          }
        },
      ],
    };
  },
  methods: {
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('partner.ChannelPerfor/queryUserDetailPage', params);
      if (!res.errMsg) {
        this.tableData = res.obj.dataPage.record;
        this.tableDataTotal = res.obj.dataPage.totalRecordCount;
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
      const res = await this.$http('partner.ChannelPerfor/queryUserDetailPage', params);
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
.page-container {
  padding-top: 20px;
}
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 10px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 30px;
    line-height: 5px;
  }
  .qrlist {
    width: 700px;
    display: flex;
    flex-wrap: wrap;
  }
  .qrcode {
    width: 200px;
    height: 250px;
    display: flex;
    flex-wrap: wrap;
    margin-right: 10px;
    img {
      width: 200px;
      height: 200px;
    }
    span {
      width: 100%;
      text-align: center;
    }
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
