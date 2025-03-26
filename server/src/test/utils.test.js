import { arraysAreEqual } from "../lib/utils.js"

describe("utils", () => {
  describe("arraysAreEqual", () => {
    it("returns true when arrays are equal", () => {
      const array1 = [1, 2, 3]
      const array2 = [1, 2, 3]
      expect(arraysAreEqual(array1, array2)).toBe(true)
    })

    it("returns false when arrays are not equal", () => {
      const array1 = [1, 2, 3]
      const array2 = [1, 2, 4]
      expect(arraysAreEqual(array1, array2)).toBe(false)
    })

    it("returns false when arrays are different lengths", () => {
      const array1 = [1, 2, 3]
      const array2 = [1, 2, 3, 4]
      expect(arraysAreEqual(array1, array2)).toBe(false)
    })
  })
})
