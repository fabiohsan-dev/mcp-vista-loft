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
      v2: 1,
      showtotal: 1,
      pesquisa: {
        fields: campos || ['Codigo', 'Categoria', 'Bairro', 'Cidade', 'ValorVenda'],
        filter: filtros || {}
      }
    };
    if (paginacao) {
      queryParams.paginacao = {
        pagina: paginacao.pagina || 1,
        quantidade: Math.min(paginacao.quantidade || env.DEFAULT_LIMIT, env.MAX_LIMIT),
      };
    }
    if (ordenacao) queryParams.order = ordenacao;
    const response = await this.client.get<any>('/imoveis/listar', queryParams);
    return optimizePayload({ items: response.data || response, metadata: { total: response.total, paginas: response.paginas, pagina: response.pagina } });
  }

  async buscaAvancada(pesquisaJson: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/buscaAvancada', { pesquisa: pesquisaJson, v2: 1 }));
  }

  async listarConteudoDistinct(campos: string[]) {
    return optimizePayload(await this.client.get<any>('/imoveis/listarConteudo', { fields: JSON.stringify(campos), v2: 1 }));
  }

  async obterProntuario(codigo: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/prontuario', { imovel: codigo, v2: 1 }));
  }

  async obterHistorico(codigo: string) {
    // Alias para manter compatibilidade com tools legadas que chamam obterHistorico
    return this.obterProntuario(codigo);
  }

  async obterDetalhes(codigo: string, campos?: string[]) {
    return optimizePayload(await this.client.get<any>('/imoveis/detalhes', { v2: 1, pesquisa: { fields: campos || ['*'], filter: { Codigo: codigo } } }));
  }

  async obterInformacoes(codigo: string) {
    return optimizePayload(await this.client.get<any>('/imoveis/informacoes', { v2: 1, pesquisa: { fields: ['*'], filter: { Codigo: codigo } } }));
  }

  async obterFotos(codigo: string) { return optimizePayload(await this.client.get<any>('/imoveis/fotos', { v2: 1, pesquisa: { filter: { Codigo: codigo } } })); }
  async obterAnexos(codigo: string) { return optimizePayload(await this.client.get<any>('/imoveis/anexos', { v2: 1, pesquisa: { filter: { Codigo: codigo } } })); }
  async listarCampos() { return optimizePayload(await this.client.get<any>('/imoveis/campos', { v2: 1 })); }
  async obterListas(tipo: string) { return optimizePayload(await this.client.get<any>('/imoveis/listas', { v2: 1, pesquisa: { filter: { tipo } } })); }
  async cadastrar(dados: any) { return this.client.post('/imoveis/cadastrar', dados); }
  async alterar(codigo: string, dados: any) { return this.client.post('/imoveis/alterar', { Codigo: codigo, ...dados }); }
  async cadastrarFotos(codigo: string, fotos: any[]) { return this.client.post('/imoveis/cadastrar-fotos', { Codigo: codigo, Fotos: fotos }); }
  async cadastrarDocumentos(codigo: string, documentos: any[]) { return this.client.post('/imoveis/cadastrar-documentos', { Codigo: codigo, Documentos: documentos }); }
  async cadastrarHistorico(codigo: string, dados: any) { return this.client.post('/imoveis/cadastrar-historico', { Codigo: codigo, ...dados }); }
  async vincularProprietario(codigo: string, proprietario: any) { return this.client.post('/imoveis/cadastrar-proprietario', { Codigo: codigo, Proprietario: proprietario }); }
  async definirCorretor(codigo: string, corretor: string) { return this.client.post('/imoveis/definir-corretor', { Codigo: codigo, Corretor: corretor }); }
}
