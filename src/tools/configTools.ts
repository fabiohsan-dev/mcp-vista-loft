import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ConfigService } from '../services/ConfigService.js';

export function registerConfigTools(server: McpServer, service: ConfigService) {
  server.tool(
    'webhook_listar',
    'Lista webhooks ativos para integração em tempo real.',
    {},
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(await service.listarWebhooks(), null, 2) }]
    })
  );

  server.tool(
    'imovel_deletar_video',
    'Remove permanentemente um vídeo de um imóvel.',
    {
      codigoImovel: z.string().describe('Código do imóvel'),
      codigoVideo: z.number().int().describe('ID do vídeo a remover')
    },
    async ({ codigoImovel, codigoVideo }) => ({
      content: [{ type: 'text', text: JSON.stringify(await service.deletarVideo(codigoImovel, codigoVideo), null, 2) }]
    })
  );
}
