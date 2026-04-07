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
      fields: campos || ['Codigo', 'Categoria', 'Bairro', 'Cidade', 'ValorVenda', 'ValorAluguel'],
    };

    if (filtros) {
      queryParams.pesquisa = { filter: filtros };
    }

    if (paginacao) {
      queryParams.paginacao = {
        pagina: paginacao.pagina || 1,
        quantidade: Math.min(paginacao.quantidade || env.DEFAULT_LIMIT, env.MAX_LIMIT),
      };
    }

    if (ordenacao) {
      queryParams.order = ordenacao;
    }

    const response = await this.client.get<any>('/imoveis/listar', queryParams);
    
    return optimizePayload({
      items: response.data || response,
      metadata: {
        total: response.total,
        paginas: response.paginas,
        pagina: response.pagina,
      }
    });
  }

  async obterDetalhes(codigo: string, campos?: string[]) {
    const response = await this.client.get<any>('/imoveis/detalhes', {
      fields: campos || ['*'],
      pesquisa: { filter: { Codigo: codigo } }
    });
    return optimizePayload(response);
  }

  async cadastrar(dados: any) {
    return this.client.post('/imoveis/cadastrar', dados);
  }
}
