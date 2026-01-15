# ☕ Getting Started with Java
                
                
                    ### 📌 1. What You Need to Begin
                    - A computer (Windows, macOS, or Linux)
- Internet connection (for downloading JDK)
- A text editor or IDE (like IntelliJ IDEA, Eclipse, or VS Code)
- Java Development Kit (JDK)

                

                
                    ### 📌 2. Installing Java Development Kit (JDK)
                    #### ✅ Official Website:
                    Download JDK from: 👉 [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [Eclipse Temurin](https://adoptium.net/)

                    
                    #### 📦 Steps:
                    1. Choose the latest LTS version (Java 21 recommended)
2. Select your operating system
3. Download and run the installer
4. Follow the installation wizard

                    
                    #### ✅ Verify Installation:
                    Open your terminal (CMD, PowerShell, or Bash):

                    
                        ```bash
java --version
```
                    
                    and

                    
                        ```bash
javac --version
```
                    
                

                
                    ### 📌 3. Setting up JAVA_HOME (Important!)
                    #### 🪟 Windows:
                    1. Right-click "This PC" → Properties
2. Advanced System Settings → Environment Variables
3. New System Variable: JAVA_HOME
4. Value: Path to JDK (e.g., C:\Program Files\Java\jdk-21)

                    
                    #### 🐧 Linux/macOS:
                    
                        ```bash
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$PATH
```
                    
                

                
                    ### 📌 4. Your First Java Program
                    #### ✅ Create a file named HelloWorld.java:
                    
                        ```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Java World!");
    }
}
```
                    
                    
                    #### ✅ Compile and Run:
                    
                        ```bash
# Compile
javac HelloWorld.java

# Run
java HelloWorld
```
                    
                    💡 **Important:** File name must match the class name!

                

                
                    ### 📌 5. Java Development Tools
                    #### 🔧 IDEs (Integrated Development Environments):
                    - **IntelliJ IDEA:** Most popular, excellent features
- **Eclipse:** Free, widely used in enterprise
- **VS Code:** Lightweight with Java extensions
- **NetBeans:** Official Oracle IDE

                    
                    #### 📝 Text Editors:
                    - Sublime Text, Atom, Vim, Emacs

                    
                    #### 🌐 Online Compilers:
                    - repl.it, codepen.io, jdoodle.com

                

                
                    ### 📌 6. Java File Structure
                    - Java files end with `.java`
- Compiled files end with `.class`
- Each public class must be in its own file
- File name must match the public class name
- Java is case-sensitive

                

                
                    ### 📌 7. Understanding the Hello World Program
                    
                        ```java
public class HelloWorld {           // Class declaration
    public static void main(String[] args) {  // Main method
        System.out.println("Hello, World!");  // Print statement
    }                                   // End of main method
}                                      // End of class
```
                    
                    
                    #### 🔍 Breakdown:
                    - `public class HelloWorld` - Defines a public class
- `main` - Entry point of the program
- `String[] args` - Command-line arguments
- `System.out.println()` - Prints text to console