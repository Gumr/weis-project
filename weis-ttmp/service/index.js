import TtService from './TtService';
import UserService from './UserService';
import DouyinUserService from './DouyinUserService';
import ActivityService from './ActivityService';
import AddressService from './AddressService';
import OrderService from './OrderService';
import WriteOffService from './WriteOffService';

export default {
  ...TtService,
  ...UserService,
  ...DouyinUserService,
  ...ActivityService,
  ...AddressService,
  ...OrderService,
  ...WriteOffService,
}
