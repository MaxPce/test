export interface Company {
  companyId: number;
  name: string;
  ruc?: string;
  logoUrl?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  sismasterPrefix?: string;
}

export interface CreateCompanyData {
  name: string;
  ruc?: string;
  logoUrl?: string;
  address?: string;
  sismasterPrefix?: string;
}

export interface UpdateCompanyData {
  name?: string;
  ruc?: string;
  logoUrl?: string;
  address?: string;
  sismasterPrefix?: string;
}
