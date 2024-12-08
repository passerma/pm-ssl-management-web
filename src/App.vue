<script setup lang="ts">
import { ref } from 'vue';
import Login from './pages/login.vue';
import List from './pages/list.vue';
const isLogin = ref(false);

const loginOk = () => {
  isLogin.value = true;
}
</script>

<template>
  <div class="app">
    <Login v-if="!isLogin" :login-ok="loginOk" />
    <List v-else />
  </div>
</template>

<style scoped lang="less">
.app {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
