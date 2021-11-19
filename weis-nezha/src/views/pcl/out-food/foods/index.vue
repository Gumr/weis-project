<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :queryList="computedQueryComps"
        :span="4"
        semi
        :action="false"
      >
        <template v-slot:action></template>
      </QueryComponents>
      <el-button type="primary" @click="toCreate()">添加食材</el-button>
    </div>
    <div>
      <BasePageTable
        :data="tableData"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        :total="tableDataTotal"
        @current-page-change="getList"
        @size-change="getList"
        border
      >
        <el-table-column v-for="col in tableCol" :key="col.prop" v-bind="col"></el-table-column>
        <el-table-column label="操作" align="center">
          <template class="action-cell" v-slot="{ row }">
            <span class="brand-color cursor-pointer action-label" @click="toEdit(row)">编辑</span>
            <span class="brand-color cursor-pointer action-label" @click="toDel(row)">删除</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="title"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <div>
        <div class="section-item">
          <span class="section-label label-1">食材图片：</span>
          <ImageUpload
            :upload-data="{ flag: 'case_label' }"
            v-model:file-list="currentTag.tflLargeImageUrl"
            :limit="1"
          />
        </div>
        <div class="section-item">
          <span class="section-label label-1">食材名称：</span>
          <el-input clearable class="medium-input" v-model="currentTag.tflName"></el-input>
        </div>
        <div class="section-item">
          <span class="section-label label-1">规格：</span>
          <span>100g</span>
        </div>
        <div class="section-item">
          <span class="section-label label-1">蛋白质：</span>
          <el-input
            clearable
            class="medium-input"
            v-model="currentTag.tflProtein"
            @blur="checkText('tflProtein')"
          ></el-input>g
        </div>
        <div class="section-item">
          <span class="section-label label-1">脂肪：</span>
          <el-input
            clearable
            class="medium-input"
            v-model="currentTag.tflFat"
            @blur="checkText('tflFat')"
          ></el-input>g
        </div>
        <div class="section-item">
          <span class="section-label label-1">碳水化合物：</span>
          <el-input
            clearable
            class="medium-input"
            v-model="currentTag.tflCarbohydrate"
            @blur="checkText('tflCarbohydrate')"
          ></el-input>g
        </div>
        <div class="section-item">
          <span class="section-label label-1">食材能量：</span>
          <el-input
            clearable
            class="medium-input"
            v-model="currentTag.tflCalory"
            @blur="checkText('tflCalory')"
          ></el-input>Kcal
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import exportExcel from '@/utils/export-excel';
import QueryComponents from '@/components/QueryComponents.vue';
import BasePageTable from '@/components/BasePageTable.vue';
import { transformDaterange } from '@/utils/transform';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ImageUpload from '@/components/ImageUpload.vue';


