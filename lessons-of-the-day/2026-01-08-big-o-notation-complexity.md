# Big O Notation & Algorithm Complexity - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Big O notation definition and mathematical foundation
- [ ] Master time complexity analysis for common algorithms
- [ ] Learn space complexity and memory analysis
- [ ] Recognize common complexity classes (O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ))
- [ ] Understand polynomial time and why it defines "efficient" algorithms
- [ ] Distinguish between polynomial and non-polynomial (exponential) time complexity
- [ ] Understand best, average, and worst-case complexity
- [ ] Practice analyzing nested loops, recursion, and data structure operations
- [ ] Learn how to optimize algorithms using complexity analysis
- [ ] Understand the relationship between complexity classes and NP-hardness
- [ ] Explore amortized analysis and asymptotic behavior
- [ ] Master complexity analysis for real-world algorithm selection

---

## 🎯 Definition

**Big O Notation** is a mathematical notation used to describe the limiting behavior of a function when the argument tends towards a particular value or infinity. In computer science, it's used to classify algorithms according to how their runtime or space requirements grow as the input size increases.

**Intent:**
- Provide a way to describe the worst-case performance of an algorithm
- Compare algorithms independently of machine-specific constants
- Understand how algorithms scale with input size
- Make informed decisions about algorithm selection
- Also known as: **Asymptotic Notation**, **Order of Growth**, **Complexity Analysis**

**Key Principle:**
> "Focus on growth rate, not constants" - Big O notation describes how an algorithm's resource requirements (time or space) grow as the input size approaches infinity. It ignores constants, lower-order terms, and machine-specific factors to focus on the fundamental scalability of an algorithm.

---

## 🏗️ Structure & Concepts

### Mathematical Foundation

**Formal Definition:**
```
f(n) = O(g(n)) if and only if there exist positive constants c and n₀ such that:
0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀
```

**Intuitive Meaning:**
- f(n) grows no faster than g(n) (up to a constant factor)
- g(n) is an upper bound on f(n)
- We care about behavior as n → ∞

**Key Properties:**
- **Constants are ignored**: O(5n) = O(n)
- **Lower-order terms are ignored**: O(n² + n) = O(n²)
- **Only the fastest-growing term matters**: O(2ⁿ + n²) = O(2ⁿ)

### Common Complexity Classes

**O(1) - Constant Time:**
- Runtime doesn't depend on input size
- Example: Array access, hash table lookup
- **Growth**: No growth (flat line)

**O(log n) - Logarithmic Time:**
- Runtime grows logarithmically with input size
- Example: Binary search, balanced tree operations
- **Growth**: Very slow growth (excellent scalability)

**O(n) - Linear Time:**
- Runtime grows proportionally with input size
- Example: Iterating through array, finding max element
- **Growth**: Proportional growth (good scalability)

**O(n log n) - Linearithmic Time:**
- Runtime grows slightly faster than linear
- Example: Efficient sorting (merge sort, heap sort), divide-and-conquer algorithms
- **Growth**: Slightly superlinear (acceptable scalability)

**O(n²) - Quadratic Time:**
- Runtime grows quadratically with input size
- Example: Nested loops, bubble sort, selection sort
- **Growth**: Quadratic growth (poor scalability for large inputs)

**O(n³) - Cubic Time:**
- Runtime grows cubically with input size
- Example: Triple nested loops, matrix multiplication (naive)
- **Growth**: Cubic growth (very poor scalability)

**O(2ⁿ) - Exponential Time:**
- Runtime doubles with each additional input element
- Example: Recursive Fibonacci (naive), brute-force subset generation
- **Growth**: Exponential growth (impractical for large inputs)

**O(n!) - Factorial Time:**
- Runtime grows factorially with input size
- Example: Generating all permutations, brute-force TSP
- **Growth**: Factorial growth (extremely impractical)

### Polynomial Time - The Foundation of Efficient Algorithms

**Definition:**
An algorithm runs in **polynomial time** if its time complexity is O(n^k) for some constant k ≥ 0, where n is the input size. Polynomial time algorithms are considered "efficient" or "tractable" in computational complexity theory.

**Mathematical Form:**
```
T(n) = O(n^k) for some constant k ≥ 0
```

**Key Insight:**
> Polynomial time represents the boundary between "efficient" and "inefficient" algorithms. Problems solvable in polynomial time are considered tractable, while problems requiring exponential or worse time are considered intractable.

#### Polynomial Time Complexity Classes

**O(1) - Constant (k = 0):**
- Polynomial: Yes (n⁰ = 1)
- Example: Array access, hash table lookup
- **Efficiency**: Most efficient

**O(log n) - Logarithmic:**
- Polynomial: Technically no (but considered "better than polynomial")
- Example: Binary search, balanced tree operations
- **Efficiency**: Extremely efficient (better than polynomial)

