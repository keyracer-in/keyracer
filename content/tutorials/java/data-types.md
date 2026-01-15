# 📊 Java Data Types
                
                
                    ### ✅ Java Data Types Overview
                    Java has two categories of data types:

                    - **Primitive Types:** Store simple values directly
- **Reference Types:** Store references to objects

                

                
                    ### 🔹 1. Primitive Data Types
                    
                    #### 🔸 Integer Types
                    
                        ```java
byte smallInt = 127;           // 8-bit: -128 to 127
short mediumInt = 32000;       // 16-bit: -32,768 to 32,767
int regularInt = 2000000000;   // 32-bit: -2^31 to 2^31-1
long bigInt = 9000000000L;     // 64-bit: -2^63 to 2^63-1

System.out.println("byte: " + smallInt);
System.out.println("short: " + mediumInt);
System.out.println("int: " + regularInt);
System.out.println("long: " + bigInt);
```
                    
                    
                    #### 🔸 Floating-Point Types
                    
                        ```java
float singlePrecision = 3.14f;      // 32-bit decimal
double doublePrecision = 3.14159;    // 64-bit decimal (more precise)

System.out.println("float: " + singlePrecision);
System.out.println("double: " + doublePrecision);
```
                    
                    
                    #### 🔸 Character Type
                    
                        ```java
char letter = 'A';           // Single character
char unicode = '\u0041';     // Unicode for 'A'
char number = '7';           // Character '7', not number 7

System.out.println("char: " + letter);
System.out.println("unicode: " + unicode);
```
                    
                    
                    #### 🔸 Boolean Type
                    
                        ```java
boolean isTrue = true;
boolean isFalse = false;
boolean result = (5 > 3);    // true

System.out.println("boolean: " + isTrue);
System.out.println("comparison: " + result);
```
                    
                

                
                    ### 🔹 2. Reference Data Types
                    
                    #### 🔸 String
                    
                        ```java
String greeting = "Hello World";
String name = "Java";
String empty = "";
String nullString = null;

System.out.println("greeting: " + greeting);
System.out.println("length: " + greeting.length());
System.out.println("uppercase: " + greeting.toUpperCase());
```
                    
                    
                    #### 🔸 Arrays
                    
                        ```java
int[] numbers = {1, 2, 3, 4, 5};
String[] names = {"Alice", "Bob", "Charlie"};
double[] prices = new double[3];  // Creates array of size 3

System.out.println("first number: " + numbers[0]);
System.out.println("array length: " + numbers.length);
```
                    
                

                
                    ### 🔹 3. Data Type Sizes and Ranges
                    
| Type | Size | Range |
| --- | --- | --- |
| byte | 8 bits | -128 to 127 |
| short | 16 bits | -32,768 to 32,767 |
| int | 32 bits | -2,147,483,648 to 2,147,483,647 |
| long |