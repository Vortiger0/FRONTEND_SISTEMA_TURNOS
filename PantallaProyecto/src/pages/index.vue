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
          @click="mostrarMisturnos = true"
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
                  {{ textoVisible(sede.estado) }}: {{ sede.turnos }} turnos
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

    <!-- 4. vista de mis turnos (ventana emergente)-->
     <q-dialog v-model="mostrarMisturnos">
      <q-card class="q-pa-md max-width-detalle width-100 radius-16">
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6 text-weight-bold text-uppercase text-grey-9">
            Mis Turnos
          </div>

          <q-btn flat round dense icon="close" color="grey-7" v-close-popup />
        </div>

        <!-- Contenido de la vista detallada de mis turnos -->
         <div class="q-pt-xs">
         <Misturnos 
         @cerrar="mostrarMisturnos = false" 
         @seleccionarTurno="alSeleccionarTurno"
         />

          <div class="lista-turnos">
            <div class="q-pa-md">
              <div v-if="misTurnos && misTurnos.length > 0" class="q-gutter-y-sm">
            
              <q-card
              v-for="(turno, index) in misTurnos"
              :key="turno.id || index"
              v-ripple
              flat
              bordered
              class="card-turno cursor-pointer radius-16 q-pa-sm"
              @click="abrirDetalleTurno(turno)"
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
          </div>
          </div>
        </div>

      </q-card>
    </q-dialog>

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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store';

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const busqueda = ref('')
const sedeSeleccionada = ref(null)

const modalDetalle = ref(false)
const modalConfirmarCancelacion = ref(false)
const turnoSeleccionado =ref(null)

// Variables de estado para los modales
const mostrarDetalle = ref(false)
const mostrarConfirmacionTurno = ref(false)
const confirmarLogout = ref(false)
const procesandoTurno = ref(false)
const mostrarMisturnos = ref(false)

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

//array que contiene las sucursales
const sedes = ref([])
//llama al endpoint de las sucursales
const cargarSucursales = async() => {
  try {
    const response = await fetch ('/api/sucursales')
    const data = await response.json()

    if(!response.ok) {
      $q.notify({type: 'negative', message: 'No se pudieron cargar las sucursales' })
      return
    }
    //el back devuelve cada sucursal con sus datos usando los nombres que el template ya espera
    sedes.value = data.map((s)  => ({
      id: s.id,
      nombre: s.nombre,
      estado: s.concurrencia,
      turnos: s.turnosPendientes,
      direccion: s.direccion,
      organismo: s.organismo
    })) 
   } catch (error) {
    console.error('Error al cargar sucursales:', error)
    $q.notify({type: 'negative', message: 'No se pudo conectar con el servidor'})

  }
}

//es un "hook" (gancho) de vue que ejecuta apenas la pantalla termina de cargar en el navegador
onMounted(() => {
  cargarSucursales()
} )

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

const confirmarTurno = async () => {
 procesandoTurno.value = true

 try {
  //manda el pedido al backend, el authorization lleva el token guardado en la store
  // el body manda el id de la sucursal que la persona ya había elegido
  const response = await fetch ('/api/turnos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`

    },
    body: JSON.stringify({ sucursalId: sedeSeleccionada.value.id })
  })
  
  const data = await response.json()

  if (!response.ok) {
    $q.notify({ type: 'negative', message: data.error || 'No se pudo sacar el turno'})
    return
  }

  mostrarConfirmacionTurno.value = false
  $q.notify({type: 'positive', message: `Turno confirmado. Tu número es el ${data.numero}` })
  mostrarMisturnos.value = true
  } catch (error) {
    console.error('Error al sacar turno:', error)
    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor'  })
} finally {
  procesandoTurno.value = false
}
}

const textoVisible = (estado) => {
  switch (estado) {
    case 'Poco ocupado': return 'Poco concurrido'
    case 'Ocupado': return 'Concurrido'
    case 'Muy ocupado': return 'Muy concurrido'
    default: return estado
  }
}

const colorEstado = (estado) => {
  switch (estado) {
    case 'Poco ocupado': return 'positive'
    case 'Ocupado': return 'warning'
    case 'Muy ocupado': return 'negative'
    default: return 'grey'
  }
}

const colorEstadoHex = (estado) => {
  switch (estado) {
    case 'Poco ocupado': return '#21ba45'
    case 'Ocupado': return '#f2c037'
    case 'Muy ocupado': return '#c10015'
    default: return '#9e9e9e'
  }
}

const cerrarSesion = () => {
  authStore.cerrarSesion()
  router.push('/login')
}

const solicitarCancelacion = () => {
  modalDetalle.value = false
  // Abrimos directamente el dialogo de confirmació escrito en el template
  modalConfirmarCancelacion.value = true
}

const abrirDetalleTurno = (turno) => {
  turnoSeleccionado.value = turno

  mostrarMisturnos.value = false

  modalDetalle.value = true
}

const ejecutarCancelacion = () => {
  if (!turnoSeleccionado.value) return

  const targetId = turnoSeleccionado.value.id

  //1.Ocultar los dos modales
  modalConfirmarCancelacion.value = false
  modalDetalle.value = false

  //2. remover el turno filtrando el array reactivo
  misTurnos.value = misTurnos.value.filter(t => t.id !== targetId)
  turnoSeleccionado.value = null

  // 3. redirigir a la pantalla inicial '/'
  router.push('/')
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