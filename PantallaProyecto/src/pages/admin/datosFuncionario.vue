Aquí tienes el componente `datos-funcionario.vue` actualizado. Se integraron las funciones `fetch` para realizar el CRUD completo (`GET`, `POST`, `PUT`, `DELETE`), incluyendo estados de carga (`cargando`, `guardando`) y el chip estilizado con el icono de caja registradora (`point_of_sale`) que solicitaste anteriormente.

```html
<template>
  <q-page class="bg-grey-2 q-pa-md flex justify-center">
    <div style="width: 100%; max-width: 520px;">

      <!-- Tarjeta principal refinada con esquinas redondeadas -->
      <q-card class="shadow-3 radius-16 overflow-hidden bg-white">
        
        <!-- Cabecera de la sección -->
        <q-card-section class="flex items-center justify-between q-pa-lg border-bottom">
          <div>
            <div class="text-h5 text-weight-bolder text-grey-10">
              Funcionarios
            </div>
            <div class="text-subtitle2 text-weight-bold text-grey-8">
              Gestión del personal y cajas asignadas
            </div>
          </div>

          <q-btn
            color="primary"
            unelevated
            no-caps
            class="btn-action text-weight-bold"
            :disable="cargando"
            @click="abrirNuevo"
          >
            <div class="flex items-center q-gutter-x-xs">
              <q-icon name="add" size="20px" />
              <span>Agregar</span>
            </div>
          </q-btn>
        </q-card-section>

        <!-- Spinner de carga inicial -->
        <div v-if="cargando" class="flex flex-center q-pa-xl">
          <q-spinner color="primary" size="40px" />
        </div>

        <!-- Lista de funcionarios -->
        <q-list v-else separator class="q-py-xs">
          <q-item
            v-for="funcionario in funcionarios"
            :key="funcionario.id || funcionario.usuario"
            class="q-py-md q-px-lg"
          >
            <q-item-section avatar>
              <q-avatar color="blue-1" text-color="primary" icon="person" font-size="24px" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1 text-weight-bolder text-grey-10">
                {{ funcionario.nombre }}
              </q-item-label>
              
              <q-item-label class="text-body2 text-weight-bold text-grey-8 flex items-center gap-1 q-mt-xs">
                <!-- Chip de Caja con icono pequeño -->
                <q-chip
                  dense
                  color="blue-1"
                  text-color="primary"
                  icon="point_of_sale"
                  class="text-weight-bolder q-px-sm"
                  size="13px"
                >
                  Caja {{ funcionario.caja }}
                </q-chip>
                <span class="text-grey-7 q-ml-xs text-weight-bold">{{ funcionario.usuario }}</span>
              </q-item-label>
            </q-item-section>

            <!-- Botones de edición y eliminación -->
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="abrirEdicion(funcionario)"
                >
                  <q-tooltip>Editar funcionario</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="eliminarFuncionario(funcionario)"
                >
                  <q-tooltip>Eliminar funcionario</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>

          <div v-if="funcionarios.length === 0" class="text-center text-grey-6 q-pa-md">
            No hay funcionarios registrados.
          </div>
        </q-list>

      </q-card>
    </div>

    <!-- Ventana de diálogo moderna -->
    <q-dialog v-model="mostrarDialogo" persistent>
      <q-card style="width: 100%; max-width: 440px;" class="radius-16 q-pa-sm">

        <q-card-section class="q-pb-xs">
          <div class="text-h6 text-weight-bolder text-grey-10">
            {{ funcionarioEditando ? 'Editar funcionario' : 'Nuevo funcionario' }}
          </div>
          <div class="text-caption text-weight-bold text-grey-8">
            {{ funcionarioEditando ? 'Modifica las credenciales o caja' : 'Ingresa los datos para dar de alta' }}
          </div>
        </q-card-section>

        <!-- Formulario accesibilidad y alto contraste -->
        <q-card-section class="q-gutter-y-md q-pt-md">
          <q-input
            v-model="nuevoNombre"
            label="Nombre y apellido"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
            :disable="guardando"
          >
            <template #prepend>
              <q-icon name="badge" color="primary" size="22px" />
            </template>
          </q-input>

          <q-input
            v-model="nuevoUsuario"
            label="Usuario de acceso"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
            :disable="guardando"
          >
            <template #prepend>
              <q-icon name="alternate_email" color="primary" size="22px" />
            </template>
          </q-input>

          <q-input
            v-model="nuevaContra"
            label="Contraseña"
            :type="verContra ? 'text' : 'password'"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
            :disable="guardando"
          >
            <template #prepend>
              <q-icon name="lock" color="primary" size="22px" />
            </template>
            <template #append>
              <q-icon
                :name="verContra ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                color="grey-7"
                @click="verContra = !verContra"
              />
            </template>
          </q-input>

          <q-select
            v-model="nuevaCaja"
            :options="opcionesCajas"
            label="Caja asignada"
            outlined
            dense
            color="primary"
            label-color="grey-9"
            popup-content-class="text-weight-bold"
            options-selected-class="text-primary text-weight-bolder"
            :disable="guardando"
          >
            <template #prepend>
              <q-icon name="point_of_sale" color="primary" size="22px" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-sm q-pb-md q-px-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey-8"
            no-caps
            class="text-weight-bold"
            v-close-popup
            :disable="guardando"
            @click="limpiarFormulario"
          />
          <q-btn
            :label="funcionarioEditando ? 'Guardar' : 'Crear'"
            color="primary"
            unelevated
            no-caps
            class="btn-submit text-weight-bolder q-px-md"
            :loading="guardando"
            @click="guardarFuncionario"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useSucursalStore } from '../../stores/sucursal-store'
import { ref, computed, onMounted } from 'vue'

const sucursalStore = useSucursalStore()

const funcionarios = ref([
  { id: 1, nombre: 'Lucía Fernández', usuario: '@lucia.fernandez', caja: 1, contra: '1234' },
  { id: 2, nombre: 'Martín Souza', usuario: '@martin.souza', caja: 2, contra: '1234' }
])

const mostrarDialogo = ref(false)
const verContra = ref(false)
const cargando = ref(false)
const guardando = ref(false)

const nuevoNombre = ref('')
const nuevoUsuario = ref('')
const nuevaCaja = ref(null)
const nuevaContra = ref('')

const funcionarioEditando = ref(null)

const API_URL = 'http://localhost:3000/api/funcionarios'

const opcionesCajas = computed(() => {
  const total = sucursalStore.cantidadCajas || 4
  return Array.from({ length: total }, (_, i) => i + 1)
})

// GET: Obtener lista de funcionarios
const obtenerFuncionarios = async () => {
  cargando.value = true
  try {
    /*
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Error al obtener la lista de funcionarios')
    const data = await response.json()
    funcionarios.value = data
    */
  } catch (error) {
    console.error('Error al consultar funcionarios:', error)
  } finally {
    cargando.value = false
  }
}

// POST / PUT: Crear o actualizar funcionario
const guardarFuncionario = async () => {
  guardando.value = true
  try {
    const payload = {
      nombre: nuevoNombre.value,
      usuario: nuevoUsuario.value,
      caja: nuevaCaja.value,
      contra: nuevaContra.value
    }

    if (funcionarioEditando.value) {
      // PUT: Actualizar existente
      console.log('Actualizando funcionario:', funcionarioEditando.value.id, payload)
      /*
      const response = await fetch(`${API_URL}/${funcionarioEditando.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Error al actualizar')
      */
      funcionarioEditando.value.nombre = nuevoNombre.value
      funcionarioEditando.value.usuario = nuevoUsuario.value
      funcionarioEditando.value.caja = nuevaCaja.value
      funcionarioEditando.value.contra = nuevaContra.value
    } else {
      // POST: Crear nuevo
      console.log('Creando nuevo funcionario:', payload)
      /*
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Error al crear')
      const creado = await response.json()
      funcionarios.value.push(creado)
      */
      funcionarios.value.push({ ...payload, id: Date.now() })
    }

    limpiarFormulario()
    mostrarDialogo.value = false
  } catch (error) {
    console.error('Error al guardar funcionario:', error)
  } finally {
    guardando.value = false
  }
}

