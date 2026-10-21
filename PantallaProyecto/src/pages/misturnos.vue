<route lang="yaml">
meta:
  layout: false
  requiereAuth: true
  roles: ["CIUDADANO"]
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md select-none">
    <div style="width: 100%; max-width: 500px;">
      
      <!-- CONTENEDOR PRINCIPAL -->
      <q-card class="shadow-10 radius-20 overflow-hidden bg-white">
        
        <!-- ENCABEZADO CON BOTÓN DE REGRESO -->
        <q-card-section class="bg-primary text-white q-pa-lg">
          <div class="row items-center justify-between">
            <q-btn
              flat
              round
              dense
              icon="arrow_back"
              color="white"
              to="/"
            />
            <div class="text-h6 text-weight-bolder text-uppercase letter-spacing-sm">
              Mis Turnos Activos
            </div>
            <q-icon name="confirmation_number" size="1.8rem" />
          </div>
        </q-card-section>

        <!-- LISTADO DE TURNOS -->
        <q-card-section class="q-pa-md">
          <div v-if="misTurnos && misTurnos.length > 0" class="q-gutter-y-sm">
            
            <q-card
              v-for="(turno, index) in misTurnos"
              :key="turno.id || index"
              v-ripple
              flat
              bordered
              class="card-turno cursor-pointer radius-16 q-pa-sm"
              @click="abrirDetalle(turno)"
            >
              <q-card-section class="row items-center justify-between q-py-xs">
                <!-- DETALLES SUCURSAL Y SERVICIO -->
                <div class="col-8">
                  <div class="row items-center q-gutter-x-xs text-caption text-bold text-primary text-uppercase">
                    <q-icon name="storefront" size="16px" />
                    <span>{{ turno.sucursal?.nombre || 'Sucursal' }}</span>
                  </div>
                  <div class="text-subtitle1 text-weight-bolder text-grey-9 q-mt-xs">
                    {{ turno.sucursal?.organismo || 'Atención Presencial' }}
                  </div>
                  <div class="text-caption text-grey-7">
                    <q-icon name="schedule" size="14px" class="q-mr-xs" />
                    Emitido: {{ formatearHora(turno.creadoEn) }}
                  </div>
                </div>

                <!-- NÚMERO DE TURNO -->
                <div class="col-4 text-right">
                  <q-badge
                    :color="turno.estado === 'EN_ATENCION' ? 'positive' : 'blue-2'"
                    :text-color="turno.estado === 'EN_ATENCION' ? 'white' : 'primary'"
                    class="q-px-md q-py-xs text-h6 text-weight-bolder radius-12 font-mono"
                  >
                    #{{ turno.numero }}
                  </q-badge>
                  <div class="text-caption text-weight-bold text-grey-6 q-mt-xs">
                    Toca para ver
                  </div>
                </div>
              </q-card-section>
            </q-card>

          </div>

          <!-- MENSAJE SI NO HAY TURNOS -->
          <div v-else class="text-center q-py-xl">
            <q-icon name="event_busy" color="grey-5" size="4rem" />
            <div class="text-h6 text-grey-7 text-weight-bold q-mt-md">
              No tienes turnos activos
            </div>
            <div class="text-caption text-grey-6 q-mb-lg">
              Saca un turno desde el catálogo principal
            </div>
            <q-btn
              label="SACAR TURNO"
              color="primary"
              unelevated
              class="radius-12 text-bold q-px-lg"
              to="/"
            />
          </div>
        </q-card-section>

      </q-card>

      <!-- 1. DIÁLOGO DETALLE DEL TURNO -->
      <q-dialog v-model="modalDetalle">
        <q-card style="width: 100%; max-width: 400px;" class="radius-20 overflow-hidden">
          
          <!-- ENCABEZADO DEL DETALLE -->
          <q-card-section class="bg-grey-2 row items-center justify-between q-px-md q-py-sm bordered-bottom">
            <div class="text-subtitle2 text-weight-bold text-grey-8 text-uppercase">
              Detalle del Turno
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section v-if="turnoSeleccionado" class="text-center q-pa-lg">
            <!-- NÚMERO DESTACADO -->
            <div class="text-caption text-weight-bold text-grey-7 text-uppercase">
              Número de atención
            </div>
            <div class="text-weight-bolder text-primary numero-modal font-mono q-my-xs">
              #{{ turnoSeleccionado.numero }}
            </div>

            <q-badge
              :color="turnoSeleccionado.estado === 'EN_ATENCION' ? 'positive' : 'primary'"
              class="q-px-lg q-py-xs text-caption text-weight-bold badge-redondeado q-mb-md"
            >
              {{ turnoSeleccionado.estado === 'EN_ATENCION' ? 'En Atención' : 'Activo' }}
            </q-badge>

            <q-separator class="q-my-md" />

            <!-- INFORMACIÓN DE LA SUCURSAL -->
            <div class="text-left q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-7">Sucursal:</span>
                <span class="text-subtitle2 text-weight-bold text-grey-9">{{ turnoSeleccionado.sucursal?.nombre }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-7">Organismo:</span>
                <span class="text-caption text-weight-bold text-grey-8">{{ turnoSeleccionado.sucursal?.organismo }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-7">Hora de emisión:</span>
                <span class="text-caption text-weight-bold text-grey-8">{{ formatearHora(turnoSeleccionado.creadoEn) }}</span>
              </div>
            </div>

            <!-- FILA VIRTUAL -->
            <q-separator class="q-my-md" />

            <div class="text-left">
              <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs row items-center q-gutter-x-xs">
                <q-icon name="people" color="primary" size="18px" />
                <span>Turnos antes que el tuyo:</span>
              </div>

              <div v-if="cargandoFila" class="text-center q-py-sm">
                <q-spinner color="primary" size="24px" />
              </div>

              <div v-else-if="filaVirtual.length > 0" class="q-gutter-y-xs">
                <div 
                  v-for="t in filaVirtual" 
                  :key="t.id"
                  class="row items-center justify-between bg-grey-1 q-px-md q-py-xs radius-8"
                >
                  <span class="text-weight-bold text-primary font-mono">#{{ t.numero }}</span>
                  <span class="text-caption text-grey-7">
                    {{ t.estado === 'ACTIVO' ? 'En espera' : t.estado === 'EN_ATENCION' ? 'Atendiendo' : 'Finalizado' }}
                  </span>
                </div>
              </div>

              <div v-else class="text-caption text-grey-6 italic text-center q-py-sm">
                ¡Estás al frente de la fila o eres el siguiente en ser llamado!
              </div>
            </div>

            <q-banner rounded class="bg-blue-1 text-primary q-mt-lg text-left radius-12">
              <template #avatar>
                <q-icon name="info" color="primary" />
              </template>
              <div class="text-caption text-weight-bold">
                Preséntate en sala unos minutos antes de que tu número sea llamado en pantalla.
              </div>
            </q-banner>
          </q-card-section>

          <!-- ACCIÓN CANCELAR -->
          <q-card-actions align="center" class="q-pb-lg q-px-lg">
            <q-btn
              outline
              color="negative"
              label="CANCELAR ESTE TURNO"
              icon="cancel"
              class="full-width radius-12 text-bold q-py-sm"
              @click="solicitarCancelacion"
            />
          </q-card-actions>

        </q-card>
      </q-dialog>

      <!-- 2. DIÁLOGO DE CONFIRMACIÓN DE CANCELACIÓN -->
      <q-dialog v-model="modalConfirmarCancelacion" persistent>
        <q-card style="width: 100%; max-width: 380px;" class="radius-16 text-center q-pa-sm">
          <q-card-section class="q-pt-md">
            <q-icon name="warning" color="negative" size="50px" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-grey-9">
              ¿Cancelar Turno?
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs" v-if="turnoSeleccionado">
              ¿Estás seguro de que deseas cancelar el turno <strong>#{{ turnoSeleccionado.numero }}</strong> en <strong>{{ turnoSeleccionado.sucursal?.nombre }}</strong>?
            </div>
          </q-card-section>

          <q-card-actions align="around" class="q-pb-md q-px-md">
            <q-btn
              flat
              label="No, mantener"
              color="grey-8"
              class="text-bold"
              v-close-popup
            />
            <q-btn
              unelevated
              label="Sí, cancelar"
              color="negative"
              class="text-bold radius-8 q-px-md"
              :loading="cargandoCancelacion"
              @click="ejecutarCancelacion"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const misTurnos = ref([])
const modalDetalle = ref(false)
const modalConfirmarCancelacion = ref(false)
const turnoSeleccionado = ref(null)
const cargandoCancelacion = ref(false)

const filaVirtual = ref([])
const cargandoFila = ref(false)

const formatearHora = (fechaIso) => {
  if (!fechaIso) return ''
  const fecha = new Date(fechaIso)
  return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs'
}

const cargarMisTurnos = async () => {
  try {
    const response = await fetch('/api/turnos/mis-turnos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      $q.notify({ type: 'negative', message: data.error || 'No se pudieron cargar tus turnos' })
      return
    }

    misTurnos.value = data
  } catch (error) {
    console.error('Error al conectar con el servidor:', error)
    $q.notify({ type: 'negative', message: 'Error de conexión con el servidor' })
  }
}

onMounted(() => {
  cargarMisTurnos()
})

const abrirDetalle = async (turno) => {
  turnoSeleccionado.value = turno
  modalDetalle.value = true
  filaVirtual.value = []

  try {
    cargandoFila.value = true
    const response = await fetch(`/api/turnos/${turno.id}/fila-virtual`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      filaVirtual.value = data.filaVirtual || []
    }
  } catch (error) {
    console.error('Error al cargar fila virtual:', error)
  } finally {
    cargandoFila.value = false
  }
}

const solicitarCancelacion = () => {
  modalConfirmarCancelacion.value = true
}

const ejecutarCancelacion = async () => {
  if (!turnoSeleccionado.value) return

  const targetId = turnoSeleccionado.value.id
  cargandoCancelacion.value = true

  try {
    const response = await fetch(`/api/turnos/${targetId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      $q.notify({ type: 'negative', message: data.error || 'No se pudo cancelar el turno' })
      return
    }

    $q.notify({ type: 'positive', message: data.mensaje || 'Turno cancelado correctamente' })

    modalConfirmarCancelacion.value = false
    modalDetalle.value = false
    misTurnos.value = misTurnos.value.filter(t => t.id !== targetId)
    turnoSeleccionado.value = null

  } catch (error) {
    console.error('Error al cancelar el turno:', error)
    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor' })
  } finally {
    cargandoCancelacion.value = false
  }
}
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
  min-height: 100vh;
}

.radius-20 { border-radius: 20px; }
.radius-16 { border-radius: 16px; }
.radius-12 { border-radius: 12px; }
.radius-8 { border-radius: 8px; }

.badge-redondeado {
  border-radius: 50px !important;
}

.select-none { user-select: none; }
.letter-spacing-sm { letter-spacing: 1px; }
.font-mono { font-family: monospace; }
.bordered-bottom { border-bottom: 1px solid #e2e8f0; }

.card-turno {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e2e8f0;
}

.card-turno:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.numero-modal {
  font-size: 4.5rem;
  line-height: 1;
}
</style>