"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  Plus,
  Trash2,
  Phone,
  Mail,
  User,
  CreditCard,
  FileText,
  Eye,
  Download,
  Share2
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminOfflineBookings, createAdminBooking, deleteAdminBooking, type AdminBookingData } from "@/lib/admin";
import { fetchCars } from "@/lib/cars";
import { fetchCustomers, type CustomerData } from "@/lib/customers";
import type { CarCardData } from "@/types/cars";
import { toast } from "sonner";
import { getApiBaseUrl } from "@/lib/env";

export function AdminOfflineBookingsManagement() {
  const { token } = useAuth();
  const [adminBookings, setAdminBookings] = useState<AdminBookingData[]>([]);
  const [cars, setCars] = useState<CarCardData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isLoadingAdminBookings, setIsLoadingAdminBookings] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [viewBookingModal, setViewBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingData | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAdvancedPaid, setIsAdvancedPaid] = useState(false);
  const [isFullyPaid, setIsFullyPaid] = useState(false);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [editAdditionalFees, setEditAdditionalFees] = useState({
    fee1Name: "",
    fee1Amount: "",
    fee2Name: "",
    fee2Amount: "",
    fee3Name: "",
    fee3Amount: ""
  });
  const [newBooking, setNewBooking] = useState({
    customerId: "",
    customerName: "",
    guardianName: "",
    guardianRelation: "",
    mobile: "",
    email: "",
    occupation: "",
    residentialAddress: "",
    drivingLicenseNumber: "",
    licenseExpiryDate: "",
    carId: "",
    startTime: "",
    endTime: "",
    totalAmount: "",
    advancedAmount: "",
    discount: "",
    paymentMode: "cash",
    notes: "",
    additionalFee1Name: "",
    additionalFee1Amount: "",
    additionalFee2Name: "",
    additionalFee2Amount: "",
    additionalFee3Name: "",
    additionalFee3Amount: "",
  });

  useEffect(() => {
    if (!token) return;
    loadAdminBookings();
    loadCars();
    loadCustomers();
  }, [token]);

  const loadAdminBookings = async () => {
    if (!token) return;

    setIsLoadingAdminBookings(true);
    try {
      const adminBookingsData = await fetchAdminOfflineBookings(token);
      setAdminBookings(adminBookingsData);
    } catch (error) {
      console.error("Failed to load admin bookings:", error);
      toast.error("Failed to load admin bookings");
    } finally {
      setIsLoadingAdminBookings(false);
    }
  };

  const loadCars = async () => {
    try {
      const carsData = await fetchCars();
      setCars(carsData);
    } catch (error) {
      console.error("Failed to load cars:", error);
      toast.error("Failed to load cars");
    }
  };

  const loadCustomers = async () => {
    if (!token) return;
    try {
      const customersData = await fetchCustomers(token);
      console.log("Loaded customers:", customersData);
      setCustomers(customersData);
      if (customersData.length === 0) {
        console.log("No customers found in database");
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers. Please check console for details.");
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setNewBooking({
        ...newBooking,
        customerId: customer._id,
        customerName: customer.fullName,
        guardianName: customer.guardianName,
        guardianRelation: customer.guardianRelation,
        mobile: customer.mobile,
        email: customer.email,
        occupation: customer.occupation,
        residentialAddress: customer.residentialAddress,
        drivingLicenseNumber: customer.drivingLicenseNumber,
        licenseExpiryDate: customer.licenseExpiryDate ? new Date(customer.licenseExpiryDate).toISOString().split('T')[0] : "",
      });
    }
  };

  const handleCreateAdminBooking = async () => {
    if (!token || !newBooking.customerId || !newBooking.carId || !newBooking.startTime || !newBooking.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreatingBooking(true);
    try {
      await createAdminBooking({
        customerId: newBooking.customerId,
        customerName: newBooking.customerName,
        guardianName: newBooking.guardianName,
        guardianRelation: newBooking.guardianRelation,
        mobile: newBooking.mobile,
        email: newBooking.email,
        occupation: newBooking.occupation,
        residentialAddress: newBooking.residentialAddress,
        drivingLicenseNumber: newBooking.drivingLicenseNumber,
        licenseExpiryDate: newBooking.licenseExpiryDate,
        carId: newBooking.carId,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        totalAmount: newBooking.totalAmount ? parseFloat(newBooking.totalAmount) : 0,
        advancedAmount: newBooking.advancedAmount ? parseFloat(newBooking.advancedAmount) : 0,
        discount: newBooking.discount ? parseFloat(newBooking.discount) : 0,
        notes: newBooking.notes || undefined,
        additionalFee1Name: newBooking.additionalFee1Name || undefined,
        additionalFee1Amount: newBooking.additionalFee1Amount ? parseFloat(newBooking.additionalFee1Amount) : undefined,
        additionalFee2Name: newBooking.additionalFee2Name || undefined,
        additionalFee2Amount: newBooking.additionalFee2Amount ? parseFloat(newBooking.additionalFee2Amount) : undefined,
        additionalFee3Name: newBooking.additionalFee3Name || undefined,
        additionalFee3Amount: newBooking.additionalFee3Amount ? parseFloat(newBooking.additionalFee3Amount) : undefined,
      }, token);

      toast.success("Booking created successfully");
      setIsModalOpen(false);
      setSelectedCustomer(null);
      setNewBooking({ 
        customerId: "",
        customerName: "",
        guardianName: "",
        guardianRelation: "",
        mobile: "",
        email: "",
        occupation: "",
        residentialAddress: "",
        drivingLicenseNumber: "",
        licenseExpiryDate: "",
        carId: "",
        startTime: "",
        endTime: "",
        totalAmount: "",
        advancedAmount: "",
        discount: "",
        paymentMode: "cash",
        notes: "",
        additionalFee1Name: "",
        additionalFee1Amount: "",
        additionalFee2Name: "",
        additionalFee2Amount: "",
        additionalFee3Name: "",
        additionalFee3Amount: "",
      });
      const adminBookingsData = await fetchAdminOfflineBookings(token);
      setAdminBookings(adminBookingsData);
    } catch (error: unknown) {
      console.error("Failed to create booking:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
      toast.error(errorMessage);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleDeleteAdminBooking = async (bookingId: string) => {
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this booking? This will free up the car for other bookings.")) return;

    try {
      await deleteAdminBooking(bookingId, token);
      toast.success("Booking deleted successfully");
      setAdminBookings(adminBookings.filter(b => b._id !== bookingId));
    } catch (error: unknown) {
      console.error("Failed to delete booking:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete booking";
      toast.error(errorMessage);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setNewBooking({
      customerId: "",
      customerName: "",
      guardianName: "",
      guardianRelation: "",
      mobile: "",
      email: "",
      occupation: "",
      residentialAddress: "",
      drivingLicenseNumber: "",
      licenseExpiryDate: "",
      carId: "",
      startTime: "",
      endTime: "",
      totalAmount: "",
      advancedAmount: "",
      discount: "",
      paymentMode: "cash",
      notes: "",
      additionalFee1Name: "",
      additionalFee1Amount: "",
      additionalFee2Name: "",
      additionalFee2Amount: "",
      additionalFee3Name: "",
      additionalFee3Amount: "",
    });
  };

  const closeViewModal = () => {
    setViewBookingModal(false);
    setSelectedBooking(null);
    setPaymentAmount("");
  };

  return (
    <>
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Admin Bookings</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Offline Walk-in Bookings</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Booking
        </Button>
      </div>

      {/* Admin Bookings Table */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="text-slate-800 dark:text-slate-200">All Admin Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingAdminBookings ? (
            <div className="py-12 text-center px-6">
              <p className="text-slate-500">Loading admin bookings...</p>
            </div>
          ) : adminBookings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No admin bookings</h3>
              <p className="text-slate-500 dark:text-slate-500">
                Click "Add Booking" to create a booking for a walk-in customer.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800">
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold min-w-[200px]">Customer</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold min-w-[120px]">Car</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold min-w-[140px]">Start Time</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold min-w-[140px]">End Time</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold min-w-[150px]">Notes</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300 font-semibold min-w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminBookings.map((booking) => {
                      const totalAmount = booking.totalAmount || 0;
                      const discount = booking.discount || 0;
                      const advanced = booking.advancedAmount || 0;
                      const remaining = totalAmount - discount - advanced;
                      
                      return (
                        <TableRow key={booking._id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell className="min-w-[200px]">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{booking.customerName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" />
                                <span className="truncate">{booking.mobile}</span>
                              </p>
                              {booking.email && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[180px]">{booking.email}</span>
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                {booking.carId?.carName || "Unknown Car"}
                              </p>
                              {booking.carId?.model && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">{booking.carId.model}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[140px]">
                            <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {new Date(booking.startTime).toLocaleString('en-GB', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </TableCell>
                          <TableCell className="min-w-[140px]">
                            <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {new Date(booking.endTime).toLocaleString('en-GB', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </TableCell>
                          <TableCell className="min-w-[150px] max-w-[200px]">
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {booking.notes || "-"}
                            </p>
                          </TableCell>
                          <TableCell className="min-w-[100px]">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  const paymentStatus = (booking as any).paymentStatus || 'unpaid';
                                  const paidAmount = (booking as any).paidAmount || 0;
                                  const advancedAmount = booking.advancedAmount || 0;
                                  const totalAmount = booking.totalAmount || 0;
                                  const discount = booking.discount || 0;
                                  const additionalFees = ((booking as any).additionalFee1Amount || 0) + 
                                    ((booking as any).additionalFee2Amount || 0) + 
                                    ((booking as any).additionalFee3Amount || 0);
                                  const finalTotal = totalAmount - discount + additionalFees;
                                  
                                  // Determine which checkbox should be checked
                                  const isAdvanced = paymentStatus === 'advanced' && paidAmount === advancedAmount;
                                  const isFull = paymentStatus === 'full' && paidAmount === finalTotal;
                                  const isCustom = paidAmount > 0 && !isAdvanced && !isFull;
                                  
                                  setIsAdvancedPaid(isAdvanced);
                                  setIsFullyPaid(isFull);
                                  setIsCustomAmount(isCustom);
                                  
                                  // Initialize additional fees edit form
                                  setEditAdditionalFees({
                                    fee1Name: (booking as any).additionalFee1Name || "",
                                    fee1Amount: (booking as any).additionalFee1Amount ? String((booking as any).additionalFee1Amount) : "",
                                    fee2Name: (booking as any).additionalFee2Name || "",
                                    fee2Amount: (booking as any).additionalFee2Amount ? String((booking as any).additionalFee2Amount) : "",
                                    fee3Name: (booking as any).additionalFee3Name || "",
                                    fee3Amount: (booking as any).additionalFee3Amount ? String((booking as any).additionalFee3Amount) : "",
                                  });
                                  
                                  setViewBookingModal(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAdminBooking(booking._id)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Create Booking */}
      {isModalOpen && (
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
            onClick={closeModal}
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
              width: '90%',
              maxWidth: '56rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold dark:text-white">
                Add Offline Booking
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto p-6"
              style={{ flex: '1 1 auto', minHeight: 0 }}
            >
              <div className="space-y-6">
                {/* Customer Selection Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Select Customer
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Customer *</Label>
                    <Select value={newBooking.customerId} onValueChange={handleCustomerSelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.length === 0 ? (
                          <SelectItem value="no-customers" disabled>
                            No customers found. Please add customers first.
                          </SelectItem>
                        ) : (
                          customers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.fullName} - {customer.mobile}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {customers.length === 0 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ No customers found. Please go to the Customers page to add customers first.
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select a customer from your database. Their details will be auto-filled below.
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Details Section - Auto-filled */}
                {selectedCustomer && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Customer Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={newBooking.customerName} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <Label>Guardian Name</Label>
                        <Input value={newBooking.guardianName} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <Label>Guardian Relation</Label>
                        <Input value={newBooking.guardianRelation} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile</Label>
                        <Input value={newBooking.mobile} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={newBooking.email} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <Label>Occupation</Label>
                        <Input value={newBooking.occupation} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Residential Address</Label>
                        <Input value={newBooking.residentialAddress} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <Label>Driving License Number</Label>
                        <Input value={newBooking.drivingLicenseNumber} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <Label>License Expiry Date</Label>
                        <Input value={newBooking.licenseExpiryDate} disabled className="bg-slate-100 dark:bg-slate-900" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Booking Details
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="carId">Select Car *</Label>
                    <Select value={newBooking.carId} onValueChange={(value) => setNewBooking({ ...newBooking, carId: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a car..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cars.length === 0 ? (
                          <SelectItem value="loading" disabled>Loading cars...</SelectItem>
                        ) : (
                          cars.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.name} {car.model && `(${car.model})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={newBooking.startTime}
                          onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={newBooking.endTime}
                          onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Total Amount (₹) *</Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        value={newBooking.totalAmount}
                        onChange={(e) => setNewBooking({ ...newBooking, totalAmount: e.target.value })}
                        placeholder="10000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="advancedAmount">Advanced Amount (₹)</Label>
                      <Input
                        id="advancedAmount"
                        type="number"
                        value={newBooking.advancedAmount}
                        onChange={(e) => setNewBooking({ ...newBooking, advancedAmount: e.target.value })}
                        placeholder="2000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (₹)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={newBooking.discount}
                        onChange={(e) => setNewBooking({ ...newBooking, discount: e.target.value })}
                        placeholder="500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMode">Payment Mode *</Label>
                      <Select
                        value={newBooking.paymentMode}
                        onValueChange={(value) => setNewBooking({ ...newBooking, paymentMode: value })}
                      >
                        <SelectTrigger id="paymentMode">
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Fees Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Additional Fees (Optional)
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Additional Fee 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="additionalFee1Name">Fee Name 1</Label>
                        <Input
                          id="additionalFee1Name"
                          type="text"
                          value={newBooking.additionalFee1Name}
                          onChange={(e) => setNewBooking({ ...newBooking, additionalFee1Name: e.target.value })}
                          placeholder="e.g., Cleaning Fee"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="additionalFee1Amount">Amount (₹)</Label>
                        <Input
                          id="additionalFee1Amount"
                          type="number"
                          value={newBooking.additionalFee1Amount}
                          onChange={(e) => setNewBooking({ ...newBooking, additionalFee1Amount: e.target.value })}
                          placeholder="500"
                        />
                      </div>
                    </div>

                    {/* Additional Fee 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="additionalFee2Name">Fee Name 2</Label>
                        <Input
                          id="additionalFee2Name"
                          type="text"
                          value={newBooking.additionalFee2Name}
                          onChange={(e) => setNewBooking({ ...newBooking, additionalFee2Name: e.target.value })}
                          placeholder="e.g., Driver Charges"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="additionalFee2Amount">Amount (₹)</Label>
                        <Input
                          id="additionalFee2Amount"
                          type="number"
                          value={newBooking.additionalFee2Amount}
                          onChange={(e) => setNewBooking({ ...newBooking, additionalFee2Amount: e.target.value })}
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    {/* Additional Fee 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="additionalFee3Name">Fee Name 3</Label>
                        <Input
                          id="additionalFee3Name"
                          type="text"
                          value={newBooking.additionalFee3Name}
                          onChange={(e) => setNewBooking({ ...newBooking, additionalFee3Name: e.target.value })}
                          placeholder="e.g., Fuel Surcharge"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="additionalFee3Amount">Amount (₹)</Label>
                        <Input
                          id="additionalFee3Amount"
                          type="number"
                          value={newBooking.additionalFee3Amount}
                          onChange={(e) => setNewBooking({ ...newBooking, additionalFee3Amount: e.target.value })}
                          placeholder="300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    placeholder="Additional information about the booking..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <Button variant="outline" onClick={closeModal} disabled={isCreatingBooking}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdminBooking} disabled={isCreatingBooking} className="bg-green-600 hover:bg-green-700">
                {isCreatingBooking ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Details Modal */}
      {viewBookingModal && selectedBooking && (
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
            onClick={closeViewModal}
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
              width: '90%',
              maxWidth: '56rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-xl font-semibold dark:text-white">
                Booking Details
              </h2>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto p-6"
              style={{ flex: '1 1 auto', minHeight: 0 }}
            >
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Full Name</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mobile</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.mobile}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Guardian Name</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.guardianName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Guardian Relation</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.guardianRelation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Occupation</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.occupation || "-"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Residential Address</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.residentialAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Driving License</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.drivingLicenseNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">License Expiry</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.licenseExpiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Car</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {selectedBooking.carId?.carName || "Unknown Car"}
                        {selectedBooking.carId?.model && ` (${selectedBooking.carId.model})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Start Time</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(selectedBooking.startTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">End Time</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(selectedBooking.endTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Notes</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.notes || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Fees Management */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Additional Fees
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="space-y-3">
                      {/* Additional Fee 1 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Fee Name 1</Label>
                          <Input
                            type="text"
                            placeholder="e.g., Cleaning Fee"
                            value={editAdditionalFees.fee1Name}
                            onChange={(e) => setEditAdditionalFees({ ...editAdditionalFees, fee1Name: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="500"
                            value={editAdditionalFees.fee1Amount}
                            onChange={(e) => setEditAdditionalFees({ ...editAdditionalFees, fee1Amount: e.target.value })}
                            className="h-9"
                          />
                        </div>
                      </div>

                      {/* Additional Fee 2 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Fee Name 2</Label>
                          <Input
                            type="text"
                            placeholder="e.g., Driver Charges"
                            value={editAdditionalFees.fee2Name}
                            onChange={(e) => setEditAdditionalFees({ ...editAdditionalFees, fee2Name: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="1000"
                            value={editAdditionalFees.fee2Amount}
                            onChange={(e) => setEditAdditionalFees({ ...editAdditionalFees, fee2Amount: e.target.value })}
                            className="h-9"
                          />
                        </div>
                      </div>

                      {/* Additional Fee 3 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Fee Name 3</Label>
                          <Input
                            type="text"
                            placeholder="e.g., Fuel Surcharge"
                            value={editAdditionalFees.fee3Name}
                            onChange={(e) => setEditAdditionalFees({ ...editAdditionalFees, fee3Name: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Amount (₹)</Label>
                          <Input
                            type="number"
                            placeholder="300"
                            value={editAdditionalFees.fee3Amount}
                            onChange={(e) => setEditAdditionalFees({ ...editAdditionalFees, fee3Amount: e.target.value })}
                            className="h-9"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={async () => {
                          if (!token || !selectedBooking) return;

                          try {
                            const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings/${selectedBooking._id}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                additionalFee1Name: editAdditionalFees.fee1Name || undefined,
                                additionalFee1Amount: editAdditionalFees.fee1Amount ? parseFloat(editAdditionalFees.fee1Amount) : undefined,
                                additionalFee2Name: editAdditionalFees.fee2Name || undefined,
                                additionalFee2Amount: editAdditionalFees.fee2Amount ? parseFloat(editAdditionalFees.fee2Amount) : undefined,
                                additionalFee3Name: editAdditionalFees.fee3Name || undefined,
                                additionalFee3Amount: editAdditionalFees.fee3Amount ? parseFloat(editAdditionalFees.fee3Amount) : undefined,
                              })
                            });

                            if (!response.ok) throw new Error('Failed to update fees');

                            const data = await response.json();
                            setSelectedBooking(data.booking);
                            toast.success("Additional fees updated successfully!");
                            loadAdminBookings();
                          } catch (error) {
                            console.error('Update fees error:', error);
                            toast.error("Failed to update additional fees");
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Update Additional Fees
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Details
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Total Amount:</span>
                      <span className="font-semibold">₹{(selectedBooking.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    {(selectedBooking.discount || 0) > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Discount:</span>
                        <span className="font-semibold text-red-600">- ₹{(selectedBooking.discount || 0).toLocaleString()}</span>
                      </div>
                    )}
                    {(selectedBooking as any).additionalFee1Name && (selectedBooking as any).additionalFee1Amount > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">{(selectedBooking as any).additionalFee1Name}:</span>
                        <span className="font-semibold text-green-600">+ ₹{((selectedBooking as any).additionalFee1Amount || 0).toLocaleString()}</span>
                      </div>
                    )}
                    {(selectedBooking as any).additionalFee2Name && (selectedBooking as any).additionalFee2Amount > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">{(selectedBooking as any).additionalFee2Name}:</span>
                        <span className="font-semibold text-green-600">+ ₹{((selectedBooking as any).additionalFee2Amount || 0).toLocaleString()}</span>
                      </div>
                    )}
                    {(selectedBooking as any).additionalFee3Name && (selectedBooking as any).additionalFee3Amount > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">{(selectedBooking as any).additionalFee3Name}:</span>
                        <span className="font-semibold text-green-600">+ ₹{((selectedBooking as any).additionalFee3Amount || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Expected Advanced:</span>
                      <span className="font-semibold">₹{(selectedBooking.advancedAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">Already Paid:</span>
                      <span className="font-semibold text-green-600">₹{((selectedBooking as any).paidAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 mt-3 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-base">Balance:</span>
                      <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                        ₹{Math.max(0, (selectedBooking.totalAmount || 0) - (selectedBooking.discount || 0) + ((selectedBooking as any).additionalFee1Amount || 0) + ((selectedBooking as any).additionalFee2Amount || 0) + ((selectedBooking as any).additionalFee3Amount || 0) - ((selectedBooking as any).paidAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Record Payment */}
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Label>Record Payment</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="advancedPaid"
                          checked={isAdvancedPaid}
                          className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                          onChange={async (e) => {
                            const checked = e.target.checked;
                            
                            if (!token || !selectedBooking) return;
                            
                            try {
                              const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings/${selectedBooking._id}/payment`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                  paymentType: checked ? 'advanced' : 'reset'
                                })
                              });

                              if (!response.ok) throw new Error('Failed to update payment');

                              const data = await response.json();
                              setSelectedBooking(data.booking);
                              setIsAdvancedPaid(checked);
                              setIsFullyPaid(false);
                              setIsCustomAmount(false);
                              
                              // Update additional fees form
                              setEditAdditionalFees({
                                fee1Name: (data.booking as any).additionalFee1Name || "",
                                fee1Amount: (data.booking as any).additionalFee1Amount ? String((data.booking as any).additionalFee1Amount) : "",
                                fee2Name: (data.booking as any).additionalFee2Name || "",
                                fee2Amount: (data.booking as any).additionalFee2Amount ? String((data.booking as any).additionalFee2Amount) : "",
                                fee3Name: (data.booking as any).additionalFee3Name || "",
                                fee3Amount: (data.booking as any).additionalFee3Amount ? String((data.booking as any).additionalFee3Amount) : "",
                              });
                              
                              if (checked) {
                                toast.success("Advanced payment recorded successfully!");
                              } else {
                                toast.info("Advanced payment status removed");
                              }
                              
                              loadAdminBookings();
                            } catch (error) {
                              console.error('Payment update error:', error);
                              toast.error("Failed to update payment");
                            }
                          }}
                        />
                        <Label htmlFor="advancedPaid" className="text-sm font-medium cursor-pointer">
                          Advanced Paid
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="fullyPaid"
                          checked={isFullyPaid}
                          className="w-4 h-4 text-green-600 bg-white border-slate-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                          onChange={async (e) => {
                            const checked = e.target.checked;
                            
                            if (!token || !selectedBooking) return;
                            
                            try {
                              const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings/${selectedBooking._id}/payment`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                  paymentType: checked ? 'full' : 'reset'
                                })
                              });

                              if (!response.ok) throw new Error('Failed to update payment');

                              const data = await response.json();
                              setSelectedBooking(data.booking);
                              setIsFullyPaid(checked);
                              setIsAdvancedPaid(false);
                              setIsCustomAmount(false);
                              
                              // Update additional fees form
                              setEditAdditionalFees({
                                fee1Name: (data.booking as any).additionalFee1Name || "",
                                fee1Amount: (data.booking as any).additionalFee1Amount ? String((data.booking as any).additionalFee1Amount) : "",
                                fee2Name: (data.booking as any).additionalFee2Name || "",
                                fee2Amount: (data.booking as any).additionalFee2Amount ? String((data.booking as any).additionalFee2Amount) : "",
                                fee3Name: (data.booking as any).additionalFee3Name || "",
                                fee3Amount: (data.booking as any).additionalFee3Amount ? String((data.booking as any).additionalFee3Amount) : "",
                              });
                              
                              if (checked) {
                                toast.success("Full payment recorded successfully!");
                              } else {
                                toast.info("Full payment status removed");
                              }
                              
                              loadAdminBookings();
                            } catch (error) {
                              console.error('Payment update error:', error);
                              toast.error("Failed to update payment");
                            }
                          }}
                        />
                        <Label htmlFor="fullyPaid" className="text-sm font-medium cursor-pointer">
                          Fully Paid
                        </Label>
                      </div>
                      
                      {/* Custom Amount Checkbox */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="customAmount"
                          checked={isCustomAmount}
                          className="w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                          onChange={(e) => {
                            setIsCustomAmount(e.target.checked);
                            if (e.target.checked) {
                              setIsAdvancedPaid(false);
                              setIsFullyPaid(false);
                            } else {
                              setPaymentAmount("");
                            }
                          }}
                        />
                        <Label htmlFor="customAmount" className="text-sm font-medium cursor-pointer">
                          Custom Amount
                        </Label>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Check the payment status. A receipt will be generated automatically.
                    </p>
                    
                    {/* Custom Amount Input */}
                    {isCustomAmount && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={async () => {
                                if (!token || !selectedBooking) return;
                                if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
                                  toast.error("Please enter a valid amount");
                                  return;
                                }
                                
                                const customAmountValue = parseFloat(paymentAmount);
                                
                                try {
                                  const response = await fetch(`${getApiBaseUrl()}/api/admin/bookings/${selectedBooking._id}/payment`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                      paymentType: 'custom',
                                      customAmount: customAmountValue
                                    })
                                  });

                                  if (!response.ok) throw new Error('Failed to update payment');

                                  const data = await response.json();
                                  setSelectedBooking(data.booking);
                                  setPaymentAmount("");
                                  
                                  // Calculate if this is actually a full or advanced payment
                                  const totalAmount = selectedBooking.totalAmount || 0;
                                  const discount = selectedBooking.discount || 0;
                                  const additionalFees = ((selectedBooking as any).additionalFee1Amount || 0) + 
                                    ((selectedBooking as any).additionalFee2Amount || 0) + 
                                    ((selectedBooking as any).additionalFee3Amount || 0);
                                  const finalTotal = totalAmount - discount + additionalFees;
                                  const advancedAmount = selectedBooking.advancedAmount || 0;
                                  
                                  // Set checkbox states based on the amount
                                  const isFull = customAmountValue >= finalTotal;
                                  const isAdvanced = customAmountValue === advancedAmount;
                                  const isCustom = !isFull && !isAdvanced;
                                  
                                  setIsFullyPaid(isFull);
                                  setIsAdvancedPaid(isAdvanced);
                                  setIsCustomAmount(isCustom);
                                  
                                  // Update additional fees form
                                  setEditAdditionalFees({
                                    fee1Name: (data.booking as any).additionalFee1Name || "",
                                    fee1Amount: (data.booking as any).additionalFee1Amount ? String((data.booking as any).additionalFee1Amount) : "",
                                    fee2Name: (data.booking as any).additionalFee2Name || "",
                                    fee2Amount: (data.booking as any).additionalFee2Amount ? String((data.booking as any).additionalFee2Amount) : "",
                                    fee3Name: (data.booking as any).additionalFee3Name || "",
                                    fee3Amount: (data.booking as any).additionalFee3Amount ? String((data.booking as any).additionalFee3Amount) : "",
                                  });
                                  
                                  toast.success(`Payment of ₹${customAmountValue.toLocaleString()} recorded successfully!`);
                                  loadAdminBookings();
                                } catch (error) {
                                  console.error('Payment update error:', error);
                                  toast.error("Failed to record payment");
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Submit
                            </Button>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                            Enter any amount to record partial or custom payment.
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Generate Receipt Button */}
                  {((selectedBooking as any).paidAmount || 0) > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={async () => {
                          if (!token || !selectedBooking) {
                            toast.error("Unable to download receipt");
                            return;
                          }

                          setIsDownloading(true);
                          try {
                            const receiptUrl = `${getApiBaseUrl()}/api/admin/bookings/${selectedBooking._id}/receipt`;

                            const response = await fetch(receiptUrl, {
                              method: 'GET',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({ error: 'Failed to download receipt' }));
                              throw new Error(errorData.error || 'Failed to download receipt');
                            }

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `admin-booking-receipt-${selectedBooking._id}.pdf`;
                            document.body.appendChild(link);
                            link.click();

                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);

                            toast.success("Receipt downloaded successfully");
                          } catch (error: unknown) {
                            console.error("Error downloading receipt:", error);
                            const errorMessage = error instanceof Error ? error.message : "Failed to download receipt";
                            toast.error(errorMessage);
                          } finally {
                            setIsDownloading(false);
                          }
                        }}
                        disabled={isDownloading}
                        className="flex-1 bg-slate-600 hover:bg-slate-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isDownloading ? "Downloading..." : "Download Receipt"}
                      </Button>
                      <Button 
                        onClick={async () => {
                          if (!token || !selectedBooking) {
                            toast.error("Unable to share receipt");
                            return;
                          }

                          setIsDownloading(true);
                          try {
                            const receiptUrl = `${getApiBaseUrl()}/api/admin/bookings/${selectedBooking._id}/receipt`;

                            const response = await fetch(receiptUrl, {
                              method: 'GET',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({ error: 'Failed to fetch receipt' }));
                              throw new Error(errorData.error || 'Failed to fetch receipt');
                            }

                            const blob = await response.blob();
                            const file = new File([blob], `admin-booking-receipt-${selectedBooking._id}.pdf`, { type: 'application/pdf' });

                            // Check if Web Share API is supported (works on mobile)
                            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: 'Booking Receipt',
                                text: `Receipt for booking ${selectedBooking._id}`,
                              });
                              toast.success("Receipt shared successfully");
                            } else {
                              // Fallback for desktop: Download the PDF first, then open WhatsApp
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `admin-booking-receipt-${selectedBooking._id}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);

                              // Wait a moment for download to start, then open WhatsApp
                              setTimeout(() => {
                                const phoneNumber = (selectedBooking as any).mobile || '';
                                const message = encodeURIComponent(`Hi! I'm sharing the receipt for booking #${selectedBooking._id}. The PDF has been downloaded to your device. Please attach it to this chat.`);
                                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                                window.open(whatsappUrl, '_blank');
                                toast.success("Receipt downloaded! Opening WhatsApp - please attach the downloaded PDF.");
                              }, 500);
                            }
                          } catch (error: unknown) {
                            console.error("Error sharing receipt:", error);
                            const errorMessage = error instanceof Error ? error.message : "Failed to share receipt";
                            toast.error(errorMessage);
                          } finally {
                            setIsDownloading(false);
                          }
                        }}
                        disabled={isDownloading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share on WhatsApp
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <Button 
                variant="outline" 
                onClick={closeViewModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
