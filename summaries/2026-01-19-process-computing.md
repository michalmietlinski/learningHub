https://en.wikipedia.org/wiki/Process_(computing)

## Related Summaries & Subjects
- [Signals (IPC)](../summaries/2026-01-11-signals-ipc.md) - Processes communicate and are controlled through signals
- [Segmentation Fault](../summaries/2026-01-12-segmentation-fault.md) - Process errors that occur when accessing invalid memory
- [Bus Error](../summaries/2026-01-02-bus-error.md) - Process errors related to invalid memory access

# Process (Computing) - Summary

---

## 📚 Basic Summary

### What is a Process?

**Process** is an instance of a computer program that is being executed by one or many threads. While a computer program is a passive collection of instructions stored in a file, a process is the active execution of those instructions after being loaded into memory.

**Simple Analogy:**
- Like a recipe (program) vs cooking (process) - the recipe is the instructions, cooking is the actual activity
- Like a blueprint (program) vs construction (process) - blueprint is the plan, construction is the work
- Like sheet music (program) vs performance (process) - music is written, performance is playing it

### Key Concepts

**1. Program vs Process:**
- **Program**: Passive collection of instructions stored on disk
- **Process**: Active execution of those instructions in memory
- **Multiple Processes**: Several processes can run the same program simultaneously
- Example: Opening multiple browser windows = multiple processes from same program

**2. Process Components:**
- **Program Code**: Executable machine code loaded into memory
- **Memory**: Virtual memory space (code, data, stack, heap)
- **Resources**: File descriptors, handles, allocated system resources
- **Security**: Process owner, permissions, access rights
- **State**: Processor registers, execution context

**3. Process Management:**
- Operating system manages all processes
- Process Control Block (PCB) stores process information
- Processes are isolated from each other
- Operating system allocates resources to processes

**4. Multitasking:**
- Multiple processes can run "simultaneously"
- CPU switches between processes rapidly
- Creates illusion of parallel execution
- Each CPU core executes one process at a time

### Real-World Examples

**1. Operating System:**
- Each running application is a process
- System services run as processes
- Multiple processes share CPU time
- Process manager (Task Manager, htop) shows all processes

