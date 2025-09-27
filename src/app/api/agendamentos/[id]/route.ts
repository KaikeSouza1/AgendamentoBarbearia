// src/app/api/agendamentos/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// Função para ATUALIZAR (PUT) um agendamento existente
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);
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

// Função para DELETAR um agendamento
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = Number(params.id);

    await prisma.agendamento.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content = Sucesso sem corpo
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    return NextResponse.json({ message: 'Erro ao deletar agendamento' }, { status: 500 });
  }
}