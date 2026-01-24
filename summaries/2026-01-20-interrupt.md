https://en.wikipedia.org/wiki/Interrupt

## Related Summaries & Subjects
- [Process (Computing)](../summaries/2026-01-19-process-computing.md) - Interrupts enable process preemption and context switching
- [Signals (IPC)](../summaries/2026-01-11-signals-ipc.md) - Software interrupts used for inter-process communication
- [Bus Error](../summaries/2026-01-02-bus-error.md) - Hardware interrupts can signal bus errors and other hardware faults

# Interrupt - Summary

---

## 📚 Basic Summary

### What is an Interrupt?

**Interrupt** is a signal to a computer processor emitted by hardware or software that requests the processor to interrupt currently executing code so that an event can be processed in a timely manner. The processor suspends its current activities, saves its state, and executes an interrupt handler to deal with the event.

**Simple Analogy:**
- Like a doorbell interrupting your work - you stop what you're doing, handle the visitor, then return to your task
- Like a phone call during a meeting - you pause the meeting, take the call, then resume
- Like a fire alarm - urgent event that requires immediate attention, interrupting normal activities

### Key Concepts

**1. Interrupt Request:**
- Signal to processor to interrupt current execution
- Can come from hardware or software
- Processor decides whether to accept interrupt
- If accepted, current code is suspended

**2. Interrupt Handler:**
- Function called to handle the interrupt
- Also called Interrupt Service Routine (ISR)
- Processes the event that caused interrupt
- Returns control after handling

**3. Interrupt Types:**
- **Hardware Interrupts**: From hardware devices (keyboard, mouse, timer)
- **Software Interrupts**: From software (system calls, exceptions)
- **Maskable**: Can be disabled/ignored
- **Non-Maskable**: Must be handled immediately

**4. Interrupt-Driven Systems:**
- Systems that use interrupts for multitasking
- More efficient than polling
- Enables responsive systems
- Foundation of modern operating systems

### Real-World Examples

**1. Keyboard Input:**
- Pressing a key triggers hardware interrupt
- Processor stops current task
- Reads keystroke
- Returns to previous task

**2. Mouse Movement:**
- Mouse movement triggers interrupt
- Processor updates cursor position
- Handles movement event
- Continues normal operation

**3. Timer Interrupts:**
- System timer generates periodic interrupts
- Enables time-sharing
- Allows process preemption
- Foundation of multitasking

**4. I/O Operations:**
- Disk read/write completion triggers interrupt
- Network packet arrival triggers interrupt
- Device ready signals use interrupts
- Efficient I/O handling

### Why It Matters

- **Efficiency**: Eliminates wasteful polling loops
- **Responsiveness**: Immediate handling of time-sensitive events
- **Multitasking**: Enables preemptive multitasking
- **Real-Time Systems**: Critical for real-time computing
- **I/O Handling**: Efficient device communication

---

## 🔬 Extended Summary

### History

**1951: UNIVAC I**
- Arithmetic overflow triggered fix-up routine
- Early form of interrupt handling
- Programmer could choose to stop computer

**1953: UNIVAC 1103A**
- Generally credited with earliest use of interrupts
- First practical interrupt system

**1954: IBM 650**
- First occurrence of interrupt masking
- Could disable/enable interrupts

**1954: DYSEAC**
- First system to use interrupts for I/O
- Eliminated unproductive waiting in polling loops
- Optimization for external events

**1954: IBM 704**
- First to use interrupts for debugging
- "Transfer trap" for branch instructions
- Special routine invocation

**1957: MIT TX-2**
- First to provide multiple levels of priority interrupts
- Priority-based interrupt handling
- Advanced interrupt system

### Hardware Interrupts

**Definition:**
- Condition related to hardware state
- Signaled by external hardware device
- Or detected by devices embedded in processor
- Communicates device needs attention

**Sources:**
- External devices (keyboard, mouse, disk controller)
- Internal devices (CPU timer, system clock)
- Hardware state changes
- Device events

