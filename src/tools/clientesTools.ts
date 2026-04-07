import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClientesService } from '../services/ClientesService.js';
import { logger } from '../utils/logger.js';

const camposSchema = z.array(z.string()).optional().describe('Campos a retornar');

export function registerClientesTools(server: McpServer, service: ClientesService) {
  server.tool(
    'clientes_pesquisar',
    'Busca clientes no CRM por nome, email ou filtros personalizados.',
    {
      campos: camposSchema,
      filtros: z.record(z.any()).optional(),
      paginacao: z.object({
        pagina: z.number().int().positive().optional(),
        quantidade: z.number().int().min(1).max(50).optional()
      }).optional(),
    },
    async (args) => {
      try {
        const result = await service.pesquisar(args);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        logger.error('Erro em clientes_pesquisar', error);
        return { content: [{ type: 'text', text: error.message }], isError: true };
      }
    }
  );

  server.tool(
    'cliente_cadastrar',
    'Cria um novo cliente no CRM Vista.',
    {
      dados: z.object({
        Nome: z.string().describe('Nome do cliente'),
        Email: z.string().email().optional(),
        Telefone: z.string().optional(),
      }).passthrough()
    },
    async ({ dados }) => {
      try {
        const result = await service.cadastrar(dados);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        logger.error('Erro ao cadastrar cliente', error);
        return { content: [{ type: 'text', text: error.message }], isError: true };
      }
    }
  );
}
