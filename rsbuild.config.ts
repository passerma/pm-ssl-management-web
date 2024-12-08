import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginVueJsx } from "@rsbuild/plugin-vue-jsx";


export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginVue(),
    pluginVueJsx(),
    pluginLess()
  ],
  html: {
    title: 'passermaSSL证书监控',
    favicon: './src/imgs/favicon.png',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4006',
        pathRewrite: { '^/api': '' },
      },
    }
  }
});
