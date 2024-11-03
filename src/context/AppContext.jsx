import React, { createContext, useContext, useState, useEffect } from 'react';
import { courierServices, deliveryServices } from '../services/database';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [deliveryPeople, setDeliveryPeople] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [loadedCouriers, loadedDeliveries] = await Promise.all([
        courierServices.getAll(),
        deliveryServices.getAll()
      ]);
      setDeliveryPeople(loadedCouriers);
      setDeliveries(loadedDeliveries);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDeliveryPerson = async (name) => {
    try {
      if (name.trim()) {
        const newCourier = {
          name: name.trim(),
          createdAt: new Date().toISOString()
        };
        const savedCourier = await courierServices.add(newCourier);
        setDeliveryPeople(prev => [...prev, savedCourier]);
        return savedCourier;
      }
    } catch (err) {
      setError('Erro ao adicionar entregador: ' + err.message);
      throw err;
    }
  };

    
  const updateDeliveryPerson = async (deliveryPersonId, updatedName) => {
    try {
        const updatedCourier = await courierServices.update(deliveryPersonId, { name: updatedName });
        setDeliveryPeople(prev => prev.map(courier => courier.id === deliveryPersonId ? 
            updatedCourier : courier));
    } catch (err) {
        setError('Erro ao atualizar entregador: ' + err.message);
        throw err;
    }
};

  const deleteDeliveryPerson = async (deliveryPersonId) => {
    try {
      // Verifica se o entregador existe antes de tentar excluir
      const courierIndex = deliveryPeople.findIndex(courier => courier.id === deliveryPersonId);
      if (courierIndex !== -1) {
        await courierServices.remove(deliveryPersonId);
        setDeliveryPeople(prev => prev.filter(courier => courier.id !== deliveryPersonId));
      }
    } catch (err) {
      setError('Erro ao excluir entregador: ' + err.message);
    }
  };


  const addDelivery = async (delivery) => {
    try {
      const newDelivery = {
        ...delivery,
        createdAt: new Date().toISOString(),
        totalValue: (delivery.packages * 7.5) + (delivery.additionalValue || 0)
      };
      
      const savedDelivery = await deliveryServices.add(newDelivery);
      setDeliveries(prev => [...prev, savedDelivery]);
      return savedDelivery;
    } catch (err) {
      setError('Erro ao adicionar entrega: ' + err.message);
      throw err;
    }
  };

  // Nova função para atualizar entrega
  const updateDelivery = async (deliveryId, updatedData) => {
    try {
      // Calcular o novo valor total baseado nos dados atualizados
      const totalValue = (updatedData.packages * 7.5) + (updatedData.additionalValue || 0);
      
      const deliveryToUpdate = {
        ...updatedData,
        totalValue,
        updatedAt: new Date().toISOString()
      };

      const updatedDelivery = await deliveryServices.update(deliveryId, deliveryToUpdate);
      
      setDeliveries(prev => 
        prev.map(delivery => 
          delivery.id === deliveryId ? updatedDelivery : delivery
        )
      );

      return updatedDelivery;
    } catch (err) {
      setError('Erro ao atualizar entrega: ' + err.message);
      throw err;
    }
  };

  // Nova função para deletar entrega
  const deleteDelivery = async (deliveryId) => {
    try {
      await deliveryServices.remove(deliveryId);
      setDeliveries(prev => prev.filter(delivery => delivery.id !== deliveryId));
    } catch (err) {
      setError('Erro ao excluir entrega: ' + err.message);
      throw err;
    }
  };
  
  

  const calculateBiweeklyTotal = (deliveryPersonId) => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.setDate(now.getDate() - 15));
    
    return deliveries
      .filter(d => 
        d.deliveryPersonId === deliveryPersonId && 
        new Date(d.date) >= twoWeeksAgo
      )
      .reduce((acc, curr) => ({
        packages: acc.packages + curr.packages,
        value: acc.value + curr.totalValue
      }), { packages: 0, value: 0 });
  };

  return (
    <AppContext.Provider value={{
      deliveryPeople,
      deliveries,
      addDeliveryPerson,
      updateDeliveryPerson,
      deleteDeliveryPerson,
      addDelivery,
      updateDelivery, // Nova função exportada
      deleteDelivery, // Nova função exportada
      calculateBiweeklyTotal,
      loading,
      error,
      refreshData: loadInitialData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);