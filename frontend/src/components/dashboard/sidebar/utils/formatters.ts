export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric'
  });
}

export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    'completed': 'statusCompleted',
    'in_progress': 'statusInProgress',
    'cancelled': 'statusCancelled',
  };
  return statusMap[status] || '';
}

export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    'completed': 'Completado',
    'in_progress': 'En progreso',
    'cancelled': 'Cancelado',
  };
  return labelMap[status] || status;
}
