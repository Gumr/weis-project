<template>
  <div class="page-container">
    <div class="action-header" style="margin-top: 20px;">
      <el-button @click="addtype('1')">添加分类</el-button>
    </div>
    <BasePageTable
      ref="table"
      v-loading="$store.state.vloading"
      :height="height"
      :data="tableData"
      :total="tableDataTotal"
      v-model:current-page="page.pageNo"
      v-model:page-size="page.pageSize"
      @current-page-change="getOrderList"
      @size-change="getOrderList"
      border
    >
      <el-table-column label="类目ID" prop="tscId" align="center"></el-table-column>
      <el-table-column label="类目" prop="tscName"></el-table-column>
      <el-table-column label="所属类别" prop="tscParentName"></el-table-column>
      <el-table-column label="排序规则" prop="tscOrder"></el-table-column>
      <el-table-column label="标签状态" prop="tscDataStt">
        <template v-slot="{ row }">
          <el-tag :type="row.tscDataStt === '00' ? 'danger' : ''">{{ formatTdiStatus(row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作人" prop="tscOperator"></el-table-column>
      <el-table-column label="最新操作时间" prop="tscUtime">
        <template v-slot="{ row }">{{ $day(+row.tscUtime).format("YYYY-MM-DD HH:mm:ss") }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template class="action-cell" v-slot="{ row }">
          <span
            class="brand-color cursor-pointer action-label"
            style="margin-right: 8px;"
            @click="addtype(row)"
          >编辑</span>
          <span
            class="brand-color cursor-pointer action-label"
            style="margin-right: 8px;"
            @click="unUse(row)"
          >{{ row.tscDataStt == "01" ? "禁用" : "启用" }}</span>
          <span class="brand-color cursor-pointer" @click="delData(row.tscId)">删除</span>
        </template>
      </el-table-column>
    </BasePageTable>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="datatitle"
      @on-confirm="onconfirm"
      :auto-confirm="false"
      :close-on-click-modal="false"
    >
      <el-form :model="currentDish" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="currentDish.tscName"></el-input>
        </el-form-item>
        <el-form-item label="上级分类">
          <BaseSelect v-model="currentDish.tscParent" :options="dishCategoryOpts" clearable></BaseSelect>
        </el-form-item>
        <el-form-item label="排序规则">
          <el-input
            v-model="currentDish.tscOrder"
            @input="checkOrder"
            @keydown="catchNonIntKeydown"
          ></el-input>
          <span style="color: #909399;">1排最上面，999排最下面；数字越小排序越高</span>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { catchNonIntKeydown } from '@/utils/event-catcher';

const tdiStatusMap = {
  '01': '正常',
  '00': '禁用',
  99: '删除'
};
export default {
  name: 'kitchen_dish-category',
  components: {
    BasePageTable,
    ConfirmDialog
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tcsid: null,
      datatitle: '新增标签',
      tableDataTotal: 0,
      editDialogVisible: false,
      tableData: [],
      currentDish: {
        tscName: '',
        tscId: '',
        tscParent: '',
        tscOrder: ''
      },
      page: {
        pageNo: 1,
        pageSize: 10
      },
      dishCategoryOpts: [
        {
          label: '食物',
          value: '100000'
        },
        {
          label: '营养素',
          value: '100001'
        }
      ]
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    catchNonIntKeydown,
    checkOrder(val) {
      this.currentDish.tscOrder = val.replace(/[^0-9]+/g, '');
    },
    formatTdiStatus(data) {
      return tdiStatusMap[data.tscDataStt];
    },
    addtype(dateList) {
      this.editDialogVisible = true;
      if (dateList.tscId) {
        this.datatitle = '编辑标签';
        this.currentDish = { ...dateList };

        this.tcsid = dateList.tscId;
      } else {
        this.datatitle = '新增标签';
        this.currentDish = {
          tscName: '',
          tscId: '',
          tscOrder: ''
        };
      }
    },
    delData(tscId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
          const res = await this.$http('FoodClassify/deleteClassify', { tscId });
          if (!res.errMsg) {
            this.$msg('删除成功', 'success');
            this.getOrderList();
          } else {
            this.$msg(res.errMsg, 'error');
          }
      })
    },
    unUse(row) {
      let url = '';

      if (row.tscDataStt == '01') {
        url = 'FoodClassify/disabledClassify';
      } else if (row.tscDataStt == '00') {
        url = 'FoodClassify/enableClassify';
      } else {
        return;
      }

      this.$request(url, {
        tscId: row.tscId
      }).then(
        this.$rw((err) => {
          if (!err) {
            this.getOrderList();
          }
        })
      );
    },
    getOrderList() {
      this.$store.state.vloading = true;
      this.$request('FoodClassify/queryAllClassify', {
        ...this.page
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.$store.state.vloading = false;
            this.tableDataTotal = dataPage.totalRecordCount;
            this.tableData = dataPage.record;
          }
        })
      );
    },
    onconfirm() {
      let url = '';

      const datelist = {
        tscName: this.currentDish.tscName,
        tscParent: this.currentDish.tscParent,
        tscOrder: this.currentDish.tscOrder
      };
      if (this.datatitle === '新增标签') {
        url = 'FoodClassify/addClassify';
      } else {
        url = 'FoodClassify/update';
        datelist.tscId = this.tcsid;
      }

      this.$request(url, datelist).then(
        this.$rw((err) => {
          if (!err) {
            this.editDialogVisible = false;
            this.$message({
              tpye: 'success',
              message: '操作成功'
            });
            this.getOrderList();
          }
          this.$errorNotify(err);
        })
      );
    },
    editDishClick() {}
  }
};
</script>

<style>
.action-header {
  text-align: right;
  margin-bottom: 22px;
}

.action-cell {
  display: flex;
  justify-content: space-between;
}
.action-label {
  margin-right: 8px;
}
</style>
