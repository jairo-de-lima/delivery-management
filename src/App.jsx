import React from 'react';
import { AppProvider } from './context/AppContext';
import { CourierForm } from './components/courier/CourierForm';
import { DeliveryForm } from './components/delivery/DeliveryForm';
import { DeliverySummary } from './components/delivery/DeliverySummary';
import { Loading } from './components/layout/Loading';
import { useApp } from './context/AppContext';
import Footer from './components/footer';
import { Toaster } from "./components/ui/toaster";
import PasswordProtectedPage from './components/PasswordProtectedPage';

function MainContent() {
  const { loading, error } = useApp();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CourierForm />
      <DeliveryForm />
      <DeliverySummary />
    </div>
  );
}

function App() {
  return (
    <PasswordProtectedPage correctPassword="boticario123">
      <AppProvider>
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="max-w-4xl mx-auto p-4">
            <MainContent />
            <Toaster />
          </div>
          <Footer/>
        </div>
      </AppProvider>
    </PasswordProtectedPage>
  );
}

export default App;