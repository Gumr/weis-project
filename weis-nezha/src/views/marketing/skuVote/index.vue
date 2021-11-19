<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
          v-model="queryParams"
          :queryList="computedQueryComps"
          :span="3"
          :label-width="80"
          semi
      >
        <template v-slot:action>
          <el-button
              type="primary"
              @click="searchClick()"
          >搜索
          </el-button>
          <el-button
              type="primary"
              @click="handleExport"
              :loading="$store.state.bloading"
          >{{ $store.state.bloading ? '导出中' : '导出' }}
          </el-button>
        </template>
      </QueryComponents>
      <el-button
          type="primary"
          @click="showAdd"
      >新建投票
      </el-button>
    </div>
    <div>
      <BasePageTable
          ref="table"
          v-loading="$store.state.vloading"
          :height="height"
          :data="tableData"
          v-model:current-page="page.pageNo"
          v-model:page-size="page.pageSize"
          :total="tableDataTotal"
          @current-page-change="getList"
          @size-change="getList"
          border
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
        >
          <template
              class="action-cell"
              v-slot="{ row }"
          >
            <span
                class="brand-color cursor-pointer action-label"
                @click="toEdit(row)"
            >编辑</span>
            <span
                class="brand-color cursor-pointer action-label"
                @click="showVote(row)"
            >投票结果</span>
            <span
                class="brand-color cursor-pointer action-label"
                @click="detail(row)"
            >详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>

    <ConfirmDialog
        v-model="showDialog.select"
        title="选择菜品"
        :close-on-click-modal="false"
        :auto-confirm="false"
        @on-confirm="selectConfirm"
    >
      <div class="query-bar">
        <QueryComponents
            v-model="selectParams"
            :queryList="computedSelectComps"
            :span="3"
            :label-width="80"
            semi
        >
          <template v-slot:action>
            <el-button
                type="primary"
                @click="searchSelect()"
            >搜索
            </el-button>
            <el-button
                type="primary"
                @click="skuExport"
                :loading="$store.state.bloading"
            >{{ $store.state.bloading ? '导出中' : '导出' }}
            </el-button>
          </template>
        </QueryComponents>
      </div>
      <BasePageTable
          ref="table"
          v-model:selection="tableSelection"
          v-loading="$store.state.vloading"
          :height="dialogHeight"
          :data="tableData2"
          border
          :columns="tableCol2"
          :visible="false"
      >
      </BasePageTable>

    </ConfirmDialog>
    <ConfirmDialog
        v-model="showDialog.create"
        :title="showDialog.edit?'编辑投票':'新建投票'"
        :close-on-click-modal="false"
        :auto-confirm="false"
        @on-confirm="onConfirm"
    >
      <el-form
          ref="exampleForm"
          :model="currentVote"
          label-width="80px"
      >
        <el-form-item label="名称" prop="voteName">
          <el-input
              v-model="currentVote.voteName"
              placeholder="请输入名称"
          ></el-input>
        </el-form-item>

        <el-form-item label="有效期" prop="date">
          <el-date-picker
              v-model="currentVote.date"
              type="daterange"
              class="medium-input"
              value-format="yyyy-MM-dd"
              style="margin-right: 10px"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
          ></el-date-picker>
          <!--          <el-date-picker-->
          <!--              v-model="currentVote.endTime"-->
          <!--              class="medium-input"-->
          <!--              value-format="yyyy-MM-dd"-->
          <!--              placeholder="结束时间"-->
          <!--          ></el-date-picker>-->
        </el-form-item>
        <el-form-item label="选择菜品" prop="skuInfo">
          <el-button
              @click="showSelect()"
          >+添加菜品
          </el-button>
        </el-form-item>
      </el-form>
      <BasePageTable
          ref="table"
          v-loading="$store.state.vloading"
          :height="dialogHeight"
          :data="selectSku"
          border
          :visible="false"
      >
        <el-table-column
            v-for="col in tableColCreate"
            :key="col.prop"
            v-bind="col"
            align="center"
        ></el-table-column>
        <el-table-column
            label="操作"
            align="center"
        >
          <template
              class="action-cell"
              v-slot="{ row }"
          >
            <span
                class="brand-color cursor-pointer action-label"
                @click="toDel(row)"
            >移除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
    <ConfirmDialog
        v-model="showDialog.detail"
        title="投票详情"
        :comfirm-visible="false"
        :cancel-visible="false"
    >
      <el-form
          ref="exampleForm"
          :model="currentVote"
          label-width="80px"
      >
        <el-form-item label="名称" prop="voteName">
          <span>{{ currentVote.voteName }}</span>
        </el-form-item>

        <el-form-item label="有效期" prop="date">
          <span>{{ $day(currentVote.date[0]).format('YYYY/MM/DD') }}</span>
          <span> - </span>
          <span>{{ $day(currentVote.date[1]).format('YYYY/MM/DD') }}</span>
        </el-form-item>
