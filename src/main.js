import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// 创建应用
const app = createApp(App);

// 使用Pinia状态管理
const pinia = createPinia();
app.use(pinia);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
