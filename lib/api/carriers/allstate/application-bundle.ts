import { 
  ApplicationBundleRequest, 
  ApplicationBundleResponse, 
  ApplicationBundleError,
  DynamicFormState,
  QuestionValidation,
  EligibilityQuestion,
  DynamicQuestionResponse
} from '@/lib/types/application-bundle'

export class ApplicationBundleAPI {
  private baseURL: string
  private authToken: string
  private agentId: string

  constructor() {
    this.baseURL =
      process.env.ALLSTATE_ENROLLMENT_URL ||
      'https://qa1-ngahservices.ngic.com/EnrollmentApi/api/ApplicationBundle'
    this.authToken =
      process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ='
    this.agentId = process.env.ALLSTATE_AGENT_ID || '159208'
  }

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

  validateQuestionResponses(
    questions: EligibilityQuestion[],
    responses: DynamicQuestionResponse[],
    visibleQuestionIds?: number[],
    hasUserInteracted?: boolean,
    questionIdsWithAttempts?: number[]
  ): QuestionValidation {
    const errors: string[] = []
    const knockoutAnswers: number[] = []

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

      if (!response && question.isRequired && isVisible) {
        errors.push(
          `La pregunta "${question.questionText}" es requerida y no tiene respuesta.`
        )
      }

      if (response) {
        const answerIds = Array.isArray(response.answerIds)
          ? response.answerIds
          : [response.answerIds]

        answerIds.forEach((answerId) => {
          const possibleAnswer = question.possibleAnswers?.find(
            (answer) => answer.answerId === answerId
          )
          if (possibleAnswer?.isKnockout) {
            knockoutAnswers.push(answerId)
          }
        })
      }
    })

    const shouldShowError =
      hasUserInteracted ||
      (questionIdsWithAttempts &&
        questionIdsWithAttempts.some((id) =>
          errors.some((error) =>
            error.includes(
              questions.find((q) => q.questionId === id)?.questionText || ''
            )
          )
        ))

    return {
      isValid: errors.length === 0,
      errors: shouldShowError ? errors : [],
      hasKnockoutAnswers: knockoutAnswers.length > 0,
      knockoutAnswers,
    }
  }

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

    sections.forEach((section) => {
      section.questions.forEach((question) => {
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

        const isVisible = question.questionVisibilityRules.every((rule) => {
          if (!previousResponses?.length) {
            return !rule.isDefaultHidden
          }

          const dependentResponse = previousResponses.find(
            (r) => r.questionId === rule.questionId
          )

          if (!dependentResponse) {
            return !rule.isDefaultHidden
          }

          return rule.values?.some((value) => {
            if (Array.isArray(dependentResponse.answerIds)) {
              return dependentResponse.answerIds.includes(value)
            }
            return dependentResponse.answerIds === value
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

  buildVisibilityGraph(formState: DynamicFormState): Map<number, number[]> {
    const graph = new Map<number, number[]>()

    formState.questionSections?.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.questionVisibilityRules?.length) {
          question.questionVisibilityRules.forEach((rule) => {
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

