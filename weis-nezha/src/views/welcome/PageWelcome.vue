<template>
  <div class="page-container">
    <h1 class="welcome-text">
      <img class="img" src="/images/logo.png" />
    </h1>
    <h2 class="welcome-text">欢迎来到维士运营综合平台</h2>
  </div>
</template>

<style lang="less" scoped>
@import "../../styles/base.less";
.page-container {
  height: calc(100vh - 160px);
  padding-top: 200px;
  box-sizing: border-box;
}
.welcome-text {
  margin: 48px 0;
  width: 100%;
  text-align: center;
  color: #0d328b;
  font-size: 44px;
  font-weight: 400;
}
.img {
  width: 700px;
}
</style>
