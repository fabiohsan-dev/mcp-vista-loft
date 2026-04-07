# MCP Server - Vista CRM Loft 🏠🚀

Este é um servidor de **Model Context Protocol (MCP)** para o **Vista CRM**, o ecossistema líder em gestão imobiliária no Brasil.

Com este servidor, você pode pesquisar, ler e gerenciar seu inventário de imóveis, base de clientes, leads e agenda diretamente através de agentes de IA (como Claude e Cursor). Ele expõe **37 ferramentas poderosas** que permitem à IA atuar como um assistente imobiliário de alto nível, automatizando desde a triagem de leads até a organização de visitas.

O servidor conecta-se à API REST oficial da Vista Software. Todas as respostas são otimizadas localmente para remover ruídos e economizar tokens antes de serem enviadas ao modelo de linguagem, garantindo eficiência e baixo custo operacional.

---

### 🌟 O que você pode fazer?

- **Pesquisa Inteligente:** "Encontre apartamentos de 3 quartos no Itaim Bibi abaixo de R$ 2M".
- **Gestão de Leads:** "Cadastre este novo interessado que veio pelo WhatsApp e vincule-o ao imóvel X".
- **Controle de Agenda:** "Quais são as visitas agendadas para o corretor Fabio nesta quarta-feira?".
- **Enriquecimento de Dados:** "Atualize a descrição deste imóvel e adicione estas novas URLs de fotos".

---

⚠️ **Cuidado:** Como ocorre com muitos servidores MCP, o acesso a dados sensíveis de CRM está sujeito a riscos de exfiltração se o agente for exposto a injeções de prompt maliciosas em contextos de terceiros. Use sempre em ambientes controlados.

---

## 🛠️ Instalação

### Pré-requisitos
- **Node.js 18.x ou superior**
- **NPM** ou **Yarn**
- **Anthropic Claude Desktop** ou **Cursor IDE**
- **Chave de API Vista:** Obtida junto ao suporte da Vista Software.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/fabiohsan-dev/mcp-vista-loft.git
   cd mcp-vista-loft
   ```

2. **Instalar dependências e realizar o build:**
   ```bash
   npm install
   npm run build
   ```

3. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   VISTA_URL=https://sua-instancia.vistahost.com.br
   VISTA_KEY=sua-chave-api-aqui
   ```
   *Nota: Se quiser testar imediatamente, use a Sandbox da Vista:*
   - `VISTA_URL=http://sandbox-rest.vistahost.com.br`
   - `VISTA_KEY=c9fdd79584fb8d369a6a579af1a8f681`

---

## 🔌 Configuração nos Agentes

### Claude Desktop
Adicione o servidor ao seu arquivo `claude_desktop_config.json`:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vista-crm": {
      "command": "node",
      "args": ["E:/Unus-site/MCP/MCP-VISTA/dist/index.js"],
      "env": {
        "VISTA_URL": "SUA_URL",
        "VISTA_KEY": "SUA_KEY"
      }
    }
  }
}
```

### Cursor IDE
1. Vá em **Settings** > **Cursor Settings** > **MCP**.
2. Clique em **+ Add New MCP Server**.
3. Configure:
   - **Name:** `Vista CRM`
   - **Type:** `command`
   - **Command:** `node E:/Unus-site/MCP/MCP-VISTA/dist/index.js`

---

## 🏗️ Arquitetura & Fluxo de Dados

O servidor utiliza uma arquitetura de **Camadas Desacopladas** (Clean Architecture) para garantir que seja resiliente e fácil de evoluir.

1. **Camada de Transporte (MCP Server):** Implementa o protocolo JSON-RPC via `stdio`.
2. **Camada de Tools (Controllers):** Valida os argumentos via **Zod** e fornece descrições semânticas para a IA.
3. **Camada de Services (Business Logic):** Orquestra as regras de negócio e a normalização de dados.
4. **Camada de Clients (Infrastructure):** Isola a comunicação HTTP, tratando timeouts e autenticação.
5. **Payload Optimizer (Utility):** Uma etapa crítica que limpa `nulls`, `undefined` e campos vazios, reduzindo o consumo de tokens em até 60%.

---

## 📋 Ferramentas Disponíveis

O servidor expõe 37 ferramentas, as principais são:

- **Módulo de Imóveis:** `imoveis_pesquisar`, `imovel_detalhes`, `imovel_fotos`, `imovel_cadastrar`, `imoveis_listas`.
- **Módulo de CRM:** `clientes_pesquisar`, `cliente_detalhes`, `cliente_historico`, `cliente_cadastrar`, `cliente_favoritos`.
- **Módulo de Leads:** `lead_enviar`, `leads_pesquisar`.
- **Módulo de Agenda:** `agendamentos_pesquisar`, `agendamento_cadastrar`, `agendamento_alterar`.

---

## 🐞 Solução de Problemas

**O servidor não aparece no Claude/Cursor:**
- Verifique se o caminho no `args` está absoluto e utiliza barras normais (`/`) ou barras invertidas duplas (`\\`).
- Certifique-se de que rodou `npm run build` e o arquivo `dist/index.js` existe.

**Erro de Autenticação (401/403):**
- Verifique se a `VISTA_KEY` no seu arquivo de configuração está correta e sem espaços.
- Algumas instâncias da Vista exigem que o IP do servidor esteja na whitelist.

**IA "alucinando" campos:**
- A API Vista possui campos customizados por instância. Use a ferramenta `imoveis_campos` para que a IA aprenda quais campos estão disponíveis na sua conta específica.

---

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.

## 👨‍💻 Autor
**Fabio San** - [@fabiohsan-dev](https://github.com/fabiohsan-dev)
