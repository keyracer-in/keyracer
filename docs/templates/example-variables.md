# 💾 Variables in {Language}

Variables are containers for storing data values. They're fundamental to programming and allow you to work with data dynamically.

## What is a Variable?

A variable is a named location in memory that stores a value. Think of it as a labeled box where you can put data.

```{language}
# Creating a variable
name = "Alice"
age = 25
is_student = True
```

## Variable Declaration

### Basic Syntax

```{language}
# Syntax: variable_name = value
username = "john_doe"
score = 100
temperature = 98.6
```

### Multiple Assignment

```{language}
# Assign same value to multiple variables
x = y = z = 0

# Assign different values in one line
name, age, city = "Alice", 25, "New York"
```

## Naming Rules

### Valid Variable Names

```{language}
# ✅ Valid names
user_name = "Alice"
age2 = 25
_private = "hidden"
firstName = "John"
CONSTANT_VALUE = 100
```

### Invalid Variable Names

```{language}
# ❌ Invalid names
2age = 25           # Can't start with number
user-name = "Bob"   # Can't use hyphens
class = "Math"      # Can't use keywords
user name = "Eve"   # Can't have spaces
```

### Naming Conventions

**Variables and Functions:**
```{language}
# snake_case (Python, Ruby)
user_name = "Alice"
total_count = 100

# camelCase (JavaScript, Java)
userName = "Alice"
totalCount = 100
```

**Constants:**
```{language}
# UPPER_CASE
MAX_SIZE = 100
PI = 3.14159
DEFAULT_COLOR = "blue"
```

**Classes:**
```{language}
# PascalCase
class UserAccount:
    pass
```

## Variable Types

{Language} is [dynamically/statically] typed, meaning [explanation].

### Dynamic Typing Example

```{language}
# Variable can change type
x = 10          # x is an integer
x = "Hello"     # Now x is a string
x = [1, 2, 3]   # Now x is a list
```

### Type Checking

```{language}
# Check variable type
name = "Alice"
print(type(name))  # <class 'str'>

age = 25
print(type(age))   # <class 'int'>
```

## Data Types Overview

### Numbers

```{language}
# Integer
age = 25
count = -10
big_number = 1_000_000  # Underscores for readability

# Float
price = 19.99
temperature = -5.5
scientific = 1.5e-4  # Scientific notation

# Complex (if supported)
complex_num = 3 + 4j
```

### Strings

```{language}
# Single or double quotes
name = "Alice"
greeting = 'Hello'

# Multi-line strings
description = """
This is a
multi-line
string.
"""

# String operations
first_name = "John"
last_name = "Doe"
full_name = first_name + " " + last_name  # Concatenation
```

### Booleans

```{language}
# Boolean values
is_active = True
is_logged_in = False

# Boolean from comparison
is_adult = age >= 18
has_permission = user_role == "admin"
```

### None/Null

```{language}
# Represents absence of value
result = None
user_input = None

# Check for None
if result is None:
    print("No result yet")
```

## Variable Scope

### Local Variables

```{language}
def my_function():
    # Local variable - only exists inside function
    local_var = "I'm local"
    print(local_var)

my_function()
# print(local_var)  # Error: local_var doesn't exist here
```

### Global Variables

```{language}
# Global variable - accessible everywhere
global_var = "I'm global"

def my_function():
    print(global_var)  # Can read global variable

my_function()
print(global_var)  # Also accessible here
```

### Modifying Global Variables

```{language}
counter = 0

def increment():
    global counter  # Declare we're using global variable
    counter += 1

increment()
print(counter)  # 1
```

## Type Conversion

### Explicit Conversion

```{language}
# String to integer
age_str = "25"
age_int = int(age_str)  # 25

# Integer to string
count = 100
count_str = str(count)  # "100"

# String to float
price_str = "19.99"
price_float = float(price_str)  # 19.99

# Integer to float
whole = 10
decimal = float(whole)  # 10.0
```

### Implicit Conversion

```{language}
# Automatic type conversion
x = 10      # int
y = 3.5     # float
result = x + y  # 13.5 (float)
```

## Variable Operations

### Arithmetic Operations

```{language}
x = 10
y = 3

addition = x + y        # 13
subtraction = x - y     # 7
multiplication = x * y  # 30
division = x / y        # 3.333...
floor_division = x // y # 3
modulus = x % y         # 1
exponent = x ** y       # 1000
```

### Compound Assignment

