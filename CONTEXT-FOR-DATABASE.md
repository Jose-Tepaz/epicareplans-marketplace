Este es el contexto para que entiendas como armar la base de datos, vamos a usar Supabase


## ⚙️ Datos importantes
Este ecosistema estará conformado por **tres módulos principales**, todos conectados a una **base de datos central en Supabase**, garantizando sincronización de información, trazabilidad de usuarios y una experiencia fluida tanto para clientes como para el equipo interno.

## 🚀 Módulos del Sistema

### **Módulo 1 – Sitio Web / Marketplace es que el que estamos trabaando actualmente en este proyecto y vivira en el dominio principal

Este módulo funcionará como la interfaz pública del sistema, donde los usuarios podrán:

- Explorar las **compañías aseguradoras** disponibles.
- Visualizar los **planes y coberturas** ofrecidos por cada aseguradora.
- Completar un **formulario multipasos** para validar información personal y de perfil (edad, tipo de seguro, fumador/no fumador, etc.).
    
    En base a esa información, se consultarán las APIs de las aseguradoras para mostrar los **planes compatibles** con el perfil del usuario.
    

### Flujo principal:

1. **Inicio del formulario explore:**
    
    El sistema preguntará si el usuario ya tiene una cuenta.
    
    - Si tiene cuenta → iniciará sesión mediante (Supabase Auth) y podrá saltar directamente a la visualización de planes.
    - Si no tiene cuenta →  llena el formulario explore para posterior a eso ver los plannes segun lo que compartio en el formulario

2. **Selección de planes:**
    
    El usuario podrá agregar planes a un **carrito de compras** para posteriormente iniciar el proceso de **enrollment** (inscripción).
    
3. **Enrollment:**
    
    Durante el enrollment se solicitará información detallada adicional.
    
    Una vez completado:
    
    - Los datos se enviarán a la **API de la aseguradora correspondiente**.
    - Se almacenará toda la información (excepto los datos de pago) en **Supabase**.
    - El registro se asociará automáticamente a su cuenta y será visible en su **Dashboard personal** (Módulo 2).

---

### **Módulo 2 – Dashboard del Cliente vivira en un subdominio y proyecto aparte solo usalo como contexto**

Este panel permitirá a cada usuario **visualizar, administrar y dar seguimiento** a sus seguros contratados.

El dashboard se alojará en un subdominio independiente, por ejemplo:

`admin.epicareplans.com`

Sin embargo, el inicio de sesión será unificado, permitiendo acceder desde el sitio principal (`epicareplans.com`) o directamente desde el subdominio.

### Secciones del Dashboard:

1. **Dashboard:** resumen general de actividad y pólizas activas.
2. **Applications:** estado y detalles de solicitudes o aplicaciones en curso.
3. **My Policies:** listado de pólizas activas y vencidas.
4. **Family:** gestión de familiares y seguros asociados a cada uno.
5. **Profile:** edición de datos personales y preferencias.
6. **Support:** apertura y seguimiento de tickets de soporte.
7. **Settings:** configuración de cuenta y notificaciones.

---

### **Módulo 3 – Dashboard Interno (Administrativo) vivira en un subdominio y proyecto aparte solo usalo como contexto**

Este módulo estará destinado al equipo interno de *Epicare Plans*, permitiendo **gestionar solicitudes, usuarios y documentación** del sistema.

### Secciones del Dashboard Interno:

1. **Dashboard:** métricas y analíticas generales.
2. **Requests:** gestión de aplicaciones y estatus de enrollments.
3. **Documents:** almacenamiento y control de documentos de clientes.
4. **Users:** administración de usuarios, roles y permisos.
5. **Support:** gestión centralizada de tickets.
6. **Settings:** configuración del sistema y parámetros globales.

---

## ⚙️ Tecnologías y Arquitectura

- **Frontend:** Next.js (React + TypeScript)
- **Backend:** Supabase (Base de datos + Auth + API REST)
- **Integraciones:** APIs externas de aseguradoras (consulta y envío de planes/enrollments)
- **Autenticación:** Magic Link (Supabase Auth)
- **Infraestructura:** despliegue en Vercel
- **Base de datos:** PostgreSQL gestionado por Supabase
