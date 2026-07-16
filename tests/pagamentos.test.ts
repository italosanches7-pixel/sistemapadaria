import { describe, expect, it } from "vitest";
import { validarPagamentos, somarPagamentos } from "@/lib/calculos";

describe("somarPagamentos", () => {
  it("soma os valores com arredondamento de centavos", () => {
    expect(somarPagamentos([{ valor: 10.1 }, { valor: 20.2 }])).toBeCloseTo(30.3, 2);
  });
});

describe("validarPagamentos", () => {
  it("aceita um pagamento único igual ao total", () => {
    expect(validarPagamentos([{ valor: 33.8 }], 33.8)).toBeNull();
  });

  it("aceita pagamento dividido que soma o total", () => {
    expect(validarPagamentos([{ valor: 20 }, { valor: 13.8 }], 33.8)).toBeNull();
  });

  it("rejeita lista vazia", () => {
    expect(validarPagamentos([], 10)).toMatch(/ao menos uma forma/);
  });

  it("rejeita valor zero ou negativo", () => {
    expect(validarPagamentos([{ valor: 0 }, { valor: 33.8 }], 33.8)).toMatch(/maior que zero/);
    expect(validarPagamentos([{ valor: -5 }, { valor: 38.8 }], 33.8)).toMatch(/maior que zero/);
  });

  it("rejeita soma menor que o total", () => {
    expect(validarPagamentos([{ valor: 20 }], 33.8)).toMatch(/não bate/);
  });

  it("rejeita soma maior que o total", () => {
    expect(validarPagamentos([{ valor: 20 }, { valor: 20 }], 33.8)).toMatch(/não bate/);
  });

  it("tolera diferença de arredondamento de meio centavo", () => {
    expect(validarPagamentos([{ valor: 11.335 }, { valor: 22.465 }], 33.8)).toBeNull();
  });

  it("rejeita a mesma forma de pagamento repetida", () => {
    expect(
      validarPagamentos(
        [
          { valor: 10, formaPagamento: "DINHEIRO" },
          { valor: 23.8, formaPagamento: "DINHEIRO" },
        ],
        33.8
      )
    ).toMatch(/Não repita/);
  });

  it("aceita formas diferentes", () => {
    expect(
      validarPagamentos(
        [
          { valor: 10, formaPagamento: "DINHEIRO" },
          { valor: 23.8, formaPagamento: "PIX" },
        ],
        33.8
      )
    ).toBeNull();
  });
});
