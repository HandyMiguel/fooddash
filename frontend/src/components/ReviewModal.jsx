// components/ReviewModal.jsx
import { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function ReviewModal({ commandeId, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Votre avis</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                className={`w-10 h-10 transition ${
                  star <= (hover || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre experience..."
          rows="4"
          className="w-full border rounded-xl p-3 mb-4"
        />

        <button
          onClick={() => onSubmit({ rating, comment })}
          disabled={!rating}
          className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 hover:bg-orange-700"
        >
          Envoyer mon avis
        </button>
      </div>
    </div>
  );
}