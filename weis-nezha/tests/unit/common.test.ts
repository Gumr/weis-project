import { cloneDeep } from '../../src/utils/common';

test('clone deep', () => {
  const obj1 = {
    a: 1,
    ary: [1, '2', {
      b: 2
    }]
  }
  const obj2 = cloneDeep(obj1)

  expect(obj1 === obj2).toBe(false)
  expect(obj2).toEqual({
    a: 1,
    ary: [1, '2', {
      b: 2
    }]
  })
});

test('date clone deep', () => {
  const d = new Date()
  const obj1 = {
    a: 1,
    d,
    ary: [1, '2', {
      b: 2
    }]
  }
  const obj2 = cloneDeep(obj1)

  expect(obj1 === obj2).toBe(false)
  expect(obj2).toEqual({
    a: 1,
    d,
    ary: [1, '2', {
      b: 2
    }]
  })
});