<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="5"
        :label-width="100"
        semi
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="closeStore"
          >不营业时间</el-button>
        </template>
      </QueryComponents>
      <el-button
        class="float-right"
        type="primary"
        @click="goEdit('add', '')"
      >新建ATM</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          label="序号"
          type="index"
          align="center"
          width="50"
        ></el-table-column>
        <el-table-column
          label="机器后台名称"
          prop="thpMachineName"
          align="center"
          
        ></el-table-column>
        <el-table-column
          label="机器编码"
          prop="thpMachineCode"
          align="center"
        ></el-table-column>
        <el-table-column
          label="供餐点名称"
          prop="thpName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="位置"
          prop="thpShopAddress"
          align="center"
        ></el-table-column>
        <el-table-column
          label="运营人员"
          prop="thpShopLeader"
          align="center"
        ></el-table-column>
        <el-table-column
          label="电话"
          prop="thpShopTel"
          align="center"
        ></el-table-column>
        <el-table-column
          label="营业状态"
          prop="thpDataStt"
          align="center"
        >
          <template #default="{ row }">{{row.thpDataStt == '01'?'上线':'下线' }}</template>
        </el-table-column>
        <el-table-column
          label="操作人"
          prop="thpOperator"
          align="center"
        ></el-table-column>
        <el-table-column
          label="操作时间"
          prop="thpUtime"
          align="center"
        >
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template #default="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              @click="goEdit('edit', row)"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="outLine(row.thpId, row.thpDataStt)"
            >{{ row.thpDataStt == "00" ? "上线" : "下线" }}</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="del(row.thpId)"
            >删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
// import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from "@/components/BasePageTable.vue";
import { transformDaterange } from "@/utils/transform";

export default {
  name: "store_ATM",
  components: {
    BasePageTable,
    // QueryComponents
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      queryParams: {
        thpDataStt: "",
        thpId: "",
      },
      queryComps: [
        {
          component: "BaseSelect",
          key: "thpId",
          label: "供餐点名称",
          placeholder: "请选择供餐点名称",
          props: {
            clearable: true,
            options: [],
          },
        },
        {
          component: "BaseSelect",
          key: "thpDataStt",
          label: "营业状态",
          placeholder: "营业状态",
          props: {
            clearable: true,
            options: [
              {
                label: "上线",
                value: "01",
              },
              {
                label: "下线",
                value: "00",
              },
              //  {
              //   label: "删除",
              //   value: "99",
              // },
            ],
          },
        },
      ],
    };
  },
  watch: {
    $route(to, from) {
      this.getList();
    },
  },
  created() {
    this.queryAllMachine();
    this.getList();
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },

    async outLine(id, type) {
      const res = await this.$http("machine.MachineSetting/updateMachineStt", {
        thpId: id,
        opType: type == "00" ? "01" : "00",
      });
      if (!res.errMsg) {
        this.$msg("操作成功", "success");
        this.getList();
      }
    },
    goEdit(type, row) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          type,
          thpId: row.thpId,
        },
      });
    },
    closeStore() {
      this.$router.push({
        path: `${this.$route.path}/close`,
        query: {},
      });
    },
    queryAllMachine() {
      this.$request("HeatingPoint/queryHeatingPointList", {shopType:20}).then(
        this.$rw((err, res) => {
          if (!err) {
            this.queryComps[0].props.options = res;
          }
        })
      );
    },
    async getList() {
      this.$store.state.vloading = true;
      // if (!this.tableData.length) {
      //   this.page.pageNo = this.page.pageNo - 1;
      // }
      const res = await this.$http("machine.MachineSetting/queryAllMachine", {
        ...this.page,
        ...this.genQueryParams(),
      });
      this.tableDataTotal = res.obj.dataPage.totalRecordCount;
      this.tableData = res.obj.dataPage.record;
      this.$nt(() => {
        this.$refs.table.doLayout();
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate;
        params.endDate = endDate;
      }
      delete params.date;
      return params;
    },
    async del(id) {
      this.$confirm("此操作将删除该ATM机, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await this.$request(
          "machine.MachineSetting/deleteMachine",
          {
            thpId: id,
          }
        );
        if (!res.errMsg) {
          this.$msg("操作成功", "success");
          this.getList();
        } else {
          this.$msg(res.errMsg, "error");
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 8px;
}
#container {
  min-width: 600px;
  min-height: 767px;
}

.custom-li {
  list-style-type: none;
}
.txt1 {
  width: 500px;
}
</style>
