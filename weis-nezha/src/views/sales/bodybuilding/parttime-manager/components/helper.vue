<template>
  <div class="page-container" style="padding: 20px 0">
    <div style="width: 100%;">
      <el-button style="float:right;margin-bottom: 20px;" type="primary" @click="addHepler">添加助手</el-button>
    </div>
    <div>
      <BasePageTable :data="tableData" :visible="false" border>
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="span" @click="unBinding(row)" v-if="row.tcrState == '01'">解绑</span>
            <span class="span" v-else>已解绑</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="hasDialog"
      title="备注"
      :close-on-click-modal="false"
      :async-confirm="true"
      :auto-confirm="false"
      @on-confirm="onconfirm"
    >
      <el-form label-width="130px">
        <el-form-item label="助手电话">
          <el-input
            class="small-input"
            maxlength="11"
            style="width: 350px;"
            v-model="current.phone"
            @blur="broderPhoneBlur"
          ></el-input>
        </el-form-item>
        <el-form-item label="助手名称">{{current.uname}}</el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'crowdfunding_dish-list',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  created() {
    this.queryParams.id = this.$route.query && this.$route.query.id;
    this.getList();
  },
  data() {
    return {
      hasDialog: false,
      tableData: [],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: 50
        },
        {
          label: '助手ID',
          prop: 'helperId'
        },
        {
          label: '助手名称',
          prop: 'helperName'
        },
        {
          label: '电话号码',
          prop: 'helperPhone',
        },
        {
          label: '兼职客户经理',
          prop: 'counselorName'
        },
        {
          label: '兼职客户经理电话',
          prop: 'counselorPhone'
        },
      ],
      queryParams: {
        counselorId: '',
        marketType: '02',
      },
      current: {
        phone: '',
        uname: '',
        uid: '',
      }
    };
  },
  methods: {
    addHepler() {
      this.current = {
        phone: '',
        uname: '',
        uid: '',
      };
      this.hasDialog = true;
    },
    async broderPhoneBlur() {
      if (this.current.phone.length === 11) {
        const res = await this.$http('Customer/queryCustomerByPhone', {phone: this.current.phone});
        Object.assign(this.current, res.obj);
      } else {
        this.current = {
          phone: '',
          uname: '',
          uid: '',
        };
      }
    },
    async getList() {
      const res = await this.$http('Channel/queryHelperList', {...this.queryParams});
      this.tableData = res.obj;
    },
    async onconfirm(done) {
      if (!this.current.uid) {
        this.$msg('请输入正确的助手手机', 'error');
        done();
        return;
      }
      const res =  await this.$http('Channel/bandingHelper', {id: this.queryParams.id, marketType: '02', uid: this.current.uid});
      if (!res.errMsg) {
        this.$msg('绑定成功', 'success');
        this.hasDialog = false;
        this.getList();
        this.current.phone = {
          phone: '',
          uname: '',
          uid: '',
        };
        this.$nt(() => {
          setTimeout(done, 500);
        });
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    },
    async unBinding(row) {
      this.$confirm('确认解绑？', '确认解绑？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('Channel/unbandingHelper', {id: this.queryParams.id, helperId: row.helperId});
        if (!res.errMsg) {
          this.$msg('解绑成功', 'success');
          this.getList();
        } else {
          this.$msg(res.errMsg, 'error');
        }
      })
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  flex-wrap: wrap;
  margin: 22px 0 22px 0;
}
.span {
  cursor: pointer;
  color: #409eff;
  margin: 0 5px;
  display: inline-block;
}
.medium-input {
  width: 240px;
  margin-right: 10px;
}
</style>
