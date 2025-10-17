import { 
  ApplicationBundleRequest, 
  ApplicationBundleResponse, 
  ApplicationBundleError,
  DynamicFormState,
  QuestionValidation,
  EligibilityQuestion,
  DynamicQuestionResponse
} from '@/lib/types/application-bundle';

/**
 * ApplicationBundle API Client
 * 
 * Cliente para interactuar con el endpoint ApplicationBundle de NGIC.
 * Este endpoint es crítico para obtener las preguntas dinámicas antes del enrollment.
 */
export class ApplicationBundleAPI {
  private baseURL: string;
  private authToken: string;
  private agentId: string;

  constructor() {
    this.baseURL = process.env.ALLSTATE_ENROLLMENT_URL || 'https://qa1-ngahservices.ngic.com/EnrollmentApi/api/ApplicationBundle';
    this.authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ=';
    this.agentId = process.env.ALLSTATE_AGENT_ID || '159208';
  }

  /**
   * Mapea los datos del Quoting API al formato requerido por ApplicationBundle
   */
  private mapQuotingDataToApplicationBundle(
    selectedPlans: any[],
    state: string,
    effectiveDate: string,
    dateOfBirth?: string,
    isSmoker?: boolean,
    hasHealthConditions?: boolean,
    weight?: number,
    heightFeet?: number,
    heightInches?: number,
    hasPriorCoverage?: boolean,
    hasMedicare?: boolean
  ): ApplicationBundleRequest {
    // Extraer productCode y planKey de los planes seleccionados
    const planIds = selectedPlans.map((plan, index) => {
      console.log(`Mapeando plan ${index + 1} para planIds:`, {
        planId: plan.id,
        planName: plan.name,
        productCode: plan.productCode,
        hasProductCode: !!plan.productCode,
        willUse: plan.productCode || plan.id
      });
      
      // Mapeo manual para planes conocidos sin productCode
      if (plan.id === "2144" && plan.name === "Accident Fixed-Benefit") {
        console.log('Aplicando mapeo manual para Accident Fixed-Benefit');
        return "21673"; // ProductCode para Life 25000 (plan que funciona)
      }
      
      // Mapeo para Life Only - Individual
      if (plan.id === "Life50000" && plan.name === "Life Only - Individual") {
        console.log('Aplicando mapeo manual para Life Only - Individual');
        return "21675"; // ProductCode para Life Only
      }
      
      // Agregar más mapeos manuales para otros planes conocidos
      if (plan.id === "2145" && plan.name === "Life Insurance") {
        console.log('Aplicando mapeo manual para Life Insurance');
        return "21674"; // ProductCode para Life Insurance
      }
      
      // Si el plan viene del Quoting API, usar productCode
      if (plan.productCode) {
        console.log(`Usando productCode del plan: ${plan.productCode}`);
        return plan.productCode;
      }
      
      // Si no, usar el ID como fallback
      console.log(`Usando ID como fallback: ${plan.id}`);
      return plan.id;
    });

    const planKeys = selectedPlans.map((plan, index) => {
      console.log(`Mapeando plan ${index + 1} para planKeys:`, {
        planName: plan.name,
        planKey: plan.planKey,
        hasPlanKey: !!plan.planKey,
        willUse: plan.planKey || plan.name
      });
      
      // Mapeo manual para planes conocidos sin planKey
      if (plan.id === "2144" && plan.name === "Accident Fixed-Benefit") {
        console.log('Aplicando mapeo manual de planKey para Accident Fixed-Benefit');
        return "Life 25000"; // PlanKey para Life 25000 (plan que funciona)
      }
      
      // Mapeo para Life Only - Individual
      if (plan.id === "Life50000" && plan.name === "Life Only - Individual") {
        console.log('Aplicando mapeo manual de planKey para Life Only - Individual');
        return "Life Only Premium"; // PlanKey para Life Only
      }
      
      // Agregar más mapeos manuales para otros planes conocidos
      if (plan.id === "2145" && plan.name === "Life Insurance") {
        console.log('Aplicando mapeo manual de planKey para Life Insurance');
        return "Life Insurance Premium"; // PlanKey para Life Insurance
      }
      
      // Si el plan viene del Quoting API, usar planKey
      if (plan.planKey) {
        console.log(`Usando planKey del plan: ${plan.planKey}`);
        return plan.planKey;
      }
      
      // Si no, usar el name como fallback
      console.log(`Usando name como fallback: ${plan.name}`);
      return plan.name;
    });

    // Calcular datos adicionales
    const memberCount = selectedPlans.length > 0 ? 1 : 0 // Por ahora solo el usuario principal
    const termLengthInDays = 365 // Término estándar de 1 año
    const rateTier = this.calculateRateTier(dateOfBirth, isSmoker, hasHealthConditions, weight, heightFeet, heightInches)
    const medSuppEnrollmentType = this.determineMedSuppType(selectedPlans, dateOfBirth, hasPriorCoverage, hasMedicare)

    // Validar que no tengamos valores duplicados o inválidos
    const uniquePlanIds = [...new Set(planIds.filter(id => id && id.toString().trim() !== ''))]
    const uniquePlanKeys = [...new Set(planKeys.filter(key => key && key.toString().trim() !== ''))]

    console.log('Validación de datos únicos:', {
      originalPlanIds: planIds,
      uniquePlanIds: uniquePlanIds,
      originalPlanKeys: planKeys,
      uniquePlanKeys: uniquePlanKeys,
      hasDuplicates: uniquePlanIds.length !== planIds.length || uniquePlanKeys.length !== planKeys.length
    })

    const requestData = {
      state,
      planIds: uniquePlanIds,
      planKeys: uniquePlanKeys,
      effectiveDate,
      dateOfBirth,
      agentNumber: this.agentId,
      isEFulfillment: true,
      isFulfillment: true, // Asumir true por defecto
      paymentFrequency: "Monthly", // Por defecto
      termLengthInDays,
      memberCount,
      rateTier,
      medSuppEnrollmentType,
      // Campos opcionales que no tenemos datos
      isTrioMedAme: false,
      isTrioMedCi: false,
      isBundledWithRecuro: false,
      isRenewalRider: false,
      userType: "Individual",
      applicationFormNumber: `APP-${Date.now()}` // Generar número único
    };

    console.log('Request data final:', requestData)
    
    // Log adicional para debugging
    console.log('Final mapping summary:', {
      originalPlans: selectedPlans.length,
      mappedPlanIds: uniquePlanIds,
      mappedPlanKeys: uniquePlanKeys,
      state,
      effectiveDate,
      memberCount,
      rateTier,
      medSuppEnrollmentType
    })

    return requestData;
  }

