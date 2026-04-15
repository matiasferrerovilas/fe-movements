import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Col, Row, Steps, Typography } from "antd";
import IngresoOnBoarding from "../components/onboarding/IngresoOnBoarding";
import WorkspaceOnboarding from "../components/onboarding/WorkspaceOnboarding";
import CategoriaOnboarding from "../components/onboarding/CategoriaOnboarding";
import BancoOnboarding from "../components/onboarding/BancoOnboarding";
import {
  finishOnboarding,
  type OnboardingForm,
  type OnboardingIngresoForm,
} from "../apis/onboarding/OnBoarding";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onBoardingGuard } from "../apis/auth/onBoardingGuard";
import { useKeycloak } from "@react-keycloak/web";
import TipoOnboarding from "../components/onboarding/TipoOnboarding";
import { WorkspaceEnum } from "../enums/WorkspaceEnum";
import { CURRENT_USER_QUERY_KEY, useCurrentUser } from "../apis/hooks/useCurrentUser";
import { getEntityLabels } from "../components/utils/entityLabels";

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
  const { data: currentUser } = useCurrentUser();
  const labels = getEntityLabels(currentUser?.userType ?? null);

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
      router.invalidate();
      router.navigate({ to: "/", replace: true });
    },
  });

  const steps = [
    {
      title: "Workspaces",
      description: "Organizá tus cuentas",
      content: <WorkspaceOnboarding initialValues={formData} onNext={handleNext} />,
    },
    {
      title: "Categorías",
      description: "Clasificá tus gastos",
      content: (
        <CategoriaOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ),
    },
    {
      title: "Bancos",
      description: "Tus entidades bancarias",
      content: (
        <BancoOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ),
    },
    {
      title: "Perfil",
      description: "Tipo de uso",
      content: (
        <TipoOnboarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      ),
    },
    {
      title: "Ingresos",
      description: "Saldo inicial",
      content: (
        <IngresoOnBoarding
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
              userType: formData.userType ?? "PERSONAL",
              categoriesToAdd: formData.categoriesToAdd ?? [],
              banksToAdd: formData.banksToAdd ?? [],
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
            <Title level={2} style={{ margin: 0 }}>Bienvenido</Title>
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
