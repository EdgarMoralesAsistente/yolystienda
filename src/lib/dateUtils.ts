import { ScheduledAction } from '../types';

export type ActivityDateFilter = 'todas' | 'vencidas' | 'hoy' | 'manana' | 'esta_semana';

export interface TaskStatusInfo {
  status: 'vencida' | 'hoy' | 'manana' | 'esta_semana' | 'futura';
  label: string;
  badgeClass: string;
  iconName: 'alert' | 'calendar' | 'clock' | 'calendar-days';
}

export function getTaskDateStatus(fechaProgramadaStr: string): TaskStatusInfo {
  const taskDate = new Date(fechaProgramadaStr);
  const now = new Date();

  // Local calendar boundaries
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfTomorrow = new Date(endOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  // End of current week (Sunday 23:59:59 or 7 rolling days, whichever is greater)
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59, 999);
  const rolling7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const maxWeekBoundary = endOfWeek > rolling7Days ? endOfWeek : rolling7Days;

  if (taskDate < startOfToday) {
    return {
      status: 'vencida',
      label: '⚠️ Vencida',
      badgeClass: 'text-red-700 bg-red-50 border-red-200',
      iconName: 'alert'
    };
  }

  if (taskDate >= startOfToday && taskDate <= endOfToday) {
    return {
      status: 'hoy',
      label: '📅 Para Hoy',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      iconName: 'calendar'
    };
  }

  if (taskDate >= startOfTomorrow && taskDate <= endOfTomorrow) {
    return {
      status: 'manana',
      label: '⏰ Para Mañana',
      badgeClass: 'text-sky-700 bg-sky-50 border-sky-200',
      iconName: 'clock'
    };
  }

  if (taskDate > endOfTomorrow && taskDate <= maxWeekBoundary) {
    return {
      status: 'esta_semana',
      label: '🗓️ Esta Semana',
      badgeClass: 'text-[#69377D] bg-purple-50 border-purple-200',
      iconName: 'calendar-days'
    };
  }

  return {
    status: 'futura',
    label: 'Próxima',
    badgeClass: 'text-slate-600 bg-slate-50 border-slate-200',
    iconName: 'calendar'
  };
}

export function leadMatchesActivityFilter(
  accionesProgramadas: ScheduledAction[] | undefined,
  filter: ActivityDateFilter
): boolean {
  if (filter === 'todas') return true;
  if (!accionesProgramadas || accionesProgramadas.length === 0) return false;

  const pendingTasks = accionesProgramadas.filter((t) => !t.completada);
  if (pendingTasks.length === 0) return false;

  return pendingTasks.some((t) => {
    const { status } = getTaskDateStatus(t.fechaProgramada);
    if (filter === 'vencidas') {
      return status === 'vencida';
    }
    if (filter === 'hoy') {
      return status === 'hoy';
    }
    if (filter === 'manana') {
      return status === 'manana';
    }
    if (filter === 'esta_semana') {
      return status === 'hoy' || status === 'manana' || status === 'esta_semana';
    }
    return false;
  });
}
