import { 
  ApplicationBundleRequest, 
  ApplicationBundleResponse, 
  ApplicationBundleError,
  DynamicFormState,
  QuestionValidation,
  EligibilityQuestion,
  DynamicQuestionResponse
} from '@/lib/types/application-bundle'

/**
 * Cliente de Allstate (Enrollment API) para obtener el "ApplicationBundle".
 *
 * ### Responsabilidad principal
 * - Construye el payload `ApplicationBundleRequest` a partir de planes seleccionados (quoting) y datos del solicitante.
 * - Realiza el POST al endpoint de Allstate y retorna `ApplicationBundleResponse`.
 * - Provee utilidades para:
 *   - determinar visibilidad de preguntas dinámicas,
 *   - validar respuestas (incluyendo "knockout answers"),
 *   - combinar respuestas y calcular dependencias.
 *
 * ### Variables de entorno
 * - `ALLSTATE_ENROLLMENT_URL`: URL base del endpoint `ApplicationBundle`.
 * - `ALLSTATE_AUTH_TOKEN`: token Basic (string base64 tipo `usuario:password`).
 * - `ALLSTATE_AGENT_ID`: número/ID del agente enviado como `agentNumber`.
 *
 * Nota: Este archivo contiene `console.log`/`console.error` extensos para depuración.
 * En producción, conviene centralizar el logging y/o reducir PII/ruido.
 */
export class ApplicationBundleAPI {
  private baseURL: string
  private authToken: string
  private agentId: string

  /**
   * Inicializa el cliente usando variables de entorno y valores por defecto (QA).
   *
   * Importante: los valores por defecto apuntan a un ambiente QA y un token "de prueba".
   * Asegúrate de configurar variables de entorno correctas para otros ambientes.
   */
  constructor() {
    this.baseURL =
      process.env.ALLSTATE_ENROLLMENT_URL ||
      'https://qa1-ngahservices.ngic.com/EnrollmentApi/api/ApplicationBundle'
    this.authToken =
      process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ='
    this.agentId = process.env.ALLSTATE_AGENT_ID || '159208'
  }

