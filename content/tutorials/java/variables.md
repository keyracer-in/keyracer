# 📝 Java Variables
                
                
                    ### ✅ What is a Variable?
                    A variable is a container that holds data. In Java, you must specify the type of data it will hold.

                    
                        ```java
int age = 25;           // Integer variable
String name = "John";   // String variable
double height = 5.9;    // Double variable
boolean isStudent = true; // Boolean variable
```
                    
                

                
                    ### 🔹 1. Variable Naming Rules
                    #### ✅ Valid names:
                    - Must start with a letter, underscore (_), or dollar sign ($)
- Can contain letters, digits, underscores, and dollar signs
- Cannot be a Java keyword
- Case-sensitive

                    
                    #### ❌ Invalid names:
                    
                        ```java
int 2name = 10;      // ❌ Cannot start with digit
int user-name = 10;  // ❌ Hyphens not allowed
int class = 10;      // ❌ 'class' is a keyword
```
                    
                    
                    #### ✅ Valid examples:
                    
                        ```java
int userName = 10;
int _age = 25;
int $price = 100;
int name2 = 5;
```
                    
                

                
                    ### 🔹 2. Variable Types
                    #### 🔸 Primitive Types:
                    
                        ```java
byte smallNumber = 127;        // 8-bit integer
short mediumNumber = 32000;    // 16-bit integer
int number = 2000000000;       // 32-bit integer
long bigNumber = 9000000000L;  // 64-bit integer

float decimal = 3.14f;         // 32-bit decimal
double preciseDecimal = 3.14159; // 64-bit decimal

char letter = 'A';             // Single character
boolean flag = true;           // true or false
```
                    
                    
                    #### 🔸 Reference Types:
                    
                        ```java
String text = "Hello World";
int[] numbers = {1, 2, 3, 4, 5};
Scanner input = new Scanner(System.in);
```
                    
                

                
                    ### 🔹 3. Variable Declaration and Initialization
                    
                        ```java
// Declaration only
int age;
String name;

// Declaration with initialization
int score = 95;
String city = "New York";

// Multiple declarations
int x, y, z;
int a = 1, b = 2, c = 3;
```
                    
                

                
                    ### 🔹 4. Constants (final keyword)
                    
                        ```java
final int MAX_SCORE = 100;
final double PI = 3.14159;
final String COMPANY_NAME = "TechCorp";

// MAX_SCORE = 200; // ❌ Error: cannot reassign
```
                    
                    🔒 Constants cannot be changed once assigned. Use UPPER_CASE naming convention.

                

                
                    ### 🔹 5. Type Casting
                    
                        ```java
// Implicit casting (automatic)
int intValue = 100;
double doubleValue = intValue;  // int to double

// Explicit casting (manual)
double bigDecimal = 9.87;
int wholeNumber = (int) bigDecimal;  // 9 (loses decimal part)

// String to primitive
String numberText = "123";
int parsedNumber = Integer.parseInt(numberText);
double parsedDecimal = Double.parseDouble("45.67");
```
                    
                

                
                    ### 🔹 6. Variable Scope
                    
                        ```java
public class VariableScope {
    static int globalVar = 100;  // Class variable
    
    public static void main(String[] args) {
        int localVar = 50;       // Local variable
        
        if (true) {
            int blockVar = 25;   // Block variable
            System.out.println(globalVar); // ✅ Accessible
            System.out.println(localVar);  // ✅ Accessible
            System.out.println(blockVar);  // ✅ Accessible
        }
        
        // System.out.println(blockVar); // ❌ Error: out of scope
    }
}
```
                    
                

                
                    ### 🔹 7. Default Values
                    
                        ```java
public class DefaultValues {
    // Instance variables have default values
    int number;        // 0
    double decimal;    // 0.0
    boolean flag;      // false
    String text;       // null
    
    public static void main(String[] args) {
        DefaultValues obj = new DefaultValues();
        System.out.println(obj.number);   // Prints: 0
        System.out.println(obj.flag);     // Prints: false
        
        // Local variables must be initialized before use
        int localVar;
        // System.out.println(localVar); // ❌ Error: not initialized
    }
}
```