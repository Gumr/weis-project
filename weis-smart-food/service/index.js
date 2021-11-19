import FoodService from './FoodService';
import WxService from './WxService';
import UserService from './UserService';
import ActivityService from './ActivityService';
import AddressService from './AddressService';
import PlanService from './PlanService';
import MembershipService from './MembershipService';
import CouponService from './CouponService';
import TurboService from './TurboService';
import AgencyPurchaseService from './AgencyPurchaseService';
import CounselorService from './CounselorService';
import SporPlantService from './SporPlantService'
import DataPunchService from './DataPunchService';
import BodyDataService from './BodyDataService'
import spordCardService from './spordCardService'
import OrderService from './OrderService'
import DietitianService from './DietitianService'
import MarketingService from './MarketingService'
import LogRecordService from './LogRecordService'
import ForecastOrderService from './ForecastOrderService'
import InviteMelaService from './InviteMelaService'

export default {
  ...FoodService,
  ...WxService,
  ...UserService,
  ...ActivityService,
  ...AddressService,
  ...PlanService,
  ...MembershipService,
  ...CouponService,
  ...TurboService,
  ...AgencyPurchaseService,
  ...CounselorService,
  ...SporPlantService,
  ...DataPunchService,
  ...BodyDataService,
  ...spordCardService,
  ...OrderService,
  ...DietitianService,
  ...MarketingService,
  ...LogRecordService,
  ...ForecastOrderService,
  ...InviteMelaService,
}
