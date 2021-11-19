import type { ElFormItemContext } from 'element-plus/packages/form'
import { ElMessage } from 'element-plus'
import {
  defineComponent, ref, computed, PropType, inject, nextTick
} from 'vue'
import styles from './UploadImage.module.less'
export default defineComponent({
  name: 'UploadImage',
  inheritAttrs: false,
  props: {
    modelValue: {
      default: '',
      type: [Array, String] as PropType<string[] | string>
    },
    type: {
      type: String,
      default: 'image',
      validator: (t: string) => ['image', 'list'].indexOf(t) !== -1
    },
    reupload: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 1
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, ctx) {
    const loading = ref(false)
    const elFormItem = inject('elFormItem', {} as ElFormItemContext)
    const upload = ref({})
    let reupload: number | null

    let id = 1
    const fileList = computed(() => {

      const { modelValue } = props
      // eslint-disable-next-line
      const images = Array.isArray(props.modelValue)
        ? modelValue
        : (modelValue ? [modelValue] : [])

      return (images as string[]).map(url => ({
        // eslint-disable-next-line
        name: `${id++}.png`,
        url
      }))
    })

    function updateValueAndEmitFormEvent(value: string | string[]) {
      ctx.emit('update:modelValue', value)
      nextTick(() => elFormItem.formItemMitt?.emit('el.form.change', value))
    }


    function uploadSuccess(res: any) {

      loading.value = false
      const { imageUrl } = res.obj
      switch (props.type) {
        case 'image':
          ctx.emit('change', { type: 'update', index: 0, value: imageUrl })
          updateValueAndEmitFormEvent(imageUrl)
          break
        case 'list':

          const images = reupload !== null
            ? [...props.modelValue.slice(0, reupload), imageUrl, ...props.modelValue.slice(reupload + 1)]
            : props.modelValue.concat(imageUrl)
          if (images.length > props.limit) break

          if (reupload && reupload >= 0) {
            ctx.emit('change', { type: 'update', index: reupload, value: imageUrl })
          } else {
            ctx.emit('change', { type: 'add', index: props.modelValue.length, value: imageUrl })
          }
          updateValueAndEmitFormEvent(images)
          break
      }
      reupload = null
    }
    function handleReupload(index: number) {
      reupload = index
      upload.value.uploadRef.$refs.inputRef.click()
    }
    function handleRemove(file: any) {
      const index = fileList.value.findIndex(({ name }) => name === file.name)

      if (index !== -1) {
        const { modelValue } = props
        ctx.emit('change', { type: 'delete', index })
        switch (props.type) {
          case 'image':
            updateValueAndEmitFormEvent('')
            break
          case 'list':
            const list = [...modelValue.slice(0, index), ...modelValue.slice(index + 1)]
            updateValueAndEmitFormEvent(list)
            break
        }
      }
    }

    function uploadError() {
      reupload = null
      loading.value = false
      ElMessage.error('上传图片失败')
    }

    const slots = {
      default: () => <i class="el-icon-plus"></i>
    }
    // console.log(ctx.slots, 'reuplaod')
    return () => (
      <div>
        <transition-group tag="ul" class="el-upload-list el-upload-list--picture-card" name="el-list">
          {
            fileList.value.map((file, index) => (
              <li class={styles.list_item_box} key={index}>
                <div class={`el-upload-list__item ${styles.list_item}`}>
                  <img class="el-upload-list__item-thumbnail" src={file.url} />
                  <span class="el-upload-list__item-actions">
                    {
                      props.reupload
                        ? <span
                          onClick={() => handleReupload(index)}
                          class="el-upload-list__item-delete"
                        >
                          <i class="el-icon-refresh-right" ></i>
                        </span>
                        : null
                    }
                    <span
                      onClick={() => handleRemove(file)}
                      class="el-upload-list__item-delete"
                    >
                      <i class="el-icon-delete" ></i>
                    </span>
                  </span>
                </div>
                {ctx.slots.footer ? <div class="inline-block">{ctx.slots.footer({ index })}</div> : null}
              </li>
            ))
          }
          <li class="el-upload-list__item" v-loading={loading.value} v-show={loading.value}></li>
        </transition-group>
        <el-upload
          {...ctx.attrs}
          style="display: inline-block;"
          ref={upload}
          v-show={fileList.value.length < props.limit}
          show-file-list={false}
          limit={props.limit}
          accpet="image/*"
          v-slots={slots}
          file-list={fileList.value}
          action="/upload/image"
          list-type="picture-card"
          onError={uploadError}
          onSuccess={uploadSuccess}
          before-upload={() => {
            loading.value = true
            return true
          }}>
        </el-upload>
      </div >
    )
  }
})
