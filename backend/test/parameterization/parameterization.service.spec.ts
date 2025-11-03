import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { ParameterizationService } from '../../src/modules/parameterization/services/parameterization.service';
import { Standard } from '../../src/modules/parameterization/entities/standard.entity';
import { Criterion } from '../../src/modules/parameterization/entities/criterion.entity';
import { SubCriterion } from '../../src/modules/parameterization/entities/sub-criterion.entity';
import { Metric } from '../../src/modules/parameterization/entities/metric.entity';
import { FormulaVariable } from '../../src/modules/parameterization/entities/formula-variable.entity';
import { ItemStatus } from '../../src/modules/parameterization/types/parameterization.types';

// Factory para crear un mock genérico de un repositorio de TypeORM
const mockRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

// Mock para DataSource con transacciones
const mockDataSource = () => ({
  transaction: jest.fn(),
});

// Mock para el manager de transacciones
const mockTransactionManager = () => ({
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

// Tipo explícito para nuestro mock de repositorio
type MockRepository<T = any> = {
  find: jest.Mock;
  findOneBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  merge: jest.Mock;
  delete: jest.Mock;
};

type MockDataSource = {
  transaction: jest.Mock;
};

describe('ParameterizationService', () => {
  let service: ParameterizationService;
  let standardRepo: MockRepository<Standard>;
  let criterionRepo: MockRepository<Criterion>;
  let subCriterionRepo: MockRepository<SubCriterion>;
  let metricRepo: MockRepository<Metric>;
  let variableRepo: MockRepository<FormulaVariable>;
  let dataSource: MockDataSource;
  let mockManager: any;

  beforeEach(async () => {
    mockManager = mockTransactionManager();
    const mockDataSourceInstance = mockDataSource();
    
    // Configuramos el mock de transaction para ejecutar el callback directamente
    mockDataSourceInstance.transaction.mockImplementation(async (callback) => {
      return await callback(mockManager);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParameterizationService,
        { provide: getRepositoryToken(Standard), useValue: mockRepository() },
        { provide: getRepositoryToken(Criterion), useValue: mockRepository() },
        { provide: getRepositoryToken(SubCriterion), useValue: mockRepository() },
        { provide: getRepositoryToken(Metric), useValue: mockRepository() },
        { provide: getRepositoryToken(FormulaVariable), useValue: mockRepository() },
        { provide: DataSource, useValue: mockDataSourceInstance },
      ],
    }).compile();

    service = module.get<ParameterizationService>(ParameterizationService);
    standardRepo = module.get(getRepositoryToken(Standard));
    criterionRepo = module.get(getRepositoryToken(Criterion));
    subCriterionRepo = module.get(getRepositoryToken(SubCriterion));
    metricRepo = module.get(getRepositoryToken(Metric));
    variableRepo = module.get(getRepositoryToken(FormulaVariable));
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Pruebas para Standard ---
  describe('Standards', () => {
    it('createStandard debería crear y guardar un nuevo estándar', async () => {
      const createDto = { name: 'ISO 25010', description: 'Estándar de calidad' };
      const expectedStandard = { id: 1, ...createDto, state: ItemStatus.ACTIVE };

      standardRepo.create.mockReturnValue(createDto);
      standardRepo.save.mockResolvedValue(expectedStandard);

      const result = await service.createStandard(createDto);
      expect(standardRepo.create).toHaveBeenCalledWith(createDto);
      expect(standardRepo.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedStandard);
    });

    it('findAllStandards debería retornar todos los estándares según query', async () => {
      const query = { state: ItemStatus.ACTIVE, page: 1, limit: 10 };
      const expectedStandards = [
        { id: 1, name: 'ISO 25010', state: ItemStatus.ACTIVE },
        { id: 2, name: 'ISO 9126', state: ItemStatus.ACTIVE }
      ];

      standardRepo.find.mockResolvedValue(expectedStandards);

      const result = await service.findAllStandards(query);
      expect(standardRepo.find).toHaveBeenCalledWith({
        where: expect.any(Object),
        order: { name: 'ASC' },
        relations: ['criteria'],
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedStandards);
    });

    it('findOneStandard debería lanzar NotFoundException si el estándar no existe', async () => {
      standardRepo.findOneBy.mockResolvedValue(null);
      await expect(service.findOneStandard(99)).rejects.toThrow(NotFoundException);
      expect(standardRepo.findOneBy).toHaveBeenCalledWith({ id: 99 });
    });

    it('findOneStandard debería lanzar BadRequestException con ID inválido', async () => {
      await expect(service.findOneStandard(0)).rejects.toThrow(BadRequestException);
      await expect(service.findOneStandard(-1)).rejects.toThrow(BadRequestException);
    });

    it('updateStandard debería actualizar un estándar existente', async () => {
      const standardId = 1;
      const updateDto = { name: 'ISO 25010 Updated' };
      const existingStandard = { id: standardId, name: 'ISO 25010', state: ItemStatus.ACTIVE };
      const updatedStandard = { ...existingStandard, ...updateDto };

      standardRepo.findOneBy.mockResolvedValue(existingStandard);
      // El merge modifica el objeto original, no devuelve uno nuevo
      standardRepo.merge.mockImplementation((entity, dto) => {
        Object.assign(entity, dto);
        return entity;
      });
      standardRepo.save.mockResolvedValue(updatedStandard);

      const result = await service.updateStandard(standardId, updateDto);
      expect(standardRepo.findOneBy).toHaveBeenCalledWith({ id: standardId });
      expect(standardRepo.merge).toHaveBeenCalledWith(existingStandard, updateDto);
      expect(standardRepo.save).toHaveBeenCalledWith(existingStandard); // El merge modifica existingStandard
      expect(result).toEqual(updatedStandard);
    });

    it('updateStandardState debería actualizar el estado de un estándar', async () => {
      const standardId = 1;
      const updateStateDto = { state: ItemStatus.INACTIVE };
      const existingStandard = { id: standardId, name: 'ISO 25010', state: ItemStatus.ACTIVE };
      const updatedStandard = { ...existingStandard, state: ItemStatus.INACTIVE };

      standardRepo.findOneBy.mockResolvedValue(existingStandard);
      standardRepo.save.mockResolvedValue(updatedStandard);

      const result = await service.updateStandardState(standardId, updateStateDto);
      expect(standardRepo.findOneBy).toHaveBeenCalledWith({ id: standardId });
      expect(standardRepo.save).toHaveBeenCalledWith(updatedStandard);
      expect(result).toEqual(updatedStandard);
      expect(result.state).toBe(ItemStatus.INACTIVE);
    });
  });

  // --- Pruebas para Criterion ---
  describe('Criteria', () => {
    it('createCriterion debería fallar si el standard_id no existe', async () => {
      const createDto = { name: 'Funcionalidad', standard_id: 99 };
      
      // Mock de la validación del estándar padre que falla
      standardRepo.findOneBy.mockResolvedValue(null);
      
      await expect(service.createCriterion(createDto)).rejects.toThrow(NotFoundException);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('createCriterion debería crear un criterio si el estándar padre existe', async () => {
      const standard = { id: 1, name: 'ISO 25010', state: ItemStatus.ACTIVE };
      const createDto = { name: 'Funcionalidad', standard_id: 1 };
      const expectedCriterion = { id: 1, ...createDto, state: ItemStatus.ACTIVE };

      // Mock del estándar padre que SÍ existe
      standardRepo.findOneBy.mockResolvedValue(standard);
      mockManager.create.mockReturnValue(createDto);
      mockManager.save.mockResolvedValue(expectedCriterion);

      const result = await service.createCriterion(createDto);
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledWith(Criterion, createDto);
      expect(mockManager.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedCriterion);
    });

    it('findAllCriteria debería retornar criterios según query y standard_id', async () => {
      const query = { state: ItemStatus.ACTIVE, page: 1, limit: 10 };
      const standardId = 1;
      const expectedCriteria = [
        { id: 1, name: 'Funcionalidad', standard_id: standardId, state: ItemStatus.ACTIVE }
      ];

      criterionRepo.find.mockResolvedValue(expectedCriteria);

      const result = await service.findAllCriteria(query, standardId);
      expect(criterionRepo.find).toHaveBeenCalledWith({
        where: expect.any(Object),
        order: { name: 'ASC' },
        relations: ['sub_criteria'],
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedCriteria);
    });

    it('updateCriterion debería actualizar un criterio existente', async () => {
      const criterionId = 1;
      const updateDto = { name: 'Funcionalidad Updated' };
      const existingCriterion = { id: criterionId, name: 'Funcionalidad', standard_id: 1 };
      const updatedCriterion = { ...existingCriterion, ...updateDto };

      criterionRepo.findOneBy.mockResolvedValue(existingCriterion);
      criterionRepo.merge.mockImplementation((entity, dto) => {
        Object.assign(entity, dto);
        return entity;
      });
      criterionRepo.save.mockResolvedValue(updatedCriterion);

      const result = await service.updateCriterion(criterionId, updateDto);
      expect(criterionRepo.findOneBy).toHaveBeenCalledWith({ id: criterionId });
      expect(criterionRepo.merge).toHaveBeenCalledWith(existingCriterion, updateDto);
      expect(result).toEqual(updatedCriterion);
    });

    it('updateCriterionState debería actualizar el estado de un criterio', async () => {
      const criterionId = 1;
      const updateStateDto = { state: ItemStatus.INACTIVE };
      const existingCriterion = { id: criterionId, name: 'Funcionalidad', state: ItemStatus.ACTIVE };
      const updatedCriterion = { ...existingCriterion, state: ItemStatus.INACTIVE };

      criterionRepo.findOneBy.mockResolvedValue(existingCriterion);
      criterionRepo.save.mockResolvedValue(updatedCriterion);

      const result = await service.updateCriterionState(criterionId, updateStateDto);
      expect(criterionRepo.findOneBy).toHaveBeenCalledWith({ id: criterionId });
      expect(result.state).toBe(ItemStatus.INACTIVE);
    });
  });

  // --- Pruebas para SubCriterion ---
  describe('SubCriteria', () => {
    it('createSubCriterion debería fallar si el criterion_id no existe', async () => {
      const createDto = { name: 'Completitud', criterion_id: 99 };
      
      criterionRepo.findOneBy.mockResolvedValue(null);
      
      await expect(service.createSubCriterion(createDto)).rejects.toThrow(NotFoundException);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('createSubCriterion debería crear un sub-criterio si el criterio padre existe', async () => {
      const criterion = { id: 1, name: 'Funcionalidad', state: ItemStatus.ACTIVE };
      const createDto = { name: 'Completitud', criterion_id: 1 };
      const expectedSubCriterion = { id: 1, ...createDto, state: ItemStatus.ACTIVE };

      criterionRepo.findOneBy.mockResolvedValue(criterion);
      mockManager.create.mockReturnValue(createDto);
      mockManager.save.mockResolvedValue(expectedSubCriterion);

      const result = await service.createSubCriterion(createDto);
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledWith(SubCriterion, createDto);
      expect(result).toEqual(expectedSubCriterion);
    });

    it('findAllSubCriteria debería retornar sub-criterios según query y criterion_id', async () => {
      const query = { state: ItemStatus.ACTIVE, page: 1, limit: 10 };
      const criterionId = 1;
      const expectedSubCriteria = [
        { id: 1, name: 'Completitud', criterion_id: criterionId, state: ItemStatus.ACTIVE }
      ];

      subCriterionRepo.find.mockResolvedValue(expectedSubCriteria);

      const result = await service.findAllSubCriteria(query, criterionId);
      expect(subCriterionRepo.find).toHaveBeenCalledWith({
        where: expect.any(Object),
        order: { name: 'ASC' },
        relations: ['metrics'],
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedSubCriteria);
    });

    it('updateSubCriterionState debería actualizar el estado de un sub-criterio', async () => {
      const subCriterionId = 1;
      const updateStateDto = { state: ItemStatus.INACTIVE };
      const existingSubCriterion = { id: subCriterionId, name: 'Completitud', state: ItemStatus.ACTIVE };
      const updatedSubCriterion = { ...existingSubCriterion, state: ItemStatus.INACTIVE };

      subCriterionRepo.findOneBy.mockResolvedValue(existingSubCriterion);
      subCriterionRepo.save.mockResolvedValue(updatedSubCriterion);

      const result = await service.updateSubCriterionState(subCriterionId, updateStateDto);
      expect(subCriterionRepo.findOneBy).toHaveBeenCalledWith({ id: subCriterionId });
      expect(result.state).toBe(ItemStatus.INACTIVE);
    });
  });

  // --- Pruebas para Metric ---
  describe('Metrics', () => {
    it('createMetric debería fallar si el sub_criterion_id no existe', async () => {
      const createDto = { name: 'Tasa de éxito', sub_criterion_id: 99 };
      
      subCriterionRepo.findOneBy.mockResolvedValue(null);
      
      await expect(service.createMetric(createDto)).rejects.toThrow(NotFoundException);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('createMetric debería crear una métrica si el sub-criterio padre existe', async () => {
      const subCriterion = { id: 1, name: 'Completitud', state: ItemStatus.ACTIVE };
      const createDto = { name: 'Tasa de éxito', sub_criterion_id: 1 };
      const expectedMetric = { id: 1, ...createDto, state: ItemStatus.ACTIVE };

      subCriterionRepo.findOneBy.mockResolvedValue(subCriterion);
      mockManager.create.mockReturnValue(createDto);
      mockManager.save.mockResolvedValue(expectedMetric);

      const result = await service.createMetric(createDto);
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledWith(Metric, createDto);
      expect(result).toEqual(expectedMetric);
    });

    it('findAllMetrics debería retornar métricas según query y sub_criterion_id', async () => {
      const query = { state: ItemStatus.ACTIVE, page: 1, limit: 10 };
      const subCriterionId = 1;
      const expectedMetrics = [
        { id: 1, name: 'Tasa de éxito', sub_criterion_id: subCriterionId, state: ItemStatus.ACTIVE }
      ];

      metricRepo.find.mockResolvedValue(expectedMetrics);

      const result = await service.findAllMetrics(query, subCriterionId);
      expect(metricRepo.find).toHaveBeenCalledWith({
        where: expect.any(Object),
        order: { name: 'ASC' },
        relations: ['variables'],
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedMetrics);
    });

    it('updateMetricState debería actualizar el estado de una métrica', async () => {
      const metricId = 1;
      const updateStateDto = { state: ItemStatus.INACTIVE };
      const existingMetric = { id: metricId, name: 'Tasa de éxito', state: ItemStatus.ACTIVE };
      const updatedMetric = { ...existingMetric, state: ItemStatus.INACTIVE };

      metricRepo.findOneBy.mockResolvedValue(existingMetric);
      metricRepo.save.mockResolvedValue(updatedMetric);

      const result = await service.updateMetricState(metricId, updateStateDto);
      expect(metricRepo.findOneBy).toHaveBeenCalledWith({ id: metricId });
      expect(result.state).toBe(ItemStatus.INACTIVE);
    });
  });

  // --- Pruebas para FormulaVariable ---
  describe('FormulaVariables', () => {
    it('createVariable debería fallar si el metric_id no existe', async () => {
      const createDto = { symbol: 'A', metric_id: 99 };
      
      metricRepo.findOneBy.mockResolvedValue(null);
      
      await expect(service.createVariable(createDto)).rejects.toThrow(NotFoundException);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('createVariable debería crear una variable si la métrica padre existe', async () => {
      const metric = { id: 1, name: 'Tasa de éxito', state: ItemStatus.ACTIVE };
      const createDto = { symbol: 'A', metric_id: 1 };
      const expectedVariable = { id: 1, ...createDto, state: ItemStatus.ACTIVE };

      metricRepo.findOneBy.mockResolvedValue(metric);
      mockManager.create.mockReturnValue(createDto);
      mockManager.save.mockResolvedValue(expectedVariable);

      const result = await service.createVariable(createDto);
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledWith(FormulaVariable, createDto);
      expect(result).toEqual(expectedVariable);
    });

    it('findAllVariables debería retornar variables según query y metric_id', async () => {
      const query = { state: ItemStatus.ACTIVE, page: 1, limit: 10 };
      const metricId = 1;
      const expectedVariables = [
        { id: 1, symbol: 'A', metric_id: metricId, state: ItemStatus.ACTIVE }
      ];

      variableRepo.find.mockResolvedValue(expectedVariables);

      const result = await service.findAllVariables(query, metricId);
      expect(variableRepo.find).toHaveBeenCalledWith({
        where: expect.any(Object),
        order: { symbol: 'ASC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedVariables);
    });

    it('updateVariableState debería actualizar el estado de una variable', async () => {
      const variableId = 1;
      const updateStateDto = { state: ItemStatus.INACTIVE };
      const existingVariable = { id: variableId, symbol: 'A', state: ItemStatus.ACTIVE };
      const updatedVariable = { ...existingVariable, state: ItemStatus.INACTIVE };

      variableRepo.findOneBy.mockResolvedValue(existingVariable);
      variableRepo.save.mockResolvedValue(updatedVariable);

      const result = await service.updateVariableState(variableId, updateStateDto);
      expect(variableRepo.findOneBy).toHaveBeenCalledWith({ id: variableId });
      expect(result.state).toBe(ItemStatus.INACTIVE);
    });
  });

  // --- Tests adicionales para casos edge y validaciones ---
  describe('Casos edge y validaciones', () => {
    it('buildFindAllWhere debería manejar búsquedas con términos vacíos', async () => {
      const query = { state: ItemStatus.ACTIVE, search: '', page: 1, limit: 10 };
      const expectedStandards = [{ id: 1, name: 'ISO 25010', state: ItemStatus.ACTIVE }];

      standardRepo.find.mockResolvedValue(expectedStandards);

      const result = await service.findAllStandards(query);
      expect(standardRepo.find).toHaveBeenCalled();
      expect(result).toEqual(expectedStandards);
    });

    it('findAllStandards debería manejar filtro "all" para el estado', async () => {
      const query = { state: 'all' as any, page: 1, limit: 10 };
      const expectedStandards = [
        { id: 1, name: 'ISO 25010', state: ItemStatus.ACTIVE },
        { id: 2, name: 'ISO 9126', state: ItemStatus.INACTIVE }
      ];

      standardRepo.find.mockResolvedValue(expectedStandards);

      const result = await service.findAllStandards(query);
      expect(standardRepo.find).toHaveBeenCalled();
      expect(result).toEqual(expectedStandards);
    });

    it('findAllStandards debería manejar búsquedas con términos de búsqueda', async () => {
      const query = { state: ItemStatus.ACTIVE, search: 'ISO', page: 1, limit: 10 };
      const expectedStandards = [{ id: 1, name: 'ISO 25010', state: ItemStatus.ACTIVE }];

      standardRepo.find.mockResolvedValue(expectedStandards);

      const result = await service.findAllStandards(query);
      expect(standardRepo.find).toHaveBeenCalledWith({
        where: expect.any(Array), // Array porque incluye múltiples campos de búsqueda
        order: { name: 'ASC' },
        relations: ['criteria'],
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedStandards);
    });

    it('updateCriterion debería validar standard_id cuando se proporciona', async () => {
      const criterionId = 1;
      const updateDto = { name: 'Updated', standard_id: 2 };
      const existingCriterion = { id: criterionId, name: 'Original', standard_id: 1 };
      const standard = { id: 2, name: 'Another Standard' };

      criterionRepo.findOneBy.mockResolvedValue(existingCriterion);
      standardRepo.findOneBy.mockResolvedValue(standard);
      criterionRepo.merge.mockImplementation((entity, dto) => {
        Object.assign(entity, dto);
        return entity;
      });
      criterionRepo.save.mockResolvedValue({ ...existingCriterion, ...updateDto });

      const result = await service.updateCriterion(criterionId, updateDto);
      expect(standardRepo.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(criterionRepo.merge).toHaveBeenCalledWith(existingCriterion, updateDto);
    });

    it('updateCriterion debería fallar si standard_id no existe', async () => {
      const criterionId = 1;
      const updateDto = { standard_id: 999 };
      const existingCriterion = { id: criterionId, name: 'Original', standard_id: 1 };

      criterionRepo.findOneBy.mockResolvedValue(existingCriterion);
      standardRepo.findOneBy.mockResolvedValue(null);

      await expect(service.updateCriterion(criterionId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('findOneCriterion debería retornar criterio existente', async () => {
      const criterionId = 1;
      const expectedCriterion = { id: criterionId, name: 'Funcionalidad', state: ItemStatus.ACTIVE };

      criterionRepo.findOneBy.mockResolvedValue(expectedCriterion);

      const result = await service.findOneCriterion(criterionId);
      expect(criterionRepo.findOneBy).toHaveBeenCalledWith({ id: criterionId });
      expect(result).toEqual(expectedCriterion);
    });

    it('findOneSubCriterion debería retornar sub-criterio existente', async () => {
      const subCriterionId = 1;
      const expectedSubCriterion = { id: subCriterionId, name: 'Completitud', state: ItemStatus.ACTIVE };

      subCriterionRepo.findOneBy.mockResolvedValue(expectedSubCriterion);

      const result = await service.findOneSubCriterion(subCriterionId);
      expect(subCriterionRepo.findOneBy).toHaveBeenCalledWith({ id: subCriterionId });
      expect(result).toEqual(expectedSubCriterion);
    });

    it('findOneMetric debería retornar métrica existente', async () => {
      const metricId = 1;
      const expectedMetric = { id: metricId, name: 'Tasa de éxito', state: ItemStatus.ACTIVE };

      metricRepo.findOneBy.mockResolvedValue(expectedMetric);

      const result = await service.findOneMetric(metricId);
      expect(metricRepo.findOneBy).toHaveBeenCalledWith({ id: metricId });
      expect(result).toEqual(expectedMetric);
    });

    it('findOneVariable debería retornar variable existente', async () => {
      const variableId = 1;
      const expectedVariable = { id: variableId, symbol: 'A', state: ItemStatus.ACTIVE };

      variableRepo.findOneBy.mockResolvedValue(expectedVariable);

      const result = await service.findOneVariable(variableId);
      expect(variableRepo.findOneBy).toHaveBeenCalledWith({ id: variableId });
      expect(result).toEqual(expectedVariable);
    });
  });
});