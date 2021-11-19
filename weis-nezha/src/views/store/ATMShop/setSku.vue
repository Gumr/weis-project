<template>
  <div class="page-container">
    <div>
      <div class="query-bar">
        <QueryComponents
          v-model="queryParams"
          :query-list="queryComps"
          :span="4"
          :label-width="120"
          semi
        >
          <template #action>
            <el-button type="primary" @click="getList">搜索</el-button>
            <el-button type="primary" @click="handleExport">{{
              $store.state.bloading ? '导出中' : '导出'
            }}</el-button>
            <el-button type="primary" @click="setValidDate"
              >批量设置货道有效期</el-button
            >
          </template>
        </QueryComponents>
      </div>
      <div>
        <BasePageTable
          v-model:current-page="page.pageNo"
          v-model:page-size="page.pageSize"
          v-loading="$store.state.vloading"
          :data="tableData"
          :total="tableDataTotal"
          border
          @current-page-change="getList"
          @update:selection="handleSelection"
          @size-change="getList"
        >
          <el-table-column
            v-for="col in skuCol"
            :key="col.prop"
            v-bind="col"
            align="center"
          >
            <template
              #default="{ row }"
              v-if="col.prop === 'skuName' || col.prop === 'validDate'"
            >
              <div
                class="namesList"
                v-if="col.prop === 'skuName'"
                @click="editT(row)"
                :class="
                  !row.skuName ? 'borders' : row.invalid ? 'disabled' : ''
                "
              >
                {{ row.skuName ? row.skuName : '选择商品' }}
              </div>
              <div
                class="namesList cursor-pointer"
                v-if="
                  col.prop === 'validDate' &&
                  row.aisleStartDate &&
                  row.aisleEndDate
                "
                @click="setValidDate('single', row)"
              >
                <span>{{ row.aisleStartDateStr }} - </span
                ><span>{{ row.aisleEndDateStr }}</span>
              </div>
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

          <el-button type="primary" @click="getskuList">搜索</el-button>
        </div>

        <BasePageTable
          :data="skuList"
          border
          style="margin-top: 30px"
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
            <template #default="{ row }" class="action-cell">
              <el-image
                v-if="row.imgUrl"
                style="width: 100px; height: 100px"
                :src="row.imgUrl"
                :preview-src-list="[row.imgUrl]"
                class="food-cover"
              />
              <span v-else>无</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }" class="action-cell">
              <span style="color: blue" @click="selsku(row)">选择</span>
            </template>
          </el-table-column>
        </BasePageTable>
      </ConfirmDialog>
    </div>
    <!-- 修改货道有效期 -->
    <ConfirmDialog
      v-model="showVdDialog"
      title="批量修改货道有效期"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="confirmSetValidDate"
    >
      <p>
        共修改<span>{{ selectRows.length }}</span
        >个货道，批量将这些货道的关联菜品有效期修改为：
      </p>
      <span>选择时间：</span>
      <el-date-picker
        v-model="vdDateRange"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      >
      </el-date-picker>
    </ConfirmDialog>
    <!--关联供餐点-->
    <!-- <ConfirmDialog
      v-model="showShop"
      title="关联供餐点"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="false"
    >
      <div>
        <BasePageTable :data="shopList" border :visible="false">
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
          <el-table-column label="操作" align="center">
            <template #default="{ row }" class="action-cell">
              <span style="color: blue" @click="selPoint(row)">选择</span>
            </template>
          </el-table-column>
        </BasePageTable>
      </div>
    </ConfirmDialog> -->
  </div>
</template>

<script lang="ts">
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ButtonTabs from '@/components/ButtonTabs.vue'
import { requestFactor } from '@/utils/request'
import { ElMessage } from 'element-plus'
const { http } = requestFactor('machine.MachineAisle', true)

