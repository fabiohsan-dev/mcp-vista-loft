import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ImoveisService } from '../services/ImoveisService.js';

const camposSchema = z.array(z.string()).optional().describe('Lista de campos a retornar');
const filtrosSchema = z.record(z.any()).optional().describe('Filtros de pesquisa (Vista Syntax)');
const paginacaoSchema = z.object({
  pagina: z.number().int().positive().optional(),
  quantidade: z.number().int().min(1).max(50).optional()
}).optional();

export function registerImoveisTools(server: McpServer, service: ImoveisService) {
  server.tool('imoveis_pesquisar', 'Busca imóveis com filtros e paginação.', { campos: camposSchema, filtros: filtrosSchema, paginacao: paginacaoSchema, ordenacao: z.record(z.enum(['asc', 'desc'])).optional() }, async (args) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar(args), null, 2) }] }));

  server.tool('imovel_detalhes', 'Informações completas de um imóvel.', { codigo: z.string(), campos: camposSchema }, async ({ codigo, campos }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterDetalhes(codigo, campos), null, 2) }] }));

  server.tool('imovel_fotos', 'Lista de fotos do imóvel.', { codigo: z.string() }, async ({ codigo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterFotos(codigo), null, 2) }] }));

  server.tool('imovel_anexos', 'Documentos anexos do imóvel.', { codigo: z.string() }, async ({ codigo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterAnexos(codigo), null, 2) }] }));

  server.tool('imovel_historico', 'Histórico de eventos do imóvel.', { codigo: z.string() }, async ({ codigo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterHistorico(codigo), null, 2) }] }));

  server.tool('imovel_informacoes', 'Informações resumidas/destacadas.', { codigo: z.string() }, async ({ codigo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterInformacoes(codigo), null, 2) }] }));

  server.tool('imoveis_campos', 'Descobre campos disponíveis na API.', {}, async () => ({ content: [{ type: 'text', text: JSON.stringify(await service.listarCampos(), null, 2) }] }));

  server.tool('imoveis_listas', 'Listas de cidades, bairros ou tipos.', { tipo: z.enum(['cidades', 'bairros', 'tipos', 'finalidades', 'categorias']) }, async ({ tipo }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.obterListas(tipo), null, 2) }] }));

  server.tool('imoveis_por_corretor', 'Imóveis vinculados a um corretor.', { corretor: z.string(), campos: camposSchema, filtros: filtrosSchema, paginacao: paginacaoSchema }, async ({ corretor, ...args }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ ...args, filtros: { CodigoCorretor: corretor, ...args.filtros } }), null, 2) }] }));

  server.tool('imoveis_por_agencia', 'Imóveis de uma agência específica.', { agencia: z.string(), campos: camposSchema, filtros: filtrosSchema, paginacao: paginacaoSchema }, async ({ agencia, ...args }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.pesquisar({ ...args, filtros: { CodigoAgencia: agencia, ...args.filtros } }), null, 2) }] }));

  server.tool('imovel_cadastrar', 'Cadastra um novo imóvel.', { dados: z.record(z.any()) }, async ({ dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.cadastrar(dados), null, 2) }] }));

  server.tool('imovel_alterar', 'Atualiza dados de um imóvel.', { codigo: z.string(), dados: z.record(z.any()) }, async ({ codigo, dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.alterar(codigo, dados), null, 2) }] }));

  server.tool('imovel_cadastrar_fotos', 'Adiciona fotos ao imóvel.', { codigo: z.string(), fotos: z.array(z.record(z.any())) }, async ({ codigo, fotos }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.cadastrarFotos(codigo, fotos), null, 2) }] }));

  server.tool('imovel_cadastrar_documentos', 'Adiciona documentos ao imóvel.', { codigo: z.string(), documentos: z.array(z.record(z.any())) }, async ({ codigo, documentos }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.cadastrarDocumentos(codigo, documentos), null, 2) }] }));

  server.tool('imovel_cadastrar_historico', 'Registra evento no histórico.', { codigo: z.string(), dados: z.record(z.any()) }, async ({ codigo, dados }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.cadastrarHistorico(codigo, dados), null, 2) }] }));

  server.tool('imovel_cadastrar_proprietario', 'Vincula proprietário ao imóvel.', { codigo: z.string(), proprietario: z.record(z.any()) }, async ({ codigo, proprietario }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.vincularProprietario(codigo, proprietario), null, 2) }] }));

  server.tool('imovel_definir_corretor', 'Define corretor responsável.', { codigo: z.string(), corretor: z.string() }, async ({ codigo, corretor }) => ({ content: [{ type: 'text', text: JSON.stringify(await service.definirCorretor(codigo, corretor), null, 2) }] }));
}