  /**
   * Mapea datos de "quoting" a un `ApplicationBundleRequest`.
   *
   * ### Qué hace
   * - Deriva `planIds` y `planKeys` desde `selectedPlans`.
   * - Aplica mapeos manuales para ciertos productos (IDs específicos) conocidos.
   * - Elimina duplicados y valores vacíos (por seguridad ante data repetida).
   * - Calcula `rateTier` (básico) y `medSuppEnrollmentType` (solo si detecta plan Medicare/Med).
   *
   * ### Convenciones
   * - Si existe `plan.productCode`, se prefiere como `planId` (fallback a `plan.id`).
   * - Si existe `plan.planKey`, se prefiere como `planKey` (fallback a `plan.name`).
   *
   * @param selectedPlans Planes seleccionados en la cotización (estructura flexible / `any`).
   * @param state Estado (ej. "FL").
   * @param effectiveDate Fecha de vigencia.
   * @param dateOfBirth Fecha de nacimiento (para tier de tarifa).
   * @param isSmoker Indica tabaco (afecta rate tier).
   * @param hasHealthConditions Condiciones de salud declaradas (afecta rate tier).
   * @param weight Peso (para BMI).
   * @param heightFeet Estatura pies (para BMI).
   * @param heightInches Estatura pulgadas (para BMI).
   * @param hasPriorCoverage Cobertura previa (para Med Supp).
   * @param hasMedicare Medicare (para Med Supp).
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
    const planIds = selectedPlans.map((plan, index) => {
      console.log(`Mapeando plan ${index + 1} para planIds:`, {
        planId: plan.id,
        planName: plan.name,
        productCode: plan.productCode,
        hasProductCode: !!plan.productCode,
        willUse: plan.productCode || plan.id,
      })

      if (plan.id === '2144' && plan.name === 'Accident Fixed-Benefit') {
        console.log('Aplicando mapeo manual para Accident Fixed-Benefit')
        return '21673'
      }

      if (plan.id === 'Life50000' && plan.name === 'Life Only - Individual') {
        console.log('Aplicando mapeo manual para Life Only - Individual')
        return '21675'
      }

      if (plan.id === '2145' && plan.name === 'Life Insurance') {
        console.log('Aplicando mapeo manual para Life Insurance')
        return '21674'
      }

      if (plan.productCode) {
        console.log(`Usando productCode del plan: ${plan.productCode}`)
        return plan.productCode
      }

      console.log(`Usando ID como fallback: ${plan.id}`)
      return plan.id
    })

    const planKeys = selectedPlans.map((plan, index) => {
      console.log(`Mapeando plan ${index + 1} para planKeys:`, {
        planName: plan.name,
        planKey: plan.planKey,
        hasPlanKey: !!plan.planKey,
        willUse: plan.planKey || plan.name,
      })

      if (plan.id === '2144' && plan.name === 'Accident Fixed-Benefit') {
        console.log(
          'Aplicando mapeo manual de planKey para Accident Fixed-Benefit'
        )
        return 'Life 25000'
      }

      if (plan.id === 'Life50000' && plan.name === 'Life Only - Individual') {
        console.log(
          'Aplicando mapeo manual de planKey para Life Only - Individual'
        )
        return 'Life Only Premium'
      }

      if (plan.id === '2145' && plan.name === 'Life Insurance') {
        console.log('Aplicando mapeo manual de planKey para Life Insurance')
        return 'Life Insurance Premium'
      }

      if (plan.planKey) {
        console.log(`Usando planKey del plan: ${plan.planKey}`)
        return plan.planKey
      }

      console.log(`Usando name como fallback: ${plan.name}`)
      return plan.name
    })

    const memberCount = selectedPlans.length > 0 ? 1 : 0
    const termLengthInDays = 365
    const rateTier = this.calculateRateTier(
      dateOfBirth,
      isSmoker,
      hasHealthConditions,
      weight,
      heightFeet,
      heightInches
    )
    const medSuppEnrollmentType = this.determineMedSuppType(
      selectedPlans,
      dateOfBirth,
      hasPriorCoverage,
      hasMedicare
    )

    const uniquePlanIds = [
      ...new Set(planIds.filter((id) => id && id.toString().trim() !== '')),
    ]
    const uniquePlanKeys = [
      ...new Set(planKeys.filter((key) => key && key.toString().trim() !== '')),
    ]

    console.log('Validación de datos únicos:', {
      originalPlanIds: planIds,
      uniquePlanIds,
      originalPlanKeys: planKeys,
      uniquePlanKeys,
      hasDuplicates:
        uniquePlanIds.length !== planIds.length ||
        uniquePlanKeys.length !== planKeys.length,
    })

    const requestData = {
      state,
      planIds: uniquePlanIds,
      planKeys: uniquePlanKeys,
      effectiveDate,
      dateOfBirth,
      agentNumber: this.agentId,
      isEFulfillment: true,
      isFulfillment: true,
      paymentFrequency: 'Monthly',
      termLengthInDays,
      memberCount,
      rateTier,
      medSuppEnrollmentType,
      isTrioMedAme: false,
      isTrioMedCi: false,
      isBundledWithRecuro: false,
      isRenewalRider: false,
      userType: 'Individual',
      applicationFormNumber: `APP-${Date.now()}`,
    }

    console.log('Request data final:', requestData)

    console.log('Final mapping summary:', {
      originalPlans: selectedPlans.length,
      mappedPlanIds: uniquePlanIds,
      mappedPlanKeys: uniquePlanKeys,
      state,
      effectiveDate,
      memberCount,
      rateTier,
      medSuppEnrollmentType,
    })

    return requestData
  }

  /**
   * Calcula un `rateTier` simple basado en:
   * - tabaquismo,
   * - edad aproximada,
   * - BMI (si hay peso/altura),
   * - y condiciones de salud.
   *
   * Nota: la edad se calcula como diferencia de años (`year - year`) sin ajustar por mes/día.
   * Para reglas actuariales más estrictas, convendría un cálculo de edad exacta.
   *
   * @returns Uno de: `'PreferredSelect' | 'Preferred' | 'Tobacco' | 'Standard'`.
   */
  private calculateRateTier(
    dateOfBirth?: string,
    isSmoker?: boolean,
    hasHealthConditions?: boolean,
    weight?: number,
    heightFeet?: number,
    heightInches?: number
  ): string {
    if (!dateOfBirth) return 'Standard'

    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    if (isSmoker) return 'Tobacco'

    let bmi: number | null = null
    if (weight && heightFeet && heightInches !== undefined) {
      const heightInchesTotal = heightFeet * 12 + heightInches
      bmi = (weight / (heightInchesTotal * heightInchesTotal)) * 703
    }

    if (age >= 18 && age <= 40) {
      if (!hasHealthConditions && (!bmi || (bmi >= 18.5 && bmi <= 25))) {
        return 'PreferredSelect'
      }
      if (!hasHealthConditions && (!bmi || (bmi >= 18.5 && bmi <= 30))) {
        return 'Preferred'
      }
    }

    if (age >= 41 && age <= 55) {
      if (!hasHealthConditions && (!bmi || (bmi >= 18.5 && bmi <= 27))) {
        return 'Preferred'
      }
    }

    return 'Standard'
  }