<!--        <el-form-item label="菜品" prop="skuInfo"></el-form-item>-->
      </el-form>
      <BasePageTable
          ref="table"
          v-loading="$store.state.vloading"
          :height="dialogHeight"
          :data="selectSku"
          border
          :visible="false"
          :columns="tableColCreate"
      >
      </BasePageTable>
    </ConfirmDialog>
    <ConfirmDialog
        v-model="showDialog.result"
        title="投票结果"
        :cancel-visible="false"
    >
      <BasePageTable
          ref="table"
          v-loading="$store.state.vloading"
          :height="height"
          :data="selectSku"
          border
          :visible="false"
          :columns="tableColResult"
      >
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel'
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { transformDaterange } from '@/utils/transform'
import BaseSelect from '@/components/BaseSelect.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import dayjs from 'dayjs'

export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
    ConfirmDialog
  },
  computed: {
    computedQueryComps() {
      return [...this.queryComps]
    },
    computedSelectComps() {
      return [...this.selectComps]
    }
  },
  created() {
    this.getList()
  },
  data() {
    return {
      tableSelection: [],
      selectSku: [],
      currentVote: {},
      showDialog: {
        create: false,
        edit: false,
        select: false,
        detail: false,
        result: false
      },
      height: window.innerHeight - 280,
      dialogHeight: window.innerHeight - 420,
      tableData: [],
      tableData2: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '名称',
          prop: 'voteName'
        },
        {
          label: '投票周期',
          prop: 'date',
          formatter(row) {
            return dayjs(row.beginTime.toString()).format("YYYY.MM.DD") + ' - ' + dayjs(row.endTime.toString()).format("YYYY.MM.DD")
          }
        },
        {
          label: '菜品',
          prop: 'sku',
          formatter(row) {
            const sku = row.skuVoteDetailList.map((e) => {
              return e.skuName
            })
            return sku.join('，')
          }
        },
        {
          label: '状态',
          prop: 'voteState'
        }
      ],
      tableCol2: [
        {
          type: 'selection'
        },
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '菜品名称',
          prop: 'skuName'
        },
        {
          label: '菜品状态',
          prop: 'skuState',
          formatter(row) {
            return row.skuState === '70' ? '已下架' : row.skuState === '60' ? '已上架' : row.skuState === '50' ? '未上架' : ''
          }
        }
      ],
      tableColCreate: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '菜品名称',
          prop: 'skuName'
        },
        {
          label: '菜品状态',
          prop: 'skuState',
          formatter(row) {
            return row.skuState === '70' ? '已下架' : row.skuState === '60' ? '已上架' : row.skuState === '50' ? '未上架' : ''
          }
        }
      ],
      tableColResult: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '菜品名称',
          prop: 'skuName'
        },
        {
          label: '投票数量',
          prop: 'voteNum'
        }
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        voteName: '',
        beginTime: '',
        date: [],
        endTime: ''
      },
      selectParams: {
        skuName: '',
        skuState: ''
      },
      queryComps: [
        {
          label: '投票周期',
          component: 'el-date-picker',
          key: 'date',
          props: {
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间',
            type: 'daterange'
          }
        },
        {
          component: 'el-input',
          key: 'voteName',
          label: '名称',
          placeholder: '请输入名称',
          props: {
            clearable: true
          }
        }
      ],
      selectComps: [
        {
          component: 'el-input',
          key: 'skuName',
          label: '菜品名称',
          placeholder: '请输入名称',
          props: {
            clearable: true
          }
        }, {
          component: 'BaseSelect',
          key: 'skuState',
          label: '菜品状态',
          placeholder:'全部',
          props: {
            clearable: true,
            options: [{
              label: '未上架',
              value: '50'
            },
              {
                label: '已上架',
                value: '60'
              },
              {
                label: '已下架',
                value: '70'
              }]
          }
        }
      ]
    }
  },
  methods: {
    createVote() {
      return {
        id: '',
        date: null,
        voteName: '',
        skuInfo: []
      }
    },
    showVote(row) {
      this.showDialog.result = true
      this.selectSku = row.skuVoteDetailList
    },
    showAdd() {
      this.currentVote = this.createVote()
      this.selectSku = []
      this.showDialog.create = true
      this.showDialog.edit = false
    },
    detail(row) {
      this.currentVote = this.createVote()
      this.currentVote.id = row.id
      this.currentVote.voteName = row.voteName

      const beginTime = row.beginTime.toString()
      const endTime = row.endTime.toString()
      this.currentVote.date = row.beginTime ? [this.$day(beginTime), this.$day(endTime)] : []
      this.selectSku = row.skuVoteDetailList
      this.showDialog.detail = true
    },
    toEdit(row) {
      this.currentVote = this.createVote()
      this.currentVote.id = row.id
      this.currentVote.voteName = row.voteName

      const beginTime = row.beginTime.toString()
      const endTime = row.endTime.toString()

      this.currentVote.date = row.beginTime ? [this.$day(beginTime), this.$day(endTime)] : []
      this.selectSku = row.skuVoteDetailList
      this.showDialog.create = true
      this.showDialog.edit = true
    },
    toDel(row) {
      const index = this.selectSku.findIndex((item) => item.skuId === row.skuId)
      this.selectSku.splice(index, 1)
    },
    async showSelect() {
      this.showDialog.select = true
      this.tableData2 = []
      const res = await this.$http('sku.SkuVote/querySkuInfo', this.selectParams)
      if (!res.errMsg) {
        this.tableData2 = res.obj.skuList
      }
    },
    searchSelect() {
      this.showSelect()
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      }
      this.$store.state.vloading = true
      const res = await this.$http(
          'sku.SkuVote/querySkuVote',
          params
      )
      if (res.errCode === 0) {
        this.tableData = res.obj.skuVoteBeanDataPage.record
        this.tableDataTotal = res.obj.skuVoteBeanDataPage.totalRecordCount
      }
    },
    searchClick() {
      this.page.pageNo = 1
      this.getList()
    },
    selectConfirm() {
      const list=this.selectSku || [];
      // this.selectSku = this.selectSku.concat(this.tableSelection)
      this.tableSelection.forEach(row=>{
       if(this.selectSku.findIndex((item) => item.skuId === row.skuId)<0){
         list.push(row)
       }
      })
      this.selectSku = list;
      this.showDialog.select = false
    },
    async onConfirm() {
      if (!this.currentVote.voteName) {
        this.$msg('请输入投票名称', 'error')
      } else if (!this.currentVote.date) {
        this.$msg('请选择时间', 'error')
      }  else if (this.selectSku.length === 0) {
        this.$msg('请添加菜品', 'error')
      } else {
        const skuInfo = this.selectSku.map((val) => {
          return { skuId: val.skuId, skuName: val.skuName }
        })
        const parmas = {
          id: this.currentVote.id,
          beginTime: this.$day(this.currentVote.date[0]).format('YYYYMMDD'),
          endTime: this.$day(this.currentVote.date[1]).format('YYYYMMDD'),
          voteName: this.currentVote.voteName,
          skuInfo
        }
        const res = await this.$http('sku.SkuVote/addSkuVote', parmas)
        if (!res.errMsg) {
          this.$msg('操作成功', 'success')
          this.showDialog.create = false
          this.showDialog.edit = false
          await this.getList()
        } else {
          this.$msg(res.errMsg, 'error')
        }
      }
    },
    async handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      const params = {
        ...this.genQueryParams(),
        pageNo: 1,
        pageSize: this.tableDataTotal
      }
      const res = await this.$http('sku.SkuVote/querySkuVote', params)
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.skuVoteBeanDataPage.record
      })
    },

    async skuExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `菜品导出(${date})`
      const res = await this.$http('sku.SkuVote/querySkuInfo', this.selectParams)
      exportExcel({
        columns: this.tableCol2,
        filename,
        data: res.obj.skuList
      })
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      if (params.date && params.date.length > 0) {
        const [beginTime, endTime] = transformDaterange(params.date)
        params.beginTime = beginTime.format('YYYYMMDD')
        params.endTime = endTime.format('YYYYMMDD')
      }
      delete params.date
      return params
    }
  }
}
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}

.medium-input {
  width: 250px;
  margin-right: 20px;
}

.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.action-label {
  margin-right: 10px;
}
</style>
