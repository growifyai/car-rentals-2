"use client";

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function Contact() {

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Support',
      details: '+91 98765 43210',
      description: 'Available 24/7 for immediate assistance'
    },
    {
      icon: Mail,
      title: 'Email Support',
      details: 'support@zionrentals.com',
      description: 'We respond within 2 hours'
    },
    {
      icon: MapPin,
      title: 'Head Office',
      details: 'Mumbai, Maharashtra',
      description: 'Visit our premium showroom'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: '24/7 Operations',
      description: 'Round-the-clock service'
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary">Get in Touch</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Contact <span className="text-primary">Zion</span> Car Rentals
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our luxury car rental services? Our dedicated team is here 
            to assist you 24/7 with personalized support and expert guidance.
          </p>
        </motion.div>

        {/* Hero Banner */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div 
            className="relative w-full h-80 lg:h-96 xl:h-[28rem] rounded-2xl overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1642660603574-335ee6ea102f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250YWN0JTIwdXMlMjBjdXN0b21lciUyMHNlcnZpY2UlMjBvZmZpY2V8ZW58MXx8fHwxNzU5MTM1MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white max-w-md">
              <h3 className="text-3xl lg:text-4xl font-bold mb-3">Premium Support</h3>
              <p className="text-lg opacity-90 leading-relaxed">Dedicated customer service team ready to help you 24/7</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Information Cards */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {contactInfo.map((info, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <info.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{info.title}</h3>
                <p className="text-primary font-medium mb-1">{info.details}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>


        {/* FAQ Section */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">How do I book a car?</h4>
                <p className="text-sm text-muted-foreground">
                  You can book instantly through our website or mobile app. 
                  Choose your car, select 12-hour periods, and confirm payment.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">What documents do I need?</h4>
                <p className="text-sm text-muted-foreground">
                  Valid driving license, government ID, and credit/debit card 
                  are required for all rentals.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Can I extend my rental?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can extend your rental in 12-hour increments 
                  subject to availability.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">What&apos;s included in the price?</h4>
                <p className="text-sm text-muted-foreground">
                  All rentals include comprehensive insurance, 24/7 support, 
                  and professional vehicle preparation.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}