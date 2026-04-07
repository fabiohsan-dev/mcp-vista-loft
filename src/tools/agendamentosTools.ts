import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AgendamentosService } from '../services/AgendamentosService.js';
import { logger } from '../utils/logger.js';

export function registerAgendamentosTools(server: McpServer, service: AgendamentosService) {
  server.tool(
    'agendamentos_pesquisar',
    'Lista agendamentos de visitas e reuniões no CRM.',
    {
      filtros: z.record(z.any()).optional().describe('Filtros por Data, CodigoCorretor, etc.')
    },
    async ({ filtros }) => {
      try {
        const result = await service.pesquisar(filtros);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        logger.error('Erro em agendamentos_pesquisar', error);
        return { content: [{ type: 'text', text: error.message }], isError: true };
      }
    }
  );

  server.tool(
    'agendamento_cadastrar',
    'Cria um novo agendamento no Vista CRM.',
    {
      dados: z.object({
        Data: z.string().describe('Formato YYYY-MM-DD'),
        Hora: z.string().describe('Formato HH:MM'),
        CodigoCliente: z.string(),
        CodigoImovel: z.string().optional(),
        Tipo: z.string().describe('Ex: Visita, Reunião'),
      }).passthrough()
    },
    async ({ dados }) => {
      try {
        const result = await service.cadastrar(dados);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: any) {
        logger.error('Erro ao agendar', error);
        return { content: [{ type: 'text', text: error.message }], isError: true };
      }
    }
  );
}
