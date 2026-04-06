/**
 * MCP Server - Integração com API Vista (CRM Imobiliário)
 * 
 * Servidor MCP que fornece ferramentas para interação com a API Vista,
 * permitindo busca e gerenciamento de imóveis, clientes, agendamentos e leads.
 * 
 * Documentação: https://www.vistasoft.com.br/api/
 * 
 * Variáveis de Ambiente Necessárias:
 * - VISTA_URL: URL base da instância (ex: https://empresa.vistahost.com.br)
 * - VISTA_KEY: Chave de API da conta Vista
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ============================================================
// CONFIGURAÇÃO E TIPOS
// ============================================================

const VISTA_URL = process.env.VISTA_URL;
const VISTA_KEY = process.env.VISTA_KEY;

if (!VISTA_URL || !VISTA_KEY) {
  console.error(
    "Erro: VISTA_URL e VISTA_KEY devem ser definidas nas variáveis de ambiente."
  );
  process.exit(1);
}

// Remove trailing slash da URL se existir
const BASE_URL = VISTA_URL.replace(/\/+$/, "");

// Interfaces para padronização
interface VistaPagination {
  pagina?: number;
  quantidade?: number;
}

interface VistaFilters {
  [key: string]: any;
}

interface VistaToolParams {
  campos?: string[];
  filtros?: VistaFilters;
  paginacao?: VistaPagination;
  ordenacao?: Record<string, "asc" | "desc">;
}

interface VistaResponse {
  data?: any[];
  error?: string;
  metadata?: {
    total?: number;
    paginas?: number;
    pagina?: number;
    quantidade?: number;
  };
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Remove campos nulos/undefined do objeto para economizar tokens
 */
