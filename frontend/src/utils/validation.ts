export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  customMessage?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export function validateField(
  fieldName: string,
  value: string,
  rule: ValidationRule
): string | undefined {
  const trimmedValue = value.trim();

  if (rule.required && !trimmedValue) {
    return rule.customMessage || `${fieldName} es requerido`;
  }

  if (rule.minLength && trimmedValue.length > 0 && trimmedValue.length < rule.minLength) {
    return rule.customMessage || `${fieldName} debe tener al menos ${rule.minLength} caracteres`;
  }

  if (rule.maxLength && trimmedValue.length > rule.maxLength) {
    return rule.customMessage || `${fieldName} no puede exceder ${rule.maxLength} caracteres`;
  }

  return undefined;
}

export function validateForm(
  formData: Record<string, unknown>,
  rules: ValidationRules
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const fieldValue = formData[field];
    
    let value: string;
    if (typeof fieldValue === 'string') {
      value = fieldValue;
    } else if (fieldValue === null || fieldValue === undefined) {
      value = '';
    } else if (typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
      value = String(fieldValue);
    } else {
      // Para objetos u otros tipos, tratarlos como vacíos ya que no son valores válidos para campos de formulario
      value = '';
    }
    
    const error = validateField(field, value, rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

export function handleApiError(error: unknown, actionType: 'crear' | 'actualizar', entityName: string): string {
  let errorMessage = `Error al ${actionType} ${entityName}`;
  
  if (error instanceof Error) {
    if (error.message.includes('name')) {
      errorMessage = `Error: El nombre de ${entityName} ya existe o es inválido`;
    } else if (error.message.includes('description')) {
      errorMessage = 'Error: La descripción es muy larga';
    } else if (error.message.includes('version')) {
      errorMessage = 'Error: La versión es inválida';
    } else if (error.message.includes('Internal server error')) {
      errorMessage = 'Error del servidor. Verifica que todos los campos sean válidos.';
    } else {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
  }
  
  return errorMessage;
}
