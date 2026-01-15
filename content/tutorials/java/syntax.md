# ☕ Java Syntax: The Basics
                
                
                    ### 📌 1. Java is Case Sensitive
                    Java is case-sensitive, meaning `myVariable` and `MyVariable` are different!

                    
                    
                        ```java
public class CaseSensitive {
    public static void main(String[] args) {
        int myVariable = 10;
        int MyVariable = 20;  // Different variable!
        
        System.out.println(myVariable);  // Prints: 10
        System.out.println(MyVariable);  // Prints: 20
    }
}
```
                    
                

                
                    ### 📌 2. Comments
                    Used to explain code. They are ignored by the compiler.

                    
                        ```java
// This is a single-line comment

/*
 * This is a 
 * multi-line comment
 */

/**
 * This is a JavaDoc comment
 * Used for documentation
 */
```
                    
                

                
                    ### 📌 3. Print Statements
                    
                        ```java
System.out.println("Hello World!");  // With new line
System.out.print("Hello ");           // Without new line
System.out.print("World!");           // Continues on same line
```
                    
                

                
                    ### 📌 4. Variables Declaration
                    Java is statically typed - you must declare variable types.

                    
                        ```java
int age = 25;              // Integer
double price = 19.99;      // Double (decimal)
String name = "John";      // String
boolean isValid = true;    // Boolean
char grade = 'A';          // Character
```
                    
                

                
                    ### 📌 5. String Formatting
                    
                        ```java
String name = "Alice";
int age = 30;

// Concatenation
System.out.println("Hello " + name + ", you are " + age);

// printf style
System.out.printf("Hello %s, you are %d%n", name, age);

// String.format
String message = String.format("Hello %s, you are %d", name, age);
```
                    
                

                
                    ### 📌 6. Basic Input (Scanner)
                    
                        ```java
import java.util.Scanner;

public class InputExample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        
        System.out.println("Hello " + name + ", age " + age);
        scanner.close();
    }
}
```
                    
                

                
                    ### 📌 7. Conditional Statements
                    
                        ```java
int score = 85;

if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");
} else if (score >= 70) {
    System.out.println("Grade: C");
} else {
    System.out.println("Grade: F");
}
```
                    
                

                
                    ### 📌 8. Loops
                    #### 🔹 for Loop
                    
                        ```java
for (int i = 0; i 
                    
                    #### 🔹 while Loop
                    
                        ```java
int i = 0;
while (i 
                    
                    #### 🔹 Enhanced for Loop (for-each)
                    
                        ```java
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}
```
                    
                

                
                    ### 📌 9. Switch Statement
                    
                        ```java
int day = 3;
String dayName;

switch (day) {
    case 1:
        dayName = "Monday";
        break;
    case 2:
        dayName = "Tuesday";
        break;
    case 3:
        dayName = "Wednesday";
        break;
    default:
        dayName = "Unknown";
}

System.out.println("Day: " + dayName);
```
                    
                

                
                    ### 📌 10. Basic Math Operations
                    
                        ```java
int a = 10;
int b = 3;

System.out.println("Addition: " + (a + b));        // 13
System.out.println("Subtraction: " + (a - b));     // 7
System.out.println("Multiplication: " + (a * b));  // 30
System.out.println("Division: " + (a / b));        // 3 (integer)
System.out.println("Modulus: " + (a % b));         // 1
```