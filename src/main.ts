import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from '@/presentation/App.vue';
import router from '@/presentation/router';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);

app.mount('#app');
