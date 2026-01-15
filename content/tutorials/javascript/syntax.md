# 📝 JavaScript Syntax

## 📌 1. Basic Syntax Rules

JavaScript syntax is the set of rules that define how JavaScript programs are written and interpreted.

### Key Points:
- JavaScript is **case-sensitive** (`myVar` and `myvar` are different)
- Statements can end with semicolons `;` (optional but recommended)
- Whitespace is generally ignored (except in strings)
- Code blocks are defined with curly braces `{}`

## 📌 2. Statements and Semicolons

A statement is an instruction to be executed:

```javascript
// Statements with semicolons (recommended)
let x = 5;
let y = 10;
let sum = x + y;

// Statements without semicolons (works but not recommended)
let a = 5
let b = 10
let total = a + b
```

✅ **Best Practice:** Always use semicolons to avoid potential issues.

## 📌 3. Code Blocks

Code blocks group statements together using curly braces:

```javascript
if (true) {
    console.log("This is inside a block");
    console.log("Multiple statements");
}

function greet() {
    console.log("Hello!");
    console.log("Welcome!");
}
```

## 📌 4. Comments

Comments are ignored by JavaScript and used to explain code:

### Single-Line Comments:
```javascript
// This is a single-line comment
let x = 5; // Comment after code
```

### Multi-Line Comments:
```javascript
/*
This is a multi-line comment
It can span multiple lines
Useful for longer explanations
*/
let y = 10;
```

### Documentation Comments (JSDoc):
```javascript
/**
 * Calculates the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function add(a, b) {
    return a + b;
}
```

## 📌 5. Variables and Declarations

JavaScript has three ways to declare variables:

```javascript
var oldWay = "Avoid using var";     // Function-scoped (old)
let modernWay = "Use let";          // Block-scoped (modern)
const constant = "Cannot change";   // Block-scoped, immutable
```

## 📌 6. Identifiers (Naming Rules)

Identifiers are names for variables, functions, and other elements.

### ✅ Valid Identifiers:
```javascript
let userName = "Alice";
let _private = "hidden";
let $jquery = "selector";
let user123 = "valid";
let camelCaseExample = "standard";
```

### ❌ Invalid Identifiers:
```javascript
let 123user = "invalid";     // Cannot start with number
let user-name = "invalid";   // Hyphens not allowed
let let = "invalid";         // Reserved keyword
let user name = "invalid";   // Spaces not allowed
```

### Naming Conventions:
- **camelCase** for variables and functions: `myVariable`, `getUserName()`
- **PascalCase** for classes: `MyClass`, `UserProfile`
- **UPPER_CASE** for constants: `MAX_SIZE`, `API_KEY`

## 📌 7. Operators

### Arithmetic Operators:
```javascript
let a = 10 + 5;   // Addition: 15
let b = 10 - 5;   // Subtraction: 5
let c = 10 * 5;   // Multiplication: 50
let d = 10 / 5;   // Division: 2
let e = 10 % 3;   // Modulus (remainder): 1
let f = 2 ** 3;   // Exponentiation: 8
```

### Assignment Operators:
```javascript
let x = 10;       // Assignment
x += 5;           // x = x + 5
x -= 3;           // x = x - 3
x *= 2;           // x = x * 2
x /= 4;           // x = x / 4
```

### Comparison Operators:
```javascript
5 == "5"          // true (loose equality)
5 === "5"         // false (strict equality)
5 != "5"          // false
5 !== "5"         // true
10 > 5            // true
10 < 5            // false
10 >= 10          // true
10 <= 5           // false
```

### Logical Operators:
```javascript
true && false     // AND: false
true || false     // OR: true
!true             // NOT: false
```

## 📌 8. Data Types

JavaScript has dynamic typing:

```javascript
let number = 42;              // Number
let text = "Hello";           // String
let isTrue = true;            // Boolean
let nothing = null;           // Null
let notDefined;               // Undefined
let obj = { key: "value" };   // Object
let arr = [1, 2, 3];          // Array
```

## 📌 9. String Syntax

### Single and Double Quotes:
```javascript
let single = 'Hello';
let double = "World";
let mixed = "It's okay";
```

### Template Literals (Backticks):
```javascript
let name = "Alice";
let age = 25;
let message = `Hello, ${name}! You are ${age} years old.`;
console.log(message); // Hello, Alice! You are 25 years old.
```

### Multi-Line Strings:
```javascript
let multiLine = `This is
a multi-line
string`;
```

## 📌 10. Expressions vs Statements

### Expression (produces a value):
```javascript
5 + 3              // Expression: 8
"Hello" + " World" // Expression: "Hello World"
x > 10             // Expression: true or false
```

### Statement (performs an action):
```javascript
let x = 5;         // Declaration statement
if (x > 0) { }     // Conditional statement
for (let i = 0; i < 5; i++) { } // Loop statement
```

## 📌 11. Whitespace and Formatting

JavaScript ignores extra whitespace:

```javascript
// All valid:
let x=5;
let x = 5;
let x    =    5;

// Recommended formatting:
let x = 5;
let y = 10;
let sum = x + y;
```

## 📌 12. Strict Mode

Enable strict mode for better error checking:

```javascript
"use strict";

// Now this will throw an error:
x = 5; // Error: x is not defined
```

✅ **Best Practice:** Use strict mode to catch common mistakes.

## 📌 13. Common Syntax Patterns

### Conditional:
```javascript
if (condition) {
    // code
} else if (anotherCondition) {
    // code
} else {
    // code
}
```

### Loop:
```javascript
for (let i = 0; i < 5; i++) {
    console.log(i);
}
```

### Function:
```javascript
function myFunction(param1, param2) {
    return param1 + param2;
}
```

### Arrow Function:
```javascript
const add = (a, b) => a + b;
```

## 📌 14. Best Practices

✅ Use meaningful variable names
✅ Add comments for complex logic
✅ Use consistent indentation (2 or 4 spaces)
✅ Use semicolons consistently
✅ Enable strict mode
✅ Follow a style guide (Airbnb, Google, Standard)
