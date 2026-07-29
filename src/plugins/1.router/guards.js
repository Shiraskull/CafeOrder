import { canNavigate } from '@layouts/plugins/casl'

export const setupGuards = router => {
  
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(to => {
    /*
    
         * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
         * Examples of public routes are, 404, under maintenance, etc.
         */
          const userData = localStorage.getItem('userData')
          const isLoggedIn = !!userData
          const isLoginPage = to.name === 'myLogon'
        console.log(to);
      
    if (to.path === '/' || to.name === 'root') return true
    
    /**
     * Check if user is logged in by checking if token & user data exists in local storage
     * Feel free to update this logic to suit your needs
    */
   if (isLoginPage) return true
   
   // Jika belum login dan mencoba masuk ke halaman yang bukan login
   if (!isLoggedIn) {
        return {
          name: 'index',
          query: { to: 'myLogon' },
        }
      }
    /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */
    // if (to.meta.unauthenticatedOnly) {
    //   if (isLoggedIn)
    //     return '/'
    //   else
    //     return undefined
    // }
    console.log(!canNavigate(to), to);
  if (!canNavigate(to) && to.matched.length) {
    console.log('test');
    
    
    return {
      name: 'not-authorized',
    }
  }
  })
}
