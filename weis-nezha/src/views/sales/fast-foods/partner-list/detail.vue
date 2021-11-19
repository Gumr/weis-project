<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="7"
        :label-width="90"
        semi>
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
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ImageUpload from '@/components/ImageUpload.vue';
import exportExcel from '@/utils/export-excel';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ImageUpload,
  },
  computed: {
  },
  created() {
    this.queryParams.tprcPid = this.$route.query.id;
    this.getList();
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
          width: 50,
        },
        {
          label: '渠道名称',
          prop: 'tprcName'
        },
        {
          label: '渠道折扣',
          prop: 'tprcCorpDiscount'
        },
        {
          label: '合伙人提成点',
          prop: 'tprcProfitRatio'
        },
        {
          label: '绑定天数',
          prop: 'tprcBindDuration'
        },
        {
          label: '绑定日期',
          prop: 'tprcBindTimeStr'
        },
        {
          label: '总提成额（元）',
          prop: 'tprcTotalAmount'
        },
        {
          label: '已确认提成（元）',
          prop: 'tprcProfitAmount'
        },
        {
          label: '未确认提成（元）',
          prop: 'tprcUnComfirmAmount'
        },
        {
          label: '已失效提成（元）',
          prop: 'tprcInvalidateAmount'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 100
      },
      queryParams: {
        tprcPid: '',
        date: [],
        corpName: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '绑定开始日期',
          props: {
            type: 'daterange',
            startPlaceholder: '开始日期',
            endPlaceholder: '结束日期'
          }
        },
        {
          component: 'el-input',
          label: '渠道名称',
          key: 'corpName',
          maxlength: '30',
          placeholder: '请输入渠道名称',
          props: {
            clearable: true
          }
        },
      ],
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http('partner.Partner/queryPartnerCorps', { ...this.page, ...this.genQueryParams()});
      this.tableData = res.obj.record;
      this.tableDataTotal = res.obj.totalRecordCount;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.valueOf();
        params.endDate = endDate.valueOf();
      }
      delete params.date;
      return params;
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      };
      const res = await this.$http('partner.Partner/queryPartnerCorps', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
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
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