**O(n) - Linear (k = 1):**
- Polynomial: Yes (n¹ = n)
- Example: Iterating through array, finding maximum
- **Efficiency**: Very efficient

**O(n log n) - Linearithmic:**
- Polynomial: No (but very close, often treated as "practically polynomial")
- Example: Efficient sorting algorithms
- **Efficiency**: Efficient in practice

**O(n²) - Quadratic (k = 2):**
- Polynomial: Yes (n²)
- Example: Nested loops, bubble sort, matrix multiplication (naive)
- **Efficiency**: Acceptable for moderate inputs

**O(n³) - Cubic (k = 3):**
- Polynomial: Yes (n³)
- Example: Triple nested loops, naive matrix multiplication
- **Efficiency**: Acceptable for small inputs

**O(n^k) - Polynomial (k ≥ 1):**
- Polynomial: Yes (any fixed k)
- Example: k nested loops
- **Efficiency**: Depends on k, but still considered tractable

#### Non-Polynomial Time (Intractable)

**O(2ⁿ) - Exponential:**
- Polynomial: No
- Example: Naive recursive Fibonacci, brute-force subset generation
- **Efficiency**: Intractable for large inputs

**O(n!) - Factorial:**
- Polynomial: No
- Example: Generating all permutations, brute-force TSP
- **Efficiency**: Extremely intractable

**O(nⁿ) - Super-exponential:**
- Polynomial: No
- Example: Some brute-force algorithms
- **Efficiency**: Completely impractical

#### Why Polynomial Time Matters

**1. Tractability:**
- Polynomial time algorithms are considered "solvable" in practice
- Can handle reasonably large inputs
- Predictable scaling behavior

**2. Complexity Theory:**
- Defines the class P (Polynomial time)
- Foundation for P vs NP problem
- Distinguishes tractable from intractable problems

**3. Practical Significance:**
- Most real-world algorithms aim for polynomial time
- Exponential algorithms are avoided when possible
- Guides algorithm design and optimization

**4. Scalability:**
- Polynomial algorithms scale predictably
- Can estimate performance for larger inputs
- Enables system planning and resource allocation

#### Examples of Polynomial Time Algorithms

```typescript
// O(n) - Linear polynomial
function findMax(arr: number[]): number {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) { // n iterations
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// O(n²) - Quadratic polynomial
function bubbleSort(arr: number[]): number[] {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) { // n iterations
    for (let j = 0; j < result.length - i - 1; j++) { // n iterations
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}

// O(n³) - Cubic polynomial
function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const C: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) { // n iterations
    for (let j = 0; j < n; j++) { // n iterations
      for (let k = 0; k < n; k++) { // n iterations
        C[i][j] += A[i][k] * B[k][j]; // Total: O(n³)
      }
    }
  }
  
  return C;
}

// O(n⁴) - Quartic polynomial (still polynomial!)
function process4DArray(data: number[][][][]): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) { // n iterations
    for (let j = 0; j < data[i].length; j++) { // n iterations
      for (let k = 0; k < data[i][j].length; k++) { // n iterations
        for (let l = 0; l < data[i][j][k].length; l++) { // n iterations
          sum += data[i][j][k][l]; // Total: O(n⁴)
        }
      }
    }
  }
  return sum;
}
```

#### Polynomial vs Non-Polynomial Comparison

| Complexity | Polynomial? | Tractable? | Example Input Size (1 sec) |
|------------|-------------|------------|----------------------------|
| O(1)       | Yes         | Yes        | Unlimited                 |
| O(log n)   | No*         | Yes        | 10²⁰                      |
| O(n)       | Yes         | Yes        | 10⁹                       |
| O(n log n) | No*         | Yes        | 10⁷                       |
| O(n²)      | Yes         | Yes        | 10⁴                       |
| O(n³)      | Yes         | Yes        | 10³                       |
| O(2ⁿ)      | No          | No         | 30                        |
| O(n!)      | No          | No         | 12                        |

*Technically not polynomial but considered "better than polynomial" or "practically polynomial"

#### The P Class (Polynomial Time)

**Definition:**
P is the class of decision problems that can be solved by a deterministic Turing machine in polynomial time.

**Key Properties:**
- All polynomial time algorithms belong to P
- P is closed under composition (polynomial of polynomial is polynomial)
- P represents "efficiently solvable" problems
- Most practical algorithms are in P

**Examples of Problems in P:**
- Sorting: O(n log n) - in P
- Shortest path: O(V + E) - in P
- Maximum flow: O(V²E) - in P
- Matrix multiplication: O(n³) - in P
- Linear programming: O(n³.5) - in P

**Why P Matters:**
- Defines what's "efficiently solvable"
- Foundation for complexity theory
- Contrasts with NP (non-deterministic polynomial)
- Central to P vs NP problem (one of seven Millennium Prize Problems)

