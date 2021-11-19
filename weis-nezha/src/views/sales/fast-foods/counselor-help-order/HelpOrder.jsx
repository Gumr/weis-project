import { useRouter } from 'vue-router'
import { defineComponent, ref } from 'vue'
import { requestFactor } from '@/utils/request'
import { groupMap } from '@/utils/data-map'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { round } from '@/utils/common'
import { ElMessage } from 'element-plus'
import styles from './HelpOrder.module.less'

const { request } = requestFactor('groupmeal.CounselorOrder')
export default defineComponent({
  name: 'HelpOrder',
  props: {
    response: Promise,
    id: String,
    category: String,
    date: String,
    deliveryTime: String,
    editable: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const router = useRouter()
    const dialogVisible = ref(false)
    const tableList = ref([])
    const skuList = ref([])
    const currentIndex = ref(null)
    const tableColumns = {
      user: [
        {
          type: 'index',
          label: '序号',
          align: 'center',
          width: 60
        },
        {
          prop: 'uname',
          label: '昵称'
        },
        {
          prop: 'sexDesc',
          label: '性别'
        },
        {
          prop: 'age',
          label: '年龄'
        },
        {
          prop: 'height',
          label: '身高(cm)'
        },
        {
          prop: 'weight',
          label: '体重(斤)'
        },
        {
          prop: 'motionDesc',
          label: '活动强度'
        },
        {
          prop: 'goalDesc',
          label: '目标'
        },
        {
          prop: 'masterUname',
          label: '主账号昵称'
        },
        {
          prop: 'masterPhone',
          label: '主账号手机号'
        }
      ],
      sku: [
        {
          type: 'index',
          label: '序号',
          align: 'center',
          width: 60
        },
        {
          prop: 'tcodCid',
          label: '菜品编码'
        },
        {
          prop: 'tcodSkuName',
          label: '菜品名称'
        },
        {
          prop: 'tcodUnit',
          label: '菜品规格'
        },
        {
          prop: 'tcodPrice',
          label: '菜品单价'
        },
        {
          label: '菜品数量',
          prop: 'tcodNum',
          slots: {
            default: ({ row }) => <NumberInput v-model={row.tcodNum} />
          }
        }
      ]
    }

    function calcSkuPrice(skus) {
      const price = skus.reduce((prc, sku) => prc + sku.tcodPrice * sku.tcodNum, 0)
      return round(price, 2)
    }

    function handleConfirm() {
      const item = tableList.value[currentIndex.value]
      const skus = skuList.value.filter(sku => sku.tcodNum > 0)
      item.sku = skus
      item.price = calcSkuPrice(skus)
    }

    function queryFoodList(params) {
      return request('queryFoodList', {
        tcoCategory: props.category,
        tcoDate: props.date,
        ...params
      }).thenwrap((err, data) => (!err
        ? data.map((it) => {
          it.tcodNum = 0
          return it
        })
        : null))
    }

    function selectSkuClick(idx) {
      currentIndex.value = idx
      const item = tableList.value[idx]
      queryFoodList({
        group: item.group,
        tgcaId: item.tgcaId
      }).then((skus) => {
        skuList.value = skus.map((it) => {
          if (item.sku.length > 0) {
            const match = item.sku.find(sku => it.tcodCid === sku.tcodCid)
            if (match) it.tcodNum = match.tcodNum
          }

          return it
        })

        dialogVisible.value = true
      })
    }

    function removeSkuClick(index, skuIndex) {
      const item = tableList.value[index]
      item.sku.splice(skuIndex, 1)
      item.price = calcSkuPrice(item.sku)
    }

    function submitClick() {
      for (let i = 0; i < tableList.value.length; i += 1) {
        const item = tableList.value[i]
        if (item.user.length <= 0) {
          ElMessage.error(`第${i + 1}项没有用户，无法提交`)
          return
        }

        if (item.sku.length <= 0) {
          ElMessage.error(`第${i + 1}项没有选择菜品，无法提交`)
          return
        }
      }

      request('saveOrderInfo', {
        tcoId: props.id,
        tcoDate: props.date,
        tcoTime: props.deliveryTime,
        tcoCategory: props.category,
        groupInfo: tableList.value.map(it => ({
          tgcaId: it.tgcaId,
          group: it.group,
          user: it.user.map(({ uid }) => ({ uid })),
          orderInfo: it.sku.map(s => ({
            tcodCid: s.tcodCid,
            tcodType: s.tcodType,
            tcodNum: s.tcodNum
          }))
        }))
      }).thenwrap((err) => {
        if (err) {
          ElMessage.error(err.errMsg)
        } else {
          router.back()
        }
      })
    }

    props.response.then((list) => {
      tableList.value = list.map((it) => {
        it.price = it.sku.length > 0 ? calcSkuPrice(it.sku) : 0
        return it
      })
    })
    return () => (
      <div class={styles.container}>
        {
          tableList.value.map((it, idx) => (
            <section class={styles.section} key={it.tgcaName}>
              <div class="display-flex flex-content-between">
                <div>
                  <span>地址{idx + 1}：</span>
                  <el-tag>{it.tgcaName}</el-tag>
                </div>
                <el-button v-show={props.editable} type="danger" onClick={() => {
                  tableList.value.splice(idx, 1)
                }}>删除</el-button>
              </div>
              <div class={styles['margin-14']}>
                <span>人群{idx + 1}：</span>
                <el-tag>{groupMap[it.group]}</el-tag>
              </div>
              <el-table data={it.user} border stripe>
                {
                  tableColumns.user.map(col => <el-table-column {...col} key={col.prop}/>)
                }
                {
                  props.editable
                    ? <el-table-column label="操作" align="center">
                      <span class="table-action-label">移除</span>
                    </el-table-column>
                    : null
                }
              </el-table>
              <div class={styles['margin-14']}>
                <span>菜品{idx + 1}：</span>
                <el-button v-show={props.editable} type="primary" onClick={() => selectSkuClick(idx)}>选择菜品</el-button>
              </div>
              {
                it.sku.length > 0
                  ? <el-table data={it.sku} border stripe>
                    {
                      tableColumns.sku.map(col => <el-table-column {...col} key={col.prop}/>)
                    }
                    {
                      props.editable
                        ? <el-table-column label="操作" align="center" v-slots={{
                          default: ({ index: skuIndex }) => <span class="table-action-label" onClick={() => removeSkuClick(idx, skuIndex)}>移除</span>
                        }}>
                        </el-table-column>
                        : null
                    }
                  </el-table>
                  : null
              }
              <div class={styles['margin-14']}>1人份价格：<span class={styles['price-label']}>{it.price}</span>元</div>
              <div class={styles['margin-14']}>人数：{it.user.length}人</div>
              <div class={styles['margin-14']}>总价：<span class={styles['price-label']}>{it.price * it.user.length}</span>元</div>
            </section>
          ))
        }
        <footer class="text-center" v-show={props.editable}>
          <el-button type="primary" onClick={submitClick}>确认</el-button>
          <ReturnButton type={false} back icon={null}>取消</ReturnButton>
        </footer>
        <ConfirmDialog title="选择菜品" width="60%" v-model={dialogVisible.value} onOnConfirm={handleConfirm} center>
          <el-table data={skuList.value} border stripe height="600px">
            {
              tableColumns.sku.map(col => <el-table-column {...col} key={col.key} v-slots={col.slots}></el-table-column>)
            }
          </el-table>
        </ConfirmDialog>
      </div>
    )
  }
})
