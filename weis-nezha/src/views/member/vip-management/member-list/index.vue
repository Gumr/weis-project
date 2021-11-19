<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="3"
        :label-width="80"
        semi
      >
        <template v-slot:action>
          <el-button
            type="primary"
            @click="getList"
          >搜索</el-button>
          <el-button
            type="primary"
            @click="handleExport"
            :loading="$store.state.bloading"
          >{{$store.state.bloading ? '导出中' : '导出'}}</el-button>
        </template>
      </QueryComponents>
    </div>
    <BasePageTable
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      v-loading="$store.state.vloading"
      :data="tableData"
      :total="tableDataTotal"
      border
      @current-page-change="getList"
      @size-change="getList"
      :height="height"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        v-bind="col"
        align="center"
      >
        <template #header>
          {{col.label}}
          <el-popover
            placement="top-start"
            trigger="hover"
            :content="col.label=='会员开通时间'?'会员第一次开通的时间':col.label=='会员到期时间'?'会员最终的到期时间':col.label=='会员期间累计用餐订单数'?'会员期间累计用餐订单数':col.label=='会员券已激活数量'?'购买的会员券，已激活的优惠券数量':col.label=='会员券已使用数量'?'购买的会员券，已使用的优惠券数量':col.label=='会员券已过期数量'?'购买的会员券，已失效的优惠券数量':col.label=='购买16元加量包次数'?'购买16元加量包的次数':col.label=='16元加量包优惠券已激活数量'?'购买的16元加量包，已激活的优惠券数量':col.label=='16元加量包优惠券已使用数量'?'购买的16元加量包，已使用的优惠券数量':col.label=='16元加量包优惠券已过期数量'?'16元加量包优惠券已过期数量':col.label=='购买32元加量包次数'?'购买32元加量包的次数':col.label=='32元加量包优惠券已激活数量'?'购买的32元加量包，已激活的优惠券数量':col.label=='32元加量包优惠券已使用数量'?'购买的32元加量包，已使用的优惠券数量':col.label=='32元加量包优惠券已过期数量'?'32元加量包优惠券已过期数量':col.label=='购买64元加量包次数'?'购买64元加量包的次数':col.label=='64元加量包优惠券已激活数量'?'购买的64元加量包，已激活的优惠券数量':col.label=='64元加量包优惠券已使用数量'?'购买的64元加量包，已使用的优惠券数量':col.label=='64元加量包优惠券已过期数量'?'64元加量包优惠券已过期数量':col.label=='购买96元加量包次数'?'购买96元加量包的次数':col.label=='96元加量包优惠券已激活数量'?'购买的96元加量包，已激活的优惠券数量':col.label=='96元加量包优惠券已使用数量'?'购买的96元加量包，已使用的优惠券数量':col.label=='96元加量包优惠券已过期数量'?'96元加量包优惠券已过期数量':''"
            v-if="col.label !='序号' && col.label !='会员ID' && col.label !='会员名称' && col.label !='会员手机号'"
          >
            <template #reference>
              <span class="el-icon-question"></span>
            </template>
          </el-popover>
        </template>
      </el-table-column>

    </BasePageTable>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import exportExcel from "@/utils/export-excel";
import ButtonTabs from "@/components/ButtonTabs.vue";
export default defineComponent({
  name: "product_route",
  components: {
    ButtonTabs,
  },
  data() {
    return {
      height: window.innerHeight - 330,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      activeTab: "00",
      queryParams: {
        uphone: "", //开始时间 yyyy-mm-dd
       
      },
      queryComps: [
        {
          component: "el-input",
          key: "uphone",
          label: "会员手机号",
          props: {
            clearable: true,
          },
        },
      ],
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "会员ID",
          prop: "uid",
        },
        {
          label: "会员名称",
          prop: "uname",
        },
        {
          label: "会员手机号",
          prop: "uphone",
        },
        {
          label: "会员开通时间",
          prop: "openingDate",
        },
        {
          label: "会员到期时间",
          prop: "memberEndDate",
        },
        {
          label: "会员期间累计用餐订单数",
          prop: "memberOrder",
        },
        {
          label: "会员券已激活数量",
          prop: "activateCollect",
        },
        {
          label: "会员券已使用数量",
          prop: "useCollect",
        },
        {
          label: "会员券已过期数量",
          prop: "staleDatedCollect",
        },
        {
          label: "购买16元加量包次数",
          prop: "countA",
        },
        {
          label: "16元加量包优惠券已激活数量",
          prop: "activateCountA",
        },
        {
          label: "16元加量包优惠券已使用数量",
          prop: "useCollectA",
        },
        {
          label: "16元加量包优惠券已过期数量",
          prop: "staleDatedCollectA",
        },
        {
          label: "购买32元加量包次数",
          prop: "countB",
        },
        {
          label: "32元加量包优惠券已激活数量",
          prop: "activateCountB",
        },
        {
          label: "32元加量包优惠券已使用数量",
          prop: "useCollectB",
        },
        {
          label: "32元加量包优惠券已过期数量",
          prop: "staleDatedCollectB",
        },
        {
          label: "购买64元加量包次数",
          prop: "countC",
        },
        {
          label: "64元加量包优惠券已激活数量",
          prop: "activateCountC",
        },
        {
          label: "64元加量包优惠券已使用数量",
          prop: "useCollectC",
        },

        {
          label: "64元加量包优惠券已过期数量",
          prop: "staleDatedCollectC",
        },
        {
          label: "购买96元加量包次数",
          prop: "countD",
        },
        {
          label: "96元加量包优惠券已激活数量",
          prop: "activateCountD",
        },
        {
          label: "96元加量包优惠券已使用数量",
          prop: "useCollectD",
        },
        {
          label: "96元加量包优惠券已过期数量",
          prop: "staleDatedCollectD",
        },
      ],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {   
      this.$store.state.vloading = true;
      this.$request("data.MemberData/queryMemberList", {
        ...this.page,
        ...this.queryParams,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$store.state.vloading = false;
           
            this.tableDataTotal = res.totalRecordCount ;
            this.tableData = res.record;
          }
        })
      );
    },
    async handleExport() {
      this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.page,
        ...this.queryParams,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http(
        "data.MemberData/queryMemberList",
        params
      );
  
      exportExcel({
        columns: this.columns,
        filename,
        data: res.obj.record,
      });
    },
  },
});
</script>

<style>
</style>