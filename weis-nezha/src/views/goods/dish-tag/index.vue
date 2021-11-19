<template>
  <div class="page-container">
    <div class="action-header">
      <el-button type="primary" @click="addTagClick">添加标签</el-button>
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
        @current-page-change="getAllFoodLabel"
        @size-change="getAllFoodLabel"
      >
        <el-table-column label="标签ID" prop="tdiId"></el-table-column>
        <el-table-column label="标签名称" prop="tdiName"></el-table-column>
        <el-table-column label="标签图片">
          <template #default="{ row }" class="action-cell">
            <el-image
              v-if="row.tdiImg"
              style="width: 100px; height: 100px"
              :src="row.tdiImg"
              :preview-src-list="[row.tdiImg]"
              class="food-cover"
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column label="标签分类" prop="tdiType">
          <template #default="{ row }">{{ formatTdiType(row) }}</template>
        </el-table-column>
        <el-table-column label="标签状态" prop="tdiDataStt">
          <template #default="{ row }">
            <el-tag :type="row.tdiDataStt === '00' ? 'danger' : ''">{{
              formatTdiStatus(row)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="tdiOperator"></el-table-column>
        <el-table-column label="最新操作时间" prop="tdiUtime">
          <template #default="{ row }">{{
            $day(+row.tdiUtime).format('YYYY-MM-DD HH:mm:ss')
          }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span
              class="brand-color cursor-pointer action-label"
              @click="editTagClick(row)"
              >编辑</span
            >
            <span
              class="brand-color cursor-pointer action-label"
              @click="lockdata(row)"
              >{{ row.tdiDataStt == '01' ? '禁用' : '启用' }}</span
            >
            <span
              class="brand-color cursor-pointer"
              @click="deleteTagClick(row.tdiId)"
              >删除</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="editDialogVisible"
      :title="editMode === 'add' ? '新增标签' : '编辑标签'"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @on-confirm="tagConfirm"
    >
      <el-form :model="currentTag" label-width="80px">
        <el-form-item label="标签图片">
          <ImageUpload
            v-model:file-list="currentTag.tdiImg"
            :upload-data="{ flag: 'diet-tag' }"
            :limit="1"
          />
        </el-form-item>
        <el-form-item label="*标签名称">
          <el-input v-model="currentTag.tdiName"></el-input>
        </el-form-item>
        <el-form-item label="*标签分类">
          <BaseSelect
            v-model="currentTag.tdiType"
            :options="tagCategoryOpts"
            clearable
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="标签描述">
          <el-input
            v-model="currentTag.tdiDesc"
            type="textarea"
            rows="4"
          ></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import BasePageTable from '@/components/BasePageTable.vue'
import { optionsToMap } from '@/utils/data-map'
import ImageUpload from '@/components/ImageUpload.vue'
import { defineComponent } from 'vue'
// const tdiTypeMap = {
//   '01': '偏好/主成分',
//   '02': '过敏源',
//   '03': '营养素',
//   '04': '自定义',
//   '05': 'GI值',
//   '06': '氮源',
//   '07': '纤维',
//   '08': '嘌呤',
//   '09': '矿物质',
//   '10': '维生素',
//   '11': '活性物质'
// };

const tdiStatusMap = {
  '01': '正常',
  '00': '禁用',
  99: '删除',
}

export default defineComponent({
  name: 'goods_dish-tag',
  components: {
    BasePageTable,
    ConfirmDialog,
    ImageUpload,
  },
  data() {
    return {
      height: window.innerHeight - 270,
      editDialogVisible: false,
      editMode: '',
      tableData: [],
      tableDataTotal: 0,
      currentTag: {
        tdiName: '',
        tdiType: '',
        tdiDesc: '',
        tdiImg: [],
      },
      tdiTypeMap: {},
      tagCategoryOpts: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
    }
  },
  created() {
    this.getAllFoodLabel()
  },
  methods: {
    formatTdiType(data) {
      return this.tdiTypeMap[data.tdiType]
    },
    formatTdiStatus(data) {
      return tdiStatusMap[data.tdiDataStt]
    },
    addTag() {
      const params = this.$deepClone(this.currentTag)
      if (params.tdiImg.length) {
        params.tdiImg = params.tdiImg[0].response
          ? params.tdiImg[0].response.obj.imageUrl
          : params.tdiImg[0].url
      } else {
        params.tdiImg = ''
      }
      return this.$request('FoodLabel/addLabel', params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({
              type: 'success',
              message: '添加成功',
            })
          }
        })
      )
    },
    updateTag() {
      const params = this.$deepClone(this.currentTag)
      if (params.tdiImg.length) {
        params.tdiImg = params.tdiImg[0].response
          ? params.tdiImg[0].response.obj.imageUrl
          : params.tdiImg[0].url
      } else {
        params.tdiImg = ''
      }
      return this.$request('FoodLabel/update', params).then(
        this.$rw((err) => {
          if (!err) {
            this.$message({
              type: 'success',
              message: '修改成功',
            })
          }
        })
      )
    },
    lockdata(row) {
      let url = ''
      if (row.tdiDataStt == '01') {
        url = 'FoodLabel/disabledLabel'
      } else if (row.tdiDataStt == '00') {
        url = 'FoodLabel/enableLabel'
      } else {
        return
      }

      this.$request(url, { tdiId: row.tdiId }).then(
        this.$rw((err) => {
          if (!err) {
            this.getAllFoodLabel()
          }
        })
      )
    },
    tagConfirm(done) {
      if (
        this.currentTag.tdiName.length <= 0 ||
        this.currentTag.tdiType.length <= 0
      ) {
        this.$message({
          type: 'warning',
          message: '请输入完整标签',
        })
        done()
        return
      }

      const method = this.editMode === 'add' ? this.addTag : this.updateTag

      method().then(() => {
        this.editDialogVisible = false
        this.$nt(() => {
          setTimeout(done, 300)
        })
        if (this.editMode === 'add') {
          this.page.pageNo = 1
        }
        this.getAllFoodLabel()
      })
    },
    getAllFoodLabel() {
      this.$store.state.vloading = true
      this.$request('FoodLabel/queryAllLabel', this.page).then(
        this.$rw((err, { dataPage, labelType }) => {
          if (!err) {
            this.$store.state.vloading = false
            this.tableData = dataPage.record
            this.tableDataTotal = dataPage.totalRecordCount
            this.tagCategoryOpts = labelType
            this.tableData.forEach((item) => {
              if (!item.tdiImg || item.tdiImg == '[]') {
                item.tdiImg = null
              }
            })
            this.tdiTypeMap = optionsToMap(labelType)
            setTimeout(() => {
              this.$refs.table.doLayout()
            }, 500)
          }
        })
      )
    },
    addTagClick() {
      this.editMode = 'add'
      this.currentTag = {
        tdiName: '',
        tdiType: '',
        tdiDesc: '',
        tdiImg: [],
      }
      this.editDialogVisible = true
    },
    editTagClick(row) {
      this.editMode = 'edit'
      this.currentTag = { ...row }
      this.currentTag.tdiImg = row.tdiImg ? [{ url: row.tdiImg }] : []
      this.editDialogVisible = true
    },
    deleteTagClick(id) {
      this.$confirm('此操作将删除该标签, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.deleteTag(id)
          .then(() => {
            this.getAllFoodLabel()
          })
          .catch(() => {})
      })
    },
    deleteTag(id) {
      return this.$request('FoodLabel/deleteLabel', {
        tdiId: id,
      }).then(
        this.$rw((err, res) => {
          if (!err) {
            this.$message({
              type: 'success',
              message: '删除标签成功',
            })
            return res
          }
          return Promise.reject(err)
        })
      )
    },
  },
})
</script>

<style>
.action-header {
  text-align: right;
  margin: 20px 0;
}

.action-label {
  margin-right: 8px;
}

.action-cell {
  display: flex;
  justify-content: space-between;
}
</style>
