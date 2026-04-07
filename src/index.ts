import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { VistaClient } from './clients/VistaClient.js';

// Services
import { ImoveisService } from './services/ImoveisService.js';
import { ClientesService } from './services/ClientesService.js';
import { AgendamentosService } from './services/AgendamentosService.js';
import { PipelineService } from './services/PipelineService.js';
import { ConfigService } from './services/ConfigService.js';

// Tools
import { registerImoveisTools } from './tools/imoveisTools.js';
import { registerClientesTools } from './tools/clientesTools.js';
import { registerAgendamentosTools } from './tools/agendamentosTools.js';
import { registerPipelineTools } from './tools/pipelineTools.js';
import { registerConfigTools } from './tools/configTools.js';

const server = new McpServer({
  name: 'vista-crm-mcp-loft',
  version: '2.2.0',
});

const vistaClient = new VistaClient();

const imoveisService = new ImoveisService(vistaClient);
const clientesService = new ClientesService(vistaClient);
const agendamentosService = new AgendamentosService(vistaClient);
const pipelineService = new PipelineService(vistaClient);
const configService = new ConfigService(vistaClient);

registerImoveisTools(server, imoveisService);
registerClientesTools(server, clientesService);
registerAgendamentosTools(server, agendamentosService);
registerPipelineTools(server, pipelineService);
registerConfigTools(server, configService);

async function run() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Servidor MCP Vista CRM Loft v2.2.0 (Loft Compliance) iniciado.');
  } catch (error) {
    logger.error('Falha crítica no bootstrap', error);
    process.exit(1);
  }
}

run();
