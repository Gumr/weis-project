<template>
  <div class="page-container">
    <QueryComponents
      v-model="tableQuery"
      class="query-component"
      :query-list="tableQueryComps"
      :span="4"
      :label-width="60"
    >
      <template #search>
        <el-button type="primary" @click="searckClick">搜索</el-button>
      </template>
      <template #action>
        <div class="text-right">
          <ImportExcel ref="import" @import="handleImportExcel">
            <el-button type="primary">批量充值</el-button>
          </ImportExcel>
          <span
            class="table-action-label font-size-14"
            style="margin: 0 10px;"
            @click="downloadTemplateClick"
          >下载充值模板</span>
          <span class="table-action-label font-size-14" @click="$pushRoute('record')">批量充值记录</span>
        </div>
      </template>
    </QueryComponents>
    <BasePageTable
      ref="table"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      v-loading="$store.state.vloading"
      :height="height"
      :data="table.data"
      :total="table.total"
      :current-row-key="currentRowKey"
      row-key="uid"
      border
      @current-page-change="getTableData"
      @size-change="getTableData"
      @current-change="rowClick"
    >
      <el-table-column v-for="col in table.col" :key="col.prop" v-bind="col"></el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <!-- <el-button @click="goDetail(row.uid)" type="primary">
            明细
          </el-button>-->
          <el-button type="warning" @click="rechargeClick(row)">余额充值</el-button>
        </template>
      </el-table-column>
    </BasePageTable>

    <el-dialog v-model="dialog.importFail" title="导入结果" center>
      <h3>导入失败，以下是出错手机号</h3>
      <el-table :data="importFailTable" border stripe>
        <el-table-column v-for="col in importFailColumns" v-bind="col" :key="col.label"></el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="exportFailTableClick">导出错误名单</el-button>
        <el-button type="primary" @click="reimportClick">重新导入</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialog.importSuccess" title="导入结果" center>
      <h3>导入成功</h3>
      <FormItem label="充值人数" semi>
        <span>{{ importResult.user }}</span>
      </FormItem>
      <FormItem label="充值本金" semi>
        <span>{{ importResult.recharge }}</span>
      </FormItem>
      <FormItem label="充值赠送金" semi>
        <span>{{ importResult.donation }}</span>
      </FormItem>
      <FormItem label="合计" semi>
        <span>{{ importResult.$amount }}</span>
      </FormItem>
      <FormItem label="备注" semi>
        <el-input v-model="importResult.remarks" type="textarea" :rows="4" />
      </FormItem>
      <template #footer>
        <SubmitButton @click="confirmImportClick">确认导入</SubmitButton>
      </template>
    </el-dialog>

    <ConfirmDialog
      v-model="rechargeVisible"
      title="会员余额充值"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="handleRechargeConfirm"
    >
      <div class="recharge-item">
        <span class="recharge-label">昵称</span>
        <span>{{ member.uname }}</span>
      </div>
      <div class="recharge-item">
        <span class="recharge-label">手机号</span>
        <span>{{ member.phone }}</span>
      </div>
      <el-form :model="rechargeModel" label-width="100px">
        <el-form-item label="本金" porp="recharge">
          <el-input
            v-model="rechargeModel.recharge"
            @input="v => handleMoneyInput(v, 'recharge')"
            @keydown="catchNonNumberKeydown"
          ></el-input>
        </el-form-item>
        <el-form-item label="赠送金" porp="donation">
          <el-input
            v-model="rechargeModel.donation"
            @input="v => handleMoneyInput(v, 'donation')"
            @keydown="catchNonNumberKeydown"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" porp="remarks">
          <el-input v-model="rechargeModel.remarks" type="textarea" :rows="4"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
    <ConfirmDialog
      v-model="confirmRechargeVisible"
      title="提示"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="confirmRecharge"
    >
      <div class="recharge-item">确认为以下会员进行充值余额吗？</div>
      <div>
        <div class="recharge-item">
          <span class="recharge-confirm-label">昵称</span>
          <span>{{ member.uname }}</span>
        </div>
        <div class="recharge-item">
          <span class="recharge-confirm-label">手机号</span>
          <span class="recharge-phone">{{ member.phone }}</span>
        </div>
        <div class="recharge-item">
          <span class="recharge-confirm-label">本金</span>
          <span class="recharge-money">{{ rechargeModel.recharge || 0 }}</span>
        </div>
        <div class="recharge-item">
          <span class="recharge-confirm-label">赠送金</span>
          <span class="recharge-money">{{ rechargeModel.donation || 0 }}</span>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import format from '@/utils/format'
