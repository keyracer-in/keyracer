# 📋 Arrays
                Arrays are containers that hold multiple values of the same type. They're fundamental data structures in Java that allow you to store and manipulate collections of data efficiently.

                
                
                    ## 🔸 Array Declaration and Initialization
                    Arrays can be declared and initialized in several ways:

                    
                    
                        ### Basic Array Declaration
                        ```
// Declaration syntax
int[] numbers;           // Preferred way
int numbers[];          // Alternative way

// Declaration with initialization
int[] numbers = new int[5];  // Array of 5 integers (default value 0)
String[] names = new String[3];  // Array of 3 strings (default value null)

// Declaration with values
int[] scores = {85, 92, 78, 96, 89};
String[] colors = {"red", "green", "blue", "yellow"};

// Alternative initialization syntax
int[] grades = new int[]{88, 92, 76, 84, 91};
```
                    

                    
                        ### 📋 Featured Example: Student Grades System
                        ```
public class StudentGrades {
    public static void main(String[] args) {
        // Initialize array with student grades
        int[] grades = {85, 92, 78, 96, 89, 83, 91};
        String[] students = {"Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"};
        
        System.out.println("Student Grade Report:");
        System.out.println("=====================");
        
        for (int i = 0; i 
                

                
                
                    ## 🔸 Array Access and Modification
                    Elements in arrays are accessed using zero-based indexing:

                    
                    
                        ### Accessing Array Elements
                        ```
int[] numbers = {10, 20, 30, 40, 50};

// Accessing elements (index starts from 0)
int first = numbers[0];    // Gets 10
int third = numbers[2];    // Gets 30
int last = numbers[numbers.length - 1];  // Gets 50

// Modifying elements
numbers[1] = 25;  // Changes second element from 20 to 25
numbers[4] = 55;  // Changes last element from 50 to 55

System.out.println("Modified array:");
for (int num : numbers) {
    System.out.print(num + " ");  // Output: 10 25 30 40 55
}
```
                    

                    
                        ### Array Bounds and Safety
                        ```
public class ArraySafety {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        
        // Safe array access
        System.out.println("Array length: " + arr.length);
        
