# 📦 JavaScript Variables

## 🧠 What Are Variables in JavaScript?

A variable is a named container that stores data values. Think of it as a labeled box where you can put information and retrieve it later.

## 🔹 1. Declaring Variables

JavaScript has three keywords for declaring variables:

### `var` (Old Way - Avoid)
```javascript
var oldStyle = "Don't use this";
```

### `let` (Modern - Use for Changeable Values)
```javascript
let age = 25;
age = 26; // Can be changed
```

### `const` (Modern - Use for Constants)
```javascript
const PI = 3.14159;
// PI = 3.14; // ❌ Error: Cannot reassign const
```

## 🔹 2. Variable Declaration Syntax

```javascript
// Declaration without initialization
let x;
console.log(x); // undefined

// Declaration with initialization
let y = 10;

// Multiple declarations
let a = 1, b = 2, c = 3;

// Multiple declarations (better formatting)
let firstName = "John";
let lastName = "Doe";
let age = 30;
```

## 🔹 3. Naming Rules and Conventions

### ✅ Valid Variable Names:
```javascript
let userName = "Alice";
let user_name = "Bob";
let _private = "hidden";
let $jquery = "selector";
let user123 = "valid";
let firstName = "John";
```

### ❌ Invalid Variable Names:
```javascript
let 123user = "invalid";     // ❌ Cannot start with number
let user-name = "invalid";   // ❌ Hyphens not allowed
let let = "invalid";         // ❌ Reserved keyword
let user name = "invalid";   // ❌ Spaces not allowed
let class = "invalid";       // ❌ Reserved keyword
```

