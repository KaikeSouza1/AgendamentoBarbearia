"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { DollarSign, TrendingUp, CalendarDays } from "lucide-react"; // Ícones bonitos

interface FaturamentoData {
  hoje: number;
  semana: number;
  mes: number;
}

// Função para formatar como moeda (BRL)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// 💡 CORRIGIDO: Adicionado "reloadKey" como prop para forçar a atualização
export default function FaturamentoDashboard({ reloadKey }: { reloadKey: number }) {
  const [data, setData] = useState<FaturamentoData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFaturamento = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/faturamento');
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const result: FaturamentoData = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao carregar dados de faturamento:", error);
      setData({ hoje: 0, semana: 0, mes: 0 }); // Define como 0 em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaturamento();
    // O useEffect agora depende da 'reloadKey'.
    // Quando a 'reloadKey' mudar, o fetchFaturamento() será chamado novamente.
  }, [reloadKey]); // 💡 CORRIGIDO: Adicionada a dependência

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Faturamento Hoje" value={0} icon={DollarSign} loading={true} />
        <StatCard title="Faturamento Semana" value={0} icon={TrendingUp} loading={true} />
        <StatCard title="Faturamento Mês" value={0} icon={CalendarDays} loading={true} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard 
        title="Faturamento Hoje" 
        value={formatCurrency(data?.hoje ?? 0)} 
        icon={DollarSign} 
      />
      <StatCard 
        title="Faturamento Semana" 
        value={formatCurrency(data?.semana ?? 0)} 
        icon={TrendingUp} 
      />
      <StatCard 
        title="Faturamento Mês" 
        value={formatCurrency(data?.mes ?? 0)} 
        icon={CalendarDays} 
      />
    </div>
  );
}