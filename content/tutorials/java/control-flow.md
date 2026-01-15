# 🔄 Control Flow
                
                
                    ### ✅ What is Control Flow?
                    Control flow statements determine the order in which code executes. They allow you to make decisions, repeat actions, and branch program execution.

                

                
                    ### 🔹 1. If-Else Statements
                    
                        ```java
int temperature = 25;

// Simple if
if (temperature > 30) {
    System.out.println("It's hot!");
}

// If-else
if (temperature > 30) {
    System.out.println("It's hot!");
} else {
    System.out.println("It's not that hot.");
}

// If-else if-else
if (temperature > 35) {
    System.out.println("Extremely hot!");
} else if (temperature > 25) {
    System.out.println("Warm weather");
} else if (temperature > 15) {
    System.out.println("Mild weather");
} else {
    System.out.println("Cold weather");
}
```
                    
                

                
                    ### 🔹 2. Switch Statement
                    
                        ```java
int dayOfWeek = 3;
String dayName;

switch (dayOfWeek) {
    case 1:
        dayName = "Monday";
        break;
    case 2:
        dayName = "Tuesday";
        break;
    case 3:
        dayName = "Wednesday";
        break;
    case 4:
        dayName = "Thursday";
        break;
    case 5:
        dayName = "Friday";
        break;
    case 6:
    case 7:
        dayName = "Weekend";
        break;
    default:
        dayName = "Invalid day";
}

System.out.println("Day: " + dayName);

// Switch with Strings (Java 7+)
String grade = "A";
switch (grade) {
    case "A":
        System.out.println("Excellent!");
        break;
    case "B":
        System.out.println("Good job!");
        break;
    case "C":
        System.out.println("Average");
        break;
    default:
        System.out.println("Keep trying!");
}
```
                    
                

                
                    ### 🔹 3. For Loops
                    
                    #### 🔸 Basic For Loop
                    
                        ```java
// Print numbers 1 to 5
for (int i = 1; i = 1; i--) {
    System.out.println("Countdown: " + i);
}

// Step by 2
for (int i = 0; i 
                    
                    #### 🔸 Enhanced For Loop (For-Each)
                    
                        ```java
// Array iteration
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println("Number: " + num);
}

// String array
String[] names = {"Alice", "Bob", "Charlie"};
for (String name : names) {
    System.out.println("Hello, " + name);
}

// Character iteration
String text = "Java";
for (char c : text.toCharArray()) {
    System.out.println("Character: " + c);
}
```
                    
                

                
                    ### 🔹 4. While Loops
                    
                    #### 🔸 While Loop
                    
                        ```java
int count = 1;
while (count 
                    
                    #### 🔸 Do-While Loop
                    
                        ```java
int num = 1;
do {
    System.out.println("Do-while: " + num);
    num++;
} while (num 
                

                
                    ### 🔹 5. Break and Continue
                    
                        ```java
// Break - exits the loop
System.out.println("Break example:");
for (int i = 1; i 
                

                
                    ### 🔹 6. Nested Loops
                    
                        ```java
// Multiplication table
System.out.println("Multiplication Table:");
for (int i = 1; i 
                

                
                    ### 🔹 7. Common Control Flow Patterns
                    
                        ```java
// Input validation
Scanner scanner = new Scanner(System.in);
int age;
while (true) {
    System.out.print("Enter your age (0-120): ");
    age = scanner.nextInt();
    if (age >= 0 && age  maxScore) {
        maxScore = score;
    }
}
System.out.println("Highest score: " + maxScore);

// Counting specific elements
String[] fruits = {"apple", "banana", "apple", "orange", "apple"};
int appleCount = 0;
for (String fruit : fruits) {
    if (fruit.equals("apple")) {
        appleCount++;
    }
}
System.out.println("Apple count: " + appleCount);
```