"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar as CalendarIcon,
  X,
  Image as ImageIcon,
  Users
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/components/ui/utils";
import { 
  fetchCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  type CustomerData 
} from "@/lib/customers";
import { getApiBaseUrl } from "@/lib/env";
import { toast } from "sonner";

interface CustomerFormData {
  fullName: string;
  guardianName: string;
  guardianRelation: string;
  mobile: string;
  email: string;
  occupation: string;
  residentialAddress: string;
  drivingLicenseNumber: string;
  licenseExpiryDate: string;
  drivingLicenseImage?: string;
  aadharCardImage?: string;
  livePhoto?: string;
}

const emptyFormData: CustomerFormData = {
  fullName: "",
  guardianName: "",
  guardianRelation: "S/o (Son of)",
  mobile: "",
  email: "",
  occupation: "",
  residentialAddress: "",
  drivingLicenseNumber: "",
  licenseExpiryDate: "",
  drivingLicenseImage: "",
  aadharCardImage: "",
  livePhoto: "",
};

export function AdminCustomersManagement() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadCustomers();
  }, [token]);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const data = await fetchCustomers(token);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.fullName.toLowerCase().includes(query) ||
      customer.mobile.includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.drivingLicenseNumber.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCustomer(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: CustomerData) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      guardianName: customer.guardianName,
      guardianRelation: customer.guardianRelation,
      mobile: customer.mobile,
      email: customer.email,
      occupation: customer.occupation,
      residentialAddress: customer.residentialAddress,
      drivingLicenseNumber: customer.drivingLicenseNumber,
      licenseExpiryDate: customer.licenseExpiryDate,
      drivingLicenseImage: customer.drivingLicenseImage || "",
      aadharCardImage: customer.aadharCardImage || "",
      livePhoto: customer.livePhoto || "",
    });
    setIsModalOpen(true);
  };

  const openViewModal = (customer: CustomerData) => {
    setModalMode("view");
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!token) return;

    // Validation
    if (!formData.fullName || !formData.mobile || !formData.drivingLicenseNumber || !formData.licenseExpiryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "create") {
        await createCustomer(formData, token);
        toast.success("Customer created successfully");
      } else if (modalMode === "edit" && selectedCustomer) {
        await updateCustomer(selectedCustomer._id, formData, token);
        toast.success("Customer updated successfully");
      }
      
      setIsModalOpen(false);
      setFormData(emptyFormData);
      await loadCustomers();
    } catch (error: unknown) {
      console.error("Failed to save customer:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save customer";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCustomer(customerId, token);
      toast.success("Customer deleted successfully");
      setCustomers(customers.filter(c => c._id !== customerId));
    } catch (error: unknown) {
      console.error("Failed to delete customer:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete customer";
      toast.error(errorMessage);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setFormData(emptyFormData);
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const normalizedUrl = url.trim();
    if (normalizedUrl.includes('uploads')) {
      const path = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
      return `${getApiBaseUrl()}${path}`;
    }
    if (normalizedUrl.startsWith('/')) {
      return `${getApiBaseUrl()}${normalizedUrl}`;
    }
    return `${getApiBaseUrl()}/uploads/${normalizedUrl}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Customer Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage customer database with complete details and documents
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search Section */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
            <Search className="h-5 w-5" />
            <span>Search Customers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, mobile, email, or license number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
          <CardTitle className="text-slate-800 dark:text-slate-200 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Customers ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-slate-500">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                {searchQuery ? "No customers found" : "No customers yet"}
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                {searchQuery 
                  ? "No customers match your search criteria." 
                  : "Click 'Add Customer' to create your first customer record."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800">
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Name</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Contact</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">License Number</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">License Expiry</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Occupation</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell className="py-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">{customer.fullName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {customer.guardianRelation} {customer.guardianName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.mobile}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center truncate max-w-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                          {customer.drivingLicenseNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-slate-600 dark:text-slate-400">
                        {new Date(customer.licenseExpiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="py-4 text-slate-600 dark:text-slate-400">
                        {customer.occupation}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewModal(customer)}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(customer)}
                            className="hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer._id)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Create/Edit/View */}
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
                {modalMode === "create" && "Add New Customer"}
                {modalMode === "edit" && "Edit Customer"}
                {modalMode === "view" && "Customer Details"}
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
              {modalMode === "view" && selectedCustomer ? (
                <ViewCustomerContent customer={selectedCustomer} getFullImageUrl={getFullImageUrl} />
              ) : (
                <CustomerFormContent 
                  formData={formData} 
                  setFormData={setFormData} 
                  mode={modalMode}
                />
              )}
            </div>

            {/* Footer */}
            {modalMode !== "view" && (
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 shrink-0">
                <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {isSubmitting ? "Saving..." : modalMode === "create" ? "Create Customer" : "Update Customer"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// View Customer Content Component
function ViewCustomerContent({ 
  customer, 
  getFullImageUrl 
}: { 
  customer: CustomerData; 
  getFullImageUrl: (url?: string) => string | null;
}) {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center space-x-2 text-white">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Full Name</p>
              <p className="text-sm font-medium text-white">{customer.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Guardian Name</p>
              <p className="text-sm font-medium text-white">{customer.guardianRelation} {customer.guardianName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Mobile</p>
              <p className="text-sm font-medium text-white">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Email</p>
              <p className="text-sm font-medium text-white break-words">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Occupation</p>
              <p className="text-sm font-medium text-white">{customer.occupation}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Residential Address</p>
              <p className="text-sm font-medium text-white break-words">{customer.residentialAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License Information */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center space-x-2 text-white">
            <CreditCard className="h-5 w-5" />
            <span>License Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">License Number</p>
              <p className="text-sm font-medium text-white">{customer.drivingLicenseNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">License Expiry Date</p>
              <p className="text-sm font-medium text-white">{new Date(customer.licenseExpiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center space-x-2 text-white">
            <ImageIcon className="h-5 w-5" />
            <span>Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {customer.drivingLicenseImage && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Driving License</p>
                <img 
                  src={getFullImageUrl(customer.drivingLicenseImage) || ""} 
                  alt="Driving License" 
                  className="w-full h-32 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}
            {customer.aadharCardImage && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Aadhar Card</p>
                <img 
                  src={getFullImageUrl(customer.aadharCardImage) || ""} 
                  alt="Aadhar Card" 
                  className="w-full h-32 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}
            {customer.livePhoto && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Live Photo</p>
                <img 
                  src={getFullImageUrl(customer.livePhoto) || ""} 
                  alt="Live Photo" 
                  className="w-full h-32 object-cover rounded-lg border border-slate-600"
                />
              </div>
            )}
          </div>
          {!customer.drivingLicenseImage && !customer.aadharCardImage && !customer.livePhoto && (
            <p className="text-sm text-slate-400">No documents uploaded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Customer Form Content Component
function CustomerFormContent({ 
  formData, 
  setFormData, 
  mode 
}: { 
  formData: CustomerFormData;
  setFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  mode: "create" | "edit" | "view";
}) {
  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <User className="h-5 w-5 mr-2" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="guardianName">Guardian Name *</Label>
            <Input
              id="guardianName"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              placeholder="Enter guardian name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianRelation">Relation to Guardian *</Label>
            <Select 
              value={formData.guardianRelation} 
              onValueChange={(value) => setFormData({ ...formData, guardianRelation: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S/o (Son of)">S/o (Son of)</SelectItem>
                <SelectItem value="D/o (Daughter of)">D/o (Daughter of)</SelectItem>
                <SelectItem value="W/o (Wife of)">W/o (Wife of)</SelectItem>
                <SelectItem value="H/o (Husband of)">H/o (Husband of)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation *</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Enter your occupation"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="residentialAddress">Residential Address *</Label>
          <Input
            id="residentialAddress"
            value={formData.residentialAddress}
            onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
            placeholder="Enter your complete residential address"
          />
        </div>
      </div>

      {/* License Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          License Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="drivingLicenseNumber">Driving License Number *</Label>
            <Input
              id="drivingLicenseNumber"
              value={formData.drivingLicenseNumber}
              onChange={(e) => setFormData({ ...formData, drivingLicenseNumber: e.target.value })}
              placeholder="Enter license number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseExpiryDate">License Expiry Date *</Label>
            <div className="relative">
              <Input
                id="licenseExpiryDate"
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="pr-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Document URLs Section (Optional) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <ImageIcon className="h-5 w-5 mr-2" />
          Document URLs (Optional)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enter URLs or file paths for uploaded documents
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="drivingLicenseImage">Driving License Image URL</Label>
            <Input
              id="drivingLicenseImage"
              value={formData.drivingLicenseImage}
              onChange={(e) => setFormData({ ...formData, drivingLicenseImage: e.target.value })}
              placeholder="uploads/driving-license.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadharCardImage">Aadhar Card Image URL</Label>
            <Input
              id="aadharCardImage"
              value={formData.aadharCardImage}
              onChange={(e) => setFormData({ ...formData, aadharCardImage: e.target.value })}
              placeholder="uploads/aadhar-card.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="livePhoto">Live Photo URL</Label>
            <Input
              id="livePhoto"
              value={formData.livePhoto}
              onChange={(e) => setFormData({ ...formData, livePhoto: e.target.value })}
              placeholder="uploads/live-photo.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
