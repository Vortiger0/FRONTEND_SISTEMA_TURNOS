//pasa la clave publica vapid de formato base64 a bytes que es el formato que exige pushManager.subscribe()
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4-(base64String.length % 4)) %4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g,'/')
    const raw = atob(base64)
    const salida = new Uint8Array(new ArrayBuffer(raw.length))
    for ( let i = 0; i < raw.length; i++)salida[i] = raw.charCodeAt(i)
        return salida
}

// chequea si el navegador tiene las 3 APIs necesarias para push
export const soportaPush = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
    'Notification' in window

// chequea si este dispositivo especifico tiene una suscripcion activa en este momento
export async function  hayDispositivoSuscripto():Promise<boolean> {
    if (!soportaPush()) return false 
    const reg = await navigator.serviceWorker.getRegistration()
    const suscripcion = await reg?.pushManager.getSubscription()
    return Boolean(suscripcion)
}

//flujo de activacion: pide permiso, registra el service worker, obtiene/crea la suscripcion
//y la manda al back donde queda guardada
export async function activarAvisos(token: string): Promise <'ok' | 'denegado'> {
    const permiso = await Notification.requestPermission()
    if(permiso !== 'granted') return 'denegado'
    await navigator.serviceWorker.register('/sw.js')
    const reg = await navigator.serviceWorker.ready

    const respuestaClave = await fetch ('/api/push/clave-publica')
    if(!respuestaClave.ok) {
        throw new Error ('Las notificaciones no estan disponibles en este momento')
    }
    const { clavePublica } = (await respuestaClave.json()) as {clavePublica: string}
    
    //reutiliza la suscripcion si ya existia, o crea una nueva con la clave publica convertida a bytes
    const suscripcion =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey: urlBase64ToUint8Array(clavePublica)
    }))

    const respuesta = await fetch ('/api/push/suscripcion',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
             Authorization: `Bearer ${token}`,
        },
        body:JSON.stringify(suscripcion.toJSON()),
    })
    if(!respuesta.ok) throw new Error('No se pudo registrar este dispositivo')
        
        return 'ok'
}
//avisa al back que borre esta suscripcion, y desuscribe al dispositivo del lado del navegador
export async function desactivarAvisos(token: string): Promise <void> {
    if (!soportaPush()) return
    
    const reg = await navigator.serviceWorker.getRegistration()
    const suscripcion = await reg?.pushManager.getSubscription()
    if (!suscripcion) return

    try {
        await fetch('/api/push/suscripcion', {
            method: 'DELETE',
            headers: {
                'Content-Type':'application/json',
                Authorization:`Bearer ${token}`,
            },
            body:JSON.stringify({ endpoint: suscripcion.endpoint }),
        })
    }catch (error){
        console.error('No se pudo avisar al backend de la desuscripcion:',error)
    }
    await suscripcion.unsubscribe()
}