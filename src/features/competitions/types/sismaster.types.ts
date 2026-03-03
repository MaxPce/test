export interface SportParam {
  idparam: number;
  code: number;
  name: string;
  idsport: number;
  athleteCount: number;
}

export interface AthleteSismaster {
  idacreditation: number;
  idevent: number;
  idsport: number;
  idinstitution: number;
  idperson: number;
  idparam: number;
  docnumber: string;
  firstname: string;
  lastname: string;
  surname: string;
  birthday: string;
  gender: 'M' | 'F';
  gender_text: string;
  fullName: string;
  age: number | null;
  photo: string | null;
  institutionName: string;
  institutionAbrev: string;
  institutionLogo: string | null;
  division_inscrita: string;
}
