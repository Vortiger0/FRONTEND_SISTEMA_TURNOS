<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo q-pa-md">
    <div class="max-width-container margin-auto q-pt-md">
      
      <!-- CABECERA: BOTÓN MIS TURNOS & LOGOUT -->
      <div class="row items-center justify-between q-mb-md">
        <q-btn
          label="MIS TURNOS"
          icon="confirmation_number"
          unelevated
          class="btn-mis-turnos-blanco text-bold radius-12 q-px-md"
          to="/misturnos"
        />

        <q-btn
          flat
          round
          dense
          color="white"
          icon="logout"
          @click="confirmarLogout = true"
        >
          <q-tooltip>Cerrar sesión</q-tooltip>
        </q-btn>
      </div>

      <!-- GRID DE SEDES (CATÁLOGO) -->
      <div class="row q-col-gutter-md">
        <div
          v-for="sede in sedesFiltradas"
          :key="sede.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card
            class="cursor-pointer card-hover card-redondeada shadow-2 text-center q-pa-sm"
            :style="{ 'border-left': `6px solid ${colorEstadoHex(sede.estado)}` }"
            @click="abrirDetalle(sede)"
          >
            <q-card-section class="q-py-md">
              <div class="text-subtitle1 text-weight-bold q-mb-md text-grey-9">
                ({{ sede.nombre }})
              </div>
              
              <!-- INDICADOR DE OCUPACIÓN Y TURNOS -->
              <div class="row items-center justify-center q-gutter-x-xs">
                <q-icon name="fiber_manual_record" :color="colorEstado(sede.estado)" size="12px" />
                <span class="text-caption text-weight-medium">
                  {{ sede.estado }}: {{ sede.turnos }} turnos
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

    </div>

    <!-- 1. VISTA DETALLADA DE SUCURSAL (VENTANA EMERGENTE) -->
    <q-dialog v-model="mostrarDetalle">
      <q-card class="q-pa-md max-width-detalle width-100 radius-16">
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6 text-weight-bold text-uppercase text-grey-9">
            Vista Detallada
          </div>
          <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
        </div>

        <div class="row q-col-gutter-md items-center">
          <!-- MAPA -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="bg-grey-3 flex flex-center radius-12" style="height: 200px;">
              <div class="text-h5 text-weight-bolder text-grey-6">MAPA</div>
            </q-card>
          </div>

          <!-- DATOS DE LA SEDE -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md bg-grey-1 radius-12">
              <div class="text-subtitle1 text-weight-bold text-center text-uppercase q-mb-sm text-primary">
                {{ sedeSeleccionada?.nombre }}
              </div>
              <q-separator class="q-mb-sm" />
              
              <div class="text-caption text-grey-9 q-gutter-y-xs">
                <div><strong>Dirección:</strong> {{ sedeSeleccionada?.direccion }}</div>
                <div><strong>Horarios:</strong> {{ sedeSeleccionada?.horarios }}</div>
                <div><strong>Teléfono:</strong> {{ sedeSeleccionada?.telefono }}</div>
                <div><strong>Redes:</strong> {{ sedeSeleccionada?.redes }}</div>
              </div>
            </q-card>
          </div>
        </div>

        <q-card-actions align="center" class="q-pt-lg q-pb-xs">
          <q-btn
            label="Sacar número"
            color="primary"
            size="lg"
            unelevated
            class="q-px-xl text-bold btn-action"
            @click="solicitarTurno"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 2. VENTANA EMERGENTE: ADVERTENCIA Y CONFIRMACIÓN DE TURNO -->
    <q-dialog v-model="mostrarConfirmacionTurno" persistent>
      <q-card class="q-pa-md text-center radius-16" style="max-width: 450px; width: 100%;">
        
        <!-- Enlace para volver a la vista detallada -->
        <div class="row items-center q-mb-md">
          <q-btn 
            flat 
            dense 
            no-caps 
            icon="arrow_back" 
            label="VOLVER A SEDES" 
            color="primary" 
            class="text-weight-bold" 
            @click="volverADetalle" 
          />
        </div>

        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey-7">Solicitud de turno para:</div>
          <div class="text-h5 text-weight-bolder text-primary q-mb-md">
            {{ sedeSeleccionada?.nombre }}
          </div>

          <q-separator color="grey-3" class="q-mb-lg" />

          <!-- Icono de advertencia -->
          <q-icon name="warning" color="warning" size="72px" class="q-mb-sm" />

          <div class="text-h6 text-weight-bolder text-black q-mb-xs">
            Atención
          </div>

          <div class="text-body2 text-grey-8 q-mt-sm">
            ¿Seguro que quiere sacar un número para colocarse en la fila?
          </div>
        </q-card-section>

        <!-- Acciones del modal -->
        <q-card-actions align="around" class="q-pt-md q-pb-sm">
          <q-btn 
            flat 
            label="RECHAZAR" 
            color="negative" 
            class="text-weight-bold" 
            v-close-popup 
          />
          <q-btn 
            label="ACEPTAR" 
            color="primary" 
            unelevated 
            class="text-weight-bold q-px-lg" 
            :loading="procesandoTurno"
            @click="confirmarTurno" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 3. DIÁLOGO DE CONFIRMACIÓN DE LOGOUT -->
    <q-dialog v-model="confirmarLogout">
      <q-card class="text-center q-pa-sm radius-16" style="max-width: 320px; width: 100%;">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-grey-9">
            ¿Seguro que quiere salir?
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Se cerrará tu sesión actual.
          </div>
        </q-card-section>

        <q-card-actions align="around">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn label="Salir" color="negative" unelevated @click="cerrarSesion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store';

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const busqueda = ref('')
const sedeSeleccionada = ref(null)

