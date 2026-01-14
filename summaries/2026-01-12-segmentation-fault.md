https://en.wikipedia.org/wiki/Segmentation_fault

## Related Summaries & Subjects
- [Signals (IPC)](../summaries/2026-01-11-signals-ipc.md) - Segmentation faults trigger SIGSEGV signal on Unix-like systems
- [Bus Error](../summaries/2026-01-02-bus-error.md) - Another type of memory access error, often confused with segmentation faults

# Segmentation Fault - Summary

---

## 📚 Basic Summary

### What is a Segmentation Fault?

A **segmentation fault** (often shortened to **segfault**) is a failure that occurs when a program tries to access memory it's not allowed to access. Think of it like trying to read someone else's private diary or write on a read-only document.

**Simple Analogy:**
- Like trying to enter a restricted area without permission
- Like trying to write on a read-only file
- Like trying to access a house that doesn't exist in your neighborhood

### Key Concepts

**1. What Happens:**
- Program attempts invalid memory access
- Hardware (MMU - Memory Management Unit) detects the violation
- Operating system sends SIGSEGV signal to the process
- Process typically crashes (or handles the signal if registered)

**2. Common Causes:**
- **Null pointer dereference** - Accessing memory through a null pointer
- **Dangling pointer** - Using a pointer to freed memory
- **Wild pointer** - Using an uninitialized pointer
- **Buffer overflow** - Writing beyond allocated memory
- **Stack overflow** - Exceeding stack memory limits
- **Writing to read-only memory** - Modifying code or constants

**3. Where It Occurs:**
- Most common in C/C++ (low-level memory access)
- Can occur in any language with unsafe memory operations
- Rare in managed languages (Java, Python, Rust) due to safety mechanisms

### Example Scenarios

**1. Null Pointer Dereference:**
```c
int* ptr = NULL;
*ptr = 10;  // Segmentation fault!
```

**2. Buffer Overflow:**
```c
char buffer[10];
strcpy(buffer, "This string is too long!");  // Overflow → segfault
```

**3. Dangling Pointer:**
```c
int* ptr = malloc(sizeof(int));
free(ptr);
*ptr = 5;  // Segmentation fault - memory already freed!
```

---

## 🔬 Extended Summary

### How Segmentation Faults Work

**Hardware Level:**
1. **Memory Management Unit (MMU)** monitors memory access
2. **Invalid Access Detected** - Address outside process space or wrong permissions
3. **Hardware Exception Raised** - CPU interrupts execution
4. **Kernel Handles Exception** - OS receives the fault

**Operating System Level:**
1. **Kernel Catches Fault** - Exception handler processes it
2. **Signal Sent** - SIGSEGV sent to offending process (Unix/Linux)
3. **Process Response** - Default handler terminates process, or custom handler executes

**Process Level:**
- **Default Behavior** - Process terminates, core dump may be created
- **Custom Handler** - Process can catch SIGSEGV and attempt recovery
- **Debugging** - Core dump analyzed to find root cause

### Memory Protection & Address Spaces

**Memory Segments:**
- **Code Segment** - Read-only, contains program instructions
- **Data Segment** - Read-write, contains variables
- **Stack** - Read-write, contains function calls and local variables
- **Heap** - Read-write, contains dynamically allocated memory

**Access Rules:**
- ✅ Can read from code, data, stack, heap
- ✅ Can write to data, stack, heap
- ❌ Cannot write to code segment (read-only)
- ❌ Cannot access memory outside process address space

**Why "Segmentation"?**
- Refers to the program's address space being divided into segments
- Each segment has specific permissions (read, write, execute)
- Violating these permissions causes a segmentation fault

### Common Causes in Detail

**1. Null Pointer Dereference**

**What It Is:**
- Pointer that points to address 0 (NULL)
- NULL is not a valid memory address
- Dereferencing it always causes segfault

