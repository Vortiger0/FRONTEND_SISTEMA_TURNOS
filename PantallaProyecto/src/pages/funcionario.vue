<route lang="yaml">
meta:
  requiereAuth: true
  roles: ["FUNCIONARIO"]
</route>

<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md relative-position">
    
    <div style="width: 100%; max-width: 500px;">
      <q-card class="shadow-3 q-pa-md">
        
        <!-- ENCABEZADO Y CERRAR SESIÓN -->
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bold text-grey-9">
            Panel de Atención
          </div>
          <q-btn flat round dense color="grey-7" icon="logout" @click="mostrarConfirmacion = true">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </q-card-section>

        <!-- SUCURSAL ACTUAL -->
        <q-card-section class="q-pt-sm text-center">
          <div class="text-caption text-grey-7">Sucursal Actual</div>
          <div class="text-h6 text-primary text-weight-bold row items-center justify-center q-gutter-x-xs">
            <q-icon name="storefront" size="22px" />
            <span>{{ sucursalNombre }}</span>
          </div>
        </q-card-section>

        <q-separator class="q-mx-md q-my-xs" />

        <!-- ESTADO DE LOS TURNOS -->
        <q-card-section class="text-center q-py-md">
          <div v-if="turnoActual">
            <div class="text-subtitle2 text-grey-8 text-weight-bold q-mt-md text-uppercase">
              TURNO ACTUALMENTE EN ATENCIÓN
            </div>
            <div class="text-h1 text-weight-bolder text-primary q-my-xs">
              #{{ turnoActual.numero }}
            </div>
            <div class="text-caption text-grey-7">Estado: {{ turnoActual.estado }}</div>
          </div>

          <div v-else class="q-py-md">
            <q-icon name="hourglass_empty" size="3rem" color="grey-5" />
            <div class="text-subtitle1 text-grey-7 text-weight-medium q-mt-sm">
              Fila vacía o ningún turno en atención
            </div>
            <div class="text-caption text-grey-6">Presiona "Siguiente" para llamar al próximo ciudadano.</div>
          </div>
        </q-card-section>

        <!-- ACCIONES DE ATENCIÓN Y LIBERACIÓN -->
        <q-card-actions align="center" class="q-gutter-y-sm q-pb-md">
          
          <!-- BOTÓN SIGUIENTE -->
          <q-btn
            label="SIGUIENTE / ATENDIDO"
            color="primary"
            icon-right="navigate_next"
            size="lg"
            unelevated
            class="full-width q-py-sm text-bold"
            :loading="cargandoSiguiente"
            @click="llamarSiguiente"
          />

          <!-- BOTÓN MARCAR AUSENTE / LIBERAR TURNO -->
          <q-btn
            label="MARCAR AUSENTE"
            color="warning"
            text-color="dark"
            icon="person_off"
            outline
            class="full-width q-py-xs text-weight-bold"
            :disabled="!turnoActual"
            :loading="cargandoAusente"
            @click="marcarAusente"
          />

        </q-card-actions>

      </q-card>
    </div>

    <!-- DIÁLOGO DE CONFIRMACIÓN DE CERRAR SESIÓN -->
    <q-dialog v-model="mostrarConfirmacion" persistent>
      <q-card style="min-width: 300px;">
        <q-card-section class="row items-center">
          <q-avatar icon="logout" color="primary" text-color="white" size="md" />
          <span class="q-ml-sm text-subtitle1 text-weight-bold">Confirmar salida</span>
        </q-card-section>

        <q-card-section class="q-pt-none text-grey-8">
          ¿Estás seguro de que deseas cerrar sesión y salir del panel de atención?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn label="Cerrar sesión" color="negative" unelevated @click="cerrarSesion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const mostrarConfirmacion = ref(false)
const turnoActual = ref(null)
const cargandoSiguiente = ref(false)
const cargandoAusente = ref(false)

// Propiedad computada para obtener el nombre de la sucursal desde el store
const sucursalNombre = computed(() => {
  if (typeof authStore.sucursal === 'object' && authStore.sucursal !== null) {
    return authStore.sucursal.nombre || 'Sucursal Asignada'
  }
  return authStore.sucursal || 'Sin Sucursal Asignada'
})

// Llamar al siguiente turno (cierra el actual si lo había y asigna el próximo)
const llamarSiguiente = async () => {
  cargandoSiguiente.value = true
  try {
    const response = await fetch('/api/funcionario/siguiente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      $q.notify({ type: 'negative', message: data.error || 'Error al llamar al siguiente turno' })
      return
    }

    // Contemplar el caso cuando la fila está vacía
    if (data.mensaje && !data.id) {
      turnoActual.value = null
      $q.notify({ type: 'info', message: data.mensaje })
      return
    }

    // Actualiza con el turno recibido completo
    turnoActual.value = data
    $q.notify({ type: 'positive', message: `Atendiendo turno N° ${data.numero}` })

  } catch (error) {
    console.error('Error de red:', error)
    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor' })
  } finally {
    cargandoSiguiente.value = false
  }
}

// Marcar como ausente el turno en atención actual
const marcarAusente = async () => {
  if (!turnoActual.value) return

  cargandoAusente.value = true
  try {
    const response = await fetch('/api/funcionario/ausente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      $q.notify({ type: 'negative', message: data.error || 'Error al marcar como ausente' })
      return
    }

    $q.notify({ type: 'warning', message: 'Turno marcado como ausente' })
    
    // Actualiza con el resultado devuelto (nuevo turno o vacío)
    turnoActual.value = data.id ? data : null

  } catch (error) {
    console.error('Error de red:', error)
    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor' })
  } finally {
    cargandoAusente.value = false
  }
}

const cerrarSesion = () => {
  authStore.cerrarSesion()
  mostrarConfirmacion.value = false
  router.push('/login')
}
</script>

<style scoped>
.border-danger {
  border: 1px solid #ef9a9a !important;
}

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>