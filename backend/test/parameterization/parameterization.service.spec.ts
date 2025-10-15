import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { ParameterizationService } from '../../src/modules/parameterization/services/parameterization.service';
import { Standard } from '../../src/modules/parameterization/entities/standard.entity';
import { Criterion } from '../../src/modules/parameterization/entities/criterion.entity';
import { SubCriterion } from '../../src/modules/parameterization/entities/sub-criterion.entity';
import { Metric } from '../../src/modules/parameterization/entities/metric.entity';
import { FormulaVariable } from '../../src/modules/parameterization/entities/formula-variable.entity';

// Factory para crear un mock genérico de un repositorio de TypeORM
const mockRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

// ✅ CORRECCIÓN: Definimos un tipo explícito para nuestro mock.
// Esto le dice a TypeScript exactamente qué métodos están disponibles.
type MockRepository<T = any> = {
  find: jest.Mock;
  findOneBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  merge: jest.Mock;
  delete: jest.Mock;
};

describe('ParameterizationService', () => {
  let service: ParameterizationService;
  let standardRepo: MockRepository<Standard>;
  let criterionRepo: MockRepository<Criterion>;
  let subCriterionRepo: MockRepository<SubCriterion>;
  let metricRepo: MockRepository<Metric>;
  let variableRepo: MockRepository<FormulaVariable>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParameterizationService,
        { provide: getRepositoryToken(Standard), useValue: mockRepository() },
        { provide: getRepositoryToken(Criterion), useValue: mockRepository() },
        { provide: getRepositoryToken(SubCriterion), useValue: mockRepository() },
        { provide: getRepositoryToken(Metric), useValue: mockRepository() },
        { provide: getRepositoryToken(FormulaVariable), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<ParameterizationService>(ParameterizationService);
    standardRepo = module.get(getRepositoryToken(Standard));
    criterionRepo = module.get(getRepositoryToken(Criterion));
    subCriterionRepo = module.get(getRepositoryToken(SubCriterion));
    metricRepo = module.get(getRepositoryToken(Metric));
    variableRepo = module.get(getRepositoryToken(FormulaVariable));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para Standard ---
  describe('Standards', () => {
    it('createStandard debería crear y guardar un nuevo estándar', async () => {
      const createDto = { name: 'ISO 25010' };
      const expectedStandard = { id: 1, ...createDto };

      standardRepo.create.mockReturnValue(createDto);
      standardRepo.save.mockResolvedValue(expectedStandard);

      const result = await service.createStandard(createDto);
      expect(standardRepo.create).toHaveBeenCalledWith(createDto);
      expect(standardRepo.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedStandard);
    });

    it('findOneStandard debería lanzar NotFoundException si el estándar no existe', async () => {
      standardRepo.findOneBy.mockResolvedValue(null);
      await expect(service.findOneStandard(99)).rejects.toThrow(NotFoundException);
    });

    it('removeStandard debería eliminar un estándar existente', async () => {
      const standardId = 1;
      // findOneOrFail (usado internamente por el servicio) necesita que esto devuelva un objeto
      jest.spyOn(service, 'findOneStandard').mockResolvedValue({ id: standardId } as Standard);
      standardRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeStandard(standardId);
      expect(standardRepo.delete).toHaveBeenCalledWith(standardId);
      expect(result).toEqual({ message: `Standard with ID ${standardId} deleted` });
    });
  });

  // --- Pruebas para Criterion ---
  describe('Criteria', () => {
    it('createCriterion debería fallar si el standard_id no existe', async () => {
      // Simulamos que el estándar padre no se encuentra
      jest.spyOn(service, 'findOneStandard').mockRejectedValue(new NotFoundException('Standard with ID 99 not found'));
      
      const createDto = { name: 'Funcionalidad', standard_id: 99 };
      
      await expect(service.createCriterion(createDto)).rejects.toThrow(
        new NotFoundException('Standard with ID 99 not found'),
      );
    });

    it('createCriterion debería crear un criterio si el estándar padre existe', async () => {
      const standard = { id: 1, name: 'ISO 25010' };
      const createDto = { name: 'Funcionalidad', standard_id: 1 };
      const expectedCriterion = { id: 1, ...createDto };

      // Simulamos que el estándar padre SÍ se encuentra
      jest.spyOn(service, 'findOneStandard').mockResolvedValue(standard as Standard);
      criterionRepo.create.mockReturnValue(createDto);
      criterionRepo.save.mockResolvedValue(expectedCriterion);

      const result = await service.createCriterion(createDto);
      expect(service.findOneStandard).toHaveBeenCalledWith(1);
      expect(criterionRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expectedCriterion);
    });
  });

   // --- Pruebas para SubCriterion ---
   describe('SubCriteria', () => {
    it('createSubCriterion debería fallar si el criterion_id no existe', async () => {
      jest.spyOn(service, 'findOneCriterion').mockRejectedValue(new NotFoundException());
      const createDto = { name: 'Completitud', criterion_id: 99 };
      await expect(service.createSubCriterion(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Pruebas para Metric ---
  describe('Metrics', () => {
    it('createMetric debería fallar si el sub_criterion_id no existe', async () => {
      jest.spyOn(service, 'findOneSubCriterion').mockRejectedValue(new NotFoundException());
      const createDto = { name: 'Tasa de éxito', sub_criterion_id: 99 };
      await expect(service.createMetric(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Pruebas para FormulaVariable ---
  describe('FormulaVariables', () => {
    it('createVariable debería fallar si el metric_id no existe', async () => {
      jest.spyOn(service, 'findOneMetric').mockRejectedValue(new NotFoundException());
      const createDto = { symbol: 'A', metric_id: 99 };
      await expect(service.createVariable(createDto)).rejects.toThrow(NotFoundException);
    });
  });
});