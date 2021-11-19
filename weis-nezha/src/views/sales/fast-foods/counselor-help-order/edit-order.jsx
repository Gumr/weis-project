import { defineComponent, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { requestFactor } from '@/utils/request'
import HelpOrder from './HelpOrder'

const { request } = requestFactor('groupmeal.CounselorOrder')

export default defineComponent({
  name: 'sales_fast-foods_counselor-help-order_edit-order',
  setup() {
    const route = useRoute()
    const id = route.query.id

    const params = reactive({
      tcoCategory: '',
      tcoDate: '',
      tcoTime: ''
    })

    const response = request('queryOrderInfo', {
      tcoId: id
    }).thenwrap((err, res) => {
      if (!err) {
        params.tcoCategory = res.tcoCategory
        params.tcoDate = res.tcoDate
        params.tcoTime = res.tcoTime
        return res.groupInfo.map((it) => {
          it.price = 0
          it.sku = it.orderInfo
          return it
        })
      }
      return []
    })

    return () => (
      <HelpOrder response={response} id={id} date={params.tcoDate} category={params.tcoCategory} delivery-time={params.tcoTime}/>
    )
  }
})