export default {
  components: {
    QueryComponents,
    BasePageTable,
    ConfirmDialog,
    ImageUpload
  },
  computed: {
    computedQueryComps() {
      const list = [...this.queryComps];
      return list;
    }
  },
  created() {
    this.getList();
  },
  data() {
    return {
      editDialogVisible: false,
      title: '',
      currentTag: {
        tflLargeImageUrl: [],
        tflName: '',
        tflProtein: '',
        tflFat: '',
        tflCarbohydrate: '',
        tflCalory: '',
      },
      tableData: [],
      tableDataTotal: 0,
      tableCol: [
        {
          label: '序号',
          type: 'index',
          width: '80'
        },
        {
          label: '食材ID',
          prop: 'tflId'
        },
        {
          label: '食材名称',
          prop: 'tflName'
        },
        {
          label: '能量（kcal）',
          prop: 'tflCalory'
        },
        {
          label: '碳水（g）',
          prop: 'tflCarbohydrate'
        },
        {
          label: '蛋白质（g）',
          prop: 'tflProtein'
        },
        {
          label: '脂肪（g）',
          prop: 'tflFat'
        },
        {
          label: '创建人',
          prop: 'tflUname'
        },
        {
          label: '发布日期',
          prop: 'tflUtime'
        },
      ],
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {

      },
      queryComps: [

      ],
    };
  },
  methods: {
    checkText(type) {
      this.currentTag[type] = isNaN(this.currentTag[type]) ? '' : this.currentTag[type];
      this.currentTag[type] = this.currentTag[type] == '' ? '' : Number(Math.abs(this.currentTag[type])).toFixed(2);
    },
    async getList() {
      const params = {
        ...this.page,
        ...this.genQueryParams()
      };
      const res = await this.$http('FoodLib/queryFoodLibList', params);
      if (!res.errMsg) {
        this.tableData = res.obj.record;
        this.tableDataTotal = res.obj.totalRecordCount;
      }
    },
    searchClick() {
      this.page.pageNo = 1;
      this.getList();
    },
    async handleExport() {
      const date = this.$day().format('YYYY-MM-DD');
      const filename = `${this.$route.meta.title}-导出(${date})`;
      const params = {
        ...this.genQueryParams(),
        ...this.page,
        pageSize: this.tableDataTotal,
      };
      const res = await this.$http('oodLib/queryFoodLibList', params);
      exportExcel({
        columns: this.tableCol,
        filename,
        data: res.obj.record
      });
    },
    toCreate() {
      this.title = '添加食材';
      this.editDialogVisible = true;
      this.currentTag = {
        tflLargeImageUrl: [],
        tflName: '',
        tflProtein: '',
        tflFat: '',
        tflCarbohydrate: '',
        tflCalory: '',
      };
    },
    toEdit(row) {
      this.currentTag = { ...row };
      this.currentTag.tflLargeImageUrl = [{url: this.currentTag.tflLargeImageUrl}];
      this.editDialogVisible = true;
    },
    async toDel(row) {
      this.$confirm('确定删除？', '提示？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        const res = await this.$http('FoodLib/deleteFoodLib', { tflId: row.tflId });
        if (!res.errMsg) {
          this.$msg('删除成功', 'success');
          this.getList();
        } else {
          this.$msg(res.errMsg, 'error');
        }
      });
    },
    genQueryParams() {
      const params = { ...this.queryParams };
      if (params.date && params.date.length > 0) {
        const [startDate, endDate] = transformDaterange(params.date);
        params.startDate = startDate.format('YYYY-MM-DD');
        params.endDate = endDate.format('YYYY-MM-DD');
      }
      delete params.date;
      return params;
    },
    async tagConfirm(done) {
      if (!this.currentTag.tflLargeImageUrl.length) {
        this.$msg('请上传图片', 'error');
        done();
        return;
      }
      if (!this.currentTag.tflName) {
        this.$msg('请输入食材名称', 'error');
        done();
        return;
      }
      if (!this.currentTag.tflProtein) {
        this.$msg('请输入蛋白质', 'error');
        done();
        return;
      }
      if (!this.currentTag.tflFat) {
        this.$msg('请输入脂肪', 'error');
        done();
        return;
      }
      if (!this.currentTag.tflCarbohydrate) {
        this.$msg('请输入碳水化合物', 'error');
        done();
        return;
      }
      if (!this.currentTag.tflCalory) {
        this.$msg('请输入食材能量', 'error');
        done();
        return;
      }
      const params = this.$deepClone(this.currentTag);
      params.tflLargeImageUrl = params.tflLargeImageUrl[0].response ? params.tflLargeImageUrl[0].response.obj.imageUrl : params.tflLargeImageUrl[0].url;
      const url = params.tflId ? 'FoodLib/editFoodLib' : 'FoodLib/addFoodLib';
      const res = await this.$http(url, params);
      if (!res.errMsg) {
        this.$msg('操作成功', 'success');
        this.editDialogVisible = false;
        this.getList();
        this.$nt(() => {
          setTimeout(done(), 800);
        });
      } else {
        this.$msg(res.errMsg, 'error');
        done();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.action-label {
  margin-right: 10px;
}
.mini-input {
  width: 100px;
  margin-right: 20px;
}
.medium-picker {
  width: 300px;
}
.medium-input {
  width: 450px;
  margin-right: 20px;
}
.max-input {
  width: 350px;
}
.medium-select {
  width: 70px;
  margin-left: 10px;
}
.rule {
  padding-left: 150px;
}
.tiny-input {
  width: 150px;
  margin: 0 20px;
}

.small-input {
  margin-left: 8px;
  width: 120px;
}
.small-select {
  margin-left: 8px;
  width: 200px;
}

.section-label {
  display: inline-block;
}

.section-item {
  margin: 20px 0;
  display: flex;
  align-items: center;
  min-height: 30px;
  flex-wrap: wrap;
  button {
    height: 30px;
    line-height: 5px;
  }
}

.btn-footer {
  text-align: center;
}
.label-1 {
  width: 170px;
  margin-right: 12px;
  text-align: right;
}

.label-2 {
  width: 100px;
}

.label-3,
h3 {
  margin-left: 22px;
}
</style>
