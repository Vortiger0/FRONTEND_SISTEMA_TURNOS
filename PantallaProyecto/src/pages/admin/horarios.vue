<route lang="yaml">
meta:
  requiereAuth: true
  roles: ["ADMIN"]
</route>

<template>
  <q-page class="fondo q-pa-md flex justify-center">
    <div style="width: 100%; max-width: 500px;">
      <q-card class="shadow-3" style="border-radius: 16px; overflow: hidden;">

        <!-- Spinner de carga inicial -->
        <div v-if="cargando" class="flex flex-center q-pa-xl">
          <q-spinner color="primary" size="40px" />
        </div>

        <template v-else>
          <!-- Horarios semanales -->
          <q-card-section>
            <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Horario de atención</div>

            <!-- Una fila por cada día -->
            <div v-for="horario in horarios" :key="horario.dia" class="row items-center q-mb-sm q-gutter-x-sm">
              <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs" style="width: 90px;">{{ horario.dia }}</div>

              <q-checkbox v-model="horario.atiende" :disable="guardando" />

              <template v-if="horario.atiende">
                <q-input v-model="horario.desde" type="time" dense style="width: 110px;" :disable="guardando" />
                <span>a</span>
                <q-input v-model="horario.hasta" type="time" dense style="width: 110px;" :disable="guardando" />
              </template>
            </div>
          </q-card-section>

          <q-separator />

          <!-- Margen de corte -->
          <q-card-section>
            <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-md">Dejar de emitir turnos nuevos (minutos antes del cierre)</div>
            <q-select
              v-model="margenCorte"
              :options="[0, 5, 10, 15, 20, 30]"
              dense
              outlined
              style="max-width: 220px;" 
              :option-label="(val) => `${val} min antes`"
              :disable="guardando"
            >
              <template v-slot:selected>
                {{ margenCorte }} min antes
              </template>
            </q-select>
          </q-card-section>

          <q-separator />

          <!-- Indicador de concurrencia -->
          <q-card-section>
            <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-md">Indicador de concurrencia</div>

            <div class="row items-center q-gutter-x-sm q-mb-xs">
              <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs" style="width: 140px;">Poco concurrido:</div>
              <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">Hasta</span>
              <q-input 
                v-model.number="umbralPocoConcurrido" 
                type="number" 
                dense 
                outlined 
                style="width: 90px;" 
                min="0" 
                max="9999"
                :disable="guardando"
                @keydown="bloquearSimbolos"
                :rules="[
                  val => val >= 0 || 'No puede ser menor a 0',
                  val => val <= 9999 || 'El valor es demasiado alto'
                ]" 
              />
              <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">personas</span>
            </div>

            <div class="row items-center q-gutter-x-sm q-mb-xs">
              <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs" style="width: 140px;">Concurrido:</div>
              <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">Hasta</span>
              <q-input 
                v-model.number="umbralConcurrido" 
                type="number" 
                dense 
                outlined 
                style="width: 90px;" 
                min="0" 
                max="9999"
                :disable="guardando"
                @keydown="bloquearSimbolos"
                :rules="[
                  val => val >= 0 || 'No puede ser menor a 0',
                  val => val <= 9999 || 'El valor es demasiado alto'
                ]" 
              />
              <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">personas</span>
            </div>

            <div class="text-caption text-grey-7">
              Muy concurrido: más de {{ umbralConcurrido }} (valor automático)
            </div>

            <!-- Mensaje de error si Concurrido <= Poco concurrido -->
            <div v-if="umbralConcurrido <= umbralPocoConcurrido" class="text-caption text-negative q-mt-xs">
              "Concurrido" debe ser mayor que "Poco concurrido"
            </div>
          </q-card-section>

          <q-separator />

          <!-- Tope de emisión diaria de turnos -->
          <q-card-section class="q-py-sm">
            <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Tope de emisión diaria</div>
            <div class="row items-center q-gutter-x-sm">
              <q-input
                v-model.number="topeEmisionDiaria"
                type="number"
                dense
                outlined
                style="width: 100px;"
                min="0"
                max="9999"
                :disable="guardando"
                @keydown="bloquearSimbolos"
                :rules="[
                  val => val >= 0 || 'No puede ser menor a 0',
                  val => val <= 9999 || 'El valor es demasiado alto'
                ]"
              />
              <span class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">turnos</span>
            </div>
          </q-card-section>

          <!-- Cantidad de cajas -->
          <q-card-section class="q-py-none">
            <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Cantidad de cajas en la sucursal</div>
            <div class="row items-center q-mb-md">
              <q-input
                v-model.number="sucursalStore.cantidadCajas"
                type="number"
                dense
                outlined
                style="max-width: 150px;"
                min="1"
                :disable="guardando"
                @keydown="bloquearSimbolos"
                :rules="[
                  val => val >= 1 || 'No puede ser menor a 1',
                  val => val <= 9999 || 'El valor es demasiado alto'
                ]"
              />
            </div>
          </q-card-section>

          <!-- Excepciones / Feriados -->
          <q-card-section class="q-py-none">
            <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-sm">Feriados/días cerrados</div>

            <div class="row items-center q-gutter-x-sm q-mb-sm">
              <q-input v-model="nuevaFechaExcepcion" type="date" dense outlined style="width: 180px;" :disable="guardando || agregandoExcepcion" />
              <q-btn label="Agregar" color="primary" unelevated dense :loading="agregandoExcepcion" :disable="guardando || !nuevaFechaExcepcion" @click="agregarExcepcion" />
            </div>

            <!-- Lista de excepciones cargadas -->
            <div v-for="ex in excepciones" :key="ex.id || ex.fecha" class="row items-center justify-between bg-red-1 text-red-9 q-pa-sm q-mb-xs" style="border-radius: 20px;">
              <span>{{ formatearFecha(ex.fecha) }}</span>
              <q-btn flat round dense icon="close" color="red-9" :disable="guardando" @click="quitarExcepcion(ex)" />
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md">
            <q-btn 
              label="Guardar Configuración" 
              color="primary" 
              unelevated 
              rounded
              class="full-width text-weight-bold" 
              :loading="guardando"
              :disable="umbralConcurrido <= umbralPocoConcurrido"
              @click="guardarConfiguracion" 
            />
          </q-card-actions>
        </template>

      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useSucursalStore } from '../../stores/sucursal-store'
