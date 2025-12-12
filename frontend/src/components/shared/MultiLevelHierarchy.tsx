'use client';

import { useState } from 'react';
import styles from './MultiLevelHierarchy.module.css';

/**
 * Interface base para grupos de nivel superior (ej: Evaluaciones)
 */
export interface BaseGroup {
  id: number;
  name: string;
  version?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface base para items de nivel 2 (ej: Criterios)
 */
export interface BaseLevel2Item {
  id: number;
  name: string;
  description?: string;
}

/**
 * Interface base para items de nivel 3 (ej: Subcriterios)
 */
export interface BaseLevel3Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
}

/**
 * Interface base para items de nivel 4 (ej: Métricas)
 */
export interface BaseLevel4Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
}

/**
 * Props para el componente MultiLevelHierarchy
 */
export interface MultiLevelHierarchyProps<
  TGroup extends BaseGroup,
  TLevel2 extends BaseLevel2Item,
  TLevel3 extends BaseLevel3Item,
  TLevel4 extends BaseLevel4Item
> {
  /** Grupos de nivel superior */
  groups: TGroup[];
  
  /** Función para obtener items de nivel 2 para un grupo */
  getLevel2Items: (group: TGroup) => TLevel2[];
  
  /** Función para obtener items de nivel 3 para un item de nivel 2 */
  getLevel3Items: (level2Item: TLevel2) => TLevel3[];
  
  /** Función para obtener items de nivel 4 para un item de nivel 3 */
  getLevel4Items?: (level3Item: TLevel3) => TLevel4[];
  
  /** Callback cuando se selecciona un item de nivel 4 */
  onLevel4Select?: (groupIndex: number, level4Item: TLevel4) => void;
  
  /** Item de nivel 4 actualmente seleccionado */
  activeLevel4ItemId?: number;
  
  /** Función para determinar si un item está completado */
  isItemCompleted?: (item: TLevel4) => boolean;
  
  /** Función para calcular progreso de un grupo */
  getGroupProgress?: (group: TGroup) => { completed: number; total: number };
  
  /** Función para determinar si un grupo está completamente terminado */
  isGroupCompleted?: (group: TGroup) => boolean;
  
  /** Títulos personalizados */
  labels?: {
    header?: string;
    level1?: string; // ej: "Evaluación"
    level2?: string; // ej: "Criterio"
    level3?: string; // ej: "Subcriterio"
    level4?: string; // ej: "Métrica"
    emptyGroups?: string;
    emptyLevel2?: string;
    emptyLevel3?: string;
    emptyLevel4?: string;
  };
  
  /** Mostrar nivel 4 */
  showLevel4?: boolean;
}

/**
 * Componente reutilizable de navegación jerárquica multinivel
 */
export function MultiLevelHierarchy<
  TGroup extends BaseGroup,
  TLevel2 extends BaseLevel2Item,
  TLevel3 extends BaseLevel3Item,
  TLevel4 extends BaseLevel4Item
