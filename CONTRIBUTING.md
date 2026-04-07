# Contribuindo com o MCP Server Vista CRM

Obrigado pelo seu interesse em contribuir! Este projeto visa facilitar a integração de IAs com o mercado imobiliário brasileiro através da API Vista.

## Como Contribuir

1.  **Reportar Bugs:** Abra uma *Issue* detalhando o erro, como reproduzi-lo e seu ambiente.
2.  **Sugerir Melhorias:** Adoraríamos ouvir suas ideias para novas ferramentas ou otimizações.
3.  **Pull Requests:**
    *   Faça um Fork do repositório.
    *   Crie uma branch para sua modificação (`git checkout -b feature/nova-ferramenta`).
    *   Certifique-se de que o código segue o padrão TypeScript existente.
    *   Faça o build (`npm run build`) para garantir que não há erros.
    *   Envie o PR com uma descrição clara das mudanças.

## Padrões de Código

*   Use `console.error` para logs de debug (necessário para não quebrar o transporte `stdio` do MCP).
*   Sempre limpe campos nulos das respostas usando a função `cleanNullFields` para economizar tokens.
*   Documente novas ferramentas com descrições claras para que a IA entenda quando usá-las.

## Dúvidas?

Sinta-se à vontade para abrir uma discussão no repositório!