  /**
   * Determina `medSuppEnrollmentType` para planes tipo Med/Medicare.
   *
   * ### Reglas actuales (simplificadas)
   * - Si no hay plan con "med"/"medicare" en el nombre: `undefined`.
   * - Si `hasMedicare`:
   *   - con `hasPriorCoverage`: `'GI'` (Guaranteed Issue).
   *   - en meses Oct-Dic: `'OpenEnrollment'`.
   *   - caso general: `'NoSpecialCircumstances'`.
   * - Si no `hasMedicare`: `'Unknown'` (placeholder / falta definición).
   */
  private determineMedSuppType(
    selectedPlans: any[],
    dateOfBirth?: string,
    hasPriorCoverage?: boolean,
    hasMedicare?: boolean
  ): string | undefined {
    const hasMedPlan = selectedPlans.some(
      (plan) =>
        plan.name?.toLowerCase().includes('med') ||
        plan.name?.toLowerCase().includes('medicare')
    )

    if (!hasMedPlan) return undefined

    if (hasMedicare) {
      if (hasPriorCoverage) {
        return 'GI'
      }

      const today = new Date()
      const month = today.getMonth() + 1

      if (month >= 10 && month <= 12) {
        return 'OpenEnrollment'
      }

      return 'NoSpecialCircumstances'
    }

    return 'Unknown'
  }

