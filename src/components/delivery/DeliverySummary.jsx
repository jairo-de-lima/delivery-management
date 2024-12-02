import { useState } from "react";
import { CalendarClock, DollarSign, Edit, Trash2, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeliveryForm } from "./DeliveryForm";
import { useToast } from "@/hooks/use-toast";
import { DeliveryAnalytics } from "./DeliveryAnalytics";

export function DeliverySummary({ onSuccess }) {
  const { deliveries, deliveryPeople, deleteDelivery } = useApp();
  const [error] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false);
  const [selectedQuinzena, setSelectedQuinzena] = useState("first"); // Estado para a quinzena selecionada
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [deliveryToDelete, setDeliveryToDelete] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isCardOpen, setIsCardOpen] = useState(false);

  const handleToggleCard = () => {
    setIsCardOpen(!isCardOpen);
  };
  const handleCloseCard = () => {
    setIsCardOpen(false);
  };

  const handleDeleteDelivery = (delivery) => {
    setDeliveryToDelete(delivery);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteDelivery = async () => {
    if (deliveryToDelete) {
      try {
        await deleteDelivery(deliveryToDelete);
        onSuccess?.();
        setIsConfirmDialogOpen(false);
        setDeliveryToDelete(null);
        toast({
          title: "Sucesso",
          description: "Entrega excluída com sucesso.",
          duration: 2000,
        });
      } catch {
        toast({
          title: "Erro",
          description: "Erro ao excluir entrega.",
          duration: 2000,
        });
      }
    }
  };
  const handleOpenEdit = (delivery) => {
    setCurrentDelivery(delivery);
    setIsEditDialogOpen(true);
  };

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setIsDeliveryDetailsOpen(true);
  };

  // Função para calcular o intervalo da quinzena baseado no mês
  const getQuinzenaRange = (quinzena) => {
    const startMonth = selectedMonth;
    const startYear = selectedYear;
    const lastDayOfMonth = new Date(startYear, startMonth + 1, 0).getDate();

    if (quinzena === "first") {
      // Primeira quinzena: do dia 1 ao dia 15
      const start = new Date(startYear, startMonth, 0);
      const end = new Date(startYear, startMonth, 15);
      return { start, end };
    } else {
      // Segunda quinzena: do dia 16 ao último dia do mês
      const start = new Date(startYear, startMonth, 16);
      const end = new Date(startYear, startMonth, lastDayOfMonth);
      return { start, end };
    }
  };
  const { start, end } = getQuinzenaRange(selectedQuinzena);
  const getPersonDeliveries = (personId) => {
    return deliveries.filter((delivery) => {
      const deliveryDate = new Date(delivery.date);
      return (
        delivery.deliveryPersonId === personId &&
        deliveryDate >= start &&
        deliveryDate <= end
      );
    });
  };

  const calculateTotalEarnings = (personDeliveries) => {
    return personDeliveries.reduce(
      (total, delivery) => total + delivery.totalValue,
      0
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Resumo de Entregas
        </h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleToggleCard}>
            <CalendarClock className="w-5 h-5" />
          </Button>
          {isCardOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <Card className="w-[90%] max-w-sm bg-white shadow-lg rounded-lg p-6">
                <CardTitle className="text-lg font-semibold text-center mb-4">
                  Selecione a Quinzena
                </CardTitle>

                <CardContent className="flex flex-col gap-2 w-full p-2 rounded-md mb-4">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="border p-2 rounded"
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index} value={index}>
                        {new Date(0, index).toLocaleString("pt-BR", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  {/* Seletor de ano */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="border p-2 rounded"
                  >
                    {Array.from({ length: 10 }, (_, index) => {
                      const year = new Date().getFullYear() - index;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    id="quinzena"
                    value={selectedQuinzena}
                    onChange={(e) => setSelectedQuinzena(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="first">1ª Quinzena</option>
                    <option value="second">2ª Quinzena</option>
                  </select>
                </CardContent>
                <CardFooter className="flex w-full justify-end">
                  <Button variant="outline" onClick={handleCloseCard}>
                    fechar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          <DeliveryAnalytics />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Entregadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {deliveryPeople
          .filter((person) => getPersonDeliveries(person.id).length > 0)
          .map((person) => {
            const personDeliveries = getPersonDeliveries(person.id);
            const totalEarnings = calculateTotalEarnings(personDeliveries);

            return (
              <div
                key={person.id}
                onClick={() => handlePersonSelect(person)}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-lg uppercase">{person.name}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Total de entregas: {personDeliveries.length}
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  Total ganhos: R$ {totalEarnings.toFixed(2)}
                </p>
              </div>
            );
          })}
      </div>

      {/* modal de edicao */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[90%] rounded-sm">
          <DialogHeader>
            <DialogTitle>Editar Entrega</DialogTitle>
          </DialogHeader>
          <DeliveryForm
            onSuccess={() => setIsEditDialogOpen(false)}
            initialData={currentDelivery}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes das Entregas */}
      <Dialog
        open={isDeliveryDetailsOpen}
        onOpenChange={setIsDeliveryDetailsOpen}
      >
        <DialogContent className="max-w-3xl w-[90%] rounded-sm">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Entregas de {selectedPerson?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4 max-h-[60vh] overflow-y-auto">
            {selectedPerson &&
              getPersonDeliveries(selectedPerson.id).map((delivery) => (
                <div key={delivery.id} className="p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-semibold">
                          Data:{" "}
                          {new Date(delivery.date).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                          })}
                        </p>
                        <p>Quantidade de Pacotes: {delivery.packages}</p>
                        {delivery.additionalValue > 0 && (
                          <p>
                            Valor Adicional: R${" "}
                            {delivery.additionalValue.toFixed(2)}
                          </p>
                        )}
                        <p className="font-semibold">
                          Total: R$ {delivery.totalValue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(delivery)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDelivery(delivery.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            <Dialog
              open={isConfirmDialogOpen}
              onOpenChange={setIsConfirmDialogOpen}
            >
              <DialogContent className="w-[90%] rounded-sm">
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                </DialogHeader>
                <p>Tem certeza de que deseja excluir este entregador?</p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteDelivery}>
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {selectedPerson &&
              getPersonDeliveries(selectedPerson.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma entrega registrada para este entregador
                </div>
              )}
          </div>

          {selectedPerson &&
            getPersonDeliveries(selectedPerson.id).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-lg font-bold text-right">
                  Total: R${" "}
                  {calculateTotalEarnings(
                    getPersonDeliveries(selectedPerson.id)
                  ).toFixed(2)}
                </p>
              </div>
            )}
        </DialogContent>
      </Dialog>

      {deliveryPeople.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum entregador cadastrado
        </div>
      )}
    </div>
  );
}
