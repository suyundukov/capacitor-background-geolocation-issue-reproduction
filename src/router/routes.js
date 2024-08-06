export default [
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/IndexPage.vue'),
  },
];