#### Practical Considerations

**High-Degree Polynomials:**
- O(n⁵) or O(n¹⁰) are still polynomial but may be impractical
- Considered "tractable" but may need optimization
- Example: Some graph algorithms with high polynomial degree

**Quasi-Polynomial:**
- O(2^(log n)^k) for some k
- Between polynomial and exponential
- Example: Some approximation algorithms

**Sub-Polynomial:**
- O(n^ε) for any ε > 0
- Better than any polynomial
- Example: O(√n), O(n^0.5)

**When Polynomial Time Isn't Enough:**
- Real-time systems may need O(n) or better
- Large-scale systems may need O(n log n) or better
- Some applications require sub-linear algorithms

### Complexity Comparison Table

| Input Size | O(1) | O(log n) | O(n) | O(n log n) | O(n²) | O(2ⁿ) |
|------------|------|----------|------|------------|-------|-------|
| 10         | 1    | 3        | 10   | 33         | 100   | 1,024 |
| 100        | 1    | 7        | 100  | 664        | 10K   | 10³⁰  |
| 1,000      | 1    | 10       | 1K   | 10K        | 1M    | 10³⁰¹ |
| 10,000     | 1    | 13       | 10K  | 133K       | 100M  | 10³⁰⁰¹ |

### Time vs Space Complexity

**Time Complexity:**
- Measures how runtime grows with input size
- Focus on number of operations performed
- Most commonly discussed complexity

**Space Complexity:**
- Measures how memory usage grows with input size
- Includes input space, auxiliary space, and output space
- Often analyzed separately from time complexity

**Trade-offs:**
- Some algorithms optimize for time at the expense of space
- Some algorithms optimize for space at the expense of time
- Understanding both helps make informed decisions

### Best, Average, and Worst Case

**Best Case (Ω - Omega):**
- Minimum time/space required
- Example: Finding element at first position in array
- Often not representative of real-world performance

**Average Case (Θ - Theta):**
- Expected time/space for typical inputs
- Example: Average case for quicksort is O(n log n)
- Most useful for practical algorithm selection

**Worst Case (O - Big O):**
- Maximum time/space required
- Example: Finding element at last position in array
- Most commonly used for algorithm analysis

**Why Worst Case Matters:**
- Guarantees performance bounds
- Critical for real-time systems
- Important for security (prevent timing attacks)

---

## 💡 When to Use Complexity Analysis

### Use Complexity Analysis When:

✅ **Comparing algorithms**
- Choosing between different approaches
- Understanding trade-offs
- Making performance decisions

✅ **Optimizing code**
- Identifying bottlenecks
- Understanding scalability limits
- Planning for growth

✅ **System design**
- Estimating resource requirements
- Planning infrastructure
- Setting performance expectations

✅ **Interview preparation**
- Demonstrating algorithmic thinking
- Analyzing problem solutions
- Communicating technical decisions

✅ **Research and development**
- Proving algorithm properties
- Understanding theoretical limits
- Exploring new algorithms

### Complexity Analysis Helps Answer:

- "Will this algorithm scale to 1 million users?"
- "How much faster will this be with 10x more data?"
- "Is this optimization worth the added complexity?"
- "What's the theoretical limit of this approach?"

---

## 🔨 Implementation Examples

### Example 1: Constant Time O(1)

```typescript
// Array access - O(1)
function getFirstElement(arr: number[]): number {
  return arr[0]; // Single operation, independent of array size
}

// Hash table lookup - O(1) average case
class HashTable {
  private table: Map<string, number> = new Map();
  
  get(key: string): number | undefined {
    return this.table.get(key); // Hash computation + lookup = O(1)
  }
  
  set(key: string, value: number): void {
    this.table.set(key, value); // Hash computation + insertion = O(1)
  }
}

// Stack operations - O(1)
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item); // O(1)
  }
  
  pop(): T | undefined {
    return this.items.pop(); // O(1)
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1]; // O(1)
  }
}
```

**Analysis:**
- Operations complete in constant time regardless of input size
- No loops or recursion involved
- Direct memory access or simple calculations

### Example 2: Logarithmic Time O(log n)

```typescript
// Binary search - O(log n)
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1; // Eliminate half of remaining elements
    } else {
      right = mid - 1; // Eliminate half of remaining elements
    }
  }
  
  return -1;
}

// Balanced BST operations - O(log n)
class TreeNode {
  constructor(
    public value: number,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null
  ) {}
}

function searchBST(root: TreeNode | null, target: number): TreeNode | null {
  if (!root || root.value === target) {
    return root;
  }
  
  // Each step eliminates half of remaining nodes
  if (target < root.value) {
    return searchBST(root.left, target); // O(log n)
  } else {
    return searchBST(root.right, target); // O(log n)
  }
}
```