import { useAuthStore } from '../../stores/auth-store'
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const sucursalStore = useSucursalStore()
const authStore = useAuthStore()

const cargando = ref(false)
const guardando = ref(false)
const agregandoExcepcion = ref(false)

const horarios = ref([
  { dia: 'Lunes', diaSemana: 'LUNES', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Martes', diaSemana: 'MARTES', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Miércoles', diaSemana: 'MIERCOLES', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Jueves', diaSemana: 'JUEVES', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Viernes', diaSemana: 'VIERNES', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Sábado', diaSemana: 'SABADO', atiende: true, desde: '09:00', hasta: '13:00' },
  { dia: 'Domingo', diaSemana: 'DOMINGO', atiende: false, desde: '09:00', hasta: '17:00' }
])

const margenCorte = ref(15)
const umbralPocoConcurrido = ref(10)
const umbralConcurrido = ref(20)
const topeEmisionDiaria = ref(100)

const nuevaFechaExcepcion = ref('')
const excepciones = ref([])

// Función auxiliar para extraer solo "HH:mm" de una fecha ISO o string de hora
const extraerHora = (cadenaHora) => {
  if (!cadenaHora) return '09:00'
  if (cadenaHora.includes('T')) {
    const timePart = cadenaHora.split('T')[1]
    return timePart.substring(0, 5) // "09:00"
  }
  return cadenaHora.substring(0, 5)
}

//función para mostrar una fecha en formato legible (dd/mm/aaaa)
const formatearFecha = (fechaIso) => {
  if (!fechaIso) return ''
  const fecha = new Date(fechaIso)
  return fecha.toLocaleDateString('es-UY', {timeZone: 'UTC' })

}

// GET: Cargar configuración desde el backend
const cargarConfiguracion = async () => {
  cargando.value = true
  try {
    const response = await fetch('/api/admin/horarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) throw new Error('Error al obtener la configuración')
    const data = await response.json()

    if (data.horarios && Array.isArray(data.horarios)) {
      horarios.value = data.horarios.map(h => ({
        ...h,
        dia: h.diaSemana.charAt(0) + h.diaSemana.slice(1).toLowerCase(), // Reconstruye etiqueta visual si es necesario
        desde: extraerHora(h.horaDesde || h.desde),
        hasta: extraerHora(h.horaHasta || h.hasta)
      }))
    }

    if (data.margenCorte !== undefined) margenCorte.value = data.margenCorte
    if (data.umbralPocoOcupado !== undefined) umbralPocoConcurrido.value = data.umbralPocoOcupado
    if (data.umbralOcupado !== undefined) umbralConcurrido.value = data.umbralOcupado
    if (data.maxTurnosDia !== undefined) topeEmisionDiaria.value = data.maxTurnosDia
    if (data.cantidadCajas !== undefined) sucursalStore.cantidadCajas = data.cantidadCajas
    
    excepciones.value = data.excepciones || []

  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar la configuración de horarios'
    })
  } finally {
    cargando.value = false
  }
}

