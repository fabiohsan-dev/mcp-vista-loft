import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ImoveisService } from '../services/ImoveisService.js';
import { logger } from '../utils/logger.js';

const camposSchema = z.array(z.string()).optional().describe('Lista de campos a retornar');
const filtrosSchema = z.record(z.any()).optional().describe('Filtros de pesquisa (Vista Syntax)');

export function registerImoveisTools(server: McpServer, service: ImoveisService) {
  server.tool(
    'imoveis_pesquisar',
    'Busca imóveis no Vista CRM com suporte a filtros e paginação.',
    {
      campos: camposSchema,
      filtros: filtrosSchema,
      paginacao: z.object({
        pagina: z.number().int().positive().optional(),
        quantidade: z.number().int().min(1).max(50).optional()
      }).optional(),
      ordenacao: z.record(z.enum(['asc', 'desc'])).optional(),
    },
    async (args) => {
      try {
        const result = await service.pesquisar(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        logger.error('Erro em imoveis_pesquisar', error);
        return {
          content: [{ type: 'text', text: `Erro ao pesquisar imóveis: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'imovel_detalhes',
    'Obtém informações completas de um imóvel específico pelo código.',
    {
      codigo: z.string().describe('Código único do imóvel no Vista'),
      campos: camposSchema,
    },
    async ({ codigo, campos }) => {
      try {
        const result = await service.obterDetalhes(codigo, campos);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        logger.error(`Erro ao obter detalhes do imóvel ${codigo}`, error);
        return {
          content: [{ type: 'text', text: `Erro: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
