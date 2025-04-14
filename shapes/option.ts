import { createShape, metadata, Shape, ShapeDecodeError } from "../common/mod.ts"

export function option<SI, SO>($some: Shape<SI, SO>): Shape<SI | undefined, SO | undefined>
export function option<SI, SO, N>($some: Shape<SI, SO>, none: N): Shape<SI | N, SO | N>
export function option<SI, SO, N>($some: Shape<SI, SO>, none?: N): Shape<SI | N, SO | N> {
  return createShape({
    metadata: metadata("$.option", option<SI, SO, N>, $some, ...(none === undefined ? [] : [none!]) as [N]),
    staticSize: 1 + $some.staticSize,
    subEncode(buffer, value) {
      if ((buffer.array[buffer.index++] = +(value !== none))) {
        $some.subEncode(buffer, value as SI)
      }
    },
    subDecode(buffer) {
      switch (buffer.array[buffer.index++]) {
        case 0:
          return none as N
        case 1:
          return $some.subDecode(buffer)
        default:
          throw new ShapeDecodeError(this, buffer, "Option discriminant neither 0 nor 1")
      }
    },
    subAssert(assert) {
      if (assert.value === none) return
      $some.subAssert(assert)
    },
  })
}
