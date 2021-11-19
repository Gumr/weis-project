<template>
  <div class="page-container">
    <el-radio-group
      v-model="activeRadio"
      @change="radioChange"
    >
      <el-radio label="0101">转移</el-radio>
      <el-radio label="0102">释放到资源池</el-radio>
    </el-radio-group>
    <div class="tree-select-wrap display-flex">
      <div class="tree-select-section">
        <h3>{{ counselor }}的客户列表</h3>
        <div class="tree-box">
          <div class="transfer">
            <div class="client-header">
              <el-checkbox
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                @change="handleCheckAll"
                style="margin-top:10px;margin-right:10px"
              ></el-checkbox>
              <div class="client-header__labels">
                <div class="client-header__title">客户列表<el-input
                    placeholder="请输入手机号搜索"
                    prefix-icon="el-icon-search"
                    v-model="search"
                    style="width:200px;margin-left:10px"
                    clearable
                  >
                  </el-input></div>

                <span class="client-header__total">{{ tableSelection.length }}/{{ tableData.length }}</span>
              </div>

            </div>
            <ElVirtualList
              :window-size="500"
              :item-size="40"
              :data="tableData.filter(data => !search || data.tsePhone.toLowerCase().includes(search.toLowerCase()))"
            >
              <template #default="{ item }">
                <div class="client-item">

                  <el-checkbox
                    v-model="item.$check"
                    @change="() => handleCheckChange(item)"
                  >
                    <span>
                      <span>{{ item.index }}.</span>
                      <span
                        class="text-ellipsis"
                        style="max-width: 160px;"
                      >{{ item.tseName }}</span>
                      <span>（{{ item.tsePhone }}）</span>
                    </span>
                  </el-checkbox>
                </div>
              </template>
            </ElVirtualList>
          </div>
        </div>
      </div>
      <div
        v-if="activeRadio == '0101'"
        class="tree-select-control"
      >
        <div class="display-flex">
          <el-select
            v-model="middelSelect"
            class="btn"
          >
            <el-option
              v-for="item in middelOptions"
              :key="item.value"
              placeholder="输入手机选择目标客户经理"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-button
            class="btn"
            @click="transfer"
          >转移</el-button>
        </div>
      </div>
      <div
        v-if="activeRadio == '0101'"
        class="tree-select-section"
      >
        <h3>目标客户经理</h3>
        <div class="tree-box">
          <el-select
            v-model="selectCounselor"
            clearable
            filterable
            placeholder="输入手机选择客户经理"
            class="txt"
            @change="counselorChange"
          >
            <el-option
              v-for="item in selectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-button
            type="primary"
            @click="add"
          >添加</el-button>
          <div class="label">
            <span>姓名：{{ counselorName }} 类型：{{ counselorTypeDesc }}</span>
          </div>
          <BasePageTable
            :height="tableHeight2"
            :data="tableCounselor"
            :visible="false"
            border
          >
            <el-table-column
              v-for="(col, index) in tableCounselorCol.col"
              :key="index"
              v-bind="col"
            ></el-table-column>
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
                  style="margin-right: 8px;"
                  @click="operate('edit', row)"
                >编辑</span>
                <span
                  class="brand-color cursor-pointer action-label"
                  @click="operate('remove', row)"
                >移除</span>
              </template>
            </el-table-column>
          </BasePageTable>
        </div>
      </div>
    </div>
    <footer
      class="inline-center"
      style="margin-top: 24px;"
    >
      <el-button
        type="primary"
        @click="confirm"
      >确认</el-button>
      <el-button @click="() => $router.back()">取消</el-button>
    </footer>
    <ConfirmDialog
      v-model="hasDialog"
      :title="'目前转移到' + tseName + '的客户名单'"
      :auto-confirm="false"
      center
      @on-confirm="handleCreateConfirm"
    >
      <el-button
        type="primary"
        style="margin-bottom: 20px;float:right"
        @click="dialogAllRemove"
      >全部移除</el-button>
      <BasePageTable
        height="500"
        :data="dialogTable"
        :visible="false"
        border
      >
        <el-table-column
          label="序号"
          type="index"
          width="80"
        ></el-table-column>
        <el-table-column
          label="目标客户经理名称"
          prop="tseName"
        >
          <template
            #default="{ row }"
            class="action-cell"
          >{{ dialogtseName }}</template>
        </el-table-column>
        <el-table-column
          label="会员昵称"
          prop="tseName"
        ></el-table-column>
        <el-table-column
          label="手机"
          prop="tsePhone"
        ></el-table-column>
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
              @click="dialogRemove(row)"
            >移除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from "@/components/BasePageTable.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { ElVirtualList } from "element-plus";
