// eslint-disable-next-line no-unused-vars
import React, { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import {
  format,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useApp } from "../../context/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DeliveryAnalytics() {
  const { deliveries, deliveryPeople, loading } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("all");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const handleDateSelect = (date) => {
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      setDateRange({ from: date, to: undefined });
    } else {
      const newRange = {
        from: isBefore(date, dateRange.from) ? date : dateRange.from,
        to: isBefore(date, dateRange.from) ? dateRange.from : date,
      };
      setDateRange(newRange);
      setIsCalendarOpen(false);
    }
  };

  const isDateInRange = (date) => {
    if (!dateRange.from || !dateRange.to) return false;
    return isWithinInterval(date, { start: dateRange.from, end: dateRange.to });
  };

  const getDayStyle = (date) => {
    if (!dateRange.from || !dateRange.to) {
      return isEqual(date, dateRange.from) ? "selected-single" : "";
    }

    if (isEqual(date, dateRange.from)) return "selected-start";
    if (isEqual(date, dateRange.to)) return "selected-end";
    if (isDateInRange(date)) return "selected-middle";
    return "";
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const deliveryDate = parseISO(delivery.date);
      const isInDateRange =
        (isEqual(deliveryDate, dateRange.from) ||
          isAfter(deliveryDate, dateRange.from)) &&
        (isEqual(deliveryDate, dateRange.to) ||
          isBefore(deliveryDate, dateRange.to));

      if (selectedPerson === "all") {
        return isInDateRange;
      }
      // Corrigido para usar deliveryPersonId em vez de courierId
      return isInDateRange && delivery.deliveryPersonId === selectedPerson;
    });
  }, [deliveries, selectedPerson, dateRange]);

  const analytics = useMemo(() => {
    const results = filteredDeliveries.reduce(
      (acc, delivery) => ({
        totalDeliveries: acc.totalDeliveries + 1,
        totalValue: acc.totalValue + (parseFloat(delivery.totalValue) || 0),
        totalAdditional:
          acc.totalAdditional + (parseFloat(delivery.additionalValue) || 0),
        deliveriesByDate: {
          ...acc.deliveriesByDate,
          [format(parseISO(delivery.date), "dd/MM/yyyy")]: [
            ...(acc.deliveriesByDate[
              format(parseISO(delivery.date), "dd/MM/yyyy")
            ] || []),
            delivery,
          ],
        },
      }),
      {
        totalDeliveries: 0,
        totalValue: 0,
        totalAdditional: 0,
        deliveriesByDate: {},
      }
    );

    return results;
  }, [filteredDeliveries]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Carregando dados...
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Análise de Entregas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Análise de Entregas por Período</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um entregador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os entregadores</SelectItem>
                  {deliveryPeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="single"
                    selected={dateRange.from}
                    onSelect={handleDateSelect}
                    locale={ptBR}
                    disabled={(date) =>
                      dateRange.from &&
                      !dateRange.to &&
                      isEqual(date, dateRange.from)
                    }
                    classNames={{
                      months: "space-y-5",
                      month: "space-y-5",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button:
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full",
                      head_cell:
                        "text-slate-500 rounded-md w-8 font-normal text-[0.8rem] dark:text-slate-400",
                      row: "flex w-full mt-2",
                      cell: `relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md dark:[&:has([aria-selected])]:bg-slate-800`,
                      day: `h-8 w-8 p-1 m-1 font-normal aria-selected:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 
              [&.selected-single]:bg-blue-500 [&.selected-single]:text-white [&.selected-single]:rounded-md
              [&.selected-start]:bg-blue-500 [&.selected-start]:text-white [&.selected-start]:rounded-l-md [&.selected-start]:rounded-r-none
              [&.selected-middle]:bg-blue-500 [&.selected-middle]:text-white [&.selected-middle]:rounded-none
              [&.selected-end]:bg-blue-500 [&.selected-end]:text-white [&.selected-end]:rounded-r-md [&.selected-end]:rounded-l-none`,
                      day_selected: "",
                      day_today: "bg-slate-100 dark:bg-slate-800 rounded-md",
                      day_outside: "opacity-50",
                      day_disabled: "opacity-50",
                      day_range_middle: "",
                      day_hidden: "invisible",
                    }}
                    components={{
                      // eslint-disable-next-line react/jsx-no-undef
                      IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                      // eslint-disable-next-line react/jsx-no-undef
                      IconRight: () => <ChevronRight className="h-4 w-4" />,
                    }}
                    modifiers={{
                      selected: (date) => getDayStyle(date) !== "",
                    }}
                  />
                  <div className="p-2 border-t">
                    {!dateRange.from && "Selecione a data inicial"}
                    {dateRange.from &&
                      !dateRange.to &&
                      "Selecione a data final"}
                    {dateRange.from && dateRange.to && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setDateRange({ from: undefined, to: undefined });
                        }}
                      >
                        Limpar seleção
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Entregas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalDeliveries}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {analytics.totalValue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Adicional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {analytics.totalAdditional.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhamento por data */}
          {selectedPerson !== "all" &&
            Object.keys(analytics.deliveriesByDate).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento por Data</CardTitle>
                  <CardDescription>
                    Entregas realizadas no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.deliveriesByDate)
                      .sort(([dateA], [dateB]) => {
                        const [dayA, monthA, yearA] = dateA
                          .split("/")
                          .map(Number);
                        const [dayB, monthB, yearB] = dateB
                          .split("/")
                          .map(Number);
                        return (
                          new Date(yearB, monthB - 1, dayB) -
                          new Date(yearA, monthA - 1, dayA)
                        );
                      })
                      .map(([date, deliveries]) => (
                        <div key={date} className="border-b pb-4">
                          <h4 className="font-semibold mb-2">{date}</h4>
                          <div className="space-y-2">
                            {deliveries.map((delivery) => (
                              <div
                                key={delivery.id}
                                className="grid grid-cols-3 text-sm"
                              >
                                <span>Pacotes: {delivery.packages}</span>
                                <span>
                                  Adicional: R${" "}
                                  {(
                                    parseFloat(delivery.additionalValue) || 0
                                  ).toFixed(2)}
                                </span>
                                <span className="font-medium">
                                  Total: R${" "}
                                  {(
                                    parseFloat(delivery.totalValue) || 0
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {selectedPerson !== "all" &&
            Object.keys(analytics.deliveriesByDate).length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Nenhuma entrega encontrada no período selecionado
                </CardContent>
              </Card>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
