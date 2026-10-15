<route lang="yaml">
meta:
  layout: false
  requiereAuth: true
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md">
    <q-card class="shadow-3 q-pa-md card-redondeada" style="width: 100%; max-width: 420px;">

      <q-card-section class="text-center q-pt-xs">
        <q-icon name="lock_reset" color="warning" size="4rem" />
        <div class="text-h5 text-weight-bold text-grey-9 q-mt-sm">
          Actualizar Credenciales
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Por motivos de seguridad, debes cambiar tu nombre de usuario y contraseña predeterminada antes de continuar.
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- NUEVO USUARIO (Requerido por tu backend/Zod) -->
        <q-input
          v-model="nuevoUsuario"
          label="Nuevo Nombre de Usuario"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- NUEVA CONTRASEÑA -->
        <q-input
          v-model="nuevaContrasena"
          label="Nueva Contraseña"
          type="password"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- CONFIRMAR NUEVA CONTRASEÑA -->
        <q-input
          v-model="confirmarContrasena"
          label="Confirmar Nueva Contraseña"
          type="password"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="lock_outline" />
          </template>
        </q-input>

        <!-- BOTÓN DE GUARDAR -->
        <q-btn
          label="Guardar y Continuar"
          color="primary"
          unelevated
          class="full-width q-py-sm text-bold"
          style="border-radius: 10px;"
          :loading="cargando"
          @click="cambiarCredenciales"
        />
      </q-card-section>

      <!-- OPCIÓN DE SALIR / CERRAR SESIÓN SI DESEA -->
      <q-card-section class="text-center q-pt-none">
        <q-btn
          flat
          dense
          no-caps
          label="Cerrar sesión"
          color="negative"
          class="text-weight-bold"
          @click="cerrarSesion"
        />
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth-store'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const nuevoUsuario = ref('')
const nuevaContrasena = ref('')
const confirmarContrasena = ref('')
const cargando = ref(false)

const cambiarCredenciales = async () => {
  if (!nuevoUsuario.value || !nuevaContrasena.value || !confirmarContrasena.value) {
    $q.notify({ type: 'warning', message: 'Por favor completa todos los campos' })
    return
  }

  if (nuevaContrasena.value !== confirmarContrasena.value) {
    $q.notify({ type: 'negative', message: 'Las contraseñas no coinciden' })
    return
  }

  cargando.value = true

  try {
    const response = await fetch('/api/auth/cambiar-credenciales', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        nuevoUsuario: nuevoUsuario.value,
        nuevaContrasena: nuevaContrasena.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      $q.notify({ type: 'negative', message: data.error || 'Error al cambiar credenciales' })
      return
    }

    $q.notify({ type: 'positive', message: data.mensaje || 'Credenciales actualizadas con éxito' })

    // Actualizamos el estado en el store y localstorage
    authStore.marcarCredencialesActualizadas()

    // Redirigimos al panel de administración
    router.push('/admin')

  } catch (error) {
    console.error('Error de red:', error)
    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor' })
  } finally {
    cargando.value = false
  }
}

const cerrarSesion = () => {
  authStore.cerrarSesion()
  router.push('/login')
}
</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
  min-height: 100vh;
}

.card-redondeada {
  border-radius: 20px;
  overflow: hidden;
}
</style>