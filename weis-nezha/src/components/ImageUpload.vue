<template>
  <el-upload
    :action="uploadPath"
    list-type="picture-card"
    :data="uploadData"
    :before-upload="beforeUpload"
    :file-list="fileList"
    :on-success="uploadSuccess"
    :limit="limit"
  >
    <template #default>
      <i class="el-icon-plus"></i>
    </template>
    <template #file="{ file }">
      <el-image class="el-upload-list__item-thumbnail" :src="file.url" alt />
      <span class="el-upload-list__item-actions">
        <span class="el-upload-list__item-delete" @click="handleRemove(file)">
          <i class="el-icon-delete"></i>
        </span>
      </span>
    </template>
  </el-upload>
</template>

<script>
// 请用UploadImage
export default {
  props: {
    disable: {
      type: Boolean,
      default: false,
      imageUrl: '',
    },
    fileList: {
      type: Array,
    },
    limit: {
      type: Number,
      default: 10,
    },
    size: {
      type: String,
      default: '',
    },
    lowerSize: {
      type: String,
      default: '',
    },
    uploadData: {
      type: Object,
      default: () => ({}),
    },
    uploadPath: {
      type: String,
      default: '/upload/image',
    },
  },
  data() {
    return {
      imgList: [],
    }
  },
  methods: {
    beforeUpload(file) {
      let isJPG = false
      const { flag } = this.uploadData
      if (
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/gif'
      ) {
        isJPG = true
      }
      const isLt2M = file.size / 1024 / 1024 < 5
      if (!isJPG) {
        this.$message.error('请选择正确的图片!')
      }
      if (!isLt2M) {
        this.$message.error('上传大小不能超过 5MB!')
      }

      // 限制尺寸
      let isSize = true
      let isSquare = true
      if (this.size) {
        isSize = new Promise((resolve, reject) => {
          const size = this.size.split('*')
          const img = new Image()
          const _URL = window.URL || window.webkitURl
          img.onload = function () {
            file.width = img.width //图片宽度
            file.height = img.height //图片高度
            isSize = img.width >= size[0] && img.height >= size[1]
            // 限制图片格式为正方形
            if (flag == 'square') isSquare = img.width === img.height
            if (flag == 'square' && !isSquare) {
              reject('not square')
            } else if (!isSize) {
              reject(size)
            } else {
              resolve()
            }
          }
          img.src = _URL.createObjectURL(file)
        }).then(
          () => {
            return file
          },
          (err) => {
            this.$message.error(`上传图片分辨率不得小于${err[0]}x${err[1]}`)
            if (err == 'not square')
              this.$message.error(`上传图片分辨率不得小于450x450`)
            return Promise.reject()
          }
        )
      }
      return isJPG && isLt2M && isSize
    },
    handleAvatarSuccess(file) {
      this.$emit('before-upload', file)
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    uploadSuccess(res, file) {
      // console.log(file)
      if (this.fileList) {
        this.$emit('update:fileList', [...this.fileList, file])
      }
      this.$emit('upload-success', res.obj.imageUrl)
    },
    handlePictureCardPreview() {},
    handleRemove(file) {
      const index = this.fileList.findIndex(({ url }) => url === file.url)
      if (index !== -1) {
        this.fileList.splice(index, 1)
      }
      this.$emit('delete-success', this.fileList)
    },
  },
}
</script>
