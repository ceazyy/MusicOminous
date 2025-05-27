import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CheckoutData {
  album: {
    id: number;
    title: string;
    price: string;
    coverImage: string;
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get checkout data from location state
  const checkoutData = location.state?.checkoutData as CheckoutData;

  if (!checkoutData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Checkout Session</h1>
          <p className="mb-4">Please return to the album page and try again.</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // TODO: Integrate with Cashfree here
      const response = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: checkoutData.album.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // TODO: Handle Cashfree payment flow
      // This is where you'll integrate with Cashfree's payment flow
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={checkoutData.album.coverImage}
              alt={checkoutData.album.title}
              className="w-24 h-24 object-cover rounded"
            />
            <div>
              <h2 className="text-xl font-semibold">{checkoutData.album.title}</h2>
              <p className="text-gray-600">Digital Album</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Price</span>
              <span>${checkoutData.album.price}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${checkoutData.album.price}</span>
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Your payment will be processed securely
        </p>
      </div>
    </div>
  );
}