# ⚙️ Methods
                
                
                    ### ✅ What are Methods?
                    Methods are blocks of code that perform specific tasks. They help organize code, avoid repetition, and make programs more readable and maintainable.

                    
                        ```java
// Method syntax
public static returnType methodName(parameters) {
    // method body
    return value; // if not void
}
```
                    
                

                
                    ### 🔹 1. Basic Method Declaration
                    
                        ```java
public class MethodExample {
    
    // Method with no parameters and no return value
    public static void greet() {
        System.out.println("Hello, World!");
    }
    
    // Method with parameters but no return value
    public static void greetPerson(String name) {
        System.out.println("Hello, " + name + "!");
    }
    
    // Method with parameters and return value
    public static int add(int a, int b) {
        return a + b;
    }
    
    // Method with multiple parameters
    public static double calculateArea(double length, double width) {
        return length * width;
    }
    
    public static void main(String[] args) {
        greet();                           // Hello, World!
        greetPerson("Alice");              // Hello, Alice!
        int sum = add(5, 3);              // 8
        double area = calculateArea(4.5, 2.0); // 9.0
        
        System.out.println("Sum: " + sum);
        System.out.println("Area: " + area);
    }
}
```
                    
                

                
                    ### 🔹 2. Method Parameters and Arguments
                    
                        ```java
// Method with different parameter types
public static void displayInfo(String name, int age, boolean isStudent) {
    System.out.println("Name: " + name);
    System.out.println("Age: " + age);
    System.out.println("Student: " + isStudent);
}

// Method with array parameter
public static void printArray(int[] numbers) {
    System.out.print("Array: ");
    for (int num : numbers) {
        System.out.print(num + " ");
    }
    System.out.println();
}

// Variable arguments (varargs)
public static int sum(int... numbers) {
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total;
}

public static void main(String[] args) {
    displayInfo("Bob", 20, true);
    
    int[] scores = {85, 92, 78};
    printArray(scores);
    
    // Varargs can take any number of arguments
    System.out.println("Sum of 2 numbers: " + sum(5, 3));
    System.out.println("Sum of 4 numbers: " + sum(1, 2, 3, 4));
    System.out.println("Sum of 6 numbers: " + sum(10, 20, 30, 40, 50, 60));
}
```
                    
                

                
                    ### 🔹 3. Return Values and Types
                    
                        ```java
// Different return types
public static boolean isEven(int number) {
    return number % 2 == 0;
}

public static String getGrade(int score) {
    if (score >= 90) return "A";
    else if (score >= 80) return "B";
    else if (score >= 70) return "C";
    else if (score >= 60) return "D";
    else return "F";
}

public static double[] getStatistics(int[] numbers) {
    double sum = 0;
    int min = numbers[0];
    int max = numbers[0];
    
    for (int num : numbers) {
        sum += num;
        if (num  max) max = num;
    }
    
    double average = sum / numbers.length;
    return new double[]{sum, average, min, max};
}

// Early return
public static String checkAge(int age) {
    if (age 
                

                
                    ### 🔹 4. Method Overloading
                    
                        ```java
public class Calculator {
    
    // Same method name, different parameters
    public static int multiply(int a, int b) {
        return a * b;
    }
    
    public static double multiply(double a, double b) {
        return a * b;
    }
    
    public static int multiply(int a, int b, int c) {
        return a * b * c;
    }
    
    // Print methods with different parameter types
    public static void print(int value) {
        System.out.println("Integer: " + value);
    }
    
    public static void print(double value) {
        System.out.println("Double: " + value);
    }
    
    public static void print(String value) {
        System.out.println("String: " + value);
    }
    
    public static void print(boolean value) {
        System.out.println("Boolean: " + value);
    }
    
    public static void main(String[] args) {
        // Java automatically chooses the right method
        System.out.println(multiply(5, 3));        // Calls int version
        System.out.println(multiply(2.5, 4.0));    // Calls double version
        System.out.println(multiply(2, 3, 4));     // Calls 3-parameter version
        
        print(42);          // Calls int version
        print(3.14);        // Calls double version
        print("Hello");     // Calls String version
        print(true);        // Calls boolean version
    }
}
```
                    
                

                
                    ### 🔹 5. Scope and Local Variables
                    
                        ```java
public class ScopeExample {
    static int globalVar = 100; // Class variable (global scope)
    
    public static void methodA() {
        int localVar = 50;  // Local to methodA
        System.out.println("In methodA:");
        System.out.println("Global: " + globalVar);
        System.out.println("Local: " + localVar);
        
        // Can modify global variable
        globalVar = 200;
    }
    
    public static void methodB() {
        int localVar = 75;  // Different local variable
        System.out.println("In methodB:");
        System.out.println("Global: " + globalVar);
        System.out.println("Local: " + localVar);
        
        // System.out.println(localVar from methodA); // ❌ Error: not accessible
    }
    
    public static int processNumber(int input) {
        int result = input * 2;  // Local to this method
        
        if (input > 10) {
            int bonus = 5;       // Local to this if block
            result += bonus;
        }
        // System.out.println(bonus); // ❌ Error: bonus not accessible here
        
        return result;
    }
    
    public static void main(String[] args) {
        System.out.println("Initial global: " + globalVar);
        methodA();
        methodB();
        
        int result = processNumber(15);
        System.out.println("Processed result: " + result);
    }
}
```
                    
                

                
                    ### 🔹 6. Utility Methods
                    
                        ```java
public class Utilities {
    
    // String utilities
    public static boolean isPalindrome(String str) {
        str = str.toLowerCase().replaceAll("[^a-zA-Z0-9]", "");
        int left = 0, right = str.length() - 1;
        while (left  max) max = num;
        }
        return max;
    }
    
    public static void main(String[] args) {
        // String utilities
        System.out.println("Is 'radar' palindrome? " + isPalindrome("radar"));
        System.out.println("Reverse of 'hello': " + reverse("hello"));
        
        // Math utilities
        System.out.println("Is 17 prime? " + isPrime(17));
        System.out.println("Factorial of 5: " + factorial(5));
        
        // Array utilities
        int[] numbers = {3, 7, 1, 9, 4};
        printArray(numbers);
        System.out.println("Max value: " + findMax(numbers));
    }
}
```
                    
                

                
                    ### 🔹 7. Recursive Methods
                    
                        ```java
public class RecursionExample {
    
    // Factorial using recursion
    public static int factorialRecursive(int n) {
        if (n