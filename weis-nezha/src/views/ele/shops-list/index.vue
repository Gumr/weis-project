<template>
  <div class="container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :action="false"
        :label-width="60"
        semi
      >
        <template #buttons>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button
            type="primary"
            :loading="$store.state.bloading"
            @click="handleExport"
            >{{ $store.state.bloading ? '导出中' : '导出' }}</el-button
          >
        </template>
      </QueryComponents>
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
        @current-page-change="queryStore"
        @size-change="queryStore"
      >
        <el-table-column
          v-for="col in tableCol"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="维士后台名称及ID" align="center">
          <template #default="{ row }">
            <span
              v-if="!row.tesHpId"
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="relateStore(row)"
              >关联门店</span
            >
            <span
              v-else
              class="brand-color cursor-pointer"
              @click="relateStore(row)"
              >{{ row.tesHpName + '\n(' + row.tesHpId + ')' }}</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <!-- 选择店铺 -->
    <ConfirmDialog
      v-model="storeDialog"
      title=""
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-confirm="confirmGood"
      :comfirmVisible="false"
      :cancelVisible="false"
    >
      <div class="el-select" style="margin-bottom: 20px">
        <span>门店：</span>
        <BaseSelect
          filterable
          v-model="modelValByStore"
          :options="queryOptByStore"
          clearable
          @update:modelValue="filterHpFn"
          placeholder="下拉选择店铺"
        />
      </div>
      <BasePageTable
        height="600"
        empty-text="当前没有店铺"
        :visible="false"
        :data="tableDataByHp"
        border
      >
        <el-table-column
          v-for="col in tableColByHp"
          :key="col.prop"
          v-bind="col"
        ></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span
              v-if="!row.hpId"
              class="brand-color cursor-pointer"
              style="margin-right: 8px"
              @click="sureRelateStore(row)"
              >选择</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
import QueryComponents from '@/components/QueryComponents.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ButtonTabs from '@/components/ButtonTabs.vue'
import exportExcel from '@/utils/export-excel'

export default {
  components: {
    QueryComponents,
    BasePageTable,
    BaseSelect,
    ConfirmDialog,
    ButtonTabs,
  },
  // 定义属性
  data() {
    return {
      storeDialog: false,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      height: window.innerHeight - 330,
      // 饿了么门店数据
      tableDataTotal: 0,
      tableData: [],
      tableCol: [
        {
          label: '门店ID（饿了么）',
          prop: 'tesShopId',
        },
        {
          label: '门店名称',
          prop: 'tesShopName',
        },
        {
          label: '门店地址',
          prop: 'tesShopAddr',
        },
        {
          label: '门店电话',
          prop: 'tesShopPhone',
        },
        {
          label: '营业时间',
          prop: 'tesServingTime',
          // formatter: (row) => row.quality + row.unit,
        },
        {
          label: '营业状态',
          prop: 'tesShopStatus',
          formatter: (row) => (row.tesShopStatus == 1 ? '营业中' : '休息中'),
        },
      ],

      tableDataByHp: [],
      tableColByHp: [
        {
          label: '供餐点编码',
          prop: 'thpId',
        },
        {
          label: '供餐点名称',
          prop: 'thpName',
        },
        {
          label: '供餐点地址',
          prop: 'thpShopAddress',
        },
      ],
      queryParams: {
        storeName: '',
      },
      queryComps: [
        {
          component: 'BaseSelect',
          key: 'tesShopName',
          label: '门店名称',
          props: {
            filterable: true,
            clearable: true,
            options: [],
          },
        },
        {
          slot: 'buttons',
        },
      ],
      modelValByStore: '',
      queryOptByStore: [],
    }
  },
  // 计算属性，会监听依赖属性值随之变化
  computed: {},
  // 监控data中的数据变化
  watch: {},
  // 方法集合
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  // 生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.reqAllStores().then(
      this.$rw((err, res) => {
        let storeNames = []
        storeNames = res.result.map((item) => {
          return {
            label: item.tesShopName,
            value: item.tesShopName,
          }
        })
        this.queryComps[0].props.options = storeNames
      })
    )
  },
  methods: {
    sureRelateStore(row) {
      this.$request(
        '/cn.nezha.api.eleme.Store/updateStore',
        {
          hpId: row.thpId,
          id: this._id,
        },
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$message.success('关联成功')
            this.queryStore()
          } else {
            this.$message.warning('出错了~')
          }
          this.storeDialog = false
        })
      )
    },
    relateStore(row) {
      this._id = row ? row.tesId : null
      this.queryWeisHeatpoints()
      this.storeDialog = true
    },
    // 查询饿了么门店
    queryStore() {
      this.$store.state.vloading = true
      this.$request(
        '/cn.nezha.api.eleme.Store/queryStores',
        {
          ...this.page,
          ...this.genQueryParams(),
        },
        true
      ).then(
        this.$rw((err, res) => {
          this.$store.state.vloading = false
          if (!err) {
            // let storeNames = []
            this.tableData = res.result
            this.tableDataTotal = res.totalRecord
            // storeNames = this.tableData.map((item) => {
            //   return {
            //     label: item.tesShopName,
            //     value: item.tesShopName,
            //   }
            // })
            // this.queryComps[0].props.options = storeNames
          }
        })
      )
    },
    // 查询维士加热点
    queryWeisHeatpoints() {
      this.$request(
        '/cn.nezha.api.meituan.Store/queryWeisHeatpoints',
        {},
        true
      ).then(
        this.$rw((err, res) => {
          if (!err) {
            let optByStore = []
            this._allHp = this.tableDataByHp = res.result
            optByStore = res.result.map((item) => {
              return {
                label: item.thpName,
                value: item.thpId,
              }
            })
            this.queryOptByStore = optByStore
          }
        })
      )
    },
    searchClick() {
      this.page.pageNo = 1
      this.queryStore()
    },
    filterHpFn(e) {
      this.tableDataByHp = e
        ? this._allHp.filter((item) => item.thpId === e)
        : this._allHp
    },
    genQueryParams() {
      const params = { ...this.queryParams }
      params.storeName = params.tesShopName
      delete params.tesShopName
      return params
    },
    // 导出
    handleExport() {
      this.$store.state.bloading = true
      const date = this.$day().format('YYYY-MM-DD')
      const filename = `${this.$route.meta.title}-导出(${date})`
      this.reqAllStores().then(
        this.$rw((err, res) => {
          this.$store.state.bloading = false
          exportExcel({
            columns: this.tableCol,
            filename,
            data: res.result,
          })
        })
      )
    },
    reqAllStores() {
      return this.$request(
        '/cn.nezha.api.eleme.Store/queryStores',
        {
          // pageNo: 1,
          // pageSize: this.tableDataTotal,
        },
        true
      )
    },
  },
  beforeCreate() {}, // 生命周期 - 创建之前
  beforeMount() {}, // 生命周期 - 挂载之前
  beforeUpdate() {}, // 生命周期 - 更新之前
  updated() {}, // 生命周期 - 更新之后
  beforeDestroy() {}, // 生命周期 - 销毁之前
  destroyed() {}, // 生命周期 - 销毁完成
  activated() {}, // 如果页面有keep-alive缓存功能，这个函数会触发
}
</script>

<style lang='less' scoped>
.container {
  padding: 0 30px;
}
</style>