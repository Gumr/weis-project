export type ExtractOptionsValues<T extends readonly any[]> = T[number] extends { value: infer P } ? P : never

export function mapToOptions(map: Record<string, unknown>, all: {value:string,label:string}|boolean = { value: '-1', label: '全部' }) {
  const opts = [];
  if (all) opts.push(all);

  Object.keys(map).forEach((prop) => {
    const opt = {
      label: map[prop],
      value: prop
    };

    opts.push(opt);
  });
  return opts;
}

export function optionsToMap(options: any[], scheme = { label: 'label', value: 'value' }) {
  const map: Record<string, unknown> = {};
  const lk = scheme.label;
  const vk = scheme.value;

  options.forEach((opt: any) => {
    const label = opt[lk];
    const value = opt[vk];

    map[value] = label;
  });

  return map;
}

export const memberClassOptions = [
  {
    label: '内测用户',
    value: 1
  },
  {
    label: '内部员工',
    value: 2
  },
  {
    label: '普通会员',
    value: 3
  }
];

export const dinnerOptions = [
  {
    label: '早餐',
    value: 1
  },
  {
    label: '中餐',
    value: 2
  },
  {
    label: '晚餐',
    value: 3
  },
  {
    label: '加餐',
    value: 4
  }
];

export const categoryOptions = [{
  label: '早餐',
  value: '01'
}, {
  label: '午餐',
  value: '02'
}, {
  label: '晚餐',
  value: '03'
}];

export const returnTypeOptions = [{
  label: '取消订单',
  value: '01'
}, {
  label: '申请售后',
  value: '02'
}, {
  label: '店长退款',
  value: '11'
}, {
  label: '店长退款',
  value: '12'
}];

export const orderStatusOptions = [
  {
    label: '未支付',
    value: '00'
  },
  {
    label: '已支付',
    value: '01'
  },
  {
    label: '处理中',
    value: '02'
  },
  {
    label: '已退款',
    value: '03'
  },
  {
    label: '已结算',
    value: '04'
  },
  {
    label: '待配送/待取餐',
    value: '05'
  },
  {
    label: '正在配送',
    value: '06'
  },
  {
    label: '配送异常',
    value: '07'
  },
  {
    label: '异常取消',
    value: '08'
  },
  {
    label: '已过期/失效',
    value: '09'
  },
  {
    label: '已完成',
    value: '10'
  },
  {
    label: '已关闭',
    value: '11'
  },
  {
    label: '已通过',
    value: '12'
  },
  {
    label: '入账中',
    value: '13'
  },
  {
    label: '已确认收货',
    value: '14'
  },
  {
    label: '已删除',
    value: '99'
  }
];

export const userStatusMap = {
  0: '正常',
  1: '冻结'
};

export const channelTypeMap = {
  '01': '服务类',
  '02': '流量类'
}

export const spellOrderOptions = [
  {
    label: '普通订单',
    value: '00'
  },
  {
    label: '拼单',
    value: '10'
  }
]
export const returnTypeMap = optionsToMap(returnTypeOptions);
export const categoryMap = optionsToMap(categoryOptions);
export const orderStatusMap = optionsToMap(orderStatusOptions);
export const memberClassMap = optionsToMap(memberClassOptions);
export const channelTypeOptions = mapToOptions(channelTypeMap, false)
export const groupMap = {
  '01': '2岁',
  '02': '3-4岁',
  '03': '5-6岁'
}
