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
              <q-input v-model="nuevaFechaExcepcion" type="date" dense outlined style="width: 180px;" :disable="guardando" />
              <q-btn label="Agregar" color="primary" unelevated dense :disable="guardando" @click="agregarExcepcion" />
            </div>

            <!-- Lista de excepciones cargadas -->
            <div v-for="fecha in excepciones" :key="fecha" class="row items-center justify-between bg-red-1 text-red-9 q-pa-sm q-mb-xs" style="border-radius: 20px;">
              <span>{{ fecha }}</span>
              <q-btn flat round dense icon="close" color="red-9" :disable="guardando" @click="quitarExcepcion(fecha)" />
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const sucursalStore = useSucursalStore()

const API_URL = 'http://localhost:3000/api/configuracion-horarios'

const cargando = ref(false)
const guardando = ref(false)

const horarios = ref([
  { dia: 'Lunes', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Martes', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Miércoles', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Jueves', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Viernes', atiende: true, desde: '09:00', hasta: '17:00' },
  { dia: 'Sábado', atiende: true, desde: '09:00', hasta: '13:00' },
  { dia: 'Domingo', atiende: false, desde: '09:00', hasta: '17:00' }
])

const margenCorte = ref(15)
const umbralPocoConcurrido = ref(10)
const umbralConcurrido = ref(20)
const topeEmisionDiaria = ref(100)

const nuevaFechaExcepcion = ref('')
const excepciones = ref(['2026-08-25'])

// GET: Cargar configuración desde el backend
const cargarConfiguracion = async () => {
  cargando.value = true
  try {
    /*
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Error al obtener la configuración')
    const data = await response.json()

    horarios.value = data.horarios
    margenCorte.value = data.margenCorte
    umbralPocoConcurrido.value = data.umbralPocoConcurrido
    umbralConcurrido.value = data.umbralConcurrido
    topeEmisionDiaria.value = data.topeEmisionDiaria
    sucursalStore.cantidadCajas = data.cantidadCajas
    excepciones.value = data.excepciones || []
    */
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

// PUT / POST: Guardar configuración en el backend
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
    const payload = {
      horarios: horarios.value,
      margenCorte: margenCorte.value,
      umbralPocoConcurrido: umbralPocoConcurrido.value,
      umbralConcurrido: umbralConcurrido.value,
      topeEmisionDiaria: topeEmisionDiaria.value,
      cantidadCajas: sucursalStore.cantidadCajas,
      excepciones: excepciones.value
    }

    console.log('Enviando datos al servidor:', payload)

    /*
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Error al guardar la configuración')
    */

    $q.notify({
      type: 'positive',
      message: 'Configuración guardada exitosamente'
    })
  } catch (error) {
    console.error('Error al guardar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al intentar guardar los cambios'
    })
  } finally {
    guardando.value = false
  }
}

const agregarExcepcion = () => {
  if (nuevaFechaExcepcion.value) {
    if (!excepciones.value.includes(nuevaFechaExcepcion.value)) {
      excepciones.value.push(nuevaFechaExcepcion.value)
      nuevaFechaExcepcion.value = ''
    }
  }
}

const quitarExcepcion = (fecha) => {
  excepciones.value = excepciones.value.filter(f => f !== fecha)
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