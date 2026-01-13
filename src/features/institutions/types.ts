import type { Gender, TeamRole, CategoryType } from "@/lib/types/common.types";

export interface Institution {
  institutionId: number;
  name: string;
  abrev: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstitutionData {
  name: string;
  abrev: string;
  logoUrl?: string;
}

export interface UpdateInstitutionData {
  name?: string;
  abrev?: string;
  logoUrl?: string;
}

export interface Athlete {
  athleteId: number;
  institutionId: number;
  name: string;
  dateBirth: string;
  gender: Gender;
  nationality: string;
  photoUrl?: string;
  docNumber?: string;
  createdAt: string;
  updatedAt: string;
  institution?: Institution;
}

export interface CreateAthleteData {
  institutionId: number;
  name: string;
  dateBirth: string;
  gender: Gender;
  nationality: string;
  photoUrl?: string;
  docNumber?: string;
}

export interface UpdateAthleteData {
  institutionId?: number;
  name?: string;
  dateBirth?: string;
  gender?: Gender;
  nationality?: string;
  photoUrl?: string;
  docNumber?: string;
}

export interface Team {
  teamId: number;
  name: string;
  institutionId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  institution?: Institution;
  category?: {
    categoryId: number;
    name: string;
    sport?: {
      name: string;
    };
  };
  members?: TeamMember[];
}

export interface TeamMember {
  athleteId: number;
  teamId: number;
  rol: TeamRole;
  athlete?: Athlete;
}

export interface CreateTeamData {
  name: string;
  institutionId: number;
  categoryId: number;
}

export interface UpdateTeamData {
  name?: string;
  institutionId?: number;
  categoryId?: number;
}

export interface AddTeamMemberData {
  athleteId: number;
  rol: TeamRole;
}

export interface UpdateTeamMemberRoleData {
  rol: TeamRole;
}
