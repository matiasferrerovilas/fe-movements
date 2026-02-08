import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useContext, useState } from "react";
import { Card, Col, Row, Steps, Typography } from "antd";
import IngresoOnBoarding from "../components/onboarding/IngresoOnBoarding";
import GrupoOnboarding from "../components/onboarding/GrupoOnboarding";
import {
  finishOnboarding,
  type OnboardingForm,
  type OnboardingIngresoForm,
} from "../apis/onboarding/OnBoarding";
import { useMutation } from "@tanstack/react-query";
import { onBoardingGuard } from "../apis/auth/onBoardingGuard";
import { useKeycloak } from "@react-keycloak/web";
import { AuthContext } from "../apis/auth/AuthContext";
import TipoOnboarding from "../components/onboarding/TipoOnboarding";
import { GroupEnum } from "../enums/GroupEnum";

const { Title, Text } = Typography;

export const Route = createFileRoute("/onboarding")({
  beforeLoad: onBoardingGuard,
  component: RouteComponent,
});

function RouteComponent() {
  const { keycloak } = useKeycloak();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingForm>>({});
  const router = useRouter();
  const { completeOnboarding } = useContext(AuthContext);

  const handleNext = (values: Partial<OnboardingForm>) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const finishMutation = useMutation({
    mutationFn: (onboardinForm: OnboardingForm) => {
      return finishOnboarding(onboardinForm);
    },
    onSuccess: async () => {
      console.debug("✅ Configiguracion Inicial cargada correctamente");
      try {
        await keycloak.updateToken(0);
      } catch (e) {
        console.error("❌ Error actualizando token", e);
      }
      router.invalidate;
      completeOnboarding();
      router.navigate({
        to: "/",
        replace: true,
      });
    },
    onError: (err) => {
      console.error("❌ Error cargando el movimiento", err);
    },
  });

  const steps = [
    {
      title: "Grupos",
      content: <GrupoOnboarding initialValues={formData} onNext={handleNext} />,
    },
    {
      title: "Tipo",
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
      content: (
        <IngresoOnBoarding
          initialValues={formData}
          onPrev={handlePrev}
          onNext={(values: OnboardingIngresoForm) => {
            const newGroups = (formData.accountsToAdd || []).filter(
              (g: string) => g && g.trim(),
            );
            if (!formData.userType) {
              console.error("UserType no definido");
              return;
            }
            if (newGroups.length === 0) {
              newGroups.push(GroupEnum.DEFAULT);
            }
            const selectedGroup = values.accountToAdd || newGroups[0];

            const finalData: OnboardingForm = {
              accountsToAdd: newGroups,
              userType: formData.userType,
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
        />
      ),
    },
  ];

  return (
    <Row justify="center">
      <Col xs={24} sm={18} md={14} lg={12}>
        <Card
          style={{
            margin: 20,
            paddingInline: 20,
            maxWidth: 900,
            maxHeight: "90vh",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <Title level={1}>Bienvenido!</Title>
            <Text type="secondary">
              Antes de comenzar configuremos tu cuenta
            </Text>
          </div>

          <Steps
            current={currentStep}
            items={steps.map((s) => ({ title: s.title }))}
            style={{ marginBottom: 40 }}
          />

          {steps[currentStep].content}
        </Card>
      </Col>
    </Row>
  );
}
