# MCP Server - Vista CRM

Servidor MCP (Model Context Protocol) para integração com a API Vista, sistema de CRM imobiliário.

> **37 ferramentas** cobrindo todos os endpoints da API Vista: Imóveis, Clientes, Leads e Agendamentos.

---

## 🚀 Instalação Rápida

```bash
cd MCP-VISTA
npm install
npm run build
```

## ⚙️ Configuração

```bash
cp .env.example .env
```

Edite `.env`:
```env
VISTA_URL=https://suaempresa.vistahost.com.br
VISTA_KEY=sua_chave_aqui
```

> **Sandbox para testes:** `VISTA_URL=http://sandbox-rest.vistahost.com.br` | `VISTA_KEY=c9fdd79584fb8d369a6a579af1a8f681`

---

## 🔌 Integração com Agentes

### Claude Desktop / Claude Code
```json
{
  "mcpServers": {
    "vista-crm": {
      "command": "node",
      "args": ["/caminho/absoluto/MCP-VISTA/dist/index.js"],
      "env": {
        "VISTA_URL": "https://suaempresa.vistahost.com.br",
        "VISTA_KEY": "sua_chave_aqui"
      }
    }
  }
}
```

### Cursor IDE
Settings > MCP Servers > Add:
```json
{
  "mcpServers": {
    "vista-crm": {
      "command": "node",
      "args": ["/caminho/absoluto/MCP-VISTA/dist/index.js"],
      "env": {
        "VISTA_URL": "https://suaempresa.vistahost.com.br",
        "VISTA_KEY": "sua_chave_aqui"
      }
    }
  }
}
```

### VS Code + Continue
```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "node",
          "args": ["/caminho/absoluto/MCP-VISTA/dist/index.js"],
          "env": {
            "VISTA_URL": "https://suaempresa.vistahost.com.br",
            "VISTA_KEY": "sua_chave_aqui"
          }
        }
      }
    ]
  }
}
```

### Windsurf / Codeium
```json
{
  "mcpServers": {
    "vista-crm": {
      "command": "node",
      "args": ["/caminho/absoluto/MCP-VISTA/dist/index.js"],
      "env": {
        "VISTA_URL": "https://suaempresa.vistahost.com.br",
        "VISTA_KEY": "sua_chave_aqui"
      }
    }
  }
}
```

---

## 📋 Referência Completa de Ferramentas

### 🏠 Imóveis (17 ferramentas)

| Ferramenta | Descrição | Quando Usar |
|------------|-----------|-------------|
| `imoveis_pesquisar` | Busca imóveis com filtros | Listar imóveis para venda/locação |
| `imovel_detalhes` | Informações completas | Dados detalhados de um imóvel |
| `imovel_fotos` | Fotos do imóvel | Galeria de imagens |
| `imovel_anexos` | Documentos anexos | Matrícula, IPTU, plantas |
| `imovel_historico` | Histórico de alterações | Audit trail do imóvel |
| `imovel_informacoes` | Info resumidas | Cards e listagens rápidas |
| `imoveis_campos` | Campos disponíveis | Descobrir campos da API |
| `imoveis_listas` | Cidades, bairros, tipos | Filtros e dropdowns |
| `imoveis_por_corretor` | Imóveis por corretor | Carteira de imóveis do corretor |
| `imoveis_por_agencia` | Imóveis por agência | Imóveis da filial |
| `imovel_cadastrar` | Criar novo imóvel | Cadastro manual |
| `imovel_alterar` | Atualizar imóvel | Editar dados existentes |
| `imovel_cadastrar_fotos` | Adicionar fotos | Upload de imagens |
| `imovel_cadastrar_documentos` | Adicionar documentos | Anexar matrícula, IPTU |
| `imovel_cadastrar_historico` | Registrar evento | Anotações no imóvel |
| `imovel_cadastrar_proprietario` | Vincular proprietário | Associar dono ao imóvel |
| `imovel_definir_corretor` | Atribuir corretor | Designar responsável |

### 👥 Clientes (11 ferramentas)

| Ferramenta | Descrição | Quando Usar |
|------------|-----------|-------------|
| `clientes_pesquisar` | Busca clientes | CRM, busca de contatos |
| `cliente_detalhes` | Info completa do cliente | Dados detalhados |
| `cliente_historico` | Histórico de interações | Contatos, propostas, visitas |
| `cliente_favoritos` | Imóveis favoritados | Preferências do cliente |
| `clientes_campos` | Campos disponíveis | Descobrir campos da API |
| `clientes_por_corretor` | Clientes por corretor | Carteira do corretor |
| `clientes_por_agencia` | Clientes por agência | Clientes da filial |
| `cliente_cadastrar` | Criar novo cliente | Cadastro manual |
| `cliente_alterar` | Atualizar cliente | Editar dados existentes |
| `cliente_cadastrar_historico` | Registrar evento | Anotações no cliente |
| `cliente_definir_corretor` | Atribuir corretor | Designar responsável |

