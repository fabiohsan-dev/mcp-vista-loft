import { VistaClient } from '../clients/VistaClient.js';
import { optimizePayload } from '../utils/payloadOptimizer.js';

export class AgendamentosService {
  constructor(private readonly client: VistaClient) {}

  async pesquisar(filtros?: Record<string, any>) {
    const response = await this.client.get<any>('/agendamentos/listar', {
      showtotal: 1,
      pesquisa: { filter: filtros || {} }
    });
    return optimizePayload(response);
  }

  async cadastrar(dados: any) {
    return this.client.post('/agendamentos/cadastrar', dados);
  }

  async atualizar(codigo: string, dados: any) {
    return this.client.post('/agendamentos/alterar', {
      Codigo: codigo,
      ...dados
    });
  }
}
