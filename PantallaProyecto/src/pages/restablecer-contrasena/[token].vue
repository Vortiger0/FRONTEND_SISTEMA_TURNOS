<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md">
    <q-card class="shadow-3 q-pa-md card-redondeada" style="width: 100%; max-width: 420px;">

      <q-card-section class="text-center q-pt-xs">
        <q-icon name="lock_reset" color="warning" size="4rem" />
        <div class="text-h5 text-weight-bold text-grey-9 q-mt-sm">
          Nueva contraseña
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Ingrese su nueva contraseña
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">

        <!-- NUEVA CONTRASEÑA (Mín 8 caracteres) -->
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
          label="Guardar"
          color="primary"
          unelevated
          class="full-width q-py-sm text-bold"
          style="border-radius: 10px;"
          :loading="cargando"
          @click="cambiarContrasena"
        />
      </q-card-section>

      <!-- OPCIÓN DE SALIR / CERRAR SESIÓN -->
      <q-card-section class="text-center q-pt-none">
        <q-btn
          flat
          dense
          no-caps
          label="Atras"
          color="Blue"
          class="text-weight-bold"
          @click="router.push('/login')"
        />
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()

const token = route.params.token

const nuevaContrasena = ref('')
const confirmarContrasena = ref('')
const cargando = ref(false)

const cambiarContrasena = async () => {
  if (nuevaContrasena.value.length < 8) {
    $q.notify({ type: 'warning', message: 'La contraseña debe tener al menos 8 caracteres' })
    return
  }

  if (nuevaContrasena.value !== confirmarContrasena.value) {
    $q.notify({ type: 'negative', message: 'Las contraseñas no coinciden' })
    return
  }

  cargando.value = true

  try {
     const response = await fetch('/api/auth/restablecer-contrasena', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token, nuevaContrasena: nuevaContrasena.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      $q.notify({ type: 'negative', message: data.error || 'No se pudo actualizar la contraseña' })
      return
    }

    $q.notify({ type: 'positive', message: data.mensaje || 'Contraseña actualizada correctamente' })
    router.push('/login')

  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'No se pudo conectar con el servidor' })
  } finally {
    cargando.value = false
  }
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