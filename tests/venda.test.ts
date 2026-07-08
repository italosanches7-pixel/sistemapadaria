import { describe, expect, it } from "vitest";
import { calcularTotalVenda } from "@/lib/calculos";

describe("calcularTotalVenda", () => {
  it("soma quantidade x preço unitário de todos os itens", () => {
    const total = calcularTotalVenda([
      { quantidade: 2, precoUnitario: 14.9 },
      { quantidade: 1, precoUnitario: 8.9 },
    ]);
    expect(total).toBeCloseTo(38.7, 2);
  });

  it("retorna 0 para carrinho vazio", () => {
    expect(calcularTotalVenda([])).toBe(0);
  });

  it("arredonda para duas casas decimais", () => {
    const total = calcularTotalVenda([{ quantidade: 3, precoUnitario: 0.1 }]);
    expect(total).toBe(0.3);
  });
});
