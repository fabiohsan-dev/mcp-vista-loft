/**
 * Remove recursivamente chaves com valores null, undefined, strings vazias ou objetos/arrays vazios.
 * Focado em reduzir o número de tokens enviados para o LLM.
 */
export function optimizePayload<T>(obj: T): any {
  if (obj === null || obj === undefined || obj === '') return undefined;

  if (Array.isArray(obj)) {
    const arr = obj
      .map(optimizePayload)
      .filter((val) => val !== undefined);
    return arr.length > 0 ? arr : undefined;
  }

  if (typeof obj === 'object' && obj !== null) {
    const cleaned: Record<string, any> = {};
    let hasValidKeys = false;

    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = optimizePayload(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
        hasValidKeys = true;
      }
    }

    return hasValidKeys ? cleaned : undefined;
  }

  return obj;
}
