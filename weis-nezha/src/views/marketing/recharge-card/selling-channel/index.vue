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
      <el-button type="danger" @click="toCreate">新建渠道</el-button>
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
            <span class="brand-color cursor-pointer action-label margin" @click="toEdit(row)">编辑</span>
            <span
              class="brand-color cursor-pointer action-label margin"
              @click="toHide('close', row.channelId)"
              v-if="row.stt === '在线'"
            >下线</span>
            <span
              class="brand-color cursor-pointer action-label margin"
              @click="toHide('open', row.channelId)"
              v-if="row.stt === '下线'"
            >上线</span>
            <span class="brand-color cursor-pointer action-label" @click="toDel(row.channelId)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="addDialog"
      title="新建渠道"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <el-form :model="currentChannel" label-width="130px">
        <el-form-item label="渠道名称">
          <el-input class="small-input" maxlength="20" v-model="currentChannel.channelName"></el-input>
        </el-form-item>
        <el-form-item label="渠道负责人">
          <el-input class="small-input" maxlength="20" v-model="currentChannel.principal"></el-input>
        </el-form-item>
        <el-form-item label="负责人手机">
          <el-input class="small-input" min="0" maxlength="11" v-model="currentChannel.phone"></el-input>
        </el-form-item>
        <el-form-item label="渠道折扣">
          <el-input
            class="small-input"
            style="margin-right: 10px;"
            min="0"
            maxlength="11"
            @blur="checkText"
            v-model="currentChannel.discount"
          ></el-input>折
        </el-form-item>
        <span style="font-size: 12px;color:red;margin-left: 140px;">0 ≤ 折扣 ≤ 10</span>
        <span style="font-size: 12px;color:red;margin-left: 20px;">例：输入7则代表卡的售卖价为面额的70%</span>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import exportExcel from '@/utils/export-excel';
import ConfirmDialog from '@/components/ConfirmDialog.vue';


export default {
  name: 'marketing_recharge-card_selling-channel',
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
        stt: '',
        channelName: ''
      },
      currentChannel: {
        channelName: '',
        principal: '',
        phone: '',
        discount: ''
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部状态',
                value: ''
              },
              {
                label: '在线',
                value: '00'
              },
              {
                label: '下线',
                value: '01'
              }
            ]
          },
        },
        {
          component: 'el-input',
          key: 'channelName',
          label: '渠道名称',
          placeholder: '请输入渠道名称',
          props: {
            clearable: true,
          },
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '渠道ID',
          prop: 'channelId'
        },
        {
          label: '渠道名称',
          prop: 'channelName'
        },
        {
          label: '渠道负责人',
          prop: 'principal'
        },
        {
          label: '负责人手机',
          prop: 'phone'
        },
        {
          label: '折扣',
          prop: 'discount'
        },
        {
          label: '当前状态',
          prop: 'stt'
        },
        {
          label: '最后操作人',
          prop: 'operator'
        },
        {
          label: '最后操作时间',
          prop: 'utime'
        },
      ],
      addDialog: false,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    checkText() {
      this.currentChannel.discount = isNaN(this.currentChannel.discount) ? 0 : this.currentChannel.discount;
      this.currentChannel.discount = Number(this.currentChannel.discount).toFixed(1);
    },
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
      this.$request('card.Channel/getChannels', {
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
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.$store.state.bloading = true;
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
      return this.$request('card.Channel/getChannels', {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal,
      });
    },
    onconfirm(done) {
      if (!this.currentChannel.channelName) {
        this.$message({type: 'error', message: '请输入渠道名称'});
        done();
        return;
      }
      if (!this.currentChannel.principal) {
        this.$message({type: 'error', message: '请输入渠道负责人'});
        done();
        return;
      }
      if (!(/^1[3456789]\d{9}$/.test(this.currentChannel.phone))) {
        this.$message({type: 'error', message: '请输入正确的手机号'});
        done();
        return;
      }
      if (!this.currentChannel.discount) {
        this.$message({type: 'error', message: '请输入折扣信息'});
        done();
        return;
      }
      if (this.currentChannel.discount < 0 || this.currentChannel.discount > 10) {
        this.$message({type: 'error', message: '请输入正确的折扣'});
        done();
        return;
      }
      let url = 'card.Channel/addChannel';
      if (this.currentChannel.channelId) {
        url = 'card.Channel/editChannel'
      }
      this.$request(url, {
        ...this.currentChannel,
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.addDialog = false
            this.$message({type: 'success', message: '操作成功！'});
            this.getList();
            this.$nt(() => {
              setTimeout(done,300)
            });
          } else {
            this.$message({type: 'error', message: err.errMsg});
            done();
          }
        })
      );
    },
    toCreate() {
      this.addDialog = true;
      this.currentChannel = {
        channelName: '',
        principal: '',
        phone: '',
        discount: ''
      };
    },
    toEdit(row) {
      this.addDialog = true;
      this.currentChannel = {
        channelId: row.channelId,
        channelName: row.channelName,
        principal: row.principal,
        phone: row.phone,
        discount: row.discount
      };
    },
    toHide(type, id) {
      const url = {
        open: 'card.Channel/openChannel',
        close: 'card.Channel/closeChannel',
        delete: 'card.Channel/delChannel'
      }[type];
      this.$request(url, {channelId: id}).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({type: 'success', message: '操作成功！'});
            this.getList();
          } else {
            this.$message({type: 'error', message: err.errMsg});
          }
        })
      );
    },
    toDel(id) {
      this.$confirm('确认删除吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('点击确定');
        this.toHide('delete', id);
      }).catch(() => {
        console.log('点击取消');
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
.margin {
  margin-right: 10px;
}
</style>
