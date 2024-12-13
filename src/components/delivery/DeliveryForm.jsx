// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Package, Settings } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// eslint-disable-next-line react/prop-types
export function DeliveryForm({ onSuccess, initialData, isEditing }) {
  const {
    deliveryPeople,
    addDelivery,
    updateDelivery,
    updateDeliveryPerson,
    deleteDeliveryPerson,
  } = useApp();
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  const [packageCount, setPackageCount] = useState("");
  const [additionalValue, setAdditionalValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState(null); // Novo estado para o entregador a ser excluído
  const [editingPerson, setEditingPerson] = useState(null);
  const [editedName, setEditedName] = useState("");
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(); // Estado para o campo de status de pagamento

  useEffect(() => {
    if (initialData && isEditing) {
      // eslint-disable-next-line react/prop-types
      setSelectedDeliveryPerson(initialData.deliveryPersonId);
      // eslint-disable-next-line react/prop-types
      setPackageCount(initialData.packages.toString());
      setAdditionalValue(
        // eslint-disable-next-line react/prop-types
        initialData.additionalValue
          ? // eslint-disable-next-line react/prop-types
            initialData.additionalValue.toString()
          : ""
      );
      // eslint-disable-next-line react/prop-types
      setSelectedDate(initialData.date);
      setIsPaid(initialData.paid || false); // Carrega o status de pagamento
    }
  }, [initialData, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDeliveryPerson) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um entregador antes de enviar.",
        duration: 2000,
      });
      return;
    }

    if (!packageCount) {
      toast({
        title: "Erro",
        description: "Por favor, insira a quantidade de pacotes.",
        duration: 2000,
      });
      return;
    }

    const deliveryData = {
      deliveryPersonId: selectedDeliveryPerson,
      packages: parseInt(packageCount),
      additionalValue: additionalValue ? parseFloat(additionalValue) : 0,
      date: selectedDate,
      paid: isPaid, // Inclui o status de pagamento
    };

    if (isEditing && initialData) {
      // eslint-disable-next-line react/prop-types
      updateDelivery(initialData.id, deliveryData);
    } else {
      addDelivery(deliveryData);
    }

    setPackageCount("");
    setAdditionalValue("");
    setIsPaid(false); // Reseta o campo de status de pagamento
    onSuccess?.();

    toast({
      title: "Sucesso",
      description: "Entrega registrada com sucesso!",
      duration: 2000,
    });
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setEditedName(person.name);
  };

  const handleSaveEdit = async () => {
    if (editingPerson && editedName.trim()) {
      try {
        await updateDeliveryPerson(editingPerson.id, editedName.trim());
        setEditingPerson(null);
        setEditedName("");
        setIsManageDialogOpen(false);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar entregador",
          duration: 2000,
        });
      }
    }
  };

  const handleDeletePerson = (person) => {
    setPersonToDelete(person); // Define o entregador a ser excluído
    setIsConfirmDialogOpen(true); // Abre o dialog de confirmação
  };

  const confirmDeletePerson = async () => {
    if (personToDelete) {
      try {
        await deleteDeliveryPerson(personToDelete.id);
        onSuccess?.();
        setIsConfirmDialogOpen(false);
        setPersonToDelete(null); // Limpa o estado
        toast({
          title: "Sucesso",
          description: "Entregador excluído com sucesso.",
          duration: 2000,
        });
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast({
          title: "Erro",
          description: "Erro ao excluir entregador.",
          duration: 2000,
        });
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6" />
          {isEditing ? "Editar Entrega" : "Registro de Entregas"}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsManageDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Dialog de Gerenciamento de Entregadores */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Entregadores</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {deliveryPeople.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
              >
                {editingPerson?.id === person.id ? (
                  <>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveEdit}>
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPerson(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{person.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPerson(person)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePerson(person)}
                    >
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
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
            <Button variant="destructive" onClick={confirmDeletePerson}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {deliveryPeople.map((person) => (
            <button
              type="button"
              key={person.id}
              onClick={() => setSelectedDeliveryPerson(person.id)}
              className={`px-3 py-1 rounded-md ${
                selectedDeliveryPerson === person.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {person.name}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          <input
            type="date"
            className="px-3 py-2 border rounded-md"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <input
            type="number"
            className="px-3 py-2 border rounded-md"
            value={packageCount}
            onChange={(e) => setPackageCount(e.target.value)}
            placeholder="Quantidade de pacotes"
          />
          <input
            type="number"
            className="px-3 py-2 border rounded-md"
            value={additionalValue}
            onChange={(e) => setAdditionalValue(e.target.value)}
            placeholder="Valor adicional (opcional)"
            step="0.01"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="paid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
            <label htmlFor="paid">Entrega paga</label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          {isEditing ? "Salvar Alterações" : "Registrar Entrega"}
        </button>
      </form>
    </div>
  );
}
