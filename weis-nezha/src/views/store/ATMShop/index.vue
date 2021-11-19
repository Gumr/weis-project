<template>
  <div class="page-container">
    <div style="margin-top: 20px;">
      <ButtonTabs
        v-model="activeTab"
        :tabs="tabs"
        @change="queryMachinePage"
      />
    </div>

    <div v-if="activeTab == '00'">
      <div class="query-bar">
        <QueryComponents
          v-model="queryParams2"
          :query-list="queryComps2"
          :span="4"
          :label-width="120"
          semi
        >
          <template #action>
            <el-button
              type="primary"
              @click="queryMachinePage"
            >搜索</el-button>
            <el-button
              type="primary"
              @click="syncMachine"
            >同步机器</el-button>

          </template>
        </QueryComponents>

      </div>

      <div>
        <BasePageTable
          ref="table"
          :data="MachinePage"
          :visible="false"
        >
          <el-table-column
            v-for="col in tableCol"
            :key="col.prop"
            v-bind="col"
            align="center"
          ></el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="200px"
          >
            <template
              #default="{row}"
              class="action-cell"
            >
              <span
                class="brand-color cursor-pointer action-label"
                style="margin-right:10px"
                @click="toShop(row)"
              >关联供餐点</span>
              <span
                class="brand-color cursor-pointer action-label"
                @click="toset(row)"
              >设置菜品</span>
            </template>
          </el-table-column>

        </BasePageTable>
      </div>

    </div>

    <div v-if="activeTab == '01'">
      <div class="query-bar">
        <QueryComponents
          v-model="queryParams"
          :query-list="queryComps"
          :span="4"
          :label-width="120"
          semi
        >
          <template #action>
            <el-button
              type="primary"
              @click="queryMachinePage"
            >搜索</el-button>
            <el-button
              type="primary"
              @click="handleExport"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button>
            <el-button
              type="primary"
              @click="addpoint"
            >新建冷柜</el-button>
          </template>
        </QueryComponents>

      </div>
      <div>
        <BasePageTable
          v-model:current-page="page.pageNo"
          v-model:page-size="page.pageSize"
          v-loading="$store.state.vloading"
          :data="MachinePage"
          :total="tableDataTotal"
          border
          @current-page-change="queryMachinePage"
          @size-change="queryMachinePage"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
            width="50"
          ></el-table-column>
          <el-table-column
            label="冷藏柜编码"
            prop="machineCode"
            align="center"
          ></el-table-column>

          <el-table-column
            label="货道量"
            key="aisleNum"
            align="center"
          >
            <template
              class="action-cell"
              v-slot="{ row }"
            >
              <el-input
                v-model="row.aisleNum"
                onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
                @blur="setStock(row)"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="关联供餐点"
            prop="pointName"
            align="center"
          ></el-table-column>
          <el-table-column
            label="操作人"
            prop="creator"
            align="center"
          ></el-table-column>
          <el-table-column
            label="操作时间"
            prop="ctime"
            align="center"
          ></el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="200px"
          >
            <template
              #default="{row}"
              class="action-cell"
            >
              <span
                class="brand-color cursor-pointer action-label"
                style="margin-right:10px"
                @click="toShop(row)"
              >关联供餐点</span>
              <span
                class="brand-color cursor-pointer action-label"
                @click="toset(row)"
              >设置货道</span>
            </template>
          </el-table-column>
        </BasePageTable>
      </div>
      <ConfirmDialog
        v-model="editDialogVisible"
        title="选择商品"
        :close-on-click-modal="false"
        :auto-confirm="false"
        :async-confirm="true"
        @on-confirm="onconfirm"
      >
        <!-- <h4 style="color:red">*双击选择商品</h4> -->
        <div class="searchbar">
          <el-input
            v-model="cid"
            class="txt"
            placeholder="商品编号"
            clearable
          ></el-input>
          <el-input
            v-model="skuName"
            class="txt"
            placeholder="商品名称"
            clearable
          ></el-input>

          <el-button
            type="primary"
            @click="getskuList"
          >搜索</el-button>
        </div>

        <BasePageTable
          :data="skuList"
          border
          style="margin-top:30px"
          :visible="false"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
            width="50"
          ></el-table-column>
          <el-table-column
            label="商品编码"
            prop="cid"
            align="center"
          ></el-table-column>
          <el-table-column
            label="商品名称"
            prop="skuName"
            align="center"
          ></el-table-column>
          <el-table-column
            label="规格"
            prop="tfsQuality"
            align="center"
          ></el-table-column>
          <el-table-column
            label="单价"
            prop="price"
            align="center"
          ></el-table-column>
          <el-table-column label="图片">
            <template
              #default="{ row }"
              class="action-cell"
            >
              <el-image
                v-if="row.imgUrl"
                style="width: 100px;height:100px"
                :src="row.imgUrl"
                :preview-src-list="[row.imgUrl]"
                class="food-cover"
              />
              <span v-else>无</span>
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
                style="color:blue"
                @click="selsku(row)"
              >选择</span>
            </template>
          </el-table-column>
        </BasePageTable>

      </ConfirmDialog>
    </div>
    <!--关联供餐点-->
    <ConfirmDialog
      v-model="showShop"
      title="关联供餐点"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="false"
    >
      <div>
        <BasePageTable
          :data="shopList"
          border
          :visible="false"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
            width="50"
          ></el-table-column>
          <el-table-column
            label="供餐点编码"
            prop="thpId"
            align="center"
          ></el-table-column>
          <el-table-column
            label="供餐点名称"
            prop="thpName"
            align="center"
          ></el-table-column>
          <el-table-column
            label="供餐点地址"
            align="center"
            prop="thpShopAddress"
          >
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
                style="color:blue"
                @click="selPoint(row)"
              >选择</span>
            </template>
          </el-table-column>
        </BasePageTable>
      </div>
    </ConfirmDialog>
    <!--新建冷柜-->
    <ConfirmDialog
      v-model="showpoint"
      title="新建冷柜"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="false"
      @on-confirm="addMo"
    >
      <div>
        <el-form label-width="130px">
          <el-form-item label="冷柜编码：">
            <el-input
              class="medium-input"
              v-model="add.machineCode"
            ></el-input>
          </el-form-item>
          <el-form-item label="货道:">
            <!-- <el-input
              class="medium-input"
              v-model="add.aisleNum"
              onkeyup="return value=value.replace(/^(0+)|[^\d]+/g, '')"
            ></el-input> -->
            <NumberInput  v-model="add.aisleNum" > </NumberInput>
          </el-form-item>
        </el-form>
      </div>
    </ConfirmDialog>
  </div>

