// src/components/AgendamentoForm.tsx

"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AgendamentoEvent } from "../app/page";

const horariosDisponiveis = Array.from({ length: 28 }, (_, i) => {
    const hora = Math.floor(i / 2) + 8;
    const minuto = i % 2 === 0 ? '00' : '30';
    return `${hora.toString().padStart(2, '0')}:${minuto}`;
});

const formSchema = z.object({
  nome_cliente: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  data: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface AgendamentoFormProps {
  onSuccess: () => void;
  agendamentoInicial?: AgendamentoEvent | null;
}

export function AgendamentoForm({ onSuccess, agendamentoInicial }: AgendamentoFormProps) {
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [erroHora, setErroHora] = useState<string | null>(null);
  const isEditMode = !!agendamentoInicial;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_cliente: agendamentoInicial?.title || "",
      data: agendamentoInicial?.start || new Date(),
    },
  });

  useEffect(() => {
    if (agendamentoInicial?.start) {
      form.reset({
        nome_cliente: agendamentoInicial.title || "",
        data: agendamentoInicial.start,
      });
      setHoraSelecionada(format(agendamentoInicial.start, 'HH:mm'));
    }
  }, [agendamentoInicial, form]);

  async function onSubmit(values: FormValues) {
    if (!horaSelecionada) {
      setErroHora("Selecione um horário.");
      return;
    }
    setErroHora(null);

    const [horas, minutos] = horaSelecionada.split(':').map(Number);
    const dataHoraFinal = new Date(values.data);
    dataHoraFinal.setHours(horas, minutos, 0, 0);

    const url = isEditMode ? `/api/agendamentos/${agendamentoInicial.resource}` : '/api/agendamentos';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_cliente: values.nome_cliente,
          data_hora: dataHoraFinal.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Falha ao salvar agendamento');
      
      toast.success(`Agendamento para ${values.nome_cliente} foi salvo!`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Oops! Algo deu errado ao salvar.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome_cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* =================================================================== */}
        {/* A ESTRUTURA CORRETA DO SELETOR DE DATA ESTÁ AQUI */}
        {/* =================================================================== */}
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Agendamento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date: Date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* =================================================================== */}

        <div>
          <FormLabel>Horário</FormLabel>
          <div className="grid grid-cols-4 gap-2 pt-2">
            {horariosDisponiveis.map(hora => (
              <Button type="button" variant={horaSelecionada === hora ? "default" : "outline"} key={hora} onClick={() => { setHoraSelecionada(hora); setErroHora(null); }}>
                {hora}
              </Button>
            ))}
          </div>
          {erroHora && <p className="text-sm font-medium text-destructive mt-2">{erroHora}</p>}
        </div>
        <Button type="submit" className="w-full">{isEditMode ? 'Salvar Alterações' : 'Salvar Agendamento'}</Button>
      </form>
    </Form>
  );
}