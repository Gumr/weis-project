<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="120"
      >
        <template #action>
          <el-button
            type="primary"
            @click="searchClick()"
          >搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
        </template>
      </QueryComponents>

      <el-button
        type="primary"
        @click="jump()"
      >新建</el-button>
    </div>

    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableData"
        :total="tableDataTotal"
        border
        @current-page-change="getList"
        @size-change="getList"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
          align="center"
        >
          <template
            #default="{ row }"
            class="action-cell"
            v-if="col.prop == 'coverImg' ||col.prop == 'detailsImg' "
          >
            <el-image
              v-if="col.prop == 'coverImg'"
              :src="row.coverImg[0]"
              :preview-src-list="row.coverImg"
            />
            <el-image
              v-if="col.prop == 'detailsImg'"
              :src="row.detailsImg[0]"
              :preview-src-list="row.detailsImg"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right:10px"
              @click="jump(row)"
            >编辑</span>
            <!-- <span
              class="brand-color cursor-pointer"
              style="margin-right:10px"
              @click="deleteTagClick(row.douPackId)"
            >删除</span> -->
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-right:10px"
              @click="jump(row,'detail')"
            >详情</span>
            <span
              class="brand-color cursor-pointer"
              :class="row.stt == '上线'?'redSpan' :''"
              style="margin-right:10px"
              @click="updateStt(row)"
            >{{row.stt == '上线'?'下线' :'上线'}}</span>
            
          </template>
        </el-table-column>
      </BasePageTable>
    </div>

  </div>
</template>

<script>
import exportExcel from "@/utils/export-excel";

export default {
  components: {},
  data() {
    return {
      currentTag: {},
      tagCategoryOpts: [],
      editDialogVisible: false,
      // height: window.innerHeight - 280,
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "套餐包名称",
          prop: "douPackName",
        },
        {
          label: "封面",
          prop: "coverImg",
        },

        {
          label: "详情图",
          prop: "detailsImg",
        },
        {
          label: "上架类目",
          prop: "classify",
        },
        {
          label: "售卖天数餐数",
          formatter: (row) => `${row.daysNum}天,每天${row.mealsNum}餐`,
        },
        {
          label: "套餐包原价",
          prop: "comboTotalPrice",
        },
        {
          label: "套餐包价格(含配送费)",
          prop: "sellPrice",
        },
        {
          label: "排序",
          prop: "sort",
        },
          {
          label: "状态",
          prop: "stt",
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryParams: {
        douPackName: "", //用户手机号
        comboName: "",
        skuName: "",
      },
      queryComps: {
        Comps3: [
          {
            label: "套餐包名称",
            component: "el-input",
            key: "douPackName",

            props: {
              clearable: true,
            },
          },
          {
            label: "套餐名称",
            component: "el-input",
            key: "comboName",

            props: {
              clearable: true,
            },
          },
          {
            label: "菜品名称",
            component: "el-input",
            key: "skuName",

            props: {
              clearable: true,
            },
          },
        ],
      },
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps.Comps3];
      return list;
    },
  },
  created() {},
  mounted() {
    this.getList(); //查询套餐包列表
  },
  methods: {
    async getTarget() {
      const res = await this.$http(
        "discover.DiscoverLabel/queryTargetList",
        {}
      );
      this.tagCategoryOpts = res.obj;
    },
    jump(row,type) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          douPackId: row ? row.douPackId : null,
          type:type
        },
      });
    },
    async updateStt(row){
       const res = await this.$http("doupack.DouCombo/opDouComboStt", {
        douPackId: row.douPackId,
        stt:row.stt == '上线'?'00' :'10'
      });
      if (!res.errMsg) {
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }


    },
    async deleteTagClick(id) {
      const res = await this.$http("doupack.DouCombo/delDouCombo", {
        douPackId: id,
      });
      if (!res.errMsg) {
        this.getList();
      } else {
        this.$msg(res.errMsg, "error");
      }
    },
    async getList() {
      this.$store.state.vloading = true;
      const res = await this.$http("doupack.DouCombo/queryDouCombo", {
        ...this.page,
        ...this.queryParams,
      });
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      this.page.pageSize = this.tableDataTotal;
      const res = await this.$http("doupack.DouCombo/queryDouCombo", {
        ...this.page,
        ...this.queryParams,
      });
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
  // float: right;
}
.redSpan{
  color: red;
}
// .medium-input {
//   width: 250px;
//   margin-right: 20px;
// }

// .label-1 {
//   width: 170px;
//   margin-right: 12px;
//   text-align: right;
// }
// .action-label {
//   margin-right: 10px;
// }
</style>
