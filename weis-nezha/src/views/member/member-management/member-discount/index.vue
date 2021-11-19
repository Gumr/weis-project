<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="computedQueryComps"
        :span="4"
        :label-width="80"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick()">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
          >
            {{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">新建组</el-button>
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
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">设置折扣</span>
            <span class="brand-color cursor-pointer action-label" @click="toDetail(row)">编辑用户</span>
            <span class="brand-color cursor-pointer action-label" @click="deleteClick(row)">删除折扣</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="box"
      width="1050px"
      title="设置折扣"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">组名称：</span>
          <el-input v-model="currentTag.tdgName" clearable class="medium-input" maxlength="11"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">折扣类型：</span>
          <BaseSelect
            v-model="currentTag.tdgType"
            class="medium-input"
            :options="options"
            clearable
          ></BaseSelect>
        </div>
        <!-- <div class="section-item">
          <span class="section-label label-1">是否可编辑：</span>
          <el-radio-group v-model="currentTag.tdgReadOnly">
            <el-radio label="01">可编辑</el-radio>
            <el-radio label="00">不可编辑</el-radio>
          </el-radio-group>
        </div>-->
        <div v-for="(item, index) in currentTag.tdgDiscount" :key="index" class="section-item">
          <span class="section-label label-1">{{ item.marketStr }}：</span>
          <span>打</span>
          <el-input
            v-model="item.discount"
            class="mini-input"
            clearable
            @blur="checkText('discount', index)"
          ></el-input>折,
          <span class="section-label" clearable style="margin-left: 5px;">持续天数</span>
          <el-input v-model="item.num" class="mini-input" clearable @blur="checkText('num', index)"></el-input>
          <span class="section-label" style="margin-left: 5px;">生效日期：</span>
          <el-date-picker
            v-model="item.startDate"
            style="width: 140px;"
            type="date"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <el-date-picker
            v-model="item.endDate"
            style="width: 140px;"
            type="date"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
          <!-- <el-date-picker style="width: 220px;" type="daterange" value-format="yyyy-MM-dd" v-model="item.date" @change="dateChange"></el-date-picker> -->
          <span style="margin-left: 10px;">原价金额上限</span>
          <el-input
            v-model="item.dayLimitAmount"
            class="mini-input"
            clearable
            @blur="checkText('dayLimitAmount', index)"
          ></el-input>元
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      box: false,
      currentTag: {
        tdgName: '',
        tdgType: '',
        tdgReadOnly: '01',
        tdgDiscount: []
      },
      options: [],
      discountInfo: [],
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '折扣组名称',
          prop: 'groupName'
        },
        {
          label: '折扣类型',
          prop: 'discountGroupType'
        },
        {
          label: '折扣组人数',
          prop: 'peopleNum'
        },
        {
          label: '数搭（折）',
          prop: 'sdDiscount'
        },
        {
          label: '饮食（折）',
          prop: 'ysDiscount'
        },
        {
          label: '营养餐（折）',
          prop: 'yyDiscount'
        },
        {
          label: 'SmartFood+（折）',
          prop: 'sfpDiscount'
        },
        {
          label: '最后编辑时间',
          prop: 'utime'
        },
        {
          label: '最后编辑人',
          prop: 'operator'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        groupName: '',
        userPhone: '',
        readOnly: ''
      },
      queryComps: [
        {
          label: '折扣组名称',
          key: 'groupName',
          component: 'el-input',
          placholder: '请输入折扣组名称',
          props: {
            clearable: true
          }
        },
        {
          label: '用户手机',
          key: 'userPhone',
          component: 'el-input',
          placholder: '用户手机',
          props: {
            clearable: true
          }
        },
        {
          label: '编辑状态',
          key: 'readOnly',
          component: 'BaseSelect',
          placholder: '请选择编辑状态',
          props: {
            clearable: true,
            options: [
              {
                label: '不可编辑',
                value: '00'
              },
              {
                label: '可编辑',
                value: '01'
              }
            ]
          }
        }
      ]
    }
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    }
  },
  created() {
    this.getRelevantInfo()
    this.getList()
  },
  methods: {
    checkText(type, index) {
      let number = this.currentTag.tdgDiscount[index][type]
      const fixed = type == 'discount' ? 2 : 0
      number = isNaN(number) ? '' : Math.abs(Number(number).toFixed(fixed))
      if (number > 10 && type == 'discount') {
        number = 10
      }
      number = number == 0 ? '' : number
      this.currentTag.tdgDiscount[index][type] = number
    },
    dateChange(value) {
      // console.log(value, 'value');
      // console.log(this.currentTag.tdgDiscount, 'currentTag.tdgDiscount')
    },
    async getRelevantInfo() {
      const res = await this.$http('discount.DiscountGroup/relevantInfo', {})
      this.options = res.obj.discountType
      this.discountInfo = res.obj.market
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http('discount.DiscountGroup/queryDiscountGroup', params)
      if (!res.errMsg) {
        this.tableData = res.obj.record
        this.tableDataTotal = res.obj.totalRecordCount
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('discount.DiscountGroup/queryDiscountGroup', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      })
    },
    toCreate() {
      this.currentTag = {
        tdgName: '',
        tdgType: '20',
        tdgReadOnly: '01',
        tdgDiscount: []
      }
      this.currentTag.tdgDiscount = this.discountInfo.map(val => ({
        marketStr: val.label,
        market: val.value,
        discount: '',
        num: '',
        dayLimitAmount: '',
        startDate: '',
        endDate: ''
      }))
      this.box = true
    },
    deleteClick(row) {
      this.$confirm(`是否删除折扣组 ${row.groupName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.delGroup(row)
      })
    },
    delGroup(row) {
      this.$http('discount.DiscountGroup/delGroup', { groupId: row.groupId })
        .thenwrap((err) => {
          if (err) {
            this.$msg(err.errMsg, 'error')
          } else {
            this.$msg('删除成功', 'success')
            this.getList()
          }
        })
    },
    async toEdit(row) {
      this.box = true
      const res = await this.$http('discount.DiscountGroup/queryDiscountInfo', { groupId: row.groupId })
      this.currentTag.tdgName = res.obj.groupName
      this.currentTag.tdgType = res.obj.tdgType
      this.currentTag.tdgReadOnly = res.obj.tdgReadOnly
      // this.currentTag.tdgDiscount = res.obj.discountInfo;
      this.currentTag.tdgId = res.obj.groupId
      this.currentTag.tdgDiscount = res.obj.discountInfo.map((item) => {
        item.discount = item.discount == '0' ? '' : item.discount
        item.num = item.num == '0' ? '' : item.num
        item.startDate = item.startDate ? this.$day(item.startDate).format('YYYY-MM-DD') : ''
        item.endDate = item.endDate ? this.$day(item.endDate).format('YYYY-MM-DD') : ''
        // if(item.startDate && item.endDate){
        //   item.date = [this.$day(item.startDate).format('YYYY-MM-DD'), this.$day(item.endDate).format('YYYY-MM-DD')];
        // }
        return item
      })
      // for (const item of this.currentTag.tdgDiscount) {
      //   item.discount = item.discount == '0' ? '' : item.discount;
      //   if(item.startDate && item.endDate){
      //     item.date = [this.$day(item.startDate).format('YYYY-MM-DD'), this.$day(item.endDate).format('YYYY-MM-DD')];
      //   }
      // }
    },
    toDetail(row) {
      this.$router.push({
        path: `${this.$route.path}/detail`,
        query: {
          groupId: row.groupId
        }
      })
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date)
        params.startDate = startDate.format('YYYY-MM-DD')
        params.endDate = endDate.format('YYYY-MM-DD')
      }
      delete params.date
      return params
    },
    async tagConfirm(done) {
      if (!this.currentTag.tdgName) {
        this.$msg('请输入组名称', 'error')
        done()
        return
      }
      if (!this.currentTag.tdgType) {
        this.$msg('请选择折扣类型', 'error')
        done()
        return
      }
      const arr = this.currentTag.tdgDiscount.filter(val => val.discount)
      if (!arr.length) {
        this.$msg('请输入信息', 'error')
        done()
        return
      }
      // for (const item of this.currentTag.tdgDiscount) {
      //   if (!item.discount && !item.date.length && !item.dayLimitAmount) {

      //   } else if (!item.discount || !item.date.length || !item.dayLimitAmount) {
      //     this.$msg('请输入完整信息', 'error');
      //     done();
      //     return;
      //   }
      // }
      const params = this.$deepClone(this.currentTag)
      params.tdgDiscount = this.$deepClone(arr)
      params.tdgDiscount.forEach((val) => {
        val.startDate = val.startDate ? this.$day(val.startDate).format('YYYYMMDD') : ''
        val.endDate = val.endDate ? this.$day(val.endDate).format('YYYYMMDD') : ''
      })
      const url = this.currentTag.tdgId ? 'discount.DiscountGroup/editGroup' : 'discount.DiscountGroup/addGroup'
      const res = await this.$http(url, params)
      if (!res.errMsg) {
        this.$msg('操作成功', 'success')
        this.box = false
        this.getList()
        setTimeout(() => {
          done()
        }, 500)
      } else {
        this.$msg(res.errMsg, 'error')
        done()
      }
    }
  }
})
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.medium-input {
  width: 385px;
  margin-right: 20px;
}

.label-1 {
  width: 120px;
  margin-right: 12px;
  text-align: right;
}
.action-label {
  margin-right: 10px;
}
.mini-input {
  width: 80px;
  margin: 0 10px;
}
</style>
