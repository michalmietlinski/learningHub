https://en.wikipedia.org/wiki/Completely_Fair_Scheduler

## Related Summaries & Subjects
- [Process (Computing)](../summaries/2026-01-19-process-computing.md) - CFS schedules processes for CPU time allocation
- [Preemption (Computing)](../summaries/2026-01-24-preemption-computing.md) - CFS uses preemption to switch between tasks
- [Thread (Computing)](../summaries/2026-01-26-thread-computing.md) - CFS treats threads as minimal schedulable entities

# Completely Fair Scheduler (CFS) - Summary

---

## 📚 Basic Summary

### What is the Completely Fair Scheduler?

**The Completely Fair Scheduler (CFS)** was a process scheduler used in the Linux kernel from version 2.6.23 (October 2007) until version 6.6 (2023), when it was replaced by the EEVDF scheduler. CFS was designed to maximize overall CPU utilization while also maximizing interactive performance by giving each task a fair share of CPU time.

**Simple Analogy:**
- Like a fair pizza sharing system where everyone gets proportional slices based on how much they've eaten - if you've had less, you get the next slice
- Like a fair teacher who tracks how much time each student has spoken and calls on the one who has spoken least
- Like a balanced seesaw that always tips toward the side that has received less weight

### Key Concepts

**1. Fair Scheduling:**
- CFS aims to give each task a fair share of CPU time
- Tasks are not assigned fixed time slices like older schedulers
- CPU time is distributed proportionally among all runnable tasks
- Tasks that have received less CPU time get priority

**2. Virtual Runtime (vruntime):**
- Each task tracks its "virtual runtime" - how much CPU time it has consumed
- Tasks with lower vruntime are prioritized for scheduling
- Sleeping tasks accumulate less vruntime, gaining automatic priority boost when they wake
- vruntime is measured in nanoseconds

**3. Red-Black Tree:**
- CFS organizes tasks in a self-balancing red-black tree
- Tasks are sorted by their vruntime (execution time received)
- The leftmost node (lowest vruntime) is always the next task to run
- Insertion complexity is O(log N), selection is O(1)

**4. Schedulable Entities:**
- CFS doesn't just schedule individual tasks (threads)
- Can manage groups of threads, whole processes, or all processes of a user
- Each task has a `sched_entity` structure representing its scheduling group
- Enables hierarchical and group-based scheduling

### Real-World Examples

**1. Desktop Responsiveness:**
- When compiling code while watching video, CFS ensures video playback remains smooth
- Interactive applications get CPU time quickly because they have lower vruntime (they sleep waiting for user input)
- CPU-intensive background tasks don't starve foreground applications

**2. Server Workloads:**
- Web servers handling multiple requests get fair CPU distribution
- No single request can monopolize CPU time
- Better overall throughput and latency

**3. Multi-User Systems:**
- With group scheduling, each user gets fair CPU share
- One user running many processes doesn't starve other users
- Fair resource allocation across login sessions

**4. Build Systems:**
- Running `make -j8` for parallel compilation
- CFS distributes CPU fairly among compiler processes
- System remains responsive during heavy compilation

### Why It Matters

- **Fairness**: All processes get proportional CPU time, preventing starvation
- **Responsiveness**: Interactive tasks naturally get priority due to lower vruntime
- **Efficiency**: No complex priority calculations - simple vruntime comparison
- **Scalability**: Red-black tree ensures O(log N) insertion, O(1) selection
- **Flexibility**: Group scheduling allows fair allocation at user/session level

---

## 🔬 Extended Summary

### Historical Context

**Evolution of Linux Schedulers:**
- **O(1) Scheduler (Linux 2.6 - 2.6.22)**: Maintained active and expired run queues with fixed time slices
- **Rotating Staircase Deadline (Con Kolivas)**: Inspired CFS with "fair scheduling" concept
- **CFS (Linux 2.6.23 - 6.5)**: Implemented weighted fair queuing for processes
- **EEVDF (Linux 6.6+)**: Current scheduler using earliest eligible virtual deadline first

**Creator:**
CFS was developed by Ingo Molnár, who credited Con Kolivas for the inspiration in his announcement. CFS is an implementation of weighted fair queuing, originally invented for packet networks and later applied to CPU scheduling as "stride scheduling."

### Algorithm Deep Dive

**Core Data Structures:**

```
task_struct
├── sched_entity (scheduling entity)
│   ├── vruntime (virtual runtime in nanoseconds)
│   ├── load (weight for nice value)
│   └── group pointer

cfs_rq (per-CPU run queue)
├── red-black tree of sched_entities
├── min_vruntime (smallest vruntime in tree)
└── leftmost (cached pointer to next task)
```