// Variables de estado para los modales
const mostrarDetalle = ref(false)
const mostrarConfirmacionTurno = ref(false)
const confirmarLogout = ref(false)
const procesandoTurno = ref(false)

const sedes = ref([
  { id: 1, nombre: 'Abitab', estado: 'Concurrido', turnos: 18, direccion: 'Aparicio Saravia 598', horarios: '09:00 - 18:00', telefono: '2900 0000', redes: '@abitab_oficial' },
  { id: 2, nombre: 'Abitab centro', estado: 'Muy concurrido', turnos: 30, direccion: 'Plaza Independencia 567', horarios: '08:30 - 19:00', telefono: '2901 1111', redes: '@abitab_centro' },
  { id: 3, nombre: 'Abitab Dorado', estado: 'Poco concurrido', turnos: 13, direccion: 'Av. Rivera 2420', horarios: '09:00 - 19:00', telefono: '2902 3333', redes: '@abitab_dorado' },
  { id: 4, nombre: 'Redpagos Terminal', estado: 'Poco concurrido', turnos: 8, direccion: 'Tres Cruces Nivel 2', horarios: '07:00 - 22:00', telefono: '2903 4444', redes: '@redpagos_terminal' },
  { id: 5, nombre: 'Farmacia Hospital', estado: 'Concurrido', turnos: 15, direccion: 'Av. Italia 2870', horarios: '08:00 - 20:00', telefono: '2487 0000', redes: '@farmacia_hospital' }
])

const sedesFiltradas = computed(() => {
  if (!busqueda.value) return sedes.value
  return sedes.value.filter(s => 
    s.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

const abrirDetalle = (sede) => {
  sedeSeleccionada.value = sede
  mostrarDetalle.value = true
}

const solicitarTurno = () => {
  mostrarDetalle.value = false
  mostrarConfirmacionTurno.value = true
}

const volverADetalle = () => {
  mostrarConfirmacionTurno.value = false
  mostrarDetalle.value = true
}

const confirmarTurno = () => {
  procesandoTurno.value = true
  
  setTimeout(() => {
    procesandoTurno.value = false
    mostrarConfirmacionTurno.value = false
    
    if ($q && typeof $q.notify === 'function') {$q.notify({
        type: 'positive',
        message: 'Turno confirmado correctamente'
      })
    }

    // Redirecciona directamente a la vista /misturnos
    router.push('/misturnos')
  }, 200)
}

const colorEstado = (estado) => {
  switch (estado) {
    case 'Poco concurrido': return 'positive'
    case 'Concurrido': return 'warning'
    case 'Muy concurrido': return 'negative'
    default: return 'grey'
  }
}

const colorEstadoHex = (estado) => {
  switch (estado) {
    case 'Poco concurrido': return '#21ba45'
    case 'Concurrido': return '#f2c037'
    case 'Muy concurrido': return '#c10015'
    default: return '#9e9e9e'
  }
}

const cerrarSesion = () => {
  authStore.cerrarSesion()
  router.push('/login')
}
</script>

<style scoped>
.max-width-container { max-width: 900px; }
.max-width-detalle { max-width: 650px; }
.width-100 { width: 100%; }
.margin-auto { margin-left: auto; margin-right: auto; }
.card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important; }
.card-redondeada { border-radius: 15px; overflow: hidden; }
.radius-16 { border-radius: 16px; }
.radius-12 { border-radius: 12px; }
.radius-8 { border-radius: 8px; }
.btn-action { border-radius: 10px; }

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
  min-height: 100vh;
}

/* ESTILO PARA EL BOTÓN MIS TURNOS */
.btn-mis-turnos-blanco {
  background-color: #ffffff !important;
  color: #1c4779 !important;
  font-weight: 800 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-mis-turnos-blanco:hover {
  transform: translateY(-2px);
  background-color: #f8fafc !important;
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.35) !important;
}

.btn-mis-turnos-blanco:active {
  transform: translateY(0);
}
</style>