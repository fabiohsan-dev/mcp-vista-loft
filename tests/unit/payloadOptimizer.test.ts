import { optimizePayload } from '../../src/utils/payloadOptimizer.js';

describe('PayloadOptimizer', () => {
  it('deve remover chaves nulas e strings vazias', () => {
    const input = {
      nome: 'Teste',
      valor: null,
      vazio: '',
      endereco: {
        rua: 'Rua A',
        complemento: null
      }
    };
    const expected = {
      nome: 'Teste',
      endereco: {
        rua: 'Rua A'
      }
    };
    expect(optimizePayload(input)).toEqual(expected);
  });

  it('deve remover arrays e objetos vazios', () => {
    const input = {
      tags: [],
      metadata: {},
      ativo: true
    };
    const expected = {
      ativo: true
    };
    expect(optimizePayload(input)).toEqual(expected);
  });
});
