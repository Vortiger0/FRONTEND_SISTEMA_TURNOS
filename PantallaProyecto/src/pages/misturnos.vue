<route lang="yaml">
meta:
  layout: false
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
                    <q-icon :name="turno.icono || 'storefront'" size="16px" />
                    <span>{{ turno.sucursal }}</span>
                  </div>
                  <div class="text-subtitle1 text-weight-bolder text-grey-9 q-mt-xs">
                    {{ turno.servicio }}
                  </div>
                  <div class="text-caption text-grey-7">
                    <q-icon name="place" size="14px" class="q-mr-xs" />
                    {{ turno.direccion }}
                  </div>
                </div>

                <!-- NÚMERO DE TURNO -->
                <div class="col-4 text-right">
                  <q-badge
                    :color="turno.estado === 'Llamando' ? 'positive' : 'blue-2'"
                    :text-color="turno.estado === 'Llamando' ? 'white' : 'primary'"
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
              :color="turnoSeleccionado.estado === 'Llamando' ? 'positive' : 'primary'"
              class="q-px-lg q-py-xs text-caption text-weight-bold badge-redondeado q-mb-md"
            >
              {{ turnoSeleccionado.estado }}
            </q-badge>

            <q-separator class="q-my-md" />

            <!-- INFORMACIÓN DE LA SUCURSAL -->
            <div class="text-left q-gutter-y-sm">
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-7">Sucursal:</span>
                <span class="text-subtitle2 text-weight-bold text-grey-9">{{ turnoSeleccionado.sucursal }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-7">Dirección:</span>
                <span class="text-caption text-weight-bold text-grey-8">{{ turnoSeleccionado.direccion }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-7">Servicio:</span>
                <span class="text-caption text-weight-bold text-grey-8">{{ turnoSeleccionado.servicio }}</span>
              </div>
              <div class="row items-center justify-between">
                <span class="text-caption text-grey-7">Hora de emisión:</span>
                <span class="text-caption text-weight-bold text-grey-8">{{ turnoSeleccionado.horaEmision }}</span>
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

      <!-- 2. DIÁLOGO DE CONFIRMACIÓN DE CANCELACIÓN (COMPONENTIZADO) -->
      <q-dialog v-model="modalConfirmarCancelacion" persistent>
        <q-card style="width: 100%; max-width: 380px;" class="radius-16 text-center q-pa-sm">
          <q-card-section class="q-pt-md">
            <q-icon name="warning" color="negative" size="50px" class="q-mb-sm" />
            <div class="text-h6 text-weight-bold text-grey-9">
              ¿Cancelar Turno?
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs" v-if="turnoSeleccionado">
              ¿Estás seguro de que deseas cancelar el turno <strong>#{{ turnoSeleccionado.numero }}</strong> en <strong>{{ turnoSeleccionado.sucursal }}</strong>?
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
              @click="ejecutarCancelacion"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// LISTA DE TURNOS
const misTurnos = ref([
  {
    id: 1,
    sucursal: 'Abitab Centro',
    direccion: 'Aparicio Saravia 598',
    servicio: 'Cobros y Retiros',
    numero: 28,
    icono: 'storefront',
    estado: 'En Espera',
    horaEmision: '14:32 hs'
  },
  {
    id: 2,
    sucursal: 'Farmacia Hospital',
    direccion: 'Av. Brasil 1234',
    servicio: 'Entrega de Medicamentos',
    numero: 14,
    icono: 'local_pharmacy',
    estado: 'En Espera',
    horaEmision: '14:45 hs'
  }
])

const modalDetalle = ref(false)
const modalConfirmarCancelacion = ref(false)
const turnoSeleccionado = ref(null)

const abrirDetalle = (turno) => {
  turnoSeleccionado.value = turno
  modalDetalle.value = true
}

const solicitarCancelacion = () => {
  // Abrimos directamente el diálogo de confirmación escrito en el template
  modalConfirmarCancelacion.value = true
}

const ejecutarCancelacion = () => {
  if (!turnoSeleccionado.value) return

  const targetId = turnoSeleccionado.value.id

  // 1. Ocultar los dos modales
  modalConfirmarCancelacion.value = false
  modalDetalle.value = false

  // 2. Remover el turno filtrando el array reactivo
  misTurnos.value = misTurnos.value.filter(t => t.id !== targetId)
  turnoSeleccionado.value = null

  // 3. Redirigir a la pantalla inicial '/'
  router.push('/')
}
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
  min-height: 100vh;
}

.radius-20 {
  border-radius: 20px;
}

.radius-16 {
  border-radius: 16px;
}

.radius-12 {
  border-radius: 12px;
}

.radius-8 {
  border-radius: 8px;
}

.badge-redondeado {
  border-radius: 50px !important;
}

.select-none {
  user-select: none;
}

.letter-spacing-sm {
  letter-spacing: 1px;
}

.font-mono {
  font-family: monospace;
}

.bordered-bottom {
  border-bottom: 1px solid #e2e8f0;
}

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