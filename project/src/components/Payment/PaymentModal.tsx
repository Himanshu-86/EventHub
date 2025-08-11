import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Minus, Plus } from 'lucide-react';
import { Event } from '../../store/slices/eventSlice';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSuccess: (ticketData: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  event,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalAmount = event.price * quantity;
  const availableTickets = event.capacity - event.ticketssold;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= Math.min(availableTickets, 10)) {
      setQuantity(newQuantity);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to purchase tickets');
      return;
    }

    try {
      setLoading(true);

      // Initialize Razorpay
      const isRazorpayLoaded = await initializeRazorpay();
      
      if (!isRazorpayLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      console.log('Payment Details:', {
        amount: totalAmount * 100,
        event: event.title,
        user: user.name
      });

      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', // Valid test Razorpay key
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'EventHub',
        description: `Tickets for ${event.title}`,
        handler: (response: any) => {
          console.log('Payment Success:', response);
          // Payment successful
          const ticketData = {
            id: Date.now().toString(),
            eventId: event.id,
            eventTitle: event.title,
            userid: user.id,
            userName: user.name,
            userEmail: user.email,
            quantity,
            totalAmount,
            purchaseDate: new Date().toISOString(),
            status: 'confirmed' as const,
            ticketCode: `TK${Date.now()}`,
            paymentId: response.razorpay_payment_id,
          };

          onSuccess(ticketData);
          onClose();
          toast.success('Payment successful! Tickets purchased.');
          setLoading(false);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: '9999999999',
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            toast.error('Payment cancelled');
            setLoading(false);
          }
        },
        // Test mode configuration
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Pay using Test Cards',
                instruments: [
                  {
                    method: 'card'
                  }
                ],
              }
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true,
            }
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment Failed:', response.error);
        if (response.error.code === 'PAYMENT_CANCELLED') {
          toast('Payment cancelled by user');
        } else {
          toast.error(`Payment failed: ${response.error.description || 'Please try again'}`);
        }
        setLoading(false);
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        toast.error('Payment service temporarily unavailable. Please use Test Mode.');
      } else {
        toast.error('Payment initialization failed. Please try Test Mode instead.');
      }
      setLoading(false);
    }
  };

  const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Purchase Tickets</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full" aria-label="Close payment modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm">{event.location}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Quantity</span>
                  <div className="flex items-center space-x-3">
                                        <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                      aria-label="Decrease ticket quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-lg w-8 text-center">
                      {quantity}
                    </span>
                                        <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= Math.min(availableTickets, 10)}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                      aria-label="Increase ticket quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Price per ticket</span>
                    <span className="font-semibold">₹{event.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={loading || availableTickets === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {loading ? 'Processing...' : 
                     availableTickets === 0 ? 'Sold Out' : 
                     'Pay with Razorpay'}
                  </span>
                </button>
              </div>


            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;