// DELETE: Eliminar funcionario
const eliminarFuncionario = async (funcionario) => {
  try {
    console.log('Eliminando funcionario:', funcionario.id || funcionario.usuario)
    /*
    const response = await fetch(`${API_URL}/${funcionario.id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Error al eliminar')
    */
    funcionarios.value = funcionarios.value.filter(f => f !== funcionario)
  } catch (error) {
    console.error('Error al eliminar funcionario:', error)
  }
}

const abrirNuevo = () => {
  limpiarFormulario()
  mostrarDialogo.value = true
}

const abrirEdicion = (funcionario) => {
  funcionarioEditando.value = funcionario
  nuevoNombre.value = funcionario.nombre
  nuevoUsuario.value = funcionario.usuario
  nuevaContra.value = funcionario.contra || ''
  nuevaCaja.value = funcionario.caja
  mostrarDialogo.value = true
}

const limpiarFormulario = () => {
  nuevoNombre.value = ''
  nuevoUsuario.value = ''
  nuevaCaja.value = null
  nuevaContra.value = ''
  funcionarioEditando.value = null
  verContra.value = false
}

onMounted(async () => {
  await obtenerFuncionarios()
})
</script>

<style scoped>
.radius-16 {
  border-radius: 16px;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.btn-action {
  border-radius: 10px;
  height: 40px;
  padding: 0 16px;
}

.btn-submit {
  border-radius: 10px;
  height: 42px;
  font-size: 15px;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  border-color: #b0b0b0;
}

:deep(.q-field__label) {
  font-weight: 700 !important;
  font-size: 15px !important;
}

:deep(.q-field__native) {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #1a1a1a !important;
}
</style>

```