**Characteristics:**
- **Asynchronous**: Can arrive at any time
- **Clock Synchronized**: Conditioned to processor clock
- **Instruction Boundaries**: Acted upon at execution boundaries
- **IRQ Lines**: Each device may have dedicated IRQ signal

**Examples:**
- Keyboard key press → IRQ signal
- Mouse movement → IRQ signal
- Disk I/O completion → IRQ signal
- Timer expiration → Internal interrupt
- Network packet arrival → IRQ signal

**Interrupt Request (IRQ):**
- Signal line on PC architecture
- Each device associated with IRQ
- Quickly identifies which device needs attention
- IRQ number identifies device

**Masking:**
- **Maskable Interrupts**: Can be disabled
- **Non-Maskable Interrupts (NMI)**: Cannot be disabled
- Interrupt masking prevents interrupt handling
- Used for critical code sections

**Missing Interrupts:**
- Interrupt occurs but not handled
- Can happen if interrupts disabled too long
- May cause data loss or device timeout
- Need to balance masking and responsiveness

**Spurious Interrupts:**
- Interrupt signal without actual event
- Can be caused by electrical noise
- Hardware glitches
- Must be handled gracefully

### Software Interrupts

**Definition:**
- Interrupt triggered by software
- Not from hardware device
- Programmed interrupt instruction
- System call mechanism

**Types:**
- **System Calls**: User program requests OS service
- **Exceptions**: Error conditions (division by zero, page fault)
- **Traps**: Intentional interrupts for debugging
- **Software Interrupt Instructions**: INT instruction (x86)

**Characteristics:**
- Synchronous (happens at specific instruction)
- Predictable timing
- Used for controlled transitions
- Enable user-kernel mode switching

**Examples:**
- System call (read file, open socket)
- Exception handling (segmentation fault)
- Debugging breakpoints
- Virtual memory page faults

**System Calls:**
- User program requests OS service
- Software interrupt switches to kernel mode
- OS handles request
- Returns to user mode

### Triggering Methods

**Level-Triggered:**
- Interrupt active while signal is at certain level
- High or low level indicates interrupt
- Interrupt remains active until condition cleared
- Must clear condition to deactivate interrupt

**Characteristics:**
- Interrupt persists while condition exists
- Must handle and clear condition
- Can be re-triggered if not cleared
- Common in many systems

**Edge-Triggered:**
- Interrupt triggered on signal transition
- Rising edge (low to high) or falling edge (high to low)
- Interrupt fires once per transition
- Doesn't persist

**Characteristics:**
- One interrupt per edge
- Doesn't require clearing condition
- Faster response
- Used in high-performance systems

**Comparison:**
- **Level-Triggered**: Simpler, but must clear condition
- **Edge-Triggered**: Faster, but can miss if not handled quickly
- Choice depends on application

### Processor Response

**Interrupt Handling Process:**

**1. Interrupt Occurs:**
- Hardware or software generates interrupt
- Processor detects interrupt signal
- Checks if interrupts enabled
- Checks interrupt priority

**2. Save State:**
- Save current processor state
- Program counter (where to return)
- CPU registers
- Processor flags
- Stack pointer

**3. Disable Interrupts:**
- Disable further interrupts (usually)
- Prevent interrupt nesting
- Or allow higher priority interrupts
- Depends on system design

**4. Identify Interrupt:**
- Determine interrupt source
- Read interrupt vector
- Find interrupt handler address
- Jump to handler

**5. Execute Handler:**
- Run interrupt service routine
- Handle the event
- Process the interrupt
- May enable interrupts during handler

**6. Restore State:**
- Restore saved processor state
- Restore registers
- Restore program counter
- Return to interrupted code

**7. Resume Execution:**
- Continue from where interrupted
- Or switch to different task
- Normal execution resumes

**Interrupt Vector:**
- Table of interrupt handler addresses
- Indexed by interrupt number
- Points to appropriate handler
- Stored in memory

