import { defineRouter } from '#q-app'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '../stores/auth-store'

export default defineRouter(({ store }) => {
  const Router = createRouter({
    history: createWebHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
    routes
  })

  // NAVIGATION GUARD GLOBAL
  Router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore(store)

    // 1. Si la ruta requiere estar autenticado y el usuario NO tiene token
    if (to.meta.requiereAuth && !authStore.estaAutenticado) {
      return next({ path: '/login', replace: true })
    }

    // 2. Si el usuario YA está autenticado e intenta entrar a /login o /registro
    if ((to.path === '/login' || to.path === '/registro') && authStore.estaAutenticado) {
      const destinoPorRol: Record<string, string> = {
        ADMIN: '/admin',
        FUNCIONARIO: '/funcionario',
        CIUDADANO: '/',
      }
      const destino = destinoPorRol[authStore.rol ?? ''] || '/'
      return next({ path: destino, replace: true })
    }

    // 3. Control por roles (si la ruta define meta.roles)
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      if (!to.meta.roles.includes(authStore.rol)) {
        const destinoPorRol: Record<string, string> = {
          ADMIN: '/admin',
          FUNCIONARIO: '/funcionario',
          CIUDADANO: '/',
        }
        const destino = destinoPorRol[authStore.rol ?? ''] || '/login'

        if (to.path === destino) {
          return next()
        }
        return next({ path: destino, replace: true})
    }
  }
    next()
  })

  return Router
})