import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importamos nossa instância única do Prisma
import { Prisma } from '@prisma/client'; // 💡 Importar Prisma para o tipo Decimal

// Função para BUSCAR (GET) os agendamentos
export async function GET() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: {
        data_hora: 'asc',
      },
    });
    return NextResponse.json(agendamentos);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos.' },
      { status: 500 }
    );
  }
}

// Função para CRIAR (POST) um novo agendamento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 💡 1. ADICIONADO "valor"
    const { nome_cliente, data_hora, valor } = body;
    const dataHoraAgendamento = new Date(data_hora);

    if (!nome_cliente || !data_hora) {
      return NextResponse.json(
        { message: 'Nome do cliente e data/hora são obrigatórios.' },
        { status: 400 }
      );
    }

    // --- INÍCIO DA VALIDAÇÃO ---
    const agendamentoExistente = await prisma.agendamento.findFirst({
      where: {
        data_hora: dataHoraAgendamento,
      },
    });

    if (agendamentoExistente) {
      return NextResponse.json(
        { message: 'Este horário já está ocupado. Por favor, escolha outro.' },
        { status: 409 } // 409 = Conflict
      );
    }
    // --- FIM DA VALIDAÇÃO ---

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        nome_cliente: nome_cliente,
        data_hora: dataHoraAgendamento,
        // 💡 2. CAMPO ADICIONADO (convertendo para Decimal)
        valor: new Prisma.Decimal(valor || 0),
      },
    });

    return NextResponse.json(novoAgendamento, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Erro ao criar agendamento.' },
      { status: 500 }
    );
  }
}