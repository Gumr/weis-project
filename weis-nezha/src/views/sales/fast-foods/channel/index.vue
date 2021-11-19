<template>
  <div class="page-container">
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
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">新建渠道</el-button>
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
            <!-- <span class="brand-color cursor-pointer action-label" @click="toDel(row)">删除</span> -->
            <span class="brand-color cursor-pointer action-label" @click="toDetail(row)">下级明细</span>
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
        <div class="section-item" v-if="title == '编辑渠道'">
          <span class="section-label label-1">渠道ID：</span>
          <span>{{currentTag.tpiId}}</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>渠道：
          </span>
          <el-input clearable class="medium-input" v-model="currentTag.tpiName"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>渠道手机：
          </span>
          <el-input clearable class="medium-input" v-model="currentTag.tpiPhone"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>渠道类型：
          </span>
          <BaseSelect
            class="medium-input"
            :options="channelTypeOptions"
            v-model="currentTag.tpiChannelType"
          ></BaseSelect>
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>渠道提成：
          </span>
          <el-input
            clearable
            class="medium-input"
            v-model="currentTag.tpiProfitRatio"
            @blur="checkText"
          ></el-input>%
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>客户经理提成
          </span>
          <el-input
            clearable
            class="medium-input"
            v-model="currentTag.tpiCounselorRatio"
            @blur="checkText"
          ></el-input>%
        </div>
        <div class="section-item">
          <span class="section-label label-1">
            <span style="color:red">*</span>上级渠道经理：
          </span>
          <BaseSelect class="medium-input" :options="options" v-model="currentTag.tpiPid"></BaseSelect>
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
import { channelTypeOptions } from '@/utils/data-map'
export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
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
      options: [],
      channelTypeOptions,
      currentTag: {
        tpiName: '',
        tpiPhone: '',
        openMarket: '30',
        tpiPid: '',
        tpiCounselorRatio: '', // 客户经理提成比
        tpiChannelType: '',
        tpiProfitRatio: '',
        // tpiChannelType: '',
      },
      tableData: [],
      tableDataTotal: 0,
      optionsB: [
        {label: 'A', value: 'A'},
        {label: 'B', value: 'B'},
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '渠道名称',
          prop: 'tpiName'
        },
        {
          label: '渠道手机',
          prop: 'tpiPhone'
        },
        {
          label: '类别',
          prop: 'tpiChannelTypeDesc'
        },
        {
          label: '渠道提成',
          prop: 'tpiProfitRatio',
          formatter: row => row.tpiProfitRatio + '%'
        },
        {
          label: '客户经理提成',
          prop: 'tpiCounselorRatio',
          formatter: row => row.tpiCounselorRatio + '%'
        },
        {
          label: '上级渠道经理手机号',
          prop: 'tpiPartnerPhone'
        },
        {
          label: '下属渠道码人数',
          prop: 'representCount'
        },
        {
          label: '当前拓客人数',
          prop: 'customerCount'
        },
        {
          label: '创建时间',
          prop: 'ctime'
        },
        {
          label: '创建人',
          prop: 'creator'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        name: '',
        phone: '',
        openMarket: '30',
        tpiChannelType: '',
        // category: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'name',
          label: '渠道',
          placeholder: '渠道',
          props: {
            clearable: true
          },
        },
        {
          component: 'el-input',
          key: 'phone',
          label: '渠道手机',
          placeholder: '渠道手机',
          props: {
            clearable: true
          },
        },
        {
          component: 'BaseSelect',
          key: 'tpiChannelType',
          label: '类别',
          placeholder: '类别',
          props: {
            clearable: true,
            options: channelTypeOptions
          },
        },
      ],
    };
  },
  methods: {
    checkText() {
      let number = this.currentTag.tpiProfitRatio;
      number = isNaN(number) ? '' : number;
      number = Number(number).toFixed(2);
      this.currentTag.tpiProfitRatio = number;
    },
    async getManager() {
      const params = {
        openMarket: '30',
        tpiType: '09'
      };
      const res = await this.$http('partner.Channel/queryChannelManangerList', params);
      if (!res.errMsg) {
        this.options = res.obj.map(val => ({label: val.tpiName + ' ' + val.tpiCategory + ' ' + val.tpiPhone, value: val.tpiId}));
      }
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      this.$store.state.vloading = true;
      const res = await this.$http('partner.Channel/queryChannelPage', params);
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
      const res = await this.$http('partner.Channel/queryChannelPage', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record
      });
    },
    toCreate() {
      this.title = '新建渠道';
      this.currentTag = {
        tpiName: '',
        tpiPhone: '',
        openMarket: '30',
        tpiPid: '',
        tpiCounselorRatio: '',
        tpiProfitRatio: '',
        tpiChannelType: ''
      }
      this.editDialogVisible = true;
    },
    async toEdit(row) {
      this.editDialogVisible = true;
      this.title = '编辑渠道';
      const res = await this.$http('partner.Channel/queryChannelManagerInfo', {tpiId: row.tpiId});
      this.currentTag = {
        tpiName: '',
        tpiPhone: '',
        openMarket: '30',
        tpiPid: '',
        tpiCounselorRatio: '',
        tpiProfitRatio: '',
        tpiChannelType: ''
      }
      Object.assign(this.currentTag, res.obj);

      this.currentTag.tpiChannelType = row.tpiChannelType
      this.currentTag.tpiCounselorRatio = row.tpiCounselorRatio 
      const item = this.options.find(val => val.value == this.currentTag.tpiPid);
      this.currentTag.tpiPid = item ? this.currentTag.tpiPid : '';
    },
    async toDel(row) {
      this.$confirm('确定删除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('FoodUnit/deleteUnit', {tfsId: row.tfsId});
        if (!res.errMsg) {
          this.$msg('操作成功', 'success');
          this.getList();
        } else {
          this.$msg(res.errMsg, 'error');
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
    async tagConfirm(done) {
      if (!this.currentTag.tpiName) {
        this.$msg('请输入渠道名称', 'error');
        done();
        return;
      }
      if (!this.currentTag.tpiPhone) {
        this.$msg('请输入渠道手机', 'error');
        done();
        return;
      }
      if (!this.currentTag.tpiProfitRatio) {
        this.$msg('请输入提成', 'error');
        done();
        return;
      }
      const params = this.$deepClone(this.currentTag);
      const res = await this.$http('partner.Channel/editChannel', params);
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
    toDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          tpiId: row.tpiId,
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
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
  width: 450px;
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
