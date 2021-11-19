import request from '../utils/api';

const CLASS_NAME = 'Activity/'

const Activity = {
  queryDiscoverCarousel(data) {
    return request({
      method: `${CLASS_NAME}queryDiscoverCarousel`,
      data,
      mode: 'api',
    })
  },
}

export default Activity;
