"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarForm } from "./car-form";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";

interface AddCarDialogProps {
  onCarAdded: () => void;
}

export function AddCarDialog({ onCarAdded }: AddCarDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      await apiFetch("/api/cars", {
        method: "POST",
        token,
        json: formData,
      });
      
      setOpen(false);
      onCarAdded();
    } catch (error) {
      console.error("Failed to add car:", error);
      throw error; // Re-throw to let CarForm handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Car
      </Button>
      
      {/* Standalone dialog implementation */}
      {open && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)'
          }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Dialog Content */}
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col overflow-hidden border border-slate-700/50"
            style={{ 
              zIndex: 10000,
              pointerEvents: 'auto',
              position: 'relative',
              maxHeight: '95vh',
              height: '95vh',
              width: '60%'
            }}
          >
            {/* Header - Fixed */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold dark:text-white">Add New Car</h2>
              <button 
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto p-6 bg-black [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              style={{ flex: '1 1 auto', minHeight: 0 }}
            >
              <CarForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
                submitLabel="Add Car"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
