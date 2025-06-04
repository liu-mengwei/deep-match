import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PhotoAnalysis from '@/views/PhotoAnalysis.vue';
import QuestionnaireView from '@/views/QuestionnaireView.vue';
import ResultView from '@/views/ResultView.vue';
import Survey from '@/views/Survey.vue';
import { clearInvalidToken, isTokenValid } from '@/utils/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/survey',
    },
    {
      path: '/questions',
      name: 'questions',
      component: QuestionnaireView,
    },
    {
      path: '/photo-analysis',
      name: 'photo-analysis',
      component: PhotoAnalysis,
      meta: { requiresAuth: true },
    },
    {
      path: '/results',
      name: 'results',
      component: ResultView,
      meta: { requiresAuth: true },
    },
    {
      path: '/survey',
      name: 'survey',
      component: Survey,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Auth/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Auth/Register.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/Auth/ForgetPassword.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
    },
    // {
    //   path: '/profile-setup',
    //   name: 'ProfileSetup',
    //   component: () => import('../views/Profile/Setup.vue'),
    //   meta: { requiresAuth: true },
    // },
    // {
    //   path: '/terms',
    //   name: 'Terms',
    //   component: () => import('../views/Legal/Terms.vue'),
    // },
    // {
    //   path: '/privacy',
    //   name: 'Privacy',
    //   component: () => import('../views/Legal/Privacy.vue'),
    // },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 清除已过期的token
  clearInvalidToken();

  const isAuthenticated = isTokenValid();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