>({
  groups,
  getLevel2Items,
  getLevel3Items,
  getLevel4Items,
  onLevel4Select,
  activeLevel4ItemId,
  isItemCompleted,
  getGroupProgress,
  isGroupCompleted,
  labels = {},
  showLevel4 = true
}: MultiLevelHierarchyProps<TGroup, TLevel2, TLevel3, TLevel4>) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedLevel2, setExpandedLevel2] = useState<Set<number>>(new Set());
  const [expandedLevel3, setExpandedLevel3] = useState<Set<number>>(new Set());

  const defaultLabels = {
    header: labels.header || 'Navegación',
    level1: labels.level1 || 'Grupo',
    level2: labels.level2 || 'Item',
    level3: labels.level3 || 'Subitem',
    level4: labels.level4 || 'Elemento',
    emptyGroups: labels.emptyGroups || 'No hay grupos disponibles',
    emptyLevel2: labels.emptyLevel2 || 'No hay items disponibles',
    emptyLevel3: labels.emptyLevel3 || 'No hay subitems disponibles',
    emptyLevel4: labels.emptyLevel4 || 'No hay elementos disponibles'
  };

  const toggleGroup = (groupId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleLevel2 = (itemId: number) => {
    const newExpanded = new Set(expandedLevel2);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedLevel2(newExpanded);
  };

  const toggleLevel3 = (itemId: number) => {
    const newExpanded = new Set(expandedLevel3);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedLevel3(newExpanded);
  };

  if (!groups || groups.length === 0) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2 className={styles.title}>{defaultLabels.header}</h2>
        </div>
        <div className={styles.navigation}>
          <div className={styles.emptyMessage}>
            {defaultLabels.emptyGroups}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>{defaultLabels.header}</h2>
      </div>

      <div className={styles.navigation}>
        {groups.map((group, groupIndex) => {
          const isGroupExpanded = expandedGroups.has(group.id);
          const progress = getGroupProgress?.(group);
          const isCompleted = isGroupCompleted?.(group) || false;
          const level2Items = getLevel2Items(group);

          return (
            <div key={group.id} className={styles.level1Group}>
              <button
                className={`${styles.level1Button} ${isGroupExpanded ? styles.level1Active : ''} ${isCompleted ? styles.level1Completed : ''}`}
                onClick={() => toggleGroup(group.id)}
              >
                <span className={styles.expandIcon}>
                  {isGroupExpanded ? '▼' : '▶'}
                </span>
                <span className={styles.level1Name}>
                  {group.name} {group.version && `v${group.version}`}
                </span>
                {progress && (
                  <span className={styles.progressBadge}>
                    ({progress.completed}/{progress.total})
                  </span>
                )}
              </button>

              {isGroupExpanded && (
                <div className={styles.level2Container}>
                  {level2Items.length === 0 ? (
                    <div className={styles.emptyMessage}>
                      {defaultLabels.emptyLevel2}
                    </div>
                  ) : (
                    level2Items.map((level2Item) => {
                      const isLevel2Expanded = expandedLevel2.has(level2Item.id);
                      const level3Items = getLevel3Items(level2Item);

                      return (
                        <div key={level2Item.id} className={styles.level2Group}>
                          <button
                            className={`${styles.level2Button} ${isLevel2Expanded ? styles.level2Active : ''}`}
                            onClick={() => toggleLevel2(level2Item.id)}
                          >
                            <span className={styles.expandIcon}>
                              {isLevel2Expanded ? '▼' : '▶'}
                            </span>
                            <span className={styles.level2Name}>
                              {level2Item.name}
                            </span>
                          </button>

                          {isLevel2Expanded && (
                            <div className={styles.level3Container}>
                              {level3Items.length === 0 ? (
                                <div className={styles.emptyMessage}>
                                  {defaultLabels.emptyLevel3}
                                </div>
                              ) : (
                                level3Items.map((level3Item) => {
                                  const isLevel3Expanded = expandedLevel3.has(level3Item.id);
                                  const level4Items = showLevel4 && getLevel4Items ? getLevel4Items(level3Item) : [];

                                  return (
                                    <div key={level3Item.id} className={styles.level3Group}>
                                      <button
                                        className={`${styles.level3Button} ${isLevel3Expanded ? styles.level3Active : ''}`}
                                        onClick={() => showLevel4 && toggleLevel3(level3Item.id)}
                                      >
                                        <span className={styles.expandIcon}>
                                          {showLevel4 ? (isLevel3Expanded ? '▼' : '▶') : '•'}
                                        </span>
                                        <span className={styles.level3Name}>
                                          {level3Item.name}
                                        </span>
                                      </button>

                                      {showLevel4 && isLevel3Expanded && getLevel4Items && (
                                        <div className={styles.level4Container}>
                                          {level4Items.length === 0 ? (
                                            <div className={styles.emptyMessage}>
                                              {defaultLabels.emptyLevel4}
                                            </div>
                                          ) : (
                                            level4Items.map((level4Item, level4LocalIndex) => {
                                              const isCompleted = isItemCompleted?.(level4Item) || false;
                                              const isActive = level4Item.id === activeLevel4ItemId;

                                              return (
                                                <button
                                                  key={level4Item.id}
                                                  className={`${styles.level4Button} ${isActive ? styles.level4Active : ''} ${isCompleted ? styles.level4Completed : ''}`}
                                                  onClick={() => onLevel4Select?.(groupIndex, level4Item)}
                                                >
                                                  <span className={`${styles.level4Number} ${isCompleted ? styles.completedNumber : ''}`}>
                                                    {isCompleted ? '✓' : level4LocalIndex + 1}
                                                  </span>
                                                  <span className={styles.level4Name}>
                                                    {level4Item.name}
                                                  </span>
                                                </button>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
