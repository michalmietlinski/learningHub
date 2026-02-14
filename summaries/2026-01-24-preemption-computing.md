https://en.wikipedia.org/wiki/Preemption_(computing)

## Related Summaries & Subjects
- [Process (Computing)](../summaries/2026-01-19-process-computing.md) - Preemption interrupts processes to allow context switching
- [Interrupt](../summaries/2026-01-20-interrupt.md) - Preemption uses interrupts to switch between tasks
- [Signals (IPC)](../summaries/2026-01-11-signals-ipc.md) - Processes can be preempted and controlled through signals

# Preemption (Computing) - Summary

---

## 📚 Basic Summary

### What is Preemption?

**Preemption** is the act of temporarily interrupting an executing task by an external scheduler, without the task's assistance or cooperation, with the intention of resuming it at a later time. The preemptive scheduler runs in the most privileged protection ring, making interruption and resumption highly secure operations.

**Simple Analogy:**
- Like a teacher interrupting a student's presentation to let another student speak - the teacher (scheduler) decides when to switch
- Like a traffic controller stopping one lane to let another proceed - external control manages flow
- Like a referee pausing a game to handle an important situation - authority can interrupt at any time

### Key Concepts

**1. Preemptive vs Cooperative:**
- **Preemptive Multitasking**: Operating system can interrupt tasks at any time
- **Cooperative Multitasking**: Tasks must voluntarily yield control
- **Preemption**: External scheduler forces task interruption
- **Cooperation**: Tasks explicitly give up CPU time

**2. Context Switching:**
- Preemption causes context switch (saving/restoring process state)
- Processor state saved when task is interrupted
- State restored when task resumes
- Allows multiple tasks to share CPU time

**3. Time Slicing:**
- Each process gets a "time slice" or "quantum" to run
- Scheduler runs after each time slice expires
- Interrupt mechanism triggers scheduler
- Creates illusion of parallel execution

**4. User Mode vs Kernel Mode:**
- **User Mode**: Tasks are preemptable (can be interrupted)
- **Kernel Mode**: Some operations may not be preemptable
- **Preemptive Kernels**: Allow preemption even in kernel mode
- **Non-Preemptive Kernels**: Block preemption during kernel operations

### Real-World Examples

**1. Operating System Multitasking:**
- Windows, Linux, macOS use preemptive multitasking
- Multiple applications run "simultaneously"
- OS interrupts applications to switch between them
- Each application gets CPU time slices

**2. Real-Time Systems:**
- Critical tasks can preempt less important ones
- High-priority tasks interrupt low-priority tasks
- Ensures time-sensitive operations complete on time
- Used in embedded systems, robotics, control systems

**3. Server Applications:**
- Web server handles multiple requests
- Preemption allows fair CPU time distribution
- Prevents one request from blocking others
- Better responsiveness and throughput

**4. Mobile Devices:**
- iOS and Android use preemptive multitasking
- Background apps can be preempted by foreground apps
- System can interrupt apps for important events
- Battery-efficient task management

### Why It Matters

- **Fairness**: All processes get CPU time, preventing starvation
- **Responsiveness**: System can quickly respond to important events
- **Stability**: Misbehaving processes can't monopolize CPU
- **Efficiency**: Better CPU utilization through time sharing
- **Security**: Privileged scheduler ensures secure task switching

---

## 🔬 Extended Summary

### Preemptive Multitasking

**Definition:**
Preemptive multitasking is a multitasking method where the operating system kernel can interrupt and suspend (preempt) the currently executing task to start or resume another task. This is distinguished from cooperative multitasking, where tasks must explicitly yield control.

**Key Characteristics:**
- **External Control**: Scheduler has authority to interrupt tasks
- **Time-Based**: Tasks run for fixed time slices (quantum)
- **Priority-Based**: Higher priority tasks can preempt lower priority ones
- **Automatic**: No cooperation required from tasks

**How It Works:**
1. Task starts executing on CPU
2. Timer interrupt fires after time slice expires
3. Scheduler runs and decides next task
4. Context switch occurs (save current, load next)
5. New task begins execution
6. Process repeats

### Time Slice (Quantum)

**Definition:**
The time slice (or quantum) is the maximum period of time a process is allowed to run in a preemptive multitasking system before being interrupted. The scheduler runs once every time slice to choose the next process.

**Time Slice Considerations:**
- **Too Short**: Excessive context switching overhead
- **Too Long**: Poor responsiveness, tasks wait too long
- **Optimal**: Balance between overhead and responsiveness
- **Typical Range**: 10-100 milliseconds (varies by system)

