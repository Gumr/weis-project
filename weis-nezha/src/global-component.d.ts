
declare type PublicProps = import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps;

declare  const QueryComponents: new () => {
  $props: PublicProps & import('./components/types').QueryComponentsProps
}

declare  const BasePageTable: new () => {
  $props: PublicProps & import('./components/types').BasePageTableProps
} & typeof import('element-plus').ElTable

declare  const BaseSelect: (new () => {
  $props: PublicProps & import('./components/types').BaseSelectProps
}) & typeof import('element-plus').ElSelect

declare  const NumberInput: (new () => {
  $props: PublicProps & import('./components/types').NumberInputProps
}) & typeof import('element-plus').ElInput

declare  const DatePicker: new () => {
  $props: PublicProps & import('./components/types').DatePickerProps
}

declare  const ReturnButton: new () => {
  $props: PublicProps & import('./components/types').ReturnButtonProps
}

