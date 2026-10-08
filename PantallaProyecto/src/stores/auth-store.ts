import { defineStore } from 'pinia'

//define un store llamado auth que guarda todo lo relacionado a la sesion de la persona logeada (token y rol)
export const useAuthStore = defineStore('auth', {
    //esto es el estado inicial del store. Al cargar la app, intenta recuperar
    //el token y el rol que ya estuvieran guardados en el localstorage de una sesión anterior
    //si no hay nada guardado arranca en null.
  state: () => ({
    token: localStorage.getItem('token') || null,
    rol: localStorage.getItem('rol') || null
  }),
  actions: {
    //se llama después de un login exitoso, guarda el token y el rol
    //tanto en el estado del store como en el localstorage (para que persistan si se recarga la pag)
    guardarSesion(token: string, rol: string) {
      this.token = token
      this.rol = rol
      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
    },
    //se llama al cerrar sesión, borra todo, tanto del estado en memoria como del localStorage, dejando a la persona sin sesión activa.
    cerrarSesion() {
      this.token = null
      this.rol = null
      localStorage.removeItem('token')
      localStorage.removeItem('rol')
    }
  }
})