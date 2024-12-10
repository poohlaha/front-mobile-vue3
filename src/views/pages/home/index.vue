<template>
  <div class="home-page">
    <van-swipe class="swiper-box" :autoplay="3000" indicator-color="white" lazy-render>
      <van-swipe-item v-for="image in images" :key="image">
        <img :src="image" class="wh100" />
      </van-swipe-item>
    </van-swipe>

    <van-button type="primary" block class="page-top-margin"> 提交 </van-button>
  </div>
</template>

<script setup lang="ts">
const images = [
  'https://img2.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=750',
  'https://img0.baidu.com/it/u=2191392668,814349101&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=1399',
]
</script>
