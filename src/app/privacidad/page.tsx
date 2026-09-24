import Link from "next/link";
import { DATOS_LEGALES as D } from "@/lib/datosLegales";

export const metadata = { title: "Política de privacidad - MotorHub.com.ar" };

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-blue-400">{titulo}</h2>
      <div className="space-y-3 text-gray-300 leading-relaxed">{children}</div>
    </section>
  );
}

export default function Privacidad() {
  return (
    <div className="bg-black text-white min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <header>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
            Política de <span className="text-blue-400">privacidad</span>
          </h1>
          <p className="text-sm text-gray-500">Última actualización: {D.actualizado}</p>
        </header>

        <Seccion titulo="1. Quién es responsable de tus datos">
          <p>
            El responsable de los datos personales de MotorHub.com.ar es {D.responsable}, CUIT {D.cuit},
            con domicilio en {D.domicilio}. Contacto: {D.email}.
          </p>
          <p>
            Tratamos tus datos conforme a la Ley 25.326 de Protección de los Datos Personales.
          </p>
        </Seccion>

        <Seccion titulo="2. Qué datos recolectamos">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Al registrarte:</strong> nombre, email y contraseña. La contraseña se guarda
              encriptada y nadie en MotorHub puede verla.
            </li>
            <li>
              <strong>En tu perfil, si decidís cargarlos:</strong> ubicación, número de WhatsApp y
              usuarios de Instagram y Facebook.
            </li>
            <li>
              <strong>Lo que publicás:</strong> vehículos con sus fotos, comercios, productos, eventos y
              mensajes del foro.
            </li>
            <li>
              <strong>Si sos comerciante:</strong> los datos de tu comercio (dirección, teléfono, email,
              redes).
            </li>
            <li>
              <strong>Si pagás un plan:</strong> Mercado Pago nos informa el número de operación, el
              monto y si el pago fue aprobado. <strong>No recibimos ni guardamos los datos de tu
              tarjeta</strong>: los maneja directamente Mercado Pago.
            </li>
            <li>
              <strong>Datos técnicos:</strong> registros básicos que generan los servidores al usar el
              sitio (por ejemplo, fecha y hora de las solicitudes), usados para su funcionamiento y
              seguridad.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="3. Qué información es pública">
          <p>
            MotorHub es una comunidad, así que <strong>lo que publicás es visible para cualquier
            visitante</strong>, aunque no esté registrado: tu nombre, tus vehículos y sus fotos, tu
            comercio, tus eventos, tus mensajes del foro y, <strong>si los cargaste, tu ubicación,
            WhatsApp y redes sociales</strong>. Tu email y tu contraseña nunca se muestran.
          </p>
          <p>
            Pensá bien qué datos de contacto querés publicar. Podés editarlos o borrarlos cuando quieras
            desde{" "}
            <Link href="/mi-cuenta" className="text-blue-400 underline">
              Mi cuenta
            </Link>
            .
          </p>
        </Seccion>

        <Seccion titulo="4. Para qué usamos tus datos">
          <ul className="list-disc pl-6 space-y-1">
            <li>Crear y administrar tu cuenta.</li>
            <li>Mostrar lo que publicás en el sitio.</li>
            <li>Procesar tus suscripciones y controlar su vencimiento.</li>
            <li>Mantener el sitio seguro y moderar el contenido.</li>
            <li>Comunicarnos con vos por temas de tu cuenta.</li>
          </ul>
          <p>No vendemos ni alquilamos tus datos a nadie.</p>
        </Seccion>

        <Seccion titulo="5. Con quién compartimos tus datos">
          <p>
            Para funcionar, MotorHub usa estos proveedores, que tratan datos solo para prestarnos su
            servicio:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase:</strong> base de datos, cuentas de usuario y almacenamiento de fotos.</li>
            <li><strong>Vercel:</strong> alojamiento del sitio.</li>
            <li><strong>Mercado Pago:</strong> procesamiento de pagos.</li>
          </ul>
          <p>
            Algunos de estos proveedores tienen sus servidores fuera de Argentina, por lo que tus datos
            pueden almacenarse en otros países. Al usar el sitio, prestás tu consentimiento para esa
            transferencia internacional.
          </p>
          <p>También podemos compartir datos cuando lo exija una autoridad competente conforme a la ley.</p>
        </Seccion>

        <Seccion titulo="6. Almacenamiento en tu navegador">
          <p>
            Para mantener tu sesión iniciada, guardamos en tu navegador un dato de acceso. No usamos
            cookies de publicidad ni de seguimiento de terceros.
          </p>
        </Seccion>

        <Seccion titulo="7. Cuánto tiempo guardamos tus datos">
          <p>
            Mientras tu cuenta esté activa. Si pedís la baja, eliminamos tu perfil y tu contenido. Los
            registros de pagos pueden conservarse el tiempo que exijan las normas contables e
            impositivas.
          </p>
        </Seccion>

        <Seccion titulo="8. Tus derechos">
          <p>
            Podés pedir acceso a tus datos, y que los corrijamos, actualicemos o eliminemos, escribiendo
            a {D.email}. El acceso es gratuito en intervalos no menores a seis meses, salvo que acredites
            un interés legítimo, según el artículo 14 de la Ley 25.326. Gran parte de tus datos también
            podés editarlos o borrarlos vos mismo desde Mi cuenta.
          </p>
          <p className="text-sm text-gray-400 border-l-2 border-blue-500 pl-4">
            La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley
            N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes
            resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de
            protección de datos personales.
          </p>
        </Seccion>

        <Seccion titulo="9. Seguridad">
          <p>
            Usamos conexiones cifradas, contraseñas encriptadas y reglas de acceso que impiden que un
            usuario vea o modifique datos privados de otro. Ningún sistema es infalible, pero trabajamos
            para proteger tu información.
          </p>
        </Seccion>

        <Seccion titulo="10. Menores de edad">
          <p>MotorHub está dirigido a mayores de 18 años. No registramos a menores de edad.</p>
        </Seccion>

        <Seccion titulo="11. Cambios en esta política">
          <p>
            Si cambiamos esta política lo avisaremos en el sitio. La fecha de la última actualización
            figura al principio de esta página.
          </p>
        </Seccion>

        <Seccion titulo="12. Contacto">
          <p>
            Por cualquier consulta sobre tus datos, escribinos a {D.email}. Ver también los{" "}
            <Link href="/terminos" className="text-blue-400 underline">
              Términos y condiciones
            </Link>
            .
          </p>
        </Seccion>
      </article>
    </div>
  );
}