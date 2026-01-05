## 👥 Contribuir a SQA-Tool

> **📍 Nota**: Si quieres contribuir, en esta sección se describe las conveciones y estandares para realizarlo, la configuración para **desarrollo local** se encuentra en la parte de arriba. 
> La aplicación ya está desplegada en producción en:
> - Frontend: https://sqa-tool.vercel.app
> - Backend: https://sqa-tool-production.up.railway.app/api
> 

### **📝 Convenciones**

#### **Commits**
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar/modificar tests
```

#### **Estructura de Módulos**

Al agregar nuevos módulos, seguir la estructura:

```
src/modules/nuevo-modulo/
├── controllers/     # Controladores REST
├── dto/            # Data Transfer Objects
├── entities/       # Entidades de BD
├── interfaces/     # Interfaces TypeScript
├── services/       # Lógica de negocio
└── README.md       # Documentación del módulo
```

### **🧪 Tests Requeridos**

```bash
# Antes de hacer PR, asegurar que pasan todos los tests
cd backend && npm run test
cd frontend && npm run test

# Verificar lint
npm run lint
```

### **📋 Checklist de PR**

- [ ] Tests pasan ✅
- [ ] Lint sin errores ✅
- [ ] Documentación actualizada ✅
- [ ] Variables de entorno documentadas ✅
- [ ] Migraciones de BD incluidas (si aplica) ✅

### **🐛 Reportar Bugs**

1. **Buscar issues existentes** en GitHub
2. **Crear nuevo issue** con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versión de Node.js y npm

### **💡 Solicitar Features**

1. **Crear issue** con label `enhancement`
2. **Describir la funcionalidad** deseada
3. **Justificar el caso de uso**

### **📚 Recursos Adicionales**

- **[NestJS Documentation](https://docs.nestjs.com/)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Supabase Documentation](https://supabase.com/docs)**
- **[Railway Documentation](https://docs.railway.app/)**
---