**Example:**
```
Time Slice = 20ms

Process A: [====] (20ms) → Interrupted
Process B: [====] (20ms) → Interrupted
Process C: [====] (20ms) → Interrupted
Process A: [====] (20ms) → Interrupted
... (cycle continues)
```

### User Mode and Kernel Mode

**User Mode Preemption:**
- Tasks running in user mode are always preemptable
- Safe to interrupt user applications
- No risk of system instability
- Standard preemptive behavior

**Kernel Mode Preemption:**
- Some kernel operations cannot be preempted
- Prevents race conditions and deadlocks
- Non-preemptive kernels block all preemption in kernel mode
- Preemptive kernels allow preemption even in kernel mode

**Preemptive Kernels:**
- Modern operating systems support kernel preemption
- Examples: Linux (2.5.4+), Windows NT, Solaris, macOS
- Better responsiveness for real-time applications
- More complex kernel design

**Non-Preemptive Kernels:**
- Older or simpler systems
- Kernel operations run to completion
- Simpler design, less responsive
- May cause system delays

### Preemptive Scheduling

**Scheduling Policies:**
- **Round-Robin**: Equal time slices for all processes
- **Priority-Based**: Higher priority preempts lower priority
- **Multilevel Feedback Queue**: Dynamic priority adjustment
- **Real-Time**: Guaranteed response times

**Priority Preemption:**
- High-priority task arrives
- Currently running low-priority task is preempted
- High-priority task executes immediately
- Low-priority task resumes when high-priority task completes

**Example Scenario:**
```
Time 0ms:  Process A (low priority) starts
Time 10ms: Process B (high priority) arrives
Time 10ms: Process A preempted, Process B starts
Time 30ms: Process B completes
Time 30ms: Process A resumes
```

### I/O Bound vs CPU Bound

**I/O Bound Processes:**
- Spend time waiting for I/O (disk, network, keyboard)
- Can be blocked while waiting
- Don't need CPU during I/O wait
- Preemption allows other processes to use CPU

**CPU Bound Processes:**
- Fully utilize CPU when running
- Would monopolize CPU without preemption
- Need time slicing for fairness
- Preemption ensures other processes get CPU time

