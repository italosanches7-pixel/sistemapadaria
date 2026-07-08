import { describe, expect, it } from "vitest";
import { calcularJanela, calcularIntervaloCustomizado } from "@/lib/periodo";

describe("calcularJanela", () => {
  it("dia: começa às 00:00 de hoje e termina agora", () => {
    const referencia = new Date(2026, 6, 8, 15, 30); // 8 de julho de 2026, 15:30 (quarta-feira)
    const { inicio, fim } = calcularJanela("dia", referencia);

    expect(inicio.getFullYear()).toBe(2026);
    expect(inicio.getMonth()).toBe(6);
    expect(inicio.getDate()).toBe(8);
    expect(inicio.getHours()).toBe(0);
    expect(inicio.getMinutes()).toBe(0);
    expect(fim).toEqual(referencia);
  });

  it("semana: começa na segunda-feira da semana atual", () => {
    const quarta = new Date(2026, 6, 8, 15, 30); // quarta-feira
    const { inicio } = calcularJanela("semana", quarta);

    expect(inicio.getDay()).toBe(1); // segunda-feira
    expect(inicio.getDate()).toBe(6); // segunda anterior a 8/jul/2026
  });

  it("semana: quando hoje é domingo, começa na segunda-feira anterior (não na mesma semana civil seguinte)", () => {
    const domingo = new Date(2026, 6, 12, 10, 0); // domingo
    const { inicio } = calcularJanela("semana", domingo);

    expect(inicio.getDay()).toBe(1);
    expect(inicio.getDate()).toBe(6);
  });

  it("quinzena: primeira metade do mês começa no dia 1", () => {
    const dia10 = new Date(2026, 6, 10, 10, 0);
    const { inicio } = calcularJanela("quinzena", dia10);
    expect(inicio.getDate()).toBe(1);
  });

  it("quinzena: segunda metade do mês começa no dia 16", () => {
    const dia20 = new Date(2026, 6, 20, 10, 0);
    const { inicio } = calcularJanela("quinzena", dia20);
    expect(inicio.getDate()).toBe(16);
  });

  it("mes: começa no dia 1 do mês atual", () => {
    const referencia = new Date(2026, 6, 20, 10, 0);
    const { inicio } = calcularJanela("mes", referencia);
    expect(inicio.getDate()).toBe(1);
    expect(inicio.getMonth()).toBe(6);
  });
});

describe("calcularIntervaloCustomizado", () => {
  it("inclui o dia final até 23:59:59.999", () => {
    const { inicio, fim } = calcularIntervaloCustomizado("2026-07-01", "2026-07-05");

    expect(inicio.getDate()).toBe(1);
    expect(inicio.getHours()).toBe(0);
    expect(fim.getDate()).toBe(5);
    expect(fim.getHours()).toBe(23);
    expect(fim.getMinutes()).toBe(59);
  });
});