export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ButtonTabs,
  },
  data() {
    return {
      machineCode: 0,
      shopList: [],
      showShop: false,
      MachinePage: [],

      tabs: [
        {
          label: '机器列表',
          value: '00',
        },
        {
          label: '冷藏柜列表',
          value: '01',
        },
      ],
      skuList: [],
      salesDate: '',
      thpId: '',
      cid: '',
      skuName: '',
      vdDateRange: '',
      selectRows: [], // 选择的待修改的货道
      showVdDialog: false,
      editDialogVisible: false,
      editRow: {
        aisleCapacity: '',
        machineCode: '',
        aisleCode: '',
        salesDate: '',
      },
      queryParams2: {
        pointId: '',
        machineName: '',
      },
      queryComps2: [
        {
          component: 'BaseSelect',
          key: 'pointId',
          label: '供餐点名称',
          props: {
            options: [],
            clearable: true,
          },
        },
        {
          component: 'el-input',
          key: 'machineName',
          label: '机器名称',
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
      ],

      queryParams: {
        machineCode: '',
        thpId: '',
        skuName: '',
        date: [this.$day(new Date(Date.now() + 86400000 * 2)).format('YYYYMMDD'),this.$day(new Date(Date.now() + 86400000 * 2)).format('YYYYMMDD')],
        startDate: this.$day(new Date(Date.now() + 86400000 * 2)).format(
          'YYYYMMDD'
        ), //开始时间 yyyy-mm-dd
        endDate: this.$day(new Date(Date.now() + 86400000 * 2)).format(
          'YYYYMMDD'
        ), //结束时间 yyyy-mm-dd
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
      // queryParams: {
      //   date: [
      //     this.$day(new Date()).format('YYYYMMDD'),
      //     this.$day(new Date()).format('YYYYMMDD'),
      //   ],
      //   skuName: '',
      //   invalid: null,
      //   startDate: this.$day(new Date()).format('YYYYMMDD'), //开始时间 yyyymmdd
      //   endDate: this.$day(new Date()).format('YYYYMMDD'), //结束时间 yyyymmdd
      // },
      queryComps: [
        {
          component: 'el-date-picker',
          key: 'date',
          label: '售卖时间',
          placeholder: '选择日期',

          props: {
            type: 'daterange',
            clearable: false,
          },
          listeners: {
            change: (value) => {
              // console.log(value)
              const queryParams = this.queryParams as Record<string, any>
              queryParams.startDate = this.$day(value[0]).format('YYYYMMDD')
              queryParams.endDate = this.$day(value[1]).format('YYYYMMDD')
            },
          },
        },

        // {
        //   component: 'BaseSelect',
        //   key: 'thpId',
        //   label: '供餐点名称',
        //   props: {
        //     options: [],
        //     clearable: true,
        //   },
        // },
        {
          component: 'el-input',
          key: 'skuName',
          label: '商品名称',
          placeholder: '请输入商品',
          props: {
            clearable: true,
          },
          maxlength: 30,
        },
        {
          component: 'BaseSelect',
          key: 'invalid',
          label: '是否失效',
          props: {
            clearable: true,
            options: [
              {
                label: '是',
                value: true,
              },
              {
                label: '否',
                value: false,
              },
            ],
          },
        },
      ],
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80',
        },
        {
          label: '机器名称',
          prop: 'machineName',
        },
        {
          label: '机器编码',
          prop: 'machineCode',
        },
        {
          label: '机器类型',
          prop: 'machineTypeDesc',
        },
        {
          label: '所属供餐点',
          prop: 'pointName',
        },
        {
          label: '创建人',
          prop: 'creator',
        },
        {
          label: '创建时间',
          prop: 'ctime',
        },
      ],
      skuCol: [
        {
          type: 'selection',
        },
        {
          label: '设备名称',
          prop: 'machineName',
          formatter(row) {
            return row.machineName || row.machineCode
          },
        },
        {
          label: '设备编码',
          prop: 'machineCode',
        },
        {
          label: '货道编号',
          prop: 'aisleCode',
        },
        {
          label: '货道最大容量',
          prop: 'aisleCapacity',
        },
        {
          label: '商品名称',
          prop: 'skuName',
          formatter: (row) => {
            if (row.invalid) return `${row.skuName}(失效)`
          },
        },
        {
          label: '商品编码',
          prop: 'cid',
        },

        // {
        //   label: "备货量",
        //   prop: "aisleStock",
        // },
        {
          label: '商品供应时间',
          prop: 'skuSalesDate',
        },
        {
          label: '货道关联有效期',
          prop: 'validDate',
        },
        {
          label: '售卖日期',
          prop: 'salesDate',
        },
      ],
    }
  },
  created() {
    this.queryParams.machineCode = this.$route.query.machineCode
    this.queryParams.thpId = this.$route.query.thpId
    this.getList()
    this.queryHeatingPointList()
    this.queryMachinePage()
    this.getShopList()
  },
  methods: {
    // 多选数据，批量操作用
    handleSelection(selection) {
      this.selectRows = selection
    },
    setValidDate(type = 'multi', row) {
      if (type === 'single') this.selectRows.push(row)
      if (this.selectRows.length === 0) {
        ElMessage.error('请选择要修改的货道')
        return
      }
      this.showVdDialog = true
    },
    // 批量设置货道有效期
    confirmSetValidDate(done) {
      // console.log(this.vdDateRange)
      const vdDates = this.vdDateRange
      const selectRows = this.selectRows.map((row) => {
        return {
          machineCode: row.machineCode,
          aisleCode: row.aisleCode,
          salesDate: row.salesDate,
        }
      })
      // console.log(selectRows)
      http('batchMachineAisleValidSetting', {
        aisleStartDate: this.$day(vdDates[0]).format('YYYYMMDD'), // 有效期开始时间
        aisleEndDate: this.$day(vdDates[1]).format('YYYYMMDD'), // 有效期结束时间
        aisleList: selectRows, // 包含 machineCode 机器编号、aisleCode 货道编号、salesDate 售卖日期
      }).then((res) => {
        if (res.errCode === 0) {
          ElMessage.success('修改成功')
          this.showVdDialog = false
          this.getList()
        } else {
          ElMessage.error(res.errMsg)
        }
        this.vdDateRange = []
        done()
      })
    },
    toShop(row) {
      this.machineCode = row.machineCode
      this.showShop = true
    },
    async queryMachinePage() {
      const res = await this.$http('machine.Machine/queryMachinePage', {
        ...this.page,
        ...this.queryParams,
      })
      this.MachinePage = res.obj.dataPage.record
    },
    async getShopList() {
      const res = await this.$http('HeatingPoint/queryPointList', {})
      this.shopList = res.obj
      // this.tableDataTotal2 = res.obj;
    },
    async queryHeatingPointList() {
      let params = {
        // shopType: "20",
      }
      const res = await this.$request(
        'HeatingPoint/queryHeatingPointList',
        params
      )
      if (!res.data.errMsg) {
        this.queryComps[1].props.options = res.data.obj
        this.queryComps2[0].props.options = res.data.obj
      }
    },
    async getList() {
      const res = await this.$http(
        'machine.MachineAisle/queryMachineAislePage',
        {
          ...this.page,
          ...this.queryParams,
        }
      )
      const { record, totalRecordCount } = res.obj.dataPage
      record.forEach((item) => {
        item.aisleStartDateStr = this.$day(item.aisleStartDate).format(
          'YYYY/MM/DD'
        )
        item.aisleEndDateStr = this.$day(item.aisleEndDate).format('YYYY/MM/DD')
      })
      this.tableData = record
      this.tableDataTotal = totalRecordCount
      // this.isGray = this.$day().hour() >= 18 ? true : false; // 18：00 后不可修改
    },

    async syncMachine() {
      const res = await this.$request('machine.Machine/syncMachine', {})
      if (!res.data.errMsg) {
        this.$msg('同步成功', 'success')
      } else {
        this.$msg(res.data.errMsg, 'error')
      }
    },
    async selPoint(row) {
      let parmas = {
        pointId: row.thpId,
        machineCode: this.machineCode,
      }

      const res = await this.$request(
        'machine.Machine/unionMachinePoint',
        parmas
      )
      if (!res.data.errMsg) {
        this.$msg('设置成功', 'success')
        this.showShop = false
        this.queryMachinePage()
      } else {
        this.$msg(res.data.errMsg, 'error')
      }
    },
    selsku(row) {
      this.$request('machine.MachineAisle/editMachineAisleSku', {
        machineCode: this.editRow.machineCode,
        aisleCode: this.editRow.aisleCode,
        salesDate: this.editRow.salesDate,
        cid: row.cid,
        stock: this.editRow.aisleCapacity,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$msg('选择成功', 'success')
            this.editDialogVisible = false
            this.getList()
          } else {
            this.$msg(err.errMsg, 'error')
          }
        })
      )
    },
    // copyClick() {
    //   let lastDate = this.$day(
    //     new Date(dayjs(this.queryParams.startDate)).valueOf() - 24 * 60 * 60000
    //   ).format('YYYYMMDD')
    //   this.$request('machine.MachineAisle/copyMachineAisleConfig', {
    //     date: lastDate,
    //     targetDate: this.queryParams.startDate,
    //   }).then(
    //     this.$rw((err, res) => {
    //       if (!err) {
    //         this.$msg('复制成功', 'success')
    //         this.getList()
    //       } else {
    //         this.$msg(err.errMsg, 'error')
    //       }
    //     })
    //   )
    // },
    getskuList() {
      this.$request('machine.MachineAisle/queryMachineAisleSkuList', {
        thpId: this.editRow.thpId,
        salesDate: this.editRow.salesDate,
        cid: this.cid,
        skuName: this.skuName,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.skuList = res
          }
        })
      )
    },
    setStock(row) {
      if (!row.skuName) {
        this.$msg(`货道${row.aisleCode}请先选择商品`, 'error')
        return
      }
      if (Number(row.aisleStock) > Number(row.aisleCapacity)) {
        row.aisleStock = row.aisleCapacity
        this.$msg(`备货量不能大于货道容量`, 'error')
        return
      }
      this.$request('machine.MachineAisle/editMachineAisleSku', {
        machineCode: row.machineCode,
        aisleCode: row.aisleCode,
        salesDate: row.salesDate,
        cid: row.cid,
        stock: row.aisleStock,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$msg('设置成功', 'success')
          } else {
            this.$msg(err.errMsg, 'error')
          }
          this.getList()
        })
      )
    },
    editT(row) {
      this.editRow = row
      this.getskuList()
      this.editDialogVisible = true
    },
    handleExport() {
      const filename = `${this.$route.meta.title}-导出`
      exportExcel({
        columns: this.skuCol,
        filename,
        data: this.tableData,
      })
    },
  },
}
</script>

<style scoped>
.namesList {
  color: blue;
}
.borders {
  color: red;
}
.disabled {
  color: #c0c4cc;
}
.searchbar {
  display: flex;
}
.txt {
  margin-right: 20px;
}
</style>