        // Check bounds before accessing
        int index = 10;
        if (index >= 0 && index 
                

                
                
                    ## 🔸 Array Iteration
                    There are multiple ways to iterate through arrays in Java:

                    
                    
                        ### Different Iteration Methods
                        ```
int[] numbers = {15, 23, 8, 42, 16, 31, 7};

// 1. Traditional for loop
System.out.println("Traditional for loop:");
for (int i = 0; i 

                    
                        ### 📋 Featured Example: Array Statistics Calculator
                        ```
public class ArrayStats {
    public static void main(String[] args) {
        double[] scores = {78.5, 92.3, 85.7, 69.2, 88.9, 94.1, 76.8, 82.4};
        
        // Calculate sum and average
        double sum = 0;
        double max = scores[0];
        double min = scores[0];
        
        for (double score : scores) {
            sum += score;
            if (score > max) max = score;
            if (score 
                

                
                
                    ## 🔸 Array Manipulation and Operations
                    Common operations performed on arrays include searching, sorting, and copying:

                    
                    
                        ### Basic Array Operations
                        ```
import java.util.Arrays;

public class ArrayOperations {
    public static void main(String[] args) {
        int[] original = {64, 34, 25, 12, 22, 11, 90};
        
        // Display original array
        System.out.println("Original: " + Arrays.toString(original));
        
        // Copy array
        int[] copy = Arrays.copyOf(original, original.length);
        
        // Sort array
        Arrays.sort(copy);
        System.out.println("Sorted: " + Arrays.toString(copy));
        
        // Search in sorted array
        int target = 25;
        int index = Arrays.binarySearch(copy, target);
        System.out.println("Element " + target + " found at index: " + index);
        
        // Fill array with specific value
        int[] filled = new int[5];
        Arrays.fill(filled, 42);
        System.out.println("Filled: " + Arrays.toString(filled));
    }
}
```
                    

                    
                        ### Manual Array Operations
                        ```
public class ManualArrayOps {
    public static void main(String[] args) {
        int[] numbers = {5, 2, 8, 1, 9, 3};
        
        System.out.println("Original: " + arrayToString(numbers));
        
        // Manual reverse
        reverseArray(numbers);
        System.out.println("Reversed: " + arrayToString(numbers));
        
        // Manual search
        int searchValue = 8;
        int position = linearSearch(numbers, searchValue);
        if (position != -1) {
            System.out.println("Found " + searchValue + " at index " + position);
        } else {
            System.out.println(searchValue + " not found");
        }
    }
    
    public static void reverseArray(int[] arr) {
        int start = 0;
        int end = arr.length - 1;
        
        while (start 
                

                
                
                    ## 🔸 Multi-dimensional Arrays
                    Java supports arrays of arrays, commonly used for matrices and tables:

                    
                    
                        ### 2D Array Basics
                        ```
// 2D array declaration and initialization
int[][] matrix = new int[3][4];  // 3 rows, 4 columns

// Initialize with values
int[][] grid = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Jagged array (rows with different lengths)
int[][] jagged = {
    {1, 2},
    {3, 4, 5, 6},
    {7, 8, 9}
};

System.out.println("Grid dimensions: " + grid.length + "x" + grid[0].length);
System.out.println("Element at [1][2]: " + grid[1][2]);  // Output: 6
```
                    

                    
                        ### 📋 Featured Example: Tic-Tac-Toe Board
                        ```
public class TicTacToe {
    public static void main(String[] args) {
        char[][] board = {
            {'X', 'O', 'X'},
            {'O', 'X', 'O'},
            {'X', 'O', 'X'}
        };
        
        System.out.println("Tic-Tac-Toe Board:");
        printBoard(board);
        
        // Check if X wins in first row
        if (checkRow(board, 0, 'X')) {
            System.out.println("X wins in the first row!");
        }
    }
    
    public static void printBoard(char[][] board) {
        for (int row = 0; row 
                

                
                
                    ## 🔸 Array Utility Methods
                    Creating reusable methods for common array operations:

                    
                    
                        ### Useful Array Utility Methods
                        ```
import java.util.Arrays;
import java.util.Random;

public class ArrayUtils {
    public static void main(String[] args) {
        int[] numbers = generateRandomArray(10, 1, 100);
        System.out.println("Random array: " + Arrays.toString(numbers));
        
        System.out.println("Sum: " + sum(numbers));
        System.out.println("Average: " + average(numbers));
        System.out.println("Contains 50? " + contains(numbers, 50));
        
        int[] filtered = filterGreaterThan(numbers, 50);
        System.out.println("Numbers > 50: " + Arrays.toString(filtered));
    }
    
    // Generate random array
    public static int[] generateRandomArray(int size, int min, int max) {
        Random random = new Random();
        int[] arr = new int[size];
        for (int i = 0; i  threshold) count++;
        }
        
        // Create result array and fill it
        int[] result = new int[count];
        int index = 0;
        for (int num : arr) {
            if (num > threshold) {
                result[index++] = num;
            }
        }
        return result;
    }
}
```
                    
                

                
                
                    ## 🔸 Common Array Patterns and Best Practices
                    Frequently used array patterns and programming best practices:

                    
                    
                        ### Array Processing Patterns
                        ```
public class ArrayPatterns {
    public static void main(String[] args) {
        int[] data = {3, 7, 1, 9, 4, 6, 8, 2, 5};
        
        // Pattern 1: Find maximum and minimum
        int[] minMax = findMinMax(data);
        System.out.println("Min: " + minMax[0] + ", Max: " + minMax[1]);
        
        // Pattern 2: Count elements meeting condition
        int evenCount = countEven(data);
        System.out.println("Even numbers count: " + evenCount);
        
        // Pattern 3: Remove duplicates (simplified)
        int[] unique = {1, 2, 2, 3, 3, 3, 4, 5, 5};
        int[] noDuplicates = removeDuplicatesSorted(unique);
        System.out.println("Unique elements: " + Arrays.toString(noDuplicates));
        
        // Pattern 4: Rotate array
        int[] toRotate = {1, 2, 3, 4, 5};
        rotateLeft(toRotate, 2);
        System.out.println("Rotated array: " + Arrays.toString(toRotate));
    }
    
    public static int[] findMinMax(int[] arr) {
        if (arr.length == 0) return new int[]{0, 0};
        
        int min = arr[0];
        int max = arr[0];
        
        for (int i = 1; i  max) max = arr[i];
        }
        
        return new int[]{min, max};
    }
    
    public static int countEven(int[] arr) {
        int count = 0;
        for (int num : arr) {
            if (num % 2 == 0) count++;
        }
        return count;
    }
    
    public static int[] removeDuplicatesSorted(int[] arr) {
        if (arr.length == 0) return arr;
        
        int uniqueCount = 1;
        for (int i = 1; i  array length
        reverse(arr, 0, positions - 1);
        reverse(arr, positions, arr.length - 1);
        reverse(arr, 0, arr.length - 1);
    }
    
    private static void reverse(int[] arr, int start, int end) {
        while (start 

                    
                        ### 📋 Featured Example: Grade Book Management System
                        ```
public class GradeBook {
    private String[] studentNames;
    private double[][] grades; // [student][assignment]
    private String[] assignmentNames;
    
    public GradeBook(String[] names, String[] assignments) {
        this.studentNames = names.clone();
        this.assignmentNames = assignments.clone();
        this.grades = new double[names.length][assignments.length];
    }
    
    public void setGrade(int studentIndex, int assignmentIndex, double grade) {
        if (isValidIndex(studentIndex, assignmentIndex)) {
            grades[studentIndex][assignmentIndex] = grade;
        }
    }
    
    public double getStudentAverage(int studentIndex) {
        if (studentIndex = studentNames.length) {
            return 0;
        }
        
        double sum = 0;
        for (int i = 0; i = assignmentNames.length) {
            return 0;
        }
        
        double sum = 0;
        for (int i = 0; i = 0 && studentIndex = 0 && assignmentIndex 
                

                
                    ### 💡 Array Best Practices
                    - **Always check bounds:** Validate array indices before accessing elements
- **Use enhanced for loops:** When you don't need the index, use for-each loops
- **Initialize properly:** Ensure arrays are properly initialized before use
- **Consider Arrays class:** Use java.util.Arrays for common operations like sorting and searching
- **Handle empty arrays:** Always check for null or empty arrays in methods
- **Use meaningful names:** Choose descriptive variable names for arrays
- **Avoid hardcoded sizes:** Use array.length instead of magic numbers