### Naming Conventions:
- Use **camelCase** for variable names: `myVariable`, `userName`
- Use **UPPER_CASE** for constants: `MAX_SIZE`, `API_KEY`
- Use descriptive names: `userAge` instead of `x`
- Start with lowercase letter (unless it's a class)

## 🔹 4. Variable Scope

### Global Scope:
```javascript
let globalVar = "I'm global";

function test() {
    console.log(globalVar); // Accessible
}
```

### Function Scope (var):
```javascript
function myFunction() {
    var functionScoped = "Only inside function";
    console.log(functionScoped); // Works
}
// console.log(functionScoped); // ❌ Error: not defined
```

### Block Scope (let and const):
```javascript
if (true) {
    let blockScoped = "Only inside block";
    console.log(blockScoped); // Works
}
// console.log(blockScoped); // ❌ Error: not defined
```

### Comparison:
```javascript
// var is function-scoped
function testVar() {
    if (true) {
        var x = 10;
    }
    console.log(x); // 10 (accessible outside block)
}

// let is block-scoped
function testLet() {
    if (true) {
        let y = 10;
    }
    // console.log(y); // ❌ Error: not defined
}
```

## 🔹 5. Data Types in Variables

JavaScript variables can hold different types of data:

```javascript
// Number
let age = 25;
let price = 19.99;

// String
let name = "Alice";
let message = 'Hello, World!';
let template = `Hello, ${name}`;

// Boolean
let isActive = true;
let isComplete = false;

// Null
let emptyValue = null;

// Undefined
let notAssigned;
console.log(notAssigned); // undefined

// Object
let person = {
    name: "John",
    age: 30
};

// Array
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "two", true, null];

// Function
let greet = function() {
    console.log("Hello!");
};
```

## 🔹 6. Checking Variable Types

Use the `typeof` operator:

```javascript
let num = 42;
console.log(typeof num); // "number"

let text = "Hello";
console.log(typeof text); // "string"

let flag = true;
console.log(typeof flag); // "boolean"

let obj = { key: "value" };
console.log(typeof obj); // "object"

let arr = [1, 2, 3];
console.log(typeof arr); // "object" (arrays are objects)

let nothing = null;
console.log(typeof nothing); // "object" (known quirk)

let notDefined;
console.log(typeof notDefined); // "undefined"
```

## 🔹 7. Variable Reassignment

### With `let`:
```javascript
let score = 0;
score = 10;      // ✅ Allowed
score = 20;      // ✅ Allowed
score = "high";  // ✅ Allowed (type can change)
```

### With `const`:
```javascript
const MAX_SIZE = 100;
// MAX_SIZE = 200; // ❌ Error: Assignment to constant

// But object properties can be modified:
const person = { name: "Alice" };
person.name = "Bob";  // ✅ Allowed
person.age = 25;      // ✅ Allowed

// Array elements can be modified:
const numbers = [1, 2, 3];
numbers.push(4);      // ✅ Allowed
numbers[0] = 10;      // ✅ Allowed
// numbers = [5, 6];  // ❌ Error: Assignment to constant
```

## 🔹 8. Variable Hoisting

JavaScript "hoists" variable declarations to the top:

### With `var`:
```javascript
console.log(x); // undefined (not an error)
var x = 5;

// Interpreted as:
// var x;
// console.log(x);
// x = 5;
```

### With `let` and `const`:
```javascript
// console.log(y); // ❌ Error: Cannot access before initialization
let y = 10;

// console.log(z); // ❌ Error: Cannot access before initialization
const z = 20;
```

✅ **Best Practice:** Always declare variables at the top of their scope.

## 🔹 9. Multiple Variable Assignment

```javascript
// Assign same value to multiple variables
let a = b = c = 10;

// Destructuring assignment
let [x, y, z] = [1, 2, 3];
console.log(x); // 1
console.log(y); // 2
console.log(z); // 3

// Object destructuring
let { name, age } = { name: "Alice", age: 25 };
console.log(name); // "Alice"
console.log(age);  // 25
```

## 🔹 10. Type Coercion

JavaScript automatically converts types when needed:

```javascript
let result = "5" + 3;      // "53" (number to string)
let result2 = "5" - 3;     // 2 (string to number)
let result3 = "5" * "2";   // 10 (both to numbers)
let result4 = true + 1;    // 2 (true becomes 1)
let result5 = false + 1;   // 1 (false becomes 0)
```

## 🔹 11. Explicit Type Conversion

```javascript
// String to Number
let str = "123";
let num1 = Number(str);      // 123
let num2 = parseInt(str);    // 123
let num3 = parseFloat("3.14"); // 3.14
let num4 = +str;             // 123 (unary plus)

// Number to String
let num = 123;
let str1 = String(num);      // "123"
let str2 = num.toString();   // "123"
let str3 = "" + num;         // "123"

// To Boolean
let bool1 = Boolean(1);      // true
let bool2 = Boolean(0);      // false
let bool3 = Boolean("text"); // true
let bool4 = Boolean("");     // false
```

## 🔹 12. Constants Best Practices

```javascript
// Use const by default
const API_URL = "https://api.example.com";
const MAX_RETRIES = 3;
const CONFIG = {
    timeout: 5000,
    retries: 3
};

// Use let only when you need to reassign
let counter = 0;
counter++;

// Avoid var completely
// var oldStyle = "Don't use this";
```

## 🔹 13. Common Mistakes

### ❌ Forgetting to Declare:
```javascript
// Without strict mode:
x = 5; // Creates global variable (bad!)

// With strict mode:
"use strict";
// x = 5; // ❌ Error: x is not defined
```

### ❌ Confusing Assignment and Comparison:
```javascript
let x = 5;
if (x = 10) { // ❌ Assignment, not comparison!
    console.log("This always runs");
}

// Should be:
if (x === 10) { // ✅ Comparison
    console.log("x is 10");
}
```

## 🔹 14. Best Practices Summary

✅ Use `const` by default
✅ Use `let` when you need to reassign
✅ Never use `var`
✅ Use descriptive variable names
✅ Declare variables at the top of their scope
✅ Initialize variables when declaring them
✅ Use strict mode (`"use strict";`)
✅ Follow consistent naming conventions