**Scheduling Algorithm:**

1. **Selection (O(1)):**
   - The leftmost node in the red-black tree is always cached
   - This node has the lowest vruntime (least CPU time received)
   - Selected task is removed from tree and sent for execution

2. **Execution:**
   - Task runs until it completes, blocks (I/O), or is preempted
   - vruntime is updated based on actual CPU time consumed
   - vruntime increases faster for lower-priority (higher nice) tasks

3. **Reinsertion (O(log N)):**
   - Task is reinserted into red-black tree based on new vruntime
   - Tree self-balances to maintain O(log N) height
   - New leftmost node is determined

4. **Repeat:**
   - Next leftmost node is selected
   - Process continues indefinitely

**Virtual Runtime Calculation:**

```
vruntime += delta_exec * (NICE_0_WEIGHT / task_weight)

Where:
- delta_exec = actual CPU time consumed
- NICE_0_WEIGHT = weight of default priority (nice 0)
- task_weight = weight based on task's nice value
```

Higher nice values (lower priority) result in faster vruntime accumulation, meaning the task will be scheduled less frequently.

### Maximum Execution Time

**Concept:**
CFS calculates a "maximum execution time" for each process representing how much time it would have expected on an "ideal processor" that divides CPU perfectly among all tasks.

**Calculation:**
```
max_execution_time = waiting_time / number_of_processes
```

When a task reaches its maximum execution time, it is preempted and reinserted into the scheduling tree.

### Handling Sleeping Tasks

**Problem:** If sleeping tasks kept their old vruntime, they would monopolize CPU upon waking.

**Solution:**
- Sleeping tasks don't accumulate vruntime while sleeping
- When waking, their vruntime is behind active tasks
- This gives them automatic priority boost
- They receive CPU time quickly, improving interactive responsiveness
- vruntime is bounded to prevent indefinite monopolization

**Example:**
```
Task A (CPU-bound): vruntime = 1000ms
Task B (sleeps, wakes): vruntime = 200ms (from before sleep)

Upon wake, Task B gets scheduled immediately because 200 < 1000
```

### Red-Black Tree Properties

**Why Red-Black Tree:**
- **Self-Balancing**: Guarantees O(log N) height
- **Efficient Operations**: Insert/delete in O(log N)
- **Cache-Friendly**: Leftmost node cached for O(1) access
- **Ordered**: Tasks naturally sorted by vruntime

**Tree Structure:**
```
            [task C, vruntime=500]
           /                      \
    [task A, vruntime=200]    [task D, vruntime=800]
         \                    /
    [task B, vruntime=300]  [task E, vruntime=600]

Leftmost (next to run): Task A (vruntime=200)
```

### Group Scheduling

**2010 Enhancement (Linux 2.6.38):**
Mike Galbraith, with ideas from Linus Torvalds, added auto-grouping:
- Parent and child processes placed in same task group
- Task groups tied to sessions (setsid() system calls)
- Significantly improved desktop responsiveness

**Problem Solved:**
Before auto-grouping, running `make -j100` would spawn 100 processes, each competing for CPU. A video player (1 process) would only get 1/101 of CPU time.

**Solution:**
With auto-grouping, the make process and its children form one group. The video player forms another group. Each group gets 50% of CPU, so video plays smoothly during compilation.

**Example:**
```
Without Auto-Grouping:
- make (100 processes): 100/101 ≈ 99% CPU
- video player (1 process): 1/101 ≈ 1% CPU

With Auto-Grouping:
- make group: 50% CPU (split among 100 processes)
- video group: 50% CPU (all to video player)
```

### Comparison with O(1) Scheduler

| Aspect | O(1) Scheduler | CFS |
|--------|---------------|-----|
| **Time Slices** | Fixed per-priority | Dynamic based on vruntime |
| **Data Structure** | Two arrays (active/expired) | Red-black tree |
| **Selection Complexity** | O(1) | O(1) (cached leftmost) |
| **Insertion Complexity** | O(1) | O(log N) |
| **Fairness** | Priority-based, can starve | Inherently fair |
| **Interactive Response** | Heuristics for interactivity | Natural boost for sleepers |
| **Predictability** | Less predictable | More consistent |

### EEVDF Replacement (Linux 6.6+)

**Why EEVDF:**
- CFS struggled with latency-sensitive workloads
- Required "latency nice" patches for fine-tuning
- EEVDF (Earliest Eligible Virtual Deadline First) provides better latency control
- Eliminates need for latency nice heuristics

