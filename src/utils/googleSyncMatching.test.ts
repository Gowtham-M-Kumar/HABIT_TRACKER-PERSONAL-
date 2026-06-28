import test from 'node:test'
import assert from 'node:assert/strict'
import { findHabitMatch } from './googleSyncMatching.ts'

const habits = [
  { id: '1', name: 'Workout' },
  { id: '2', name: 'Read Book' },
] as Array<{ id: string; name: string }>

test('matches exact names', () => {
  assert.deepEqual(findHabitMatch('Workout', habits), habits[0])
})

test('matches fuzzy names above the sensitivity threshold', () => {
  assert.deepEqual(findHabitMatch('Morning Workout', habits), habits[0])
})

test('does not match unrelated names', () => {
  assert.equal(findHabitMatch('Buy Milk', habits), null)
})
