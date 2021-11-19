<template>
  <div class="page-container">
    <div class="query-bar">
      <QueryComponents
        v-model="queryParams"
        :query-list="queryComps"
        :span="4"
        :label-width="70"
        semi
      >
        <template #action>
          <el-button type="primary" @click="searchClick">搜索</el-button>
          <el-button type="primary" @click="Add">新建视频</el-button>
        </template>
      </QueryComponents>
    </div>
    <div>
      <BasePageTable
        ref="table"
        v-model:current-page="page.pageNo"
        v-model:page-size="page.pageSize"
        v-loading="$store.state.vloading"
        :data="tableInfos.data"
        :total="tableInfos.total"
        border
        @current-page-change="queryVideos"
        @size-change="queryVideos"
      >
        <el-table-column
          v-for="col in tableInfos.columns"
          :key="col.prop"
          v-bind="col"
        >
          <template
            #default="{ row }"
            class="action-cell"
            v-if="col.prop === 'video' || col.prop === 'coverImg'"
          >
            <img
              v-if="col.prop === 'coverImg'"
              :src="row.coverImg"
              width="120"
              alt=""
            />
            <video
              v-else
              :src="row.video"
              width="100"
              height="100"
              controls
            ></video>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }" class="action-cell">
            <span
              class="brand-color cursor-pointer action-label"
              @click="editFn(row)"
              >编辑</span
            >
            <span
              class="brand-color cursor-pointer"
              @click="deleteVideo(row.recordId)"
              >删除</span
            >
          </template>
        </el-table-column>
      </BasePageTable>
    </div>
    <ConfirmDialog
      v-model="dialog"
      title="新建视频"
      :close-on-click-modal="false"
      :auto-confirm="false"
      :async-confirm="true"
      @close="closeFn"
      @on-confirm="
        (done) => {
          saveFn(done)
        }
      "
    >
      <el-form
        :model="form"
        ref="ruleForm"
        :rules="uploadRules"
        label-width="80px"
      >
        <el-form-item label="选择板块" prop="plate">
          <BaseSelect
            v-model="form.plate"
            :options="platOptions"
            clearable
            filterable
            @change="handleChange"
          ></BaseSelect>
        </el-form-item>
        <el-form-item label="选择封面" prop="coverImg">
          <ImageUpload
            :upload-data="{ flag: 'master' }"
            :limit="1"
            :fileList="medias.imgs"
            @update:fileList="updateImgs"
            @upload-success="uploadImgSuccess"
          />
        </el-form-item>
        <el-form-item label="上传视频" prop="video">
          <el-upload
            class="upload-demo"
            accept="video/*"
            action="/upload/image"
            :on-remove="handleRemove"
            :on-success="handleVideoSuccess"
            :file-list="medias.video"
            multiple="false"
            limit="1"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">最多可上传1个视频</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="标题" prop="name">
          <el-input class="medium-input" v-model="form.name" />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <NumberInput class="medium-input" v-model="form.sort" />
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { requestFactor } from '@/utils/request'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { defineComponent, reactive, ref, onMounted } from 'vue'
const { request } = requestFactor('discover.DiscoverVideo', true)

