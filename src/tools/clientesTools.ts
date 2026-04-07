import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ClientesService } from '../services/ClientesService.js';

const camposSchema = z.array(z.string()).optional().describe('Campos a retornar');
const filtrosSchema = z.record(z.any()).optional().describe('Filtros de pesquisa');
const paginacaoSchema = z.object({
  pagina: z.number().int().positive().optional(),
  quantidade: z.number().int().min(1).max(50).optional()
}).optional();

export function registerClientesTools(server: McpServer, service: ClientesService) {
  server.tool('clientes_pesquisar', 'Busca clientes com filtros.', { campos: camposSchema, filtros: filtrosSchema, paginacao: paginacaoSchema }, async (args) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar(args), null, 2) }] }));

  server.tool('cliente_detalhes', 'Info completa do cliente.', { codigo: z.string(), campos: camposSchema }, async ({ codigo, campos }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterDetalhes(codigo, campos), null, 2) }] }));

  server.tool('cliente_historico', 'Histórico de interações.', { codigo: z.string() }, async ({ codigo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterHistorico(codigo), null, 2) }] }));

  server.tool('cliente_favoritos', 'Imóveis favoritados.', { codigo: z.string() }, async ({ codigo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterFavoritos(codigo), null, 2) }] }));

  server.tool('clientes_campos', 'Campos disponíveis para clientes.', {}, async () => ({ content: [{ type: 'text', text: JSON.stringify(await service.listarCampos(), null, 2) }] }));

  server.tool('clientes_por_corretor', 'Clientes do corretor.', { corretor: z.string(), campos: camposSchema, filtros: filtrosSchema, paginacao: paginacaoSchema }, async ({ corretor, ...args }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ ...args, filtros: { CodigoCorretor: corretor, ...args.filtros } }), null, 2) }] }));

  server.tool('clientes_por_agencia', 'Clientes da agência.', { agencia: z.string(), campos: camposSchema, filtros: filtrosSchema, paginacao: paginacaoSchema }, async ({ agencia, ...args }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ ...args, filtros: { CodigoAgencia: agencia, ...args.filtros } }), null, 2) }] }));

  server.tool('cliente_cadastrar', 'Cria um novo cliente.', { dados: z.record(z.any()) }, async ({ dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.cadastrar(dados), null, 2) }] }));

  server.tool('cliente_alterar', 'Atualiza dados do cliente.', { codigo: z.string(), dados: z.record(z.any()) }, async ({ codigo, dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.alterar(codigo, dados), null, 2) }] }));

  server.tool('cliente_cadastrar_historico', 'Registra contato/evento.', { codigo: z.string(), dados: z.record(z.any()) }, async ({ codigo, dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.cadastrarHistorico(codigo, dados), null, 2) }] }));

  server.tool('cliente_definir_corretor', 'Define corretor do cliente.', { codigo: z.string(), corretor: z.string() }, async ({ codigo, corretor }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.definirCorretor(codigo, corretor), null, 2) }] }));

  server.tool('lead_enviar', 'Envia lead de fonte externa.', { dados: z.object({ Nome: z.string(), Email: z.string().email().optional(), Telefone: z.string().optional() }).passthrough() }, async ({ dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.enviarLead(dados), null, 2) }] }));

  server.tool('leads_pesquisar', 'Busca leads capturados.', { campos: camposSchema, filtros: filtrosSchema, paginacao: paginacaoSchema }, async (args) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ ...args, filtros: { Origem: { '!=': null }, ...args.filtros } }), null, 2) }] }));
}