**Analysis:**
- Each step eliminates half of the search space
- Number of steps = log₂(n)
- Requires sorted data or tree structure

### Example 3: Linear Time O(n)

```typescript
// Finding maximum element - O(n)
function findMax(arr: number[]): number {
  let max = arr[0];
  
  for (let i = 1; i < arr.length; i++) { // n iterations
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  
  return max;
}

// Linear search - O(n)
function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) { // n iterations
    if (arr[i] === target) {
      return i;
    }
  }
  
  return -1;
}

// Sum of array - O(n)
function sumArray(arr: number[]): number {
  let sum = 0;
  
  for (const num of arr) { // n iterations
    sum += num;
  }
  
  return sum;
}
```

**Analysis:**
- Single loop through all elements
- Operations scale linearly with input size
- Each element visited exactly once

### Example 4: Linearithmic Time O(n log n)

```typescript
// Merge sort - O(n log n)
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) {
    return arr; // Base case: O(1)
  }
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid)); // T(n/2)
  const right = mergeSort(arr.slice(mid)); // T(n/2)
  
  return merge(left, right); // O(n)
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) { // O(n)
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// Heap sort - O(n log n)
class MinHeap {
  private heap: number[] = [];
  
  insert(value: number): void {
    this.heap.push(value);
    this.heapifyUp(); // O(log n)
  }
  
  extractMin(): number | undefined {
    if (this.heap.length === 0) return undefined;
    
    const min = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown(); // O(log n)
    
    return min;
  }
  
  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) { // O(log n)
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent] <= this.heap[index]) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }
  
  private heapifyDown(): void {
    let index = 0;
    while (true) { // O(log n)
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      
      if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }
      
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}
```

**Analysis:**
- Divide-and-conquer algorithms
- Recursive splitting (log n levels) × linear work per level (n)
- Most efficient comparison-based sorting algorithms

### Example 5: Quadratic Time O(n²)

```typescript
// Bubble sort - O(n²)
function bubbleSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;
  
  for (let i = 0; i < n; i++) { // n iterations
    for (let j = 0; j < n - i - 1; j++) { // n-i iterations
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  
  return result;
}

// Selection sort - O(n²)
function selectionSort(arr: number[]): number[] {
  const result = [...arr];
  const n = result.length;
  
  for (let i = 0; i < n - 1; i++) { // n iterations
    let minIndex = i;
    
    for (let j = i + 1; j < n; j++) { // n-i iterations
      if (result[j] < result[minIndex]) {
        minIndex = j;
      }
    }
    
    [result[i], result[minIndex]] = [result[minIndex], result[i]];
  }
  
  return result;
}

// Finding all pairs - O(n²)
function findAllPairs(arr: number[]): [number, number][] {
  const pairs: [number, number][] = [];
  
  for (let i = 0; i < arr.length; i++) { // n iterations
    for (let j = i + 1; j < arr.length; j++) { // n-i iterations
      pairs.push([arr[i], arr[j]]);
    }
  }
  
  return pairs;
}
```

**Analysis:**
- Nested loops where inner loop depends on outer loop
- Total iterations: n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 = O(n²)
- Common in naive algorithms

### Example 6: Exponential Time O(2ⁿ)

```typescript
// Naive recursive Fibonacci - O(2ⁿ)
function fibonacciNaive(n: number): number {
  if (n <= 1) {
    return n; // Base case
  }
  
  // Each call makes 2 recursive calls
  return fibonacciNaive(n - 1) + fibonacciNaive(n - 2); // O(2ⁿ)
}

// Generating all subsets - O(2ⁿ)
function generateSubsets<T>(arr: T[]): T[][] {
  if (arr.length === 0) {
    return [[]]; // Base case: empty set
  }
  
  const first = arr[0];
  const rest = arr.slice(1);
  const subsetsWithoutFirst = generateSubsets(rest); // 2^(n-1) subsets
  const subsetsWithFirst = subsetsWithoutFirst.map(subset => [first, ...subset]);
  
  return [...subsetsWithoutFirst, ...subsetsWithFirst]; // 2^n total subsets
}

// Power set - O(2ⁿ)
function powerSet<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  const n = arr.length;
  
  // Generate all 2^n combinations
  for (let i = 0; i < (1 << n); i++) { // 2^n iterations
    const subset: T[] = [];
    
    for (let j = 0; j < n; j++) { // n iterations
      if (i & (1 << j)) {
        subset.push(arr[j]);
      }
    }
    
    result.push(subset);
  }
  
  return result; // Total: O(n * 2^n) = O(2^n) for large n
}
```

**Analysis:**
- Each step creates multiple recursive branches
- Number of operations doubles with each additional input element
- Often indicates need for optimization (memoization, dynamic programming)

