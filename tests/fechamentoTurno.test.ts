import { describe, expect, it } from "vitest";
import { calcularValorEsperadoFechamento, calcularDiferencaFechamento } from "@/lib/calculos";

describe("fechamento de turno", () => {
  it("valor esperado é o fundo de troco somado às vendas em dinheiro", () => {
    const esperado = calcularValorEsperadoFechamento(100, 250.5);
    expect(esperado).toBeCloseTo(350.5, 2);
  });

  it("diferença positiva quando sobra dinheiro no caixa", () => {
    const diferenca = calcularDiferencaFechamento(360, 350);
    expect(diferenca).toBeCloseTo(10, 2);
  });

  it("diferença negativa quando falta dinheiro no caixa", () => {
    const diferenca = calcularDiferencaFechamento(340, 350);
    expect(diferenca).toBeCloseTo(-10, 2);
  });

  it("diferença zero quando o caixa bate certinho", () => {
    const diferenca = calcularDiferencaFechamento(350, 350);
    expect(diferenca).toBe(0);
  });
});
