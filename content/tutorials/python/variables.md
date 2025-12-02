# 📝 Python Variables

## 🧠 What Are Variables in Python?

A variable is like a container that holds data. It stores values you want to use in your program.

## 🔹 1. Declaring a Variable

Python does not require you to declare the type of variable. Just assign a value using `=`.

```python
x = 5              # Integer
name = "Alice"     # String
price = 19.99      # Float
is_valid = True    # Boolean
```

## 🔹 2. Variable Naming Rules

### ✅ Valid names:
- Start with a letter or underscore `_`
- Followed by letters, digits, or underscores
- Case-sensitive (name and Name are different)

### ❌ Invalid names:
```python
2name = "Ali"      # ❌ Cannot start with a digit
user-name = "Ali"  # ❌ Hyphens not allowed
```

### ✅ Valid examples:
```python
user_name = "Ali"
_user = "hidden"
Name1 = "John"
```

## 🔹 3. Data Types Stored in Variables

```python
integer = 42
float_num = 3.14
string = "Hello"
boolean = True
list_var = [1, 2, 3]
dict_var = {"key": "value"}
```

## 🔹 4. Checking the Type of a Variable

```python
x = 10
print(type(x))    # Output: <class 'int'>
```

## 🔹 5. Multiple Assignments

You can assign multiple variables at once:

```python
a, b, c = 1, 2, 3
print(a, b, c)  # Output: 1 2 3

# Assigning the same value to multiple variables:
x = y = z = 0
```

## 🔹 6. Constants (By Convention)

Python doesn't have true constants, but you can use uppercase names to indicate a value shouldn't change.

```python
PI = 3.14159
MAX_USERS = 100
```

🔒 These can still be changed in code, but shouldn't be.

## 🔹 7. Type Casting (Changing Variable Types)

```python
x = str(10)       # '10'
y = int("5")      # 5
z = float("3.14") # 3.14
```

## 🔹 8. Deleting a Variable

```python
x = 10
del x
```

Trying to use x after this will give an error.