**Interrupt Priority:**
- Some interrupts more urgent than others
- Higher priority interrupts can interrupt lower priority handlers
- Priority levels determine handling order
- Critical interrupts handled first

### System Implementation

**Shared Interrupt Lines:**
- Multiple devices share same IRQ line
- Interrupt handler must identify which device
- Poll devices to find source
- Or use message-signaled interrupts

**Difficulty with Sharing:**
- Must check all devices on shared line
- Slower interrupt handling
- More complex handler code
- Can cause performance issues

**Hybrid Approach:**
- Combination of methods
- Some dedicated IRQ lines
- Some shared lines
- Balance between performance and cost

**Message-Signaled Interrupts (MSI):**
- Modern approach
- Device writes message to memory
- Identifies device and interrupt type
- More efficient than shared lines
- PCI Express uses MSI

**Doorbell:**
- Software mechanism
- Writes to special memory location
- Triggers interrupt in another processor
- Used in multiprocessor systems

**Multiprocessor IPI:**
- Inter-Processor Interrupt
- One processor interrupts another
- Used for coordination
- Cache coherency, scheduling

### Performance

**Interrupt Overhead:**
- Context switching cost
- Save/restore processor state
- Handler execution time
- Cache effects

**Optimization:**
- Minimize handler execution time
- Defer work to bottom half
- Use interrupt coalescing
- Batch interrupt handling

**Interrupt Coalescing:**
- Combine multiple interrupts
- Reduce interrupt frequency
- Lower overhead
- Used in network adapters

**Bottom Half:**
- Defer non-critical work
- Handler does minimal work
- Schedule deferred work
- Improves responsiveness

### Typical Uses

**1. I/O Operations:**
- Device ready signals
- Data transfer completion
- Error conditions
- Efficient I/O handling

**2. Timer Events:**
- System clock ticks
- Process scheduling
- Time-sharing
- Real-time events

**3. User Input:**
- Keyboard presses
- Mouse movements
- Touch events
- Immediate response

**4. Hardware Errors:**
- Memory errors
- Bus errors
- Device failures
- Critical error handling

**5. System Calls:**
- User-kernel transitions
- Service requests
- Privilege escalation
- Controlled entry points

**6. Multitasking:**
- Process preemption
- Context switching
- Time-slicing
- Fair CPU sharing

**7. Real-Time Systems:**
- Time-critical events
- Deadline handling
- Predictable response
- Real-time guarantees

---

## 🔍 Technical Details

### Interrupt Vector Table

**Purpose:**
- Maps interrupt numbers to handler addresses
- Stored in memory
- Indexed by interrupt number
- Points to interrupt service routine

**Structure:**
- Array of function pointers
- One entry per interrupt type
- Handler address for each interrupt
- May include privilege level

**Location:**
- Fixed memory location (often)
- Or configurable
- Protected from user access
- Kernel manages table

### Interrupt Descriptor Table (IDT)

**x86 Architecture:**
- Interrupt Descriptor Table
- More complex than vector table
- Includes privilege levels
- Gate descriptors

**Gate Types:**
- **Interrupt Gate**: Disables interrupts
- **Trap Gate**: Keeps interrupts enabled
- **Task Gate**: Task switching
- Different behaviors

### Interrupt Masking

**Purpose:**
- Disable interrupt handling
- Protect critical code sections
- Prevent interrupt nesting
- Control interrupt processing

**Implementation:**
- Interrupt flag in processor
- CLI (Clear Interrupt Flag) instruction
- STI (Set Interrupt Flag) instruction
- Processor state bit

**Critical Sections:**
- Code that must not be interrupted
- Disable interrupts during execution
- Re-enable after completion
- Protect shared resources

### Nested Interrupts

**Definition:**
- Interrupt during interrupt handler
- Higher priority interrupt
- Interrupt nesting levels
- Stack management

**Handling:**
- Allow higher priority interrupts
- Prevent lower priority interrupts
- Stack interrupt contexts
- Return in reverse order

