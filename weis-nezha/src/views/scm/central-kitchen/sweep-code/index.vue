<template>
  <div class="page-container">
    <div style="margin: 20px 0;">
      <QueryComponents
        v-model="queryParams"
        :queryList="queryComps"
        :span="4"
        :label-width="90"
        semi
      >
        <template v-slot:action>
          <el-button type="primary" style="margin-right: 20px;" @click="search">搜索</el-button>
          <el-input
            ref="barCodeInput"
            style="width: 250px"
            v-if="isOutofStock"
            v-model="barCode"
            placeholder="请将光标放置在此扫码出库"
            @keyup.enter="payCode"
          ></el-input>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="loading"
        :visible="false"
        :data="tableData"
        :height="tableHeight"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="供餐点" prop="heatPonitName"></el-table-column>
        <el-table-column label="商品名称" prop="tfsSkuname"></el-table-column>
        <el-table-column label="商品编码" prop="tksoCid"></el-table-column>
        <el-table-column label="商品规格" prop="商品规格">
          <template class="action-cell" v-slot="{ row }">
            <span>{{row.tfsQuality}}{{row.tfsUnit}}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际出库量">
          <template class="action-cell" v-slot="{ row }">
            <span
              :style="{ color: row.tksoActualNum == row.tksoTotalNum ? '' : 'red' }"
            >{{row.tksoActualNum}}</span>
          </template>
        </el-table-column>
        <el-table-column label="计划出库量" prop="tksoTotalNum"></el-table-column>
        <el-table-column label="差额">
          <template class="action-cell" v-slot="{ row }">
            <span :style="{ color: row.tksoDiffNum == 0 ? '' : 'red' }">{{row.tksoDiffNum}}</span>
          </template>
        </el-table-column>
        <el-table-column label="出库日期" prop="tksoDate"></el-table-column>
        <el-table-column label="备注" prop="tksoRemark"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span v-if="row.tksoStt == '02'">已出库</span>
            <span
              class="brand-color cursor-pointer action-label"
              @click="edit(row)"
              v-if="isShowEdit && row.tksoStt == '01'"
            >编辑</span>
            <span
              class="brand-color cursor-pointer action-label"
              style="margin-left: 10px;"
              v-if="row.tksoTotalNum == 0 && row.tksoStt == '01'"
              @click="del(row)"
            >删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <div style="margin-top: 20px">
      <el-button type="danger" @click="stockOut">出库</el-button>
      <el-button type="text" @click="printConfirm">出库单预览</el-button>
    </div>
    <ConfirmDialog
      v-model="tableDialog"
      title="提醒"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-cancel="onCancel"
      @on-confirm="onconfirm"
    >
      <el-form>
        <el-form-item label="该商品已超出计划出库量,请确认是否继续出库"></el-form-item>
        <el-form-item label="*备注">
          <el-input class="small-input" maxlength="7" v-model="remark" ref="remarkInput"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="editDialog"
      title="供餐点"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-cancel="onCancel"
      @on-confirm="onEditConfirm"
    >
      <el-form :model="current" label-width="80px">
        <el-form-item label="供餐点:">{{current.heatPonitName}}</el-form-item>
        <el-form-item label="菜品编码:">{{current.tksoCid}}</el-form-item>
        <el-form-item label="菜品名称:">{{current.tfsSkuname}}</el-form-item>
        <el-form-item label="出库数量:">
          <el-input
            class="small-input"
            maxlength="20"
            min="0"
            type="number"
            v-model="current.tksoActualNum"
          ></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="stockDialog"
      title="出库量统计"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :comfirmVisible="comfirmVisible"
      @on-cancel="onCancel"
      @on-confirm="onStockConfirm"
    >
      <el-form :model="currentStock">
        <el-form-item label="供餐点">{{currentStock.heatPonitName}}</el-form-item>
        <el-form-item label="计划出库量">{{currentStock.actualType}}类 {{currentStock.actualNum}}盒</el-form-item>
        <el-form-item label="实际出库量">{{currentStock.totalType}}类 {{currentStock.totalNum}}盒</el-form-item>
        <el-form-item label="提醒:" v-if="!comfirmVisible">实际出库量小于计划出库量，请核对</el-form-item>
      </el-form>
    </ConfirmDialog>
    <Pint :show="printDialog" :formData="formData" :infoData="infoData" @print-cancel="printCancel"></Pint>
  </div>
</template>

<script>
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Pint from './components/print.vue';

