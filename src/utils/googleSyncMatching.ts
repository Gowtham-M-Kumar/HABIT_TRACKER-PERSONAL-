import type { Habit } from '../store/habitStore'

function normalizeName(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ')
}

function tokenize(value: string): string[] {
  return normalizeName(value)
    .split(/\s+/)
    .filter(Boolean)
}

export function computeNameSimilarity(a: string, b: string): number {
  const normalizedA = normalizeName(a)
  const normalizedB = normalizeName(b)

  if (!normalizedA || !normalizedB) return 0
  if (normalizedA === normalizedB) return 1
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) return 0.95

  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  if (!tokensA.length || !tokensB.length) return 0

  const overlap = tokensA.filter((token) => tokensB.includes(token)).length
  const union = new Set([...tokensA, ...tokensB]).size
  if (union === 0) return 0

  return overlap / union
}

export function findHabitMatch(habitName: string, habits: Array<Pick<Habit, 'id' | 'name'>>, sensitivity = 0.65): Habit | null {
  const normalizedInput = normalizeName(habitName)
  if (!normalizedInput) return null

  for (const habit of habits) {
    const similarity = computeNameSimilarity(habitName, habit.name)
    if (similarity >= sensitivity) {
      return habit as Habit
    }
  }

  return null
}
