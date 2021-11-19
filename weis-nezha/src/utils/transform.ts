import dayjs, {Dayjs, ConfigType} from 'dayjs';

export function transformDaterange(daterange: ConfigType[]): [Dayjs, Dayjs]|[] {
  if (!Array.isArray(daterange) || daterange.length <= 0) {
    return [];
  }
  const [s, e] = daterange;

  return [dayjs(s), dayjs(e).endOf('day')];
}

interface OptionProps  {
  label: string
  value: string
}

export function transformOptions(opts: { [P in string|number]: any }[], props: OptionProps) {
  return opts.map(opt => ({
    label: opt[props.label],
    value: opt[props.value]
  }));
}