export default defineComponent({
  components: {
    ConfirmDialog,
    ImageUpload,
  },
  setup() {
    let dialog = ref(false)
    let tableData = reactive([])
    let tableDataTotal = ref(0)
    const medias = reactive({
      imgs: [],
      video: [],
    })
    const currentTag = reactive({})
    const tableInfos = reactive({
      data: [],
      columns: [
        {
          label: '序号',
          prop: 'sort',
        },
        {
          label: '板块',
          prop: 'plateStr',
        },
        {
          label: '封面',
          prop: 'coverImg',
        },
        {
          label: '主标题',
          prop: 'name',
        },
        {
          label: '视频',
          prop: 'video',
        },
        {
          label: '排序',
          prop: 'sort',
        },
      ],
      total: 0,
    })
    const page = reactive({
      pageNo: 1,
      pageSize: 10,
    })
    const form = reactive({
      plate: '',
      coverImg: '',
      video: '',
      name: '',
      sort: '',
    })
    const ruleForm = ref({})
    const queryParams = reactive({
      activeName: '',
    })
    const queryComps = reactive([
      {
        component: 'el-input',
        key: 'activeName',
        label: '标题',
        placeholder: '请输入标题',
        props: {
          clearable: true,
        },
      },
    ])
    const uploadRules = {
      plate: [{ required: true, message: '请选择版块名称', trigger: 'change' }],
      coverImg: [{ required: true, message: '请选择封面', trigger: 'change' }],
      video: [{ required: true, message: '请上传视频', trigger: 'change' }],
      name: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    }
    // 初始化-获取板块
    let platOptions = ref([])
    async function initialData() {
      platOptions.value = (await request('initialData', {})).data.obj.target
    }
    // 选择模块
    function handleChange(e) {
      form.plate = e
    }
    // 查询列表
    function searchClick() {
      page.pageNo = 1
      queryVideos()
    }
    function queryVideos() {
      request('queryVideos', {
        pageNo: page.pageNo,
        pageSize: page.pageSize,
        name: queryParams.activeName,
      }).thenwrap((err, res) => {
        if (!err) {
          // tableData = tableData.push(...res.record)
          tableInfos.data = res.record
          tableInfos.total = res.totalRecordCount
        }
      })
    }
    function Add() {
      dialog.value = true
    }
    function updateImgs(files) {
      medias.imgs = files
    }
    function uploadImgSuccess(url) {
      form.coverImg = url
    }
    function handleVideoSuccess(res, file) {
      form.video = res.obj.imageUrl
      medias.video = [file]
    }
    function handleRemove() {
      medias.video = []
      form.video = ''
    }
    // 删除视频
    function deleteVideo(id) {
      request('delVideo', {
        recordId: id,
      }).thenwrap((err, res) => {
        if (!err) {
          ElMessage.success('删除成功~')
          queryVideos()
        }
      })
    }
    // 保存或编辑视频
    let _recordId = ''
    function saveFn(done) {
      const params = { ...form }
      if (_recordId) params.recordId = _recordId
      ruleForm.value.validate(async (valid) => {
        if (valid) {
          request('opVideo', params).thenwrap((err, res) => {
            if (!err) {
              closeFn()
              ElMessage.success('保存成功')
              queryVideos()
              dialog.value = false
            } else {
              ElMessage.error(err.errMsg)
            }
          })
        }
        done()
      })
    }
    function closeFn() {
      ruleForm.value.resetFields()
      for (var key in form) {
        delete form[key]
      }
      _recordId = ''
      medias.imgs = []
      medias.video = []
    }
    // 获取待编辑视频原数据
    function editFn(row) {
      medias.imgs.push({
        name: '',
        url: row.coverImg,
      })
      medias.video.push({
        name: '',
        url: row.video,
      })
      Object.assign(form, {
        name: row.name,
        sort: row.sort,
        plate: row.plate,
        video: row.video,
        coverImg: row.coverImg,
      })
      _recordId = row.recordId
      dialog.value = true
    }
    onMounted(() => {
      initialData()
      queryVideos()
    })
    return {
      page,
      form,
      medias,
      ruleForm,
      currentTag,
      dialog,
      tableData,
      tableDataTotal,
      tableInfos,
      platOptions,
      queryParams,
      queryComps,
      uploadRules,
      Add,
      searchClick,
      updateImgs,
      uploadImgSuccess,
      handleVideoSuccess,
      handleRemove,
      handleChange,
      saveFn,
      editFn,
      queryVideos,
      deleteVideo,
      closeFn,
    }
  },
})
</script>

<style lang="less" scoped>
.query-bar {
  display: flex;
  margin: 22px 0 22px 0;
  // float: right;
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
