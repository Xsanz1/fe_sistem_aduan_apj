/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const routes = [
  {
    path: '/app/dashboard', // the url
    icon: 'HomeIcon', // the component being exported from icons/index.js
    name: 'Dashboard', // name that appear in Sidebar
    role: 'all',
  },
  {
    path: '/app/tables',
    icon: 'TablesIcon',
    name: 'Tabel Pengaduan',
    role: 'all',
  },
  {
    path: '/app/user',
    icon: 'PeopleIcon',
    name: 'User',
    role: 'superadmin'
  },
  {
    icon: 'PagesIcon',
    name: 'Data Master',
    role: 'all',
    routes: [
      // submenu
      {
        path: '/app/datapju',
        name: 'Data PJU',
        role: 'all',
      },
      {
        path: '/app/panel',
        name: 'Data Panel',
        role: 'all',
      },
    ],
  }
]

export default routes
