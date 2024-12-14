import {
  ref,
  push,
  set,
  get,
  remove,
  update,
  query,
  orderByChild,
} from "firebase/database";
import { db } from "../config/firebase";

// Serviços para Entregadores
export const courierServices = {
  // Adicionar novo entregador
  add: async (courier) => {
    try {
      if (!courier) throw new Error("Dados do entregador são obrigatórios");

      const newCourierRef = push(ref(db, "couriers"));
      await set(newCourierRef, {
        ...courier,
        createdAt: new Date().toISOString(),
      });
      return { id: newCourierRef.key, ...courier };
    } catch (error) {
      console.error("Erro ao adicionar entregador:", error);
      throw error;
    }
  },

  // Buscar todos os entregadores
  getAll: async () => {
    try {
      const couriersRef = ref(db, "couriers");
      const snapshot = await get(couriersRef);

      if (!snapshot.exists()) return [];

      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } catch (error) {
      console.error("Erro ao buscar entregadores:", error);
      throw error;
    }
  },

  // Buscar entregador por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error("ID do entregador é obrigatório");

      const courierRef = ref(db, `couriers/${id}`);
      const snapshot = await get(courierRef);

      if (!snapshot.exists()) {
        throw new Error("Entregador não encontrado");
      }

      return { id, ...snapshot.val() };
    } catch (error) {
      console.error("Erro ao buscar entregador:", error);
      throw error;
    }
  },

  // Atualizar entregador
  update: async (id, updates) => {
    try {
      if (!id || !updates) {
        throw new Error("ID e dados do entregador são obrigatórios");
      }

      const courierRef = ref(db, `couriers/${id}`);
      await update(courierRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      return { id, ...updates };
    } catch (error) {
      console.error("Erro ao atualizar entregador:", error);
      throw error;
    }
  },

  // Remover entregador
  remove: async (id) => {
    try {
      if (!id) throw new Error("ID do entregador é obrigatório");

      const courierRef = ref(db, `couriers/${id}`);
      await remove(courierRef);
      return true;
    } catch (error) {
      console.error("Erro ao remover entregador:", error);
      throw error;
    }
  },
};

// Serviços para Entregas
export const deliveryServices = {
  // Adicionar nova entrega
  add: async (delivery) => {
    try {
      if (!delivery) throw new Error("Dados da entrega são obrigatórios");

      const newDeliveryRef = push(ref(db, "deliveries"));
      await set(newDeliveryRef, {
        ...delivery,
        createdAt: new Date().toISOString(),
        status: delivery.status || "pending",
        paid: delivery.paid ?? false,
      });
      return { id: newDeliveryRef.key, ...delivery };
    } catch (error) {
      console.error("Erro ao adicionar entrega:", error);
      throw error;
    }
  },

  // Buscar todas as entregas
  getAll: async () => {
    try {
      const deliveriesRef = ref(db, "deliveries");
      const snapshot = await get(deliveriesRef);

      if (!snapshot.exists()) return [];

      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } catch (error) {
      console.error("Erro ao buscar entregas:", error);
      throw error;
    }
  },

  // Buscar entrega por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error("ID da entrega é obrigatório");

      const deliveryRef = ref(db, `deliveries/${id}`);
      const snapshot = await get(deliveryRef);

      if (!snapshot.exists()) {
        throw new Error("Entrega não encontrada");
      }

      return { id, ...snapshot.val() };
    } catch (error) {
      console.error("Erro ao buscar entrega:", error);
      throw error;
    }
  },

  // Atualizar entrega
  update: async (id, updates) => {
    try {
      if (!id || !updates) {
        throw new Error("ID e dados da entrega são obrigatórios");
      }

      const deliveryRef = ref(db, `deliveries/${id}`);
      await update(deliveryRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      return { id, ...updates };
    } catch (error) {
      console.error("Erro ao atualizar entrega:", error);
      throw error;
    }
  },

  // Remover entrega
  remove: async (id) => {
    try {
      if (!id) throw new Error("ID da entrega é obrigatório");

      const deliveryRef = ref(db, `deliveries/${id}`);
      await remove(deliveryRef);
      return true;
    } catch (error) {
      console.error("Erro ao remover entrega:", error);
      throw error;
    }
  },

  // Buscar entregas por período
  getByDateRange: async (startDate, endDate) => {
    try {
      if (!startDate || !endDate) {
        throw new Error("Data inicial e final são obrigatórias");
      }

      const deliveriesRef = ref(db, "deliveries");
      const deliveriesQuery = query(deliveriesRef, orderByChild("date"));
      const snapshot = await get(deliveriesQuery);

      if (!snapshot.exists()) return [];

      return Object.entries(snapshot.val())
        .map(([id, data]) => ({
          id,
          ...data,
        }))
        .filter(
          (delivery) => delivery.date >= startDate && delivery.date <= endDate
        );
    } catch (error) {
      console.error("Erro ao buscar entregas por período:", error);
      throw error;
    }
  },
  getPaidDeliveries: async () => {
    try {
      const deliveriesRef = ref(db, "deliveries");
      const paidQuery = query(
        deliveriesRef,
        orderByChild("paid"),
        equalTo(true)
      );
      const snapshot = await get(paidQuery);

      if (!snapshot.exists()) return [];

      return Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } catch (error) {
      console.error("Erro ao buscar entregas pagas:", error);
      throw error;
    }
  },
};
