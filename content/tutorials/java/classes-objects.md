# 🏗️ Classes & Objects
                
                
                    ### ✅ Object-Oriented Programming (OOP)
                    Java is an object-oriented language. Everything in Java is associated with classes and objects. A **class** is a template for creating objects, and an **object** is an instance of a class.

                    
                        ```java
// Class definition
public class Car {
    // Attributes (fields)
    String brand;
    String model;
    int year;
    
    // Method
    public void start() {
        System.out.println("The car is starting...");
    }
}
```
                    
                

                
                    ### 🔹 1. Creating Classes and Objects
                    
                        ```java
// Student class
public class Student {
    // Instance variables (attributes)
    String name;
    int age;
    String major;
    double gpa;
    
    // Method to display student info
    public void displayInfo() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Major: " + major);
        System.out.println("GPA: " + gpa);
    }
    
    // Method to study
    public void study(String subject) {
        System.out.println(name + " is studying " + subject);
    }
    
    // Method to calculate if honor student
    public boolean isHonorStudent() {
        return gpa >= 3.5;
    }
}

// Using the class
public class StudentTest {
    public static void main(String[] args) {
        // Creating objects (instances)
        Student student1 = new Student();
        Student student2 = new Student();
        
        // Setting values
        student1.name = "Alice";
        student1.age = 20;
        student1.major = "Computer Science";
        student1.gpa = 3.8;
        
        student2.name = "Bob";
        student2.age = 19;
        student2.major = "Mathematics";
        student2.gpa = 3.2;
        
        // Calling methods
        System.out.println("Student 1:");
        student1.displayInfo();
        student1.study("Java Programming");
        System.out.println("Honor student: " + student1.isHonorStudent());
        
        System.out.println("\nStudent 2:");
        student2.displayInfo();
        student2.study("Calculus");
        System.out.println("Honor student: " + student2.isHonorStudent());
    }
}
```
                    
                

                
                    ### 🔹 2. Constructors
                    
                        ```java
public class Book {
    // Instance variables
    private String title;
    private String author;
    private int pages;
    private double price;
    
    // Default constructor
    public Book() {
        this.title = "Unknown";
        this.author = "Unknown";
        this.pages = 0;
        this.price = 0.0;
    }
    
    // Parameterized constructor
    public Book(String title, String author, int pages, double price) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.price = price;
    }
    
    // Constructor overloading
    public Book(String title, String author) {
        this.title = title;
        this.author = author;
        this.pages = 100; // Default pages
        this.price = 9.99; // Default price
    }
    
    // Method to display book info
    public void displayInfo() {
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Pages: " + pages);
        System.out.println("Price: $" + price);
        System.out.println("---");
    }
    
    // Getter methods
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public int getPages() { return pages; }
    public double getPrice() { return price; }
    
    // Setter methods
    public void setTitle(String title) { this.title = title; }
    public void setAuthor(String author) { this.author = author; }
    public void setPages(int pages) { this.pages = pages; }
    public void setPrice(double price) { this.price = price; }
}

public class BookTest {
    public static void main(String[] args) {
        // Using different constructors
        Book book1 = new Book(); // Default constructor
        Book book2 = new Book("1984", "George Orwell", 328, 13.99);
        Book book3 = new Book("To Kill a Mockingbird", "Harper Lee");
        
        System.out.println("Book 1 (default):");
        book1.displayInfo();
        
        System.out.println("Book 2 (full constructor):");
        book2.displayInfo();
        
        System.out.println("Book 3 (partial constructor):");
        book3.displayInfo();
        
        // Using setters to modify book1
        book1.setTitle("The Hobbit");
        book1.setAuthor("J.R.R. Tolkien");
        book1.setPages(310);
        book1.setPrice(12.50);
        
        System.out.println("Book 1 (after modification):");
        book1.displayInfo();
    }
}
```
                    
                

                
                    ### 🔹 3. Encapsulation (Private Variables and Methods)
                    
                        ```java
public class BankAccount {
    // Private variables (encapsulated)
    private String accountNumber;
    private String ownerName;
    private double balance;
    private String accountType;
    
    // Constructor
    public BankAccount(String accountNumber, String ownerName, 
                      double initialBalance, String accountType) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.balance = initialBalance;
        this.accountType = accountType;
    }
    
    // Public methods to access private data
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited $" + amount);
            displayBalance();
        } else {
            System.out.println("Invalid deposit amount");
        }
    }
    
    public void withdraw(double amount) {
        if (amount > 0 && amount  balance) {
            System.out.println("Insufficient funds");
        } else {
            System.out.println("Invalid withdrawal amount");
        }
    }
    
    public double getBalance() {
        return balance;
    }
    
    public void displayAccountInfo() {
        System.out.println("Account Number: " + accountNumber);
        System.out.println("Owner: " + ownerName);
        System.out.println("Account Type: " + accountType);
        displayBalance();
        System.out.println("---");
    }
    
    // Private method (can only be used within this class)
    private void displayBalance() {
        System.out.println("Current Balance: $" + String.format("%.2f", balance));
    }
    
    // Getters for read-only access
    public String getAccountNumber() { return accountNumber; }
    public String getOwnerName() { return ownerName; }
    public String getAccountType() { return accountType; }
    
    // No setters for critical data to maintain security
}

public class BankTest {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("ACC001", "John Doe", 1000.0, "Checking");
        
        account.displayAccountInfo();
        
        account.deposit(250.50);
        account.withdraw(100.0);
        account.withdraw(2000.0); // Should fail
        account.deposit(-50.0);   // Should fail
        
        // Direct access to private variables is not allowed
        // account.balance = 5000.0; // ❌ Error: balance is private
        
        // Must use public methods
        System.out.println("Final balance: $" + account.getBalance());
    }
}
```
                    
                

                
                    ### 🔹 4. Static vs Instance Members
                    
                        ```java
public class Counter {
    // Static variable (shared by all instances)
    private static int totalCount = 0;
    
    // Instance variable (unique to each object)
    private int instanceCount;
    private String name;
    
    // Constructor
    public Counter(String name) {
        this.name = name;
        this.instanceCount = 0;
        totalCount++; // Increment static counter when object is created
    }
    
    // Instance method
    public void increment() {
        instanceCount++;
        totalCount++;
        System.out.println(name + " incremented. Instance: " + instanceCount + 
                          ", Total: " + totalCount);
    }
    
    // Static method (can be called without creating an object)
    public static int getTotalCount() {
        return totalCount;
    }
    
    // Static method to reset total count
    public static void resetTotalCount() {
        totalCount = 0;
        System.out.println("Total count reset to 0");
    }
    
    // Instance method
    public void displayInfo() {
        System.out.println("Counter: " + name + 
                          ", Instance count: " + instanceCount +
                          ", Total count: " + totalCount);
    }
    
    // Static block (executed when class is first loaded)
    static {
        System.out.println("Counter class loaded!");
        totalCount = 0;
    }
}

public class CounterTest {
    public static void main(String[] args) {
        // Using static method without creating object
        System.out.println("Initial total count: " + Counter.getTotalCount());
        
        // Creating objects
        Counter counter1 = new Counter("Counter1");
        Counter counter2 = new Counter("Counter2");
        Counter counter3 = new Counter("Counter3");
        
        System.out.println("After creating 3 counters: " + Counter.getTotalCount());
        
        // Using instance methods
        counter1.increment();
        counter1.increment();
        counter2.increment();
        counter3.increment();
        counter3.increment();
        counter3.increment();
        
        // Display info for each counter
        counter1.displayInfo();
        counter2.displayInfo();
        counter3.displayInfo();
        
        System.out.println("Final total count: " + Counter.getTotalCount());
        
        // Reset using static method
        Counter.resetTotalCount();
        System.out.println("After reset: " + Counter.getTotalCount());
    }
}
```
                    
                

                
                    ### 🔹 5. Object Interaction
                    
                        ```java
// Teacher class
class Teacher {
    private String name;
    private String subject;
    private int experience;
    
    public Teacher(String name, String subject, int experience) {
        this.name = name;
        this.subject = subject;
        this.experience = experience;
    }
    
    public void teach(Student student) {
        System.out.println(name + " is teaching " + subject + " to " + student.getName());
    }
    
    // Getters
    public String getName() { return name; }
    public String getSubject() { return subject; }
    public int getExperience() { return experience; }
}

// Updated Student class
class Student {
    private String name;
    private int age;
    private String major;
    private double gpa;
    
    public Student(String name, int age, String major, double gpa) {
        this.name = name;
        this.age = age;
        this.major = major;
        this.gpa = gpa;
    }
    
    public void attendClass(Teacher teacher) {
        System.out.println(name + " is attending " + teacher.getSubject() + 
                          " class taught by " + teacher.getName());
    }
    
    public void study(String subject) {
        System.out.println(name + " is studying " + subject);
        // Simulate GPA improvement
        if (gpa 
                

                
                    ### 🔹 6. toString() Method
                    
                        ```java