**Considerations:**
- Stack depth limits
- Performance impact
- Complexity
- Real-time constraints

### Interrupt Latency

**Definition:**
- Time from interrupt to handler start
- Critical for real-time systems
- Affected by interrupt masking
- Must be minimized

**Factors:**
- Interrupt masking duration
- Handler execution time
- System load
- Interrupt priority

**Real-Time Requirements:**
- Maximum acceptable latency
- Must meet deadlines
- Predictable response
- Guaranteed handling time

---

## 💡 Interrupt Handling Patterns

### Top Half / Bottom Half

**Top Half:**
- Immediate interrupt handling
- Minimal work
- Acknowledge interrupt
- Schedule bottom half

**Bottom Half:**
- Deferred work
- Non-time-critical processing
- Can be interrupted
- Better system responsiveness

**Benefits:**
- Faster interrupt response
- Lower interrupt latency
- Better system performance
- Enables interrupt nesting

### Interrupt Chaining

**Definition:**
- Multiple handlers for same interrupt
- Chain of handlers called in sequence
- Each handler checks if it should handle
- First matching handler processes

**Use Cases:**
- Shared interrupt lines
- Modular interrupt handling
- Device driver architecture
- Extensible interrupt system

### Interrupt Sharing

**Mechanism:**
- Multiple devices on same IRQ
- Handler checks all devices
- Identifies interrupting device
- Calls appropriate device handler

**Implementation:**
- Poll devices on shared line
- Device indicates if it caused interrupt
- Handler dispatches to device
- More overhead than dedicated IRQ

---

## 🌍 Real-World Applications

### 1. Operating Systems

**Process Scheduling:**
- Timer interrupt triggers scheduler
- Preempts running process
- Switches to another process
- Enables multitasking

**I/O Management:**
- Device interrupts signal I/O completion
- Wake waiting processes
- Continue I/O operations
- Efficient device handling

### 2. Embedded Systems

**Real-Time Control:**
- Sensor interrupts
- Actuator control
- Time-critical responses
- Predictable timing

**Microcontrollers:**
- Peripheral interrupts
- Timer interrupts
- External event handling
- Low-power operation

### 3. Device Drivers

**Hardware Communication:**
- Device-ready interrupts
- Data transfer interrupts
- Error handling interrupts
- Efficient device management

### 4. Networking

**Packet Processing:**
- Network adapter interrupts
- Packet arrival notification
- Efficient packet handling
- High-throughput networking

---

## ⚠️ Common Issues

### 1. Interrupt Storms

**Problem:**
- Too many interrupts
- System overwhelmed
- Performance degradation
- Unresponsive system

**Solution:**
- Interrupt coalescing
- Rate limiting
- Prioritization
- Better interrupt handling

### 2. Interrupt Latency

**Problem:**
- Long delay before handling
- Missed deadlines
- Real-time failures
- Poor responsiveness

**Solution:**
- Minimize masking time
- Optimize handlers
- Priority handling
- Real-time scheduling

### 3. Lost Interrupts

**Problem:**
- Interrupt not handled
- Data loss
- Device timeout
- System errors

**Solution:**
- Proper interrupt acknowledgment
- Interrupt status checking
- Error recovery
- Robust handling

### 4. Interrupt Conflicts

**Problem:**
- Multiple devices on same IRQ
- Handler conflicts
- Device identification issues
- Performance problems

**Solution:**
- Message-signaled interrupts
- Better interrupt sharing
- Device isolation
- Modern interrupt mechanisms

---

## ✅ Best Practices

### 1. Interrupt Handler Design

✅ **Do:**
- Keep handlers short and fast
- Defer non-critical work
- Acknowledge interrupts promptly
- Use bottom half for heavy work

❌ **Don't:**
- Do heavy processing in handler
- Block in interrupt handler
- Ignore interrupt acknowledgment
- Use blocking operations

### 2. Interrupt Masking

