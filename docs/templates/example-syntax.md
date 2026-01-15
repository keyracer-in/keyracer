# 📝 {Language} Syntax Basics

Understanding the basic syntax is essential for writing {Language} code. This guide covers the fundamental rules and structure.

## Comments

Comments are notes in your code that are ignored by the {Language} interpreter/compiler.

### Single-Line Comments

```{language}
# This is a single-line comment
code_here()  # Comment after code
```

### Multi-Line Comments

```{language}
"""
This is a multi-line comment.
It can span multiple lines.
Useful for longer explanations.
"""
```

**When to use comments:**
- Explain complex logic
- Document function purposes
- Add TODO notes
- Disable code temporarily

## Indentation and Code Blocks

{Language} uses [indentation/braces] to define code blocks:

```{language}
# Example of proper indentation
if condition:
    # This code is inside the if block
    do_something()
    do_another_thing()
    
# This code is outside the if block
continue_here()
```

**Important Rules:**
- Use [4 spaces / 2 spaces / tabs] for indentation
- Be consistent throughout your code
- Mixing tabs and spaces causes errors

## Statements and Expressions

### Statements

A statement is a complete instruction:

```{language}
x = 10              # Assignment statement
print("Hello")      # Function call statement
if x > 5:           # Conditional statement
    pass
```

### Expressions

An expression produces a value:

```{language}
5 + 3               # Arithmetic expression → 8
x > 10              # Comparison expression → True/False
"Hello" + "World"   # String concatenation → "HelloWorld"
```

## Line Continuation

Break long lines for readability:

```{language}
# Using backslash
total = first_value + \
        second_value + \
        third_value

# Using parentheses (preferred)
total = (first_value +
         second_value +
         third_value)
```

## Semicolons

{Language} [requires/doesn't require] semicolons:

```{language}
# [Show examples based on language]
statement1()
statement2()

# Multiple statements on one line (not recommended)
statement1(); statement2()
```

## Case Sensitivity

{Language} is case-sensitive:

```{language}
variable = 10
Variable = 20  # Different variable!
VARIABLE = 30  # Also different!

print(variable)  # Outputs: 10
```

## Naming Conventions

Follow these conventions for readable code:

### Variables and Functions

```{language}
# Use snake_case (Python, Ruby)
user_name = "Alice"
calculate_total()

# Or camelCase (JavaScript, Java)
userName = "Alice"
calculateTotal()
```

### Constants

```{language}
# Use UPPER_CASE
MAX_SIZE = 100
PI = 3.14159
DEFAULT_COLOR = "blue"
```

### Classes

```{language}
# Use PascalCase
class UserAccount:
    pass

class ShoppingCart:
    pass
```

## Reserved Keywords

These words have special meaning and cannot be used as variable names:

```{language}
# Examples of reserved keywords
if, else, elif, while, for, break, continue
def, class, return, import, from, as
True, False, None, and, or, not
```

**Attempting to use keywords as names causes errors:**

```{language}
# ❌ Wrong
class = "Math"  # Error: 'class' is a keyword

# ✅ Correct
class_name = "Math"
```

## Operators

### Arithmetic Operators

```{language}
a = 10
b = 3

addition = a + b        # 13
subtraction = a - b     # 7
multiplication = a * b  # 30
division = a / b        # 3.333...
floor_division = a // b # 3
modulus = a % b         # 1
exponent = a ** b       # 1000
```

### Comparison Operators

```{language}
x = 5
y = 10

x == y  # Equal to → False
x != y  # Not equal to → True
x < y   # Less than → True
x > y   # Greater than → False
x <= y  # Less than or equal → True
x >= y  # Greater than or equal → False
```

### Logical Operators

```{language}
a = True
b = False

a and b  # Logical AND → False
a or b   # Logical OR → True
not a    # Logical NOT → False
```

## String Literals

### Single and Double Quotes

```{language}
single = 'Hello'
double = "World"
both_work = 'They\'re the same'
```

### Multi-Line Strings

```{language}
multi_line = """
This string
spans multiple
lines.
"""
```

### String Formatting

```{language}
name = "Alice"
age = 30

# Method 1: f-strings (modern)
message = f"My name is {name} and I'm {age} years old"

# Method 2: format()
message = "My name is {} and I'm {} years old".format(name, age)

# Method 3: Concatenation
message = "My name is " + name + " and I'm " + str(age) + " years old"
```

## Escape Sequences

Special characters in strings:

```{language}
newline = "Line 1\nLine 2"      # New line
tab = "Column1\tColumn2"        # Tab
backslash = "C:\\Users\\Name"   # Backslash
quote = "She said \"Hello\""    # Quote inside string
```

## Code Structure Example

Here's a complete example showing proper syntax:

```{language}
# Import statements at the top
import math

# Constants
MAX_ATTEMPTS = 3
DEFAULT_NAME = "Guest"

# Function definition
def greet_user(name=DEFAULT_NAME):
    """
    Greets the user with a personalized message.
    
    Args:
        name: The user's name (default: "Guest")
    
    Returns:
        A greeting string
    """
    # Function body with proper indentation
    greeting = f"Hello, {name}!"
    return greeting

# Main code
if __name__ == "__main__":
    # Get user input
    user_name = input("Enter your name: ")
    
    # Call function
    message = greet_user(user_name)
    
    # Display result
    print(message)
```

## Common Syntax Errors

### Missing Colon

```{language}
# ❌ Wrong
if x > 5
    print("Greater")

# ✅ Correct
if x > 5:
    print("Greater")
```

### Incorrect Indentation

```{language}
# ❌ Wrong
if x > 5:
print("Greater")  # Not indented

# ✅ Correct
if x > 5:
    print("Greater")  # Properly indented
```

### Unclosed Brackets

```{language}
# ❌ Wrong
my_list = [1, 2, 3

# ✅ Correct
my_list = [1, 2, 3]
```

### Mismatched Quotes

```{language}
# ❌ Wrong
message = "Hello'

# ✅ Correct
message = "Hello"
```

## Best Practices

1. **Be Consistent**: Choose a style and stick to it
2. **Use Meaningful Names**: `user_age` is better than `x`
3. **Add Comments**: Explain why, not what
4. **Keep Lines Short**: Max 80-100 characters per line
5. **Use Whitespace**: Separate logical sections with blank lines
6. **Follow PEP 8** (or equivalent style guide for your language)

## Style Guide Example

```{language}
# Good style
def calculate_total_price(items, tax_rate=0.08):
    """Calculate total price including tax."""
    subtotal = sum(item.price for item in items)
    tax = subtotal * tax_rate
    total = subtotal + tax
    return round(total, 2)

# Poor style
def calc(i,t=0.08):
    s=sum(x.price for x in i)
    return round(s+s*t,2)
```

## Practice Exercise

Try writing a program that:
1. Asks for the user's name
2. Asks for their age
3. Calculates birth year
4. Displays a formatted message

**Solution:**

```{language}
# Get user input
name = input("What's your name? ")
age = int(input("How old are you? "))

# Calculate birth year
current_year = 2024
birth_year = current_year - age

# Display result
print(f"Hello {name}! You were born around {birth_year}.")
```

## Next Steps

Now that you understand the basic syntax, you're ready to learn about:

- 💾 [Variables](#tutorials/{language}/variables) - Storing and using data
- 🔢 [Data Types](#tutorials/{language}/data-types) - Different kinds of data
- 🔄 [Control Flow](#tutorials/{language}/control-flow) - Making decisions

---

**Remember**: Good syntax is the foundation of clean, readable code. Take time to develop good habits early!