```{language}
count = 10

count += 5   # count = count + 5  → 15
count -= 3   # count = count - 3  → 12
count *= 2   # count = count * 2  → 24
count /= 4   # count = count / 4  → 6.0
count //= 2  # count = count // 2 → 3.0
count %= 2   # count = count % 2  → 1.0
```

### Increment and Decrement

```{language}
# Python doesn't have ++ or --
count = 0
count += 1  # Increment
count -= 1  # Decrement

# Some languages support:
# count++  // Increment
# count--  // Decrement
```

## String Variables

### String Operations

```{language}
# Concatenation
first = "Hello"
second = "World"
combined = first + " " + second  # "Hello World"

# Repetition
laugh = "ha" * 3  # "hahaha"

# Length
name = "Alice"
length = len(name)  # 5

# Indexing
first_char = name[0]   # "A"
last_char = name[-1]   # "e"

# Slicing
substring = name[1:4]  # "lic"
```

### String Methods

```{language}
text = "Hello World"

# Case conversion
upper = text.upper()      # "HELLO WORLD"
lower = text.lower()      # "hello world"
title = text.title()      # "Hello World"

# Searching
index = text.find("World")  # 6
exists = "Hello" in text    # True

# Replacing
new_text = text.replace("World", "Python")  # "Hello Python"

# Splitting
words = text.split()  # ["Hello", "World"]

# Stripping whitespace
padded = "  text  "
clean = padded.strip()  # "text"
```

## Constants

Constants are variables that shouldn't change:

```{language}
# Use UPPER_CASE naming
MAX_USERS = 100
PI = 3.14159
DEFAULT_COLOR = "blue"
API_KEY = "abc123xyz"

# Note: In most languages, these are conventions
# The language doesn't prevent you from changing them
MAX_USERS = 200  # Technically allowed, but don't do this!
```

## Best Practices

### Use Descriptive Names

```{language}
# ❌ Bad
x = 25
y = "John"
z = True

# ✅ Good
user_age = 25
user_name = "John"
is_logged_in = True
```

### Initialize Variables

```{language}
# ✅ Good practice
total = 0
items = []
user = None

# Then use them
total += 10
items.append("apple")
```

### Avoid Magic Numbers

```{language}
# ❌ Bad
if age > 18:
    print("Adult")

# ✅ Good
ADULT_AGE = 18
if age > ADULT_AGE:
    print("Adult")
```

### Keep Scope Minimal

```{language}
# ✅ Good - variable only exists where needed
def calculate_total(items):
    total = 0  # Local to this function
    for item in items:
        total += item.price
    return total
```

## Common Mistakes

### Undefined Variables

```{language}
# ❌ Wrong
print(username)  # Error: username not defined

# ✅ Correct
username = "Alice"
print(username)
```

### Type Errors

```{language}
# ❌ Wrong
age = "25"
next_year = age + 1  # Error: can't add string and int

# ✅ Correct
age = 25
next_year = age + 1  # 26

# Or convert
age = "25"
next_year = int(age) + 1  # 26
```

### Overwriting Built-ins

```{language}
# ❌ Bad - overwrites built-in function
list = [1, 2, 3]  # Now list() function is broken

# ✅ Good
my_list = [1, 2, 3]
items = [1, 2, 3]
```

## Practice Exercises

### Exercise 1: Variable Swap

Swap the values of two variables:

```{language}
a = 10
b = 20

# Your code here

print(a)  # Should print 20
print(b)  # Should print 10
```

**Solution:**

```{language}
a = 10
b = 20

# Method 1: Using temporary variable
temp = a
a = b
b = temp

# Method 2: Using tuple unpacking (Python)
a, b = b, a
```

### Exercise 2: Calculate Area

Calculate the area of a rectangle:

```{language}
length = 10
width = 5

# Calculate area
area = length * width

print(f"Area: {area}")  # Area: 50
```

### Exercise 3: String Manipulation

```{language}
first_name = "john"
last_name = "doe"

# Create full name with proper capitalization
full_name = first_name.title() + " " + last_name.title()

print(full_name)  # John Doe
```

## Summary

Key points about variables:

- Variables store data values
- Use descriptive names following conventions
- {Language} is [dynamically/statically] typed
- Variables have scope (local vs global)
- Use constants for values that don't change
- Convert between types when needed

## Next Steps

Continue learning about:

- 🔢 [Data Types](#tutorials/{language}/data-types) - Deep dive into types
- 🔄 [Control Flow](#tutorials/{language}/control-flow) - If statements and loops
- 📦 [Collections](#tutorials/{language}/collections) - Lists, arrays, dictionaries

---

**Practice Tip**: Try creating variables for different types of data and experiment with operations on them!
