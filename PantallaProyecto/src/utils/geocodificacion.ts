// agarra las cordenadas y las comvierte en direcciones.
// por politica y evitar conflictos con nominatim es 1 consulta por segundo.
// envía el Referer solo) y mostrar la atribución a OpenStreetMap (ya está en el mapa).

type RespuestaNominatim = {
  display_name?: string
  error?: string
  address?: {
    road?: string
    house_number?: string
    neighbourhood?: string
    suburb?: string
    city_district?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
  }
}

const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

export async function direccionDesdeCoordenadas(
  lat: number,
  lng: number,
  senal?: AbortSignal
): Promise<string> {
  const parametros = new URLSearchParams({
    format: 'jsonv2',
    lat: String(lat),
    lon: String(lng),
    zoom: '18',
    addressdetails: '1',
    'accept-language': 'es',
  })

  const respuesta = await fetch(`${URL_NOMINATIM}?${parametros.toString()}`, senal ? { signal: senal } : {})
  if (!respuesta.ok) throw new Error('No se pudo consultar el servicio de direcciones')

  const datos = (await respuesta.json()) as RespuestaNominatim
  if (datos.error) throw new Error('No hay una dirección registrada en ese punto')

  return armarDireccion(datos)
}

// aca se arma la direccion
function armarDireccion(datos: RespuestaNominatim): string {
  const a = datos.address ?? {}
  const calle = [a.road, a.house_number].filter(Boolean).join(' ')
  const barrio = a.neighbourhood ?? a.suburb ?? a.city_district
  const localidad = a.city ?? a.town ?? a.village ?? a.municipality

  const partes = [calle, barrio, localidad].filter(Boolean)
  const texto = partes.length > 0 ? partes.join(', ') : (datos.display_name ?? '')

  return texto.slice(0, 255)
}