### 📩 Leads (2 ferramentas)

| Ferramenta | Descrição | Quando Usar |
|------------|-----------|-------------|
| `lead_enviar` | Enviar novo lead | Captura de site/redes sociais |
| `leads_pesquisar` | Buscar leads | Gestão de leads capturados |

### 📅 Agendamentos (7 ferramentas)

| Ferramenta | Descrição | Quando Usar |
|------------|-----------|-------------|
| `agendamentos_pesquisar` | Busca agendamentos | Agenda geral |
| `agendamento_detalhes` | Info do agendamento | Detalhes de uma visita |
| `agendamentos_por_corretor` | Agenda do corretor | Compromissos do corretor |
| `agendamentos_por_cliente` | Agenda do cliente | Visitas do cliente |
| `agendamentos_por_imovel` | Agenda do imóvel | Visitas agendadas no imóvel |
| `agendamento_cadastrar` | Criar agendamento | Agendar visita |
| `agendamento_alterar` | Atualizar agendamento | Remarcar/cancelar |

### 🔧 Utilitários (1 ferramenta)

| Ferramenta | Descrição | Quando Usar |
|------------|-----------|-------------|
| `vista_status` | Status da API | Health check, diagnóstico |

---

## 📚 Guia de Filtros

### Padrão de Parâmetros

Todas as ferramentas de pesquisa seguem o mesmo padrão:

```
{
  campos: ["Campo1", "Campo2"],          // Opcional: campos a retornar
  filtros: { campo: valor },              // Opcional: filtros
  paginacao: { pagina: 1, quantidade: 20 }, // Opcional: paginação
  ordenacao: { Campo: "asc" }             // Opcional: ordenação
}
```

### Operadores de Filtro

A API Vista suporta operadores avançados nos filtros:

| Operador | Sintaxe | Exemplo |
|----------|---------|---------|
| Igual | `{ Campo: "valor" }` | `{ Tipo: "Apartamento" }` |
| Múltiplos | `{ Campo: ["a", "b"] }` | `{ Bairro: ["Centro", "Jardins"] }` |
| Maior/Menor | `{ Campo: [">", valor] }` | `{ ValorVenda: [">", 500000] }` |
| Maior/Menor igual | `{ Campo: [">=", valor] }` | `{ Area: [">=", 100] }` |
| Menor igual | `{ Campo: ["<=", valor] }` | `{ ValorAluguel: ["<=", 3000] }` |
| Diferente | `{ Campo: ["!=", valor] }` | `{ Status: ["!=", "Inativo"] }` |
| Like | `{ Campo: ["like", "texto"] }` | `{ Nome: ["like", "joao"] }` |
| Intervalo | `{ Campo: [min, max] }` | `{ ValorVenda: [250000, 500000] }` |

### Filtros Avançados (advFilter)

Para queries complexas com AND/OR:

```json
{
  "advFilter": {
    "Or": [
      { "And": [{ "Tipo": "Apartamento" }, { "Quartos": [">=", 2] }] },
      { "And": [{ "Tipo": "Casa" }, { "Vagas": [">=", 2] }] }
    ]
  }
}
```

### Filtros Comuns por Módulo

**Imóveis:**
```json
{ "Finalidade": "Venda" }
{ "Tipo": "Apartamento" }
{ "ValorVenda": [">=", 300000, "<=", 800000] }
{ "Quartos": [">=", 2] }
{ "Bairro": "Centro" }
{ "CodigoCorretor": "123" }
{ "Status": "Ativo" }
```

**Clientes:**
```json
{ "Email": "cliente@email.com" }
{ "Telefone": "11999999999" }
{ "Nome": ["like", "joao"] }
{ "CPF": "123.456.789-00" }
{ "Origem": "site" }
```

**Agendamentos:**
```json
{ "Data": "2024-12-20" }
{ "Data": [">=", "2024-12-01", "<=", "2024-12-31"] }
{ "Status": "Confirmado" }
{ "CodigoCliente": "456" }
{ "CodigoCorretor": "789" }
{ "CodigoImovel": "101" }
```

---

## 💡 Exemplos Práticos

### 1. Buscar apartamentos à venda em um bairro, ordenados por preço

```
Use: imoveis_pesquisar
{
  "campos": ["Codigo", "Nome", "ValorVenda", "Bairro", "Quartos", "Fotos"],
  "filtros": {
    "Finalidade": "Venda",
    "Tipo": "Apartamento",
    "Bairro": "Jardins",
    "Status": "Ativo"
  },
  "paginacao": { "pagina": 1, "quantidade": 20 },
  "ordenacao": { "ValorVenda": "asc" }
}
```

