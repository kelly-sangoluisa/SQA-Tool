# 🎨 Sistema de Diseño - SQA Tool

## Paleta de Colores

### Colores Principales
```css
--color-primary: #4E5EA3        /* Azul principal */
--color-primary-dark: #59469A   /* Púrpura oscuro */
--color-primary-light: #7462AA  /* Púrpura claro */
--color-secondary: #4B4F9C      /* Azul secundario */
```

### Colores de Acento
```css
--color-accent-1: #3D6BA6       /* Azul acento 1 */
--color-accent-2: #5E429A       /* Púrpura acento */
--color-accent-3: #535BA3       /* Azul acento 3 */
--color-accent-4: #4971AB       /* Azul claro */
--color-accent-5: #1B72A5       /* Azul vibrante */
--color-accent-6: #7065AA       /* Lavanda */
```

### Colores Base
```css
--color-white: #FFFFFF          /* Blanco */
--color-light: #F1F1F1          /* Gris claro */
--color-blue-1: #3B6CA6         /* Azul corporativo 1 */
--color-blue-2: #3C6BA6         /* Azul corporativo 2 */
--color-blue-3: #336791         /* Azul oscuro */
```

## Tipografía

### Tamaños de Fuente
- **Títulos principales**: `clamp(2.5rem, 6vw, 4rem)` - Responsivo
- **Subtítulos**: `clamp(1rem, 2vw, 1.25rem)` - Responsivo
- **Texto normal**: `1rem` (16px)
- **Texto pequeño**: `0.875rem` (14px)

### Pesos de Fuente
- **Extra Bold**: 800 - Para títulos principales
- **Bold**: 700 - Para subtítulos y énfasis
- **Semi-bold**: 600 - Para botones y labels
- **Medium**: 500 - Para texto de apoyo
- **Regular**: 400 - Para texto normal

## Componentes

### Botones

#### Botón Principal
```css
background: linear-gradient(135deg, #4E5EA3 0%, #59469A 100%);
border-radius: 12px;
padding: 1rem 2.5rem;
box-shadow: 0 4px 12px rgba(78, 94, 163, 0.15);
```

**Estados:**
- Hover: `translateY(-2px)` + sombra aumentada
- Active: `translateY(0)`
- Disabled: `opacity: 0.6`

#### Botón Outline
```css
border: 2px solid #4E5EA3;
color: #4E5EA3;
background: transparent;
```

**Estados:**
- Hover: fondo relleno con color primario

### Inputs

```css
border: 2px solid #e5e7eb;
border-radius: 10px;
padding: 0.75rem 1rem;
```

**Estados:**
- Focus: `border-color: #4E5EA3` + sombra suave
- Error: `border-color: #dc2626` + fondo rosa claro
- Hover: `border-color: #cbd5e1`

### Cards

```css
background: #FFFFFF;
border-radius: 16px;
padding: 2rem 1.5rem;
box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
border: 1px solid rgba(78, 94, 163, 0.1);
```

**Estados:**
- Hover: `translateY(-8px)` + sombra aumentada + borde coloreado

## Efectos y Animaciones

### Transiciones
- **Rápida**: `0.2s ease` - Para cambios de color
- **Normal**: `0.3s ease` - Para la mayoría de interacciones
- **Suave**: `0.4s cubic-bezier(0.4, 0, 0.2, 1)` - Para animaciones complejas

### Animaciones

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Fade In Down
```css
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Shake (Error)
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```

## Espaciado

### Sistema de Espaciado (basado en 0.25rem = 4px)

- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)
- **3xl**: `4rem` (64px)

## Sombras

### Niveles de Elevación

```css
/* Bajo */
box-shadow: 0 4px 12px rgba(78, 94, 163, 0.15);

/* Medio */
box-shadow: 0 8px 24px rgba(78, 94, 163, 0.25);

/* Alto */
box-shadow: 0 12px 32px rgba(78, 94, 163, 0.16);

/* Muy alto */
box-shadow: 0 20px 60px rgba(78, 94, 163, 0.15);
```

