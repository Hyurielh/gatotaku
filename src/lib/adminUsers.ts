import { supabase } from './supabase';

const ADMIN_USERS_FUNCTION = 'admin-users';
const ACCOUNT_STATUS_FUNCTION = 'account-status';

export class AdminUserError extends Error {}

async function readFunctionError(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown })?.context;

  if (typeof Response !== 'undefined' && context instanceof Response) {
    try {
      const payload = await context.json();
      if (payload && typeof payload.error === 'string') return payload.error;
    } catch {
      // sin cuerpo JSON
    }
  }

  return null;
}

async function callAdminUsers(body: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.functions.invoke(ADMIN_USERS_FUNCTION, { body });

  if (error) {
    const serverMessage = await readFunctionError(error);
    throw new AdminUserError(serverMessage || error.message || 'No se pudo completar la acción');
  }
}

export async function suspendUser(userId: string, message: string): Promise<void> {
  await callAdminUsers({ action: 'suspend', user_id: userId, message });
}

export async function reactivateUser(userId: string): Promise<void> {
  await callAdminUsers({ action: 'reactivate', user_id: userId });
}

export async function deleteUser(userId: string): Promise<void> {
  await callAdminUsers({ action: 'delete', user_id: userId });
}

export interface AccountStatus {
  suspended: boolean;
  message?: string;
}

/** Consulta pública: ¿la cuenta de este correo está suspendida? */
export async function fetchAccountStatus(email: string): Promise<AccountStatus> {
  try {
    const { data, error } = await supabase.functions.invoke<AccountStatus>(ACCOUNT_STATUS_FUNCTION, {
      body: { email },
    });

    if (error || !data) return { suspended: false };
    return data;
  } catch {
    return { suspended: false };
  }
}
