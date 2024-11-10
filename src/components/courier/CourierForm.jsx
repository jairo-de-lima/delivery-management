// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function CourierForm() {
  const [newDeliveryPerson, setNewDeliveryPerson] = useState("");
  const { addDeliveryPerson } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    addDeliveryPerson(newDeliveryPerson);
    setNewDeliveryPerson("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <PlusCircle className="w-6 h-6" />
        Cadastro de Entregadores
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2 justify-center">
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-md"
          value={newDeliveryPerson}
          onChange={(e) => setNewDeliveryPerson(e.target.value)}
          placeholder="Nome do entregador"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
