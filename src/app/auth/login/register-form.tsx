"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { register as registerUser } from "@/lib/auth";
import { toast } from "sonner";

interface RegisterFormValues {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

const defaultValues: RegisterFormValues = {
  name: "",
  email: "",
  mobile: "",
  password: "",
};

export function RegisterForm() {
  const { setSession } = useAuth();
  const router = useRouter();
  const form = useForm<RegisterFormValues>({ defaultValues });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const session = await registerUser(values);
      setSession(session);
      toast.success(`Welcome to Zion Car Rentals, ${session.user.name}!`);
      router.push("/dashboard/bookings");
    } catch (error) {
      console.error(error);
      const message = (error as { message?: string }).message ?? "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Full name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile"
          rules={{ required: "Mobile number is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+91 98765 43210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          rules={{ required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a strong password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}

