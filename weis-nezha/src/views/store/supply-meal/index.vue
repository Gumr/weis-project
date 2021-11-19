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
          <el-button type="primary" @click="searchClick">搜索</el-button>
           <el-button type="primary" @click="handleExport">导出</el-button>
          <el-button type="primary" @click="closeStore">不营业时间</el-button>
        </template>
      </QueryComponents>
      <el-button class="float-right" type="primary" @click="goEdit('add', '')">添加加热点</el-button>
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
        <el-table-column label="序号" type="index" align="center" width="50"></el-table-column>
        <el-table-column label="供餐点编码" prop="thpId" align="center"></el-table-column>
        <el-table-column label="供餐点名称" prop="thpName" align="center"></el-table-column>
        <el-table-column label="金蝶ID" prop="thpKingdeeOrgId" align="center"></el-table-column>
        <el-table-column label="金蝶名称" prop="thpKingdeeOrgName" align="center"></el-table-column>
        <el-table-column label="加热点性质" prop="thpIsOpen" align="center">
          <template #default="{ row }">{{ { 0: '虚拟（内部员工可见）', 1: '正常', 2: '虚拟' } [row.thpIsOpen] }}</template>
        </el-table-column>
        <el-table-column label="供餐点负责人" prop="thpShopLeader" align="center"></el-table-column>
        <el-table-column label="联系方式" prop="thpShopTel" width="120" align="center"></el-table-column>
        <el-table-column label="供餐点状态" prop="thpDataStt" width="160" align="center">
          <template #default="{ row }">{{ { '01': '在线', '00': '下线', '99': '删除' } [row.thpDataStt] }}</template>
        </el-table-column>
        <el-table-column label="供餐点地址" prop="thpShopAddress" align="center">
          <template
            #default="{ row }"
          >{{ row.thpShopAddrProvince + row.thpShopAddrCity + row.thpShopAddrArea + row.thpShopAddress }}</template>
        </el-table-column>
         <el-table-column label="所属区域仓" prop="thpWarehouseName" align="center"></el-table-column>
        <el-table-column label="操作人" prop="thpOperator" align="center"></el-table-column>
        <el-table-column label="操作时间" prop="thpUtime" align="center">
          <template #default="{ row }">{{ $day(+row.thpUtime).format("YYYY-MM-DD HH:mm:ss") }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="goEdit('edit', row)">编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="outLine(row.thpId, row.thpDataStt)"
            >{{ row.thpDataStt == "00" ? "上线" : "下线" }}</span>
            <span class="brand-color cursor-pointer action-label" @click="del(row.thpId)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
  </div>
</template>

<script>
// import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import exportExcel from "@/utils/export-excel";
export default {
  name: 'store_supply-meal',
  components: {
    BasePageTable
    // QueryComponents
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tableData: [],
      tableCol:[ {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "供餐点编码",
          prop: "thpId",
        },
        {
          label: "供餐点名称",
          prop: "thpName",
        },
        {
          label: "金蝶ID",
          prop: "thpKingdeeOrgId",
        },
        {
          label: "金蝶名称",
          prop: "thpKingdeeOrgId",
        },
        {
          label: "加热点性质",
          prop: "thpIsOpen",
          formatter: row => `${row.thpIsOpen== 0?'虚拟（内部员工可见）':row.thpIsOpen== 1?'正常':row.thpIsOpen== 2?'虚拟':'' }`
          
        },
        {
          label: "供餐点负责人",
          prop: "thpShopLeader",
        },
        {
          label: "联系方式",
          prop: "thpShopTel",
        },
        {
          label: "供餐点状态",
          prop: "thpDataStt",
           formatter: row => `${row.thpDataStt== '01'?'在线':row.thpDataStt== '00'?'下线':row.thpDataStt== '99'?'删除':'' }`
        },
        {
          label: "供餐点地址",
          prop: "thpShopAddress",
          formatter:row => `${row.thpShopAddrProvince + row.thpShopAddrCity + row.thpShopAddrArea + row.thpShopAddress }`,
        },
        {
          label: "所属区域仓",
          prop: "thpWarehouseName",
        },
        {
          label: "操作人",
          prop: "thpOperator",
        },
        {
          label: "操作时间",
          prop: "thpUtime",
          formatter: row => this.$day(+row.thpUtime).format('YYYY-MM-DD')
        },],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      tableDataTotal: 0,
      queryParams: {
        thpDataStt: '',
        thpIsOpen: '',
        thpId:'-1'
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'thpId',
          label: '供餐点',
          props: {
            clearable: true,
            filterable:true,
            options: [
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'thpDataStt',
          label: '加热点状态',
          placeholder: '请选择加热点状态',
          props: {
            clearable: true,
            options: [
              {
                label: '全部',
                value: ''
              },
              {
                label: '在线',
                value: '01'
              },
              {
                label: '下线',
                value: '00'
              }
            ]
          }
        },
        {
          component: 'BaseSelect',
          key: 'thpIsOpen',
          label: '加热点性质',
          placeholder: '加热点性质',
          props: {
            clearable: true,
            options: [
              {
                label: '虚拟（内部员工可见）',
                value: '0'
              },
              {
                label: '正常',
                value: '1'
              },
              {
                label: '虚拟',
                value: '2'
              }
            ]
          }
        }
      ]
    }
  },
  watch: {
    $route(to, from) {
      this.getList()
    }
  },
  created() {
    this.getHeatPointOptions()
    this.getList()
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async outLine(id, type) {
      const url = type === '00' ? 'HeatingPoint/onlinePoint' : 'HeatingPoint/offlinePoint'
      const res = await this.$http(url, { thpId: id })
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.getList()
      }
    },
    goEdit(type, row) {
      this.$router.push({
        path: `${this.$route.path}/edit`,
        query: {
          type,
          thpId: row.thpId
        }
      })
    },
    closeStore() {
      this.$router.push({
        path: `${this.$route.path}/close`,
        query: {
        }
      })
    },
    async getList() {
      this.$store.state.vloading = true
      if (!this.tableData.length) {
        this.page.pageNo = this.page.pageNo - 1
      }
      const res = await this.$http('HeatingPoint/queryAllPoint', { ...this.page, ...this.genQueryParams() })
      this.tableDataTotal = res.obj.dataPage.totalRecordCount
      this.tableData = res.obj.dataPage.record
      this.$nt(() => {
        this.$refs.table.doLayout()
      })
    },
   async handleExport() {
      // this.$store.state.bloading = true;
      const date = this.$day().format("YYYY-MM-DD");
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        pageNo:1,
        pageSize:this.tableDataTotal,
        ...this.genQueryParams() 
      };
      let url = "HeatingPoint/queryAllPoint";
      const res = await this.$http(url, params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.dataPage.record,
      });
    },
    async getHeatPointOptions() {
      const heatPointItem = this.queryComps.find((item) => item.label === '供餐点')
      const res = await this.$http('ServeMealsOperation/queryAllHeatInfo')
      heatPointItem.props.options = [{ label: '全部', value: '-1' }, ...res.obj.heatList]
    },

    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate
        params.endDate = endDate
      }
      delete params.date
      return params
    },
    async del(id) {
      this.$confirm('此操作将删除该供餐点, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await this.$request('HeatingPoint/deletePoint', { thpId: id })
        if (!res.errMsg) {
          this.$msg('操作成功', 'success')
          this.getList()
        } else {
          this.$msg(res.errMsg, 'error')
        }
      })
    }
  }
}
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
