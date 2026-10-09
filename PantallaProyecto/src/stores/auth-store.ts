import { defineStore } from 'pinia'

//define un store llamado auth que guarda todo lo relacionado a la sesion de la persona logeada (token y rol) adicionalmente la sucursal (solo para funcionarios y admin)
export const useAuthStore = defineStore('auth', {
    //esto es el estado inicial del store. Al cargar la app, intenta recuperar
    //el token y el rol que ya estuvieran guardados en el localstorage de una sesión anterior
    //si no hay nada guardado arranca en null.
  state: () => ({
    token: localStorage.getItem('token') || null,
    rol: localStorage.getItem('rol') || null,
    sucursal: localStorage.getItem('sucursal') || null,
  }),
  actions: {
    //se llama después de un login exitoso. Guarda los tres datos en el estado del store (para que el resto de la app los use de forma reactiva)
    // como en el localstorage (para que persistan si se recarga la pag). sucursal viene como null para ciudadano porque no pertenece a ninguna
    guardarSesion(token: string, rol: string, sucursal: string) {
      this.token = token
      this.rol = rol
      this.sucursal = sucursal
      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
      if (sucursal) {
        localStorage.setItem('sucursal', sucursal)
      }
    },
    //se llama al cerrar sesión, borra todo, tanto del estado en memoria como del localStorage, dejando a la persona sin sesión activa.
    cerrarSesion() {
      this.token = null
      this.rol = null
      this.sucursal = null
      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      localStorage.removeItem('sucursal')
    }
  }
})