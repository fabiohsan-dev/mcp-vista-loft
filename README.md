# MCP Server - Vista CRM Loft 🏠🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-SDK-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

Integração de nível empresarial com a **API Vista CRM**, projetada para agentes de IA que precisam gerenciar operações imobiliárias com precisão, segurança e economia de tokens. Este servidor expõe o conjunto completo de ferramentas para gestão de imóveis, clientes, leads e agenda.

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura modular em camadas (**Clean Architecture**) para garantir manutenibilidade e resiliência:

- **Clients (`src/clients`)**: Isola a comunicação HTTP, gerencia autenticação e erros de rede.
- **Services (`src/services`)**: Camada de orquestração e regras de negócio.
- **Tools (`src/tools`)**: Controladores MCP que validam inputs e formatam saídas para o LLM.
- **Utils (`src/utils`)**: Otimizador de payload para remoção de ruído e economia de tokens.

---

## 🔌 Integração com Agentes de IA

Este servidor utiliza o protocolo MCP via transporte `stdio`. Para integrar, você deve apontar para o arquivo compilado em `dist/index.js`.

### 1. Claude Desktop / Claude Code
Edite o arquivo de configuração (`claude_desktop_config.json`):
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vista-crm": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/mcp-vista-loft/dist/index.js"],
      "env": {
        "VISTA_URL": "https://sua-instancia.vistahost.com.br",
        "VISTA_KEY": "sua-chave-api"
      }
    }
  }
}
```

### 2. Cursor (IDE)
1. Vá em **Settings** > **Cursor Settings** > **MCP**.
2. Clique em **+ Add New MCP Server**.
3. Configure como:
   - **Name:** `Vista CRM`
   - **Type:** `command`
   - **Command:** `node /CAMINHO/ABSOLUTO/mcp-vista-loft/dist/index.js`
4. Certifique-se de que as variáveis `VISTA_URL` e `VISTA_KEY` estejam configuradas no seu ambiente de sistema.

### 3. Gemini CLI
Para integrar com o Gemini CLI ou outros clientes baseados em Node.js, adicione à sua configuração:

```json
{
  "mcp": {
    "servers": [
      {
        "name": "vista-crm",
        "type": "stdio",
        "command": "node",
        "args": ["/CAMINHO/ABSOLUTO/mcp-vista-loft/dist/index.js"],
        "env": {
          "VISTA_URL": "...",
          "VISTA_KEY": "..."
        }
      }
    ]
  }
}
```

---

## 📋 Ferramentas Disponíveis (37 no total)

### 🏠 Módulo de Imóveis (17)
- `imoveis_pesquisar`: Busca avançada com suporte a operadores.
- `imovel_detalhes`: Informações completas de um imóvel.
- `imovel_fotos`: Galeria de imagens do imóvel.
- `imovel_anexos`: Documentos vinculados (matrícula, IPTU).
- `imovel_historico`: Linha do tempo de alterações.
- `imovel_informacoes`: Resumo de informações críticas.
- `imoveis_campos`: Lista de campos disponíveis na API.
- `imoveis_listas`: Dropdowns de cidades, bairros e tipos.
- `imoveis_por_corretor`: Carteira de um colaborador específico.
- `imoveis_por_agencia`: Imóveis vinculados a uma filial.
- `imovel_cadastrar`: Criação de novos registros.
- `imovel_alterar`: Atualização de dados existentes.
- `imovel_cadastrar_fotos`: Upload de imagens para a galeria.
- `imovel_cadastrar_documentos`: Anexo de arquivos técnicos.
- `imovel_cadastrar_historico`: Registro de eventos manuais.
- `imovel_cadastrar_proprietario`: Vínculo de donos ao imóvel.
- `imovel_definir_corretor`: Atribuição de responsabilidade.

### 👥 Módulo de Clientes & Leads (13)
- `clientes_pesquisar`: Busca de contatos no CRM.
- `cliente_detalhes`: Perfil completo do cliente.
- `cliente_historico`: Log de interações com o cliente.
- `cliente_favoritos`: Imóveis de interesse do contato.
- `clientes_campos`: Campos disponíveis para cadastro.
- `clientes_por_corretor`: Carteira de clientes do corretor.
- `clientes_por_agencia`: Clientes vinculados à agência.
- `cliente_cadastrar`: Registro de novos contatos.
- `cliente_alterar`: Edição de perfil de cliente.
- `cliente_cadastrar_historico`: Registro de contato (ligação, visita).
- `cliente_definir_corretor`: Mudança de corretor responsável.
- `lead_enviar`: Captura de leads de fontes externas (site/portais).
- `leads_pesquisar`: Gestão de leads capturados.

### 📅 Módulo de Agenda (7)
- `agendamentos_pesquisar`: Filtro geral da agenda.
- `agendamento_detalhes`: Dados de uma visita ou reunião.
- `agendamentos_por_corretor`: Agenda pessoal do corretor.
- `agendamentos_por_cliente`: Compromissos de um cliente.
- `agendamentos_por_imovel`: Visitas marcadas em um imóvel.
- `agendamento_cadastrar`: Criação de novo evento.
- `agendamento_alterar`: Reagendamento ou cancelamento.

---

## 🚀 Como Executar

### 1. Configuração
Crie um arquivo `.env` na raiz:
```env
VISTA_URL=https://suainstancia.vistahost.com.br
VISTA_KEY=suachaveapi
DEFAULT_LIMIT=20
TIMEOUT_MS=30000
```

### 2. Build & Start
```bash
npm install
npm run build
npm start
```

---

## 📄 Licença
Distribuído sob a licença MIT.

## 👨‍💻 Autor
**Fabio San** - [@fabiohsan-dev](https://github.com/fabiohsan-dev)
