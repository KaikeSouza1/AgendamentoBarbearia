// src/app/api/agendamentos/[id]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // 💡 Importar Prisma para o tipo Decimal

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    // 💡 1. ADICIONADO "valor"
    const { nome_cliente, data_hora, valor } = body;

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        nome_cliente,
        data_hora: new Date(data_hora),
        // 💡 2. CAMPO ADICIONADO (convertendo para Decimal)
        valor: new Prisma.Decimal(valor || 0),
      },
    });

    return NextResponse.json(agendamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json({ message: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    await prisma.agendamento.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return NextResponse.json({ message: 'Erro ao deletar agendamento' }, { status: 500 });
  }
}