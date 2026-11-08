import { describe, expect, it } from 'vitest'
import { fitWithin, MAX_SIDE } from './imageResize'

describe('fitWithin', () => {
  it('reduz pelo lado maior, mantendo a proporção', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: MAX_SIDE, height: 1536 })
    expect(fitWithin(3000, 6000)).toEqual({ width: 1024, height: MAX_SIDE })
  })

  it('não aumenta foto pequena', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 })
  })

  it('aceita outro limite', () => {
    expect(fitWithin(1000, 1000, 500)).toEqual({ width: 500, height: 500 })
  })
})
