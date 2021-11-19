import { defineComponent, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { requestFactor } from '@/utils/request'
import { categoryMap, groupMap } from '@/utils/data-map'
import dayjs from 'dayjs'
import HelpOrder from './HelpOrder'

const { request } = requestFactor('groupmeal.CounselorOrder')


export default defineComponent({
  name: 'sales_fast-foods_counselor-help-order_detail-order',
  setup() {
    const route = useRoute()
    const id = route.query.id

    const params = reactive({
      tcoEmpName: '',
      tcoCategory: '',
      tcoCorpName: '',
      tcoCounselorName: '',
      tcoTime: '',
      tcoDate: '',
      category: '',
      date: '',
      groups: '',
      addresses: ''
    })

    const response = request('queryOrderInfo', {
      tcoId: id
    }).thenwrap((err, res) => {
      if (!err) {
        Object.keys(params).forEach((key) => {
          params[key] = res[key]
        })
        params.category = categoryMap[params.tcoCategory]
        params.date = dayjs(params.tcoDate).format('YYYY年MM月DD日')
        const [groups, addresses] = res.groupInfo.reduce(
          (sets, item) => {
            sets[0].add(groupMap[item.group])
            sets[1].add(item.tgcaName)
            return sets
          },
          [new Set(), new Set()]
        )
        params.groups = [...groups].join(',')
        params.addresses = [...addresses].join(',')

        return res.groupInfo.map((it) => {
          it.price = 0
          it.sku = it.orderInfo
          return it
        })
      }
      return []
    })

    return () => (
      <div class="padding-20">
        <ReturnButton back />
        <div>
          <div style="margin: 10px 0;">
            接口人：{params.tcoEmpName}
          </div>
          <div style="margin: 10px 0;">
            企业：{params.tcoCorpName}
          </div>
          <div style="margin: 10px 0;">
            地址：{params.addresses}
          </div>
          <div style="margin: 10px 0;">
            人群：{params.groups}
          </div>
          <div style="margin: 10px 0;">
            餐别时间：{params.date} {params.category}
          </div>
          <div style="margin: 10px 0;">
            配送时间：{params.tcoTime}
          </div>
        </div>
        <HelpOrder editable={false} response={response} id={id} date={params.tcoDate} category={params.tcoCategory} delivery-time={params.tcoTime}/>
      </div>
    )
  }
})
