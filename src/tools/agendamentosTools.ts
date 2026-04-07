import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AgendamentosService } from '../services/AgendamentosService.js';

export function registerAgendamentosTools(server: McpServer, service: AgendamentosService) {
  server.tool('agendamentos_pesquisar', 'Lista agendamentos no CRM.', { filtros: z.record(z.any()).optional() }, async ({ filtros }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar(filtros), null, 2) }] }));

  server.tool('agendamento_detalhes', 'Info de um agendamento específico.', { codigo: z.string() }, async ({ codigo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterDetalhes(codigo), null, 2) }] }));

  server.tool('agendamentos_por_corretor', 'Agenda de um corretor.', { corretor: z.string(), filtros: z.record(z.any()).optional() }, async ({ corretor, filtros }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ CodigoCorretor: corretor, ...filtros }), null, 2) }] }));

  server.tool('agendamentos_por_cliente', 'Visitas de um cliente.', { cliente: z.string(), filtros: z.record(z.any()).optional() }, async ({ cliente, filtros }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ CodigoCliente: cliente, ...filtros }), null, 2) }] }));

  server.tool('agendamentos_por_imovel', 'Visitas em um imóvel.', { imovel: z.string(), filtros: z.record(z.any()).optional() }, async ({ imovel, filtros }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ CodigoImovel: imovel, ...filtros }), null, 2) }] }));

  server.tool('agendamento_cadastrar', 'Cria novo agendamento.', { dados: z.record(z.any()) }, async ({ dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.cadastrar(dados), null, 2) }] }));

  server.tool('agendamento_alterar', 'Atualiza um agendamento.', { codigo: z.string(), dados: z.record(z.any()) }, async ({ codigo, dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.alterar(codigo, dados), null, 2) }] }));
}
