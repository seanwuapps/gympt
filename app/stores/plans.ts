import { defineStore } from 'pinia'
import type { TrainingPlan } from '~/db/schema'

export const usePlansStore = defineStore('plans', () => {
  // State
  const plans = ref<TrainingPlan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activePlan = computed(() => {
    return plans.value.find(plan => plan.isActive) || null
  })

  const inactivePlans = computed(() => {
    return plans.value.filter(plan => !plan.isActive)
  })

  const hasActivePlan = computed(() => {
    return activePlan.value !== null
  })

  const activePlanDetails = computed(() => {
    if (!activePlan.value) return null

    const plan = activePlan.value
    const schedule = plan.weeklySchedule as Record<string, Record<string, string>>
    
    return {
      ...plan,
      totalWeeks: plan.durationWeeks,
      weeklySchedule: schedule
    }
  })

  // Actions
  async function fetchPlans() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; plans: TrainingPlan[] }>('/api/plans')
      
      if (response.success) {
        plans.value = response.plans
        
        // Auto-activate if there's exactly one plan and no active plan
        await autoActivateSinglePlan()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch training plans'
      console.error('Error fetching plans:', err)
    } finally {
      loading.value = false
    }
  }

  async function autoActivateSinglePlan() {
    // Only auto-activate if there's exactly 1 plan and no active plan
    if (plans.value.length === 1 && !hasActivePlan.value) {
      const singlePlan = plans.value[0]
      try {
        await setActivePlan(singlePlan.id)
        return true
      } catch (err) {
        console.error('Failed to auto-activate plan:', err)
        return false
      }
    }
    return false
  }

  async function generatePlan() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; plan: TrainingPlan }>('/api/plans/generate', {
        method: 'POST'
      })

      if (response.success && response.plan) {
        plans.value.push(response.plan)
        
        // Auto-activate if this is the only plan
        await autoActivateSinglePlan()
        
        return response.plan
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to generate training plan'
      console.error('Error generating plan:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setActivePlan(planId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; plan: TrainingPlan }>(`/api/plans/${planId}`, {
        method: 'PATCH',
        body: { isActive: true }
      })

      if (response.success && response.plan) {
        // Update local state
        plans.value = plans.value.map(plan => ({
          ...plan,
          isActive: plan.id === planId
        }))
        return response.plan
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to set active plan'
      console.error('Error setting active plan:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePlan(planId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean }>(`/api/plans/${planId}`, {
        method: 'DELETE'
      })

      if (response.success) {
        // Remove from local state
        plans.value = plans.value.filter(plan => plan.id !== planId)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete training plan'
      console.error('Error deleting plan:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getPlanById(planId: string) {
    try {
      const response = await $fetch<{ success: boolean; plan: TrainingPlan }>(`/api/plans/${planId}`)
      
      if (response.success) {
        return response.plan
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch plan'
      console.error('Error fetching plan:', err)
      throw err
    }
  }

  interface DaySuggestion {
    modality: string
    rationale: string
    icon: string
  }

  async function generateDayPlanSuggestions(planId: string, week: string, day: string) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; suggestions: DaySuggestion[] }>(
        `/api/plans/${planId}/suggest-day`,
        {
          method: 'POST',
          body: { week, day }
        }
      )

      if (response.success && response.suggestions) {
        return response.suggestions
      }

      throw new Error('Failed to generate suggestions')
    } catch (err: any) {
      error.value = err.message || 'Failed to generate day suggestions'
      console.error('Error generating day suggestions:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePlanDay(planId: string, week: string, day: string, modality: string) {
    loading.value = true
    error.value = null

    // Store original plan for rollback
    const originalPlans = JSON.parse(JSON.stringify(plans.value))

    try {
      // Optimistic update
      const planIndex = plans.value.findIndex((p: TrainingPlan) => p.id === planId)
      if (planIndex !== -1) {
        const plan = plans.value[planIndex]
        const weeklySchedule = JSON.parse(JSON.stringify(plan.weeklySchedule)) as Record<string, Record<string, string>>
        
        if (weeklySchedule[week] && weeklySchedule[week][day]) {
          weeklySchedule[week][day] = modality
          plans.value[planIndex] = {
            ...plan,
            weeklySchedule,
            updatedAt: new Date()
          }
        }
      }

      // Make API call
      const response = await $fetch<{ success: boolean; plan: TrainingPlan }>(
        `/api/plans/${planId}`,
        {
          method: 'PATCH',
          body: { week, day, modality }
        }
      )

      if (response.success && response.plan) {
        // Update with server response
        const planIndex = plans.value.findIndex((p: TrainingPlan) => p.id === planId)
        if (planIndex !== -1) {
          plans.value[planIndex] = response.plan
        }
        return response.plan
      }

      throw new Error('Failed to update plan day')
    } catch (err: any) {
      // Rollback on error
      plans.value = originalPlans
      error.value = err.message || 'Failed to update plan day'
      console.error('Error updating plan day:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    plans,
    loading,
    error,
    // Computed
    activePlan,
    inactivePlans,
    hasActivePlan,
    activePlanDetails,
    // Actions
    fetchPlans,
    generatePlan,
    setActivePlan,
    deletePlan,
    getPlanById,
    autoActivateSinglePlan,
    generateDayPlanSuggestions,
    updatePlanDay
  }
})
