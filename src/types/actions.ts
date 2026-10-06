export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export interface AuthState {
  error: string | null;
  message: string | null;
}