**Example:**
```c
char* str = NULL;
int len = strlen(str);  // Segfault - trying to read from NULL
```

**Prevention:**
```c
if (ptr != NULL) {
    *ptr = value;  // Safe
}
```

**2. Dangling Pointer**

**What It Is:**
- Pointer to memory that has been freed/deallocated
- Memory may be reused by other code
- Accessing it leads to unpredictable behavior or segfault

**Example:**
```c
int* create_array() {
    int* arr = malloc(10 * sizeof(int));
    return arr;
}

void use_array() {
    int* arr = create_array();
    free(arr);
    arr[0] = 5;  // Dangling pointer - segfault or corruption
}
```

**Prevention:**
```c
free(ptr);
ptr = NULL;  // Set to NULL after freeing
```

**3. Wild Pointer**

**What It Is:**
- Uninitialized pointer contains random address
- Points to unknown memory location
- Accessing it may cause segfault or read garbage data

**Example:**
```c
int* ptr;  // Not initialized
*ptr = 10;  // Wild pointer - unpredictable behavior
```

**Prevention:**
```c
int* ptr = NULL;  // Always initialize
// or
int* ptr = malloc(sizeof(int));  // Allocate memory first
```

**4. Buffer Overflow**

**What It Is:**
- Writing beyond allocated buffer boundaries
- Can overwrite adjacent memory
- May corrupt data or cause segfault

**Example:**
```c
char buffer[5];
strcpy(buffer, "Hello World!");  // Overflow - writes beyond buffer
```

**Prevention:**
```c
char buffer[5];
strncpy(buffer, "Hello World!", sizeof(buffer) - 1);
buffer[sizeof(buffer) - 1] = '\0';  // Ensure null terminator
```

**5. Stack Overflow**

**What It Is:**
- Exceeding stack memory limits
- Usually from infinite recursion or very deep call stack
- Stack grows beyond allocated space

**Example:**
```c
void infinite_recursion() {
    infinite_recursion();  // Stack overflow
}
```

**Prevention:**
- Limit recursion depth
- Use iterative algorithms
- Increase stack size if needed

**6. Writing to Read-Only Memory**

**What It Is:**
- Attempting to modify code segment or constants
- String literals are often in read-only memory
- Modifying them causes segfault

**Example:**
```c
char* str = "Hello";  // String literal in read-only memory
str[0] = 'h';  // Segfault - trying to write to read-only memory
```

**Prevention:**
```c
char str[] = "Hello";  // Array (writable)
str[0] = 'h';  // OK
```

### Segmentation Fault vs Bus Error

**Similarities:**
- Both are memory access errors
- Both cause program crashes
- Both are hardware-detected faults

**Differences:**

| Aspect | Segmentation Fault | Bus Error |
|--------|-------------------|-----------|
| **Cause** | Invalid *logical* address or permissions | Invalid *physical* address or alignment |
| **Level** | Virtual memory violation | Physical memory violation |
| **Common Cause** | Null pointer, buffer overflow | Unaligned access, non-existent physical address |
| **Signal** | SIGSEGV | SIGBUS |
| **Frequency** | Very common | Rare (modern systems) |

**Key Distinction:**
- **Segfault** - "You're not allowed to access this memory"
- **Bus Error** - "This memory doesn't physically exist or is misaligned"

### Handling Segmentation Faults

**1. Default Handling:**
- Process terminates immediately
- Core dump may be generated (if enabled)
- Error message displayed

**2. Custom Signal Handler:**
```c
#include <signal.h>
#include <stdio.h>

void segfault_handler(int sig) {
    fprintf(stderr, "Segmentation fault caught!\n");
    // Attempt cleanup
    exit(1);
}

int main() {
    signal(SIGSEGV, segfault_handler);
    // ... code that might segfault
    return 0;
}
```