**Preemption Benefits:**
- I/O bound processes can be blocked (don't waste CPU)
- CPU bound processes get time slices (fairness)
- Better overall system utilization
- Responsive to I/O completion (interrupts)

### Context Switching

**What is Context Switching:**
- Saving state of current process
- Loading state of next process
- Required for preemption to work
- Overhead of preemptive multitasking

**Context Switch Components:**
- **CPU Registers**: Save/restore register values
- **Program Counter**: Save/restore execution point
- **Stack Pointer**: Save/restore stack location
- **Memory Mapping**: Switch virtual memory context
- **File Descriptors**: Maintain open file handles

**Context Switch Overhead:**
- Takes time (microseconds to milliseconds)
- More frequent preemption = more overhead
- Balance between responsiveness and efficiency
- Modern CPUs optimize context switching

### System Support

**Modern Operating Systems:**
- **Windows**: Preemptive multitasking since Windows NT
- **Linux**: Preemptive kernel since version 2.5.4
- **macOS/iOS**: Preemptive multitasking (Darwin kernel)
- **Android**: Preemptive multitasking (Linux-based)

**Historical Systems:**
- **Early Systems**: Cooperative multitasking (MS-DOS, early Mac OS)
- **AmigaOS**: Early preemptive multitasking on microcomputers
- **OS-9**: Early microcomputer OS with preemption
- **Modern Systems**: All use preemptive multitasking

**Real-Time Systems:**
- Hard real-time: Guaranteed response times
- Soft real-time: Best effort response times
- Preemption critical for meeting deadlines
- Priority-based preemption essential

### Advantages of Preemption

**1. Fairness:**
- All processes get CPU time
- Prevents process starvation
- Equal or priority-based time distribution
- Better user experience

**2. Responsiveness:**
- System can quickly respond to events
- Important tasks can preempt less important ones
- Better interactive performance
- Reduced latency for user input

**3. Stability:**
- Misbehaving processes can't monopolize CPU
- System remains responsive
- Can kill or suspend problematic processes
- Better system reliability

**4. Efficiency:**
- Better CPU utilization
- I/O bound processes don't waste CPU
- Multiple processes make progress
- Parallelism illusion

**5. Security:**
- Privileged scheduler ensures secure switching
- Process isolation maintained
- Controlled resource access
- Protection from malicious processes

### Disadvantages of Preemption

**1. Overhead:**
- Context switching takes time
- Scheduler runs frequently
- More preemption = more overhead
- Performance cost

**2. Complexity:**
- More complex scheduler design
- Need to handle race conditions
- Synchronization required
- Harder to debug

**3. Cache Effects:**
- Context switches flush CPU cache
- Performance degradation
- More cache misses
- Slower execution

**4. Predictability:**
- Less predictable execution timing
- Harder to reason about performance
- Non-deterministic behavior
- Challenging for real-time systems

### Preemption vs Cooperative Multitasking

**Preemptive Multitasking:**
- OS controls task switching
- Tasks can be interrupted at any time
- More responsive
- Better for general-purpose systems
- Used by modern operating systems

**Cooperative Multitasking:**
- Tasks voluntarily yield control
- Tasks must explicitly give up CPU
- Simpler implementation
- Risk of unresponsive tasks
- Used by older systems (early Mac OS, Windows 3.x)

**Comparison:**
| Aspect | Preemptive | Cooperative |
|--------|-----------|-------------|
| **Control** | OS-controlled | Task-controlled |
| **Responsiveness** | High | Depends on tasks |
| **Complexity** | Higher | Lower |
| **Reliability** | Better | Worse (one bad task blocks all) |
| **Overhead** | Higher (context switches) | Lower |
| **Fairness** | Guaranteed | Not guaranteed |

### Real-World Applications

**1. Desktop Operating Systems:**
- Multiple applications run simultaneously
- User can switch between applications
- System remains responsive
- Background tasks don't block foreground

**2. Server Systems:**
- Handle multiple client requests
- Fair CPU time distribution
- Prevent one request from blocking others
- Better throughput and latency

**3. Embedded Systems:**
- Real-time control systems
- Priority-based preemption
- Critical tasks interrupt non-critical
- Meet timing deadlines

**4. Mobile Devices:**
- Multiple apps in background
- Foreground app gets priority
- System services can interrupt apps
- Battery-efficient task management

**5. Virtualization:**
- Virtual machines share physical CPU
- Hypervisor preempts VMs
- Fair resource allocation
- Isolation between VMs

### Best Practices

**1. Time Slice Tuning:**
- Balance responsiveness and overhead
- Shorter for interactive systems
- Longer for batch processing
- Monitor and adjust based on workload

**2. Priority Management:**
- Use priorities appropriately
- Avoid priority inversion
- Don't starve low-priority tasks
- Consider aging for fairness

**3. Minimize Context Switches:**
- Reduce unnecessary preemption
- Optimize scheduler algorithms
- Use efficient data structures
- Cache-friendly scheduling

**4. Real-Time Considerations:**
- Guarantee response times
- Use appropriate scheduling algorithms
- Consider worst-case scenarios
- Test under load

### Common Misconceptions

**1. "Preemption means parallel execution":**
- Preemption enables time-sharing
- Only one task runs per CPU core at a time
- Creates illusion of parallelism
- True parallelism requires multiple CPU cores

**2. "More preemption is always better":**
- Too much preemption causes overhead
- Context switches have cost
- Balance is important
- Optimal time slice depends on workload

**3. "Preemption only happens on time slices":**
- Time slices are one trigger
- Interrupts can also cause preemption
- Priority changes can preempt
- I/O completion can trigger preemption

**4. "All systems use preemption":**
- Modern general-purpose OS do
- Some embedded systems use cooperative
- Real-time systems may use different models
- Depends on system requirements

---

## 🎯 Key Takeaways

1. **Preemption** allows operating system to interrupt tasks without their cooperation
2. **Time Slicing** gives each process a quantum of CPU time
3. **Context Switching** saves/restores process state during preemption
4. **Preemptive Kernels** allow preemption even in kernel mode for better responsiveness
5. **Priority-Based Preemption** ensures important tasks can interrupt less important ones
6. **I/O Bound vs CPU Bound** processes benefit differently from preemption
7. **Modern Operating Systems** all use preemptive multitasking
8. **Balance** between responsiveness and overhead is crucial
9. **Fairness** is guaranteed through time slicing and priority management
10. **Security** is maintained through privileged scheduler operation

---

## 📖 References

- [Wikipedia: Preemption (Computing)](https://en.wikipedia.org/wiki/Preemption_(computing))
- Operating System Concepts by Silberschatz, Galvin, and Gagne
- Modern Operating Systems by Andrew Tanenbaum
- Linux Kernel Development by Robert Love

---











