// components/PaymentModal.jsx
import { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone } from 'lucide-react';

export default function PaymentModal({ total, onPay, onClose }) {
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPay(method);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Paiement</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-500">Total a payer</p>
          <p className="text-4xl font-bold text-orange-600">{total.toFixed(2)} €</p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { id: 'card', icon: CreditCard, label: 'Carte bancaire' },
            { id: 'paypal', icon: Wallet, label: 'PayPal' },
            { id: 'mobile', icon: Smartphone, label: 'Mobile Money' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                method === m.id ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
              }`}
            >
              <m.icon className="w-6 h-6" />
              <span className="font-medium">{m.label}</span>
              {method === m.id && <span className="ml-auto text-orange-600">✓</span>}
            </button>
          ))}
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Traitement...
            </span>
          ) : (
            `Payer ${total.toFixed(2)} €`
          )}
        </button>
      </div>
    </div>
  );
}