## Bordes

### Radio de Bordes

- **Pequeño**: `6px` - Para elementos pequeños
- **Medio**: `10px` - Para inputs
- **Grande**: `12px` - Para botones
- **Extra grande**: `16px` - Para cards
- **Redondeado**: `24px` - Para pills/badges

## Gradientes

### Gradiente Principal
```css
background: linear-gradient(135deg, #4E5EA3 0%, #59469A 100%);
```

### Gradiente Secundario
```css
background: linear-gradient(135deg, #3D6BA6 0%, #4971AB 100%);
```

### Gradiente de Fondo
```css
background: linear-gradient(135deg, #F1F1F1 0%, #e8e9f3 50%, #d8dae8 100%);
```

## Responsive Design

### Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 768px) { /* Tablet grande */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Desktop grande */ }
```

## Accesibilidad

### Contraste
Todos los colores cumplen con WCAG 2.1 AA para contraste de texto.

### Focus States
Todos los elementos interactivos tienen estados de focus visibles:
```css
outline: none;
box-shadow: 0 0 0 4px rgba(78, 94, 163, 0.1);
```

### Screen Readers
Usar clase `.sr-only` para contenido solo para lectores de pantalla.

## Uso

### Importar Estilos

```tsx
// En componentes
import styles from './Component.module.css';

// En páginas
import '../styles/home.css';
import '../styles/components.css';
```

### Variables CSS

Las variables están disponibles globalmente en `globals.css`:

```css
:root {
  --color-primary: #4E5EA3;
  /* ... más variables */
}
```

Usar en CSS:
```css
.elemento {
  color: var(--color-primary);
}
```

## Mejores Prácticas

1. **Usar CSS Modules** para componentes específicos
2. **Reutilizar utilidades** de `components.css` cuando sea posible
3. **Mantener consistencia** en espaciado y colores
4. **Usar transiciones** para mejorar la experiencia de usuario
5. **Pensar en responsive** desde el inicio
6. **Optimizar animaciones** (usar `transform` y `opacity`)
7. **Testear accesibilidad** con lectores de pantalla

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  
**Desarrollado por**: Dev-Sentinels

**NORMAS PARA CSS LINT**
🎨 Colores
✅ USA: rgb(255 255 255 / 0.5)
❌ EVITA: rgba(255, 255, 255, 0.5)
Razón: El linter prefiere la notación moderna rgb() con sintaxis de espacio
📏 Unidades
✅ USA: margin: 0;
❌ EVITA: margin: 0px; o margin: 0rem;
Razón: No necesitas unidad cuando el valor es 0
🏷️ Nombres de Keyframes
✅ USA: @keyframes slide-down
❌ EVITA: @keyframes slideDown
Razón: El linter prefiere kebab-case (con guiones)

🔤 Font Family
✅ USA: font-family: Roboto, Arial, sans-serif;
❌ EVITA: font-family: "Roboto", "Arial", sans-serif;
Razón: No pongas comillas en nombres de fuentes de una sola palabra
🏪 Propiedades Vendor
✅ USA: Esto está bien si es necesario para compatibilidad
⚠️ CUIDADO: -webkit-background-clip: text;
Consejo: Úsalos solo cuando sean realmente necesarios
🔄 Propiedades Duplicadas
✅ USA: Una sola declaración por propiedad
❌ EVITA:
.elemento {
  background-clip: text;
  background-clip: text; /* Duplicado */
}

📱 Estructura General
/* ✅ Ejemplo de CSS bien estructurado */
.mi-componente {
  background: #ffffff;
  border-radius: 8px;
  padding: 1rem;
  margin: 0;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  font-family: Inter, Arial, sans-serif;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
⚡ Comandos Útiles
# Verificar errores de CSS
npm run lint:css

# Intentar arreglar automáticamente
npm run lint:css --fix

# Si no funciona, arreglar manualmente siguiendo estas reglas

