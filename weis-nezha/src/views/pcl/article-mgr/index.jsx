import {
    defineComponent, reactive, inject, ref, computed, nextTick
} from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import req, { requestFactor } from '@/utils/request'
import UploadImage from '@/components/UploadImage'
import { ElMessage } from 'element-plus'
import { cloneDeep } from '@/utils/common'
import exportExcel from '@/utils/export-excel'

const { http, request } = requestFactor('discover.ArticleVideo', true)

export default defineComponent({
    name: 'pcl_article-mgr',
    setup() {
        const FormRef = ref(null)
        const EditFormRef = ref(null)
        const loading = inject('vloading')
        const initForm = {
            recordId: '', // 内容ID 有则更新，无则新增
            mainTitle: '', // 主标题
            subTitle: '', // 副标题
            coverImg: '', // 封面
            videoUrl: '', // 视频
            sort: '', // 排序
            externalLink: '', // 链接
            contentType: '',
            plate: '',
            contentTypeStr: '',
            plateStr: ''
        }
        const form = reactive(cloneDeep(initForm))
        const page = reactive({
            pageNo: 1,
            pageSize: 20
        })
        const dialogVisible = reactive({
            create: false,
            edit: false,
            detail: false
        })

        const data = reactive({
            list: [],
            total: 0
        })

        const options = reactive({
            target: [],
            catalogue: [{
                label: '营养与膳食',
                value: '100001'
            }, {
                label: '营养与疾病',
                value: '100002'
            }, {
                label: '营养与生活',
                value: '100003'
            }, {
                label: '营养课堂',
                value: '05'
            }, {
                label: '维士星故事',
                value: '06'
            }
            ],
            status: [
                {
                    label: '上线',
                    value: '01'
                },
                {
                    label: '下线',
                    value: '00'
                }
            ],
            category: [
                {
                    label: '文章',
                    value: '10'
                },
                {
                    label: '视频',
                    value: '20'
                }
            ]
        })

        const tableColumns = [
            {
                width: '60px',
                align: 'center',
                type: 'index',
                label: '序号'
            },
            {
                label: '板块',
                prop: 'plateStr'
            },
            {
                label: '封面',
                prop: 'coverImg',
                slots: {
                    default: ({ row }) => <el-image src={row.coverImg} preview-src-list={[row.coverImg]}/>
                }
            },
            {
                label: '主标题',
                prop: 'mainTitle'
            },
            {
                label: '副标题',
                prop: 'subTitle'
            },
            {
                label: '内容类型',
                prop: 'contentTypeStr'
                // formatter(row) {
                //     let str = ''
                //     if (row.contentType) {
                //         const curr = options.category.find(cg => cg.value == row.contentType)
                //         str = `${curr.label}`
                //     }
                //     row.contentTypeStr = str
                //     return row.contentTypeStr
                // }
            },
            {
                width: '170',
                label: '内容',
                align: 'center',
                prop: 'contentType',
                formatter(row) {
                    return row.contentType === '10' ? row.externalLink : row.videoUrl
                },
                slots: {
                    default: ({ row }) => row.contentType === '10' ? <el-label>{row.externalLink}</el-label>
                        : <video
                            width="150"
                            height="200"
                            src={row.videoUrl} controls/>
                }
            },
            // {
            //   label: '外链地址',
            //   prop: 'subTitle'
            // },

            {
                label: '排序',
                prop: 'sort'
            },
            {
                label: '状态',
                prop: 'sttStr'
            },
            {
                label: '最后编辑时间',
                prop: 'utime'
            },
            {
                label: '编辑人',
                prop: 'operator'
            }
        ]

        const formRules = computed(() => (
            {
                mainTitle: {
                    type: 'string', message: '请输入主标题', required: true, trigger: 'blur'
                },
                subTitle: {
                    type: 'string', message: '请输入副标题', required: true, trigger: 'blur'
                },
                coverImg: {
                    type: 'string', message: '请选择图片作为封面', required: true, trigger: 'change'
                },
                plate: {
                    type: 'string', message: '请选择目标板块', required: true, trigger: 'change'
                },
                externalLink: {
                    type: 'string', message: '请输入链接', required: form.contentType === '10' ? true : false, trigger: 'blur'
                },
                sort: {
                    type: 'string', message: '请输入排序', required: true, trigger: 'blur'
                },
                contentType: {
                    type: 'string', message: '请选择内容类型', required: true, trigger: 'change'
                },
                videoUrl: {
                    type: 'string', message: '请选择视频', required: form.contentType === '10' ? false : true, trigger: 'change'
                }
            }
        ))

        const queryValue = reactive({
            mainTitle: '',
            subTitle: '',
            stt: '',
            plate: ''
        })

        const queryList = computed(() => ([
            {
                component: 'el-input',
                label: '主标题',
                key: 'mainTitle',
                placeholder: '请输入主标题',
                props: {
                    clearable: true
                }
            },
            {
                component: 'el-input',
                label: '副标题',
                key: 'subTitle',
                placeholder: '请输入副标题',
                props: {
                    clearable: true
                }
            },
            {
                component: 'BaseSelect',
                label: '板块',
                key: 'plate',
                props: {
                    clearable: true,
                    options: filterCatalogue()
                }
            },
            {
                component: 'BaseSelect',
                label: '状态',
                key: 'stt',
                props: {
                    clearable: true,
                    options: options.status
                }
            },
            {
                slot: 'actions'
            },
            {
                slot: 'create'
            }
        ]))

        const uploadValue = reactive({
            videoFlag: false,
            uploadPercent: 0,
            video: []
        })

        function filterCatalogue() {
            return options.catalogue.filter(item => item.value != '100001' && item.value != '100002' && item.value != '100003')
        }

        function createClick() {
            Object.assign(form, cloneDeep(initForm))
            dialogVisible.create = true
            nextTick(() => {
                FormRef.value.resetFields()
            })
        }

        function editClick(row) {
            dialogVisible.edit = true
            nextTick(() => {
                EditFormRef.value.resetFields()
                Object.keys(form).forEach((key) => {
                    form[key] = row[key]
                })
            })
        }

        function detailClick(row) {
            Object.keys(form).forEach((key) => {
                form[key] = row[key]
            })
            dialogVisible.detail = true
        }

        function exportClick() {
            http('queryArticleVideo', { pageNo: 1, pageSize: data.total, ...queryValue })
                .thenwrap((err, res) => {
                    if (!err) {
                        exportExcel({
                            data: res.record,
                            columns: tableColumns
                        })
                    }
                })
        }

        function getList() {
            http('queryArticleVideo', { ...page, ...queryValue })
                .thenwrap((err, res) => {
                    if (!err) {
                        data.list = res.record
                        data.total = res.totalRecordCount
                    }
                })
        }

        const querySlots = {
            actions: () => (
                <>
                    <el-button type="primary" onClick={getList} type="warning">搜索</el-button>
                    <el-button type="primary" onClick={exportClick}>导出</el-button>
                </>
            ),
            create: () => (
                <div style="text-align: right;">
                    <el-button type="primary" onClick={createClick}>新建文章</el-button>
                </div>
            )
        }

        function updateDiscoverContent() {
            const params = {
                contentType: form.contentType,
                recordId: form.recordId,
                tdcId: form.recordId,
                tdcHeadline: form.mainTitle,
                tdcSubheading: form.subTitle,
                tdcImgUrl: form.coverImg,
                tdcLink: form.contentType === '10' ? form.externalLink : '',
                tdcTarget: form.plate,

                subTitle: form.subTitle,
                video: form.contentType === '10' ? '' : form.videoUrl,
                plate: form.plate,
                coverImg: form.coverImg,
                name: form.mainTitle,
                tdcSort: form.sort,
                sort: form.sort
            }

            return request('opArticleVideo', params)
        }

        function handleDialogConfirm() {
            FormRef.value.validate((valid) => {
                if (valid) {
                    updateDiscoverContent().thenwrap((err) => {
                        if (!err) {
                            ElMessage.success('新建成功')
                            getList()
                            dialogVisible.create = false
                        } else {
                            ElMessage.error(err.errMsg)
                        }
                    })
                }
            })
        }

        function handleEditDialogConfirm() {
            EditFormRef.value.validate((valid) => {
                if (valid) {
                    updateDiscoverContent().thenwrap((err) => {
                        if (!err) {
                            ElMessage.success('编辑成功')
                            getList()
                            dialogVisible.edit = false
                        } else {
                            ElMessage.error(err.errMsg)
                        }
                    })
                }
            })
        }

        function updateDiscoverContentState(id, type, contentType) {
            request('updateArticleVideoStt', {
                recordId: id,
                stt: type,
                contentType: contentType
            }).thenwrap((err) => {
                if (!err) {
                    ElMessage.success('修改成功')
                    getList()
                } else {
                    ElMessage.error(err.errMsg)
                }
            })
        }

        function handleRemove() {
            uploadValue.video = []
            form.videoUrl = ''
        }

        function uploadError() {
            // reupload = null
            // loading.value = false
            uploadValue.videoFlag = false
            ElMessage.error('上传视频失败')
        }

        function uploadSuccess(res, file) {
            form.videoUrl = res.obj.imageUrl
            uploadValue.video = [file]
            uploadValue.videoFlag = false
            ElMessage.success('上传视频成功')
        }

        const Form = props => (
            <>
                <el-form-item label="选择板块" prop="plate">
                    <el-radio-group v-model={form.plate}>
                        {
                            filterCatalogue().map(it => <el-radio label={it.value}>{it.label}</el-radio>)
                        }
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="封面" prop="coverImg">
                    <UploadImage v-model={form.coverImg} limit={1}/>
                    <span>推荐：690*386</span>
                </el-form-item>
                <el-form-item label="主标题" prop="mainTitle">
                    <el-input v-model={form.mainTitle}/>
                </el-form-item>
                <el-form-item label="副标题" prop="subTitle">
                    <el-input v-model={form.subTitle}/>
                </el-form-item>
                <el-form-item label="内容类型" prop="contentType">
                    <el-radio-group v-model={form.contentType} disabled={props.edit}>
                        {
                            options.category.map(it => <el-radio label={it.value}>{it.label}</el-radio>)
                        }
                    </el-radio-group>
                </el-form-item>
                {form.contentType === '10' ?
                    <el-form-item label="外链地址" prop="externalLink">
                        <el-input v-model={form.externalLink}/>
                    </el-form-item>
                    :
                    <el-form-item label="视频" prop="videoUrl">
                        {
                            form.videoUrl ? <div class="el-upload-list el-upload-list--picture-card">
                                    <div class={`el-upload-list__item`} style="margin: 0 !important;">
                                        <video class="el-upload-list__item-thumbnail" width='200' height='200' src={form.videoUrl}/>

                                        <span class="el-upload-list__item-actions">
                                        <span
                                            onClick={handleRemove}
                                            class="el-upload-list__item-delete">
                                            <i class="el-icon-delete"/>
                                        </span>
                                    </span>
                                    </div>
                                </div>
                                : <el-upload
                                    style="display: inline-block;"
                                    v-show={uploadValue.video.length === 0}
                                    show-file-list={false}
                                    limit='1'
                                    accpet="video/*"
                                    multiple={false}
                                    //   v-slots={slots}
                                    file-list={uploadValue.video}
                                    action="/upload/image"
                                    list-type="picture-card"
                                    on-remove={handleRemove}
                                    onError={uploadError}
                                    onSuccess={uploadSuccess}
                                    onProgress={(e, file, l) => {
                                        uploadValue.videoFlag = true
                                        uploadValue.uploadPercent = file.percentage.toFixed(0)
                                    }}
                                    before-upload={(file) => {
                                        // loading.value = true
                                        if (file.type.indexOf('video/') >= 0) {
                                            return true
                                        }
                                        ElMessage.error('请选择正确的视频格式')
                                        return false
                                    }}>
                                    <i v-show={!uploadValue.videoFlag} class="el-icon-plus"/>
                                    <el-progress v-show={uploadValue.videoFlag} type="circle" percentage={uploadValue.uploadPercent}/>

                                </el-upload>
                        }
                    </el-form-item>
                }
                <el-form-item label="排序" prop="sort">
                    <NumberInput v-model={form.sort}/>
                </el-form-item>
            </>
        )

        async function getTarget() {
            const res = (await req('discover.DiscoverLabel/queryTargetList', {})).data
            if (res.errCode === 0) {
                options.target = res.obj
            }
        }

        getTarget()
        getList()
        return () => (
            <div class="page-container padding-0-20">
                <div class="query-bar">
                    <QueryComponents queryList={queryList.value} v-model={queryValue} span={6} v-slots={querySlots} action={false} semi/>
                </div>
                <BasePageTable
                    v-loading={loading.value}
                    data={data.list}
                    v-model={[page.pageNo, 'current-page']}
                    v-model={[page.pageSize, 'page-size']}
                    // data={data.list}
                    total={data.total}
                    onCurrentPageChange={getList}
                    onSizeChange={getList}
                >
                    {
                        tableColumns.map(col => <el-table-column {...col} v-slots={col.slots} key={col.prop}></el-table-column>)
                    }
                    <el-table-column label="操作" v-slots={{
                        default: ({ row }) => (
                            <>
                                <span className="table-action-label" onClick={() => editClick(row)}>编辑</span>
                                {
                                    row.stt === '01'
                                        ? <span className="table-action-label" style="margin-left: 8px" onClick={() => updateDiscoverContentState(row.recordId, '00', row.contentType)}>上线</span>
                                        : <span className="table-action-label" style="margin-left: 8px" onClick={() => updateDiscoverContentState(row.recordId, '01', row.contentType)}>下线</span>
                                }
                                <span className="table-action-label" style="margin-left: 8px" onClick={() => detailClick(row)}>详情</span>
                            </>
                        )
                    }}>

                    </el-table-column>
                </BasePageTable>
                <ConfirmDialog v-model={dialogVisible.create} title="新建文章" auto-confirm={false} center onOnConfirm={handleDialogConfirm}>
                    <el-form ref={FormRef} model={form} rules={formRules.value} validate-on-rule-change={false} label-width="100px">
                        <Form/>
                    </el-form>
                </ConfirmDialog>
                <ConfirmDialog v-model={dialogVisible.edit} title="编辑文章" auto-confirm={false} center onOnConfirm={handleEditDialogConfirm}>
                    <el-form ref={EditFormRef} model={form} rules={formRules.value} validate-on-rule-change={false} label-width="100px">
                        <Form edit/>
                    </el-form>
                </ConfirmDialog>
                <el-dialog v-model={dialogVisible.detail} title="文章详情" center>
                    <div style="margin: 12px 0">
                        <span>选择板块：{form.plateStr}</span>
                    </div>
                    <div style="margin: 12px 0">
                        <span style="vertical-align: top">封面：</span>
                        <el-image style="width: 200px; height: 200px" fit="contain" src={form.coverImg} preview-src-list={[form.coverImg]}></el-image>
                    </div>
                    <div style="margin: 12px 0">
                        <span>主标题：{form.mainTitle}</span>
                    </div>
                    <div style="margin: 12px 0">
                        <span>副标题：{form.subTitle}</span>
                    </div>
                    <div style="margin: 12px 0">
                        <span>内容类型：{form.contentTypeStr}</span>
                    </div>
                    {
                        form.contentType === '10' ?
                            <div style="margin: 12px 0">
                                <span>外链地址：{form.externalLink}</span>
                            </div>
                            :
                            <div style="margin: 12px 0">
                                <span style="vertical-align: top">视频：</span>
                                <video width='200' height='200' src={form.videoUrl} controls/>
                            </div>
                    }

                    <div style="margin: 12px 0">
                        <span>排序：{form.sort}</span>
                    </div>
                </el-dialog>
            </div>
        )
    }
})
