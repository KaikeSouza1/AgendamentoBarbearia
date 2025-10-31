// src/app/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image"; 
import Dashboard from "@/components/Dashboard";
import { SeletorDataAgenda } from "@/components/SeletorDataAgenda";
import ListaAgendamentosDia from "@/components/ListaAgendamentosDia";
import { AgendamentoForm } from "@/components/AgendamentoForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FaturamentoDashboard from "@/components/FaturamentoDashboard"; // 💡 1. IMPORTAR NOVO DASHBOARD

// 💡 2. ATUALIZAR INTERFACES
interface ApiAgendamento {
  id: number;
  nome_cliente: string;
  data_hora: string;
  valor: number; // Prisma Decimal será serializado como string ou number
}
export interface AgendamentoEvent {
  title: string | undefined;
  start: Date | undefined;
  end: Date | undefined;
  resource: number; 
  valor: number; // 💡 ADICIONADO
}
interface DashboardData {
  agendamentosHoje: number;
  proximoCliente: {
    nome: string;
    horario: Date;
  } | null;
}

export default function Home() {
  const [modalAberto, setModalAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<AgendamentoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<AgendamentoEvent | null>(null);
  
  // State para recarregar o dashboard financeiro
  const [faturamentoKey, setFaturamentoKey] = useState(Date.now());

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    agendamentosHoje: 0,
    proximoCliente: null,
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // 💡 3. ATUALIZAR CALLBACKS
  const buscarDadosDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const buscarTodosAgendamentos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agendamentos');
      const data: ApiAgendamento[] = await response.json();
      const eventosFormatados: AgendamentoEvent[] = data.map((ag: ApiAgendamento) => ({
        title: ag.nome_cliente,
        start: new Date(ag.data_hora),
        end: new Date(new Date(ag.data_hora).getTime() + 60 * 60 * 1000),
        resource: ag.id,
        valor: Number(ag.valor), // 💡 CAMPO ADICIONADO (Number() converte Decimal/string)
      }));
      setAgendamentos(eventosFormatados);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarTodosAgendamentos();
    buscarDadosDashboard();
  }, [buscarTodosAgendamentos, buscarDadosDashboard]);

  const handleSuccess = () => {
    setModalAberto(false);
    setAgendamentoParaEditar(null);
    buscarTodosAgendamentos();
    buscarDadosDashboard();
    // 💡 4. ATUALIZAR O DASHBOARD FINANCEIRO
    // Mudando a key do componente, forçamos ele a remontar e buscar dados frescos
    setFaturamentoKey(Date.now()); 
  };

  const handleOpenNewModal = () => {
    setAgendamentoParaEditar(null);
    setModalAberto(true);
  };
  
  const handleOpenEditModal = (agendamento: AgendamentoEvent) => {
    setAgendamentoParaEditar(agendamento);
    setModalAberto(true);
  };

  const onDeleteSuccess = () => {
    buscarTodosAgendamentos();
    buscarDadosDashboard();
    setFaturamentoKey(Date.now()); // Atualiza o financeiro ao deletar também
  };

  return (
    <main className="min-h-screen w-full bg-secondary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          
          <Image
            src="/logobarber.png" 
            alt="Logo da Barbearia"
            width={250} 
            height={70} 
            priority 
          />

          <Button onClick={handleOpenNewModal} className="w-full sm:w-auto text-lg">
            Novo Agendamento
          </Button>
        </div>

        {/* 💡 5. ADICIONADO O NOVO ACCORDION DE FATURAMENTO */}
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full bg-card rounded-xl border shadow-sm px-6 mb-6">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold">
              Resumo do Dia
            </AccordionTrigger>
            <AccordionContent>
              <Dashboard data={dashboardData} loading={loadingDashboard} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-b-0">
            <AccordionTrigger className="text-lg font-semibold">
              Dashboard Financeiro
            </AccordionTrigger>
            <AccordionContent>
              {/* Passamos a key para forçar o recarregamento */}
              <FaturamentoDashboard reloadKey={faturamentoKey} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SeletorDataAgenda 
              dataSelecionada={dataSelecionada} 
              onDataChange={(date) => date && setDataSelecionada(date)} 
            />
          </div>
          <div className="lg:col-span-2">
            <ListaAgendamentosDia 
              dataSelecionada={dataSelecionada} 
              agendamentos={agendamentos}
              onDataChange={setDataSelecionada}
              loading={loading}
              onEdit={handleOpenEditModal}
              onDeleteSuccess={onDeleteSuccess} // 💡 Passando a função atualizada
            />
          </div>
        </div>
      </div>

      <Dialog open={modalAberto} onOpenChange={(isOpen: boolean) => {
        if (!isOpen) setAgendamentoParaEditar(null);
        setModalAberto(isOpen);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{agendamentoParaEditar ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          </DialogHeader>
          <AgendamentoForm 
            onSuccess={handleSuccess} 
            agendamentoInicial={agendamentoParaEditar}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}