**3. Prevention Strategies:**
- **Bounds Checking** - Always check array/pointer bounds
- **Null Checks** - Verify pointers before dereferencing
- **Memory Management** - Proper allocation/deallocation
- **Static Analysis** - Use tools to detect potential issues
- **Safe Languages** - Use languages with built-in safety (Rust, Java)

### Debugging Segmentation Faults

**Tools:**
- **GDB (GNU Debugger)** - Step through code, inspect memory
- **Valgrind** - Memory error detector
- **AddressSanitizer** - Runtime memory error detector
- **Core Dumps** - Analyze crash dumps

**Example with GDB:**
```bash
# Compile with debug symbols
gcc -g program.c -o program

# Run with GDB
gdb ./program

# When segfault occurs:
(gdb) backtrace  # Show call stack
(gdb) print ptr  # Inspect variables
(gdb) info registers  # Check register values
```

**Example with Valgrind:**
```bash
valgrind --leak-check=full ./program
# Shows memory errors, leaks, and invalid accesses
```

### Language-Specific Considerations

**C/C++:**
- Most prone to segfaults
- Manual memory management
- No automatic bounds checking
- Pointers can be dangerous

**Rust:**
- Ownership system prevents many segfaults
- Compile-time memory safety
- Still possible with unsafe code

**Java/Python:**
- Garbage collection prevents dangling pointers
- Bounds checking prevents buffer overflows
- Rare segfaults (usually in native code)

**JavaScript:**
- Managed memory
- No direct pointer access
- Segfaults extremely rare

### Real-World Examples

**1. Web Server Crash:**
```c
// Server receives request with oversized buffer
char buffer[256];
read(fd, buffer, 4096);  // Buffer overflow → segfault → server crash
```

**2. Image Processing:**
```c
// Processing image with invalid dimensions
int* pixels = malloc(width * height * sizeof(int));
// Later: width/height corrupted
pixels[invalid_index] = value;  // Out of bounds → segfault
```

**3. Database Connection:**
```c
// Connection closed but pointer still used
DBConnection* conn = connect();
disconnect(conn);
query(conn, "SELECT * FROM users");  // Dangling pointer → segfault
```

### Best Practices to Avoid Segfaults

**1. Always Initialize Pointers:**
```c
int* ptr = NULL;  // Good
// Not: int* ptr;  // Bad
```

**2. Check Before Dereferencing:**
```c
if (ptr != NULL) {
    *ptr = value;
}
```

**3. Use Bounds Checking:**
```c
if (index >= 0 && index < array_size) {
    array[index] = value;
}
```

**4. Set Pointers to NULL After Freeing:**
```c
free(ptr);
ptr = NULL;  // Prevents accidental reuse
```

**5. Use Safe String Functions:**
```c
strncpy(dest, src, dest_size - 1);  // Instead of strcpy
```

**6. Validate Input:**
```c
if (size > 0 && size < MAX_SIZE) {
    allocate(size);
}
```

---

## 🎯 Key Takeaways

**For Beginners:**
- Segmentation fault = program tried to access forbidden memory
- Most common cause: null pointer or buffer overflow
- Usually crashes the program immediately
- Common in C/C++, rare in managed languages
- Always check pointers before using them

**For Experienced Developers:**
- Segfaults are hardware-detected memory protection violations
- MMU raises exception → kernel sends SIGSEGV → process handles or terminates
- Different from bus errors (logical vs physical address issues)
- Can be caught with signal handlers, but recovery is difficult
- Use debugging tools (GDB, Valgrind) to find root causes
- Prevention: bounds checking, null checks, proper memory management
- Modern languages (Rust, Java) prevent most segfaults through safety mechanisms

---

## 🔗 Related Subjects

- **Memory Management** - Understanding how memory allocation and deallocation works helps prevent segfaults
- **Pointer Safety** - Proper pointer usage is crucial for avoiding segmentation faults
- **Debugging Techniques** - Learning to debug segfaults is essential for low-level programming

---

*Summary created: 2026-01-12*



