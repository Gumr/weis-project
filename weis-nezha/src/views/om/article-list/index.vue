<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents v-model="queryParams" :queryList="computedQueryComps" :span="5" semi>
        <template v-slot:action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
        </template>
      </QueryComponents>
      <el-button type="primary" @click="addtype('1')">新建内容</el-button>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-loading="$store.state.vloading"
        :height="height"
        :data="tableData"
        :total="tableDataTotal"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        @current-page-change="getPlanList"
        @size-change="getPlanList"
        border
      >
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="内容ID" prop="tdaId"></el-table-column>
        <el-table-column label="内容标题" prop="tdaTitle"></el-table-column>
        <el-table-column label="内容封面">
          <template class="action-cell" v-slot="{ row }">
            <el-image :src="row.tdaImgUrl" :preview-src-list="[row.tdaImgUrl]" class="food-cover" />
          </template>
        </el-table-column>
        <el-table-column label="内容链接" prop="tdaContentUrl"></el-table-column>
        <el-table-column label="最后操作人" prop="tdaUpdatorName"></el-table-column>
        <el-table-column label="最后操作时间" prop="tdaUtime"></el-table-column>
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
              @click="del(row)"
            >删除</span>
            <span class="brand-color cursor-pointer action-label" @click="toDetail(row)">详情</span>
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="datatitle"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="onconfirm"
    >
      <el-form :model="currentTag" label-width="130px">
        <el-form-item label="内容标题">
          <el-input class="small-input" maxlength="20" v-model="currentTag.tdaTitle"></el-input>
        </el-form-item>
        <el-form-item label="内容封面" label-width="130px">
          <ImageUpload
            style="margin-left: 10px"
            :upload-data="{ flag: 'case_label' }"
            v-model:file-list="currentTag.tdaImgUrl"
            :limit="1"
          />
          <span style="margin-left: 10px;font-size: 14px;color:#999999">图片尺寸 690 X 218</span>
        </el-form-item>
        <el-form-item label="内容链接" label-width="130px">
          <el-input class="small-input" v-model="currentTag.tdaContentUrl"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
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
    this.getPlanList();
  },
  data() {
    return {
      height: window.innerHeight - 280,
      tdaId: '',
      currentTag: {
        tdaTitle: '',
        tdaContentUrl: '',
        tdaImgUrl: [],
      },
      datatitle: '新增标签',
      editDialogVisible: false,
      tableData: [],
      tableDataTotal: 0,
      page: {
        pageNo: 1,
        pageSize: 10
      },
      queryParams: {
        title: '',
      },
      queryComps: [
        {
          component: 'el-input',
          key: 'title',
          maxlength: '30',
          label: '标题名称',
          placeholder: '请输入标题名称',
          props: {
            clearable: true
          }
        }
      ],
      isEnter: false,
    };
  },
  methods: {
    searchClick() {
      this.page.pageNo = 1;
      this.getPlanList();
    },
    getPlanList() {
      this.$request('article.DietArticle/queryArticleList', {
        ...this.page,
        ...this.genQueryParams()
      }).then(
        this.$rw((err, { dataPage }) => {
          if (!err) {
            this.tableData = dataPage.record;
            this.tableDataTotal = dataPage.totalRecordCount;
            setTimeout(() => {
              this.$refs.table.doLayout();
            }, 500);
          }
        })
      );
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
    addtype(dateList) {
      if (dateList.tdaId) {
        this.datatitle = '编辑内容';
        this.currentTag = { ...dateList };
        this.currentTag.tdaImgUrl = [{ url: this.currentTag.tdaImgUrl }];
        this.tdaId = dateList.tdaId;
      } else {
        this.datatitle = '新建内容';
        this.currentTag = {
          tdaTitle: '',
          tdaContentUrl: '',
          tdaImgUrl: [],
        };
      }
      this.editDialogVisible = true;
    },
    del(row) {
      this.$confirm('确认删除吗?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('点击确定');
        this.$request('article.DietArticle/deleteArticle', {tdaId: row.tdaId}).then(
          this.$rw((err) => {
            if (!err) {
              this.$message({ type: 'success', message: '删除成功', });
              this.getPlanList();
            } else {
              this.$message({ type: 'error', message: err.errMsg });
            }
          })
        );
      }).catch(() => {
        console.log('点击取消');
      });
    },
    toDetail(row) {
      window.open(row.tdaContentUrl);
    },
    onconfirm(done) {
      const params = this.$deepClone(this.currentTag);
      if (!params.tdaImgUrl[0]) {
        this.$message('请上传图片！');
        done();
        return;
      }
      params.tdaImgUrl = params.tdaImgUrl[0].response ? params.tdaImgUrl[0].response.obj.imageUrl : params.tdaImgUrl[0].url;
      const index = params.tdaImgUrl.lastIndexOf('.');
      const ext = params.tdaImgUrl.substr(index + 1);
      if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
        this.$message('图片格式错误！');
        done();
        return;
      }
      let url = '';
      if (params.tdaTitle === '' || params.tdaContentUrl === '') {
        this.$message({
          type: 'error',
          message: '参数不能为空!'
        });
        done();
        return;
      }
      url = 'article.DietArticle/updateArticle';
      let message = '添加成功';
      if (this.datatitle !== '新增标签') {
        params.tdaId = this.tdaId;
        message = '修改成功';
      }
      this.$request(url, params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({ type: 'success', message, });
            this.editDialogVisible = false;
            this.getPlanList();
            this.$nt(() => {
              setTimeout(done,300)
            });
          } else {
            this.$message({ type: 'error', message: err.errMsg });
            done();
          }
        })
      );
    }
  }
};
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
}
.small-input {
  margin: 0 8px;
  width: 300px;
}
.food-cover {
  max-height: 100%;
  max-width: 100%;
}
</style>