// PUT: Guardar configuración general
const guardarConfiguracion = async () => {
  if (umbralConcurrido.value <= umbralPocoConcurrido.value) {
    $q.notify({
      type: 'warning',
      message: 'Revisa los umbrales de concurrencia'
    })
    return
  }

  guardando.value = true
  try {
    const horariosFormateados = horarios.value.map(h => ({
      diaSemana: h.diaSemana,
      atiende: h.atiende,
      horaDesde: h.desde,
      horaHasta: h.hasta
    }))

    const payload = {
      horarios: horariosFormateados,
      margenCorte: margenCorte.value,
      umbralPocoOcupado: umbralPocoConcurrido.value,
      umbralOcupado: umbralConcurrido.value,
      maxTurnosDia: topeEmisionDiaria.value,
      cantidadCajas: sucursalStore.cantidadCajas
    }

    const response = await fetch('/api/admin/horarios', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al guardar la configuración')

    $q.notify({
      type: 'positive',
      message: 'Configuración guardada exitosamente'
    })
  } catch (error) {
    console.error('Error al guardar datos:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al intentar guardar los cambios'
    })
  } finally {
    guardando.value = false
  }
}

// POST: Agregar excepción de inmediato
const agregarExcepcion = async () => {
  if (!nuevaFechaExcepcion.value) return

  agregandoExcepcion.value = true
  try {
    const response = await fetch('/api/admin/excepciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ fecha: nuevaFechaExcepcion.value })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al agregar la excepción')

    excepciones.value.push(data)
    nuevaFechaExcepcion.value = ''

    $q.notify({
      type: 'positive',
      message: 'Feriado agregado correctamente'
    })
  } catch (error) {
    console.error('Error al agregar excepción:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No se pudo agregar el feriado'
    })
  } finally {
    agregandoExcepcion.value = false
  }
}

// DELETE: Eliminar excepción de inmediato por ID
const quitarExcepcion = async (ex) => {
  const idExcepcion = ex.id
  if (!idExcepcion) {
    excepciones.value = excepciones.value.filter(item => item !== ex)
    return
  }

  try {
    const response = await fetch(`/api/admin/excepciones/${idExcepcion}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Error al eliminar la excepción')
    }

    excepciones.value = excepciones.value.filter(item => item.id !== idExcepcion)

    $q.notify({
      type: 'positive',
      message: 'Feriado eliminado'
    })
  } catch (error) {
    console.error('Error al eliminar excepción:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No se pudo eliminar el feriado'
    })
  }
}

const bloquearSimbolos = (event) => {
  if (['-','_','.', ',', 'e', 'E'].includes(event.key)) {
    event.preventDefault()
  }
}

onMounted(() => {
  cargarConfiguracion()
})
</script>

<style scoped>
:deep(.q-field--outlined .q-field__control) {
  border-radius: 15px !important;
  border-color: #636868;
}

:deep(.q-field__native) {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #4b4a4a !important;
}

.row.items-center {
  padding-left: 12px;
}

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>