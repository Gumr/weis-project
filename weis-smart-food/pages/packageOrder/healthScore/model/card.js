let blockStep_h = 224
let blockStep_w = 355
export default class LastMayday {
  constructor(paintData) {
    this.man = paintData.man
    this.data = paintData.data
    this.skuList = paintData.skuList
    this.scoreImage = paintData.scoreImage
    this.codeImg = paintData.codeImg || ''
  }
  palette() {
    const {
      overRankPart, 
      dateText, 
      categoryText,
      totalScore, 
    } = this.data;
    const {headImgUrl ='https://prodstatic.weis1606.cn/api/smartFood/defaultAvatar.png', uname} = this.man;
    const title = totalScore >= 95 ? '猴赛雷！我的本餐搭配成绩' : '我的本餐搭配成绩';
    const codeImg = this.codeImg;
    // sku
    const scoreImage = this.scoreImage;
    const skuList = this.skuList;
    skuList.forEach((item,index)=>{
      if (item.primaryImgUrl.indexOf('https') == -1) {
        item.primaryImgUrl = item.primaryImgUrl.replace(/^http/, "https");
      }
    })
    const skuNum = skuList.reduce((skuNum, item) => skuNum + item.num, 0);
    const skuArr = skuList.slice(0,3);
    if(skuNum > skuArr.length){
      skuArr.push({
        type: 'num',
        num: skuNum - skuArr.length
      })
    }
    // 营养解读
    const unscramble = this.data.nutritionHealthDesc || '';
    const unscrambleLineNum = Math.ceil(unscramble.length * 22 / 570);
    // sku盒子高度
    const skuBoxHeight = 424 - 60 + 30 * unscrambleLineNum;
    // 调整建议
    const advise = this.data.suggestTip || '';
    const adviseLineNum = Math.ceil(advise.length * 30 / 425);
    // 健康危害
    const harm = this.data.suggestDesc || '';
    const harmLineNum = Math.ceil(harm.length * 22 / 425);
    // 健康小贴士盒子高度
    const tipBoxHeight = Math.max(30 + 22 + 34 + 42 * adviseLineNum + 30 * harmLineNum, 188);
    const imgHeight = 1600-424+skuBoxHeight-188+tipBoxHeight;
    
    // 绘制sku信息
    function drawSku(){
      let rects = [];
      for(var i = 0; i < skuArr.length; i++) {
        !skuArr[i].type || skuArr[i].type != 'num' ?
          rects = rects.concat([
            _image(skuArr[i].primaryImgUrl, '120rpx', '120rpx', `${60 + 30 * (i+1) + 120 * i}rpx`, '865rpx', null, '10rpx'),
            _textDecoration(formatText(skuList[i].skuname), '20rpx', '#7A3E00', `${60 + 30 * (i+1) + 120 * i}rpx`, `993rpx`, null,null,null,null,'120rpx','28rpx', 'center'),
          ])
          :
          rects = rects.concat([
            _rect('', '120rpx', '120rpx', `${60 + 30 * (i+1) + 120 * i}rpx`, null, `865rpx`, 'rgba(221, 221, 221, 0.15)', '2rpx solid #DDDDDD', '10rpx'),
            _textDecoration(`+${skuList[i].num}`, '30rpx', '#C4C4C4', `${60 + 30 * (i+1) + 120 * i}rpx`, `904rpx`, null,null,null,null,'120rpx','42rpx', 'center'),
          ])
      }
      return rects
    }

    function formatText(text){
      text = text.length <= 5 ? text : `${text.substring(0,5)}...`;
      return text
    }
      
    
    return ({
      width: '750rpx',
      height: `${imgHeight}rpx`,
      background: '#FABF69',
      views: [
        // 健康分头部
        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/BG-hb.png', '100%', '1600rpx', 0, 0),
        _textDecoration(title, '43rpx', '#694747', '60rpx', '50rpx'),
        _textDecoration(`超过了${overRankPart}%的吃货`, '72rpx', '#694747', '60rpx', '100rpx'),
        _image(headImgUrl, '56rpx', '56rpx', '60rpx', '230rpx', null, '50%'),
        _textDecoration(uname, '28rpx', '#694747', '132rpx', '242rpx'),
        _image(scoreImage, '540rpx', '540rpx', '105rpx', '230rpx', null, '0'),

        // sku
        _rect('', '630rpx', `${skuBoxHeight}rpx`, '60rpx', null, '792rpx', '#FFFFFF', '2rpx solid #DDDDDD', '20rpx'),
        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/my-box.png', '120rpx', '28rpx', '90rpx', '816rpx', null, '0'),
        ...drawSku(),
        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/my-yy.png', '120rpx', '28rpx', '90rpx', '1059rpx', null, '0'),
        // 营养解读
        _textDecoration(unscramble, '22rpx', '#7A3E00', '90rpx', `1106rpx`,null,null,null,null,'570rpx','30rpx'),

        // 健康小贴士
        _rect('', '630rpx', `${tipBoxHeight}rpx`, '60rpx', null, `${792+skuBoxHeight+10}rpx`, '#FFFFFF', '2rpx solid #DDDDDD', '20rpx'),
        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/ding-img.png', '24rpx', '77rpx', '88rpx', `${1106 + 17 + 30 * unscrambleLineNum}rpx`, null, '0'),
        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/ding-img.png', '24rpx', '77rpx', '638rpx', `${1106 + 17 + 30 * unscrambleLineNum}rpx`, null, '0'),

        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/hb-cover.png', '120rpx', '120rpx', '90rpx', `${792+skuBoxHeight+10+34}rpx`, null, '0'),

        // 调整建议
        _textDecoration(advise, '30rpx', '#7A3E00', '240rpx', `${792+skuBoxHeight+10+30}rpx`,'bold',null,null,null,'425rpx','42rpx'),
        // 健康危害
        _textDecoration(harm, '22rpx', '#7A3E00', '240rpx', `${792+skuBoxHeight+10+30+22+42*adviseLineNum}rpx`,null,null,null,null,'425rpx','30rpx'),

        // 小程序码
        _image(codeImg || 'https://prodstatic.oss-cn-shenzhen.aliyuncs.com/api/smartFood/minicode.png', '132rpx', '132rpx', '60rpx', `${792+skuBoxHeight+10+tipBoxHeight+24}rpx`, null , '50%'),
        _textDecoration('我不允许我的朋友错过这份美味', '24rpx', '#694747', '224rpx', `${792+skuBoxHeight+10+tipBoxHeight+39}rpx`,null,null,null,null,'197rpx','33rpx'),
        _textDecoration('长按扫码，领取优惠→', '20rpx', '#694747', '224rpx', `${792+skuBoxHeight+10+tipBoxHeight+112}rpx`,null,null,null,null,'210rpx','28rpx'),
        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/hb-line.png', '3rpx', '129rpx', '462rpx', `${792+skuBoxHeight+10+tipBoxHeight+23}rpx`),
        _image('https://prodstatic.weis1606.cn/api/smartFood/aboutWeis/eat-coupon.png', '185rpx', '133rpx', '498rpx', `${792+skuBoxHeight+10+tipBoxHeight+24}rpx`),
      ],
    });
  }
}

