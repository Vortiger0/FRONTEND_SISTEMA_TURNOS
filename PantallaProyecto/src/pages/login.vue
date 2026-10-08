<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md">
    <q-card class="shadow-3 q-pa-md card-redondeada" style="width: 100%; max-width: 420px;">

      <!-- BOTÓN DE MODO DE ACCESO FUNCIONARIO / CIUDADANO -->
      <div class="column items-end q-mb-md">
        <div class="text-caption text-bold text-grey-7 text-uppercase">
          Modo de acceso:
        </div>
        <q-toggle
          v-model="esFuncionario"
          :label="esFuncionario ? 'Funcionario' : 'Ciudadano'"
          color="primary"
        />
      </div>

      <!-- CABECERA ADAPTATIVA -->
      <q-card-section class="text-center q-pt-xs">
        <q-icon
          :name="esFuncionario ? 'admin_panel_settings' : 'account_circle'"
          :color="esFuncionario ? 'secondary' : 'primary'"
          size="4rem"
        />
        <div class="text-h5 text-weight-bold text-grey-9 q-mt-sm">
          {{ esFuncionario ? 'Acceso Funcionario' : 'Acceso Ciudadano' }}
        </div>
        <div class="text-caption text-grey-7">
          {{ esFuncionario ? 'Ingresa con tu usuario asignado' : 'Ingresa con tu correo registrado' }}
        </div>
      </q-card-section>

      <!-- FORMULARIO GENERALIZADO -->
      <q-card-section class="q-gutter-y-md">
        
        <!-- CAMPO 1: CORREO (Ciudadano) / USUARIO (Funcionario) -->
        <q-input
          v-if="!esFuncionario"
          v-model="identificador"
          label="Correo Electrónico"
          type="email"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-else
          v-model="identificador"
          label="Usuario"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- CAMPO 2: CONTRASEÑA (Ambos modos) -->
        <q-input
          v-model="password"
          label="Contraseña"
          type="password"
          outlined
          dense
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- BOTÓN DE INGRESO -->
        <q-btn
          :label="esFuncionario ? 'Ingresar como Funcionario' : 'Ingresar como Ciudadano'"
          :color="esFuncionario ? 'secondary' : 'primary'"
          unelevated
          class="full-width q-py-sm"
          style="border-radius: 10px;"
          :loading="cargando"
          @click="iniciarSesion"
        />
      </q-card-section>

      <!-- ENLACE A REGISTRO (Solo visible en Modo Ciudadano) -->
      <q-card-section v-if="!esFuncionario" class="text-center q-pt-none">
        <div class="text-body2 text-grey-8">
          ¿No tienes una cuenta?
          <q-btn
            flat
            dense
            no-caps
            label="Regístrate aquí"
            color="primary"
            class="text-weight-bold"
            to="/registro"
          />
        </div>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {useQuasar} from 'quasar'
import { useAuthStore } from '../stores/auth-store';

const router = useRouter()
const $q = useQuasar ()
const authStore = useAuthStore()

// Estado del Switch: false = Ciudadano, true = Funcionario
const esFuncionario = ref(false)

// Campos del formulario
const identificador = ref('')
const password = ref('')
//controla el spinner del boton mientras ses espera respuesta del backend
const cargando = ref(false)

// Limpia el identificador al cambiar de modo para evitar confusiones de datos
watch(esFuncionario, () => {
  identificador.value = ''
  password.value = ''
})

// Lógica para redirigir según el modo seleccionado
const iniciarSesion = async () => {
 cargando.value = true
 try{
  // manda el pedido al backend
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identificador: identificador.value,
      contrasena: password.value
    })
  })

  const data = await response.json()

  //si el backend respondió con un error, lo muestra y corta.
  if(!response.ok){
    $q.notify({type: 'negative', message: data.error || 'Error al iniciar sesión'})
    return
  }

  //guarda el token y el rol en el store (y en localStorage) para que el resto de la app sepa que hay una sesión activa y quién es
  authStore.guardarSesion(data.token, data.rol)

  $q.notify({type: 'positive', message: data.mensaje})

  //redirige según el rol que devolvió el backend.
  if (data.rol === 'ADMIN') {
    router.push ('/admin')
  } else if (data.rol === 'FUNCIONARIO') {
    router.push('/funcionario')
  } else {
    router.push('/')
  }
  //atrapa fallas de conexión real
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    $q.notify({type: 'negative', message: 'No se pudo conectar con el servidor' })
  } finally {
    cargando.value = false
  }
}

</script>

<style scoped>
.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}

.card-redondeada {
  border-radius: 20px;
  overflow: hidden;
}

:deep(.q-field--outlined .q-field__control) {
  border-radius: 15px;
  border-color: #636868;
}

:deep(.q-field__label) {
  font-weight: 700 !important;
  font-size: 15px !important;
}
</style>