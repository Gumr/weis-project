<template>
  <div class="page-container" style="margin-top: 20px;">
    <div>
      <ButtonTabs v-model="activeTab" :tabs="tabs"  />
    </div>
    <div style="margin: 20px 0;">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :label-width="100"
        :span="4"
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="exportClick" :loading="$store.state.bloading">{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      ref="table"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      :total="table.total"
      @current-page-change="getTableData"
      @size-change="getTableData"
      border
      highlight-current-row
    >
      <el-table-column
        v-for="(col, index) in table.col"
        v-bind="col"
        :key="index"
      ></el-table-column>
      <el-table-column width="80" label="操作">
        <template v-slot="{ row }">
          <el-button size="small" @click="goDetail(row.parentId, row.parentType)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </BasePageTable>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import QueryComponents from '@/components/QueryComponents.vue';
import { mapToOptions } from '@/utils/data-map';
import { validArray } from '@/utils/common';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';
import ButtonTabs from '@/components/ButtonTabs.vue';

const BroderTypeMap = {
  '01': '外部',
  '02': '自有'
};

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs
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

      delete params.date;

      return params;
    }
  },
  data() {
    return {
      height: window.innerHeight - 330,
      activeTab: 0,
      tabs: [
        {
          label: '营养师',
          value: '0'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      table: {
        data: [],
        total: 0,
        col: [{
          type: 'index',
          label: '序号',
        }, {
          label: '营养师ID',
          prop: 'parentId',
          width: '120px'
        }, {
          label: '营养师名称',
          prop: 'parentName',
          width: '120px'
        }, {
          label: '营养师类型',
          prop: 'parentType',
          width: '120px',
          formatter: this.borderTypeFormatter
        }, {
          label: '手机',
          prop: 'parentPhone'
        }, {
          label: '营养师总佣金',
          prop: 'totalRoyalty',
          width: '120px',
          formatter: row => `￥${row.totalRoyalty || 0}`
        }, {
          label: '营养师总佣金-已确认',
          prop: 'totalRoyaltyAlready',
          width: '170px'
        }, {
          label: '营养师总佣金-待确认',
          prop: 'totalRoyaltyComing',
          width: '170px'
        }, {
          label: '营养师总佣金-已失效',
          prop: 'totalRoyaltyInvalid',
          width: '170px'
        }, {
          label: '直级学员人数',
          prop: 'memberNum',
          width: '120px'
        }, {
          label: '直级学员分润',
          prop: 'memberRoyalty',
          width: '120px'
        }, {
          label: '直级学员分润-已确认',
          prop: 'memberRoyaltyAlready',
          width: '156px'
        }, {
          label: '直级学员分润-待确认',
          prop: 'memberRoyaltyComing',
          width: '156px'
        }, {
          label: '直级学员分润-已失效',
          prop: 'memberRoyaltyInvalid',
          width: '156px'
        }, {
          label: '下级营养师人数',
          prop: 'counselorNum',
          width: '140px'
        }, {
          label: '下级营养师分润',
          prop: 'counselorRoyalty',
          width: '140px'
        }, {
          label: '下级营养师分润-已确认',
          prop: 'counselorRoyaltyAlready',
          width: '186px'
        }, {
          label: '下级营养师分润-待确认',
          prop: 'counselorRoyaltyComing',
          width: '186px'
        }, {
          label: '下级营养师分润-已失效',
          prop: 'counselorRoyaltyInvalid',
          width: '186px'
        }]
      },
      queryParams: {
        uid: '',
        parentId: '',
        date: [],
        marketType: '03'
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '日期',
          props: {
            clearable: true,
            type: 'daterange'
          }
        },
        {
          component: 'BaseSelect',
          key: 'channel',
          label: '营养师类型',
          props: {
            clearable: true,
            options: mapToOptions(BroderTypeMap, { label: '全部', value: null })
          }
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入手机号',
          props: {
            clearable: true
          }
        }
      ]
    };
  },
  methods: {

    async exportClick() {
      this.$store.state.bloading = true;
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;

      const data = await this.getAllTableData();
      this.$store.state.bloading = false;
      exportExcel({
        filename,
        data,
        columns: this.table.col
      });
    },
    getAllTableData() {
      return this.$request('Channel/queryAgentProfitList', {
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
    borderTypeFormatter(row) {
      return BroderTypeMap[row.parentType];
    },

    goDetail(id, type) {
      let date = {}
      if (this.queryParams.date && this.queryParams.date.length) {
        date = {
          startTime: this.$day(this.queryParams.date[0]).format('YYYY-MM-DD'),
          endTime: this.$day(this.queryParams.date[1]).format('YYYY-MM-DD')
        }
      }
      this.$pushRoute('detail', {
        query: {
          id,
          type,
          ...date
        }
      });
    },
    getTableData() {
      this.$request('Channel/queryAgentProfitList', this.tableRequestParams).then(
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
    this.queryParams.date = [this.$day().format('YYYY-MM-DD'), this.$day().format('YYYY-MM-DD')];
    this.getTableData();
  }
};

</script>
