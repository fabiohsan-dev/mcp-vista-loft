import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { VistaClient } from './clients/VistaClient.js';

// Services
import { ImoveisService } from './services/ImoveisService.js';
import { ClientesService } from './services/ClientesService.js';
import { AgendamentosService } from './services/AgendamentosService.js';

// Tools
import { registerImoveisTools } from './tools/imoveisTools.js';
import { registerClientesTools } from './tools/clientesTools.js';
import { registerAgendamentosTools } from './tools/agendamentosTools.js';

// 1. Inicializa Servidor MCP
const server = new McpServer({
  name: 'vista-crm-mcp',
  version: '2.0.0',
});

// 2. Inicializa Clientes e Serviços
const vistaClient = new VistaClient();

const imoveisService = new ImoveisService(vistaClient);
const clientesService = new ClientesService(vistaClient);
const agendamentosService = new AgendamentosService(vistaClient);

// 3. Registra as Ferramentas por Domínio
registerImoveisTools(server, imoveisService);
registerClientesTools(server, clientesService);
registerAgendamentosTools(server, agendamentosService);

// 4. Inicia o Transporte Stdio
async function run() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('Servidor MCP Vista CRM iniciado.', {
      version: '2.0.0',
      node: process.version,
      platform: process.platform
    });
  } catch (error) {
    logger.error('Falha crítica no bootstrap', error);
    process.exit(1);
  }
}

run();
