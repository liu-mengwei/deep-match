import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PhotoAnalysis from '@/views/PhotoAnalysis.vue';
import QuestionnaireView from '@/views/QuestionnaireView.vue';
import ResultView from '@/views/ResultView.vue';
import Survey from '@/views/Survey.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
    },
    {
      path: '/results',
      name: 'results',
      component: ResultView,
    },
    {
      path: '/survey',
      name: 'survey',
      component: Survey,
    },
  ],
});

export default router;