public class Person {
    private String firstName;
    private String lastName;
    private int age;
    private String email;
    
    public Person(String firstName, String lastName, int age, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.email = email;
    }
    
    // Override toString() method for better object representation
    @Override
    public String toString() {
        return "Person{" +
               "firstName='" + firstName + '\'' +
               ", lastName='" + lastName + '\'' +
               ", age=" + age +
               ", email='" + email + '\'' +
               '}';
    }
    
    // Alternative toString() for user-friendly display
    public String toDisplayString() {
        return firstName + " " + lastName + " (" + age + " years old) - " + email;
    }
    
    // Getters
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFullName() { return firstName + " " + lastName; }
    public int getAge() { return age; }
    public String getEmail() { return email; }
}

public class PersonTest {
    public static void main(String[] args) {
        Person person1 = new Person("John", "Doe", 30, "john.doe@email.com");
        Person person2 = new Person("Jane", "Smith", 25, "jane.smith@email.com");
        
        // toString() is automatically called when printing objects
        System.out.println("Using toString():");
        System.out.println(person1); // Calls person1.toString()
        System.out.println(person2);
        
        // Using custom display method
        System.out.println("\nUsing custom display:");
        System.out.println(person1.toDisplayString());
        System.out.println(person2.toDisplayString());
        
        // Array of Person objects
        Person[] people = {person1, person2, 
                          new Person("Alice", "Johnson", 28, "alice.j@email.com")};
        
        System.out.println("\nArray of people:");
        for (Person person : people) {
            System.out.println(person.toDisplayString());
        }
    }
}
```