// import TransferPanel from 'element-plus'
import { requestFactor } from "@/utils/request";

const { request: req } = requestFactor("sale.SaleEmployee");

export default {
  components: {
    BasePageTable,
    ElVirtualList,
    ConfirmDialog,
  },
  props: {
    type: "",
    tab: "",
  },
  data() {
    return {
      search: "",
      isIndeterminate: false,
      // checkAll: false,
      activeRadio: "0101",
      hasDialog: false,
      dialogtseName: "",
      dialogtseId: "", // dialog相关
      activeTab: 1,
      middelKey: 0,
      tseId: "",
      counselor: "",
      id: "",
      tseName: "",
      counselorType: "",
      middelSelect: "", // 中间选择的客户经理
      middelOptions: [], // 中间的下拉框
      selectCounselor: "", // 添加进列表的客户经理
      selectOldOptions: [], // 右边表格的下拉框选项原始数据
      selectOptions: [], // 右边表格的下拉框选项处理数据
      tableHeight: 0,
      tableHeight2: 0,
      tableData: [],
      tableSelection: [], // 左边表格勾选的数据
      tableCol: {
        col: [
          // {
          //   type: 'selection'
          // },
          // {
          //   label: '序号',
          //   type: 'index',
          //   width: '80px'
          // },
          {
            label: "姓名",
            prop: "tseName",
          },
          {
            label: "手机",
            prop: "tsePhone",
          },
        ],
      },
      tableCounselor: [],
      tableCounselorCol: {
        col: [
          {
            label: "序号",
            type: "index",
          },
          {
            label: "目标客户经理名称",
            prop: "tseName",
          },
          {
            label: "手机",
            prop: "tsePhone",
          },
          {
            label: "转移客户数",
            prop: "user",
            formatter: (row) => row.user.length,
          },
        ],
      },
      dialogTable: [],
    };
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    },
    checkAll: {
      get() {
        return (
          this.tableData.length > 0 && this.tableData.every((i) => i.$check)
        );
      },
      set(val) {
        this.tableData.forEach((item) => {
          item.$check = val;
        });
      },
    },
  },
  watch: {
    "tableData.length": function (length) {
      this.tableData.forEach((item, index) => {
        item.index = index + 1;
      });
    },
    "tableSelection.length": function (length) {
      if (
        length === 0 ||
        this.tableSelection.length === this.tableData.length
      ) {
        this.isIndeterminate = false;
      }
    },
  },
  created() {
    const height = window.innerHeight;
    this.tableHeight = `${height - 430}px`;
    this.tableHeight2 = `${height - 520}px`;
    const { query } = this.$route;
    // this.tseId = this.$route.query.tseId;
    this.id = query.id;
    this.counselor = query.name;
    // this.counselorType = this.$route.query.type;
    this.getList();
    this.getCounselor();
  },
  methods: {
    handleCheckChange(row) {
      if (row.$check) {
        // this.checkAll = this.tableData.every(item => item.$checked)
        this.isIndeterminate = true;
        this.tableSelection.push(row);
      } else {
        this.tableSelection = this.tableSelection.filter(
          (i) => i.tseId != row.tseId
        );
      }
    },
    handleCheckAll(val) {
      this.tableSelection = val ? [...this.tableData] : [];
      // if (val) {
      this.isIndeterminate = false;
      // }
      // this.tableData.forEach((item) => {
      //   item.$check = val
      // })
    },
    counselorChange(e) {
      const item = this.selectOldOptions.find((i) => i.tseId === e);

      this.tseName = item.tseName;
      this.counselorType = item.tseTypeDesc;
    },
    radioChange() {
      this.tableCounselor = [];
      this.middelOptions = [];
      this.getList();
    },
    // 左边表格获取
    getList() {
      req("queryCounselorChild", {
        tseId: this.id,
        type: "01",
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.tableData = dataPage.map((item, index) => {
              item.index = index + 1;
              item.$check = false;
              return item;
            });
          }
        })
      );
    },
    // 右边表格下拉框获取
    getCounselor() {
      //      CMI("100003", "客户经理(内部)"),
      // CMO("100004", "客户经理(外部)"),

      req("querySaleEmployeeList", {
        tseRoleId: "100003,100004",
        tseStt: "01",
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.selectOldOptions = dataPage;
            this.selectOptions = dataPage
              .filter((i) => i.tseId !== this.id)
              .map((item) => ({
                label: `${item.tsePhone} ${item.tseName} -- ${item.tseRoleName}`,
                value: item.tseId,
              }));
          }
        })
      );
    },
    // 右边表格添加按钮
    add() {
      const flag = this.tableCounselor.find(
        (item) => item.tseId === this.selectCounselor
      );
      if (flag || !this.selectCounselor) {
        return;
      }
      const data = this.selectOldOptions.filter(
        (item) => item.tseId === this.selectCounselor
      );
      const colums = Object.assign(...data, { user: [] });
      this.tableCounselor.push(colums);
      this.middelOptions.push({
        label: colums.tseName,
        value: colums.tseId,
      });
    },
    // 右边表格的操作
    operate(type, row) {
      if (type === "remove") {
        const arr = this.tableCounselor.find(
          (item) => item.tseId === row.tseId
        );
        this.tableSelection = this.tableSelection.filter(
          (item) => item.tseId !== row.tseId
        );

        this.tableData = this.tableData.concat(arr.user);
        this.tableCounselor = this.tableCounselor.filter(
          (item) => item.tseId !== row.tseId
        );

        this.middelOptions = this.middelOptions.filter(
          (item) => item.value !== row.tseId
        );
        row.user = [];
        this.$nt(() => {
          this.middelSelect = "";
        });
      } else {
        this.hasDialog = true;
        this.dialogTable = row.user;
        this.dialogtseName = row.tseName;
        this.dialogtseId = row.tseId;
      }
    },
    // 中间的转移按钮
    transfer() {
      const { tableData, tableSelection, tableCounselor } = this;

      if (!this.middelSelect || !this.tableSelection.length) {
        this.$message({ type: "error", message: "请选择有效数据" });
        return;
      }
      tableSelection.forEach((item) => {
        item.$check = false;
      });
      const findItem = tableCounselor.find(
        (item) => item.tseId === this.middelSelect
      );
      findItem.user.push(...tableSelection);

      const ids = tableSelection.map((i) => i.tseId);
      this.tableData = tableData.filter((item) => !ids.includes(item.tseId));

      tableCounselor.push({});
      tableCounselor.pop(); // 为了更新vue视图，先插入再删除
      this.tableSelection = [];
    },
    // 弹窗移除
    dialogRemove(row) {
      row.$check = false;
      this.tableData = this.tableData.concat([row]);
      this.dialogTable = this.dialogTable.filter(
        (item) => item.tseId !== row.tseId
      );
      this.tableSelection = this.tableSelection.filter(
        (item) => item.tseId !== row.tseId
      );
      this.tableCounselor.forEach((item) => {
        if (item.tseId === this.dialogtseId) {
          item.user = this.dialogTable;
        }
      });
      this.tableCounselor.push({});
      this.tableCounselor.pop(); // 为了更新vue视图，先插入再删除
      if (!this.dialogTable.length) {
        this.hasDialog = false;
      }
    },
    // 弹窗全部移除
    dialogAllRemove() {
      // this.dialogTable.forEach((item) => {
      //   this.tableData.push(item)
      // })
      this.tableData = this.tableData.concat(this.dialogTable);
      this.dialogTable = [];
      this.tableSelection = [];
      this.tableCounselor.forEach((item) => {
        if (item.tseId === this.dialogtseId) {
          item.user = [];
        }
      });
      this.tableCounselor.push({});
      this.tableCounselor.pop(); // 为了更新vue视图，先插入再删除
      this.hasDialog = false;
    },
    handleCreateConfirm() {
      this.hasDialog = false;
    },
    confirm() {
      this.$confirm("是否提交？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const type = this.activeRadio;
          // if (this.tab == '1') {
          //   type = '0201';
          // }
          const params = {
            tseId: this.id,
            opType: type,
            transferInfo: {},
          };

          if (type === "0101" || type === "0201") {
            let num = 0;
            this.tableCounselor.forEach((item) => {
              num += item.user.length;
              params.transferInfo[item.tseId] = [];
              item.user.forEach((v) => {
                params.transferInfo[item.tseId].push(v.tseId);
              });
              params.transferInfo[item.tseId] =
                params.transferInfo[item.tseId].join(",");
            });
            if (!num) {
              this.$message({ type: "error", message: "没有需要转移的数据！" });
              return;
            }
          } else if (type === "0102") {
            if (!this.tableSelection.length) {
              this.$message({ type: "error", message: "没有需要释放的数据！" });
              return;
            }
            params.transferInfo[""] = [];
            this.tableSelection.forEach((item) => {
              params.transferInfo[""].push(item.tseId);
            });
            params.transferInfo[""] = params.transferInfo[""].join(",");
          }
          req("transferCounselor", params).then(
            this.$rw((err) => {
              if (!err) {
                this.$message({ type: "success", message: "操作成功！" });
                this.tableCounselor = [];
                this.middelOptions = [];
                this.middelSelect = "";
                // this.getList();
                this.$router.go(-1);
              } else {
                this.$message({ type: "error", message: err.errMsg });
              }
            })
          );
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="less" scoped>
.page-container {
  width: 100%;
  padding: 0;
}
.name-bar {
  align-items: center;
  .name-label {
    flex-shrink: 0;
  }
  .name-input {
    width: 260px;
  }
}

.text-ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: text-bottom;
  line-height: 16px;
  display: inline-block;
}

.tree-select-wrap {
  justify-content: space-between;
  .tree-select-section {
    flex-grow: 1;
    width: 40%;
  }
  .tree-select-control {
    width: 200px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
}

.tree-box {
  padding: 16px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  box-sizing: border-box;
}
.btn {
  margin-top: 20px;
  width: 150px;
}
.txtDiv {
  width: 100%;
  margin: 0;
}
.txt {
  width: 300px;
  margin-bottom: 20px;
  margin-right: 20px;
}
.transfer {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.client-header {
  display: flex;
  // height: 200px;
  padding: 12px 16px;
  background: #f2f6fc;
  white-space: nowrap;
  &__title {
    font-size: 16px;
    color: #303133;
    font-weight: 400;
  }
  &__labels {
    flex-grow: 1;
    align-items: center;
    display: flex;
    justify-content: space-between;
  }
}

.client-item {
  height: inherit;
  line-height: 40px;
  padding-left: 16px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}
.label {
  width: 100%;
  padding-left: 5px;
  height: 40px;
  color: #666666;
}
.action-label {
  margin-right: 10px;
}

.client-ul {
  overflow: auto;
  .client-li {
    list-style-type: none;
  }
}
.display-flex {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
