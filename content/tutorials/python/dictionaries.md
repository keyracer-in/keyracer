# Python Dictionaries

## Creating Dictionaries

```python
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}
```

## Accessing Values

```python
name = person["name"]
age = person.get("age")
```

## Modifying

```python
person["age"] = 31
person["email"] = "john@example.com"
del person["city"]
```