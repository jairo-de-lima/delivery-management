// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { DollarSign, Edit, Trash2, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeliveryForm } from "./DeliveryForm";
import { useToast } from "@/hooks/use-toast";
import { DeliveryAnalytics } from "./DeliveryAnalytics";

// eslint-disable-next-line react/prop-types
export function DeliverySummary({ onSuccess }) {
  const { deliveries, deliveryPeople, deleteDelivery } = useApp();
  const [error] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isDeliveryDetailsOpen, setIsDeliveryDetailsOpen] = useState(false);

  const [deliveryToDelete, setDeliveryToDelete] = useState(null); // Novo estado para o entregador a ser excluído
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteDelivery = (delivery) => {
    setDeliveryToDelete(delivery); // Define o entregador a ser excluído
    setIsConfirmDialogOpen(true); // Abre o dialog de confirmação
    console.log(delivery);
  };
  const confirmDeleteDelivery = async () => {
    if (deliveryToDelete) {
      try {
        await deleteDelivery(deliveryToDelete); // Passa o ID correto
        onSuccess?.();
        setIsConfirmDialogOpen(false);
        setDeliveryToDelete(null); // Limpa o estado corretamente
        toast({
          title: "Sucesso",
          description: "Entrega excluída com sucesso.",
          duration: 2000,
        });
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir entrega.",
          duration: 2000,
        });
      }
    }
  };

  // const handleDelete = async (deliveryId) => {
  //   if (window.confirm("Tem certeza que deseja excluir esta entrega?")) {
  //     try {
  //       await deleteDelivery(deliveryId);
  //     } catch (err) {
  //       setError("Erro ao excluir entrega");
  //       console.error(err);
  //     }
  //   }
  // };

  const handleOpenEdit = (delivery) => {
    setCurrentDelivery(delivery);
    setIsEditDialogOpen(true);
  };

  const handlePersonSelect = (person) => {
    setSelectedPerson(person);
    setIsDeliveryDetailsOpen(true);
  };

  const getPersonDeliveries = (personId) => {
    return deliveries.filter(
      (delivery) => delivery.deliveryPersonId === personId
    );
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
        <DeliveryAnalytics />
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

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
        <DialogContent className="max-w-3xl">
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
              <DialogContent>
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