  /**
   * Ejecuta la llamada al endpoint de Allstate `ApplicationBundle`.
   *
   * ### Flujo
   * - Construye `requestData` vía `mapQuotingDataToApplicationBundle`.
   * - Envía `POST` JSON con `Authorization: Basic <token>`.
   * - Timeout: 60s (`AbortSignal.timeout(60000)`).
   * - Si el response no es OK, intenta parsear el body como `ApplicationBundleError[]`;
   *   si falla, propaga el texto sin parsear.
   *
   * @throws Error con un mensaje enriquecido al fallar la petición o el parseo.
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
      )

      console.log('Sending request to ApplicationBundle API:', {
        url: this.baseURL,
        requestData,
        authToken: this.authToken ? 'Present' : 'Missing',
        agentId: this.agentId,
      })

      console.log('ApplicationBundle Request Details:', {
        selectedPlans,
        state,
        effectiveDate,
        dateOfBirth,
        mappedRequest: requestData,
      })

      console.log('ApplicationBundle Critical Fields:', {
        planIds: requestData.planIds,
        planKeys: requestData.planKeys,
        state: requestData.state,
        effectiveDate: requestData.effectiveDate,
        agentNumber: requestData.agentNumber,
      })

      console.log('ApplicationBundle Multiple Plans Analysis:', {
        totalPlans: selectedPlans.length,
        mappedPlanIds: requestData.planIds,
        mappedPlanKeys: requestData.planKeys,
        originalPlans: selectedPlans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          productCode: plan.productCode,
          planKey: plan.planKey,
          hasProductCode: !!plan.productCode,
          hasPlanKey: !!plan.planKey,
        })),
      })

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.authToken}`,
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(60000),
      })

      console.log(
        'ApplicationBundle API Response Status:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ApplicationBundle API Error Response:', errorText)

        try {
          const errorData: ApplicationBundleError[] = JSON.parse(errorText)
          throw new Error(
            `ApplicationBundle API error: ${response.status} ${response.statusText} - ${JSON.stringify(
              errorData
            )}`
          )
        } catch {
          throw new Error(
            `ApplicationBundle API error: ${response.status} ${response.statusText} - ${errorText}`
          )
        }
      }

      const data: ApplicationBundleResponse = await response.json()

      console.log('ApplicationBundle API Response:', data)

      return data
    } catch (error) {
      console.error('Error fetching ApplicationBundle:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to fetch ApplicationBundle: ${error.message}`)
      }
      throw new Error('Failed to fetch ApplicationBundle')
    }
  }

  /**
   * Valida respuestas contra un conjunto de preguntas (posiblemente filtradas por visibilidad).
   *
   * - **Requeridas**: si una pregunta requerida y visible no tiene respuesta, se agrega error.
   * - **Knockout**: si una respuesta coincide con un `possibleAnswer.isKnockout`, marca "knockout".
   * - **UX de errores**: puede ocultar `errors` hasta que:
   *   - el usuario interactúe (`hasUserInteracted`), o
   *   - exista intento previo en un conjunto de `questionIdsWithAttempts`.
   *
   * @param questions Preguntas de elegibilidad.
   * @param responses Respuestas del usuario.
   * @param visibleQuestionIds Si se provee, valida solo las visibles.
   * @param hasUserInteracted Controla cuándo mostrar errores.
   * @param questionIdsWithAttempts Preguntas que el usuario ya tocó/intentó.
   */
  validateQuestionResponses(
    questions: EligibilityQuestion[],
    responses: DynamicQuestionResponse[],
    visibleQuestionIds?: number[],
    hasUserInteracted?: boolean,
    questionIdsWithAttempts?: number[]
  ): QuestionValidation {
    const errors: string[] = []
    // `knockoutAnswers` se interpreta como IDs de preguntas con una respuesta "knockout"
    // (esto coincide con el uso en `components/dynamic-questions-form.tsx`).
    const knockoutQuestionIds = new Set<number>()

    const questionsToValidate = visibleQuestionIds
      ? questions.filter((q) => visibleQuestionIds.includes(q.questionId))
      : questions

    questionsToValidate.forEach((question) => {
      const response = responses.find(
        (r) => r.questionId === question.questionId
      )
      const isVisible = visibleQuestionIds
        ? visibleQuestionIds.includes(question.questionId)
        : true

      // Algunas integraciones pueden incluir `isRequired`; si no existe, asumimos requerido por defecto.
      const isRequired = (question as any)?.isRequired ?? true
      const responseValue = (response as any)?.response

      if (
        isVisible &&
        isRequired &&
        (!responseValue || (typeof responseValue === 'string' && !responseValue.trim()))
      ) {
        // Debe incluir "Question {id}" para que la UI pueda detectar el error con `includes(...)`.
        errors.push(`Question ${question.questionId} is required`)
      }

      // Knockout detection:
      // - Forma preferida: `response.response` contiene un ID de respuesta (string) para Radio/Checkbox.
      // - Forma legacy: `response.answerIds` puede existir en integraciones antiguas.
      if (isVisible && response) {
        const answerIdsFromLegacy = (response as any)?.answerIds
        const raw =
          typeof responseValue === 'string'
            ? responseValue
            : responseValue != null
              ? String(responseValue)
              : ''

        const selectedIds: number[] =
          answerIdsFromLegacy != null
            ? (Array.isArray(answerIdsFromLegacy)
                ? answerIdsFromLegacy
                : [answerIdsFromLegacy]
              ).filter((v: any) => typeof v === 'number')
            : raw
                .split(',')
                .map((s) => parseInt(s.trim(), 10))
                .filter((n) => Number.isFinite(n))

        selectedIds.forEach((answerId) => {
          const possibleAnswer = question.possibleAnswers?.find(
            (answer) => answer.id === answerId
          )
          const isKnockOut =
            (possibleAnswer as any)?.isKnockOut ?? (possibleAnswer as any)?.isKnockout

          if (isKnockOut) {
            knockoutQuestionIds.add(question.questionId)
          }
        })
      }
    })

    const shouldShowError =
      hasUserInteracted ||
      (questionIdsWithAttempts &&
        questionIdsWithAttempts.some((id) =>
          errors.some((error) => error.includes(`Question ${id}`))
        ))

    return {
      isValid: errors.length === 0,
      errors: shouldShowError ? errors : [],
      knockoutAnswers: Array.from(knockoutQuestionIds),
    }
  }