  /**
   * Calcula el rate tier basado en la edad, hábitos y salud
   * Valores válidos: Standard, Preferred, PreferredSelect, Tobacco
   */
  private calculateRateTier(
    dateOfBirth?: string, 
    isSmoker?: boolean, 
    hasHealthConditions?: boolean,
    weight?: number,
    heightFeet?: number,
    heightInches?: number
  ): string {
    if (!dateOfBirth) return "Standard"
    
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    
    // Si es fumador, usar Tobacco tier
    if (isSmoker) return "Tobacco"
    
    // Calcular BMI si tenemos peso y altura
    let bmi = null
    if (weight && heightFeet && heightInches !== undefined) {
      const heightInchesTotal = (heightFeet * 12) + heightInches
      bmi = (weight / (heightInchesTotal * heightInchesTotal)) * 703
    }
    
    // Lógica para Preferred/PreferredSelect basada en edad y salud
    if (age >= 18 && age <= 40) {
      // Adultos jóvenes sin problemas de salud
      if (!hasHealthConditions && (!bmi || (bmi >= 18.5 && bmi <= 25))) {
        return "PreferredSelect" // Excelente salud
      }
      if (!hasHealthConditions && (!bmi || (bmi >= 18.5 && bmi <= 30))) {
        return "Preferred" // Buena salud
      }
    }
    
    if (age >= 41 && age <= 55) {
      // Adultos maduros
      if (!hasHealthConditions && (!bmi || (bmi >= 18.5 && bmi <= 27))) {
        return "Preferred" // Buena salud para la edad
      }
    }
    
    // Por defecto, usar Standard
    return "Standard"
  }

