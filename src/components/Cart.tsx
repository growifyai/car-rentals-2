"use client";

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

interface Car {
  id: string;
  name: string;
  type: string;
  seats: number;
  image: string;
  price: number;
}

export interface CartItem extends Car {
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout, onContinueShopping }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={onContinueShopping}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cars
          </Button>
        </div>
        
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Trash2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Start adding some cars to rent!</p>
            <Button onClick={onContinueShopping} className="w-full">
              Browse Cars
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={onContinueShopping}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.type} • {item.seats} seats</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium">{item.quantity} periods</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()}/12hrs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
                onClick={onCheckout}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}