  /**
   * Calcula qué preguntas son visibles/ocultas según `questionVisibilityRules`.
   *
   * ### Modelo de reglas
   * Para una pregunta con reglas, se considera visible si **todas** las reglas se cumplen:
   * - Si no hay respuestas previas:
   *   - visible cuando `!rule.isDefaultHidden`.
   * - Si existe respuesta a la pregunta dependiente:
   *   - visible cuando el `answerIds` del dependiente incluye alguno de `rule.values`.
   *
   * @returns Listas separadas de `visibleQuestionIds`, `hiddenQuestionIds`,
   *          y `questionIdsWithAttempts` (respuestas existentes).
   */
  getVisibleQuestions(
    formState: DynamicFormState,
    previousResponses?: DynamicQuestionResponse[]
  ): {
    visibleQuestionIds: number[]
    hiddenQuestionIds: number[]
    questionIdsWithAttempts: number[]
  } {
    const visibleQuestionIds: number[] = []
    const hiddenQuestionIds: number[] = []
    const questionIdsWithAttempts: number[] = []

    const sections = formState.questionSections || []

    sections.forEach((section: any) => {
      section.questions.forEach((question: any) => {
        const questionId = question.questionId
        const response = previousResponses?.find(
          (r) => r.questionId === questionId
        )

        if (response) {
          questionIdsWithAttempts.push(questionId)
        }

        if (!question.questionVisibilityRules?.length) {
          visibleQuestionIds.push(questionId)
          return
        }

        const isVisible = question.questionVisibilityRules.every((rule: any) => {
          if (!previousResponses?.length) {
            return !rule.isDefaultHidden
          }

          const dependentResponse = previousResponses.find(
            (r) => r.questionId === rule.questionId
          )

          if (!dependentResponse) {
            return !rule.isDefaultHidden
          }

          const depAnswerIds = (dependentResponse as any)?.answerIds
          const depRaw = (dependentResponse as any)?.response

          return rule.values?.some((value: any) => {
            if (Array.isArray(depAnswerIds)) {
              return depAnswerIds.includes(value)
            }
            if (typeof depAnswerIds === 'number') return depAnswerIds === value
            if (typeof depRaw === 'string') return depRaw === String(value)
            return false
          })
        })

        if (isVisible) {
          visibleQuestionIds.push(questionId)
        } else {
          hiddenQuestionIds.push(questionId)
        }
      })
    })

    return {
      visibleQuestionIds,
      hiddenQuestionIds,
      questionIdsWithAttempts,
    }
  }

