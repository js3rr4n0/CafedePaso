# Café de Paso - POS System

Sistema de Punto de Venta (POS) moderno y eficiente, diseñado específicamente para la cafetería "Café de Paso". Construido con Next.js, React, Material-UI y PostgreSQL (Neon).

## 📸 Capturas del Sistema

### Módulo de Ventas
![Módulo de Ventas](/screenshots/ventas.png)
*Interfaz principal para toma de pedidos y cobro, con acceso rápido a categorías de productos y carrito de compras.*

### Historial de Ventas
![Historial de Ventas](/screenshots/historial.png)
*Historial completo de ventas con filtros por fecha y desglose de ingresos por método de pago.*

## 🚀 Características Principales

- **Gestión de Ventas:** Interfaz intuitiva para registrar compras de forma rápida (optimizado para pantallas táctiles/tablets).
- **Control de Productos:** Administra el catálogo de bebidas, comida y extras.
- **Historial y Cierres:** Consulta de ventas históricas, generación de reportes y cortes de caja diarios, semanales o mensuales.
- **Exportación de Datos:** Descarga en formato CSV de detalles de ventas, productos populares y cierres para contabilidad.
- **Base de Datos en la Nube:** Sincronización en tiempo real con Neon (PostgreSQL).

## 🛠️ Tecnologías Utilizadas

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/) (MUI v6)
- [PostgreSQL](https://www.postgresql.org/) alojado en [Neon](https://neon.tech/)
- Iconos de [Lucide-React](https://lucide.dev/)

## 📦 Instalación y Uso Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/js3rr4n0/CafedePaso.git
   ```

2. Instalar las dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno (`.env.local`):
   ```env
   DATABASE_URL="postgres://tu_usuario:tu_password@tu_host_neon/tu_bd?sslmode=require"
   ```

4. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.
