import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importamos nossa instância única do Prisma

// Função para BUSCAR (GET) os agendamentos
export async function GET() {
  try {
    // Usa o Prisma para buscar todos os registros da tabela Agendamento
    const agendamentos = await prisma.agendamento.findMany({
      // Ordena os resultados pela data e hora, do mais antigo para o mais novo
      orderBy: {
        data_hora: 'asc',
      },
    });

    // Retorna os agendamentos encontrados como JSON
    return NextResponse.json(agendamentos);
  } catch (error) {
    // Em caso de erro, retorna uma mensagem de erro
    return NextResponse.json(
      { message: 'Erro ao buscar agendamentos.' },
      { status: 500 }
    );
  }
}

// Função para CRIAR (POST) um novo agendamento
export async function POST(request: Request) {
  try {
    // Pega o corpo (body) da requisição, que deve ser um JSON
    const body = await request.json();
    const { nome_cliente, data_hora } = body;

    // Validação simples para garantir que os campos necessários foram enviados
    if (!nome_cliente || !data_hora) {
      return NextResponse.json(
        { message: 'Nome do cliente e data/hora são obrigatórios.' },
        { status: 400 } // 400 = Bad Request
      );
    }

    // Usa o Prisma para criar um novo registro na tabela Agendamento
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        nome_cliente: nome_cliente,
        // Converte a string de data recebida para o formato de data do JavaScript
        data_hora: new Date(data_hora),
      },
    });

    // Retorna o agendamento recém-criado como JSON com status 201 (Criado)
    return NextResponse.json(novoAgendamento, { status: 201 });
  } catch (error) {
    // Em caso de erro no servidor, retorna uma mensagem de erro
    console.error(error); // Mostra o erro no console do servidor para depuração
    return NextResponse.json(
      { message: 'Erro ao criar agendamento.' },
      { status: 500 }
    );
  }
}