<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        :label-width="120"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">新建</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="toUpdate(row)"
            >{{row.tpiStatus == '10' ? '禁用' : '启用'}}</span>
            <span class="brand-color cursor-pointer action-label" @click="toDetail(row)">下级</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="title"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">渠道经理手机：</span>
          <el-input
            clearable
            class="medium-input"
            maxlength="11"
            v-model="currentTag.tpiPhone"
            @blur="broderPhoneBlur"
          ></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">渠道经理昵称：</span>
          <span>{{currentTag.uname}}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">渠道经理名称：</span>
          <el-input clearable class="medium-input" v-model="currentTag.tpiName"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">渠道主管：</span>
          <BaseSelect class="medium-input" :options="optionsB" v-model="currentTag.tpiPid"></BaseSelect>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import BaseSelect from '@/components/BaseSelect.vue';

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    BaseSelect
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.getManager();
    this.getList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      editDialogVisible: false,
      title: '',
      currentTag: {
        openMarket: '30',
        tpiType: '09',
        uname: '',
        tpiPhone: '',
        tpiName: '',
        tpiCategory: '',
        tpiPid: '',
        tpiProfitRatio: '',
      },
      optionsB: [],
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '渠道经理姓名',
          prop: 'tpiName'
        },
        {
          label: '手机',
          prop: 'tpiPhone'
        },
        {
          label: '下级渠道数',
          prop: 'lowerNum'
        },
        {
          label: '当前状态',
          prop: 'tpiStatusDesc'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        openMarket: '30',
        tpiType: '09',
        phone: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          label: '手机',
          placeholder: '请输入手机',
          props: {
            clearable: true,
          },
        }
      ],
    };
  },
  methods: {
    async getManager() {
      const params = {
        openMarket: '30',
        tpiType: '08'
      };
      const res = await this.$http('partner.Channel/queryChannelManangerList', params);
      if (!res.errMsg) {
        this.optionsB = res.obj.map(val => ({label: val.tpiName + ' ' + val.tpiCategory + ' ' + val.tpiPhone, value: val.tpiId}));
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('partner.Channel/queryMarketManagerPage', params);
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
      const res = await this.$http('partner.Channel/queryMarketManagerPage', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      });
    },
    toCreate() {
      this.title = '添加渠道经理';
      this.currentTag = {
        openMarket: '30',
        tpiType: '09',
        uname: '',
        tpiPhone: '',
        tpiName: '',
        tpiCategory: '',
        tpiPid: '',
        tpiProfitRatio: ''
      }
      this.editDialogVisible = true;
    },
    async toEdit(row) {
      this.title = '编辑渠道经理';
      this.editDialogVisible = true;
      const res = await this.$http('partner.Channel/queryChannelManagerInfo', {tpiId: row.tpiId});
      Object.assign(this.currentTag, res.obj);
      const item = this.optionsB.find(val => val.value == this.currentTag.tpiPid);
      this.currentTag.tpiPid = item ? this.currentTag.tpiPid : '';
    },
    async toUpdate(row) {
      const opType = row.tpiStatus == '10' ? '20' : '10';
      const res = await this.$http('partner.Channel/updateStatus', {tpiId : row.tpiId, opType });
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.getList();
      } else {
        this.$msg(res.errMsg, 'error');
      }
    },
    toDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          tpiId : row.tpiId ,
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
      delete params.date;
      return params;
    },
    async broderPhoneBlur() {
      if (this.currentTag.tpiPhone.length === 11) {
        const res = await this.$http('Customer/queryCustomerByPhone', { phone: this.currentTag.tpiPhone });
        if (res.errMsg) {
          this.$msg(res.errMsg, 'error');
          this.currentTag.uname = '';
          return;
        }
        this.currentTag.uname = res.obj.uname;
      } else {
        this.$msg('请输入正确的手机号', 'error');
      }
    },
    async tagConfirm(done) {
      if (!this.currentTag.tpiPhone) {
        this.$msg('请输入手机号', 'error');
        done();
        return;
      }
      if (!this.currentTag.uname) {
        this.$msg('请输入正确的手机号', 'error');
        done();
        return;
      }
      if (!this.currentTag.tpiName) {
        this.$msg('请输入名称', 'error');
        done();
        return;
      }
      if (!this.currentTag.tpiPid) {
        this.$msg('请选择渠道主管', 'error');
        done();
        return;
      }
      const res = await this.$http('partner.Channel/editChannelManager', this.currentTag);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.editDialogVisible = false;
        this.getList();
        setTimeout(done(), 800);
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
</style>
