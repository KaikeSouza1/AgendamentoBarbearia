// src/app/api/dashboard/faturamento/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// 💡 ESTA É A CORREÇÃO: Força a rota a nunca usar cache
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hoje = new Date();

    // 1. Faturamento de Hoje
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);
    const faturamentoHoje = await prisma.agendamento.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        data_hora: {
          gte: inicioHoje,
          lte: fimHoje,
        },
      },
    });

    // 2. Faturamento da Semana (Iniciando na Segunda-feira)
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 }); 
    const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 });
    const faturamentoSemana = await prisma.agendamento.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        data_hora: {
          gte: inicioSemana,
          lte: fimSemana,
        },
      },
    });

    // 3. Faturamento do Mês
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);
    const faturamentoMes = await prisma.agendamento.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        data_hora: {
          gte: inicioMes,
          lte: fimMes,
        },
      },
    });

    const dadosFaturamento = {
      // Usamos .toNumber() para converter de Decimal para número antes de enviar o JSON
      hoje: faturamentoHoje._sum.valor?.toNumber() ?? 0,
      semana: faturamentoSemana._sum.valor?.toNumber() ?? 0,
      mes: faturamentoMes._sum.valor?.toNumber() ?? 0,
    };

    return NextResponse.json(dadosFaturamento);

  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}