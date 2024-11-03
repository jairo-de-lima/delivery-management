import React, { useState } from "react";
import { DollarSign, Edit, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeliveryForm } from "./DeliveryForm";

export function DeliverySummary() {
  const { deliveries, deliveryPeople, deleteDelivery } = useApp();
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);

  const handleDelete = async (deliveryId) => {
    if (window.confirm("Tem certeza que deseja excluir esta entrega?")) {
      try {
        await deleteDelivery(deliveryId);
      } catch (err) {
        setError("Erro ao excluir entrega");
        console.error(err);
      }
    }
  };

  const handleOpenEdit = (delivery) => {
    setCurrentDelivery(delivery);
    setIsEditDialogOpen(true);
  };

  const getDeliveryPersonName = (id) => {
    const person = deliveryPeople.find((p) => p.id === id);
    return person ? person.name : "Não especificado";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Resumo de Entregas
        </h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

      <div className="grid gap-4">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-bold">
                    Entregador: {" "} <span className="font-bold uppercase"> {getDeliveryPersonName(delivery.deliveryPersonId)} </span>
                    
                  </p>
                  <p className="font-semibold">
                    Data:{" "}
                    {new Date(delivery.date).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}
                  </p>
                  <p>Quantidade de Pacotes: {delivery.packages}</p>
                  {delivery.additionalValue > 0 && (
                    <p>
                      Valor Adicional: R$ {delivery.additionalValue.toFixed(2)}
                    </p>
                  )}

                  <p>Total: R$ {delivery.totalValue.toFixed(2)} </p>
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
                  onClick={() => handleDelete(delivery.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {deliveries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma entrega registrada
          </div>
        )}
      </div>
    </div>
  );
}
