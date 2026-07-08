export type Periodo = "dia" | "semana" | "quinzena" | "mes";

export const ROTULOS_PERIODO: Record<Periodo, string> = {
  dia: "Hoje",
  semana: "Esta semana",
  quinzena: "Esta quinzena",
  mes: "Este mês",
};

function iniciarDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0, 0);
}

function finalizarDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 23, 59, 59, 999);
}

function subtrairDias(data: Date, dias: number): Date {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() - dias);
  return resultado;
}

/**
 * Janelas calendário: dia = hoje; semana = segunda-feira até hoje;
 * quinzena = 1-15 ou 16-fim do mês (conforme o dia de hoje); mes = dia 1 até hoje.
 */
export function calcularJanela(periodo: Periodo, referencia: Date = new Date()): { inicio: Date; fim: Date } {
  const fim = new Date(referencia);
  let inicio: Date;

  switch (periodo) {
    case "dia": {
      inicio = iniciarDia(referencia);
      break;
    }
    case "semana": {
      const diaSemana = referencia.getDay(); // 0 = domingo ... 6 = sábado
      const diasDesdeSegunda = (diaSemana + 6) % 7;
      inicio = iniciarDia(subtrairDias(referencia, diasDesdeSegunda));
      break;
    }
    case "quinzena": {
      const dia = referencia.getDate();
      inicio = new Date(referencia.getFullYear(), referencia.getMonth(), dia <= 15 ? 1 : 16);
      break;
    }
    case "mes": {
      inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
      break;
    }
  }

  return { inicio, fim };
}

export function calcularIntervaloCustomizado(inicioStr: string, fimStr: string): { inicio: Date; fim: Date } {
  const inicio = iniciarDia(new Date(`${inicioStr}T00:00:00`));
  const fim = finalizarDia(new Date(`${fimStr}T00:00:00`));
  return { inicio, fim };
}
