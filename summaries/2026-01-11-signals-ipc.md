https://en.wikipedia.org/wiki/Signal_(IPC)#SIGILL

## Related Summaries & Subjects
- [Event-Driven Architecture](../lessons-of-the-day/2026-01-07-event-driven-architecture.md) - Both involve asynchronous event handling and communication patterns
- [Bus Error](../summaries/2026-01-02-bus-error.md) - SIGBUS is another error signal similar to SIGILL

# Signals (IPC) - Inter-Process Communication

---

## 📚 Basic Summary

### What Are Signals?

**Signals** are standardized messages sent to running programs to trigger specific behavior. Think of them as **interrupt notifications** that tell a process "something happened - handle it!"

**Simple Analogy:**
- Like a doorbell interrupting what you're doing
- Like a phone call that needs immediate attention
- Like a fire alarm that requires action

### Key Concepts

**1. Purpose:**
- Interrupt, suspend, terminate, or kill processes
- Handle errors and exceptions
- Communicate between processes
- Respond to system events

**2. How They Work:**
- Operating system sends signal to process
- Process execution is interrupted
- Signal handler (if registered) executes
- Process resumes or terminates based on signal type

**3. Common Signals:**
- **SIGINT** (Ctrl-C) - Interrupt/terminate
- **SIGTERM** - Request termination
- **SIGKILL** - Force kill (cannot be caught)
- **SIGSEGV** - Segmentation fault
- **SIGILL** - Illegal instruction
- **SIGFPE** - Floating point exception

### SIGILL - Illegal Instruction

**SIGILL** is sent when a process tries to execute an **illegal instruction**:

**Causes:**
- Invalid CPU instruction
- Corrupted executable
- Architecture mismatch (e.g., x86 code on ARM)
- Malformed binary
- Stack corruption leading to invalid code execution

**Default Behavior:**
- Process terminates
- Core dump may be generated

**Example Scenario:**
```bash
# Running x86 binary on ARM processor
./x86_binary  # → SIGILL
```

---

## 🔬 Extended Summary

### History & Evolution

**Timeline:**
- **1971** (Unix V1): Separate system calls for interrupts, quits, traps
- **1972** (Unix V2): `kill` command introduced
- **1973** (Unix V4): Combined into single `signal()` call
- **1974** (Unix V5): Arbitrary signal sending
- **1979** (Unix V7): Symbolic signal names (SIGINT, SIGTERM, etc.)

### Signal Delivery Mechanism

**Process:**
1. **Signal Generation** - Event occurs (user action, hardware exception, system event)
2. **Signal Pending** - Signal queued for delivery
3. **Signal Delivery** - OS interrupts process execution
4. **Handler Execution** - Registered handler runs (or default action)
5. **Process Resumption** - Process continues or terminates

**Key Characteristics:**
- **Asynchronous** - Can arrive at any time
- **Interrupts** - Stops normal execution flow
- **Atomic** - Signal delivery is atomic operation
- **Non-blocking** - Signal delivery doesn't block sender

### Signal Types & Categories

**Termination Signals:**
- **SIGTERM** (15) - Graceful termination request
- **SIGKILL** (9) - Immediate termination (cannot be caught/ignored)
- **SIGQUIT** (3) - Termination with core dump
- **SIGINT** (2) - Interrupt (Ctrl-C)

**Error Signals:**
- **SIGSEGV** (11) - Segmentation violation (invalid memory access)
- **SIGBUS** (7) - Bus error (invalid memory alignment)
- **SIGILL** (4) - Illegal instruction
- **SIGFPE** (8) - Floating point exception
- **SIGABRT** (6) - Abort signal

**Control Signals:**
- **SIGSTOP** (19) - Stop process (cannot be caught)
- **SIGTSTP** (20) - Terminal stop (Ctrl-Z)
- **SIGCONT** (18) - Continue stopped process

**Other Signals:**
- **SIGCHLD** (17) - Child process terminated
- **SIGPIPE** (13) - Broken pipe
- **SIGHUP** (1) - Hangup (terminal closed)

### Signal Handling

**Handler Registration:**
```c
// Register signal handler
signal(SIGINT, handle_interrupt);

// Modern approach (sigaction)
struct sigaction sa;
sa.sa_handler = handle_interrupt;
sigaction(SIGINT, &sa, NULL);
```