### Example 7: Space Complexity Analysis

```typescript
// O(1) space - constant space
function findMax(arr: number[]): number {
  let max = arr[0]; // O(1) space
  
  for (const num of arr) {
    if (num > max) {
      max = num; // Only one variable
    }
  }
  
  return max;
}

// O(n) space - linear space
function reverseArray(arr: number[]): number[] {
  const result: number[] = []; // O(n) space
  
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]); // Creates new array of size n
  }
  
  return result;
}

// O(n) space - recursive call stack
function factorialRecursive(n: number): number {
  if (n <= 1) {
    return 1; // Base case
  }
  
  // Call stack depth: n
  // Each call uses O(1) space
  // Total: O(n) space
  return n * factorialRecursive(n - 1);
}

// O(log n) space - balanced recursion
function binarySearchRecursive(
  arr: number[],
  target: number,
  left: number = 0,
  right: number = arr.length - 1
): number {
  if (left > right) {
    return -1;
  }
  
  const mid = Math.floor((left + right) / 2);
  
  if (arr[mid] === target) {
    return mid;
  } else if (arr[mid] < target) {
    // Call stack depth: log n
    // Each call uses O(1) space
    // Total: O(log n) space
    return binarySearchRecursive(arr, target, mid + 1, right);
  } else {
    return binarySearchRecursive(arr, target, left, mid - 1);
  }
}
```

**Analysis:**
- Space complexity includes input space, auxiliary space, and output space
- Recursive algorithms use call stack space
- Some algorithms trade space for time (memoization)

### Example 8: Optimizing from O(n²) to O(n log n)

```typescript
// O(n²) - naive approach
function hasDuplicateNaive(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++) { // n iterations
    for (let j = i + 1; j < arr.length; j++) { // n-i iterations
      if (arr[i] === arr[j]) {
        return true;
      }
    }
  }
  return false;
}

// O(n log n) - sorting approach
function hasDuplicateSorted(arr: number[]): boolean {
  const sorted = [...arr].sort(); // O(n log n)
  
  for (let i = 0; i < sorted.length - 1; i++) { // O(n)
    if (sorted[i] === sorted[i + 1]) {
      return true;
    }
  }
  
  return false;
}

// O(n) - hash set approach
function hasDuplicateOptimal(arr: number[]): boolean {
  const seen = new Set<number>(); // O(n) space
  
  for (const num of arr) { // O(n) time
    if (seen.has(num)) { // O(1) average
      return true;
    }
    seen.add(num); // O(1) average
  }
  
  return false;
}
```

**Analysis:**
- Naive: O(n²) time, O(1) space
- Sorted: O(n log n) time, O(n) space
- Optimal: O(n) time, O(n) space
- Trade-off between time and space complexity

---

## 🎓 Advanced Concepts

### Amortized Analysis

**Definition:**
Amortized analysis considers the average time per operation over a sequence of operations, rather than worst-case time for individual operations.

**Example: Dynamic Array (ArrayList):**

```typescript
class DynamicArray<T> {
  private array: T[];
  private capacity: number;
  private size: number;
  
  constructor(initialCapacity: number = 4) {
    this.capacity = initialCapacity;
    this.array = new Array(initialCapacity);
    this.size = 0;
  }
  
  push(item: T): void {
    if (this.size >= this.capacity) {
      // Resize: O(n) operation
      this.resize();
    }
    // Normal push: O(1) operation
    this.array[this.size++] = item;
  }
  
  private resize(): void {
    this.capacity *= 2;
    const newArray = new Array(this.capacity);
    
    for (let i = 0; i < this.size; i++) { // O(n)
      newArray[i] = this.array[i];
    }
    
    this.array = newArray;
  }
}
```

**Amortized Analysis:**
- Most pushes: O(1)
- Occasional resize: O(n)
- Amortized cost: O(1) per push
- Over n operations: n O(1) + 1 O(n) = O(n) total = O(1) amortized

### Master Theorem

**For Divide-and-Conquer Recurrences:**

```
T(n) = aT(n/b) + f(n)

where:
- a ≥ 1 (number of subproblems)
- b > 1 (subproblem size factor)
- f(n) is the cost of dividing and combining
```

**Cases:**
1. If f(n) = O(n^log_b(a-ε)) for some ε > 0: T(n) = Θ(n^log_b(a))
2. If f(n) = Θ(n^log_b(a)): T(n) = Θ(n^log_b(a) log n)
3. If f(n) = Ω(n^log_b(a+ε)) and af(n/b) ≤ cf(n) for some c < 1: T(n) = Θ(f(n))

**Example: Merge Sort**
```
T(n) = 2T(n/2) + O(n)
a = 2, b = 2, f(n) = O(n)
log_b(a) = log_2(2) = 1
f(n) = Θ(n^1) = Θ(n^log_b(a))
Case 2: T(n) = Θ(n log n) ✓
```

