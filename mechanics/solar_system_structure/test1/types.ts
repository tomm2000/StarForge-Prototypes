export type System = {
  seed: string,
  star: Star
  planets: Planet[]
}

export type Star = {
  mass: number
}

export type Planet = {
  mass: number,
  orbit: Orbit,
  moons: Moon[],
  type: 'ice' | 'hot'
}

export type Moon = {
  mass: number,
  orbit: Orbit
}

export type Orbit = {

}