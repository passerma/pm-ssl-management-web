<script setup lang="ts">
import { reactive } from 'vue';
import { MessagePlugin, FormProps } from 'tdesign-vue-next';
import { LockOnIcon } from 'tdesign-icons-vue-next';
import { ref } from 'vue';
import { fetch } from '../utils/fetch';
import { RsaEncrypt } from '../utils/crypto'
import Img from '../imgs/favicon.png'

const loading = ref(false);

const props = defineProps({
  loginOk: {
    type: Function,
    default: () => { },
  },
})

const formData: FormProps['data'] = reactive({
  password: '',
});

const onSubmit: FormProps['onSubmit'] = async () => {
  if (!formData.password) {
    MessagePlugin.warning('请输入密码');
    return;
  }
  loading.value = true
  const res1 = await fetch('/login', {
    method: 'post',
    data: {}
  })
  if (res1 && res1.code === 0) {
    const res2 = await fetch('/login', {
      method: 'post',
      data: {
        password: RsaEncrypt(formData.password, res1.data)
      }
    })
    loading.value = false
    if (res2 && res2.code === 0) {
      MessagePlugin.success('登录成功')
      sessionStorage.setItem('token', res2.data.token)
      props.loginOk()
    } else {
      MessagePlugin.error(res2?.msg || '登录失败')
    }
  } else {
    MessagePlugin.error(res1?.msg || '登录失败')
    loading.value = false
  }
};
</script>

<template>
  <div class="login">
    <div class="login-title"><img :src="Img" />登录</div>
    <t-form class="login-form" :label-width="0" ref="form" :data="formData" @submit="onSubmit">
      <t-form-item name="password">
        <t-input v-model="formData.password" type="password" clearable placeholder="请输入密码">
          <template #prefix-icon>
            <lock-on-icon />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item>
        <t-button :loading="loading" :disabled="loading" theme="primary" type="submit" block>登录</t-button>
      </t-form-item>
    </t-form>
  </div>
</template>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;


  .login-title {

    margin-bottom: 24px;
    display: flex;
    align-items: center;

    font-size: 30px;
    font-weight: 800;
    line-height: 56px;
    color: transparent;
    background: repeating-linear-gradient(-45deg, transparent, transparent 25%, tomato 0, tomato 50%), repeating-linear-gradient(45deg, transparent, transparent 25%, dodgerblue 0, dodgerblue 50%), wheat;
    background-size: 50px 50px;
    background-blend-mode: multiply;
    background-clip: text;

    img {
      width: 50px;
      height: 50px;
      margin-right: 20px;
      border-radius: 4px;
    }
  }

  .login-form {
    width: 80%;
    max-width: 300px;
  }
}
</style>