**2. Web Browser:**
- Each browser tab may be a separate process
- Isolates crashes (one tab crash doesn't kill browser)
- Better security and stability
- Modern browsers use process-per-tab model

**3. Server Applications:**
- Web server handles multiple requests
- Each request may spawn new process
- Process pool for efficiency
- Isolated processing of requests

**4. Development:**
- Running a program creates a process
- Debugger attaches to process
- Process can spawn child processes
- Process communication for coordination

### Why It Matters

- **Isolation**: Processes are isolated, preventing interference
- **Security**: Each process has its own permissions and resources
- **Stability**: Process crash doesn't affect other processes
- **Efficiency**: Operating system manages resource sharing
- **Concurrency**: Multiple processes enable multitasking

---

## 🔬 Extended Summary

### Process Representation

**Process Control Block (PCB):**
- Data structure containing process information
- Stored by operating system
- Contains all information needed to manage process

**Process Resources:**

**1. Executable Code:**
- Machine code image loaded into memory
- Program instructions ready for execution
- May be shared between processes (same program)

**2. Memory:**
- **Virtual Memory**: Process-specific memory space
- **Code Segment**: Executable instructions
- **Data Segment**: Process-specific data (input/output)
- **Stack**: Call stack for active subroutines
- **Heap**: Dynamic memory allocation

**3. System Resources:**
- **File Descriptors** (Unix) or **Handles** (Windows)
- Open files, network connections
- Data sources and sinks
- Allocated system resources

**4. Security Attributes:**
- Process owner (user ID)
- Process permissions (allowable operations)
- Access rights
- Security context

**5. Processor State:**
- Content of CPU registers
- Physical memory addressing
- Execution context
- Stored in registers when executing, in memory when not

### Process States

**State Transitions:**

**1. Created:**
- Process loaded from disk into memory
- Initialized by operating system
- Assigned initial resources
- Ready to be scheduled

**2. Waiting (Ready):**
- Process ready to execute
- Waiting for CPU time
- Scheduler will assign CPU when available
- May wait in ready queue

**3. Running:**
- Process currently executing on CPU
- Using processor resources
- Executing instructions
- Only one process per CPU core at a time

**4. Blocked:**
- Process waiting for resource
- Waiting for I/O operation
- Waiting for user input
- Waiting for file to open
- Not eligible for CPU

**5. Terminated:**
- Process finished execution
- Or terminated by operating system
- Resources being cleaned up
- Waiting to be removed from memory

**State Diagram:**
```
Created → Waiting → Running → Terminated
           ↑    ↓      ↓
           └───┴──────┘
         (Blocked)
```

**Key Points:**
- Processes transition between states
- Only one process running per CPU core
- Blocked processes don't use CPU
- Scheduler manages state transitions

### Multitasking and Process Management

**Multitasking:**
- Method to allow multiple processes to share processors
- Each CPU core executes one process at a time
- Rapid switching creates illusion of parallel execution
- Processes share CPU and other system resources

**Preemption:**
- Process can be interrupted and switched out
- Operating system scheduler decides when to switch
- Switches occur when:
  - Process waits for I/O
  - Process voluntarily yields CPU
  - Hardware interrupt occurs
  - Process uses fair share of CPU time

**Time-Sharing:**
- Method for interleaving execution of processes
- Rapid context switches
- Makes it seem like multiple processes execute simultaneously
- Called "concurrency" (seemingly simultaneous execution)

**Process Priority:**
- Interactive processes get higher priority
- CPU-bound processes get lower priority
- Real-time processes (video, music) get real-time priority
- Preempts lower priority processes

**Context Switching:**
- Saving state of current process
- Loading state of next process
- Switching CPU to new process
- Rapid switching enables multitasking

### Process Isolation

**Purpose:**
- Prevent processes from interfering with each other
- Provide security and reliability
- Isolate crashes and errors
- Control resource access

**Mechanisms:**
- **Memory Protection**: Each process has own memory space
- **Resource Isolation**: Processes can't access each other's resources
- **Security**: Process permissions control access
- **IPC Control**: Mediated inter-process communication

**Benefits:**
- Process crash doesn't affect others
- Security (process can't access others' data)
- Stability (isolated failures)
- Controlled resource sharing

### Inter-Process Communication (IPC)

**Purpose:**
- Processes need to communicate and coordinate
- Share data between processes
- Coordinate activities
- Synchronize operations

**IPC Methods:**

**1. Pipes:**
- Unidirectional data flow
- Parent-child process communication
- Standard input/output redirection

**2. Message Queues:**
- Messages sent between processes
- Asynchronous communication
- Persistent or temporary

**3. Shared Memory:**
- Processes share memory region
- Fastest IPC method
- Requires synchronization

**4. Sockets:**
- Network-based communication
- Can be local or remote
- Standard network protocols

**5. Signals:**
- Simple notifications
- Process control (terminate, pause)
- Event notifications

**6. Semaphores:**
- Synchronization mechanism
- Control access to shared resources
- Prevent race conditions

**Security:**
- Modern OSes prevent direct communication
- Strictly mediated and controlled IPC
- Security checks on IPC operations
- Prevents unauthorized access

### Process vs Thread vs Program

**Program:**
- Passive collection of instructions
- Stored on disk
- Static code

**Process:**
- Active execution of program
- Has own memory space
- Has own resources
- Isolated from other processes

**Thread:**
- Lightweight process
- Shares memory with other threads in same process
- Multiple threads in one process
- Faster than process creation

**Relationship:**
```
Program (on disk)
    ↓
Process (in memory) - has own memory, resources
    ↓
Threads (within process) - share process memory
```

### Process Models

**Single-Threaded Process:**
- One thread of execution
- Traditional process model
- Simpler but less efficient

**Multi-Threaded Process:**
- Multiple threads of execution
- Threads share process memory
- More efficient for parallel tasks
- Requires synchronization

**Lightweight Processes:**
- Some OSes have lightweight process models
- Hybrid between processes and threads
- Varies by operating system

### Process Scheduling

**Scheduler:**
- Operating system component
- Decides which process runs when
- Manages process priorities
- Balances fairness and efficiency

**Scheduling Algorithms:**
- **Round-Robin**: Each process gets time slice
- **Priority-Based**: Higher priority processes run first
- **Fair Scheduling**: All processes get fair share
- **Real-Time**: Time-critical processes get guaranteed time

**Context Switch:**
- Saving current process state
- Loading next process state
- Switching CPU to new process
- Overhead but necessary for multitasking

### Memory Management

**Virtual Memory:**
- Each process has virtual memory space
- OS maps virtual to physical memory
- Processes isolated in memory
- Memory protection prevents access violations

**Memory Layout:**
- **Code**: Executable instructions
- **Data**: Static variables
- **Heap**: Dynamic allocation
- **Stack**: Function calls, local variables

**Swapping:**
- Blocked processes can be swapped to disk
- Frees physical memory
- Transparent to process
- Even active process portions can be swapped if unused

### Process Lifecycle

**1. Creation:**
- Program loaded from disk
- Process Control Block created
- Memory allocated
- Initial state: Created

**2. Execution:**
- Process scheduled to run
- Executes instructions
- Uses CPU and resources
- Transitions between states

**3. Termination:**
- Normal termination (program finishes)
- Abnormal termination (error, killed)
- Resources cleaned up
- Process removed from system

**Child Processes:**
- Process can spawn child processes
- Parent-child relationship
- Child inherits some parent properties
- Can communicate via IPC

### Process in Different Operating Systems

**Unix/Linux:**
- Process ID (PID) uniquely identifies process
- Process tree (parent-child relationships)
- Signals for process control
- File descriptors for I/O

**Windows:**
- Process handle identifies process
- Process and thread objects
- Handles for resources
- Different process model

**Embedded Systems:**
- Processes often called "tasks"
- Lightweight process models
- Real-time constraints
- Limited resources

---

## 🔍 Technical Details

### Process Control Block (PCB)

**Contents:**
- Process ID (PID)
- Process state
- Program counter (next instruction)
- CPU registers
- Memory management information
- I/O status information
- Accounting information
- Priority

**Purpose:**
- Store all process information
- Enable context switching
- Track process state
- Manage process resources

### Process States in Detail

**Created State:**
- Process being initialized
- Resources being allocated
- Not yet ready to run
- Transitions to Waiting

**Waiting/Ready State:**
- Process ready to execute
- Waiting for CPU time
- In ready queue
- Scheduler will select when CPU available

**Running State:**
- Process executing on CPU
- Using processor resources
- Can transition to:
  - Waiting (I/O request)
  - Blocked (waiting for resource)
  - Terminated (finished)

**Blocked State:**
- Process waiting for event
- Not using CPU
- Waiting for:
  - I/O completion
  - Resource availability
  - User input
  - Signal

**Terminated State:**
- Process finished
- Resources being released
- Being removed from system
- Final cleanup

### Context Switching

**What is Context:**
- CPU register values
- Program counter
- Stack pointer
- Memory management info
- Process state

**Context Switch Process:**
1. Save current process context
2. Update PCB with current state
3. Select next process to run
4. Load next process context
5. Resume execution of new process

**Overhead:**
- Context switching has cost
- Time spent saving/loading state
- Cache misses
- Necessary for multitasking

### Process Isolation Mechanisms

**Memory Protection:**
- Each process has own address space
- Virtual memory mapping
- Hardware memory protection
- Prevents unauthorized access

**Resource Isolation:**
- Processes can't access each other's files
- Separate file descriptors
- Isolated network connections
- Controlled resource sharing

**Security:**
- Process runs with user permissions
- Can't exceed user privileges
- OS enforces access control
- Prevents privilege escalation

---

## 💡 Process Management Concepts

### Process Creation

**Methods:**
- **Fork**: Create copy of current process (Unix)
- **Exec**: Replace process with new program
- **Spawn**: Create new process (Windows)
- **Clone**: Create process with shared resources (Linux)

**Fork-Exec Pattern:**
```
1. Parent process calls fork()
2. Creates child process (copy of parent)
3. Child process calls exec()
4. Child process replaced with new program
```

### Process Termination

**Normal Termination:**
- Process completes execution
- Returns exit code
- Resources cleaned up
- Parent notified

**Abnormal Termination:**
- Process error/crash
- Killed by signal
- Resource exhaustion
- Operating system termination

**Zombie Process:**
- Process terminated but not cleaned up
- Parent hasn't read exit status
- Remains in process table
- Eventually cleaned up

### Process Hierarchy

**Process Tree:**
- Root process (init/systemd)
- Parent-child relationships
- Process groups
- Session management

**Orphan Process:**
- Parent process terminated
- Child becomes orphan
- Adopted by init process
- Continues running

**Daemon Process:**
- Background process
- No controlling terminal
- Runs independently
- System services

---

## 🌍 Real-World Applications

### 1. Operating System

**System Processes:**
- Kernel processes
- System services
- Device drivers
- Background daemons

**User Processes:**
- Applications
- User programs
- Interactive processes
- Background tasks

### 2. Web Servers

**Process Model:**
- Master process manages workers
- Worker processes handle requests
- Process pool for efficiency
- Isolated request processing

**Example:**
- Apache: Multiple worker processes
- Nginx: Worker process model
- Each request handled by process
- Crash isolation

### 3. Development Environment

**Process Management:**
- IDE runs as process
- Build tools spawn processes
- Debugger attaches to process
- Process monitoring tools

### 4. Containerization

**Docker/Containers:**
- Containers run processes
- Process isolation
- Resource limits per process
- Process namespace isolation

---

## ⚠️ Common Issues

### 1. Process Leaks

**Problem:**
- Processes not properly terminated
- Accumulate over time
- Consume resources
- System slowdown

**Solution:**
- Proper process cleanup
- Monitor process count
- Automatic cleanup mechanisms
- Resource limits

### 2. Zombie Processes

**Problem:**
- Terminated process not cleaned up
- Parent hasn't read exit status
- Consumes process table entry
- Can't be killed (already dead)

**Solution:**
- Parent must wait for child
- Signal handlers for cleanup
- Init process adopts orphans
- Automatic cleanup

### 3. Orphan Processes

**Problem:**
- Parent dies, child continues
- Child becomes orphan
- May run indefinitely
- Resource consumption

**Solution:**
- Init process adopts orphans
- Process groups
- Proper parent-child management
- Monitoring

### 4. Resource Exhaustion

**Problem:**
- Too many processes
- Each process uses resources
- System runs out of resources
- Performance degradation

**Solution:**
- Process limits
- Resource quotas
- Monitoring
- Process prioritization

---

## ✅ Best Practices

### 1. Process Design

✅ **Do:**
- Design processes for isolation
- Use proper error handling
- Clean up resources
- Handle signals properly

❌ **Don't:**
- Create unnecessary processes
- Leak resources
- Ignore error handling
- Block indefinitely

### 2. Process Communication

✅ **Do:**
- Use appropriate IPC method
- Secure IPC channels
- Handle IPC errors
- Synchronize properly

❌ **Don't:**
- Use insecure IPC
- Ignore synchronization
- Assume IPC always works
- Create race conditions

### 3. Resource Management

✅ **Do:**
- Release resources when done
- Set resource limits
- Monitor resource usage
- Handle resource exhaustion

❌ **Don't:**
- Leak resources
- Ignore limits
- Over-allocate resources
- Assume unlimited resources

---

## 🔀 Process vs Related Concepts

### Process vs Thread

**Process:**
- Own memory space
- Isolated resources
- Heavier (more overhead)
- Independent execution

**Thread:**
- Shares process memory
- Lighter weight
- Faster creation
- Requires synchronization

**Key Difference:** Process has own memory, thread shares process memory.

### Process vs Program

**Program:**
- Static code on disk
- Passive instructions
- Can be executed multiple times

**Process:**
- Active execution
- In memory
- Running instance

**Key Difference:** Program is code, process is execution.

### Process vs Task

**Process:**
- General computing term
- Used in most operating systems
- Full process model

**Task:**
- Often used in embedded systems
- May be lighter weight
- Real-time systems

**Key Difference:** Terminology, similar concepts.

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Isolation**
- Processes isolated from each other
- Crash doesn't affect others
- Security boundaries
- Resource protection

✅ **Security**
- Process permissions
- Access control
- Isolated execution
- Controlled IPC

✅ **Stability**
- Isolated failures
- Process can be restarted
- System continues running
- Better reliability

✅ **Multitasking**
- Multiple processes run
- Better resource utilization
- Responsive system
- Parallel execution

### Trade-offs

❌ **Overhead**
- Process creation has cost
- Context switching overhead
- Memory per process
- Resource consumption

❌ **Complexity**
- Process management complex
- IPC coordination needed
- Synchronization required
- More moving parts

❌ **Resource Usage**
- Each process uses memory
- Process table entries
- File descriptors
- System resources

---

## 🎓 Summary

### Key Takeaways

1. **Process** is active execution of program
2. **Program** is passive code, **Process** is active execution
3. **Process States**: Created, Waiting, Running, Blocked, Terminated
4. **Multitasking** allows multiple processes to share CPU
5. **Isolation** prevents processes from interfering
6. **IPC** enables process communication
7. **Process Control Block** stores process information
8. **Context Switching** enables multitasking

### Common Uses

- **Applications**: Each running app is a process
- **System Services**: Background processes
- **Servers**: Worker processes handle requests
- **Development**: Running and debugging programs

### Next Steps

After understanding Processes, consider:
- **Threads** - Lightweight processes within process
- **Inter-Process Communication** - How processes communicate
- **Process Scheduling** - How OS decides which process runs
- **Memory Management** - How processes use memory

---

## 🔗 Related Subjects

- [Signals (IPC)](../summaries/2026-01-11-signals-ipc.md): Processes are controlled and communicate through signals
- [Segmentation Fault](../summaries/2026-01-12-segmentation-fault.md): Process errors that occur when accessing invalid memory
- [Bus Error](../summaries/2026-01-02-bus-error.md): Process errors related to invalid memory access

---

*Summary created: 2026-01-19*

*Source: [Wikipedia - Process (computing)](https://en.wikipedia.org/wiki/Process_(computing))*

---