**Key Difference:**
- CFS: Selects task with lowest vruntime
- EEVDF: Selects task with earliest virtual deadline among eligible tasks
- EEVDF provides better latency guarantees

### Implementation Details

**Key Kernel Structures:**

```c
struct sched_entity {
    struct load_weight load;      /* task weight */
    struct rb_node run_node;      /* red-black tree node */
    u64 vruntime;                 /* virtual runtime */
    u64 sum_exec_runtime;         /* actual runtime */
    /* ... */
};

struct cfs_rq {
    struct load_weight load;
    unsigned int nr_running;      /* number of runnable tasks */
    u64 min_vruntime;             /* minimum vruntime in tree */
    struct rb_root_cached tasks_timeline;  /* red-black tree */
    /* ... */
};
```

**Nice Value to Weight Mapping:**
```
Nice -20 (highest priority): weight = 88761
Nice   0 (default):          weight = 1024
Nice +19 (lowest priority):  weight = 15
```

Higher weight means slower vruntime accumulation, resulting in more CPU time.

### Advantages of CFS

**1. Simplicity:**
- Clean mathematical model based on fairness
- No complex heuristics for interactivity detection
- Predictable behavior

**2. Fairness:**
- All tasks get proportional CPU time
- No starvation possible
- Natural priority through vruntime

**3. Responsiveness:**
- Sleeping tasks automatically get priority boost
- Interactive applications respond quickly
- No special case handling needed

**4. Scalability:**
- O(log N) operations scale well
- Per-CPU run queues reduce contention
- Efficient for many-core systems

**5. Flexibility:**
- Group scheduling for fair user/session allocation
- Nice values provide priority control
- cgroups integration for resource control

### Disadvantages of CFS

**1. Latency Issues:**
- Not ideal for real-time or latency-sensitive workloads
- Led to development of EEVDF replacement
- Required patches for fine-tuning

**2. Overhead:**
- Red-black tree operations more expensive than O(1) arrays
- More memory per task for sched_entity
- Complex tree maintenance

**3. Wake-up Latency:**
- Tasks may not wake up immediately
- Depends on current tree state
- Not suitable for hard real-time

### CFS Scheduling Classes

CFS handles `SCHED_NORMAL` and `SCHED_BATCH` tasks:
- **SCHED_NORMAL**: Default for regular tasks
- **SCHED_BATCH**: CPU-intensive batch processing
- **SCHED_IDLE**: Lowest priority (only runs when nothing else can)

Real-time tasks (SCHED_FIFO, SCHED_RR) use separate schedulers and always preempt CFS tasks.

### Tuning CFS

**Kernel Parameters:**
- `sched_min_granularity_ns`: Minimum time slice
- `sched_latency_ns`: Target latency for all tasks
- `sched_wakeup_granularity_ns`: Wakeup preemption threshold

**Best Practices:**
- For servers: Increase granularity (fewer context switches)
- For desktops: Decrease latency (better responsiveness)
- For real-time: Consider SCHED_FIFO/SCHED_RR instead

---

## 🎯 Key Takeaways

1. **CFS** was Linux's default process scheduler from 2007-2023, implementing weighted fair queuing
2. **Virtual Runtime (vruntime)** tracks CPU time consumed; lower vruntime = higher priority
3. **Red-Black Tree** organizes tasks by vruntime with O(log N) insert, O(1) selection
4. **Sleeping tasks** naturally get priority boost because their vruntime doesn't increase
5. **Group Scheduling** allows fair allocation at user/session level, improving desktop responsiveness
6. **No fixed time slices** - CPU time distributed proportionally based on fairness
7. **Schedulable Entities** allow grouping threads, processes, or users for scheduling
8. **EEVDF** replaced CFS in Linux 6.6 for better latency control
9. **O(log N) complexity** scales well for modern multi-core systems
10. **Auto-grouping** solved the desktop responsiveness problem during CPU-intensive tasks

---

## 📖 References

- [Wikipedia: Completely Fair Scheduler](https://en.wikipedia.org/wiki/Completely_Fair_Scheduler)
- Linux Kernel Development by Robert Love
- [LWN.net: Completing the EEVDF scheduler](https://lwn.net/Articles/925371/)
- [IBM Developer: Inside the Linux 2.6 Completely Fair Scheduler](https://developer.ibm.com/tutorials/l-completely-fair-scheduler/)
- [Phoronix: EEVDF Scheduler May Be Ready For Landing With Linux 6.6](https://www.phoronix.com/news/Linux-6.6-EEVDF-Warming-Up)

---