### Complexity Classes and P vs NP

**P (Polynomial Time):**
- Problems solvable in polynomial time: O(n^k) for some constant k
- Example: Sorting (O(n log n)), shortest path (O(V + E))

**NP (Non-deterministic Polynomial):**
- Problems where solutions can be verified in polynomial time
- Example: Sudoku verification, graph coloring verification

**NP-Complete:**
- Problems in NP that are at least as hard as any problem in NP
- If any NP-complete problem has polynomial solution, P = NP
- Example: Boolean satisfiability (SAT), subset sum

**NP-Hard:**
- Problems at least as hard as NP-complete problems
- May not be in NP (optimization problems)
- Example: Travelling salesman (optimization), knapsack (optimization)

**Relationship:**
```
P ⊆ NP ⊆ NP-Complete ⊆ NP-Hard
```

**Implications:**
- If P = NP: All NP problems have efficient solutions
- If P ≠ NP (widely believed): NP-hard problems have no efficient solutions
- Big O helps identify which problems are tractable (polynomial) vs intractable (exponential)

### Analyzing Recursive Algorithms

**Recurrence Relations:**

```typescript
// Example 1: Linear recursion
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1); // T(n) = T(n-1) + O(1) = O(n)
}

// Example 2: Binary recursion
function fibonacciDP(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  
  // T(n) = T(n-1) + T(n-2) + O(1)
  // With memoization: O(n) time, O(n) space
  const result = fibonacciDP(n - 1, memo) + fibonacciDP(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Example 3: Divide and conquer
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  // T(n) = T(n/2) + T(n/2) + O(n) = 2T(n/2) + O(n) = O(n log n) average
  return [...quickSort(left), ...middle, ...quickSort(right)];
}
```

---

## 🚨 Common Pitfalls & Mistakes

### Pitfall 1: Ignoring Constants in Practice

**Mistake:**
```typescript
// Assuming O(n) is always better than O(n log n)
function processSmallArray(arr: number[]) {
  // For small arrays, O(n²) might be faster due to lower overhead
  return arr.sort(); // O(n log n) but might be slower for n < 10
}
```

**Reality:**
- Big O describes asymptotic behavior (large n)
- For small inputs, constants matter
- O(n log n) might be slower than O(n²) for n < 100

**Solution:**
- Consider actual input sizes
- Profile real-world performance
- Use Big O for scalability, not absolute performance

### Pitfall 2: Confusing Time and Space Complexity

**Mistake:**
```typescript
// Thinking O(n) space algorithm is O(n) time
function createMatrix(n: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    matrix[i] = new Array(n); // O(n²) space, O(n²) time
  }
  return matrix;
}
```

**Reality:**
- Time and space complexity are independent
- An algorithm can be O(n) time but O(1) space
- Or O(1) time but O(n) space

**Solution:**
- Analyze time and space separately
- Consider both when making decisions
- Understand trade-offs

### Pitfall 3: Incorrectly Analyzing Nested Loops

**Mistake:**
```typescript
// Thinking this is O(n²)
function processMatrix(matrix: number[][]) {
  for (let i = 0; i < matrix.length; i++) { // n iterations
    for (let j = 0; j < matrix[i].length; j++) { // m iterations
      // Processing...
    }
  }
  // Actually O(n * m), not O(n²) unless n = m
}
```

**Reality:**
- Nested loops: O(outer iterations × inner iterations)
- If dimensions differ, use different variables
- O(n²) only if both dimensions are the same size

**Solution:**
- Use separate variables for different dimensions
- O(n × m) is more accurate than O(n²) when n ≠ m
- Be precise about input sizes

### Pitfall 4: Forgetting About Hidden Operations

**Mistake:**
```typescript
// Thinking this is O(n)
function processArray(arr: number[]) {
  const sorted = arr.sort(); // O(n log n) - hidden!
  for (const num of sorted) { // O(n)
    // Processing...
  }
  // Total: O(n log n), not O(n)
}
```

**Reality:**
- Built-in operations have their own complexity
- Array methods (sort, filter, map) have complexity
- String operations can be expensive

**Solution:**
- Account for all operations
- Know complexity of library functions
- Consider hidden costs

### Pitfall 5: Overlooking Space Complexity

**Mistake:**
```typescript
// Focusing only on time complexity
function fibonacciMemo(n: number): number {
  const memo = new Map<number, number>(); // O(n) space
  // O(n) time, but O(n) space too
  return fibHelper(n, memo);
}
```

**Reality:**
- Space complexity matters for memory-constrained systems
- Recursive algorithms use call stack space
- Some optimizations trade time for space

**Solution:**
- Always consider space complexity
- Understand memory constraints
- Know when space is more important than time

