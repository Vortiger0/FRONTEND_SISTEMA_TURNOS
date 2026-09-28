<template>
    <q-page class="bg-grey-2 q-pa-md flex justify-center flex-center q-pt-xl">
        <div style="width: 100%; max-width: 500px;">

            <!-- Una sola tarjeta madre envuelve todo el contenido -->
            <q-card class="shadow-3">
                <q-card-section class="text-h6 text-center text-weight-bold">
                    Datos del local
                </q-card-section>

                <!-- Sección 1: los campos de texto -->
                <q-card-section class="q-gutter-y-sm">
                    <q-input v-model="direccion" label="Dirección del local"></q-input>
                    <q-input v-model="telefono" label="Teléfono"></q-input>
                </q-card-section>

                <q-separator />

                <!-- Sección 2: el mapa -->
                <q-card-section>
                    <div id="mapaSucursal" class="bg-grey-4 flex flex-center text-grey-7 text-center" style="height: 180px; border-radius: 8px;">
                        <div>
                            <q-icon name="place" size="2rem"></q-icon>
                            <div>Toca para ubicar en el mapa</div>
                        </div>
                    </div>
                </q-card-section>

                <!-- Sección 3: el botón de guardar -->
                <q-card-actions class="q-pa-md">
                    <q-btn label="Guardar cambios" color="primary" unelevated class="full-width" @click="guardarDatos"></q-btn>
                </q-card-actions>

            </q-card>
        </div>
    </q-page>
</template>
<script setup>
//onMounted lo que hace es ejecutar una funcion cuando el template se renderiza, en este caso se ejecuta la funcion de inicializar el mapa
import { ref, onMounted } from 'vue'
//importamos la libreria de leaflet y su css para poder usar el mapa (el css es necesario para que no se vea roto el mapa)
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
  // Se define el mapa y se indica en qué div se dibuja (por el id),
  // además de la vista inicial (coordenadas y nivel de zoom)
  const mapa = L.map('mapaSucursal').setView([latMelo, lngMelo], 15)

  // Se piden las imágenes del mapa a OpenStreetMap, con el crédito correspondiente
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa)

  //guardamos el marcador en una variable para poder moverlo cuando el usuario haga click en el mapa
    const marcador = L.marker([latMelo, lngMelo]).addTo(mapa)

    //escuchamos los clicks del mapa
    mapa.on('click', function (evento) {
        // el evento.latlng trae las coordenadas de donde se hizo click
        marcador.setLatLng(evento.latlng)
    })

})

    
</script>