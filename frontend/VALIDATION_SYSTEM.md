# Sistema de Validación y Retroalimentación para Formularios de Parameterización

## 🎯 Resumen

Se ha implementado un sistema completo de validación en tiempo real con retroalimentación visual para todos los formularios de parameterización (Estándares, Criterios, Subcriterios y Métricas).

## ✨ Características Principales

### 1. **Validación en Tiempo Real**
- Los campos se validan mientras el usuario escribe
- Feedback inmediato visual con colores y iconos
- Mensajes descriptivos y específicos para cada error

### 2. **Mensajes de Retroalimentación**
Los mensajes se clasifican en tres tipos:

- **❌ Error** (Rojo): Campo inválido que impide guardar
- **⚠️ Advertencia** (Amarillo): Campo válido pero se recomienda mejorar
- **✅ Éxito** (Verde): Campo válido y bien formateado

### 3. **Validaciones Específicas por Tipo de Campo**

#### **Estándar**
- **Nombre**: 
  - ✅ Mínimo 2 caracteres, máximo 100
  - ❌ No solo números
  - ❌ Sin caracteres especiales (`<>{}[]|\``)
  - Ejemplo válido: "ISO 25010"

- **Versión**:
  - ✅ Formato numérico: 1.0, v2.0, 2023.1
  - ❌ Solo letras o caracteres especiales
  - Ejemplo válido: "v1.0", "2023.1"

#### **Criterio / Subcriterio**
- **Nombre**:
  - ✅ Mínimo 2 caracteres, máximo 100
  - ❌ Sin caracteres especiales prohibidos
  - Ejemplo válido: "Funcionalidad", "Gestión de Defectos"

#### **Métrica**
- **Nombre**:
  - ✅ Mínimo 3 caracteres, máximo 150
  - Ejemplo válido: "Porcentaje de éxito en pruebas"

- **Código**:
  - ✅ Solo letras, números, guiones y puntos
  - ⚠️ Opcional pero recomendado
  - ✅ Formato estándar detectado: "PO-1", "FN-12"
  - Ejemplo válido: "PO-1", "FUNC_001"

- **Fórmula**:
  - ✅ Variables en mayúsculas (A-Z)
  - ✅ Operadores permitidos: +, -, *, /, (, )
  - ✅ Paréntesis balanceados
  - ⚠️ Opcional
  - ✅ Patrones detectados: división (A/B), porcentaje (*100)
  - Ejemplo válido: "(N_EXITO / N_TOTAL) * 100"

- **Umbral Deseado / Peor Caso**:
  - ✅ Números simples: "0", "1", "10.5"
  - ✅ Con operadores: ">=10", ">20", "<=5"
  - ✅ Con unidades: "20 min", "0%", "15 seg"
  - ✅ Ratios completos: ">=10/3min", "0/1min"
  - ❌ Operador incorrecto "=>" (usar ">=")
  - ❌ Ratios incompletos: ">=10/min" (usar ">=10/1min")
  - Ejemplos válidos: ">=10/1min", "0%", ">=4"

- **Variables de Fórmula**:
  - **Símbolo**: 
    - ✅ Comenzar con mayúscula
    - ✅ Solo letras, números y guiones bajos
    - ✅ Máximo 30 caracteres
    - Ejemplo válido: "N_TOTAL", "VALOR_A"
  
  - **Descripción**:
    - ✅ Mínimo 3 caracteres, máximo 200
    - Ejemplo válido: "Número total de casos de prueba"

#### **Descripción (Todos los formularios)**
- ⚠️ Se recomienda al menos 10 caracteres
- ✅ Descripción completa: 50+ caracteres
- ❌ Máximo 500 caracteres
- Contador de caracteres con advertencias visuales

## 📋 Ejemplos de Uso

### Crear un Estándar
```
Nombre: ISO 25010
✅ Nombre válido

Versión: v1.0
✅ Versión válida

Descripción: Estándar internacional para la evaluación...
✅ Descripción completa (45 caracteres)
```

### Crear una Métrica
```
Nombre: Porcentaje de éxito en pruebas
✅ Nombre válido

Código: PO-1
✅ Código con formato estándar (ej: PO-1)

Fórmula: (N_EXITO / N_TOTAL) * 100
✅ Fórmula de porcentaje detectada

Umbral Deseado: >=90%
✅ Umbral con operador válido

Peor Caso: <50%
✅ Umbral con operador válido
```

### Errores Comunes y Soluciones

#### ❌ Error: "Operador inválido '=>'. Use '>=' en su lugar"
**Entrada incorrecta:** `=>10/min`
**Solución:** `>=10/1min`

#### ❌ Error: "Formato inválido '10/min'. Use el formato completo, ej: '10/1min'"
**Entrada incorrecta:** `>=10/min`
**Solución:** `>=10/1min` o `>=10/3min`

#### ❌ Error: "El símbolo debe comenzar con mayúscula..."
**Entrada incorrecta:** `n_total`
**Solución:** `N_TOTAL`

#### ❌ Error: "Paréntesis desbalanceados en la fórmula"
**Entrada incorrecta:** `(A / B * 100`
**Solución:** `(A / B) * 100`

## 🎨 Experiencia de Usuario

### Estados Visuales

1. **Campo Neutral**: Borde gris, sin mensaje
2. **Campo con Éxito**: 
   - Borde verde
   - Fondo verde claro
   - Ícono ✓ con mensaje verde
3. **Campo con Advertencia**:
   - Borde normal
   - Ícono ⚠️ con mensaje amarillo
4. **Campo con Error**:
   - Borde rojo
   - Fondo rojo claro
   - Ícono ❌ con mensaje rojo

### Contador de Caracteres
- **Normal** (0-80%): Gris
- **Advertencia** (80-95%): Naranja
- **Crítico** (>95%): Rojo parpadeante

## 🧪 Tests

Se han creado 15 tests automáticos para validar el sistema de umbrales:
- ✅ 15/15 tests pasando
- Cobertura completa de casos válidos e inválidos
- Casos específicos reportados por usuarios

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `frontend/src/utils/parameterization-validation.ts` - Funciones de validación
- `frontend/src/components/shared/ValidatedFormField.tsx` - Componente con validación
- `frontend/src/components/shared/FormField.module.css` - Estilos
- `frontend/test/utils/thresholdValidation.test.ts` - Tests

### Archivos Modificados
- `frontend/src/utils/data-entry/thresholdUtils.ts` - Función validateThresholdFormat()
- `frontend/src/components/parameterization/MetricFormDrawer.tsx` - Validación mejorada
- `frontend/src/components/parameterization/StandardFormDrawer.tsx` - ValidatedFormField
- `frontend/src/components/parameterization/CriterionFormDrawer.tsx` - ValidatedFormField
- `frontend/src/components/parameterization/SubCriterionFormDrawer.tsx` - ValidatedFormField

## 🚀 Beneficios

1. **Reducción de Errores**: Validación antes de enviar al backend
2. **Mejor UX**: Feedback inmediato y claro
3. **Aprendizaje**: Los usuarios aprenden el formato correcto mientras escriben
4. **Eficiencia**: Menos retrabajos y correcciones
5. **Confianza**: Los usuarios saben que están ingresando datos correctos

## 🔄 Próximos Pasos Recomendados

1. Agregar validación cruzada entre campos relacionados
2. Agregar tooltips informativos
3. Agregar ejemplos interactivos
4. Crear una guía de formato visible en el formulario
5. Agregar validación de backend sincronizada