const startTop = 50;
const startLeft = 20;
const gapSize = 70;
const common = {
  left: `${startLeft}rpx`,
  fontSize: '40rpx',
};

function _rect(id, width, height, left, right, top, color, border, borderRadius) {
  return ({
    id,
    type: 'rect',
    css: {
      color,
      width,
      height,
      left,
      right,
      top,
      border,
      borderRadius,
    },
  })
}

function _textDecoration(text, fontsize, color, left, top, fontweight, fontFamily, id=null,zIndex,width,lineHeight,textAlign) {
  return ({
    id,
    type: 'text',
    text,
    css: [{
      left,
      top,
      color,
      textDecoration: text,
      fontSize: fontsize,
      fontweight,
      fontFamily,
      zIndex,
      width,
      lineHeight,
      textAlign
    }],
  });
}

function _image(url, width, height, left, top, rotate, borderRadius,) {
  return (
    {
      // id: `image-${index}`,
      type: 'image',
      url,
      css: {
        top,
        left,
        width,
        height,
        rotate,
        minWidth: '60rpx',
        borderRadius,
        scalable: true,
      },
    }
  )
}

function _des(index, content) {
  const des = {
    type: 'text',
    text: content,
    css: {
      fontSize: '22rpx',
      top: `${startTop + 8.5 * gapSize + 140}rpx`,
    },
  };
  if (index === 3) {
    des.css.right = '60rpx';
  } else {
    des.css.left = `${startLeft + 120 * index + 30}rpx`;
  }
  return des;
}
