type WrapResolve<T = any> = import('./utils/request').WrapResolve<T>
declare interface Promise<T> {
  thenwrap<P = any>(resolve: WrapResolve<P>, reject?: any): Promise<ReturnType<WrapResolve<P>>>;
}