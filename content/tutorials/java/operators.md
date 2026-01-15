# 🔢 Java Operators
                
                
                    ### ✅ What are Operators?
                    Operators are symbols that perform operations on variables and values. Java has several types of operators:

                    - **Arithmetic:** +, -, *, /, %
- **Assignment:** =, +=, -=, *=, /=
- **Comparison:** ==, !=, , =
- **Logical:** &&, ||, !
- **Increment/Decrement:** ++, --

                

                
                    ### 🔹 1. Arithmetic Operators
                    
                        ```java
int a = 15, b = 4;

System.out.println("Addition: " + (a + b));        // 19
System.out.println("Subtraction: " + (a - b));     // 11
System.out.println("Multiplication: " + (a * b));  // 60
System.out.println("Division: " + (a / b));        // 3 (integer division)
System.out.println("Modulus: " + (a % b));         // 3 (remainder)

// With floating point
double x = 15.0, y = 4.0;
System.out.println("Float Division: " + (x / y));  // 3.75
```
                    
                

                
                    ### 🔹 2. Assignment Operators
                    
                        ```java
int x = 10;

x += 5;    // x = x + 5;  → x becomes 15
x -= 3;    // x = x - 3;  → x becomes 12
x *= 2;    // x = x * 2;  → x becomes 24
x /= 4;    // x = x / 4;  → x becomes 6
x %= 4;    // x = x % 4;  → x becomes 2

System.out.println("Final value: " + x);
```
                    
                

                
                    ### 🔹 3. Comparison Operators
                    
                        ```java
int a = 10, b = 20;

System.out.println("a == b: " + (a == b));  // false
System.out.println("a != b: " + (a != b));  // true
System.out.println("a  b: " + (a > b));    // false
System.out.println("a = b: " + (a >= b));  // false

// String comparison
String name1 = "Java";
String name2 = "Python";
System.out.println("Strings equal: " + name1.equals(name2));
```
                    
                

                
                    ### 🔹 4. Logical Operators
                    
                        ```java
boolean x = true, y = false;

System.out.println("x && y: " + (x && y));  // false (AND)
System.out.println("x || y: " + (x || y));  // true (OR)
System.out.println("!x: " + (!x));          // false (NOT)

// Practical example
int age = 25;
boolean hasLicense = true;
boolean canDrive = (age >= 18) && hasLicense;
System.out.println("Can drive: " + canDrive);
```
                    
                

                
                    ### 🔹 5. Increment/Decrement Operators
                    
                        ```java
int count = 5;

// Pre-increment: increment first, then use
System.out.println("Pre-increment: " + (++count));  // 6

// Post-increment: use first, then increment
System.out.println("Post-increment: " + (count++)); // 6
System.out.println("After post-increment: " + count); // 7

// Pre-decrement
System.out.println("Pre-decrement: " + (--count));  // 6

// Post-decrement
System.out.println("Post-decrement: " + (count--)); // 6
System.out.println("Final value: " + count);        // 5
```
                    
                

                
                    ### 🔹 6. Ternary Operator (?:)
                    
                        ```java
int age = 20;

// Traditional if-else
String message1;
if (age >= 18) {
    message1 = "Adult";
} else {
    message1 = "Minor";
}

// Ternary operator (shorter)
String message2 = (age >= 18) ? "Adult" : "Minor";

System.out.println("Message: " + message2);

// Nested ternary
int score = 85;
String grade = (score >= 90) ? "A" : 
               (score >= 80) ? "B" : 
               (score >= 70) ? "C" : "F";
System.out.println("Grade: " + grade);
```
                    
                

                
                    ### 🔹 7. Operator Precedence
                    
                        ```java
// Order of operations matters!
int result1 = 10 + 5 * 2;      // 20 (not 30)
int result2 = (10 + 5) * 2;    // 30

System.out.println("10 + 5 * 2 = " + result1);
System.out.println("(10 + 5) * 2 = " + result2);

// Complex expression
boolean complex = 5 > 3 && 10 
                    **Precedence Order (High to Low):**

                    1. Parentheses ()
2. Unary: ++, --, !
3. Multiplicative: *, /, %
4. Additive: +, -
5. Relational: , =
6. Equality: ==, !=
7. Logical AND: &&
8. Logical OR: ||
9. Ternary: ?:
10. Assignment: =, +=, -=, etc.