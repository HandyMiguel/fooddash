// components/ReferralModal.jsx
import { useState } from 'react';
import { Copy, Share2, Gift } from 'lucide-react';

export default function ReferralModal({ code, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'FoodDash',
        text: `Utilise mon code ${code} pour avoir -5€ sur FoodDash!`,
        url: window.location.origin
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <Gift className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Parrainez vos amis!</h2>
        <p className="text-gray-600 mb-6">
          Gagnez 5€ pour chaque ami qui commande avec votre code
        </p>

        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">Votre code</p>
          <p className="text-3xl font-bold text-orange-600 tracking-widest">{code}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyCode}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copie!' : 'Copier'}
          </button>
          <button
            onClick={shareCode}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl hover:bg-gray-200"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>
    </div>
  );
}