import React, { useState } from 'react';
import { parameterizationApi, CreateStandardDto, UpdateStandardDto, Standard } from '../../api/parameterization/parameterization-api';
import { BaseFormDrawer } from '../shared/BaseFormDrawer';
import { ValidatedFormField } from '../shared/ValidatedFormField';
import { Toast } from '../shared/Toast';
import { useFormDrawer } from '../../hooks/shared/useFormDrawer';
import { useToast } from '../../hooks/shared/useToast';
import { handleApiError } from '../../utils/validation';
import { 
  validateStandardName, 
  validateStandardVersion, 
  validateDescription 
} from '../../utils/parameterization-validation';
import styles from '../shared/FormDrawer.module.css';

interface StandardFormDrawerProps {
  readonly standard?: Standard | null;
  readonly onClose: () => void;
  readonly onSave: (savedStandard?: Standard) => void;
}

interface FormData {
  name: string;
  description: string;
  version: string;
}

export function StandardFormDrawer({ standard, onClose, onSave }: StandardFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: standard?.name || '',
    description: standard?.description || '',
    version: standard?.version || '1.0'
  });

  const { isVisible, loading, errors, setLoading, setErrors, handleClose, clearError } = useFormDrawer({
    initialData: standard,
    onSave,
    onClose
  });
  
  const { toast, showToast, hideToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar campos obligatorios vacíos primero
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Completa este campo';
    }
    if (!formData.version.trim()) {
      newErrors.version = 'Completa este campo';
    }
    
    // Si hay campos vacíos, mostrar errores y detener
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Validar todos los campos antes de enviar
    const nameValidation = validateStandardName(formData.name);
    const versionValidation = validateStandardVersion(formData.version);
    const descriptionValidation = validateDescription(formData.description, 500);

    if (!nameValidation.valid || !versionValidation.valid || !descriptionValidation.valid) {
      setErrors({
        name: nameValidation.error || '',
        version: versionValidation.error || '',
        description: descriptionValidation.error || ''
      });
      return;
    }

    setLoading(true);
    try {
      let savedStandard: Standard;
      
      if (standard) {
        const updateData: UpdateStandardDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          version: formData.version.trim() || undefined
        };
        savedStandard = await parameterizationApi.updateStandard(standard.id, updateData);
      } else {
        const createData: CreateStandardDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          version: formData.version.trim() || undefined
        };
        // Creating standard...
        savedStandard = await parameterizationApi.createStandard(createData);
      }
      
      showToast(
        standard ? '✅ Estándar actualizado exitosamente' : '✅ Estándar creado exitosamente',
        'success'
      );
      
      // Dar tiempo para ver la notificación antes de cerrar
      setTimeout(() => {
        onSave(savedStandard);
      }, 500);
    } catch (error) {
      console.error('Error saving standard:', error);
      const errorMessage = handleApiError(error, standard ? 'actualizar' : 'crear', 'el estándar');
      if (error instanceof Error) {
        if (error.message.includes('name')) {
          // Error already handled by handleApiError
        }
      }
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <BaseFormDrawer
        isVisible={isVisible}
        title={standard ? 'Editar Estándar' : 'Nuevo Estándar'}
        subtitle={standard 
          ? 'Modifica la información del estándar de calidad'
          : 'Crea un nuevo estándar de calidad para tu organización'
        }
        onClose={handleClose}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel={standard ? 'Actualizar Estándar' : 'Crear Estándar'}
        generalError={errors.general}
      >
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Información Básica</h3>
        
        <ValidatedFormField
          id="name"
          label="Nombre del Estándar"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          placeholder="Ej: ISO 25010, CMMI, IEEE 730"
          disabled={loading}
          required
          maxLength={100}
          validateFn={validateStandardName}
          validateOnChange={true}
          helperText="Ingrese el nombre oficial del estándar de calidad"
        />

        <ValidatedFormField
          id="version"
          label="Versión"
          value={formData.version}
          onChange={(value) => handleInputChange('version', value)}
          placeholder="Ej: 1.0, 2023.1, v2.0"
          disabled={loading}
          required
          maxLength={20}
          validateFn={validateStandardVersion}
          validateOnChange={true}
          helperText="Use formato numérico: 1.0, v2.0, 2023.1"
        />

        <ValidatedFormField
          id="description"
          label="Descripción"
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe el estándar de calidad, su propósito, alcance y principales características..."
          disabled={loading}
          maxLength={500}
          type="textarea"
          rows={4}
          validateFn={(val) => validateDescription(val, 500)}
          validateOnChange={false}
          helperText="Una buena descripción ayuda a entender el contexto y aplicación del estándar"
        />
      </div>
    </BaseFormDrawer>
    </>
  );
}