// src/app/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image"; // 1. IMPORTAMOS O COMPONENTE DE IMAGEM
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

interface ApiAgendamento {
  id: number;
  nome_cliente: string;
  data_hora: string;
}
export interface AgendamentoEvent {
  title: string | undefined;
  start: Date | undefined;
  end: Date | undefined;
  resource: number; 
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

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    agendamentosHoje: 0,
    proximoCliente: null,
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

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
  };

  const handleOpenNewModal = () => {
    setAgendamentoParaEditar(null);
    setModalAberto(true);
  };
  
  const handleOpenEditModal = (agendamento: AgendamentoEvent) => {
    setAgendamentoParaEditar(agendamento);
    setModalAberto(true);
  };

  return (
    <main className="min-h-screen w-full bg-secondary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          
          {/* 2. SUBSTITUÍMOS O H1 PELA IMAGEM */}
          <Image
            src="/logobarber.png" // O caminho para a imagem na pasta public
            alt="Logo da Barbearia"
            width={250} // Ajuste a largura conforme necessário
            height={70} // Ajuste a altura conforme necessário
            priority // Ajuda a carregar a imagem principal mais rápido
          />

          <Button onClick={handleOpenNewModal} className="w-full sm:w-auto text-lg">
            Novo Agendamento
          </Button>
        </div>

        <Accordion type="single" collapsible className="w-full bg-card rounded-xl border shadow-sm px-6 mb-6">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold">
              Resumo do Dia
            </AccordionTrigger>
            <AccordionContent>
              <Dashboard data={dashboardData} loading={loadingDashboard} />
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
              onDeleteSuccess={() => {
                buscarTodosAgendamentos();
                buscarDadosDashboard();
              }}
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