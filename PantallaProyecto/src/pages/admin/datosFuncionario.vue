<route lang="yaml">
meta:
  requiereAuth: true
  roles: ["ADMIN"]
</route>

<template>
  <q-page class="fondo q-pa-md flex justify-center">
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
            :key="funcionario.id || funcionario.nombreUsuario"
            class="q-py-md q-px-lg"
          >
            <q-item-section avatar>
              <q-avatar color="blue-1" text-color="primary" icon="person" font-size="24px" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle1 text-weight-bolder text-grey-10">
                {{ funcionario.nombreCompleto }}
              </q-item-label>
              
              <q-item-label class="text-body2 text-weight-bold text-grey-8 flex items-center gap-1 q-mt-xs">
                <!-- Chip de Caja con icono de caja registradora -->
                <q-chip
                  dense
                  color="blue-1"
                  text-color="primary"
                  icon="point_of_sale"
                  class="text-weight-bolder q-px-sm"
                  size="13px"
                >
                  Caja {{ funcionario.numeroCaja }}
                </q-chip>
                <span class="text-grey-7 q-ml-xs text-weight-bold">{{ funcionario.nombreUsuario }}</span>
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

    <!-- Ventana de diálogo de creación/edición -->
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

        <!-- Formulario -->
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
            :label="funcionarioEditando ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'"
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
            <template #no-option>
              <q-item>
                <q-item-section class="text-italic text-grey">
                  No hay cajas disponibles
                </q-item-section>
              </q-item>
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
import { useAuthStore } from '../../stores/auth-store'
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const sucursalStore = useSucursalStore()
const authStore = useAuthStore()

const funcionarios = ref([])
const mostrarDialogo = ref(false)
const verContra = ref(false)
const cargando = ref(false)
const guardando = ref(false)

const nuevoNombre = ref('')
const nuevoUsuario = ref('')
const nuevaCaja = ref(null)
const nuevaContra = ref('')

const funcionarioEditando = ref(null)

// Cajas disponibles filtradas dinámicamente
const opcionesCajas = computed(() => {
  const totalCajas = sucursalStore.cantidadCajas || 4
  const todasLasCajas = Array.from({ length: totalCajas }, (_, i) => i + 1)

  // Obtener las cajas ocupadas por otros funcionarios
  const cajasOcupadas = funcionarios.value
    .filter(f => !funcionarioEditando.value || f.id !== funcionarioEditando.value.id)
    .map(f => Number(f.numeroCaja))

  // Retornar solo las cajas que no estén en uso (o la del funcionario actual si edita)
  return todasLasCajas.filter(caja => !cajasOcupadas.includes(caja))
})

// GET: Obtener lista de funcionarios
const obtenerFuncionarios = async () => {
  cargando.value = true
  try {
    const response = await fetch('/api/admin/funcionarios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    if (!response.ok) throw new Error('Error al obtener la lista de funcionarios')
    const data = await response.json()
    funcionarios.value = data
  } catch (error) {
    console.error('Error al consultar funcionarios:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar la lista de funcionarios'
    })
  } finally {
    cargando.value = false
  }
}

// POST / PUT: Crear o actualizar funcionario
const guardarFuncionario = async () => {
  if (!nuevaCaja.value) return

  guardando.value = true
  try {
    const payload = {
      nombreCompleto: nuevoNombre.value,
      nombreUsuario: nuevoUsuario.value,
      numeroCaja: Number(nuevaCaja.value)
    }

    // Si es nuevo, mandamos la contraseña. Si es edición, solo se incluye si escribieron algo.
    if (!funcionarioEditando.value) {
      payload.contrasena = nuevaContra.value
    } else if (nuevaContra.value.trim() !== '') {
      payload.contrasena = nuevaContra.value
    }

    if (funcionarioEditando.value) {
      // PUT: Actualizar existente
      const response = await fetch(`/api/admin/funcionarios/${funcionarioEditando.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al actualizar')

      $q.notify({
        type: 'positive',
        message: 'Funcionario actualizado correctamente'
      })
    } else {
      // POST: Crear nuevo
      const response = await fetch('/api/admin/funcionarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al crear')

      $q.notify({
        type: 'positive',
        message: 'Funcionario creado correctamente'
      })
    }

    await obtenerFuncionarios()
    limpiarFormulario()
    mostrarDialogo.value = false
  } catch (error) {
    console.error('Error al guardar funcionario:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al intentar guardar el funcionario'
    })
  } finally {
    guardando.value = false
  }
}

// DELETE: Eliminar funcionario
const eliminarFuncionario = async (funcionario) => {
  const confirmado = window.confirm(`¿Estás seguro de eliminar a ${funcionario.nombreCompleto}?`)
  
  if (!confirmado) return

  try {
    if (!funcionario.id) {
      throw new Error('ID de funcionario no válido')
    }

    const response = await fetch(`/api/admin/funcionarios/${funcionario.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    const contentType = response.headers.get('content-type')
    let data = {}
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    }

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar el funcionario')
    }

    funcionarios.value = funcionarios.value.filter(f => f.id !== funcionario.id)
    $q.notify({
      type: 'positive',
      message: 'Funcionario eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar funcionario:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'No se pudo eliminar el funcionario'
    })
  }
}

const abrirNuevo = () => {
  limpiarFormulario()
  
  if (opcionesCajas.value.length > 0) {
    nuevaCaja.value = opcionesCajas.value[0]
  }

  mostrarDialogo.value = true
}

const abrirEdicion = (funcionario) => {
  funcionarioEditando.value = funcionario
  nuevoNombre.value = funcionario.nombreCompleto
  nuevoUsuario.value = funcionario.nombreUsuario
  nuevaContra.value = ''
  nuevaCaja.value = funcionario.numeroCaja
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

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>