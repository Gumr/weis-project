<template>
  <div class="page-container">
    <div style="margin: 20px 0">
      <div class="tree-select-wrap display-flex">
        <div class="tree-select-section">
          <div class="tree-box">
            <h4>{{ batchNumber }}批次的卡明细</h4>
            <el-input
              placeholder="输入卡ID"
              style="width: 200px; margin-right: 10px; margin-bottom: 20px"
              v-model="kid"
            ></el-input>
            <el-button type="primary" @click="search">搜索</el-button>
            <div class="label">
              <span
                >共：{{ allotCount.allCount }} ； 已分配：{{
                  allotCount.allotCount
                }}
                ；未分配：{{ allotCount.unAllotCount }} ；不可分配
                {{ allotCount.loseEfficacyCount }}</span
              >
            </div>
            <BasePageTable
              ref="leftTable"
              v-model:selection="tableSelection"
              :height="tableHeight"
              :data="leftTable"
              :visible="false"
              border
            >
              <el-table-column
                v-for="(col, index) in leftCol"
                :key="index"
                v-bind="col"
              ></el-table-column
              >>
            </BasePageTable>
          </div>
        </div>
        <div class="tree-select-control">
          <div class="display-flex">
            <BaseSelect
              filterable
              style="width: 150px; margin-bottom: 20px"
              v-model="channelType"
              :options="channelTypeOptions"
              @change="getChannel"
              placeholder="渠道类型"
            ></BaseSelect>
            <BaseSelect
              filterable
              clearable
              style="width: 150px; margin-bottom: 20px"
              v-model="channelValue"
              :options="channelOptions"
              placeholder="渠道人员"
            ></BaseSelect>
            <BaseSelect
              filterable
              clearable
              style="width: 150px"
              v-model="allotType"
              :options="allotOptions"
              placeholder="分配类型"
            ></BaseSelect>
            <el-button class="btn" @click="transfer">分配</el-button>
          </div>
        </div>
        <div class="tree-select-section">
          <div class="tree-box">
            <h4>分配卡情况</h4>
            <BasePageTable
              ref="rightTable"
              :height="tableHeight2"
              :data="rightTable"
              :visible="false"
              border
            >
              <el-table-column
                v-for="(col, index) in rightCol"
                :key="index"
                v-bind="col"
              ></el-table-column>
              <el-table-column label="操作" align="center">
                <template class="action-cell" v-slot="{ row }">
                  <span
                    class="brand-color cursor-pointer action-label"
                    style="margin-right: 8px"
                    @click="operate(row)"
                    >编辑</span
                  >
                  <span
                    class="brand-color cursor-pointer action-label"
                    @click="remove(row)"
                    >移除</span
                  >
                </template>
              </el-table-column>
            </BasePageTable>
          </div>
        </div>
      </div>
    </div>
    <footer class="inline-center" style="margin-top: 24px">
      <el-button type="primary" :loading="loading" @click="handleConfirm"
        >确认</el-button
      >
      <el-button @click="cancel">取消</el-button>
    </footer>
    <ConfirmDialog
      v-model="hasDialog"
      :title="title"
      :close-on-click-modal="false"
      :auto-confirm="false"
      @on-cancel="onCancel"
      @on-confirm="onConfirm"
    >
      <el-button
        style="float: right; margin-bottom: 20px"
        type="danger"
        @click="editRemove"
        >全部移除</el-button
      >
      <BasePageTable
        height="500"
        :visible="false"
        ref="dialogTable"
        :data="dialogTable"
        border
      >
        <el-table-column
          type="index"
          label="序号"
          width="100"
        ></el-table-column>
        <el-table-column prop="kidStr" label="卡ID"></el-table-column>
        <el-table-column prop="amount" label="卡面额"></el-table-column>
        <el-table-column prop="sttStr" label="状态"></el-table-column>
        <el-table-column label="操作">
          <template class="action-cell" v-slot="{ row }">
            <span
              class="brand-color cursor-pointer action-label"
              @click="removeSingle(row)"
              >移除</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </ConfirmDialog>
  </div>
</template>

