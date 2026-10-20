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
    // Recibe el numeroCaja de forma segura y blindada contra valores undefined
    async guardarSesion(token: string, rol: string, sucursal: string | null, debeCambiarCredenciales: boolean, numeroCaja: any) {
      this.token = token
      this.rol = rol
      this.sucursal = sucursal
      this.debeCambiarCredenciales = debeCambiarCredenciales

      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
      localStorage.setItem('debeCambiarCredenciales', String(debeCambiarCredenciales))
      
      if (sucursal) {
        localStorage.setItem('sucursal', sucursal)
      } else {
        localStorage.removeItem('sucursal')
      }

      // Procesamiento seguro del número de caja
      if (numeroCaja !== null && numeroCaja !== undefined && numeroCaja !== '' && !isNaN(Number(numeroCaja))) {
        this.numeroCaja = Number(numeroCaja)
        localStorage.setItem('numeroCaja', String(this.numeroCaja))
      } else {
        this.numeroCaja = null
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
      this.sincronizado = false

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

    // Sincroniza contra el backend al recargar la app sin pisar el número de caja si el backend no lo manda
    async sincronizarConBackend() {
      if (!this.token) {
        this.sincronizado = true
        return
      }

      try {
        const response = await fetch('/api/auth/quien-soy', {
          headers: { 
            'Authorization': `Bearer ${this.token}`,
            'Cache-Control': 'no-cache',
          }
        })

        if (!response.ok) {
          this.cerrarSesion()
          this.sincronizado = true
          return
        }

        const data = await response.json()

        this.rol = data.rol
        this.sucursal = data.sucursal
        this.debeCambiarCredenciales = data.debeCambiarCredenciales

        localStorage.setItem('rol', data.rol)
        localStorage.setItem('debeCambiarCredenciales', String(data.debeCambiarCredenciales))
        
        if (data.sucursal) {
          localStorage.setItem('sucursal', data.sucursal)
        } else {
          localStorage.removeItem('sucursal')
        }

        // Solo actualizamos numeroCaja si viene definido en la respuesta
        if (data.numeroCaja !== undefined) {
          if (data.numeroCaja !== null && data.numeroCaja !== '' && !isNaN(Number(data.numeroCaja))) {
            this.numeroCaja = Number(data.numeroCaja)
            localStorage.setItem('numeroCaja', String(this.numeroCaja))
          } else {
            this.numeroCaja = null
            localStorage.removeItem('numeroCaja')
          }
        }
      } catch (error) {
        console.error('Error al sincronizar con el backend:', error)
      } finally {
        this.sincronizado = true
      }
    }
  }
})