import { VistaClient } from '../clients/VistaClient.js';
import { optimizePayload } from '../utils/payloadOptimizer.js';

export class ConfigService {
  constructor(private readonly client: VistaClient) {}

  async listarWebhooks() {
    return optimizePayload(await this.client.get<any>('/webhook/listar'));
  }

  async cadastrarWebhook(dados: any) {
    return this.client.post('/webhook/cadastrar', dados);
  }

  async deletarVideo(codigoImovel: string, codigoVideo: number) {
    return this.client.delete('/imoveis/videos', {
      imovel: codigoImovel,
      video: codigoVideo
    });
  }

  async consultarFaq(name: string, action: string) {
    return optimizePayload(await this.client.get<any>(`/faq/${name}/${action}`));
  }
}
