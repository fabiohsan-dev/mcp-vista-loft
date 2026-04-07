import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VISTA_URL: z.string().url('VISTA_URL deve ser uma URL válida'),
  VISTA_KEY: z.string().min(1, 'VISTA_KEY é obrigatória'),
  DEFAULT_LIMIT: z.coerce.number().default(20),
  MAX_LIMIT: z.coerce.number().default(50),
  TIMEOUT_MS: z.coerce.number().default(30000),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Erro de configuração ambiental:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