  /**
   * Crea un `DynamicFormState` consolidado a partir de aplicaciones devueltas por Allstate.
   *
   * Convención actual:
   * - Se toma `applications[0]` como "primary application".
   * - Se concatenan las preguntas de todas las secciones (`questionSections`) en `questions`.
   *
   * @throws Error si no hay aplicaciones.
   */
  createDynamicFormState(applications: any[]): DynamicFormState {
    if (!applications?.length) {
      throw new Error('No applications provided for dynamic form state.')
    }

    const primaryApplication = applications[0]
    
    // Combinar todas las preguntas de elegibilidad de todas las secciones
    const allQuestions: EligibilityQuestion[] = []
    const sections = primaryApplication.questionSections || []
    
    sections.forEach((section: any) => {
      if (section.questions && Array.isArray(section.questions)) {
        allQuestions.push(...section.questions)
      }
    })

    console.log('📋 createDynamicFormState:', {
      applicationsCount: applications.length,
      sectionsCount: sections.length,
      totalQuestions: allQuestions.length,
      sections: sections.map((s: any) => ({
        sectionName: s.sectionName,
        questionsCount: s.questions?.length || 0
      }))
    })

    return {
      questions: allQuestions,
      questionSections: sections,
      responses: [],
      hasKnockoutAnswers: false,
      knockoutAnswers: []
    }
  }

  /**
   * Combina respuestas existentes con nuevas respuestas, por `questionId`.
   * Las `newResponses` sobrescriben a las existentes si comparten `questionId`.
   */
  mergeResponses(
    existingResponses: DynamicQuestionResponse[],
    newResponses: DynamicQuestionResponse[]
  ): DynamicQuestionResponse[] {
    const responseMap = new Map<number, DynamicQuestionResponse>()

    existingResponses.forEach((response) => {
      responseMap.set(response.questionId, response)
    })

    newResponses.forEach((response) => {
      responseMap.set(response.questionId, response)
    })

    return Array.from(responseMap.values())
  }

  /**
   * Construye un grafo de dependencias de visibilidad:
   * `questionIdDependencia -> [questionIdDependiente1, ...]`.
   *
   * Útil para invalidar/limpiar respuestas de preguntas que dependen de otra,
   * cuando cambia la respuesta en la dependencia.
   */
  buildVisibilityGraph(formState: DynamicFormState): Map<number, number[]> {
    const graph = new Map<number, number[]>()

    formState.questionSections?.forEach((section: any) => {
      section.questions.forEach((question: any) => {
        if (question.questionVisibilityRules?.length) {
          question.questionVisibilityRules.forEach((rule: any) => {
            const dependencies = graph.get(rule.questionId) || []
            if (!dependencies.includes(question.questionId)) {
              dependencies.push(question.questionId)
            }
            graph.set(rule.questionId, dependencies)
          })
        }
      })
    })

    return graph
  }

  /**
   * Obtiene todas las preguntas dependientes (directas y transitivas) de una pregunta.
   *
   * Incluye protección contra ciclos mediante `visited`.
   *
   * @param questionId ID de la pregunta raíz.
   * @param graph Grafo construido por `buildVisibilityGraph`.
   * @returns IDs de preguntas dependientes (sin duplicados).
   */
  getDependentQuestions(
    questionId: number,
    graph: Map<number, number[]>,
    visited = new Set<number>()
  ): number[] {
    if (visited.has(questionId)) {
      return []
    }

    visited.add(questionId)
    const directDependents = graph.get(questionId) || []
    const allDependents = new Set<number>(directDependents)

    directDependents.forEach((dependent) => {
      this.getDependentQuestions(dependent, graph, visited).forEach((id) =>
        allDependents.add(id)
      )
    })

    return Array.from(allDependents)
  }
}

export const applicationBundleAPI = new ApplicationBundleAPI()

