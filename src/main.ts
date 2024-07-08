import { createPinia } from 'pinia';
import { createApp } from 'vue';

import router from '@/infrastructure/router';
import App from '@/presentation/App.vue';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);

app.mount('#app');