import { catchNonNumberKeydown } from '@/utils/event-catcher'
import exportExcel from '@/utils/export-excel'
import ImportExcel from '@/components/ImportExcel.vue'
import FormItem from '@/components/FormItem.vue'
import SubmitButton from '@/components/SubmitButton.vue'
import { round } from '@/utils/common'
import { ElAlert } from 'element-plus'
import { h } from '@vue/runtime-core'
export default {
  name: 'finance_member-management_member-recharge',
  components: {
    BasePageTable,
    SubmitButton,
    ImportExcel,
    FormItem,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      currentRowKey: null,
      dialog: {
        importFail: false,
        importSuccess: false
      },
      rechargeModel: {
        recharge: 0,
        donation: 0,
        remarks: ''
      },
      member: {},
      rechargeVisible: false,
      confirmRechargeVisible: false,
      tableQuery: {
        phone: ''
      },
      tableQueryComps: [
        {
          label: '手机号',
          key: 'phone',
          component: 'el-input',
          placholder: '请输入手机号'
        },
        {
          slot: 'search'
        },
        {
          slot: () => null
        }
        // {
        //   slot: () => null
        // },
        // {
        //   slot: () => null
        // }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      importResult: {
        user: '',
        recharge: '',
        donation: '',
        $amount: '',
        remarks: ''
      },
      importFailTable: [],
      importFailColumns: [
        {
          prop: 'uname',
          label: '姓名'
        },
        {
          prop: 'phone',
          label: '手机号'
        },
        {
          prop: 'recharge',
          label: '充值本金'
        },
        {
          prop: 'donation',
          label: '充值赠送金'
        },
        {
          prop: '$amount',
          label: '合计'
        }
      ],
      table: {
        total: 0,
        data: [],
        col: [{
          type: 'index',
          label: '序号'
        }, {
          label: '会员ID',
          prop: 'uid'
        }, {
          label: '会员名称',
          prop: 'uname'
        }, {
          label: '手机',
          prop: 'phone'
        }, {
          label: '注册时间',
          prop: 'ctime',
          formatter: row => format.date(row.ctime)
        }, {
          label: '会员类型',
          prop: 'membertype'
        }, {
          label: '账户当前资产',
          prop: 'gold',
          formatter: row => `￥${row.gold}`
        }, {
          label: '本金',
          prop: 'tacResidualRecharge',
          formatter: row => `￥${row.tacResidualRecharge}`
        }, {
          label: '赠送金',
          prop: 'tacResidualDonation',
          formatter: row => `￥${row.tacResidualDonation}`
        }]
      }
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    catchNonNumberKeydown,
    confirmImportClick(done) {
      if (!this.importResult.remarks) {
        this.$message.error('请输入备注')
        done()
        return
      }
      this.$request('tools.ServiceTools/rechargeAccountBatch', {
        arrays: this.importSuccessTable.map(item => {
          item.remarks = this.importResult.remarks
          return item
        })
      }).thenwrap((err, res) => {
        if (!err) {
          this.dialog.importSuccess = false
          if (res.failure.length > 0) {
            this.$message.success('部分批量充值成功')
            this.$msgbox({
              title: '提示',
              showCancelButton: false,
              showConfirmButton: false,
              closeOnClickModal: false,
              center: true,
              message: h('div', null, [
                h(ElAlert, { type: 'warning', title: '部分充值出现错误', showIcon: true, closable: false }),
                ...res.failure.map(item => h('div', {
                  style: {
                    'padding': '6px 12px',
                    'border': '1px solid #DCDFE6',
                    borderRadius: '4px',
                    margin: '12px 0'
                  }
                }, [
                  h('div', null, `手机号：${item.phone}`),
                  h('div', null, `错误信息：${item.errorLog}`)
                ]))
              ])
            })
          } else {
            this.$message.success('批量充值成功')
          }
          this.getTableData()
        }
        this.$errorNotify(err)
      }).finally(done)
    },
    exportFailTableClick() {
      exportExcel({
        data: this.importFailTable,
        columns: this.importFailColumns,
        filename: '批量充值错误名单'
      })
    },
    reimportClick() {
      this.dialog.importFail = false
      this.$refs.import.triggerImport()
    },
    handleImportExcel(data) {
      function mapper(item) {
        const match = data.find(i => String(i['微信手机号']) === item.phone)
        if (match) {
          item.recharge = match['本金'] || 0
          item.donation = match['赠送金'] || 0
          item.uname = match['姓名']
          item.$amount = item.recharge + item.donation
        }
        return item
      }

      this.$request('Member/verifyUserForRecharge', {
        arrays: data.map(item => ({
          phone: item['微信手机号'],
          recharge: item['赠送金'],
          donation: item['本金']
        }))
      }).thenwrap((err, res) => {
        if (!err) {
          if (res.infeasible && res.infeasible.length > 0) {
            this.importFailTable = res.infeasible.map(mapper)
            this.dialog.importFail = true
          } else if (res.practicable.length > 0) {
            this.importSuccessTable = res.practicable.map(mapper)
            const result = this.importSuccessTable.reduce((res, item) => {
              res.recharge = round(res.recharge + item.recharge, 2)
              res.donation = round(res.donation + item.donation, 2)
              res.$amount = round(res.$amount + item.$amount, 2)
              return res
            }, {
              recharge: 0,
              donation: 0,
              $amount: 0
            })

            Object.assign(this.importResult, {
              user: this.importSuccessTable.length,
              remarks: '',
              ...result
            })

            this.dialog.importSuccess = true
          }
        }
        this.$errorNotify(err)
        console.log(res, 'res')
      })
      console.log(data, 'data')
    },
    downloadTemplateClick() {
      exportExcel({
        data: [],
        filename: '用户批量充值-模板',
        columns: [
          {
            label: '姓名'
          },
          {
            label: '微信手机号'
          },
          {
            label: '本金'
          },
          {
            label: '赠送金'
          }
        ]
      })
    },
    handleMoneyInput(val, key) {
      val = val.match(/^\d+(\.)?(\d{1,2})?/)
      val = (val && val[0]) || ''

      this.rechargeModel[key] = val
    },
    rowClick(row) {
      this.currentRowKey = row.uid
    },
    handleRechargeConfirm(done) {
      const { rechargeModel } = this
      if (!rechargeModel.recharge && !rechargeModel.donation) {
        this.$message({
          type: 'error',
          message: '充值本金或赠送金请至少输入一项！'
        })
        return
      }
      done()
      this.confirmRechargeVisible = true
    },
    confirmRecharge(done) {
      this.memberRecharge()
        .then(({ data }) => {
          if (data.errCode === 0) {
            this.$message({
              type: 'success',
              message: '会员充值余额成功'
            })

            this.rechargeVisible = false
            this.confirmRechargeVisible = false
            this.$nt(() => {
              setTimeout(() => {
                done()
              }, 800)
            })
            this.getTableData()
          } else {
            done()
            this.$errorNotify(data)
          }
        }).catch(done)
    },
    memberRecharge() {
      return this.$request('Member/rechargeAccount', {
        uid: this.member.uid,
        phone: this.member.phone,
        ...this.rechargeModel
      })
    },
    rechargeClick(row) {
      this.member = row
      this.rechargeVisible = true
      this.rechargeModel = {
        recharge: 0,
        donation: 0,
        remarks: ''
      }
    },
    searckClick() {
      this.page.pageNo = 1
      this.getTableData()
    },
    goDetail(id) {
      this.$pushRoute('detail', {
        query: {
          id
        }
      })
    },
    getTableData() {
      this.$store.state.vloading = true
      this.$request('Member/getMembersForRecharge', {
        ...this.page,
        ...this.tableQuery
      }).then(({ data }) => {
        if (data.errCode === 0) {
          this.$store.state.vloading = false
          data = data.obj
          this.table.total = data.totalRecordCount
          this.table.data = data.record
          this.$nt(() => {
            this.$refs.table.doLayout()
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../../styles/base.less";

.query-component {
  margin: 12px 0;
}

.recharge-label {
  display: inline-block;
  text-align: right;
  width: 88px;
  padding-right: 12px;
}

.recharge-confirm-label {
  margin-right: 12px;
}

.recharge-item {
  margin-bottom: 8px;
}

.recharge-phone {
  color: @warning-color;
  font-weight: bold;
}

.recharge-money {
  color: @danger-color;
  font-weight: bold;
}
</style>
