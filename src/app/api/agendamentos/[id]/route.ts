// src/app/api/agendamentos/[id]/route.ts

import { NextResponse, NextRequest } from 'next/server'; // Importe o NextRequest
import { prisma } from '@/lib/prisma';

// Este é o novo tipo que o Next.js espera para o segundo argumento
interface Context {
  params: {
    id: string;
  };
}

// Função para ATUALIZAR (PUT) com a assinatura correta
export async function PUT(request: NextRequest, context: Context) {
  try {
    const id = Number(context.params.id); // Pegamos o 'id' de 'context.params'
    const body = await request.json();
    const { nome_cliente, data_hora } = body;

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        nome_cliente,
        data_hora: new Date(data_hora),
      },
    });

    return NextResponse.json(agendamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json({ message: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}

// Função para DELETAR com a assinatura correta
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const id = Number(context.params.id); // Pegamos o 'id' de 'context.params'

    await prisma.agendamento.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return NextResponse.json({ message: 'Erro ao deletar agendamento' }, { status: 500 });
  }
}