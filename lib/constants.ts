import {
  HeadphonesIcon,
  CheckCircle2,
  Lock,
  Server,
  Activity,
  ShieldCheck,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import {
  Plan,
  Feature,
  NavLink,
  Stat,
  ProcessStep,
  FAQ,
  UseCase,
} from "./types";

export const navLinks: NavLink[] = [
  { label: "Home", href: "#" },
  { label: "Nosotros", href: "#about" },
  { label: "Servicios", href: "#solutions" },
  { label: "Planes", href: "#plans" },
  { label: "Preguntas", href: "#faq" },
];

export const stats: Stat[] = [
  { value: "+50", label: "Empresas activas protegidas" },
  {
    value: "+2,000",
    label: "Incidencias resueltas sin interrupciones clínicas",
  },
  { value: "99.9%", label: "Disponibilidad operativa garantizada" },
];

export const features: Feature[] = [
  {
    icon: HeadphonesIcon,
    title: "Operación IT Continua",
    description:
      "Gestionamos incidencias antes de que impacten tu producción, combinando monitoreo activo y operación remota/presencial.",
  },
  {
    icon: Activity,
    title: "Mantenimiento Preventivo",
    description:
      "Reducimos fallas y alargamos la vida de tus equipos, evitando los altos costos de detener la productividad.",
  },
  {
    icon: Lock,
    title: "Sistema de Respaldo",
    description:
      "Información invulnerable. Protegemos todos tus activos críticos contra ransomware y pérdida de datos.",
  },
  {
    icon: Server,
    title: "Infraestructura Empresarial",
    description:
      "Estabilidad de redes, servidores y WiFi corporativo para sostener la continuidad de tu ejecución diaria.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Diagnóstico gratuito",
    description:
      "Evaluamos el estado actual de tu infraestructura y detectamos puntos de mejora.",
  },
  {
    number: "02",
    title: "Implementación",
    description:
      "Configuramos redes, accesos y sistemas iniciales para asegurar la estabilidad.",
  },
  {
    number: "03",
    title: "Monitoreo",
    description:
      "Vigilamos tus sistemas continuamente para prevenir caídas o lentitud.",
  },
  {
    number: "04",
    title: "Soporte",
    description:
      "Brindamos asistencia y optimizamos constantemente la tecnología de tu empresa.",
  },
];

export const plans: Plan[] = [
  {
    name: "Básico",
    price: "60",
    target: "Para empresas que necesitan soporte esencial",
    description: "Soporte esencial para mantener tu operación en marcha.",
    features: [
      "Soporte técnico remoto",
      "2 Visitas presenciales mensuales",
      "Respuesta en 24-48 horas",
      "Mantenimiento correctivo básico",
      "Backup local gestionado",
    ],
  },
  {
    name: "Empresarial",
    price: "80",
    popular: true,
    target: "Para PYMES operativas",
    description: "Cobertura completa y mantenimiento proactivo.",
    features: [
      "Soporte remoto prioritario",
      "4 Visitas presenciales mensuales",
      "Mantenimiento preventivo + correctivo",
      "Optimización y limpieza de sistemas",
      "Backups diarios en la nube",
      "Respuesta en 12-24 horas",
    ],
  },
  {
    name: "Plan Corporativo",
    price: "120",
    target: "Para operaciones críticas",
    description: "Máxima prioridad y asesoría continua para tu negocio.",
    features: [
      "Soporte VIP Prioritario",
      "Visitas según necesidad",
      "Mantenimiento completo + optimizado",
      "Monitoreo activo de infraestructura",
      "Backups con verificación periódica",
      "Respuesta inmediata VIP",
    ],
  },
];

export const faqs: FAQ[] = [
  {
    question: "¿De que va el servicio?",
    answer:
      "Somos un proveedor B2B de continuidad operativa tecnológica por suscripción. Operamos un departamento IT externo para mantener redes, equipos, sistemas y datos empresariales funcionando sin interrupciones.",
  },
  {
    question: "¿Qué incluye el servicio?",
    answer:
      "Sí, dependiendo del plan elegido y la naturaleza del problema. Ciertas incidencias de hardware o red requieren nuestra asistencia in situ.",
  },
  {
    question: "¿Qué pasa si tengo una emergencia?",
    answer:
      "Nuestro equipo responde a incidencias críticas en minutos, priorizando de manera inmediata cualquier afectación a la continuidad de tu negocio.",
  },
  {
    question: "¿Cómo funcionan los backups?",
    answer:
      "Configuramos sistemas automáticos que respaldan tu información tanto localmente como en la nube, asegurando que tus datos siempre estén protegidos y disponibles.",
  },
  {
    question: "¿Qué tiempo de respuesta manejan?",
    answer:
      "Manejamos diferentes ANS (Acuerdos de Nivel de Servicio). Para planes empresariales y corporativos el tiempo puede variar desde unos pocos minutos hasta un par de horas dependiendo de la urgencia.",
  },
  {
    question: "¿Como funciona el diagnostico gratuito?",
    answer:
      "Puede agendar un dia para ir a su empresa para hacer un analisis de su infraestructura tecnológica y detectar posibles problemas de forma gratuita y sin compromiso.",
  },
  {
    question: "¿Hay pago adicionales en el servicio por suscripcion?",
    answer: "No, el servicio es por suscripcion y no hay pagos adicionales.",
  },
  {
    question:
      "¿Que pasa si quiero renovar o pagar meses adelantados?",
    answer:
      "El pago es mensual, se le notificara que debe renovar 3 dias antes de su fecha de vencimiento, luego debo renovar su plan o actualizar a uno mayor si lo desea.",
  },
];

export const useCases: UseCase[] = [
  {
    icon: ShieldCheck,
    title: "Clínicas y Consultorios",
    description:
      "Cumplimiento y protección de datos|Garantizamos la protección de datos sensibles de pacientes y la disponibilidad de sistemas médicos críticos.",
  },
  {
    icon: Briefcase,
    title: "Suites de Abogados",
    description:
      "Seguridad documental total|Máxima seguridad y respaldo inquebrantable para documentos legales y confidenciales.",
  },
  {
    icon: Activity,
    title: "PYMES",
    description:
      "Operación continua sin interrupciones|Mantenemos tu operación sin interrupciones, permitiendo a tu equipo enfocarse en vender y crecer.",
  },
  {
    icon: GraduationCap,
    title: "Colegios",
    description:
      "Soporte para laboratorios y redes|Garantizamos la continuidad de laboratorios de computación, departamente de Administración y conectividad segura para docentes y alumnos.",
  },
];