  /**
   * Determina el tipo de Medicare Supplement basado en los planes y circunstancias
   * Valores válidos: Unknown, OpenEnrollment, GI, NoSpecialCircumstances
   */
  private determineMedSuppType(
    selectedPlans: any[], 
    dateOfBirth?: string,
    hasPriorCoverage?: boolean,
    hasMedicare?: boolean
  ): string | undefined {
    // Buscar planes que contengan "Med" o "Medicare" en el nombre
    const hasMedPlan = selectedPlans.some(plan => 
      plan.name?.toLowerCase().includes('med') || 
      plan.name?.toLowerCase().includes('medicare')
    )
    
    if (!hasMedPlan) return undefined
    
    // Si tiene Medicare, determinar el tipo de inscripción
    if (hasMedicare) {
      // Si tiene cobertura previa, podría ser Guaranteed Issue
      if (hasPriorCoverage) {
        return "GI" // Guaranteed Issue
      }
      
      // Verificar si está en período de inscripción abierta (ejemplo simplificado)
      const today = new Date()
      const month = today.getMonth() + 1 // 1-12
      
      // Período de inscripción abierta típicamente es Oct 15 - Dec 7
      if (month >= 10 && month <= 12) {
        return "OpenEnrollment"
      }
      
      // Fuera del período de inscripción abierta
      return "NoSpecialCircumstances"
    }
    
    // Si tiene planes Medicare pero no tiene Medicare activo
    return "Unknown"
  }

