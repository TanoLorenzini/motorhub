import Link from "next/link";
import { DATOS_LEGALES as D } from "@/lib/datosLegales";

export const metadata = { title: "Términos y condiciones - MotorHub.com.ar" };

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-blue-400">{titulo}</h2>
      <div className="space-y-3 text-gray-300 leading-relaxed">{children}</div>
    </section>
  );
}

export default function Terminos() {
  return (
    <div className="bg-black text-white min-h-screen">
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <header>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
            Términos y <span className="text-blue-400">condiciones</span>
          </h1>
          <p className="text-sm text-gray-500">Última actualización: {D.actualizado}</p>
        </header>

        <Seccion titulo="1. Aceptación">
          <p>
            Estos términos regulan el uso de MotorHub.com.ar (en adelante, &quot;MotorHub&quot;), cuyo
            responsable es {D.responsable}, CUIT {D.cuit}, con domicilio en {D.domicilio}. Al registrarte
            o usar el sitio aceptás estos términos y nuestra{" "}
            <Link href="/privacidad" className="text-blue-400 underline">
              Política de privacidad
            </Link>
            . Si no estás de acuerdo, no uses el sitio.
          </p>
        </Seccion>

        <Seccion titulo="2. Qué es MotorHub">
          <p>
            MotorHub es una plataforma que reúne a la comunidad de autos y motos clásicas: los usuarios
            publican sus vehículos, los comercios del rubro muestran sus productos y servicios, los
            organizadores difunden eventos, y todos participan en un foro.
          </p>
          <p>
            MotorHub <strong>no vende vehículos, productos ni servicios de terceros</strong>, y no participa
            ni intermedia en las operaciones que los usuarios acuerden entre sí. Solo brinda el espacio
            para que se contacten.
          </p>
        </Seccion>

        <Seccion titulo="3. Registro y cuenta">
          <p>
            Para publicar tenés que registrarte y ser mayor de 18 años. Te comprometés a brindar datos
            verdaderos y a mantenerlos actualizados. Sos responsable de cuidar tu contraseña y de todo lo
            que se haga con tu cuenta.
          </p>
        </Seccion>

        <Seccion titulo="4. Contenido que publicás">
          <p>
            Sos el único responsable de lo que publicás: fotos, descripciones, datos de contacto,
            productos, eventos y mensajes del foro. Declarás que tenés derecho a publicarlo.
          </p>
          <p>
            Al publicar, autorizás a MotorHub a mostrar ese contenido en el sitio mientras permanezca
            publicado. Seguís siendo el dueño de tu contenido y podés borrarlo cuando quieras.
          </p>
          <p>Está prohibido publicar:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Vehículos o repuestos de origen ilícito, o sin la documentación que corresponda.</li>
            <li>Contenido ofensivo, discriminatorio, violento o que infrinja derechos de terceros.</li>
            <li>Datos personales de otras personas sin su consentimiento.</li>
            <li>Publicidad engañosa, spam o contenido ajeno a la temática del sitio.</li>
          </ul>
          <p>
            MotorHub puede moderar, ocultar o eliminar contenido que no cumpla estos términos, y suspender
            las cuentas que los incumplan.
          </p>
        </Seccion>

        <Seccion titulo="5. Compraventa entre usuarios">
          <p>
            Las operaciones entre usuarios (por ejemplo, la compra de un vehículo publicado como &quot;en
            venta&quot;) se acuerdan directamente entre las partes. MotorHub no verifica la identidad de
            los usuarios, el estado de los vehículos ni su documentación, y no garantiza el resultado de
            ninguna operación.
          </p>
          <p>
            Te recomendamos ver el vehículo en persona, pedir un informe de dominio, verificar la
            documentación y concretar las operaciones en lugares seguros.
          </p>
        </Seccion>

        <Seccion titulo="6. Planes y suscripciones">
          <p>
            Comerciantes y organizadores de eventos pueden usar un plan gratuito, con límites de
            publicación, o contratar un plan Premium. Los usuarios de la comunidad no pagan por publicar
            sus vehículos ni por participar en el foro.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              El plan Premium dura <strong>30 días corridos</strong> desde que se acredita el pago. El
              precio es el publicado en el sitio al momento de contratar.
            </li>
            <li>
              <strong>No se renueva automáticamente.</strong> Para continuar, hay que volver a pagar. Si
              renovás antes del vencimiento, los nuevos 30 días se suman a los que te quedaban.
            </li>
            <li>
              Al vencer, la cuenta vuelve al plan gratuito: el contenido que supere sus límites se
              oculta, pero no se borra, y vuelve a mostrarse al renovar.
            </li>
            <li>
              Los pagos se procesan a través de Mercado Pago. MotorHub no recibe ni guarda los datos de
              tu tarjeta.
            </li>
            <li>
              Los precios pueden cambiar. Un cambio nunca afecta un período que ya pagaste.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="7. Derecho de arrepentimiento">
          <p>
            Tenés derecho a revocar la contratación de un plan dentro de los <strong>10 días corridos</strong>{" "}
            desde que la realizaste, sin costo ni necesidad de explicar el motivo, conforme al artículo
            34 de la Ley 24.240 de Defensa del Consumidor y al artículo 1110 del Código Civil y Comercial.
          </p>
            <p>
            Para ejercerlo, usá el{" "}
            <Link href="/arrepentimiento" className="text-blue-400 underline">
              Botón de arrepentimiento
            </Link>{" "}
            o escribinos a {D.email}. Te reintegraremos el importe por el mismo medio de pago y el plan
            quedará sin efecto.
          </p>
        </Seccion>

        <Seccion titulo="8. Propiedad intelectual">
          <p>
            La marca MotorHub, su logo, el diseño y el código del sitio pertenecen a su responsable. No
            pueden copiarse ni usarse sin autorización.
          </p>
        </Seccion>

        <Seccion titulo="9. Responsabilidad">
          <p>
            MotorHub se esfuerza por mantener el sitio disponible y funcionando, pero no puede garantizar
            que esté libre de interrupciones o errores. No es responsable por el contenido que publican
            los usuarios ni por las operaciones que realicen entre ellos, sin perjuicio de los derechos
            que la ley reconoce a los consumidores.
          </p>
        </Seccion>

        <Seccion titulo="10. Baja de la cuenta">
          <p>
            Podés pedir la baja de tu cuenta en cualquier momento escribiendo a {D.email}. Al darte de
            baja se elimina tu perfil y todo tu contenido publicado.
          </p>
        </Seccion>

        <Seccion titulo="11. Cambios en estos términos">
          <p>
            Podemos actualizar estos términos. Los cambios importantes se avisarán en el sitio, y la
            fecha de la última actualización figura al principio de esta página.
          </p>
        </Seccion>

        <Seccion titulo="12. Ley aplicable">
          <p>
            Estos términos se rigen por las leyes de la República Argentina. Si sos consumidor, podés
            hacer reclamos ante los tribunales o las autoridades de defensa del consumidor de tu
            domicilio.
          </p>
        </Seccion>

        <Seccion titulo="13. Contacto">
          <p>
            Por cualquier consulta sobre estos términos, escribinos a {D.email}.
          </p>
        </Seccion>
      </article>
    </div>
  );
}