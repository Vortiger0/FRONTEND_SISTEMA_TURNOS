<route lang="yaml">
meta:
  layout: false
</route>

<template>
  <q-page class="fondo flex flex-center q-pa-md">
    <q-card class="shadow-3 q-pa-md card-redondeada" style="width: 100%; max-width: 400px;">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-bold text-grey-9">
          Modifica tus credenciales
        </div>
      </q-card-section>

      <!-- formulario -->
      <q-card-section class="q-gutter-y-md">

        <q-input
          v-model="nuevoNombre"
          label="Nombre de usuario"
          outlined
          dense
        />

        <q-input
          v-model="nuevaPassword"
          label="Ingresar contraseña"
          type="password"
          outlined
          dense
        />

        <q-input
          v-model="confirmarPassword"
          label="Repetir contraseña"
          type="password"
          outlined
          dense
        />

        <q-btn
          label="Guardar cambios"
          color="primary"
          style="border-radius: 10px;"
          unelevated
          class="full-width q-py-sm"
          :loading="cargando"
          @click="guardar"
        />

      </q-card-section>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
// $q da acceso a utilidades de Quasar, entre ellas notify (alertas)
const $q = useQuasar()

const nuevoNombre = ref('')
const nuevaPassword = ref('')
const confirmarPassword = ref('')
//spinner de carga en el botón mientras se espera la respuesta del backend para evitar que la persona envie muchas veces.
const cargando = ref(false)


const guardar = async () => {
  //antes de mandar nada, verifica que las dos contras escritas coincida,
  if (password.value !== repeatPassword.value) {
    $q.notify({ type: 'negative', message: 'Las contraseñas no coinciden' })
    return
  }

cargando.value = true
 try {
  /* =====================================================================================
  esto es para utilizar con la conexión del backend (descomentar cuando la API este lista)
  ======================================================================================== */
  //manda el pedido al backend. La ruta es relativa "/api/" y no http://localhost:3000/... por el proxy configurado en quasar.config.js
  // const response = await fetch('/api/', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
      //a la derecha son los nombres que espera el backend recibir, distintos de los de las variables del front
  //   body: JSON.stringify({
  //    nombreCompleto: nombre.value,
  //    correo: correo.value,
  //    contrasena: password.value
  //  })
  // })
//
//convierte la respuesta que vino como texto json en un objecto de js normal para poder leer sus campos.
// const data = await response.json()
//
//si el back mandó mensaje de error lo muestra
// if (!response.ok) {
// $q.notify({ type: 'negative', message: data.error || 'Error al actualizar credencales'})
//  return
// }
//
//si todo salió bien muestra mensaje de éxito que manda el backend y recién ahí manda a la persona al login
// $q.notify({ type: 'positive', messsage: data.message})
// router.push('/')

/* ==================
    simulación
  =================== */

$q.notify({
  type: 'positive',
  message: 'Credenciales actualizadas correctamente'
})

//redirigir al inicio
router.push('/')

} catch (error) {
  //esto captura fallas reales de conexió (ej: backend apagado, no hay conexión a internet, etc) disntinto al "if (!response.ok)" de arriba
 console.error('Error al actualizar:', error)
 $q.notify({
  type:'negative', 
  message: 'No se pudo conectar con el servidor' 
})
} finally {
  //se ejecuta siempre, haya salido bien o mal, para apagar el spinner
cargando.value = false
   }
 }

</script>

<style scoped>
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

.fondo {
  background: linear-gradient(to bottom, #3d8ae2, #1c4779);
}
</style>