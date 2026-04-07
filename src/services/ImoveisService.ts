import { VistaClient } from '../clients/VistaClient.js';
import { optimizePayload } from '../utils/payloadOptimizer.js';
import { env } from '../config/env.js';

export class ImoveisService {
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
      fields: campos || ['Codigo', 'Categoria', 'Bairro', 'Cidade', 'ValorVenda'],
    };
    if (filtros) queryParams.pesquisa = { filter: filtros };
    if (paginacao) queryParams.paginacao = {
      pagina: paginacao.pagina || 1,
      quantidade: Math.min(paginacao.quantidade || env.DEFAULT_LIMIT, env.MAX_LIMIT),
    };
    if (ordenacao) queryParams.order = ordenacao;

    const response = await this.client.get<any>('/imoveis/listar', queryParams);
    return optimizePayload({ items: response.data || response, metadata: { total: response.total, paginas: response.paginas, pagina: response.pagina } });
  }

  async obterDetalhes(codigo: string, campos?: string[]) {
    return optimizePayload(await this.client.get<any>('/imoveis/detalhes', { fields: campos || ['*'], pesquisa: { filter: { Codigo: codigo } } }));
  }

  async obterFotos(codigo: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/fotos', { pesquisa: { filter: { Codigo: codigo } } }));
  }

  async obterAnexos(codigo: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/anexos', { pesquisa: { filter: { Codigo: codigo } } }));
  }

  async obterHistorico(codigo: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/historico', { pesquisa: { filter: { Codigo: codigo } } }));
  }

  async obterInformacoes(codigo: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/informacoes', { fields: ['*'], pesquisa: { filter: { Codigo: codigo } } }));
  }

  async listarCampos() {
    return optimizePayload(await this.client.get<any>('/imoveis/campos'));
  }

  async obterListas(tipo: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/listas', { pesquisa: { filter: { tipo } } }));
  }

  async cadastrar(dados: any) {
    return this.client.post('/imoveis/cadastrar', dados);
  }

  async alterar(codigo: string, dados: any) {
    return this.client.post('/imoveis/alterar', { Codigo: codigo, ...dados });
  }

  async cadastrarFotos(codigo: string, fotos: any[]) {
    return this.client.post('/imoveis/cadastrar-fotos', { Codigo: codigo, Fotos: fotos });
  }

  async cadastrarDocumentos(codigo: string, documentos: any[]) {
    return this.client.post('/imoveis/cadastrar-documentos', { Codigo: codigo, Documentos: documentos });
  }

  async cadastrarHistorico(codigo: string, dados: any) {
    return this.client.post('/imoveis/cadastrar-historico', { Codigo: codigo, ...dados });
  }

  async vincularProprietario(codigo: string, proprietario: any) {
    return this.client.post('/imoveis/cadastrar-proprietario', { Codigo: codigo, Proprietario: proprietario });
  }

  async definirCorretor(codigo: string, corretor: string) {
    return this.client.post('/imoveis/definir-corretor', { Codigo: codigo, Corretor: corretor });
  }
}
