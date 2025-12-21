## Contribuir — Convenciones para el frontend

Este documento es una guía corta para mantener coherencia en el frontend cuando pequeñas —pero crecientes— personas trabajen en paralelo. Está pensada para equipos pequeños (~4 personas) y nuevos colaboradores.

Principios generales
- Favor la claridad y la simplicidad. Evita soluciones demasiado dinámicas o magia que sean difíciles de depurar.
- Mantén estilos acotados: usa CSS Modules colocados junto al componente para estilos específicos, y un archivo global mínimo para utilidades y tokens (`frontend/src/styles/components.css`).
- Componentes compartidos deben ser estables, pequeños y bien tipados. Evita pasar estilos mediante strings CSS grandes; mejor props que activen variantes.

Estructura recomendada
- `frontend/src/components/<feature>/...` — componentes de la feature/área (p. ej. `auth/`, `dashboard/`).
- `frontend/src/components/shared/` — componentes reutilizables y estables (Button, Input, Loading). Cambios aquí deben revisarse con más cuidado.
- `frontend/src/styles/` — estilos globales y módulos de área (`auth/`, `dashboard/`). Importa el CSS global mínimo en `src/app/layout.tsx`.

Reglas para componentes
1. Cada componente exporta por defecto su implementación principal desde un archivo `Component.tsx` y tiene un `Component.module.css` al lado.
2. Prop-drilling mínimo: cuando necesites personalización visual, usa props tipo `variant?: 'primary' | 'secondary'` y `size?: 'sm'|'md'|'lg'` en vez de aceptar `className` arbitraria (acepta `className` solo para casos especiales).
3. `shared/` acepta breaking-changes solo mediante PRs revisadas por al menos otra persona.

CSS
- Prefiere CSS Modules (co-located) para evitar colisiones. Usa nombres semánticos (por ejemplo `.card`, `.title`) no utilitarios.
- Mantén `frontend/src/styles/components.css` para utilidades transitorias y tokens: colores, resets, helper-classes. Evita llenarlo de reglas específicas de componente.

Flujo de trabajo / Git
- Crea ramas con nombres: `feature/<ticket>-short-desc` o `fix/<ticket>-short-desc`.
- Haz PRs hacia `main`. Añade descripción y screenshots si tocas UI.
- Para cambios en `shared/` escribe tests o añade reviewer explícito.

Dev tools sugeridos
- Ejecuta `npx tsc --noEmit` antes de abrir PR.
- Añade `eslint` y `stylelint` en una tarea de CI para asegurar convenciones.

Pequeño template (usar como referencia)
- Ver `frontend/src/components/COMPONENT_TEMPLATE/Template.tsx` y `Template.module.css`.
