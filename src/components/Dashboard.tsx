// src/components/Dashboard.tsx

"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { StatCard } from "@/components/ui/stat-card"; // 💡 IMPORTADO

// Interface simplificada
interface DashboardData {
  agendamentosHoje: number;
  proximoCliente: {
    nome: string;
    horario: Date;
  } | null;
}

interface DashboardProps {
  data: DashboardData;
  loading: boolean;
}

export default function Dashboard({ data, loading }: DashboardProps) {

  const proximoClienteInfo = data.proximoCliente
    ? `${data.proximoCliente.nome} às ${format(new Date(data.proximoCliente.horario), "HH:mm")}`
    : "Nenhum próximo cliente";

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* 💡 USANDO STATCARD COM LOADING */}
            <StatCard title="Agendamentos Hoje" value={0} icon={Calendar} loading={true} />
            <StatCard title="Próximo Cliente" value={0} icon={Clock} loading={true} />
        </div>
    );
  }

  // Layout ajustado para 2 colunas
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      {/* 💡 USANDO STATCARD */}
      <StatCard title="Agendamentos Hoje" value={data.agendamentosHoje} icon={Calendar} />
      <StatCard title="Próximo Cliente" value={proximoClienteInfo} icon={Clock} />
    </div>
  );
}