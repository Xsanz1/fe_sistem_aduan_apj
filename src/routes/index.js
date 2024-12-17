import { lazy } from 'react'


// use lazy for better code splitting, a.k.a. load faster
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Tables = lazy(() => import('../pages/Tables'))
const DataPJU = lazy(() => import('../pages/DataPJU'))
const User = lazy(() => import('../pages/User'))
const Profile = lazy(() => import('../pages/Profile'))
const Panel = lazy(() => import('../pages/Panel'))
const Page404 = lazy(() => import('../pages/404'))
/**
 * ⚠ These are internal routes!
 * They will be rendered inside the app, using the default `containers/Layout`.
 * If you want to add a route to, let's say, a landing page, you should add
 * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
 * are routed.
 *
 * If you're looking for the links rendered in the SidebarContent, go to
 * `routes/sidebar.js`
 */
const routes = [
  {
    path: '/dashboard', // the url
    component: Dashboard, // view rendered
  },
  {
    path: '/tables',
    component: Tables,
  },
  {
    path: '/datapju',
    component: DataPJU,
  },
  {
    path: '/user',
    component: User,
  },
  {
    path: '/profile',
    component: Profile,
  },
  {
    path: '/panel',
    component: Panel,
  },
  {
    path: '/404',
    component: Page404,
  },
]

export default routes
