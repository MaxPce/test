export type FieldType = "text" | "number" | "date" | "select";

export type FormatField = {
  id: number;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  formatId: number;
};

export type Format = {
  id: number;
  name: string;
  isActive: boolean;
  fields: FormatField[];
  createdAt: string;
  updatedAt: string;
};

export type CreateFormatPayload = {
  name: string;
  isActive?: boolean;
  fields?: Array<{
    label: string;
    type?: FieldType;
    required?: boolean;
    order?: number;
  }>;
};
