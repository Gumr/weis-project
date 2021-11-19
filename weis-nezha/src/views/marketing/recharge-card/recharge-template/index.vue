<template>
  <div class="page-container">
    <div style="margin: 14px 0">
      <ButtonTabs v-model="activeTab" :tabs="tabs" @change="changes"></ButtonTabs>
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
          <el-button type="primary" @click="goPage('edit', '1')">添加卡模板</el-button
          >
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
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="goPage('edit', row)">编辑</span>
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="update(row, 'close')" v-if="row.stt === '00'">下线</span>
            <span class="brand-color cursor-pointer action-label" style="margin-right: 10px" @click="update(row, 'open')" v-if="row.stt === '01'">上线</span>
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
import ButtonTabs from '@/components/ButtonTabs.vue';
import { transformDaterange } from '@/utils/transform';

export default {
  name: 'marketing_recharge-card_recharge-template',
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
      activeTab: 0,
      tabs: [
        {
          label: '线上',
          value: 0
        },
        {
          label: '线下',
          value: 1
        }
      ],
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        name: '',
        stt: ''
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'name',
          label: '套餐模板',
          placeholder: '请输入套餐模板名',
          props: {
            clearable: true,
          },
        },
        {
          component: 'BaseSelect',
          key: 'stt',
          label: '状态',
          props: {
            options: [
              {
                label: '全部状态',
                value: ''
              }, {
                label: '在线',
                value: '00'
              }, {
                label: '下线',
                value: '01'
              }
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
          label: '卡模板ID',
          prop: 'cid'
        },
        {
          label: '卡模板名称',
          prop: 'name'
        },
        {
          label: '卡面金额',
          prop: 'amount'
        },
        {
          label: '卡销售期',
          prop: 'sellingTime'
        },
        {
          label: '当前状态',
          prop: 'strStt'
        },
        {
          label: '操作人',
          prop: 'operator'
        },
        {
          label: '最后编辑时间',
          prop: 'utime'
        }
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    changes() {
      this.searchClick();
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
          type: row === '1' ? 'create' : 'edit',
          id: row.id,
          tab: this.activeTab
        }
      });
    },
    getList() {
      const url = {
        0: 'card.Model/getAllForOnLine',
        1: 'card.Model/getAllForOffline'
      }[this.activeTab];
      this.$store.state.vloading = true;
      this.$request(url, {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, dataPage) => {
          this.$store.state.vloading = false;
          if (!err) {
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
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
    update(row, type) {
      const url = {
        open: 'card.Model/open',
        close: 'card.Model/close'
      }[type];
      this.$request(url, { id: row.id }).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: 'success', message: '操作成功！' });
            this.getList();
          } else {
            this.$message({ type: 'error', message: err.errMsg });
          }
        })
      );
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
</style>
