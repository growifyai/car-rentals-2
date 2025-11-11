"use client";

import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Shield, Award, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function About() {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '10,000+' },
    { icon: Award, label: 'Years of Service', value: '15+' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Fully Insured',
      description: 'All our vehicles come with comprehensive insurance coverage for your peace of mind.'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help.'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Only the finest luxury vehicles that meet our strict quality standards.'
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary">About Zion Car Rentals</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Your Premier <span className="text-primary">Luxury</span> Car Rental Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Since 2009, Zion Car Rentals has been India's leading luxury car rental service, 
            providing premium vehicles and exceptional experiences for discerning customers.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{stat.value}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2009 by automotive enthusiasts, Zion Car Rentals began with a simple vision: 
                to make luxury cars accessible to everyone, whether for special occasions, business needs, 
                or pure driving pleasure.
              </p>
              <p>
                What started as a small fleet of premium vehicles in Mumbai has grown into India's most 
                trusted luxury car rental service, providing exceptional experiences across the country.
              </p>
              <p>
                Our commitment to excellence, attention to detail, and passion for automotive perfection 
                has earned us the trust of over 10,000 satisfied customers who choose us for their 
                luxury transportation needs.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                To democratize luxury by providing seamless access to the world's finest automobiles, 
                ensuring every journey becomes an extraordinary experience.
              </p>
              <p>
                We believe that luxury should be attainable, reliable, and memorable. Every vehicle 
                in our fleet is meticulously maintained and equipped with the latest technology to 
                ensure your comfort and safety.
              </p>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
              <h3 className="font-semibold mb-2">Why Choose Zion?</h3>
              <p className="text-sm text-muted-foreground">
                "Luxury Cars, Seamless Booking" isn't just our tagline – it's our promise. 
                From the moment you book to the moment you return your vehicle, we ensure 
                a premium experience that exceeds expectations.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}