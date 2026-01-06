import { apiFetch } from "./api-client";

export interface CustomerData {
  _id: string;
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
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface CustomersResponse {
  customers: CustomerData[];
}

interface CustomerResponse {
  customer: CustomerData;
  message?: string;
}

// Fetch all customers (admin only)
export async function fetchCustomers(token: string): Promise<CustomerData[]> {
  const data = await apiFetch<CustomersResponse>("/api/admin/customers", { token });
  return data.customers || [];
}

// Get single customer by ID
export async function fetchCustomerById(customerId: string, token: string): Promise<CustomerData> {
  const data = await apiFetch<CustomerResponse>(`/api/admin/customers/${customerId}`, { token });
  return data.customer;
}

// Create new customer
export async function createCustomer(
  payload: {
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
  },
  token: string,
): Promise<{ message: string; customer: CustomerData }> {
  return apiFetch<{ message: string; customer: CustomerData }>("/api/admin/customers", {
    method: "POST",
    json: payload,
    token,
  });
}

// Update existing customer
export async function updateCustomer(
  customerId: string,
  payload: {
    fullName?: string;
    guardianName?: string;
    guardianRelation?: string;
    mobile?: string;
    email?: string;
    occupation?: string;
    residentialAddress?: string;
    drivingLicenseNumber?: string;
    licenseExpiryDate?: string;
    drivingLicenseImage?: string;
    aadharCardImage?: string;
    livePhoto?: string;
  },
  token: string,
): Promise<{ message: string; customer: CustomerData }> {
  return apiFetch<{ message: string; customer: CustomerData }>(`/api/admin/customers/${customerId}`, {
    method: "PUT",
    json: payload,
    token,
  });
}

// Delete customer
export async function deleteCustomer(customerId: string, token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/customers/${customerId}`, {
    method: "DELETE",
    token,
  });
}
