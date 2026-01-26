/**
 * Funciones auxiliares para manejo de fechas
 * 
 * Estas funciones ayudan a formatear y parsear fechas sin problemas
 * de zona horaria, asegurando que las fechas se manejen localmente.
 */

/**
 * Formatea una fecha a string YYYY-MM-DD sin problemas de zona horaria
 * @param date - Fecha a formatear
 * @returns String en formato YYYY-MM-DD
 */
export const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parsea un string YYYY-MM-DD como fecha local (no UTC)
 * @param dateString - String en formato YYYY-MM-DD
 * @returns Objeto Date local
 */
export const parseDateLocal = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month es 0-indexed
}

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param birthDate - Fecha de nacimiento
 * @returns Edad en años
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Obtiene una fecha futura (N meses desde hoy)
 * @param months - Número de meses en el futuro
 * @returns Objeto Date
 */
export const getFutureDate = (months: number = 1): Date => {
  const futureDate = new Date()
  futureDate.setMonth(futureDate.getMonth() + months)
  return futureDate
}
