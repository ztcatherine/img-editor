import Vue from 'vue'
import Router from 'vue-router'
import box from '@/components/box'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'box',
      component: box
    }
  ]
})
