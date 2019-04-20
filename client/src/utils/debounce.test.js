import { debounce } from './debounce'

describe('debounce', () => {
  it('debounced function should run only once within waiting time in immediate mode (third param)', () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100, true)
    debouncedFn()
    debouncedFn()
    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('debounced function should not run until waiting time finish in unimmediate mode (third param)', () => {
    const fn = jest.fn()
    const debouncedFn = debounce(fn, 100, false)
    jest.useFakeTimers();
    debouncedFn()
    debouncedFn()
    debouncedFn()
    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1)
    }, 100)
    expect(fn).toHaveBeenCalledTimes(0)
    jest.runAllTimers();
  })
})