</template>

<script lang="ts">
import exportExcel from "@/utils/export-excel";
import QueryComponents from "@/components/QueryComponents.vue";
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ButtonTabs from "@/components/ButtonTabs.vue";
export default {
  name: "store_ATMShop",
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ButtonTabs,
  },
  data() {
    return {
      add: {
        machineCode: "",
        machineName: "",
        machineType: "30", //冷藏柜
        aisleNum: "",
      },
      showpoint: false,
      machineCode: 0,
      shopList: [],
      showShop: false,
      MachinePage: [],
      activeTab: "00",
      tabs: [
        {
          label: "机器列表",
          value: "00",
        },
        {
          label: "冷藏柜列表",
          value: "01",
        },
      ],
      skuList: [],
      salesDate: "",
      thpId: "",
      cid: "",
      skuName: "",
      editDialogVisible: false,
      editRow: "",
      queryParams2: {
        pointId: "",
        machineName: "",
        machineType: "",
      },
      queryComps2: [
        {
          component: "BaseSelect",
          key: "pointId",
          label: "供餐点名称",
          props: {
            options: [],
            clearable: true,
          },
        },
        {
          component: "el-input",
          key: "machineName",
          label: "机器名称",
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
      ],

      queryParams: {
        pointId: "",
        machineCode: "",
        machineType: "",
      },
      tableData: [],
      tableDataTotal2: 0,
      page2: {
        pageNo: 1,
        pageSize: 10,
      },
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      queryComps: [
        {
          component: "BaseSelect",
          key: "pointId",
          label: "供餐点名称",
          props: {
            options: [],
            clearable: true,
          },
        },
        {
          component: "el-input",
          key: "machineCode",
          label: "冷藏柜编码",

          props: {
            clearable: true,
          },
          maxlength: 30,
        },
      ],
      tableCol: [
        {
          label: "序号",
          type: "index",
          width: "80",
        },
        {
          label: "机器名称",
          prop: "machineName",
        },
        {
          label: "机器编码",
          prop: "machineCode",
        },
        {
          label: "机器类型",
          prop: "machineTypeDesc",
        },
        {
          label: "所属供餐点",
          prop: "pointName",
        },
        {
          label: "创建人",
          prop: "creator",
        },
        {
          label: "创建时间",
          prop: "ctime",
        },
      ],
      columns: [
        {
          type: "index",
          label: "序号",
        },
        {
          label: "冷藏柜编码",
          prop: "machineCode",
        },
        {
          label: "货道最大容量",
          prop: "aisleNum",
        },
        {
          label: "关联供餐点",
          prop: "pointName",
        },
        {
          label: "操作人",
          prop: "creator",
        },
      ],
    };
  },
  created() {
    this.queryHeatingPointList();
    this.queryMachinePage();
    this.getShopList();
  },
  methods: {
    async addMo() {
      const res = await this.$http("machine.Machine/createMachine", this.add);
      if (!res.errMsg) {
        this.$message.success("操作成功");
        this.showpoint = false;
        this.queryMachinePage();
      } else {
        this.$message.error(res.errMsg);
      }
    },
    addpoint() {
    
      this.add.aisleNum = '',
      this.add.machineCode = '',
      this.showpoint = true;
    },
    toShop(row) {
      this.machineCode = row.machineCode;
      this.showShop = true;
    },
    setStock(row) {
      if (!row.aisleNum) {
        this.$msg(`请输入货道容量`, "error");
        return;
      }
      this.$request("machine.Machine/editMachineAisle", {
        machineCode: row.machineCode,
        aisleNum: row.aisleNum,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$msg("设置成功", "success");
          } else {
            this.$msg(err.errMsg, "error");
          }
          this.queryMachinePage();
        })
      );
    },
    async queryMachinePage() {
      let queryParams =
        this.activeTab == "00"
          ? { ...this.queryParams2 }
          : { ...this.queryParams };
      queryParams.machineType = this.activeTab == "00" ? "10,20" : "30";
      (queryParams.pageNo = this.page.pageNo),
        (queryParams.pageSize = this.page.pageSize);
      const res = await this.$http(
        "machine.Machine/queryMachinePage",
        queryParams
      );
      this.MachinePage = res.obj.dataPage.record;
      this.tableDataTotal = res.obj.dataPage.totalRecordCount;
    },
    async getShopList() {
      const res = await this.$http("HeatingPoint/queryPointList", {});
      this.shopList = res.obj;
      // this.tableDataTotal2 = res.obj;
    },
    async queryHeatingPointList() {
      let params = {
        // shopType: "20",
      };
      const res = await this.$request(
        "HeatingPoint/queryHeatingPointList",
        params
      );
      if (!res.data.errMsg) {
        this.queryComps[0].props.options = res.data.obj;
        this.queryComps2[0].props.options = res.data.obj;
      }
    },

    toset(row) {
      this.$router.push({
        path: `${this.$route.path}/setSku`,
        query: {
          machineCode: row.machineCode,
          thpId: row.pointId,
        },
      });
    },
    async syncMachine() {
      const res = await this.$request("machine.Machine/syncMachine", {});
      if (!res.data.errMsg) {
        this.$msg("同步成功", "success");
      } else {
        this.$msg(res.data.errMsg, "error");
      }
    },
    async selPoint(row) {
      let parmas = {
        pointId: row.thpId,
        machineCode: this.machineCode,
      };

      const res = await this.$request(
        "machine.Machine/unionMachinePoint",
        parmas
      );
      if (!res.data.errMsg) {
        this.$msg("设置成功", "success");
        this.showShop = false;
        this.queryMachinePage();
      } else {
        this.$msg(res.data.errMsg, "error");
      }
    },
    selsku(row) {
      this.$request("machine.MachineAisle/editMachineAisleSku", {
        machineCode: this.editRow.machineCode,
        aisleCode: this.editRow.aisleCode,
        salesDate: this.editRow.salesDate,
        cid: row.cid,
        stock: this.editRow.aisleCapacity,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$msg("选择成功", "success");
            this.editDialogVisible = false;
            this.queryMachinePage();
          } else {
            this.$msg(err.errMsg, "error");
          }
        })
      );
    },

    editT(row) {
      this.editRow = row;
      this.getskuList();
      this.editDialogVisible = true;
    },
  async  handleExport() {
      const filename = `${this.$route.meta.title}-导出`;
      let queryParams =
        this.activeTab == "00"
          ? { ...this.queryParams2 }
          : { ...this.queryParams };
      queryParams.machineType = this.activeTab == "00" ? "10,20" : "30";
      (queryParams.pageNo = 1), (queryParams.pageSize = 99999);
      const res = await this.$http(
        "machine.Machine/queryMachinePage",
        queryParams
      );

      exportExcel({
        columns: this.columns,
        filename,
        data: res.obj.dataPage.record,
      });
    },
  },
};
</script>

<style scoped>
.namesList {
  color: blue;
}
.borders {
  color: red;
}
.searchbar {
  display: flex;
}
.txt {
  margin-right: 20px;
}
</style>