✅ **Do:**
- Minimize interrupt disable time
- Protect only critical sections
- Re-enable interrupts promptly
- Use appropriate masking level

❌ **Don't:**
- Disable interrupts for long periods
- Forget to re-enable interrupts
- Mask unnecessarily
- Ignore interrupt latency

### 3. Interrupt Priority

✅ **Do:**
- Assign priorities appropriately
- Handle critical interrupts first
- Balance priority levels
- Consider real-time requirements

❌ **Don't:**
- Ignore priority levels
- Make all interrupts same priority
- Block high-priority interrupts
- Neglect priority management

---

## 🔀 Interrupt vs Related Concepts

### Interrupt vs Polling

**Interrupt:**
- Event-driven
- Processor notified when event occurs
- Efficient (no wasted cycles)
- Asynchronous

**Polling:**
- Processor checks for events
- Continuous checking
- Wastes CPU cycles
- Synchronous

**Key Difference:** Interrupt is event-driven, polling is continuous checking.

### Interrupt vs Exception

**Interrupt:**
- External or software-generated
- Can be asynchronous
- Normal operation mechanism
- Handles events

**Exception:**
- Error condition
- Synchronous (at instruction)
- Abnormal condition
- Error handling

**Key Difference:** Interrupt handles events, exception handles errors.

### Interrupt vs Signal

**Interrupt:**
- Low-level hardware/software mechanism
- Processor-level
- Handled by kernel
- System-wide

**Signal:**
- High-level process communication
- Process-level
- Handled by process
- Inter-process

**Key Difference:** Interrupt is system-level, signal is process-level.

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Efficiency**
- No wasted polling cycles
- Event-driven processing
- Better CPU utilization
- Lower power consumption

✅ **Responsiveness**
- Immediate event handling
- Time-sensitive processing
- Real-time capabilities
- Better user experience

✅ **Multitasking**
- Enables preemptive multitasking
- Process scheduling
- Time-sharing
- Fair resource allocation

✅ **I/O Efficiency**
- Efficient device communication
- Asynchronous I/O
- Non-blocking operations
- Better throughput

### Trade-offs

❌ **Complexity**
- Interrupt handling is complex
- Race conditions possible
- Debugging difficulties
- System complexity

❌ **Overhead**
- Context switching cost
- Handler execution time
- Cache effects
- Performance impact

❌ **Latency**
- Interrupt latency exists
- Masking increases latency
- Real-time constraints
- Must be managed

---

## 🎓 Summary

### Key Takeaways

1. **Interrupt** requests processor to handle event
2. **Hardware Interrupts** from devices, **Software Interrupts** from software
3. **Interrupt Handler** processes the interrupt event
4. **Interrupt-Driven** systems are more efficient than polling
5. **Masking** can disable interrupts for critical sections
6. **Priority** determines interrupt handling order
7. **Context Switching** saves/restores state during interrupt
8. **Real-Time Systems** depend on predictable interrupt handling

### Common Uses

- **I/O Operations**: Device communication
- **Timer Events**: System clock, scheduling
- **User Input**: Keyboard, mouse
- **System Calls**: User-kernel transitions
- **Multitasking**: Process preemption
- **Real-Time**: Time-critical events

### Next Steps

After understanding Interrupts, consider:
- **Process Management** - How interrupts enable multitasking
- **Device Drivers** - How interrupts handle hardware
- **Real-Time Systems** - Interrupt timing and deadlines
- **System Calls** - Software interrupts for OS services

---

## 🔗 Related Subjects

- [Process (Computing)](../summaries/2026-01-19-process-computing.md): Interrupts enable process preemption and context switching
- [Signals (IPC)](../summaries/2026-01-11-signals-ipc.md): Software interrupts used for inter-process communication
- [Bus Error](../summaries/2026-01-02-bus-error.md): Hardware interrupts can signal bus errors and other hardware faults

---

*Summary created: 2026-01-20*

*Source: [Wikipedia - Interrupt](https://en.wikipedia.org/wiki/Interrupt)*

---

