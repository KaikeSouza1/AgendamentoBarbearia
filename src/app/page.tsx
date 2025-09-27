// src/app/page.tsx

"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { SeletorDataAgenda } from "@/components/SeletorDataAgenda";
import ListaAgendamentosDia from "@/components/ListaAgendamentosDia";
import { AgendamentoForm } from "@/components/AgendamentoForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Interface para os nossos eventos de agendamento
export interface AgendamentoEvent {
  title: string | undefined;
  start: Date | undefined;
  end: Date | undefined;
  resource: any;
}

export default function Home() {
  const [modalAberto, setModalAberto] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<AgendamentoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<AgendamentoEvent | null>(null);

  const buscarTodosAgendamentos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agendamentos');
      const data = await response.json();
      const eventosFormatados: AgendamentoEvent[] = data.map((ag: any) => ({
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
  }, [buscarTodosAgendamentos]);

  const handleSuccess = () => {
    setModalAberto(false);
    setAgendamentoParaEditar(null);
    buscarTodosAgendamentos();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Agendamento Emeze Barbearia
          </h1>
          <Button onClick={handleOpenNewModal} className="w-full sm:w-auto text-lg">
            Novo Agendamento
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SeletorDataAgenda 
              dataSelecionada={dataSelecionada} 
              onDataChange={setDataSelecionada} 
            />
          </div>
          <div className="lg:col-span-2">
            <ListaAgendamentosDia 
              dataSelecionada={dataSelecionada} 
              agendamentos={agendamentos}
              onDataChange={setDataSelecionada}
              loading={loading}
              onEdit={handleOpenEditModal}
              onDeleteSuccess={buscarTodosAgendamentos}
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