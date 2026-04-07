import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PipelineService } from '../services/PipelineService.js';

export function registerPipelineTools(server: McpServer, service: PipelineService) {
  server.tool(
    'pipeline_listar',
    'Lista negociações e perfis de interesse no funil de vendas.',
    { filtros: z.record(z.any()).optional() },
    async ({ filtros }) => ({
      content: [{ type: 'text', text: JSON.stringify(await service.listarNegocios(filtros), null, 2) }]
    })
  );

  server.tool(
    'pipeline_atualizar_etapa',
    'Move um negócio para uma nova etapa do funil (ex: visita, proposta).',
    {
      codigoNegocio: z.number().int().describe('ID do negócio/perfil'),
      nomeEtapa: z.string().describe('Nome da nova etapa')
    },
    async ({ codigoNegocio, nomeEtapa }) => ({
      content: [{ type: 'text', text: JSON.stringify(await service.atualizarEtapa(codigoNegocio, nomeEtapa), null, 2) }]
    })
  );

  server.tool(
    'pipeline_campos',
    'Lista campos disponíveis para perfis de interesse e negócios.',
    {},
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(await service.listarCamposPerfil(), null, 2) }]
    })
  );
}
