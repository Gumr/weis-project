<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="7"
        :label-width="120"
        semi
      >
        <template v-slot:action class="action-cell" >
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="handleExport" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
          <el-button type="danger" @click="handleCreate">新建异常</el-button>
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
        border>
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="是否返回库存" prop="tsmeIsInventory" key="tsmeIsInventory" v-if="isShow"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="goPage('detail', row)">详情</span>
          </template>
        </el-table-column>
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
      isShow: false,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        orderId: '',
        pointId: '',
        stt: '',
        type: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'orderId',
          label: '订单编码',
          placeholder: '请输入订单编码',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'pointId',
          label: '供餐点',
          props: {
            options: []
          }
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '审批状态',
          props: {
            clearable: true,
            options: [
              { label: '待审核', value: '00' },
              { label: '审核通过', value: '10' },
              { label: '审核拒绝', value: '20' },
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'type',
          label: '异常需求',
          props: {
            options: [
              { label: '单品退款', value: '01' },
              { label: '全额退款', value: '02' },
              { label: '修改配送地址', value: '03' },
              { label: '修改配送时间', value: '04' },
              { label: '重新发起配送', value: '05' },
              { label: '异常取消订单', value: '06' },
              { label: '订单已完成', value: '07' },
            ]
          }
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '订单编码',
          prop: 'tsmeOrderId'
        },
        {
          label: '取餐码',
          prop: 'tsmeTakeMealCode'
        },
        {
          label: '下单人手机',
          prop: 'tsmePhone'
        },
        {
          label: '异常需求',
          prop: 'tsmeTypeDesc'
        },
        {
          label: '原因',
          prop: 'tsmeCauseDesc'
        },
        {
          label: '状态',
          prop: 'tsmeSttDesc'
        },
        {
          label: '供餐点',
          prop: 'tsmeHeatingPointName'
        },
        {
          label: '提交人',
          prop: 'tsmeCreatorName'
        },
        {
          label: '提交时间',
          prop: 'tsmeCtime'
        },
        {
          label: '审批完成时间',
          prop: 'tsmeAuditTime'
        },
      ],
    };
  },
  created() {
    this.getHeatPoint();
    this.getList();
  },
  methods: {
    // 获取供餐点
    getHeatPoint() {
      this.$request('HeatingPoint/queryEnabledHeat',).then(
        this.$rw((err, dataPage) => {
          if (!err, dataPage) {
            this.queryComps[1].props.options = dataPage.heatVos;
          }
        })
      );
    },
    handleCreate() {
      this.$store.state.keepMatcher = null;
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          type: 'create'
        }
      });
    },
    searchClick() {
      this.isShow = this.queryParams.type == '02';
      this.page.pageNo = 1;
      this.getList();
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tsmeId
        }
      });
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('shoperror.ShopManagerError/shopManagerErrorList', {
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
    handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.reqAllUserData().then(
        this.$rw((err, { dataPage }) => {
          this.$store.state.bloading = false;
          exportExcel({
            columns: this.tableCol,
            filename,
            data: dataPage.record
          });
        })
      );
    },
    reqAllUserData() {
      return this.$request('shoperror.ShopManagerError/shopManagerErrorList', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
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
  margin: 0 8px;
  width: 300px;
}
.tiny-input {
  margin: 0 8px;
  width: 100px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
