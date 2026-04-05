import { api } from "../axios";

export interface OnboardingBankEntry {
  description: string;
  isDefault: boolean;
}

export interface OnboardingForm {
  accountsToAdd: string[];
  userType: string;
  onBoardingAmount: OnBoardingIngreso;
  categoriesToAdd: string[];
  banksToAdd: OnboardingBankEntry[];
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
