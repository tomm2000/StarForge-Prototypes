import { seededRandom } from "three/src/math/MathUtils"

export type Chance<T> = {
  value: T,
  chance: number
}

function randomWeighted<T>(chance_array: Chance<T>[], seed: number): T {
  let total = 0
  chance_array.forEach(el => total += el.chance)

  let rng = seededRandom(seed) * total

  let current = 0

  for(let c of chance_array) {
    current += c.chance

    if(current > rng) { return c.value }
  }

  throw 'error calculating random element'
}

const NUMBER_OF_PLANETS: Chance<number>[] = [
  {value: 1,  chance: 4},
  {value: 2,  chance: 6},
  {value: 3,  chance: 12},
  {value: 4,  chance: 18},
  {value: 5,  chance: 18},
  {value: 6,  chance: 10},
  {value: 7,  chance: 7},
  {value: 8,  chance: 5},
  {value: 9,  chance: 2},
  {value: 10, chance: 1},
]

export function get_random_planet_amount(seed: number): number {
  return randomWeighted(NUMBER_OF_PLANETS, seed)
}

const NUMBER_OF_MOONS: Chance<number>[] = [
  {value: 0,  chance: 20},
  {value: 1,  chance: 16},
  {value: 2,  chance: 10},
  {value: 3,  chance: 6},
  {value: 4,  chance: 2},
  {value: 5,  chance: 1},
]

export function get_random_moon_amount(seed: number): number {
  return randomWeighted(NUMBER_OF_MOONS, seed)
}