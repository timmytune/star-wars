import { mocked } from 'ts-jest/utils'
import { cm_to_feet, feet_inches } from '../../src/helpers'
//jest.mock('../src/helpers')

test('direct', () => {
    let ret: feet_inches = cm_to_feet(4297)
    expect(ret.feet).toBe(141)
    expect(ret.inches).toBe(0)
  })
  