<script>
import BasePageTable from '@/components/BasePageTable.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import BaseSelect from '@/components/BaseSelect.vue'
export default {
  components: {
    BasePageTable,
    ConfirmDialog,
    BaseSelect,
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps]
      return list
    },
  },
  data() {
    return {
      hasDialog: false,
      title: '',
      loading: false,
      kid: '',
      batchNumber: '',
      channelId: '',
      removeAll: {}, // 用于编辑时全部移除
      tableSelection: [],
      leftTable: [],
      tableHeight: window.innerHeight - 420,
      tableHeight2: window.innerHeight - 325,
      channelValue: '',
      channelType: '',
      allotType: '',
      allotOptions: [
        { label: '售卖', value: '00' },
        { label: '赠送', value: '01' },
      ],
      channelTypeOptions: [
        { label: '个人/活动', value: '01' },
        // { label: '客户经理', value: '02' },
        { label: '渠道', value: '03' },
      ],
      channelOptions: [],
      allotCount: {
        allCount: 0,
        allotCount: 0,
        unAllotCount: 0,
        loseEfficacyCount: 0,
      },
      dialogTable: [],
      removeArr: [],
      leftCol: [
        { type: 'selection' },
        { label: '序号', type: 'index', width: '80px' },
        { label: '卡ID', prop: 'kidStr' },
        { label: '面额', prop: 'amount' },
        { label: '状态', prop: 'sttStr' },
        { label: '渠道', prop: 'channel' },
      ],
      rightTable: [],
      rightCol: [
        { label: '序号', type: 'index', width: '80px' },
        {
          label: '分配类型',
          prop: 'channelType',
          formatter: (row) =>
            row.channelType == '01'
              ? '个人/活动'
              : row.channelType == '02'
              ? '客户经理'
              : '渠道',
        },
        { label: '渠道名称', prop: 'cname' },
        { label: '负责人姓名', prop: 'principal' },
        { label: '手机', prop: 'phone' },
        { label: '分配数', prop: 'kids', formatter: (row) => row.kids.length },
      ],
      queryComps: {},
    }
  },
  created() {
    this.batchNumber = this.$route.query.batchNumber
    this.getInfo()
  },
  methods: {
    search() {
      this.getInfo()
    },
    async getInfo() {
      const res = await this.$http(
        'card.Allocation/channelAllotByBatchNumber',
        { batchNumber: this.batchNumber, kid: this.kid }
      )
      this.allotCount = res.obj.allotCount
      this.leftTable = res.obj.allotCard
      this.rightTable = res.obj.allotRecord
      this.getChannel()
      this.$nt(() => {
        this.$refs.leftTable.doLayout()
        this.$refs.rightTable.doLayout()
      })
    },
    async getChannel() {
      this.channelValue = ''
      const channel = await this.$http('card.Allocation/getChannel', {
        channelType: this.channelType,
      })
      this.channelOptions = channel.obj.map((item) => {
        return {
          label: `${item.showChannel}`,
          value: item.cid,
          ...item,
        }
      })
    },
    transfer() {
      if (!this.channelValue) {
        this.$msg('请选择渠道', 'error')
        return
      }
      if (!this.tableSelection.length) {
        this.$msg('请选择待分配的卡', 'error')
        return
      }
      if (!this.allotType) {
        this.$msg('请选择分配类型', 'error')
        return
      }
      const kidArr = this.tableSelection
      const index = this.rightTable.findIndex((item) => {
        if (item.cid == this.channelValue && this.allotType == item.allotType)
          return item
      })
      if (index > -1) {
        this.rightTable[index].kids = this.rightTable[index].kids.concat(kidArr)
      } else {
        const item = this.channelOptions.find(
          (item) => item.cid == this.channelValue
        )
        const allotItem = this.allotOptions.find(
          (item) => item.value == this.allotType
        )
        this.rightTable.push({
          ...item,
          ...allotItem,
          allotType: this.allotType,
          channelType: this.channelType,
          kids: kidArr,
        })
      }
      kidArr.forEach((kids) => {
        this.leftTable = this.leftTable.filter((item) => item.kid != kids.kid)
      })
    },
    // 整个移除
    async remove(row) {
      const item = row.kids.filter((item) => item.stt != '02')
      this.leftTable = this.leftTable.concat(item)
      this.leftTable.sort((a, b) => {
        return a.kid - b.kid
      })
      const ritem = row.kids.filter((item) => item.stt == '02')
      const rtalbe = this.rightTable.find((item) => item.cid == row.cid)
      rtalbe.kids = ritem
      this.rightTable = this.rightTable.filter((item) => item.kids.length != 0)
    },
    async removeSingle(row) {
      if (row.stt == '02') {
        this.$msg('该卡已使用，无法移除', 'error')
        return
      }
      this.removeArr.push(row)
      this.dialogTable = this.dialogTable.filter((item) => item.kid != row.kid)
    },
    onCancel() {
      this.removeArr = []
    },
    onConfirm() {
      this.leftTable = this.leftTable.concat(this.removeArr)
      for (const row of this.removeArr) {
        const index = this.rightTable.findIndex((item) => item.cid == row.cid)
        this.rightTable[index].kids = this.dialogTable
        this.rightTable = this.rightTable.filter((item) => item.kids.length)
      }
      this.removeArr = []
      this.hasDialog = false
    },
    async operate(row) {
      this.title = `目前转移到${row.cname}渠道的卡`
      this.removeAll = row
      this.dialogTable = row.kids
      this.hasDialog = true
      this.$nt(() => {
        this.$refs.dialogTable.doLayout()
      })
    },
    editRemove() {
      const item = this.removeAll.kids.kids.filter((item) => item.stt != '02')
      this.leftTable = this.leftTable.concat(item)
      this.leftTable.sort((a, b) => {
        return a.kid - b.kid
      })
      const ritem = this.removeAll.kids.kids.filter((item) => item.stt == '02')
      const rtalbe = this.rightTable.find(
        (item) => item.cid == this.removeAll.kids.cid
      )
      rtalbe.kids = ritem
      this.rightTable = this.rightTable.filter((item) => item.kids.length != 0)
      this.dialogTable = []
    },
    handleConfirm() {
      this.$confirm('确定提交？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      }).then(() => {
        this.confirm()
      })
    },
    async confirm() {
      this.loading = true
      const allotCard = []
      this.rightTable.forEach((item) => {
        const cardId = []
        item.kids.forEach((kids) => {
          cardId.push(kids.kid)
        })
        allotCard.push({
          channeId: item.cid,
          channelType: item.channelType,
          allotType: item.allotType,
          cardId,
        })
      })
      const res = await this.$http('card.Allocation/allot', {
        batchNumber: this.batchNumber,
        allotCard,
      })
      this.loading = false
      if (!res.errMsg) {
        this.$msg('分配成功', 'success')
        this.$router.go(-1)
      } else {
        this.$msg(res.errMsg, 'error')
      }
    },
    cancel() {
      this.$confirm('确定取消？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      }).then(() => {
        console.log('点击确定')
        this.$router.go(-1)
      })
    },
  },
}
</script>

<style lang="less" scoped>
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