  /**
   * Obtiene las preguntas del ApplicationBundle API
   */
  async getApplicationBundle(
    selectedPlans: any[],
    state: string,
    effectiveDate: string,
    dateOfBirth?: string,
    isSmoker?: boolean,
    hasHealthConditions?: boolean,
    weight?: number,
    heightFeet?: number,
    heightInches?: number,
    hasPriorCoverage?: boolean,
    hasMedicare?: boolean
  ): Promise<ApplicationBundleResponse> {
    try {
      const requestData = this.mapQuotingDataToApplicationBundle(
        selectedPlans,
        state,
        effectiveDate,
        dateOfBirth,
        isSmoker,
        hasHealthConditions,
        weight,
        heightFeet,
        heightInches,
        hasPriorCoverage,
        hasMedicare
      );

      console.log('Sending request to ApplicationBundle API:', {
        url: this.baseURL,
        requestData,
        authToken: this.authToken ? 'Present' : 'Missing',
        agentId: this.agentId
      });

      // Log detallado de los datos de entrada
      console.log('ApplicationBundle Request Details:', {
        selectedPlans: selectedPlans,
        state,
        effectiveDate,
        dateOfBirth,
        mappedRequest: requestData
      });

      // Log específico de los campos críticos
      console.log('ApplicationBundle Critical Fields:', {
        planIds: requestData.planIds,
        planKeys: requestData.planKeys,
        state: requestData.state,
        effectiveDate: requestData.effectiveDate,
        agentNumber: requestData.agentNumber
      });

      // Log detallado para múltiples planes
      console.log('ApplicationBundle Multiple Plans Analysis:', {
        totalPlans: selectedPlans.length,
        mappedPlanIds: requestData.planIds,
        mappedPlanKeys: requestData.planKeys,
        originalPlans: selectedPlans.map(plan => ({
          id: plan.id,
          name: plan.name,
          productCode: plan.productCode,
          planKey: plan.planKey,
          hasProductCode: !!plan.productCode,
          hasPlanKey: !!plan.planKey
        }))
      });

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.authToken}`,
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      console.log('ApplicationBundle API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ApplicationBundle API Error Response:', errorText);
        
        // Intentar parsear como JSON para obtener errores estructurados
        try {
          const errorData: ApplicationBundleError[] = JSON.parse(errorText);
          throw new Error(`ApplicationBundle API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        } catch {
          throw new Error(`ApplicationBundle API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const data: ApplicationBundleResponse = await response.json();
      
      // Log the response for debugging
      console.log('ApplicationBundle API Response:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching ApplicationBundle:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch ApplicationBundle: ${error.message}`);
      }
      throw new Error('Failed to fetch ApplicationBundle');
    }
  }

  /**
   * Valida las respuestas del formulario dinámico
   */
  validateQuestionResponses(
    questions: EligibilityQuestion[],
    responses: DynamicQuestionResponse[],
    visibleQuestionIds?: number[],
    hasUserInteracted?: boolean,
    questionIdsWithAttempts?: number[]
  ): QuestionValidation {
    const errors: string[] = [];
    const knockoutAnswers: number[] = [];

    // Solo validar preguntas visibles si se proporcionan
    const questionsToValidate = visibleQuestionIds 
      ? questions.filter(q => visibleQuestionIds.includes(q.questionId))
      : questions;

    // Verificar que todas las preguntas visibles y requeridas tengan respuesta
    questionsToValidate.forEach(question => {
      const response = responses.find(r => r.questionId === question.questionId);
      
      // Solo validar si la pregunta es requerida
      if (!response || !response.response.trim()) {
        // Solo mostrar error si:
        // 1. El usuario ya interactuó con el formulario Y
        // 2. El usuario ha intentado responder esta pregunta específica
        if (hasUserInteracted && questionIdsWithAttempts?.includes(question.questionId)) {
          errors.push(`Question ${question.questionId} is required`);
        }
        return;
      }

      // Verificar si la respuesta es knockout
      const selectedAnswer = question.possibleAnswers.find(
        answer => answer.id.toString() === response.response || answer.answerText === response.response
      );

      if (selectedAnswer?.isKnockOut) {
        knockoutAnswers.push(question.questionId);
        errors.push(selectedAnswer.errorMessage || `Question ${question.questionId} answer disqualifies applicant`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      knockoutAnswers
    };
  }

  /**
   * Convierte las respuestas del formulario dinámico al formato de Enrollment API
   */
  mapResponsesToEnrollmentFormat(responses: DynamicQuestionResponse[]): any[] {
    return responses.map(response => ({
      questionId: response.questionId,
      response: response.response,
      dataKey: response.dataKey
    }));
  }

  /**
   * Crea el estado inicial del formulario dinámico
   */
  createDynamicFormState(applications: any[]): DynamicFormState {
    // Combinar todas las preguntas de todas las aplicaciones
    const allQuestions: EligibilityQuestion[] = [];
    
    applications.forEach(app => {
      if (app.eligibilityQuestions) {
        allQuestions.push(...app.eligibilityQuestions);
      }
      if (app.authorizations) {
        allQuestions.push(...app.authorizations);
      }
    });

    // Ordenar por sequenceNo
    allQuestions.sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0));

    return {
      questions: allQuestions,
      responses: [],
      hasKnockoutAnswers: false,
      knockoutErrors: []
    };
  }

  /**
   * Valida los datos antes de enviar al ApplicationBundle API
   */
  validateApplicationBundleRequest(
    selectedPlans: any[],
    state: string,
    effectiveDate: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!selectedPlans || selectedPlans.length === 0) {
      errors.push('At least one plan must be selected');
    }

    if (!state || state.length !== 2) {
      errors.push('State must be a valid 2-letter code');
    }

    if (!effectiveDate) {
      errors.push('Effective date is required');
    } else {
      const date = new Date(effectiveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        errors.push('Effective date must be today or later');
      }
    }

    // Validar que los planes tengan los campos requeridos
    selectedPlans.forEach((plan, index) => {
      // Para planIds: necesita productCode O id
      if (!plan.productCode && !plan.id) {
        errors.push(`Plan ${index + 1} is missing both productCode and id`);
      }
      // Para planKeys: necesita planKey O name
      if (!plan.planKey && !plan.name) {
        errors.push(`Plan ${index + 1} is missing both planKey and name`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const applicationBundleAPI = new ApplicationBundleAPI();
