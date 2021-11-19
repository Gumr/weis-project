<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs v-model="activeTab" :tabs="tabs" @change="changes" />
    </div>
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
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          :render-header="col.renderHeader"
          v-bind="col"
        ></el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
import { h } from 'vue'
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';
import ButtonTabs from '@/components/ButtonTabs.vue';

export default {
  name: 'marketing_recharge-card_recharge-list',
  components: {
    QueryComponents,
    BasePageTable,
    ButtonTabs
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  data() {
    return {
      height: window.innerHeight - 330,
      activeTab: '00',
      tabs: [
        {
          label: '线上',
          value: '00'
        },
        {
          label: '线下',
          value: '01'
        }
      ],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        cid: '',
        type: '00',
        phone: '',
        stt: '',
        cdate: [],
        usedate: [],
        batchNumber: ''
      },
      queryComps: [

      ],
      tableCol: [

      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    changes() {
      this.queryParams.type = this.activeTab;
      this.page.pageNo = 1;
      this.getList();
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('card.UserAcquireRecord/getAllForUser', {
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
            if (this.activeTab === '00') {
              this.queryComps = [
                {
                  component: 'el-date-picker',
                  key: 'cdate',
                  label: '购买时间',
                  placeholder: '购买时间',
                  props: {
                    type: 'daterange',
                    'value-format': 'yyyy-MM-dd',
                  }
                },
                {
                  component: 'el-date-picker',
                  key: 'usedate',
                  label: '使用时间',
                  placeholder: '使用时间',
                  props: {
                    type: 'daterange',
                    'value-format': 'yyyy-MM-dd',
                  }
                },
                {
                  component: 'BaseSelect',
                  key: 'stt',
                  label: '状态',
                  props: {
                    options: [
                      { label: '全部状态', value: '' },
                      { label: '未生效', value: '00' },
                      { label: '未使用', value: '01' },
                      { label: '已使用', value: '02' },
                      { label: '已失效', value: '03' }
                    ]
                  }
                },
                {
                  component: 'el-input',
                  key: 'cid',
                  label: '卡ID',
                  placeholder: '请输入卡券ID',
                  props: {
                    clearable: true,
                  },
                },
                {
                  component: 'el-input',
                  key: 'phone',
                  label: '手机',
                  placeholder: '请输入购买人手机',
                  props: {
                    clearable: true,
                  },
                },
              ];
              this.tableCol = [
                { label: '序号', type: 'index' },
                { label: '卡ID', prop: 'cid' },
                { label: '卡模板名称', prop: 'name' },
                { label: '卡面金额', prop: 'amount' },
                { label: '卡销售期', prop: 'sellTime', },
                { label: '卡使用有效期', prop: 'useDeadline' },
                { label: '类型', prop: 'strType' },
                { label: '购买人昵称', prop: 'buyUname' },
                { label: '购买人手机', prop: 'phone' },
                { label: '是否转赠', prop: 'isSend' },
                { label: '使用人昵称', prop: 'useUname' },
                { label: '购买端口', prop: 'buyPort' },
                { label: '使用端口', prop: 'usePort' },
                { label: '购买时间', prop: 'ctime' },
                { label: '使用时间', prop: 'useTime' },
                { label: '充值时绑定的客户经理', prop: 'useCounselor', formatter: row => row.useCounselor || '无' },
                { label: '手机', prop: 'useCounselorPhone', formatter: row => (row.useCounselorPhone == '0' ? '无' : row.useCounselorPhone) },
                { label: '充值时绑定的营养师', prop: 'useDietician', formatter: row => row.useDietician || '无' },
                { label: '手机', prop: 'useDieticianPhone', formatter: row => (row.useDieticianPhone == '0' ? '无' : row.useDieticianPhone) },
                { label: '用户注册的渠道', prop: 'channelManager', formatter: row => row.channelManager || '无' },
                { label: '手机', prop: 'channelManagerPhone', formatter: row => (row.channelManagerPhone == '0' ? '无' : row.channelManagerPhone) },
                { label: '当前状态', prop: 'strStt' }
              ];
            } else {
              this.queryComps = [
                {
                  component: 'el-date-picker',
                  key: 'usedate',
                  label: '使用时间',
                  placeholder: '使用时间',
                  props: {
                    type: 'daterange',
                    'value-format': 'yyyy-MM-dd',
                  }
                },
                {
                  component: 'BaseSelect',
                  key: 'stt',
                  label: '状态',
                  props: {
                    options: [
                      { label: '全部状态', value: '' },
                      { label: '未生效', value: '00' },
                      { label: '未使用', value: '01' },
                      { label: '已使用', value: '02' },
                      { label: '已失效', value: '03' }
                    ]
                  }
                },
                {
                  component: 'el-input',
                  key: 'cid',
                  label: '卡ID',
                  placeholder: '请输入卡券ID',
                  props: {
                    clearable: true,
                  },
                },
                {
                  component: 'el-input',
                  key: 'phone',
                  label: '手机',
                  placeholder: '请输入购买人手机',
                  props: {
                    clearable: true,
                  },
                },
              ];
              this.tableCol = [
                { label: '序号', type: 'index' },
                { label: '卡ID', prop: 'cid' },
                { label: '卡批次', prop: 'batchNumber' },
                { label: '卡模板名称', prop: 'name' },
                { label: '卡面金额', prop: 'amount' },
                { label: '兑换码', prop: 'code' },
                { label: '卡使用有效期', prop: 'useDeadline' },
                { label: '类型', prop: 'strType' },
                { label: '个人/活动渠道', prop: 'channel' },
                { label: '使用人昵称', prop: 'useUname' },
                { label: '使用人手机', prop: 'usePhone' },
                { label: '使用端口', prop: 'usePort' },
                { label: '使用时间', prop: 'useTime' },
                { label: '充值时绑定的客户经理', prop: 'useCounselor', formatter: row => row.useCounselor || '无' },
                { label: '手机', prop: 'useCounselorPhone', formatter: row => (row.useCounselorPhone == '0' ? '无' : row.useCounselorPhone) },
                { label: '充值时绑定的营养师', prop: 'useDietician', formatter: row => row.useDietician || '无' },
                { label: '手机', prop: 'useDieticianPhone', formatter: row => (row.useDieticianPhone == '0' ? '无' : row.useDieticianPhone) },
                { label: '用户注册的渠道', prop: 'channelManager', formatter: row => row.channelManager || '无' },
                { label: '手机', prop: 'channelManagerPhone', formatter: row => (row.channelManagerPhone == '0' ? '无' : row.channelManagerPhone) },
                {
                  label: '分配的渠道', prop: 'distributionChannel', width: 120, renderHeader: this.renderHeader, formatter: row => (row.distributionChannel == '0' ? '无' : row.distributionChannel)
                },
                { label: '手机', prop: 'distributionChannelPhone', formatter: row => (row.distributionChannelPhone == '0' ? '无' : row.distributionChannelPhone) },
                { label: '当前状态', prop: 'strStt' }
              ];
            }
          }
        })
      );
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.cdate && params.cdate.length > 0) {
        const [startcDate, endcDate] = transformDaterange(params.cdate);
        params.startcDate = startcDate.format('YYYY-MM-DD');
        params.endcDate = endcDate.format('YYYY-MM-DD');
      }
      if (params.usedate && params.usedate.length > 0) {
        const [startUseDate, endUseDate] = transformDaterange(params.usedate);
        params.startUseDate = startUseDate.format('YYYY-MM-DD');
        params.endUseDate = endUseDate.format('YYYY-MM-DD');
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
      return this.$request('card.UserAcquireRecord/getAllForUser', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      });
    },
    renderHeader(props) {
      return h('div', [
        h('span', props.column.label),
        h(
          'el-tooltip',
          {
            props: {
              effect: 'dark',
              content: '仅渠道经理拓展',
              placement: 'top',
            },
          },
          [
            h('i', {
              class: 'el-icon-question',
              style: 'color:gray;margin-left:5px;',
            }),
          ],
        ),
      ]);
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
