import React, { useState, useEffect } from "react";
import { Package, Settings } from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  // Novos estados para gerenciamento de entregadores
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (initialData && isEditing) {
      setSelectedDeliveryPerson(initialData.deliveryPersonId);
      setPackageCount(initialData.packages.toString());
      setAdditionalValue(
        initialData.additionalValue
          ? initialData.additionalValue.toString()
          : ""
      );
      setSelectedDate(initialData.date);
    }
  }, [initialData, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifica se um entregador está selecionado e se há contagem de pacotes
    if (!selectedDeliveryPerson) {
      alert("Por favor, selecione um entregador antes de enviar.");
      return // Não continua o envio se nenhum entregador estiver selecionado
    }

    if (!packageCount) {
      alert("Por favor, insira a quantidade de pacotes.");
      return; // Não continua o envio se não houver contagem de pacotes
    }

    const deliveryData = {
      deliveryPersonId: selectedDeliveryPerson,
      packages: parseInt(packageCount),
      additionalValue: additionalValue ? parseFloat(additionalValue) : 0,
      date: selectedDate,
    };

    if (isEditing && initialData) {
      updateDelivery(initialData.id, deliveryData);
    } else {
      addDelivery(deliveryData);
    }

    // Limpa os campos após o envio
    setPackageCount("");
    setAdditionalValue("");
    onSuccess?.();
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
      } catch (err) {
        console.error("Erro ao atualizar entregador:", err);
      }
    }
  };

  const handleDeletePerson = async (person) => {
    if (window.confirm("Tem certeza que deseja excluir este entregador?")) {
      try {
        await deleteDeliveryPerson(person.id); // Altere para usar person.id
        onSuccess?.(); // Chame onSuccess para atualizar a interface, se necessário
      } catch (err) {
        console.error("Erro ao excluir entregador:", err);
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