---

## ✅ Best Practices

### 1. Always Analyze Both Time and Space

```typescript
// Good: Consider both
function findDuplicates(arr: number[]): number[] {
  const seen = new Set<number>(); // O(n) space
  const duplicates: number[] = [];
  
  for (const num of arr) { // O(n) time
    if (seen.has(num)) {
      duplicates.push(num);
    } else {
      seen.add(num);
    }
  }
  
  return duplicates; // O(n) time, O(n) space
}
```

### 2. Use Appropriate Data Structures

```typescript
// Good: Choose data structure based on operations needed
class EfficientLookup {
  private map = new Map<string, number>(); // O(1) lookup
  
  get(key: string): number | undefined {
    return this.map.get(key); // O(1) instead of O(n) with array
  }
}
```

### 3. Optimize the Critical Path

```typescript
// Good: Optimize the most frequently called code
function processData(data: number[]) {
  // Optimize this - called millions of times
  const sorted = data.sort(); // O(n log n) - acceptable
  
  // This runs once - less critical
  const summary = generateSummary(sorted); // O(n) - fine
}
```

### 4. Consider Input Characteristics

```typescript
// Good: Adapt algorithm to input
function search(arr: number[], target: number): number {
  // If sorted: O(log n) binary search
  if (isSorted(arr)) {
    return binarySearch(arr, target);
  }
  
  // If unsorted: O(n) linear search
  return linearSearch(arr, target);
}
```

### 5. Document Complexity

```typescript
/**
 * Finds the maximum element in an array.
 * 
 * Time Complexity: O(n) - must check every element
 * Space Complexity: O(1) - only uses constant extra space
 * 
 * @param arr - Array of numbers
 * @returns Maximum value in the array
 */
function findMax(arr: number[]): number {
  // Implementation...
}
```

### 6. Profile Before Optimizing

```typescript
// Good: Measure before optimizing
function optimizedFunction(data: number[]) {
  // Profile first to find actual bottlenecks
  // Don't optimize based on assumptions
  // Use profiling tools to identify hot paths
}
```

---

## 🌍 Real-World Applications

### Database Query Optimization

**Scenario:**
- Database queries need to be optimized for performance
- Indexes use O(log n) lookups instead of O(n) scans
- Query planners use complexity analysis

**Example:**
```sql
-- Without index: O(n) full table scan
SELECT * FROM users WHERE email = 'user@example.com';

-- With index: O(log n) index lookup
CREATE INDEX idx_email ON users(email);
SELECT * FROM users WHERE email = 'user@example.com';
```

### Web Application Performance

**Scenario:**
- API endpoints must handle increasing load
- Understanding complexity helps scale systems
- Identifies bottlenecks before they become problems

**Example:**
```typescript
// O(n²) - won't scale
function findRelatedUsers(userId: string): User[] {
  const allUsers = getAllUsers(); // O(n)
  return allUsers.filter(user => {
    return allUsers.some(other => areRelated(user, other)); // O(n²)
  });
}

// O(n) - scales better
function findRelatedUsersOptimized(userId: string): User[] {
  const user = getUser(userId); // O(1)
  const relatedIds = getRelatedIds(userId); // O(1) with proper indexing
  return relatedIds.map(id => getUser(id)); // O(k) where k is related count
}
```

### Algorithm Selection in Libraries

**Scenario:**
- Standard libraries choose algorithms based on complexity
- JavaScript's Array.sort() uses different algorithms for different sizes
- Understanding helps predict performance

**Example:**
```typescript
// JavaScript engines use:
// - Insertion sort for small arrays (O(n²) but low overhead)
// - Quicksort/mergesort for larger arrays (O(n log n))
// - Hybrid approaches for optimal performance
```

### System Design Decisions

**Scenario:**
- Choosing between data structures
- Understanding trade-offs
- Planning for scale

**Example:**
```typescript
// Decision: Array vs Set vs Map
// Need: Fast lookup by ID

// Array: O(n) lookup - not suitable
const users: User[] = [];

// Set: O(1) lookup - good for simple existence checks
const userIds = new Set<string>();

// Map: O(1) lookup - best for key-value pairs
const usersById = new Map<string, User>();
```

---

## 🔗 Relationship to NP-Hardness

### Complexity Classes Hierarchy

```
P (Polynomial) ⊆ NP ⊆ NP-Complete ⊆ NP-Hard
```

**P (Polynomial Time):**
- Problems solvable in O(n^k) for some constant k ≥ 0
- All polynomial time algorithms: O(1), O(n), O(n²), O(n³), etc.
- Example: Sorting O(n log n), shortest path O(V + E), matrix multiplication O(n³)
- **Tractable**: Can be solved efficiently with polynomial time algorithms
- **Key Property**: If a problem is in P, there exists a polynomial time algorithm to solve it

