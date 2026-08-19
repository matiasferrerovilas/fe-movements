import { api } from "@/apis/axios";
import type { UserTypeEnum } from "@/enums/UserTypeEnum";

export interface OnboardingBankEntry {
  description: string;
  isDefault: boolean;
}

export interface OnboardingCurrencyEntry {
  symbol: string;
  description: string;
}

export interface OnboardingWorkspaceEntry {
  name: string;
  isDefault: boolean;
}

export interface OnboardingForm {
  workspacesToAdd: OnboardingWorkspaceEntry[];
  userType: UserTypeEnum;
  onBoardingAmount: OnBoardingIngreso;
  categoriesToAdd: string[];
  banksToAdd: OnboardingBankEntry[];
  currenciesToAdd: OnboardingCurrencyEntry[];
}

export interface OnBoardingIngreso {
  amount: number;
  bank: string;
  accountToAdd: string;
  currency: string;
}

export interface OnboardingIngresoForm {
  bank: string;
  currency: string;
  accountToAdd: string;
  amount: number;
  userType: string;
}

export async function finishOnboarding(form: OnboardingForm) {
  return api
    .post("/onboarding", form)
    .then((response) => response.data)
    .catch((error) => {
      throw error;
    });
}
