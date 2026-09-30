<template>
  <q-page class="bg-grey-2 q-pa-md flex flex-center">
    <div style="width: 100%; max-width: 480px;">

      <!-- Tarjeta principal con sombras y bordes limpios -->
      <q-card class="shadow-3 radius-16 overflow-hidden bg-white">
        
        <!-- Encabezado -->
        <q-card-section class="q-pb-none text-center">
          <div class="text-h5 text-weight-bolder text-grey-10">
            Datos del local
          </div>
          <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-xs">
            Actualiza la información comercial y la ubicación
          </div>
        </q-card-section>

        <!-- Formulario -->
        <q-card-section class="q-gutter-y-md q-pt-md">
          <q-input
            v-model="direccion"
            label="Dirección del local"
            outlined
            dense
            color="primary"
            class="custom-input"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
          >
            <template #prepend>
              <q-icon name="place" color="primary" size="22px" />
            </template>
          </q-input>

          <q-input
            v-model="telefono"
            label="Teléfono de contacto"
            outlined
            dense
            color="primary"
            class="custom-input"
            label-color="grey-9"
            input-class="text-weight-bold text-grey-10 text-body1"
          >
            <template #prepend>
              <q-icon name="phone" color="primary" size="22px" />
            </template>
          </q-input>
        </q-card-section>

        <!-- Contenedor del Mapa -->
        <q-card-section class="q-pt-xs">
          <div class="text-subtitle1 text-weight-bolder text-grey-10 q-mb-xs">
            Ubicación en el mapa
          </div>
          <div class="map-wrapper shadow-1">
            <div id="mapaSucursal" class="map-container"></div>
          </div>
        </q-card-section>

        <!-- Botón de guardar -->
        <q-card-actions class="q-px-md q-pb-md">
          <q-btn
            label="Guardar cambios"
            color="primary"
            unelevated
            no-caps
            class="full-width btn-submit text-weight-bolder"
            @click="guardarDatos"
          />
        </q-card-actions>

      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const direccion = ref('')
const telefono = ref('')
const latMelo = -32.3671
const lngMelo = -54.1745

const guardarDatos = () => {
  console.log('Datos guardados:', { direccion: direccion.value, telefono: telefono.value })
}

onMounted(() => {
  const mapa = L.map('mapaSucursal', {
    zoomControl: false
  }).setView([latMelo, lngMelo], 15)

  L.control.zoom({ position: 'topright' }).addTo(mapa)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa)

  // Marcador SVG personalizado exactamente igual al de la imagen
  const iconoGoogleMaps = L.divIcon({
    className: 'custom-svg-pin',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="svg-pin-icon">
        <path fill="#1a73e8" d="M172.268 501.67C26.97 291.03 0 269.41 0 192 0 85.96 85.96 0 192 0s192 85.96 192 192c0 77.41-26.97 99.03-172.268 309.67a24 24 0 0 1-35.464 0z"/>
        <circle cx="192" cy="192" r="70" fill="#FFFFFF"/>
      </svg>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42]
  })

  const marcador = L.marker([latMelo, lngMelo], { icon: iconoGoogleMaps }).addTo(mapa)

  mapa.on('click', function (evento) {
    marcador.setLatLng(evento.latlng)
  })
})
</script>

<style scoped>
.radius-16 {
  border-radius: 16px;
}
/* Borde del mapa */
.map-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #d0d0d0;
}

.map-container {
  height: 200px;
  width: 100%;
}

.btn-submit {
  border-radius: 10px;
  height: 48px;
  font-size: 16px;
}

/* Tipografía e intensidad para los inputs */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 15px;
  border-color: #636868;
}

:deep(.q-field__label) {
  font-weight: 700 !important;
  font-size: 15px !important;
}

:deep(.q-field__native) {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: #4b4a4a !important;
}

/* Estilos para el marcador SVG */
:deep(.custom-svg-pin) {
  background: transparent !important;
  border: none !important;
}

:deep(.svg-pin-icon) {
  width: 32px;
  height: 42px;
  display: block;
  filter: drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.35));
}
</style>