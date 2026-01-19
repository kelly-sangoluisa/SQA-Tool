import { validateThresholdFormat } from '../../src/utils/data-entry/thresholdUtils';

describe('validateThresholdFormat', () => {
  describe('Formatos válidos', () => {
    it('debe aceptar números simples', () => {
      expect(validateThresholdFormat('0').valid).toBe(true);
      expect(validateThresholdFormat('1').valid).toBe(true);
      expect(validateThresholdFormat('10.5').valid).toBe(true);
      expect(validateThresholdFormat('100').valid).toBe(true);
    });

    it('debe aceptar números con operadores', () => {
      expect(validateThresholdFormat('>=10').valid).toBe(true);
      expect(validateThresholdFormat('>20').valid).toBe(true);
      expect(validateThresholdFormat('<=5').valid).toBe(true);
      expect(validateThresholdFormat('<100').valid).toBe(true);
      expect(validateThresholdFormat('=50').valid).toBe(true);
    });

    it('debe aceptar números con unidades', () => {
      expect(validateThresholdFormat('20 min').valid).toBe(true);
      expect(validateThresholdFormat('0%').valid).toBe(true);
      expect(validateThresholdFormat('0 seg').valid).toBe(true);
      expect(validateThresholdFormat('15ms').valid).toBe(true);
      expect(validateThresholdFormat('10 s').valid).toBe(true);
    });

    it('debe aceptar ratios completos', () => {
      expect(validateThresholdFormat('10/20').valid).toBe(true);
      expect(validateThresholdFormat('0/1').valid).toBe(true);
      expect(validateThresholdFormat('5.5/10.2').valid).toBe(true);
    });

    it('debe aceptar ratios con operadores y unidades', () => {
      expect(validateThresholdFormat('>=10/3min').valid).toBe(true);
      expect(validateThresholdFormat('0/1min').valid).toBe(true);
      expect(validateThresholdFormat('>5/10seg').valid).toBe(true);
      expect(validateThresholdFormat('<=15/20%').valid).toBe(true);
    });

    it('debe aceptar campos vacíos', () => {
      expect(validateThresholdFormat('').valid).toBe(true);
      expect(validateThresholdFormat('   ').valid).toBe(true);
    });
  });

  describe('Formatos inválidos', () => {
    it('debe rechazar operador incorrecto "=>"', () => {
      const result = validateThresholdFormat('=>10');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Operador inválido "=>"');
      expect(result.error).toContain('Use ">="');
    });

    it('debe rechazar operador incorrecto "=<"', () => {
      const result = validateThresholdFormat('=<10');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Operador inválido "=<"');
      expect(result.error).toContain('Use "<="');
    });

    it('debe rechazar ratios incompletos con unidades de tiempo', () => {
      const result = validateThresholdFormat('>=10/min');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato inválido');
      expect(result.error).toContain('/min');
    });

    it('debe rechazar ratios sin denominador', () => {
      const result = validateThresholdFormat('10/');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de ratio inválido');
    });

    it('debe rechazar ratios sin numerador', () => {
      const result = validateThresholdFormat('/10');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de ratio inválido');
    });

    it('debe rechazar valores no numéricos', () => {
      const result = validateThresholdFormat('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Valor numérico inválido');
    });

    it('debe rechazar formatos mixtos incorrectos', () => {
      const result = validateThresholdFormat('>=10/seg');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato inválido');
    });
  });

  describe('Casos específicos reportados', () => {
    it('debe rechazar "=>10/min" (caso reportado por usuario)', () => {
      const result = validateThresholdFormat('=>10/min');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Operador inválido');
    });

    it('debe aceptar ">=10/1min" (formato correcto)', () => {
      const result = validateThresholdFormat('>=10/1min');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
