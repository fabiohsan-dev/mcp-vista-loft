import { VistaClient } from '../clients/VistaClient.js';
import { optimizePayload } from '../utils/payloadOptimizer.js';
import { env } from '../config/env.js';

export class ClientesService {
  constructor(private readonly client: VistaClient) {}

  async pesquisar(params: {
    campos?: string[];
    filtros?: Record<string, any>;
    paginacao?: { pagina?: number; quantidade?: number };
    ordenacao?: Record<string, 'asc' | 'desc'>;
  }) {
    const { campos, filtros, paginacao, ordenacao } = params;
    const queryParams: Record<string, any> = {
      showtotal: 1,
      fields: campos || ['Codigo', 'Nome', 'Email', 'Telefone'],
    };
    if (filtros) queryParams.pesquisa = { filter: filtros };
    if (paginacao) queryParams.paginacao = {
      pagina: paginacao.pagina || 1,
      quantidade: Math.min(paginacao.quantidade || env.DEFAULT_LIMIT, env.MAX_LIMIT),
    };
    if (ordenacao) queryParams.order = ordenacao;

    const response = await this.client.get<any>('/clientes/listar', queryParams);
    return optimizePayload({ items: response.data || response, metadata: { total: response.total, paginas: response.paginas, pagina: response.pagina } });
  }

  async obterDetalhes(codigo: string, campos?: string[]) {
    return optimizePayload(await this.client.get<any>('/clientes/detalhes', { fields: campos || ['*'], pesquisa: { filter: { Codigo: codigo } } }));
  }

  async obterHistorico(codigo: string) {
    return optimizePayload(await this.client.get<any>('/clientes/historico', { pesquisa: { filter: { Codigo: codigo } } }));
  }

  async obterFavoritos(codigo: string) {
    return optimizePayload(await this.client.get<any>('/clientes/favoritos', { pesquisa: { filter: { Codigo: codigo } } }));
  }

  async listarCampos() {
    return optimizePayload(await this.client.get<any>('/clientes/campos'));
  }

  async cadastrar(dados: any) {
    return this.client.post('/clientes/cadastrar', dados);
  }

  async alterar(codigo: string, dados: any) {
    return this.client.post('/clientes/alterar', { Codigo: codigo, ...dados });
  }

  async cadastrarHistorico(codigo: string, dados: any) {
    return this.client.post('/clientes/cadastrar-historico', { Codigo: codigo, ...dados });
  }

  async definirCorretor(codigo: string, corretor: string) {
    return this.client.post('/clientes/definir-corretor', { Codigo: codigo, Corretor: corretor });
  }

  async enviarLead(dados: any) {
    return this.client.post('/clientes/enviar-lead', dados);
  }
}