### 2. Cadastrar lead vindo do site

```
Use: lead_enviar
{
  "dados": {
    "Nome": "Maria Silva",
    "Email": "maria@email.com",
    "Telefone": "11987654321",
    "Origem": "site",
    "Mensagem": "Interessada em apartamento 3 quartos na zona sul"
  }
}
```

### 3. Buscar imóveis de um corretor com valor acima de R$500k

```
Use: imoveis_por_corretor
{
  "corretor": "123",
  "campos": ["Codigo", "Nome", "ValorVenda", "Tipo", "Bairro"],
  "filtros": {
    "ValorVenda": [">=", 500000]
  },
  "ordenacao": { "ValorVenda": "desc" }
}
```

### 4. Agendar visita em imóvel

```
Use: agendamento_cadastrar
{
  "dados": {
    "Data": "2024-12-20",
    "Hora": "14:00",
    "CodigoCliente": "456",
    "CodigoImovel": "789",
    "CodigoCorretor": "123",
    "Tipo": "Visita",
    "Observacoes": "Cliente prefere período da tarde"
  }
}
```

### 5. Registrar contato no histórico do cliente

```
Use: cliente_cadastrar_historico
{
  "codigo": "456",
  "dados": {
    "Descricao": "Cliente ligou interessado em cobertura no Jardins. Enviei 3 opções por email.",
    "Tipo": "ligacao"
  }
}
```

### 6. Vincular fotos e proprietário a um novo imóvel

```
// Passo 1: Cadastrar o imóvel
Use: imovel_cadastrar
{ "dados": { "Tipo": "Casa", "Finalidade": "Venda", "ValorVenda": 850000, ... } }

// Passo 2: Adicionar fotos (após obter o código retornado)
Use: imovel_cadastrar_fotos
{
  "codigo": "COD_RETORNADO",
  "fotos": [
    { "URL": "https://cdn.ex.com/foto1.jpg", "Principal": true, "Ordem": 1 },
    { "URL": "https://cdn.ex.com/foto2.jpg", "Ordem": 2 }
  ]
}

// Passo 3: Vincular proprietário
Use: imovel_cadastrar_proprietario
{
  "codigo": "COD_RETORNADO",
  "proprietario": { "Nome": "João Souza", "CPF": "123.456.789-00", "Telefone": "11999999999" }
}
```

### 7. Buscar clientes com leads do site

```
Use: leads_pesquisar
{
  "campos": ["Codigo", "Nome", "Email", "Telefone", "Origem", "DataCadastro"],
  "filtros": { "Origem": "site" },
  "ordenacao": { "DataCadastro": "desc" }
}
```

### 8. Verificar agenda da semana de um corretor

```
Use: agendamentos_por_corretor
{
  "corretor": "123",
  "filtros": { "Data": [">=", "2024-12-16", "<=", "2024-12-22"] },
  "ordenacao": { "Data": "asc", "Hora": "asc" }
}
```

---

## 🏗️ Arquitetura

### Fluxo de Requisição

```
IA/Agente → MCP Tool → buildVistaUrl() → vistaGet()/vistaPost()
                                          → cleanNullFields() → JSON Response
```

### Limpeza de Dados

O servidor automaticamente remove campos `null` e `undefined` de todas as respostas via `cleanNullFields()`. Isso:
- **Economiza tokens** do contexto da IA
- **Reduz ruído** nas respostas
- **Mantém apenas dados relevantes**

### Paginação Automática

- `showtotal=1` é enviado automaticamente em todas as pesquisas
- O metadata retorna `{ total, paginas, pagina, quantidade }`
- Máximo de **50 registros** por página (limite da API Vista)

---

## 📝 Notas Importantes

| Item | Detalhe |
|------|---------|
| Paginação máx | 50 registros por página |
| Campos omitidos | Se `campos` não informado, retorna apenas `Codigo` |
| URL base | Deve ser específica da instância (ex: `empresa.vistahost.com.br`) |
| Espaços em URLs | Devem ser codificados (`urlencode` ou `+`) |
| Header obrigatório | `Accept: application/json` |
| Autenticação | Via query string `?key=SUA_CHAVE` |

---

## 🛠️ Stack

| Componente | Versão |
|------------|--------|
| Runtime | Node.js 18+ |
| SDK MCP | @modelcontextprotocol/sdk ^1.0.0 |
| Validação | Zod ^3.23.8 |
| Transporte | StdioServerTransport |
| TypeScript | ^5.6.0 |

---

## 📄 Licença

MIT
