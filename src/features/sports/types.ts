import type {
  FormatType,
  ResultType,
  Gender,
  CategoryType,
} from "@/lib/types/common.types";

export interface SportType {
  sportTypeId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSportTypeData {
  name: string;
  description?: string;
}

export interface UpdateSportTypeData {
  name?: string;
  description?: string;
}

export interface Sport {
  sportId: number;
  sportTypeId: number;
  name: string;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
  sportType?: SportType;
}

export interface CreateSportData {
  sportTypeId: number;
  name: string;
  iconUrl?: string;
}

export interface UpdateSportData {
  sportTypeId?: number;
  name?: string;
  iconUrl?: string;
}

export interface Category {
  categoryId: number;
  sportId: number;
  name: string;
  formatType: FormatType;
  resultType: ResultType;
  gender: Gender;
  weightMin?: number;
  weightMax?: number;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
  sport?: Sport;
}

export interface CreateCategoryData {
  sportId: number;
  name: string;
  formatType: FormatType;
  resultType: ResultType;
  gender: Gender;
  weightMin?: number;
  weightMax?: number;
  type: CategoryType;
}

export interface UpdateCategoryData {
  sportId?: number;
  name?: string;
  formatType?: FormatType;
  resultType?: ResultType;
  gender?: Gender;
  weightMin?: number;
  weightMax?: number;
  type?: CategoryType;
}
