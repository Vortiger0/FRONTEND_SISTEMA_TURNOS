import { defineStore } from 'pinia'
import { useSucursalStore } from './sucursal-store';

//define un store llamado auth que guarda todo lo relacionado a la sesion de la persona logeada (token y rol) adicionalmente la sucursal (solo para funcionarios y admin)
export const useAuthStore = defineStore('auth', {
    //esto es el estado inicial del store. Al cargar la app, intenta recuperar
    //el token y el rol que ya estuvieran guardados en el localstorage de una sesión anterior
    //si no hay nada guardado arranca en null.
  state: () => ({
    token: localStorage.getItem('token') || null,
    rol: localStorage.getItem('rol') || null,
    sucursal: localStorage.getItem('sucursal') || null,

    //true si esta cuenta todavía no cambió su usuario y contra inicial, el guard usa esto para forzar la pantalla de cambio, independientemente de a donde intenté navegar.
    debeCambiarCredenciales: localStorage.getItem('debeCambiarCredenciales') === 'true',
    //marca si ya se confirmó contra el backend en esta carga de la app, arranca en false y no se guarda en el localStorage
    sincronizado: false,
  }),
  //esto lo usa el guard de router/index.ts para decidir si dejar pasar a una pag protegida o redirigir a /login
  //si hay token guardado da true, si token es null da false
  getters: {
    estaAutenticado: (state) => !!state.token,
  },
  actions: {
    //se llama después de un login exitoso. Guarda los tres datos en el estado del store (para que el resto de la app los use de forma reactiva)
    // como en el localstorage (para que persistan si se recarga la pag). sucursal viene como null para ciudadano porque no pertenece a ninguna
    //debeCambiarCredenciales solo viene en true para un admin que todavía no cambió sus credenciales
    guardarSesion(token: string, rol: string, sucursal: string, debeCambiarCredenciales: boolean) {
      this.token = token
      this.rol = rol
      this.sucursal = sucursal
      this.debeCambiarCredenciales = debeCambiarCredenciales
      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
      localStorage.setItem('debeCambiarCredenciales', String(debeCambiarCredenciales))
      if (sucursal) {
        localStorage.setItem('sucursal', sucursal)
      }
    },
    //se llama al cerrar sesión, borra todo, tanto del estado en memoria como del localStorage, dejando a la persona sin sesión activa.
    cerrarSesion() {
      this.token = null
      this.rol = null
      this.sucursal = null
      this.debeCambiarCredenciales = false
      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      localStorage.removeItem('sucursal')
      localStorage.removeItem('debeCambiarCredenciales')
    },

    //se llama despues de que la pantalla hizo el fetch a cambiar-credenciales y confirmó que salió bien, esta funcion solo actualiza el estado local
    //para que el guard deje de forzar la pantalla de cambio en la proxima navegacion
    marcarCredencialesActualizadas() {
      this.debeCambiarCredenciales = false
      localStorage.setItem('debeCambiarCredenciales', 'false')
    },

    //confirma contra el backend quien es esta persona realmente (segun el token, no segun lo que haya en el localStorage)
    //si el token ya no es válido, cierra la sesion. Se llama solo una vez, al arrancar la app, si hay un token guardado.
    async sincronizarConBackend() {
      if (!this.token) return

      try {
        const response = await fetch('/api/auth/quien-soy', {
          headers:{ 
            'Authorization': `Bearer ${this.token}`,
            'Cache-Control': 'no-cache',}
            
        })

        if (!response.ok) {
          this.cerrarSesion()
          return
        }

        const data = await response.json()

        this.rol = data.rol
        this.sucursal = data.sucursal
        this.debeCambiarCredenciales = data.debeCambiarCredenciales

        localStorage.setItem(`rol`, data.rol)
        localStorage.setItem(`debeCambiarCredenciales`, String(data.debeCambiarCredenciales))
        if (data.sucursal) {
          localStorage.setItem('sucursal', data.sucursal)

        } else {
          localStorage.removeItem('sucursal')
        }
        } catch (error ) {
          console.error('Error al sincronizar con el backend:', error)
      }
    }
} 
} 
)