**Handler Types:**
- **Custom Handler** - User-defined function
- **SIG_IGN** - Ignore signal
- **SIG_DFL** - Default action

**Uncatchable Signals:**
- **SIGKILL** - Cannot be caught, blocked, or ignored
- **SIGSTOP** - Cannot be caught, blocked, or ignored

### Signal Safety & Best Practices

**Async-Signal Safe Functions:**
- Only certain functions can be safely called from signal handlers
- Most standard library functions are **NOT** signal-safe
- Use `volatile sig_atomic_t` for shared variables

**Common Pitfalls:**
- ❌ Calling non-reentrant functions (malloc, printf) in handlers
- ❌ Modifying global state unsafely
- ❌ Long-running handlers
- ❌ Race conditions with signal delivery

**Best Practices:**
- ✅ Keep handlers minimal - set flags, not complex logic
- ✅ Use `volatile sig_atomic_t` for communication
- ✅ Queue signals for main thread processing
- ✅ Block signals during critical sections

### Hardware Exceptions & Signals

**Relationship:**
- Hardware exceptions (page fault, division by zero) → Kernel → Signal to process
- Kernel converts hardware exceptions to signals
- Process can handle or terminate

**Common Mappings:**
- **Page Fault** → SIGSEGV
- **Division by Zero** → SIGFPE
- **Invalid Instruction** → SIGILL
- **Alignment Error** → SIGBUS

### Signal Blocking & Masking

**Purpose:**
- Prevent signal delivery during critical sections
- Control when signals are processed

**Functions:**
```c
// Block signals
sigprocmask(SIG_BLOCK, &mask, NULL);

// Unblock signals
sigprocmask(SIG_UNBLOCK, &mask, NULL);

// Set signal mask
sigprocmask(SIG_SETMASK, &mask, NULL);
```

**Use Cases:**
- Critical sections (database transactions)
- Signal handler execution
- Initialization code

### Real-World Examples

**1. Graceful Shutdown:**
```c
void handle_terminate(int sig) {
    // Cleanup resources
    cleanup();
    exit(0);
}
signal(SIGTERM, handle_terminate);
```

**2. Error Recovery:**
```c
void handle_segfault(int sig) {
    // Log error, save state
    log_error();
    exit(1);
}
signal(SIGSEGV, handle_segfault);
```

**3. Process Control:**
```bash
# Send termination signal
kill -TERM <pid>

# Force kill
kill -KILL <pid>

# Suspend process
kill -STOP <pid>

# Resume process
kill -CONT <pid>
```

### Signal vs Interrupts

**Similarities:**
- Both interrupt normal execution
- Both are asynchronous
- Both require handling

**Differences:**
- **Interrupts** - Hardware-level, handled by kernel
- **Signals** - Software-level, handled by processes
- **Interrupts** - CPU-mediated
- **Signals** - Kernel-mediated

### Modern Alternatives

**Limitations of Signals:**
- Limited information (just signal number)
- Race conditions
- Async-signal safety constraints
- No guaranteed delivery order

**Modern IPC Alternatives:**
- **Message Queues** - Structured message passing
- **Pipes/Sockets** - Stream-based communication
- **Shared Memory** - High-performance data sharing
- **Event Loops** - Poll-based event handling

---

## 🎯 Key Takeaways

**For Beginners:**
- Signals are like notifications that interrupt programs
- Common signals: SIGINT (Ctrl-C), SIGTERM (terminate), SIGKILL (force kill)
- SIGILL means "illegal instruction" - usually a program error
- Signals can be caught and handled, except SIGKILL and SIGSTOP

**For Experienced Developers:**
- Signals are asynchronous, atomic, and can interrupt any non-atomic instruction
- Signal handlers must be async-signal safe
- Use `sigaction()` instead of `signal()` for better control
- Block signals during critical sections to prevent race conditions
- Hardware exceptions are converted to signals by the kernel

---

## 🔗 Related Subjects

- **Process Management** - Signals are fundamental to process control and lifecycle management
- **Exception Handling** - Signals are the low-level mechanism for handling system-level exceptions

---

*Summary created: 2026-01-11*

