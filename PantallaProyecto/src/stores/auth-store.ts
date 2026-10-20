import { defineStore } from 'pinia'
import { useSucursalStore } from './sucursal-store';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    rol: localStorage.getItem('rol') || null,
    sucursal: localStorage.getItem('sucursal') || null,
    numeroCaja: localStorage.getItem('numeroCaja') ? Number(localStorage.getItem('numeroCaja')) : null,

    // true si esta cuenta todavía no cambió su usuario y contraseña inicial
    debeCambiarCredenciales: localStorage.getItem('debeCambiarCredenciales') === 'true',
    // marca si ya se confirmó contra el backend en esta carga de la app
    sincronizado: false,
  }),

  getters: {
    estaAutenticado: (state) => !!state.token,
  },

  actions: {
 // Recibe el numeroCaja como parámetro tipado junto con los demás datos de sesión
    async guardarSesion(token: string, rol: string, sucursal: string | null, debeCambiarCredenciales: boolean, numeroCaja: number | null) {
      this.token = token
      this.rol = rol
      this.sucursal = sucursal
      this.debeCambiarCredenciales = debeCambiarCredenciales
      this.numeroCaja = numeroCaja

      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
      localStorage.setItem('debeCambiarCredenciales', String(debeCambiarCredenciales))
      
      if (sucursal) {
        localStorage.setItem('sucursal', sucursal)
      } else {
        localStorage.removeItem('sucursal')
      }

      if (numeroCaja !== null && numeroCaja !== undefined) {
        localStorage.setItem('numeroCaja', String(numeroCaja))
      } else {
        localStorage.removeItem('numeroCaja')
      }
    },

    // Limpia todo al cerrar sesión, incluyendo el número de caja
    cerrarSesion() {
      this.token = null
      this.rol = null
      this.sucursal = null
      this.numeroCaja = null
      this.debeCambiarCredenciales = false

      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      localStorage.removeItem('sucursal')
      localStorage.removeItem('numeroCaja')
      localStorage.removeItem('debeCambiarCredenciales')
    },

    marcarCredencialesActualizadas() {
      this.debeCambiarCredenciales = false
      localStorage.setItem('debeCambiarCredenciales', 'false')
    },

    // Sincroniza contra el backend al recargar la app
    async sincronizarConBackend() {
      if (!this.token) return

      try {
        const response = await fetch('/api/auth/quien-soy', {
          headers: { 
            'Authorization': `Bearer ${this.token}`,
            'Cache-Control': 'no-cache',
          }
        })

        if (!response.ok) {
          this.cerrarSesion()
          return
        }

        const data = await response.json()

        this.rol = data.rol
        this.sucursal = data.sucursal
        this.debeCambiarCredenciales = data.debeCambiarCredenciales
        this.numeroCaja = data.numeroCaja ?? null

        localStorage.setItem('rol', data.rol)
        localStorage.setItem('debeCambiarCredenciales', String(data.debeCambiarCredenciales))
        
        if (data.sucursal) {
          localStorage.setItem('sucursal', data.sucursal)
        } else {
          localStorage.removeItem('sucursal')
        }

        if (data.numeroCaja !== null && data.numeroCaja !== undefined) {
          localStorage.setItem('numeroCaja', String(data.numeroCaja))
        } else {
          localStorage.removeItem('numeroCaja')
        }
      } catch (error) {
        console.error('Error al sincronizar con el backend:', error)
      }
    }
  }
})