function cleanNullFields(obj: any): any {
  if (obj === null || obj === undefined) return null;
  
  if (Array.isArray(obj)) {
    return obj.map(cleanNullFields).filter(item => item !== null);
  }
  
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanNullFields(value);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * Constrói a URL completa com parâmetros de autenticação e pesquisa
 */
function buildVistaUrl(
  endpoint: string,
  params: VistaToolParams,
  showTotal: boolean = false
): string {
  const queryParams = new URLSearchParams();
  queryParams.set("key", VISTA_KEY);

  // Campos a retornar
  if (params.campos && params.campos.length > 0) {
    queryParams.set("fields", JSON.stringify(params.campos));
  }

  // Filtros padrão
  if (params.filtros) {
    const { filter, advFilter, ...restFilters } = params.filtros;
    
    if (Object.keys(restFilters).length > 0) {
      queryParams.set("pesquisa", JSON.stringify({ filter: restFilters }));
    }
    
    if (filter) {
      queryParams.set("pesquisa", JSON.stringify({ filter }));
    }
    
    if (advFilter) {
      queryParams.set("advFilter", JSON.stringify(advFilter));
    }
  }

  // Paginação
  if (params.paginacao) {
    queryParams.set(
      "paginacao",
      JSON.stringify({
        pagina: params.paginacao.pagina || 1,
        quantidade: Math.min(params.paginacao.quantidade || 20, 50), // Máx 50
      })
    );
  }

  // Ordenação
  if (params.ordenacao) {
    queryParams.set("order", JSON.stringify(params.ordenacao));
  }

  // Total de registros
  if (showTotal) {
    queryParams.set("showtotal", "1");
  }

  return `${BASE_URL}${endpoint}?${queryParams.toString()}`;
}

/**
 * Faz requisição GET para a API Vista
 */
async function vistaGet(
  endpoint: string,
  params: VistaToolParams = {},
  showTotal: boolean = false
): Promise<VistaResponse> {
  try {
    const url = buildVistaUrl(endpoint, params, showTotal);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        error: `Erro HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    // Se showtotal=true, separa dados dos metadados
    if (showTotal && data.total !== undefined) {
      const { total, paginas, pagina, quantidade, ...records } = data;
      return {
        data: cleanNullFields(records.data || records),
        metadata: { total, paginas, pagina, quantidade },
      };
    }

    return {
      data: cleanNullFields(data),
    };
  } catch (error: any) {
    return {
      error: `Erro na requisição: ${error.message}`,
    };
  }
}

/**
 * Faz requisição POST para a API Vista (cadastros/alterações)
 */
async function vistaPost(
  endpoint: string,
  body: Record<string, any>
): Promise<VistaResponse> {
  try {
    const url = `${BASE_URL}${endpoint}?key=${VISTA_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        error: `Erro HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      data: cleanNullFields(data),
    };
  } catch (error: any) {
    return {
      error: `Erro na requisição: ${error.message}`,
    };
  }
}

// ============================================================
// SCHEMAS ZOD REUTILIZÁVEIS
// ============================================================

const camposSchema = z
  .array(z.string())
  .optional()
  .describe(
    "Lista de campos específicos para retornar. Ex: ['Codigo', 'Nome', 'ValorVenda']. Se omitido, retorna apenas código."
  );

const filtrosSchema = z
  .object({})
  .passthrough()
  .optional()
  .describe(
    "Objeto de filtros para pesquisa. Suporta: texto simples, arrays para múltiplos valores, intervalos [min, max], operadores ['>=', valor]. Ex: { ValorVenda: ['>=', 500000], Tipo: 'Apartamento' }"
  );

const paginacaoSchema = z
  .object({
    pagina: z.number().int().positive().default(1).describe("Número da página (padrão: 1)"),
    quantidade: z.number().int().min(1).max(50).default(20).describe("Registros por página (máx: 50, padrão: 20)"),
  })
  .optional()
  .describe("Controle de paginação: { pagina: 1, quantidade: 20 }");

const ordenacaoSchema = z
  .object({})
  .passthrough()
  .optional()
  .describe(
    "Ordenação por campo. Ex: { ValorVenda: 'asc', Bairro: 'desc' }"
  );

// ============================================================
// CRIAÇÃO DO SERVIDOR MCP
// ============================================================

const server = new McpServer({
  name: "vista-crm-mcp",
  version: "1.0.0",
});

// ============================================================
// 📦 FERRAMENTAS: IMÓVEIS
// ============================================================

/**
 * PESQUISAR IMÓVEIS
 * Use para buscar imóveis disponíveis para venda ou locação.
 * Suporta filtros por tipo, valor, localização, corretor, etc.
 */
server.tool(
  "imoveis_pesquisar",
  {
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/imoveis/listar",
      { campos, filtros, paginacao, ordenacao },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { imoveis: result.data, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * DETALHES DO IMÓVEL
 * Use para obter informações completas de um imóvel específico.
 */
server.tool(
  "imovel_detalhes",
  {
    codigo: z.string().describe("Código do imóvel"),
    campos: camposSchema,
  },
  async ({ codigo, campos }) => {
    const result = await vistaGet("/imoveis/detalhes", {
      campos: campos || ["*"],
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * FOTOS DO IMÓVEL
 * Use para obter todas as fotos de um imóvel.
 */
server.tool(
  "imovel_fotos",
  {
    codigo: z.string().describe("Código do imóvel"),
  },
  async ({ codigo }) => {
    const result = await vistaGet("/imoveis/fotos", {
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * CAMPOS DISPONÍVEIS PARA IMÓVEIS
 * Use para descobrir quais campos estão disponíveis na API para imóveis.
 */
server.tool(
  "imoveis_campos",
  {},
  async () => {
    const result = await vistaGet("/imoveis/campos", {});

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * LISTAR CIDADES/BAIRROS/VALORES
 * Use para obter listas de cidades, bairros, faixas de valor, etc.
 */
server.tool(
  "imoveis_listas",
  {
    tipo: z
      .enum(["cidades", "bairros", "tipos", "finalidades", "categorias"])
      .describe("Tipo de lista a retornar"),
  },
  async ({ tipo }) => {
    const result = await vistaGet("/imoveis/listas", {
      filtros: { tipo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * CADASTRAR IMÓVEL
 * Use para criar um novo imóvel no sistema.
 */
server.tool(
  "imovel_cadastrar",
  {
    dados: z
      .object({})
      .passthrough()
      .describe("Dados completos do imóvel. Inclua Tipo, Finalidade, Valor, Endereço, etc."),
  },
  async ({ dados }) => {
    const result = await vistaPost("/imoveis/cadastrar", dados);

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Imóvel cadastrado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * ALTERAR IMÓVEL
 * Use para atualizar dados de um imóvel existente.
 */
server.tool(
  "imovel_alterar",
  {
    codigo: z.string().describe("Código do imóvel a alterar"),
    dados: z
      .object({})
      .passthrough()
      .describe("Campos a atualizar com seus novos valores"),
  },
  async ({ codigo, dados }) => {
    const result = await vistaPost("/imoveis/alterar", {
      Codigo: codigo,
      ...dados,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Imóvel atualizado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * IMÓVEIS POR CORRETOR
 * Use para buscar todos os imóveis vinculados a um corretor específico.
 */
server.tool(
  "imoveis_por_corretor",
  {
    corretor: z.string().describe("Código do corretor"),
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ corretor, campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/imoveis/listar",
      {
        campos,
        filtros: { CodigoCorretor: corretor, ...filtros },
        paginacao,
        ordenacao,
      },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { imoveis: result.data, corretor, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * IMÓVEIS POR AGÊNCIA
 * Use para buscar todos os imóveis vinculados a uma agência/filial específica.
 */
server.tool(
  "imoveis_por_agencia",
  {
    agencia: z.string().describe("Código da agência"),
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ agencia, campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/imoveis/listar",
      {
        campos,
        filtros: { CodigoAgencia: agencia, ...filtros },
        paginacao,
        ordenacao,
      },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { imoveis: result.data, agencia, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * ANEXOS DO IMÓVEL
 * Use para obter documentos e anexos vinculados a um imóvel
 * (matrícula, IPTU, plantas, etc.).
 */
server.tool(
  "imovel_anexos",
  {
    codigo: z.string().describe("Código do imóvel"),
  },
  async ({ codigo }) => {
    const result = await vistaGet("/imoveis/anexos", {
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * HISTÓRICO DO IMÓVEL
 * Use para obter o histórico de alterações e eventos de um imóvel
 * (mudanças de valor, status, proprietário, etc.).
 */
server.tool(
  "imovel_historico",
  {
    codigo: z.string().describe("Código do imóvel"),
  },
  async ({ codigo }) => {
    const result = await vistaGet("/imoveis/historico", {
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * CADASTRAR FOTOS NO IMÓVEL
 * Use para adicionar fotos a um imóvel existente.
 */
server.tool(
  "imovel_cadastrar_fotos",
  {
    codigo: z.string().describe("Código do imóvel"),
    fotos: z
      .array(
        z.object({
          URL: z.string().describe("URL da imagem"),
          Principal: z.boolean().optional().describe("Se é a foto principal (capa)"),
          Ordem: z.number().int().optional().describe("Ordem de exibição"),
          Descricao: z.string().optional().describe("Descrição da foto"),
        })
      )
      .describe("Lista de fotos para cadastrar"),
  },
  async ({ codigo, fotos }) => {
    const result = await vistaPost("/imoveis/cadastrar-fotos", {
      Codigo: codigo,
      Fotos: fotos,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Fotos cadastradas com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * CADASTRAR DOCUMENTOS NO IMÓVEL
 * Use para adicionar documentos/anexos a um imóvel existente
 * (matrícula, IPTU, plantas, laudos, etc.).
 */
server.tool(
  "imovel_cadastrar_documentos",
  {
    codigo: z.string().describe("Código do imóvel"),
    documentos: z
      .array(
        z.object({
          URL: z.string().describe("URL do documento"),
          Tipo: z.string().describe("Tipo do documento (ex: matricula, iptu, planta)"),
          Descricao: z.string().optional().describe("Descrição do documento"),
        })
      )
      .describe("Lista de documentos para cadastrar"),
  },
  async ({ codigo, documentos }) => {
    const result = await vistaPost("/imoveis/cadastrar-documentos", {
      Codigo: codigo,
      Documentos: documentos,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Documentos cadastrados com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * CADASTRAR HISTÓRICO NO IMÓVEL
 * Use para registrar um evento/anotação no histórico de um imóvel.
 */
server.tool(
  "imovel_cadastrar_historico",
  {
    codigo: z.string().describe("Código do imóvel"),
    dados: z
      .object({
        Descricao: z.string().describe("Descrição do evento/acontecimento"),
        Data: z.string().optional().describe("Data do evento (YYYY-MM-DD). Se omitido, usa data atual"),
        Tipo: z.string().optional().describe("Tipo do evento (ex: alteracao_valor, mudanca_status)"),
      })
      .passthrough()
      .describe("Dados do registro de histórico"),
  },
  async ({ codigo, dados }) => {
    const result = await vistaPost("/imoveis/cadastrar-historico", {
      Codigo: codigo,
      ...dados,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Histórico registrado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * CADASTRAR PROPRIETÁRIO NO IMÓVEL
 * Use para vincular um proprietário a um imóvel.
 */
server.tool(
  "imovel_cadastrar_proprietario",
  {
    codigo: z.string().describe("Código do imóvel"),
    proprietario: z
      .object({
        Nome: z.string().describe("Nome do proprietário"),
        CPF: z.string().optional().describe("CPF do proprietário"),
        Email: z.string().email().optional().describe("Email do proprietário"),
        Telefone: z.string().optional().describe("Telefone do proprietário"),
        Percentual: z.number().optional().describe("Percentual de participação (padrão: 100)"),
      })
      .passthrough()
      .describe("Dados do proprietário"),
  },
  async ({ codigo, proprietario }) => {
    const result = await vistaPost("/imoveis/cadastrar-proprietario", {
      Codigo: codigo,
      Proprietario: proprietario,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Proprietário vinculado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * DEFINIR CORRETOR PARA O IMÓVEL
 * Use para atribuir ou trocar o corretor responsável por um imóvel.
 */
server.tool(
  "imovel_definir_corretor",
  {
    codigo: z.string().describe("Código do imóvel"),
    corretor: z.string().describe("Código do corretor"),
  },
  async ({ codigo, corretor }) => {
    const result = await vistaPost("/imoveis/definir-corretor", {
      Codigo: codigo,
      Corretor: corretor,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Corretor definido com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * INFORMAÇÕES IMPORTANTES DO IMÓVEL
 * Use para obter informações resumidas e destacadas de um imóvel
 * (ideal para listagens rápidas e cards).
 */
server.tool(
  "imovel_informacoes",
  {
    codigo: z.string().describe("Código do imóvel"),
  },
  async ({ codigo }) => {
    const result = await vistaGet("/imoveis/informacoes", {
      campos: ["*"],
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

// ============================================================
// 👥 FERRAMENTAS: CLIENTES
// ============================================================

/**
 * PESQUISAR CLIENTES
 * Use para buscar clientes cadastrados no CRM.
 * Suporta filtros por nome, email, telefone, corretor, etc.
 * Ideal para CRM, busca de contatos e gestão de carteira.
 */
server.tool(
  "clientes_pesquisar",
  {
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/clientes/listar",
      { campos, filtros, paginacao, ordenacao },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { clientes: result.data, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * DETALHES DO CLIENTE
 * Use para obter informações completas de um cliente específico.
 */
server.tool(
  "cliente_detalhes",
  {
    codigo: z.string().describe("Código do cliente"),
    campos: camposSchema,
  },
  async ({ codigo, campos }) => {
    const result = await vistaGet("/clientes/detalhes", {
      campos: campos || ["*"],
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * HISTÓRICO DO CLIENTE
 * Use para obter o histórico de interações com um cliente.
 */
server.tool(
  "cliente_historico",
  {
    codigo: z.string().describe("Código do cliente"),
  },
  async ({ codigo }) => {
    const result = await vistaGet("/clientes/historico", {
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * IMÓVEIS FAVORITOS DO CLIENTE
 * Use para obter a lista de imóveis favoritados por um cliente.
 */
server.tool(
  "cliente_favoritos",
  {
    codigo: z.string().describe("Código do cliente"),
  },
  async ({ codigo }) => {
    const result = await vistaGet("/clientes/favoritos", {
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * CADASTRAR CLIENTE
 * Use para criar um novo cliente/contato no CRM.
 */
server.tool(
  "cliente_cadastrar",
  {
    dados: z
      .object({})
      .passthrough()
      .describe("Dados do cliente: Nome, Email, Telefone, CPF, etc."),
  },
  async ({ dados }) => {
    const result = await vistaPost("/clientes/cadastrar", dados);

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Cliente cadastrado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * ALTERAR CLIENTE
 * Use para atualizar dados de um cliente existente.
 */
server.tool(
  "cliente_alterar",
  {
    codigo: z.string().describe("Código do cliente a alterar"),
    dados: z
      .object({})
      .passthrough()
      .describe("Campos a atualizar com seus novos valores"),
  },
  async ({ codigo, dados }) => {
    const result = await vistaPost("/clientes/alterar", {
      Codigo: codigo,
      ...dados,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Cliente atualizado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * CLIENTES POR CORRETOR
 * Use para buscar todos os clientes vinculados a um corretor específico.
 */
server.tool(
  "clientes_por_corretor",
  {
    corretor: z.string().describe("Código do corretor"),
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ corretor, campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/clientes/listar",
      {
        campos,
        filtros: { CodigoCorretor: corretor, ...filtros },
        paginacao,
        ordenacao,
      },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { clientes: result.data, corretor, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * CLIENTES POR AGÊNCIA
 * Use para buscar todos os clientes vinculados a uma agência/filial específica.
 */
server.tool(
  "clientes_por_agencia",
  {
    agencia: z.string().describe("Código da agência"),
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ agencia, campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/clientes/listar",
      {
        campos,
        filtros: { CodigoAgencia: agencia, ...filtros },
        paginacao,
        ordenacao,
      },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { clientes: result.data, agencia, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * CAMPOS DISPONÍVEIS PARA CLIENTES
 * Use para descobrir quais campos estão disponíveis na API para clientes.
 */
server.tool(
  "clientes_campos",
  {},
  async () => {
    const result = await vistaGet("/clientes/campos", {});

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * CADASTRAR HISTÓRICO NO CLIENTE
 * Use para registrar um evento/anotação no histórico de um cliente
 * (contato realizado, proposta, visita, etc.).
 */
server.tool(
  "cliente_cadastrar_historico",
  {
    codigo: z.string().describe("Código do cliente"),
    dados: z
      .object({
        Descricao: z.string().describe("Descrição do evento/anotação"),
        Data: z.string().optional().describe("Data do evento (YYYY-MM-DD). Se omitido, usa data atual"),
        Tipo: z.string().optional().describe("Tipo do evento (ex: contato, proposta, visita, ligacao)"),
      })
      .passthrough()
      .describe("Dados do registro de histórico"),
  },
  async ({ codigo, dados }) => {
    const result = await vistaPost("/clientes/cadastrar-historico", {
      Codigo: codigo,
      ...dados,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Histórico registrado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * DEFINIR CORRETOR PARA O CLIENTE
 * Use para atribuir ou trocar o corretor responsável por um cliente.
 */
server.tool(
  "cliente_definir_corretor",
  {
    codigo: z.string().describe("Código do cliente"),
    corretor: z.string().describe("Código do corretor"),
  },
  async ({ codigo, corretor }) => {
    const result = await vistaPost("/clientes/definir-corretor", {
      Codigo: codigo,
      Corretor: corretor,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Corretor definido com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// 📩 FERRAMENTAS: LEADS
// ============================================================

/**
 * ENVIAR LEAD
 * Use para cadastrar um novo lead proveniente de fontes externas
 * (site, redes sociais, portais imobiliários).
 * O lead é automaticamente vinculado ao módulo de clientes.
 */
server.tool(
  "lead_enviar",
  {
    dados: z
      .object({
        Nome: z.string().describe("Nome completo do lead"),
        Email: z.string().email().optional().describe("Email do lead"),
        Telefone: z.string().optional().describe("Telefone do lead"),
        Origem: z.string().optional().describe("Origem do lead (ex: site, instagram, zap)").optional(),
        Mensagem: z.string().optional().describe("Mensagem ou interesse do lead").optional(),
      })
      .passthrough()
      .describe("Dados do lead. Campos mínimos: Nome, Email, Telefone. Adicione campos extras conforme necessário."),
  },
  async ({ dados }) => {
    const result = await vistaPost("/clientes/enviar-lead", dados);

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Lead enviado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * PESQUISAR LEADS
 * Use para buscar leads cadastrados. Equivalente a clientes com filtro de origem.
 */
server.tool(
  "leads_pesquisar",
  {
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ campos, filtros, paginacao, ordenacao }) => {
    // Leads são clientes com origem definida
    const filtrosComOrigem = {
      ...filtros,
      Origem: filtros?.Origem || { "!=": null },
    };

    const result = await vistaGet(
      "/clientes/listar",
      { campos, filtros: filtrosComOrigem, paginacao, ordenacao },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { leads: result.data, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// 📅 FERRAMENTAS: AGENDAMENTOS
// ============================================================

/**
 * PESQUISAR AGENDAMENTOS
 * Use para buscar agendamentos de visitas, reuniões ou compromissos.
 * Suporta filtros por data, cliente, corretor, status, etc.
 */
server.tool(
  "agendamentos_pesquisar",
  {
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/agendamentos/listar",
      { campos, filtros, paginacao, ordenacao },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { agendamentos: result.data, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * DETALHES DO AGENDAMENTO
 * Use para obter informações completas de um agendamento específico.
 */
server.tool(
  "agendamento_detalhes",
  {
    codigo: z.string().describe("Código do agendamento"),
    campos: camposSchema,
  },
  async ({ codigo, campos }) => {
    const result = await vistaGet("/agendamentos/detalhes", {
      campos: campos || ["*"],
      filtros: { Codigo: codigo },
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

/**
 * CADASTRAR AGENDAMENTO
 * Use para criar um novo agendamento (visita, reunião, etc.).
 */
server.tool(
  "agendamento_cadastrar",
  {
    dados: z
      .object({})
      .passthrough()
      .describe("Dados do agendamento: Data, Hora, Cliente, Imovel, Corretor, Tipo, Observacoes."),
  },
  async ({ dados }) => {
    const result = await vistaPost("/agendamentos/cadastrar", dados);

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Agendamento criado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * ALTERAR AGENDAMENTO
 * Use para atualizar dados de um agendamento existente.
 */
server.tool(
  "agendamento_alterar",
  {
    codigo: z.string().describe("Código do agendamento a alterar"),
    dados: z
      .object({})
      .passthrough()
      .describe("Campos a atualizar com seus novos valores"),
  },
  async ({ codigo, dados }) => {
    const result = await vistaPost("/agendamentos/alterar", {
      Codigo: codigo,
      ...dados,
    });

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { mensagem: "Agendamento atualizado com sucesso", data: result.data },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * AGENDAMENTOS POR CORRETOR
 * Use para buscar todos os agendamentos vinculados a um corretor específico.
 */
server.tool(
  "agendamentos_por_corretor",
  {
    corretor: z.string().describe("Código do corretor"),
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ corretor, campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/agendamentos/listar",
      {
        campos,
        filtros: { CodigoCorretor: corretor, ...filtros },
        paginacao,
        ordenacao,
      },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { agendamentos: result.data, corretor, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * AGENDAMENTOS POR CLIENTE
 * Use para buscar todos os agendamentos vinculados a um cliente específico.
 */
server.tool(
  "agendamentos_por_cliente",
  {
    cliente: z.string().describe("Código do cliente"),
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ cliente, campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/agendamentos/listar",
      {
        campos,
        filtros: { CodigoCliente: cliente, ...filtros },
        paginacao,
        ordenacao,
      },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { agendamentos: result.data, cliente, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

/**
 * AGENDAMENTOS POR IMÓVEL
 * Use para buscar todos os agendamentos vinculados a um imóvel específico.
 */
server.tool(
  "agendamentos_por_imovel",
  {
    imovel: z.string().describe("Código do imóvel"),
    campos: camposSchema,
    filtros: filtrosSchema,
    paginacao: paginacaoSchema,
    ordenacao: ordenacaoSchema,
  },
  async ({ imovel, campos, filtros, paginacao, ordenacao }) => {
    const result = await vistaGet(
      "/agendamentos/listar",
      {
        campos,
        filtros: { CodigoImovel: imovel, ...filtros },
        paginacao,
        ordenacao,
      },
      true
    );

    if (result.error) {
      return {
        content: [{ type: "text", text: `Erro: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { agendamentos: result.data, imovel, metadata: result.metadata },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================================
// 🔧 FERRAMENTAS AUXILIARES
// ============================================================

/**
 * STATUS DA API
 * Use para verificar se a API Vista está acessível.
 */
server.tool(
  "vista_status",
  {},
  async () => {
    try {
      const url = `${BASE_URL}/imoveis/campos?key=${VISTA_KEY}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: response.ok ? "online" : "offline",
                httpStatus: response.status,
                baseUrl: BASE_URL,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { status: "offline", error: error.message },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server Vista CRM iniciado com sucesso via Stdio.");
  console.error(`URL Base: ${BASE_URL}`);
  console.error("Ferramentas registradas:");
  console.error("  📦 Imóveis: pesquisar, detalhes, fotos, anexos, historico, informacoes, campos, listas, por_corretor, por_agencia, cadastrar, alterar, cadastrar_fotos, cadastrar_documentos, cadastrar_historico, cadastrar_proprietario, definir_corretor");
  console.error("  👥 Clientes: pesquisar, detalhes, historico, favoritos, campos, por_corretor, por_agencia, cadastrar, alterar, cadastrar_historico, definir_corretor");
  console.error("  📩 Leads: enviar, pesquisar");
  console.error("  📅 Agendamentos: pesquisar, detalhes, por_corretor, por_cliente, por_imovel, cadastrar, alterar");
  console.error("  🔧 Auxiliares: status");
}

main().catch((error) => {
  console.error("Erro ao iniciar MCP Server:", error);
  process.exit(1);
});

export default server;
