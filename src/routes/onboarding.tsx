import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Col, Row, Steps, Typography } from "antd";
import { useTranslation } from "react-i18next";
import IncomeOnboarding from "@/components/onboarding/IncomeOnboarding";
import WorkspaceOnboarding from "@/components/onboarding/WorkspaceOnboarding";
import CategoryOnboarding from "@/components/onboarding/CategoryOnboarding";
import BankOnboarding from "@/components/onboarding/BankOnboarding";
import CurrencyOnboarding from "@/components/onboarding/CurrencyOnboarding";
import {
  finishOnboarding,
  type OnboardingForm,
  type OnboardingIngresoForm,
} from "@/apis/onboarding/OnboardingApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onBoardingGuard } from "@/apis/auth/onBoardingGuard";
import { useKeycloak } from "@react-keycloak/web";
import UserTypeOnboarding from "@/components/onboarding/UserTypeOnboarding";
import { WorkspaceEnum } from "@/enums/WorkspaceEnum";
import { UserTypeEnum } from "@/enums/UserTypeEnum";
import { CURRENT_USER_QUERY_KEY } from "@/apis/hooks/useCurrentUser";
import { getEntityLabels } from "@/utils/entityLabels";

const { Title, Text } = Typography;

export const Route = createFileRoute("/onboarding")({
  beforeLoad: onBoardingGuard,
  component: RouteComponent,
});

function RouteComponent() {
  const { keycloak } = useKeycloak();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [formData, setFormData] = useState<Partial<OnboardingForm>>({});
  const router = useRouter();
  const { t } = useTranslation();
  const labels = getEntityLabels(formData.userType ?? null, t);

  const handleNext = (values: Partial<OnboardingForm>) => {
    setDirection("forward");
    setFormData((prev) => ({ ...prev, ...values }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setDirection("back");
    setCurrentStep((prev) => prev - 1);
  };

  const finishMutation = useMutation({
    mutationFn: (onboardingForm: OnboardingForm) => finishOnboarding(onboardingForm),
    onSuccess: async () => {
      try {
        await keycloak.updateToken(0);
      } catch {
        // token refresh no crítico, continuar igual
      }
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      // Actualizamos el contexto del router de forma síncrona antes de navegar:
      // si esperáramos a que el efecto de RouterWithAuth (App.tsx) detecte el
      // refetch de useCurrentUser, hay una carrera en la que el guard de "/"
      // todavía ve firstLogin=true y redirige de nuevo a /onboarding.
      router.update({
        context: {
          ...router.options.context,
          auth: { ...router.options.context.auth, firstLogin: false },
        },
      });
      router.navigate({ to: "/", replace: true });
    },
  });

  const steps = [
    {
      title: t("onboarding.steps.profileTitle"),
      description: t("onboarding.steps.profileDescription"),
      content: <UserTypeOnboarding initialValues={formData} onNext={handleNext} />,
    },
    {
      title: t("onboarding.steps.workspacesTitle"),
      description: t("onboarding.steps.workspacesDescription"),
      content: (
        <WorkspaceOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ),
    },
    {
      title: t("onboarding.steps.categoriesTitle"),
      description: t("onboarding.steps.categoriesDescription"),
      content: (
        <CategoryOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ),
    },
    {
      title: t("onboarding.steps.banksTitle"),
      description: t("onboarding.steps.banksDescription"),
      content: (
        <BankOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ),
    },
    {
      title: t("onboarding.steps.currencyTitle"),
      description: t("onboarding.steps.currencyDescription"),
      content: (
        <CurrencyOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ),
    },
    {
      title: t("onboarding.steps.incomeTitle"),
      description: t("onboarding.steps.incomeDescription"),
      content: (
        <IncomeOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onFinish={(values: OnboardingIngresoForm) => {
            const newGroups = (formData.accountsToAdd || []).filter(
              (g: string) => g && g.trim(),
            );
            if (newGroups.length === 0) {
              newGroups.push(WorkspaceEnum.DEFAULT);
            }
            const selectedGroup = values.accountToAdd || newGroups[0];

            const finalData: OnboardingForm = {
              accountsToAdd: newGroups,
              userType: formData.userType ?? UserTypeEnum.PERSONAL,
              categoriesToAdd: formData.categoriesToAdd ?? [],
              banksToAdd: formData.banksToAdd ?? [],
              currenciesToAdd: formData.currenciesToAdd ?? [],
              onBoardingAmount: {
                amount: values.amount,
                bank: values.bank,
                currency: values.currency,
                accountToAdd: selectedGroup,
              },
            };
            setFormData(finalData);
            finishMutation.mutate(finalData);
          }}
          isLoading={finishMutation.isPending}
        />
      ),
    },
  ];

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card
          style={{
            margin: 20,
            paddingInline: 20,
            maxWidth: 900,
            animation: "onboarding-card-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <Title level={2} style={{ margin: 0 }}>{t("onboarding.steps.welcomeTitle")}</Title>
            <Text type="secondary">
              {labels.onboardingBienvenida}
            </Text>
          </div>

          <Steps
            current={currentStep}
            items={steps.map((s) => ({ title: s.title, description: s.description }))}
            style={{ marginBottom: 40 }}
            size="small"
          />

          <div
            key={currentStep}
            className={direction === "forward" ? "step-enter-right" : "step-enter-left"}
          >
            {steps[currentStep].content}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
