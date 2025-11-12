"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover";
import { AgendamentoEvent } from "../app/page";

const horariosDisponiveis = Array.from({ length: 28 }, (_, i) => {
    const hora = Math.floor(i / 2) + 8;
    const minuto = i % 2 === 0 ? '00' : '30';
    return `${hora.toString().padStart(2, '0')}:${minuto}`;
});

// 💡 1. ATUALIZADO O SCHEMA
const formSchema = z.object({
  nome_cliente: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  data: z.date({
    required_error: "A data do agendamento é obrigatória.",
  }),
  valor: z.coerce.number().min(0, { message: "O valor deve ser R$ 0 ou mais." }), // 💡 CAMPO ADICIONADO
});

type FormValues = z.infer<typeof formSchema>;

interface AgendamentoFormProps {
  onSuccess: () => void;
  agendamentoInicial?: AgendamentoEvent | null;
}

export function AgendamentoForm({ onSuccess, agendamentoInicial }: AgendamentoFormProps) {
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [erroHora, setErroHora] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!agendamentoInicial;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_cliente: "",
      data: new Date(),
      valor: 0, // 💡 VALOR PADRÃO
    },
  });

  // 💡 2. ATUALIZADO O USEEFFECT
  useEffect(() => {
    if (agendamentoInicial?.start) {
      form.reset({
        nome_cliente: agendamentoInicial.title || "",
        data: agendamentoInicial.start,
        valor: agendamentoInicial.valor || 0, // 💡 CAMPO ADICIONADO
      });
      setHoraSelecionada(format(agendamentoInicial.start, 'HH:mm'));
    } else {
      form.reset({
        nome_cliente: "",
        data: new Date(),
        valor: 0, // 💡 CAMPO ADICIONADO
      });
      setHoraSelecionada(null);
    }
  }, [agendamentoInicial, form]);

  // 💡 3. ATUALIZADO O ONSUBMIT
  async function onSubmit(values: FormValues) {
    if (!horaSelecionada) {
      setErroHora("Selecione um horário.");
      return;
    }
    setErroHora(null);
    setIsSubmitting(true);

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
          valor: values.valor, // 💡 CAMPO ADICIONADO
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          const { message } = await response.json();
          toast.error(message || "Este horário já está agendado.");
        } else {
          throw new Error('Falha ao salvar agendamento');
        }
        return; 
      }
      
      toast.success(`Agendamento para ${values.nome_cliente} foi salvo!`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Oops! Algo deu errado ao salvar.");
    } finally {
      setIsSubmitting(false);
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* 💡 4. CAMPO DE VALOR ADICIONADO */}
        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                {/* Wrapper para o prefixo "R$" */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input 
                    type="number" 
                    step="0.01" 
                    className="pl-9" // Adiciona padding para o "R$"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Agendamento</FormLabel>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    // ✅ RESTRIÇÃO DE DATA REMOVIDA
                    initialFocus
                    locale={ptBR}
                    closeButton={
                      <PopoverClose
                        className={cn(
                          buttonVariants({ variant: "outline", size: "icon" }),
                          "h-7 w-7"
                        )}
                      >
                        <X className="h-4 w-4" />
                      </PopoverClose>
                    }
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

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
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar Agendamento')}
        </Button>
      </form>
    </Form>
  );
}