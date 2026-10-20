import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth-store'

// 1. Interfaz TypeScript para estructurar los datos del local
export interface DatosLocal {
  direccion: string
  telefono: string
  latitud: number | null
  longitud: number | null
}

export const useSucursalStore = defineStore('sucursal', () => {
  const authStore = useAuthStore()

  const cantidadCajas = ref(5)
  
  const datosLocal = ref<DatosLocal>({
    direccion: '',
    telefono: '',
    latitud: null,
    longitud: null
  })

  const cargando = ref(false)

  const obtenerDatosLocal = async () => {
    cargando.value = true
    try {
      const response = await fetch('/api/admin/local', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error('Error al obtener la información del local')
      }

      const data = await response.json()
      datosLocal.value = data
      return data
    } catch (error) {
      console.error('Error al obtener datos del local:', error)
      throw error
    } finally {
      cargando.value = false
    }
  }

  // 2. Parámetro 'nuevosDatos' tipado explícitamente con 'DatosLocal'
  const actualizarDatosLocal = async (nuevosDatos: DatosLocal) => {
    cargando.value = true
    try {
      const response = await fetch('/api/admin/local', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(nuevosDatos)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la información del local')
      }

      datosLocal.value = { ...nuevosDatos }
      return data
    } catch (error) {
      console.error('Error al actualizar datos del local:', error)
      throw error
    } finally {
      cargando.value = false
    }
  }

  return {
    cantidadCajas,
    datosLocal,
    cargando,
    obtenerDatosLocal,
    actualizarDatosLocal
  }
})