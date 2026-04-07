import { VistaClient } from '../clients/VistaClient.js';
import { optimizePayload } from '../utils/payloadOptimizer.js';

export class PipelineService {
  constructor(private readonly client: VistaClient) {}

  async listarNegocios(filtros?: Record<string, any>) {
    return optimizePayload(await this.client.get<any>('/negocios/perfil/interesse', {
      v2: 1,
      pesquisa: { filter: filtros || {} }
    }));
  }

  async atualizarEtapa(codigoNegocio: number, nomeEtapa: string) {
    // Nota: Este endpoint usa PUT conforme a doc
    return this.client.get('/negocios/etapas', {
      codigo_negocio: codigoNegocio,
      nome_etapa: nomeEtapa,
      _method: 'PUT' // Workaround se o client não suportar PUT real em alguns ambientes
    });
  }

  async agendarVisita(dados: any) {
    return this.client.post('/negocios/visita', {
      cadastro: { fields: dados }
    });
  }

  async listarCamposPerfil() {
    return optimizePayload(await this.client.get<any>('/negocios/perfil/interesse/listarcampos', { desc: true }));
  }
}
