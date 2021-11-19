<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="5"
        :label-width="60"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
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
  name: 'order_package-list_new-bodybuiding',
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
        tuuUsedStt: ''
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '付款日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机',
          placeholder: '请输入下单人手机',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'tuuUsedStt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部状态',
                value: ''
              },
              {
                label: '未开始',
                value: '00'
              },
              {
                label: '进行中',
                value: '01'
              },
              {
                label: '已完成',
                value: '02'
              },
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
          label: '订单编号',
          prop: 'tuoOrderId'
        },
        {
          label: '套餐名称',
          prop: 'tuoUcname'
        },
        {
          label: '所属健身房',
          prop: 'tuoGymName'
        },
        {
          label: '订单金额',
          prop: 'tuoAmount'
        },
        {
          label: '支付金额',
          prop: 'tuoActualAmount'
        },
        {
          label: '付款用户',
          prop: 'tuoUname'
        },
        {
          label: '手机',
          prop: 'tuoUphone'
        },
        {
          label: '付款时间',
          prop: 'tuoCtime'
        },
        {
          label: '报名人姓名',
          prop: 'tuoUserName'
        },
        {
          label: '报名人手机',
          prop: 'tuoUserPhone'
        },
        {
          label: '状态',
          prop: 'tuoUsedSttDesc'
        },
        {
          label: '饮食金额',
          prop: 'tuoConsumeAmount'
        },
        {
          label: '已消耗金额',
          prop: 'tuoExpendAmount'
        },
        {
          label: '总课程',
          prop: 'tuoTotalClass'
        },
        {
          label: '已消耗课程',
          prop: 'tuoExpendClass'
        }
      ],
      uname: '',
      uid: '',
      uphone: '',
      addDialog: false,
      delDialog: false,
    };
  },
  created() {
    // this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        // path: `${this.$route.path}/detail`,
        query: {
          id: row.tuoOrderId
        }
      });
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('fitness.Fitness/queryUnionOrderList', {
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
        this.$rw((err, dataPage) => {
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
      return this.$request('fitness.Fitness/queryUnionOrderList', {
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
