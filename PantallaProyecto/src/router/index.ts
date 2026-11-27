import { defineRouter } from '#q-app'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '../stores/auth-store'

const RUTA_ACTIVAR_TOTEM = '/totem/activartotem'

function esTokenTotemValido(token: string | null): boolean {
  if (!token) return false
  const partes = token.split('.')
  const payloadSegmento = partes[1]
  if (partes.length !== 3 || !payloadSegmento) return false

  try {
    const base64 = payloadSegmento.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64)) as {
      rol?: string
      sucursalId?: number | string
      exp?: number
    }

    if (payload.rol !== 'TOTEM') return false
    if (payload.exp && Date.now() >= payload.exp * 1000) return false
    return true
  } catch {
    return false
  }
}

export default defineRouter(({ store }) => {
  const Router = createRouter({
    history: createWebHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
    routes
  })

  // NAVIGATION GUARD GLOBAL
  Router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore(store)

    // Protección de rutas de tótem (ej. /totem/1) antes de permitir el acceso
    const esRutaActivacionTotem =
      to.path === RUTA_ACTIVAR_TOTEM || to.path.includes('/activar')
    const esRutaTotem =
      (to.path === '/totem' || to.path.startsWith('/totem/')) &&
      !esRutaActivacionTotem

    if (esRutaTotem) {
      const totemToken = localStorage.getItem('totem_token')
      const sucursalGuardada = localStorage.getItem('totem_sucursal_id')
      const params = to.params as Record<string, string | string[] | undefined>
      const rawParam = params.sucursalId ?? params.id
      const sucursalParam = Array.isArray(rawParam)
        ? String(rawParam[0] ?? '').trim()
        : String(rawParam ?? '').trim()

      const tokenOk = esTokenTotemValido(totemToken)
      const sucursalOk =
        Boolean(sucursalGuardada) &&
        (!sucursalParam || sucursalGuardada === sucursalParam)

      if (!tokenOk || !sucursalOk) {
        localStorage.removeItem('totem_token')
        localStorage.removeItem('totem_sucursal_id')
        return next({ path: RUTA_ACTIVAR_TOTEM, replace: true })
      }
    }

    // si hay token pero todavía no se confirmo contra el backend en esta carga de la app espera esa confirmacion
    // antes de evaluar cualquier otra regla.
    if (authStore.token && !authStore.sincronizado) {
      await authStore.sincronizarConBackend()
      authStore.sincronizado = true
    }

    // 1. Si la ruta requiere estar autenticado y el usuario NO tiene token
    if (to.meta.requiereAuth && !authStore.estaAutenticado) {
      return next({ path: '/login', replace: true })
    }

    // si la cuenta debe cambiar credenciales, forzar esa pantalla sin importar a donde intente ir
    if (authStore.debeCambiarCredenciales && to.path !== '/cambiar-credenciales') {
      return next({ path: '/cambiar-credenciales', replace: true })
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
        return next({ path: destino, replace: true })
      }
    }
    next()
  })

  return Router
})