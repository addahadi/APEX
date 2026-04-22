/**
 * @typedef {{ field: string, message: string }} FieldError
 *
 * @typedef {{
 *   type        : 'field'|'auth'|'forbidden'|'conflict'|'not_found'|'server'|'network',
 *   message     : string,
 *   fieldErrors : Record<string, string>   // populated only for VALIDATION_ERROR
 * }} HandledError
 */

/**
 * @param {unknown} err  – the object rejected by the axios interceptor
 * @returns {HandledError}
 */
export function handleApiError(err) {
  // Safety: if somehow a raw Error slips through
  if (!err || typeof err !== 'object' || !('code' in err)) {
    return { type: 'server', message: 'An unexpected error occurred', fieldErrors: {} };
  }

  switch (err.code) {
    case 'VALIDATION_ERROR':
      return {
        type: 'field',
        message: err.message,
        fieldErrors: Object.fromEntries(
          (err.details ?? []).map(d => [d.field, d.message])
        ),
      };

    case 'AUTH_ERROR':
      return { type: 'auth',      message: err.message, fieldErrors: {} };

    case 'FORBIDDEN':
      return { type: 'forbidden', message: err.message, fieldErrors: {} };

    case 'NOT_FOUND':
      return { type: 'not_found', message: err.message, fieldErrors: {} };

    case 'CONFLICT':
      return { type: 'conflict',  message: err.message, fieldErrors: {} };

    case 'NETWORK_ERROR':
      return { type: 'network',   message: err.message, fieldErrors: {} };

    default:
      return { type: 'server',    message: err.message, fieldErrors: {} };
  }
}