**NP (Non-deterministic Polynomial):**
- Problems where solutions can be **verified** in polynomial time
- May or may not be solvable in polynomial time (unknown)
- Example: Sudoku verification O(n²), graph coloring verification
- **Unknown**: Not proven to be in P or outside P
- **Key Insight**: Easy to check if solution is correct, but hard to find solution

**NP-Complete:**
- Hardest problems in NP
- All NP problems can be reduced to any NP-complete problem
- If any NP-complete problem has polynomial solution, then P = NP
- Example: Boolean satisfiability (SAT), subset sum (decision version), 3-SAT
- **Intractable (likely)**: No known polynomial time solution exists
- **Complexity**: Typically O(2ⁿ) or worse - exponential or factorial

**NP-Hard:**
- At least as hard as NP-complete problems
- May not be in NP (optimization problems, undecidable problems)
- Example: Travelling salesman (optimization), knapsack (optimization), halting problem
- **Intractable**: No known polynomial time solution exists
- **Complexity**: O(2ⁿ), O(n!), or worse - clearly non-polynomial

### Why Big O Matters for NP-Hard Problems

**Identifying Intractability:**
- **Polynomial time (O(n^k))**: Tractable, problem likely in P
- **Non-polynomial time (O(2ⁿ), O(n!))**: Intractable, likely NP-hard
- Big O notation helps distinguish polynomial from non-polynomial
- Helps recognize when to use approximations instead of exact solutions
- Guides algorithm selection: polynomial = exact solution, exponential = approximation needed

**Example:**
```typescript
// TSP brute force: O(n!) - clearly intractable
function tspBruteForce(cities: City[]): Route {
  // Try all permutations: n! possibilities
  // For 20 cities: 20! = 2.4 × 10¹⁸ routes
  // Clearly NP-hard, need approximation
}

// TSP approximation: O(n²) - tractable (polynomial time)
function tspApproximation(cities: City[]): Route {
  // 2-approximation algorithm
  // Gets solution within 2× of optimal
  // Polynomial time: O(n²) - this is why it's practical!
  // Even though exact solution is NP-hard, polynomial approximation exists
}
```

**Practical Implications:**
- Big O helps identify when problems are likely NP-hard
- Guides decision to use approximations vs exact solutions
- Helps estimate computational requirements
- Informs system design and resource planning

---

## 📚 Summary

### Key Takeaways

1. **Big O Notation** describes how algorithms scale as input size grows, focusing on growth rate rather than constants.

2. **Common Complexity Classes:**
   - O(1): Constant - best scalability
   - O(log n): Logarithmic - excellent scalability
   - O(n): Linear - good scalability
   - O(n log n): Linearithmic - acceptable scalability
   - O(n²): Quadratic - poor scalability
   - O(2ⁿ): Exponential - impractical for large inputs
   - O(n!): Factorial - extremely impractical

3. **Time vs Space:** Analyze both independently - an algorithm can optimize for one at the expense of the other.

4. **Best, Average, Worst Case:** Understand all three, but worst case provides guarantees.

5. **Amortized Analysis:** Some operations are expensive occasionally but cheap on average.

6. **Polynomial Time:** Algorithms with O(n^k) complexity are considered "efficient" and tractable. This defines the class P and distinguishes solvable problems from intractable ones.

7. **NP-Hardness Connection:** Big O helps identify intractable problems (exponential/factorial complexity) that may require approximation algorithms. The distinction between polynomial and non-polynomial time is fundamental to complexity theory.

7. **Practical Application:** Use complexity analysis to compare algorithms, optimize code, design systems, and make informed decisions about scalability.

### When to Use Each Complexity Class

- **O(1) or O(log n):** Ideal for frequently called operations (lookups, searches)
- **O(n) or O(n log n):** Acceptable for most algorithms (sorting, processing)
- **O(n²):** Acceptable for small inputs, consider optimization for large inputs
- **O(2ⁿ) or O(n!):** Only for very small inputs, or use approximations

### Next Steps

- Practice analyzing algorithms you encounter
- Learn about data structure complexities
- Study advanced topics: amortized analysis, master theorem
- Explore NP-completeness and approximation algorithms
- Apply complexity analysis to real-world problems

---

## 🔗 Related Topics

- **Data Structures:** Understanding time/space complexity of operations (arrays, trees, hash tables)
- **Sorting Algorithms:** Comparing O(n²) vs O(n log n) sorting methods
- **Dynamic Programming:** Optimizing exponential algorithms to polynomial time
- **NP-Hardness:** Understanding when problems are intractable and require approximations
- **System Design:** Using complexity analysis for scalability planning
- **Algorithm Design Patterns:** Divide-and-conquer, greedy, dynamic programming complexity analysis

