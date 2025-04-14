
import * as $ from "../../mod.ts"
import { assertEquals, testInvalid, testShape } from "../../test-util.ts"

testShape($.option($.str), ["HELLO!"])
testShape($.option($.u8), [1])
testShape($.option($.u32), [2 ** 32 - 1])
testShape($.option($.bool), [true, false, undefined])
testShape($.option($.str, null), ["hi", "low", null])

testInvalid($.option($.bool), [123])

Deno.test("nested option support", () => {
  // Create nested option shapes
  const $nestedOption = $.option($.option($.u8));
  const $nestedOptionWithCustomNone = $.option($.option($.str, null), undefined);
  
  // Test Some(Some(value))
  const someValue = 42;
  const encodedSomeSome = $nestedOption.encode(someValue);
  assertEquals(encodedSomeSome[0], 1); // Outer discriminant is 1 (Some)
  assertEquals(encodedSomeSome[1], 1); // Inner discriminant is 1 (Some)
  assertEquals(encodedSomeSome[2], someValue); // Value is preserved
  assertEquals($nestedOption.decode(encodedSomeSome), someValue); // Roundtrips correctly
  
  // Test Some(None)
  const encodedSomeNone = new Uint8Array([1, 0]); // Manually create Some(None)
  assertEquals($nestedOption.decode(encodedSomeNone), undefined); // Decodes to undefined
  
  // Test None
  const encodedNone = new Uint8Array([0]); // Just outer None
  assertEquals($nestedOption.decode(encodedNone), undefined); // Decodes to undefined
})

// Add more comprehensive tests for nested options
Deno.test("nested option with values", () => {
  // Test with u8
  const $nestedU8 = $.option($.option($.u8));
  const u8Value = 42;
  const encodedU8 = $nestedU8.encode(u8Value);
  assertEquals($nestedU8.decode(encodedU8), u8Value);
  
  // Test with string
  const $nestedStr = $.option($.option($.str));
  const strValue = "hello";
  const encodedStr = $nestedStr.encode(strValue);
  assertEquals($nestedStr.decode(encodedStr), strValue);
  
  // Test with boolean
  const $nestedBool = $.option($.option($.bool));
  const boolValue = true;
  const encodedBool = $nestedBool.encode(boolValue);
  assertEquals($nestedBool.decode(encodedBool), boolValue);
});

Deno.test("nested option with custom none values", () => {
  // Test with custom none values
  const $nestedCustom = $.option($.option($.str, null), undefined);
  const strValue = "test";
  const encodedStr = $nestedCustom.encode(strValue);
  assertEquals($nestedCustom.decode(encodedStr), strValue);
  
  const nullValue = null;
  const encodedNull = $nestedCustom.encode(nullValue);
  assertEquals($nestedCustom.decode(encodedNull), nullValue);
  
  const undefinedValue = undefined;
  const encodedUndefined = $nestedCustom.encode(undefinedValue);
  assertEquals($nestedCustom.decode(encodedUndefined), undefinedValue);
});

Deno.test("deep nested option (3 levels)", () => {
  // Test deeper nesting (3 levels)
  const $deepNested = $.option($.option($.option($.u8)));
  const value = 123;
  const encoded = $deepNested.encode(value);
  assertEquals($deepNested.decode(encoded), value);
  
  const undefinedValue = undefined;
  const encodedUndefined = $deepNested.encode(undefinedValue);
  assertEquals($deepNested.decode(encodedUndefined), undefinedValue);
});
