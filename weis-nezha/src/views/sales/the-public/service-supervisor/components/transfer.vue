<template>
  <div class>
    <div class="tree-select-wrap display-flex">
      <div class="tree-select-section">
        <h3>{{counselor}}的服务客户经理名单</h3>
        <div class="tree-box">
          <BasePageTable
            v-model:selection="tableSelection"
            :height="tableHeight"
            :data="tableData"
            :visible="false"
            border
          >
            <el-table-column v-for="(col, index) in tableCol.col" :key="index" v-bind="col"></el-table-column>>
          </BasePageTable>
        </div>
      </div>
      <div class="tree-select-control">
        <div class="display-flex">
          <el-select v-model="middelSelect" class="btn">
            <el-option
              placeholder="输入手机/选择目标客户经理"
              v-for="item in middelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-button class="btn" @click="transfer">转移</el-button>
        </div>
      </div>
      <div class="tree-select-section">
        <h3>目标服务主管名单</h3>
        <div class="tree-box">
          <el-select
            v-model="selectCounselor"
            clearable
            filterable
            placeholder="输入手机选择服务主管"
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
          <el-button type="primary" @click="add">添加</el-button>
          <div class="label">
            <span>姓名：{{counselorName}} 类型：{{counselorType}}</span>
          </div>
          <BasePageTable :height="tableHeight2" :data="tableCounselor" :visible="false" border>
            <el-table-column
              v-for="(col, index) in tableCounselorCol.col"
              :key="index"
              v-bind="col"
            ></el-table-column>
            <el-table-column label="操作" align="center">
              <template class="action-cell" v-slot="{ row }">
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
    <footer class="inline-center" style="margin-top: 24px;">
      <el-button type="primary" @click="confirm">确认</el-button>
      <el-button @click="() => $router.back()">取消</el-button>
    </footer>
    <ConfirmDialog
      :title="'目前转移到' + counselorName + '的客户名单'"
      v-model="hasDialog"
      @on-confirm="handleCreateConfirm"
      :auto-confirm="false"
      center
    >
      <el-button
        type="primary"
        style="margin-bottom: 20px;float:right"
        @click="dialogAllRemove"
      >全部移除</el-button>
      <BasePageTable height="500" :data="dialogTable" :visible="false" border>
        <el-table-column label="序号" type="index" width="80"></el-table-column>
        <el-table-column label="客户经理姓名" prop="counselorName">
          <template class="action-cell" v-slot="{ row }">{{dialogCounselorName}}</template>
        </el-table-column>
        <el-table-column label="会员昵称" prop="counselorName"></el-table-column>
        <el-table-column label="手机" prop="counselorPhone"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="dialogRemove(row)">移除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  components: {
    BasePageTable,
    ConfirmDialog
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  props: {
    type: '',
    tab: '',
  },
  data() {
    return {
      hasDialog: false,
      dialogCounselorName: '',
      dialogCounselorId: '', // dialog相关
      activeTab: 1,
      counselorId: '',
      counselor: '',
      id: '',
      counselorName: '',
      counselorType: '',
      middelSelect: '', // 中间选择的客户经理
      middelOptions: [], // 中间的下拉框
      selectCounselor: '', // 添加进列表的客户经理
      selectOldOptions: [], // 右边表格的下拉框选项原始数据
      selectOptions: [], // 右边表格的下拉框选项处理数据
      tableHeight: 0,
      tableHeight2: 0,
      tableData: [],
      tableSelection: [], // 左边表格勾选的数据
      tableCol: {
        col: [
          {
            type: 'selection'
          },
          {
            label: '序号',
            type: 'index'
          },
          {
            label: '姓名',
            prop: 'counselorName'
          },
          {
            label: '手机',
            prop: 'counselorPhone'
          }
        ]
      },
      tableCounselor: [],
      tableCounselorCol: {
        col: [
          {
            label: '序号',
            type: 'index'
          },
          {
            label: '服务主管名称',
            prop: 'counselorName'
          },
          {
            label: '手机',
            prop: 'counselorPhone'
          },
          {
            label: '转移全职客户经理数量',
            prop: 'user',
            formatter: row => row.user.length
          }
        ]
      },
      dialogTable: [],
    };
  },
  created() {
    const height = window.innerHeight;
    this.tableHeight = `${height - 430}px`;
    this.tableHeight2 = `${height - 520}px`;
    this.counselorId = this.$route.query.counselorId;
    this.id = this.$route.query.id;
    this.counselor = this.$route.query.name;
    // this.counselorType = this.$route.query.type;
    this.getList();
    this.getCounselor();
  },
  methods: {
    counselorChange(e) {
      const item = this.selectOldOptions.find(item => item.counselorId == e);
      this.counselorName = item.counselorName;
      this.counselorType = {
        '01': '外部',
        '02': '自有',
        '03': '主管',
      }[item.counselorType];
    },
    radioChange() {
      this.tableCounselor = [];
      this.middelOptions = [];
      this.getList();
    },
    // 左边表格获取
    getList() {
      this.$request('Channel/queryChildCounselor', {
        pCounselorId: this.counselorId,
        marketType: '01',
        type: this.type
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.tableData = dataPage;
          }
        })
      );
    },
    // 右边表格下拉框获取
    getCounselor() {
      this.$request('Channel/queryCounselorAll', {
        counselorType: '03',
        marketType: '01'
      }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.selectOldOptions = dataPage;
            dataPage.forEach((item) => {
              this.selectOptions.push({
                label: `${item.counselorPhone} (${item.counselorName})`,
                value: item.counselorId
              });
            });
          }
        })
      );
    },
    // 右边表格添加按钮
    add() {
      const flag = this.tableCounselor.find(item => item.counselorId === this.selectCounselor);
      if (flag || !this.selectCounselor) {
        return;
      }
      const data = this.selectOldOptions.filter(item => item.counselorId === this.selectCounselor);
      const colums = Object.assign(...data, { user: [] });
      this.tableCounselor.push(colums);
      this.middelOptions.push({
        label: colums.counselorName,
        value: colums.counselorId
      });
    },
    // 右边表格的操作
    operate(type, row) {
      if (type === 'remove') {
        const arr = this.tableCounselor.find(item => item.counselorId === row.counselorId);
        arr.user.forEach((item) => {
          this.tableData.push(item);
        });
        this.tableCounselor = this.tableCounselor.filter(item => item.counselorId !== row.counselorId);
        this.middelOptions = this.middelOptions.filter(item => item.value !== row.counselorId);
        this.middelSelect = '';
      } else {
        this.hasDialog = true;
        this.dialogTable = row.user;
        this.dialogCounselorName = row.counselorName;
        this.dialogCounselorId = row.counselorId;
      }
    },
    // 中间的转移按钮
    transfer() {
      if (!this.middelSelect || !this.tableSelection.length) {
        this.$message({ type: 'error', message: '请选择有效数据' });
        return;
      }
      const findItem = this.tableCounselor.find(item => item.counselorId === this.middelSelect);
      this.tableSelection.forEach((item) => {
        this.tableData.forEach((v, i) => {
          if (item.counselorId === v.counselorId) {
            findItem.user.push(item);
            this.tableData.splice(i, 1);
          }
        });
      });
      this.tableCounselor.push({});
      this.tableCounselor.pop(); // 为了更新vue视图，先插入再删除
    },
    // 弹窗移除
    dialogRemove(row) {
      this.tableData.push(row);
      this.dialogTable = this.dialogTable.filter(item => item.counselorId !== row.counselorId);
      this.tableCounselor.forEach((item) => {
        if (item.counselorId === this.dialogCounselorId) {
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
      this.dialogTable.forEach((item) => {
        this.tableData.push(item);
      });
      this.dialogTable = [];
      this.tableCounselor.forEach((item) => {
        if (item.counselorId === this.dialogCounselorId) {
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
      this.$confirm('是否提交？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const type = this.type === '01' ? this.activeRadio : '02';
        const params = {
          counselorId: this.counselorId,
          marketType: '01',
          opType: type,
          transferInfo: {},
          id: this.id
        };
        let num = 0;
        this.tableCounselor.forEach((item) => {
          num += item.user.length;
          params.transferInfo[item.counselorId] = [];
          item.user.forEach((v) => {
            params.transferInfo[item.counselorId].push(v.counselorId);
          });
          params.transferInfo[item.counselorId] = params.transferInfo[item.counselorId].join(',');
        });
        if (!num) {
          this.$message({ type: 'error', message: '没有需要转移的数据！' });
          return;
        }
        params.opType = '0202';
        this.$request('Channel/transferCounselor', params).then(
          this.$rw((err) => {
            if (!err) {
              this.$message({ type: 'success', message: '操作成功！' });
              this.tableCounselor = [];
              this.middelOptions = [];
              this.middelSelect = '';
              // this.getList();
              this.$router.go(-1);
            } else {
              this.$message({ type: 'error', message: err.errMsg });
            }
          })
        );
      }).catch(() => {

      });
    }
  }
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
.label {
  width: 100%;
  padding-left: 5px;
  height: 40px;
  color: #666666;
}
.action-label {
  margin-right: 10px;
}
.display-flex {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
