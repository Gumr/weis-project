/**
 * 根据幅度重组数组
 * origin：原数组
 * extent: 幅度
 */
export function reorganization(origin, extent) {
  let now = []
  handle()
  function handle() {
    if (origin.length > 0) {
      // 重组后的数组
      if (origin.length <= extent) {
        let subArr = [];
        origin.forEach(v => {
          subArr.push(v);
        });
        now.push(subArr);
      } else {
        let subArr = [];
        const sub= origin.splice(0, extent);
        for (var i = 0; i < sub.length; i++) {
          subArr.push(sub[i]);
        }
        now.push(subArr);
        handle(origin, extent);
      }
    }
  }
  return now
 }