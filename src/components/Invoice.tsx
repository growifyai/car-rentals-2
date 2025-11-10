"use client";

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Download, Printer, ArrowLeft, CheckCircle } from 'lucide-react';

interface InvoiceProps {
  orderData: any;
  onBackToHome: () => void;
}

export function Invoice({ orderData, onBackToHome }: InvoiceProps) {
  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Invoice download functionality would be implemented here');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground">Your car rental has been confirmed. Here&apos;s your invoice:</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Invoice Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">Invoice</CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">Z</span>
                  </div>
                  <div>
                    <h2 className="font-semibold">Zion Car Rentals</h2>
                    <p className="text-sm opacity-90">Luxury Cars, Seamless Booking</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Invoice #</p>
                <p className="font-bold text-lg">{orderData.orderId}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Customer and Order Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-4">Bill To:</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{orderData.customer.firstName} {orderData.customer.lastName}</p>
                  <p>{orderData.customer.email}</p>
                  <p>{orderData.customer.phone}</p>
                  <p>{orderData.customer.address}</p>
                  <p>{orderData.customer.city}, {orderData.customer.state} {orderData.customer.zipCode}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Order Details:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span>{new Date(orderData.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <Badge variant="outline" className="ml-2">
                      {orderData.paymentMethod === 'card' ? 'Credit Card' : 
                       orderData.paymentMethod === 'upi' ? 'UPI' : 'Wallet'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-green-100 text-green-800 ml-2">Confirmed</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Rental Details:</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Vehicle</th>
                      <th className="text-center py-2">Duration</th>
                      <th className="text-right py-2">Rate/12hrs</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-4">{item.quantity} periods</td>
                        <td className="text-right py-4">₹{item.price.toLocaleString()}</td>
                        <td className="text-right py-4 font-medium">₹{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{orderData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>₹{orderData.tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>₹{orderData.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Terms & Conditions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vehicle must be returned in the same condition as received</li>
                <li>• Late returns will incur additional charges</li>
                <li>• Valid driver&apos;s license required for pickup</li>
                <li>• Cancellations must be made 24 hours in advance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onBackToHome} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}