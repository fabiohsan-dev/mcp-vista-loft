# MCP Server - Vista CRM Loft 🏠🚀

Este é um servidor de **Model Context Protocol (MCP)** para o **Vista CRM**, o ecossistema líder em gestão imobiliária no Brasil.

Com este servidor, você pode gerenciar todo o ciclo de vida imobiliário diretamente através de agentes de IA (como Claude e Cursor). Ele expõe **40+ ferramentas poderosas** que permitem à IA atuar como um assistente imobiliário de alto nível, automatizando desde a triagem de leads até a gestão do funil de vendas (Pipeline).

O servidor conecta-se à API REST oficial da Vista Software (v2). Todas as respostas são otimizadas localmente para remover ruídos e economizar tokens, garantindo eficiência e precisão.

---

### 🌟 O que há de novo na v2.1.0?

- **Módulo de Pipeline:** Gestão completa do funil de vendas e perfis de interesse.
- **Busca Avançada de Imóveis:** Execução de queries JSON complexas.
- **Prontuário Digital:** Histórico detalhado e categorizado de cada imóvel.
- **Filtros Dinâmicos:** Ferramenta para listar conteúdos únicos (ex: todos os bairros com imóveis ativos).

---

⚠️ **Cuidado:** Como ocorre com muitos servidores MCP, o acesso a dados sensíveis de CRM exige cautela. Use sempre em ambientes controlados.

---

## 🛠️ Instalação

### Pré-requisitos
- **Node.js 18.x ou superior**
- **Anthropic Claude Desktop** ou **Cursor IDE**
- **Chave de API Vista**

### Passo a Passo
1. **Clonar e Instalar:**
   ```bash
   git clone https://github.com/fabiohsan-dev/mcp-vista-loft.git
   cd mcp-vista-loft
   npm install
   npm run build
   ```

2. **Configurar .env:**
   ```env
   VISTA_URL=https://sua-instancia.vistahost.com.br
   VISTA_KEY=sua-chave-api
   ```

---

## 🔌 Integração com Agentes

### Claude Desktop
Adicione ao seu `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "vista-crm": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/dist/index.js"],
      "env": {
        "VISTA_URL": "...",
        "VISTA_KEY": "..."
      }
    }
  }
}
```

---

## 📋 Ferramentas Disponíveis

### 🏠 Módulo de Imóveis
- `imoveis_pesquisar`: Busca avançada com suporte a operadores.
- `imovel_detalhes`: Informações completas de um imóvel.
- `imovel_fotos`: Galeria de imagens do imóvel.
- `imovel_anexos`: Documentos vinculados (matrícula, IPTU).
- `imovel_historico`: Linha do tempo de alterações simples.
- `imovel_prontuario`: **(Novo)** Histórico detalhado e categorizado.
- `imovel_busca_avancada`: **(Novo)** Execução de queries JSON complexas.
- `imovel_listar_conteudo`: **(Novo)** Obtém valores únicos para filtros (ex: bairros disponíveis).
- `imovel_informacoes`: Resumo de informações críticas.
- `imoveis_campos`: Lista de campos disponíveis na API.
- `imoveis_listas`: Dropdowns de cidades, bairros e tipos.
- `imovel_cadastrar` / `imovel_alterar`: Gestão de inventário.

### 👥 Módulo de Clientes & Leads
- `clientes_pesquisar`: Busca de contatos no CRM.
- `cliente_detalhes`: Perfil completo do cliente.
- `cliente_historico`: Log de interações.
- `cliente_favoritos`: Imóveis de interesse do contato.
- `lead_enviar`: Captura de leads de fontes externas.
- `leads_pesquisar`: Gestão de leads capturados.

### 📈 Módulo de Pipeline & Negócios (Novo)
- `pipeline_listar`: Gestão do funil de vendas e perfis de interesse.
- `pipeline_atualizar_etapa`: Movimentação de negócios entre etapas.
- `pipeline_campos`: Lista campos configuráveis para o funil.

### 📅 Módulo de Agenda
- `agendamentos_pesquisar`: Filtro geral da agenda.
- `agendamento_detalhes`: Dados de uma visita ou reunião.
- `agendamento_cadastrar` / `agendamento_alterar`: Gestão de compromissos.

---

## 🏗️ Arquitetura
O servidor utiliza uma arquitetura modular em camadas (**Clean Architecture**):
- **Clients:** Isola a comunicação HTTP.
- **Services:** Orquestração e lógica de negócio.
- **Tools:** Controladores MCP com validação Zod.
- **Optimizer:** Remoção de ruído para economia de tokens.

---

## 📄 Licença
Distribuído sob a licença MIT.

## 👨‍💻 Autor
**Fabio San** - [@fabiohsan-dev](https://github.com/fabiohsan-dev)