export default {
  name: 'scm-kitchen_sweep-code',
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    Pint
  },
  data() {
    return {
      loading: false,
      isOutofStock: false,
      tableDialog: false,
      editDialog: false,
      stockDialog: false,
      comfirmVisible: true,
      printDialog: false,
      tableHeight: 0,
      current: {}, // 计划出库数量
      currentStock: {}, // 实际出库数量
      remark: '',
      barCode: '',
      queryParams: {
        tksoDate: this.$day(new Date(Date.now() + 86400000)).format('YYYY-MM-DD'),
        tksoHpid: '',
      },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'tksoDate',
          label: '选择日期',
          props: {
            type: 'date',
            'value-format': 'yyyy-MM-dd',
            clearable: false,
          }
        },
        {
          component: 'BaseSelect',
          key: 'tksoHpid',
          label: '供餐点名称',
          props: {
            filterable:true,
            options: []
          }
        },
      ],
      isShowEdit: true, // 是否显示编辑按钮
      printDate: '', // 打印日期
      skuData: [], // 所有菜品
      tableData: [], // 实际出库数据
      stockData: [], // 计划出库数据
      formData: [],
      heatInfo: {}, // 加热点数据
      infoData: {}, // 表格展示数据
      tData: {}, // 编辑时数据
    };
  },
  created() {
    //
    const height = window.innerHeight;
    this.tableHeight = `${height - 300}px`;
    this.getHeatPoint();
    this.getSkuList();
  },
  mounted() {
  },
  methods: {
    // 获取供餐点
    getHeatPoint() {
      this.$request('OrderPrint/hpInfo', { }).then(
        this.$rw((err, dataPage) => {
          if (!err, dataPage) {
            this.queryComps[1].props.options = dataPage.res;
          }
        })
      );
    },
    // 获取所有菜品
    getSkuList() {
      this.$request('Food/queryFoodList', { pageSize: 99999 }).then(
        this.$rw((err, { dataPage }) => {
          if (!err, dataPage) {
            this.skuData = dataPage.record;
          }
        })
      );
    },
    // 搜索
    search() {
      this.loading = true;
      this.isOutofStock = false;
      this.printDate = this.queryParams.tksoDate;
      this.$request('StockOut/queryStockOutHist', { ...this.queryParams }).then(
        this.$rw((err, dataPage) => {
          if (!err) {
            this.loading = false;
            this.tableData = this.$deepClone(dataPage.stockOutSkuVo);
            this.stockData = this.$deepClone(dataPage.stockOutSkuVo);
            if (this.tableData.length) {
              const date = this.$day(this.queryParams.tksoDate).format('YYYY-MM-DD');
              const nowdate = this.$day(new Date(Date.now())).format('YYYY-MM-DD');
              const day = this.$day(date).diff(nowdate, 'day');
              if (day <= 1 && day >= 0) {
                this.isOutofStock = true;
                this.isShowEdit = true;
                this.$nt(() => {
                  this.$refs.barCodeInput.focus();
                  this.$refs.table.doLayout();
                });
              } else if (day < 0) {
                this.isShowEdit = false;
              }
              this.heatInfo = dataPage.heatingPointVo;
            }
          } else {
            this.$message({ type: 'error', message: err.errMsg });
            this.loading = false;
          }
        })
      );
    },
    // 扫码入库
    payCode() {
      const tdata = this.tableData.find(item => item.tksoCid === this.barCode && item.tksoStt === '01');
      const data = this.skuData.find(item => item.tfsCid === this.barCode);
      if (!tdata) {
        if (!data) {
          this.$message({ type: 'error', message: '请扫描正确的条形码' });
        } else {
          this.tableDialog = true;
          this.tData = {
            tksoHpid: this.hpId,
            heatPonitName: this.heatInfo.thpName,
            tfsSkuname: data.tfsSkuname,
            tksoCid: data.tfsCid,
            tfsQuality: data.tfsQuality,
            tfsUnit: data.tfsUnit,
            tksoActualNum: 1,
            tksoTotalNum: 0,
            tksoDiffNum: -1,
            tksoDate: this.$day(this.queryParams.tksoDate).format('YYYYMMDD'),
            operatorName: '',
            tksoRemark: '',
            tksoStt: '01'
          };
        }
      } else if (tdata.tksoActualNum >= tdata.tksoTotalNum) {
        if (!tdata.isWarn) {
          this.tableDialog = true;
          this.tData = tdata;
        } else {
          tdata.tksoActualNum = Number(tdata.tksoActualNum) + 1;
          tdata.tksoDiffNum = Number(tdata.tksoDiffNum) - 1;
          this.$message({ type: 'success', message: '扫码成功' });
        }
      } else {
        tdata.tksoActualNum = Number(tdata.tksoActualNum) + 1;
        tdata.tksoDiffNum = Number(tdata.tksoDiffNum) - 1;
        this.$message({ type: 'success', message: '扫码成功' });
      }
      this.barCode = '';
    },
    // 超出计划出库提醒确认
    onconfirm() {
      if (!this.remark) {
        this.$message({ type: 'error', message: '请填写备注！' });
        return;
      }
      if (this.tData.tksoTotalNum == 0) {
        this.tableData.push(this.tData);
      } else {
        this.tData.tksoActualNum += 1;
        this.tData.tksoDiffNum -= 1;
      }
      this.tData.tksoRemark = this.remark;
      this.remark = '';
      this.tData.isWarn = true;
      this.tableDialog = false;
      this.$refs.barCodeInput.focus();
    },
    // 编辑
    edit(row) {
      this.editDialog = true;
      this.current = this.$deepClone(row);
    },
    // 删除
    del(row) {
      const index = this.tableData.findIndex(item => item.tksoCid == row.tksoCid);
      this.tableData.splice(index, 1);
    },
    // 编辑确认
    onEditConfirm() {
      if (this.current.tksoActualNum == '') {
        this.$message({ type: 'error', message: '请输入正确的数额！' });
        return;
      }
      const data = this.tableData.find(item => item.tksoCid === this.current.tksoCid && item.tksoStt === '01');
      if (this.current.tksoActualNum > data.tksoTotalNum) {
        this.$message({ type: 'error', message: '编辑时数量不能大于计划出库量！' });
        return;
      }
      data.tksoActualNum = Number(this.current.tksoActualNum).toFixed(0);
      data.tksoDiffNum = data.tksoTotalNum - data.tksoActualNum;
      this.$refs.barCodeInput.focus();
      this.editDialog = false;
    },
    // 出库按钮
    stockOut() {
      if (!this.tableData.length) {
        this.$message({ type: 'error', message: '没有需要出库的数据' });
        return;
      }
      const actualType = this.stockData.filter(item => item.tksoStt !== '02').length;
      const totalType = this.tableData.filter(item => item.tksoStt !== '02' && item.tksoActualNum != 0).length;
      this.currentStock = {
        heatPonitName: this.tableData[0].heatPonitName,
        actualType,
        totalType,
        actualNum: 0,
        totalNum: 0
      };
      this.tableData.forEach((item) => {
        if (item.tksoStt !== '02') {
          this.currentStock.actualNum += Number(item.tksoTotalNum);
          this.currentStock.totalNum += Number(item.tksoActualNum);
        }
      });
      // this.comfirmVisible = false;
      // if ((this.current.totalType >= this.currentStock.actualType) || (this.currentStock.totalNum >= this.currentStock.actualNum)) {
      //   this.comfirmVisible = true;
      // }
      this.stockDialog = true;
    },
    // 确认出库
    onStockConfirm() {
      const params = {
        stockOutBeans: []
      };
      this.tableData.forEach((item) => {
        if (item.tksoStt != '02' && item.tksoActualNum != 0) {
          params.stockOutBeans.push({
            tksoHpid: this.heatInfo.thpId,
            tksoDate: item.tksoDate,
            tksoCid: item.tksoCid,
            tksoActualNum: item.tksoActualNum,
            tksoDiffNum: item.tksoDiffNum
          });
        }
      });
      this.$request('StockOut/makeStockOut', params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: 'success', message: '出库成功' });
            this.stockDialog = false;
            this.search();
          } else {
            this.$message({ type: 'error', message: err.errMsg });
          }
        })
      );
    },
    // 打印预览
    printConfirm() {
      // 其他信息
      // const totalType = this.tableData.filter(item => item.tksoStt === '01').length;
      // const actualType = this.stockData.filter(item => item.tksoStt === '01').length;
      const totalType = this.tableData.length;
      const actualType = this.stockData.length;
      let totalNum = 0;
      let actualNum = 0;
      this.tableData.forEach((item) => {
        totalNum += Number(item.tksoActualNum);
      });
      this.stockData.forEach((item) => {
        actualNum += Number(item.tksoTotalNum);
      });
      this.infoData = {
        hpName: this.heatInfo.thpName,
        hpAddress: this.heatInfo.thpDesc,
        hpLeader: this.heatInfo.thpShopLeader,
        hpPhone: this.heatInfo.thpShopTel,
        date: this.printDate,
        totalType,
        totalNum,
        actualType,
        actualNum,
      };
      // 菜品信息
      this.formData = [];
      const rows = 35;
      for (let x = 0; x < Math.ceil(this.tableData.length) / rows; x++) {
        const start = x * rows;
        const end = start + rows;
        const data = this.tableData.slice(start, end);
        const type = data.length;
        let num = 0;
        for (let i = 0; i < data.length; i++) {
          num += Number(data[i].tksoActualNum);
        }
        this.formData.push({
          dish: data,
          type,
          num
        });
        // this.formData.push(this.tableData.slice(start, end));
      }
      console.log(this.formData);
      this.printDialog = true;
    },
    printCancel() {
      this.printDialog = false;
    },
    onCancel() {
      this.remark = '';
      this.$refs.barCodeInput.focus();
    }
  },
};
</script>

<style>
.small-input {
  width: 300px;
}
.el-dialog {
  width: 600px;
}
.el-form-item {
  padding-left: 50px;
}
</style>
