import { useRoute } from 'vue-router'
import { defineComponent } from 'vue'
import { requestFactor } from '@/utils/request'
import HelpOrder from './HelpOrder'

const { request } = requestFactor('groupmeal.CounselorOrder')
export default defineComponent({
  name: 'sales_fast-foods_counselor-help-order_order',
  setup() {
    const route = useRoute()
    const routeParams = route.params
    const response = request('getOrderInfoList', {
      tgcaId: routeParams.address.join(','),
      group: routeParams.group.join(',')
    }).thenwrap((err, data) => (!err
      ? data.map((it) => {
        if (!it.user)it.user = []
        if (!it.sku)it.sku = []

        return it
      })
      : []))
    return () => (
      <HelpOrder response={response} category={routeParams.category} date={routeParams.date} delivery-time={routeParams.deliveryTime}/>
    )
  }
})
