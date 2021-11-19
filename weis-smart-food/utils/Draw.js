class Draw {
  constructor(ctx) {
    this.ctx = ctx;
  }
  draw(...args) {
    this.ctx.draw(...args)
  }
  roundRect(x, y, w, h, r, fill = true, stroke = false) {
    if (r < 0) return;
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(x + r, y + r, r, Math.PI, (Math.PI * 3) / 2);
    ctx.arc(x + w - r, y + r, r, (Math.PI * 3) / 2, 0);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + r);
    if (stroke) ctx.stroke();
    if (fill) ctx.fill();
  }
  textWidth(text, fontSize, bold) {
    const { ctx } = this;
    ctx.font = `${bold ? 'bold' : 'normal'} ${Math.ceil(fontSize)}px sans-serif`;
    return ctx.measureText(String(text)).width
  }
  drawView(box, style) {
    const ctx = this.ctx;
    const { left: x, top: y, width: w, height: h } = box;

    const {
      borderRadius = 0,
      borderWidth = 0,
      borderColor,
      color = '#000',
      backgroundColor = 'transparent',
    } = style;
    ctx.save();
    // 外环
    if (borderWidth > 0) {
      ctx.fillStyle = borderColor || color;
      this.roundRect(x, y, w, h, borderRadius);
    }

    // 内环
    ctx.setFillStyle(backgroundColor);
    const innerWidth = w - 2 * borderWidth;
    const innerHeight = h - 2 * borderWidth;
    const innerRadius =
      borderRadius - borderWidth >= 0 ? borderRadius - borderWidth : 0;
    this.roundRect(
      x + borderWidth,
      y + borderWidth,
      innerWidth,
      innerHeight,
      innerRadius
    );
    ctx.restore();
  }
  async drawImage(img, box) {
    await new Promise((resolve, reject) => {
      const ctx = this.ctx;

      const { borderRadius = 0 } = box;
      let { left: x, top: y, width: w, height: h } = box;
      ctx.save();
      this.roundRect(x, y, w, h, borderRadius, false, false);
      ctx.clip();

      const _drawImage = (img) => {
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();

        resolve();
      };

      const isTempFile = /^wxfile:\/\//.test(img);
      const isNetworkFile = /^https?:\/\//.test(img);

      if (isTempFile) {
        _drawImage(img);
      } else if (isNetworkFile) {
        wx.downloadFile({
          url: img,
          success(res) {
            if (res.statusCode === 200) {
              _drawImage(res.tempFilePath);
            } else {
              reject(new Error(`downloadFile:fail ${img}`));
            }
          },
          fail() {
            reject(new Error(`downloadFile:fail ${img}`));
          },
        });
      } else {
        reject(new Error(`image format error: ${img}`));
      }
    });
  }
  drawText(text, box, style) {
    const ctx = this.ctx;
    let { left: x, top: y, width: w = this.textWidth(text, style.fontSize), height: h } = box;

    let {
      color = '#000',
      lineHeight = h,
      fontSize = 14,
      textAlign = 'left',
      verticalAlign = 'top',
      backgroundColor = 'transparent',
      // fontFamily = 'sans-serif',
      // fontWeight = 'normal'
    } = style;

    if (typeof lineHeight === 'string') {
      // 2em
      lineHeight = Math.ceil(parseFloat(lineHeight.replace('em')) * fontSize);
    }

    if (!String(text) || lineHeight > h) {
      return;
    }

    ctx.save();
    ctx.textBaseline = 'top';
    // 文字大小
    ctx.setFontSize(fontSize);
    // ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;

    // 背景色
    ctx.fillStyle = backgroundColor;
    this.roundRect(x, y, w, h, 0);

    // 文字颜色
    ctx.fillStyle = color;

    // 水平布局
    switch (textAlign) {
      case 'left':
        break;
      case 'center':
        x += 0.5 * w;
        break;
      case 'right':
        x += w;
        break;
      default:
        break;
    }

    const textWidth = ctx.measureText(text).width;

    // console.log(w, text + 'box-width');
    // console.log(text, textWidth);
    const actualHeight = Math.ceil(textWidth / w) * lineHeight;
    let paddingTop = Math.ceil((h - actualHeight) / 2);
    if (paddingTop < 0) paddingTop = 0;

    // 垂直布局
    switch (verticalAlign) {
      case 'top':
        break;
      case 'middle':
        y += paddingTop;
        break;
      case 'bottom':
        y += 2 * paddingTop;
        break;
      default:
        break;
    }

    const inlinePaddingTop = Math.ceil((lineHeight - fontSize) / 2);

    // 不超过一行
    if (textWidth <= w) {
      ctx.fillText(text, x, y + inlinePaddingTop);
      return;
    }

    // 多行文本
    const chars = text.split('');
    const _y = y;

    // 逐行绘制
    let line = '';
    for (const ch of chars) {
      const testLine = line + ch;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > w) {
        ctx.fillText(line, x, y + inlinePaddingTop);
        y += lineHeight;
        line = ch;
        if (y + lineHeight > _y + h) break;
      } else {
        line = testLine;
      }
    }

    // 避免溢出
    if (y + lineHeight <= _y + h) {
      ctx.fillText(line, x, y + inlinePaddingTop);
    }
    ctx.restore();
  }
  canvasToTempFilePath(args = {}, ctx) {
    return new Promise((resolve, reject) => {
      const { top = 0, left = 0, width, height } = args;
      const { pixelRatio: dpr } = wx.getSystemInfoSync();
      const copyArgs = {
        x: left,
        y: top,
        height,
        destWidth: width * dpr,
        destHeight: height * dpr,
        canvasId: args.id,
        fileType: args.fileType || 'png',
        quality: args.quality || 1,
        success: resolve,
        fail: reject,
      };

      wx.canvasToTempFilePath(copyArgs, ctx);
    });
  }
}

export default Draw