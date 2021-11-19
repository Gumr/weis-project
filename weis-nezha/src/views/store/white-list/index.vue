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
          <el-button type="primary" @click="showAdd">添加白名单</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="showRemove(row.phone)">移除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="addDialog"
      title="添加白名单"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirmAdd"
    >
      <el-form label-width="130px">
        <el-form-item label="会员手机">
          <el-input
            class="small-input"
            v-model="uphone"
            maxlength="11"
            @blur="getUserInfo"
            onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
          ></el-input>
        </el-form-item>
        <el-form-item label="会员昵称">{{uname}}</el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="delDialog"
      title="确定移除该会员？"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="onconfirmRemove"
    >
      <el-form label-width="130px">
        <el-form-item label="会员昵称">{{uname}}</el-form-item>
        <el-form-item label="会员手机">{{uphone}}</el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  name: 'store_white-list',
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
        phone: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'phone',
          label: '手机号',
          placeholder: '请输入手机号',
          props: {
            clearable: true,
          },
        }
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index'
        },
        {
          label: '会员ID',
          prop: 'tgfeUid'
        },
        {
          label: '会员昵称',
          prop: 'uname'
        },
        {
          label: '会员手机号',
          prop: 'phone'
        },
        {
          label: '推荐人',
          prop: 'referrer'
        },
        {
          label: '注册时间',
          prop: 'ctime'
        },
      ],
      uname: '',
      uid: '',
      uphone: '',
      addDialog: false,
      delDialog: false,
    };
  },
  created() {
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    goPage(type, row) {
      this.$router.push({
        path: `${this.$route.path}/${type}`,
        query: {
          id: row.tfmId
        }
      });
    },
    getList() {
      this.$store.state.vloading = true;
      this.$request('WhiteList/getAll', {
        ...this.page,
        ...this.queryParams
      }).thenwrap((err, dataPage) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.$nt(() => {
              this.$refs.table.doLayout();
            });
          }
        });
    },
    showAdd() {
      this.addDialog = true;
      this.uname = '';
      this.uphone = '';
    },
    onconfirmAdd() {
      if (this.uname === '') {
        this.$message({ type: 'error', message: '没有该会员！' });
      } else {
        this.$request('WhiteList/add', { uid: this.uid }).then(
          this.$rw((err) => {
            if (!err) {
              this.$message({ type: 'success', message: '添加成功' });
              this.addDialog = false;
              this.getList();
            } else {
              this.$message({ type: 'error', message: err.errMsg });
            }
          })
        );
      }
    },
    showRemove(uphone) {
      this.delDialog = true;
      this.uname = '';
      this.uphone = uphone;
      this.getUserInfo();
    },
    onconfirmRemove() {
      this.$request('WhiteList/del', { uid: this.uid }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.$message({ type: 'success', message: '移除成功' });
            this.delDialog = false;
            this.getList();
          } else {
            this.$message({ type: 'error', message: err.errMsg });
          }
        })
      );
    },
    getUserInfo() {
      this.$request('WhiteList/getUserInfoForAdd', { phone: this.uphone }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.uid = dataPage.uid;
            this.uname = dataPage.uname;
          }
        })
      );
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
