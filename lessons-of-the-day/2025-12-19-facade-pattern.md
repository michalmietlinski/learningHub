# Facade Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Facade pattern definition and intent
- [ ] Learn when to use Facade vs other structural patterns
- [ ] Master simplifying complex subsystems
- [ ] Recognize real-world applications
- [ ] Understand how to create unified interfaces
- [ ] Practice implementing Facade in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Facade Pattern** is a structural design pattern that provides a simplified interface to a complex subsystem, library, or framework.

**Intent (GoF):**
- Provide a unified interface to a set of interfaces in a subsystem
- Define a higher-level interface that makes the subsystem easier to use
- Wrap a complex subsystem with a simpler interface
- Also known as: **Simplification Layer Pattern**

**Key Principle:**
> "Make it simple" - The facade pattern hides the complexity of a subsystem behind a simple, easy-to-use interface, making the subsystem more accessible and easier to understand.

---

## 🏗️ Structure

### UML Diagram Concept

```
Facade
├── subsystemA: SubsystemA
├── subsystemB: SubsystemB
├── subsystemC: SubsystemC
│
└── operation(): void
    ├── calls subsystemA.operation1()
    ├── calls subsystemB.operation2()
    └── calls subsystemC.operation3()

SubsystemA
└── operation1(): void

SubsystemB
└── operation2(): void

SubsystemC
└── operation3(): void

Client
└── uses Facade.operation()
```

### Participants

1. **Facade** - Knows which subsystem classes are responsible for a request and delegates client requests to appropriate subsystem objects
2. **Subsystem Classes** - Implement subsystem functionality and handle work assigned by the Facade
3. **Client** - Uses the Facade to interact with the subsystem

### Key Concepts

**Facade:**
- Provides a single, simplified interface to the subsystem
- Delegates client requests to appropriate subsystem objects
- Reduces coupling between clients and subsystem classes
- Doesn't prevent direct access to subsystem classes if needed

**Subsystem:**
- Can be a complex set of classes, libraries, or frameworks
- Classes work together to provide functionality
- Can be used independently or through the Facade

---

## 💡 When to Use

### Use Facade When:

✅ **You want to provide a simple interface to a complex subsystem**
- Example: Home theater system with multiple components (TV, sound system, lights, etc.)

✅ **You want to decouple clients from subsystem classes**
- Example: Database operations that require multiple steps (connection, transaction, query, commit)

✅ **You want to layer your subsystems**
- Example: Creating a higher-level API that wraps lower-level APIs

✅ **You have many interdependent classes and want to simplify their usage**
- Example: Payment processing that involves validation, fraud checking, gateway communication, logging

✅ **You want to provide a default, easy-to-use interface while still allowing advanced users to access the subsystem directly**
- Example: ORM that simplifies database access but allows raw SQL queries

### Don't Use When:

❌ **You need to expose all functionality of the subsystem** - Facade hides complexity, which might not be desired
❌ **The subsystem is simple** - Adding a Facade would be unnecessary overhead
❌ **You need fine-grained control** - Facade provides a simplified interface, not detailed control
❌ **Performance is critical and you need direct access** - Facade adds an extra layer of indirection

---

## 🔨 Implementation Examples

### Example 1: Basic Facade Pattern (JavaScript/TypeScript)

```javascript
// Subsystem Classes
class CPU {
  freeze() {
    console.log('CPU: Freezing...');
  }
  
  jump(position) {
    console.log(`CPU: Jumping to position ${position}`);
  }
  
  execute() {
    console.log('CPU: Executing instructions...');
  }
}

class Memory {
  load(position, data) {
    console.log(`Memory: Loading data at position ${position}`);
    return data;
  }
}

class HardDrive {
  read(lba, size) {
    console.log(`HardDrive: Reading ${size} bytes from LBA ${lba}`);
    return 'boot data';
  }
}

// Facade
class ComputerFacade {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }
  
  start() {
    console.log('=== Starting Computer ===');
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log('=== Computer Started ===\n');
  }
  
  shutdown() {
    console.log('=== Shutting Down Computer ===');
    this.cpu.freeze();
    console.log('=== Computer Shutdown ===\n');
  }
}

// Usage
const computer = new ComputerFacade();
computer.start();
// Output:
// === Starting Computer ===
// CPU: Freezing...
// HardDrive: Reading 1024 bytes from LBA 0
// Memory: Loading data at position 0
// CPU: Jumping to position 0
// CPU: Executing instructions...
// === Computer Started ===

computer.shutdown();
// Output:
// === Shutting Down Computer ===
// CPU: Freezing...
// === Computer Shutdown ===
```

### Example 2: Home Theater Facade (TypeScript)

```typescript
// Subsystem Classes
class Amplifier {
  private volume: number = 0;
  
  on(): void {
    console.log('Amplifier: Turning on...');
  }
  
  off(): void {
    console.log('Amplifier: Turning off...');
  }
  
  setVolume(volume: number): void {
    this.volume = volume;
    console.log(`Amplifier: Volume set to ${volume}`);
  }
  
  setSurroundSound(): void {
    console.log('Amplifier: Surround sound mode enabled');
  }
}

class Tuner {
  private frequency: number = 0;
  
  on(): void {
    console.log('Tuner: Turning on...');
  }
  
  off(): void {
    console.log('Tuner: Turning off...');
  }
  
  setFrequency(frequency: number): void {
    this.frequency = frequency;
    console.log(`Tuner: Frequency set to ${frequency} MHz`);
  }
}

class DvdPlayer {
  private movie: string | null = null;
  
  on(): void {
    console.log('DVD Player: Turning on...');
  }
  
  off(): void {
    console.log('DVD Player: Turning off...');
  }
  
  play(movie: string): void {
    this.movie = movie;
    console.log(`DVD Player: Playing "${movie}"`);
  }
  
  stop(): void {
    console.log('DVD Player: Stopping...');
    this.movie = null;
  }
  
  eject(): void {
    console.log('DVD Player: Ejecting disc...');
    this.movie = null;
  }
}

class Projector {
  on(): void {
    console.log('Projector: Turning on...');
  }
  
  off(): void {
    console.log('Projector: Turning off...');
  }
  
  wideScreenMode(): void {
    console.log('Projector: Wide screen mode enabled');
  }
}

class TheaterLights {
  dim(level: number): void {
    console.log(`Theater Lights: Dimming to ${level}%`);
  }
  
  on(): void {
    console.log('Theater Lights: Turning on...');
  }
}

class Screen {
  down(): void {
    console.log('Screen: Lowering screen...');
  }
  
  up(): void {
    console.log('Screen: Raising screen...');
  }
}

class PopcornPopper {
  on(): void {
    console.log('Popcorn Popper: Turning on...');
  }
  
  off(): void {
    console.log('Popcorn Popper: Turning off...');
  }
  
  pop(): void {
    console.log('Popcorn Popper: Popping popcorn...');
  }
}

// Facade
class HomeTheaterFacade {
  private amplifier: Amplifier;
  private tuner: Tuner;
  private dvd: DvdPlayer;
  private projector: Projector;
  private lights: TheaterLights;
  private screen: Screen;
  private popper: PopcornPopper;
  
  constructor(
    amplifier: Amplifier,
    tuner: Tuner,
    dvd: DvdPlayer,
    projector: Projector,
    lights: TheaterLights,
    screen: Screen,
    popper: PopcornPopper
  ) {
    this.amplifier = amplifier;
    this.tuner = tuner;
    this.dvd = dvd;
    this.projector = projector;
    this.lights = lights;
    this.screen = screen;
    this.popper = popper;
  }
  
  watchMovie(movie: string): void {
    console.log('\n=== Getting ready to watch a movie ===');
    this.popper.on();
    this.popper.pop();
    this.lights.dim(10);
    this.screen.down();
    this.projector.on();
    this.projector.wideScreenMode();
    this.amplifier.on();
    this.amplifier.setSurroundSound();
    this.amplifier.setVolume(5);
    this.dvd.on();
    this.dvd.play(movie);
    console.log('=== Movie ready! ===\n');
  }
  
  endMovie(): void {
    console.log('\n=== Shutting down movie theater ===');
    this.popper.off();
    this.lights.on();
    this.screen.up();
    this.projector.off();
    this.amplifier.off();
    this.dvd.stop();
    this.dvd.eject();
    this.dvd.off();
    console.log('=== Theater shutdown complete ===\n');
  }
  
  listenToRadio(frequency: number): void {
    console.log('\n=== Switching to radio ===');
    this.tuner.on();
    this.tuner.setFrequency(frequency);
    this.amplifier.on();
    this.amplifier.setVolume(3);
    console.log('=== Radio ready! ===\n');
  }
  
  endRadio(): void {
    console.log('\n=== Turning off radio ===');
    this.tuner.off();
    this.amplifier.off();
    console.log('=== Radio off ===\n');
  }
}

// Usage
const amplifier = new Amplifier();
const tuner = new Tuner();
const dvd = new DvdPlayer();
const projector = new Projector();
const lights = new TheaterLights();
const screen = new Screen();
const popper = new PopcornPopper();

const homeTheater = new HomeTheaterFacade(
  amplifier,
  tuner,
  dvd,
  projector,
  lights,
  screen,
  popper
);

homeTheater.watchMovie('The Matrix');
// Instead of manually calling:
// popper.on();
// popper.pop();
// lights.dim(10);
// screen.down();
// projector.on();
// projector.wideScreenMode();
// amplifier.on();
// amplifier.setSurroundSound();
// amplifier.setVolume(5);
// dvd.on();
// dvd.play('The Matrix');

homeTheater.endMovie();
```

### Example 3: Database Operations Facade

```typescript
// Subsystem Classes
class DatabaseConnection {
  connect(): void {
    console.log('Database: Establishing connection...');
  }
  
  disconnect(): void {
    console.log('Database: Closing connection...');
  }
  
  isConnected(): boolean {
    return true; // Simplified
  }
}

class QueryBuilder {
  buildSelect(table: string, columns: string[]): string {
    const cols = columns.join(', ');
    return `SELECT ${cols} FROM ${table}`;
  }
  
  buildInsert(table: string, data: Record<string, any>): string {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(v => `'${v}'`).join(', ');
    return `INSERT INTO ${table} (${columns}) VALUES (${values})`;
  }
  
  buildUpdate(table: string, data: Record<string, any>, where: string): string {
    const sets = Object.entries(data)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ');
    return `UPDATE ${table} SET ${sets} WHERE ${where}`;
  }
  
  buildDelete(table: string, where: string): string {
    return `DELETE FROM ${table} WHERE ${where}`;
  }
}

class TransactionManager {
  begin(): void {
    console.log('Transaction: Beginning transaction...');
  }
  
  commit(): void {
    console.log('Transaction: Committing transaction...');
  }
  
  rollback(): void {
    console.log('Transaction: Rolling back transaction...');
  }
}

class QueryExecutor {
  execute(query: string): any[] {
    console.log(`QueryExecutor: Executing query: ${query}`);
    // Simulated result
    return [{ id: 1, name: 'John Doe' }];
  }
}

class Logger {
  log(level: string, message: string): void {
    console.log(`[${level}] ${message}`);
  }
}

// Facade
class DatabaseFacade {
  private connection: DatabaseConnection;
  private queryBuilder: QueryBuilder;
  private transactionManager: TransactionManager;
  private queryExecutor: QueryExecutor;
  private logger: Logger;
  
  constructor() {
    this.connection = new DatabaseConnection();
    this.queryBuilder = new QueryBuilder();
    this.transactionManager = new TransactionManager();
    this.queryExecutor = new QueryExecutor();
    this.logger = new Logger();
  }
  
  async find(table: string, columns: string[] = ['*']): Promise<any[]> {
    try {
      this.logger.log('INFO', `Finding records from ${table}`);
      
      if (!this.connection.isConnected()) {
        this.connection.connect();
      }
      
      const query = this.queryBuilder.buildSelect(table, columns);
      const results = this.queryExecutor.execute(query);
      
      this.logger.log('INFO', `Found ${results.length} records`);
      return results;
    } catch (error) {
      this.logger.log('ERROR', `Error finding records: ${error}`);
      throw error;
    }
  }
  
  async create(table: string, data: Record<string, any>): Promise<void> {
    try {
      this.logger.log('INFO', `Creating record in ${table}`);
      
      if (!this.connection.isConnected()) {
        this.connection.connect();
      }
      
      this.transactionManager.begin();
      
      const query = this.queryBuilder.buildInsert(table, data);
      this.queryExecutor.execute(query);
      
      this.transactionManager.commit();
      this.logger.log('INFO', 'Record created successfully');
    } catch (error) {
      this.transactionManager.rollback();
      this.logger.log('ERROR', `Error creating record: ${error}`);
      throw error;
    }
  }
  
  async update(
    table: string,
    data: Record<string, any>,
    where: string
  ): Promise<void> {
    try {
      this.logger.log('INFO', `Updating records in ${table}`);
      
      if (!this.connection.isConnected()) {
        this.connection.connect();
      }
      
      this.transactionManager.begin();
      
      const query = this.queryBuilder.buildUpdate(table, data, where);
      this.queryExecutor.execute(query);
      
      this.transactionManager.commit();
      this.logger.log('INFO', 'Records updated successfully');
    } catch (error) {
      this.transactionManager.rollback();
      this.logger.log('ERROR', `Error updating records: ${error}`);
      throw error;
    }
  }
  
  async delete(table: string, where: string): Promise<void> {
    try {
      this.logger.log('INFO', `Deleting records from ${table}`);
      
      if (!this.connection.isConnected()) {
        this.connection.connect();
      }
      
      this.transactionManager.begin();
      
      const query = this.queryBuilder.buildDelete(table, where);
      this.queryExecutor.execute(query);
      
      this.transactionManager.commit();
      this.logger.log('INFO', 'Records deleted successfully');
    } catch (error) {
      this.transactionManager.rollback();
      this.logger.log('ERROR', `Error deleting records: ${error}`);
      throw error;
    }
  }
  
  disconnect(): void {
    this.connection.disconnect();
    this.logger.log('INFO', 'Database disconnected');
  }
}

// Usage
const db = new DatabaseFacade();

// Simple interface instead of:
// const connection = new DatabaseConnection();
// connection.connect();
// const queryBuilder = new QueryBuilder();
// const query = queryBuilder.buildSelect('users', ['id', 'name']);
// const executor = new QueryExecutor();
// const results = executor.execute(query);
// connection.disconnect();

(async () => {
  const users = await db.find('users', ['id', 'name', 'email']);
  console.log('Users:', users);
  
  await db.create('users', {
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 30
  });
  
  await db.update('users', { age: 31 }, 'email = "jane@example.com"');
  
  await db.delete('users', 'id = 1');
  
  db.disconnect();
})();
```

### Example 4: Payment Processing Facade

```typescript
// Subsystem Classes
class PaymentValidator {
  validateAmount(amount: number): boolean {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (amount > 10000) {
      throw new Error('Amount exceeds maximum limit');
    }
    console.log(`PaymentValidator: Amount ${amount} is valid`);
    return true;
  }
  
  validateCard(cardNumber: string): boolean {
    if (!/^\d{16}$/.test(cardNumber)) {
      throw new Error('Invalid card number format');
    }
    console.log('PaymentValidator: Card number is valid');
    return true;
  }
}

class FraudChecker {
  checkFraud(cardNumber: string, amount: number): boolean {
    console.log(`FraudChecker: Checking fraud for card ending in ${cardNumber.slice(-4)}`);
    // Simulated fraud check
    const isFraudulent = false;
    if (isFraudulent) {
      throw new Error('Transaction flagged as fraudulent');
    }
    console.log('FraudChecker: No fraud detected');
    return true;
  }
}

class PaymentGateway {
  processPayment(cardNumber: string, amount: number, cvv: string): string {
    console.log(`PaymentGateway: Processing payment of $${amount}`);
    // Simulated payment processing
    const transactionId = `TXN-${Date.now()}`;
    console.log(`PaymentGateway: Payment processed. Transaction ID: ${transactionId}`);
    return transactionId;
  }
}

class ReceiptGenerator {
  generate(transactionId: string, amount: number): string {
    const receipt = `
      ====================
      PAYMENT RECEIPT
      ====================
      Transaction ID: ${transactionId}
      Amount: $${amount}
      Date: ${new Date().toISOString()}
      ====================
    `;
    console.log('ReceiptGenerator: Receipt generated');
    return receipt;
  }
}

class NotificationService {
  sendEmail(email: string, receipt: string): void {
    console.log(`NotificationService: Sending receipt email to ${email}`);
  }
  
  sendSMS(phone: string, message: string): void {
    console.log(`NotificationService: Sending SMS to ${phone}`);
  }
}

class AuditLogger {
  log(transactionId: string, amount: number, status: string): void {
    console.log(`AuditLogger: [${status}] Transaction ${transactionId} - $${amount}`);
  }
}

// Facade
class PaymentFacade {
  private validator: PaymentValidator;
  private fraudChecker: FraudChecker;
  private gateway: PaymentGateway;
  private receiptGenerator: ReceiptGenerator;
  private notificationService: NotificationService;
  private auditLogger: AuditLogger;
  
  constructor() {
    this.validator = new PaymentValidator();
    this.fraudChecker = new FraudChecker();
    this.gateway = new PaymentGateway();
    this.receiptGenerator = new ReceiptGenerator();
    this.notificationService = new NotificationService();
    this.auditLogger = new AuditLogger();
  }
  
  processPayment(
    cardNumber: string,
    amount: number,
    cvv: string,
    email?: string,
    phone?: string
  ): string {
    try {
      console.log('\n=== Processing Payment ===');
      
      // Step 1: Validate
      this.validator.validateAmount(amount);
      this.validator.validateCard(cardNumber);
      
      // Step 2: Fraud check
      this.fraudChecker.checkFraud(cardNumber, amount);
      
      // Step 3: Process payment
      const transactionId = this.gateway.processPayment(cardNumber, amount, cvv);
      
      // Step 4: Generate receipt
      const receipt = this.receiptGenerator.generate(transactionId, amount);
      
      // Step 5: Send notifications
      if (email) {
        this.notificationService.sendEmail(email, receipt);
      }
      if (phone) {
        this.notificationService.sendSMS(phone, `Payment of $${amount} processed. Transaction ID: ${transactionId}`);
      }
      
      // Step 6: Audit log
      this.auditLogger.log(transactionId, amount, 'SUCCESS');
      
      console.log('=== Payment Processed Successfully ===\n');
      return transactionId;
    } catch (error) {
      this.auditLogger.log('N/A', amount, 'FAILED');
      console.error(`Payment failed: ${error}`);
      throw error;
    }
  }
}

// Usage
const paymentFacade = new PaymentFacade();

// Simple interface instead of manually:
// const validator = new PaymentValidator();
// validator.validateAmount(100);
// validator.validateCard('1234567890123456');
// const fraudChecker = new FraudChecker();
// fraudChecker.checkFraud('1234567890123456', 100);
// const gateway = new PaymentGateway();
// const transactionId = gateway.processPayment('1234567890123456', 100, '123');
// const receiptGenerator = new ReceiptGenerator();
// const receipt = receiptGenerator.generate(transactionId, 100);
// const notificationService = new NotificationService();
// notificationService.sendEmail('user@example.com', receipt);
// const auditLogger = new AuditLogger();
// auditLogger.log(transactionId, 100, 'SUCCESS');

try {
  const transactionId = paymentFacade.processPayment(
    '1234567890123456',
    100.00,
    '123',
    'user@example.com',
    '+1234567890'
  );
  console.log(`Transaction completed: ${transactionId}`);
} catch (error) {
  console.error('Payment processing failed:', error);
}
```

### Example 5: File System Facade

```typescript
// Subsystem Classes
class FileReader {
  read(filePath: string): string {
    console.log(`FileReader: Reading file ${filePath}`);
    return 'file content';
  }
  
  exists(filePath: string): boolean {
    console.log(`FileReader: Checking if ${filePath} exists`);
    return true; // Simplified
  }
}

class FileWriter {
  write(filePath: string, content: string): void {
    console.log(`FileWriter: Writing to ${filePath}`);
  }
  
  append(filePath: string, content: string): void {
    console.log(`FileWriter: Appending to ${filePath}`);
  }
}

class PathResolver {
  resolve(...paths: string[]): string {
    const resolved = paths.join('/');
    console.log(`PathResolver: Resolved path: ${resolved}`);
    return resolved;
  }
  
  getExtension(filePath: string): string {
    const ext = filePath.split('.').pop() || '';
    console.log(`PathResolver: Extension: ${ext}`);
    return ext;
  }
  
  getBasename(filePath: string): string {
    const basename = filePath.split('/').pop() || filePath;
    console.log(`PathResolver: Basename: ${basename}`);
    return basename;
  }
}

class FilePermissions {
  checkRead(filePath: string): boolean {
    console.log(`FilePermissions: Checking read permission for ${filePath}`);
    return true;
  }
  
  checkWrite(filePath: string): boolean {
    console.log(`FilePermissions: Checking write permission for ${filePath}`);
    return true;
  }
}

class FileCache {
  private cache: Map<string, string> = new Map();
  
  get(filePath: string): string | null {
    if (this.cache.has(filePath)) {
      console.log(`FileCache: Cache hit for ${filePath}`);
      return this.cache.get(filePath)!;
    }
    console.log(`FileCache: Cache miss for ${filePath}`);
    return null;
  }
  
  set(filePath: string, content: string): void {
    this.cache.set(filePath, content);
    console.log(`FileCache: Cached ${filePath}`);
  }
  
  clear(): void {
    this.cache.clear();
    console.log('FileCache: Cache cleared');
  }
}

// Facade
class FileSystemFacade {
  private reader: FileReader;
  private writer: FileWriter;
  private pathResolver: PathResolver;
  private permissions: FilePermissions;
  private cache: FileCache;
  
  constructor() {
    this.reader = new FileReader();
    this.writer = new FileWriter();
    this.pathResolver = new PathResolver();
    this.permissions = new FilePermissions();
    this.cache = new FileCache();
  }
  
  readFile(filePath: string, useCache: boolean = true): string {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(filePath);
      if (cached) {
        return cached;
      }
    }
    
    // Check permissions
    if (!this.permissions.checkRead(filePath)) {
      throw new Error(`No read permission for ${filePath}`);
    }
    
    // Check if file exists
    if (!this.reader.exists(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read file
    const content = this.reader.read(filePath);
    
    // Cache the content
    if (useCache) {
      this.cache.set(filePath, content);
    }
    
    return content;
  }
  
  writeFile(filePath: string, content: string, append: boolean = false): void {
    // Check permissions
    if (!this.permissions.checkWrite(filePath)) {
      throw new Error(`No write permission for ${filePath}`);
    }
    
    // Write file
    if (append) {
      this.writer.append(filePath, content);
    } else {
      this.writer.write(filePath, content);
    }
    
    // Update cache
    this.cache.set(filePath, content);
  }
  
  getFileInfo(filePath: string): {
    basename: string;
    extension: string;
    fullPath: string;
  } {
    return {
      basename: this.pathResolver.getBasename(filePath),
      extension: this.pathResolver.getExtension(filePath),
      fullPath: this.pathResolver.resolve(filePath)
    };
  }
  
  copyFile(source: string, destination: string): void {
    console.log(`\n=== Copying file from ${source} to ${destination} ===`);
    const content = this.readFile(source);
    this.writeFile(destination, content);
    console.log('=== File copied successfully ===\n');
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}

// Usage
const fs = new FileSystemFacade();

// Simple interface instead of:
// const reader = new FileReader();
// const permissions = new FilePermissions();
// if (permissions.checkRead('file.txt')) {
//   if (reader.exists('file.txt')) {
//     const content = reader.read('file.txt');
//     const cache = new FileCache();
//     cache.set('file.txt', content);
//   }
// }

try {
  const content = fs.readFile('documents/readme.txt');
  console.log('Content:', content);
  
  fs.writeFile('documents/output.txt', 'New content');
  
  const info = fs.getFileInfo('documents/readme.txt');
  console.log('File info:', info);
  
  fs.copyFile('documents/source.txt', 'documents/destination.txt');
} catch (error) {
  console.error('File operation failed:', error);
}
```

---

## 🔄 Facade vs Other Patterns

### Facade vs Adapter

| Aspect | Facade | Adapter |
|--------|--------|---------|
| **Purpose** | Simplify interface to a subsystem | Convert interface of one class to another |
| **Direction** | One-way: Facade → Subsystem | Two-way: Adapts incompatible interfaces |
| **Complexity** | Hides complexity | Bridges incompatibility |
| **Subsystem** | Works with multiple classes | Works with one or few classes |
| **Intent** | Make subsystem easier to use | Make incompatible interfaces work together |

**Example:**
- **Facade**: `HomeTheaterFacade` simplifies using TV, amplifier, DVD player together
- **Adapter**: `MediaAdapter` adapts `AdvancedMediaPlayer` interface to work with `MediaPlayer` interface

### Facade vs Mediator

| Aspect | Facade | Mediator |
|--------|--------|----------|
| **Purpose** | Simplify subsystem interface | Centralize communication between objects |
| **Relationships** | One-way: Client → Facade → Subsystem | Bidirectional: Objects communicate through Mediator |
| **Coupling** | Reduces coupling between client and subsystem | Reduces coupling between colleague objects |
| **Focus** | Interface simplification | Communication coordination |

**Example:**
- **Facade**: `DatabaseFacade` provides simple methods for database operations
- **Mediator**: `ChatMediator` coordinates messages between multiple `User` objects

### Facade vs Proxy

| Aspect | Facade | Proxy |
|--------|--------|-------|
| **Purpose** | Simplify subsystem interface | Control access to an object |
| **Object** | Works with multiple objects | Works with one object |
| **Access** | Provides simplified access | Provides controlled/restricted access |
| **Functionality** | Adds convenience methods | Adds access control, lazy loading, etc. |

**Example:**
- **Facade**: `PaymentFacade` simplifies payment processing steps
- **Proxy**: `ImageProxy` controls access to expensive image loading

---

## 🎨 Real-World Applications

### 1. JavaScript/TypeScript Libraries

**jQuery as Facade:**
```javascript
// jQuery provides a facade over DOM manipulation
// Instead of:
document.getElementById('myElement').addEventListener('click', handler);
document.getElementById('myElement').style.display = 'none';

// jQuery provides:
$('#myElement').click(handler).hide();
```

**Axios as Facade:**
```javascript
// Axios provides a facade over XMLHttpRequest/Fetch
// Instead of:
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = () => { /* handle response */ };
xhr.send();

// Axios provides:
axios.get('/api/users');
```

### 2. Framework APIs

**Express.js Middleware:**
```javascript
// Express provides a facade for HTTP server operations
app.use(express.json()); // Handles body parsing, content-type, etc.
app.use(express.static('public')); // Handles file serving, MIME types, etc.
```

**React Component Lifecycle:**
```javascript
// React provides a facade over DOM manipulation
// Instead of manually:
// - Creating elements
// - Managing state
// - Handling events
// - Updating DOM

// React provides:
function Component() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState(state + 1)}>{state}</button>;
}
```

### 3. Operating System APIs

**File System Operations:**
- Operating systems provide facades over low-level disk operations
- `fs.readFile()` in Node.js hides file opening, reading, closing

**Network APIs:**
- HTTP libraries provide facades over socket programming
- `fetch()` API simplifies XMLHttpRequest complexity

### 4. Database ORMs

**Sequelize/TypeORM:**
```typescript
// ORM provides a facade over SQL operations
// Instead of:
const query = 'SELECT * FROM users WHERE age > ?';
db.query(query, [18], (err, results) => { /* ... */ });

// ORM provides:
User.findAll({ where: { age: { [Op.gt]: 18 } } });
```

### 5. Cloud Service SDKs

**AWS SDK:**
```javascript
// AWS SDK provides facades over REST APIs
// Instead of manually:
// - Building requests
// - Handling authentication
// - Managing retries
// - Parsing responses

// AWS SDK provides:
s3.putObject({ Bucket: 'my-bucket', Key: 'file.txt', Body: content });
```

---

## ⚠️ Common Pitfalls and Best Practices

### Pitfalls

❌ **Creating a "God Facade"**
- Problem: Making the Facade too large, handling too many responsibilities
- Solution: Create multiple focused facades for different subsystems

```javascript
// ❌ Bad: One facade doing everything
class EverythingFacade {
  // Database operations
  // File operations
  // Network operations
  // Payment processing
  // Email sending
  // ... too much!
}

// ✅ Good: Separate facades
class DatabaseFacade { /* ... */ }
class FileSystemFacade { /* ... */ }
class PaymentFacade { /* ... */ }
```

❌ **Hiding Too Much**
- Problem: Facade prevents access to subsystem when needed
- Solution: Allow direct access to subsystem classes when necessary

```javascript
// ❌ Bad: No way to access subsystem
class Facade {
  constructor() {
    this.subsystem = new Subsystem();
    // No way to access this.subsystem from outside
  }
}

// ✅ Good: Expose subsystem if needed
class Facade {
  constructor() {
    this.subsystem = new Subsystem();
  }
  
  // Provide access for advanced users
  getSubsystem() {
    return this.subsystem;
  }
}
```

❌ **Facade Becoming a God Object**
- Problem: Facade accumulates too many methods
- Solution: Split into multiple facades or use composition

```javascript
// ❌ Bad: One facade with too many methods
class DatabaseFacade {
  find() { /* ... */ }
  create() { /* ... */ }
  update() { /* ... */ }
  delete() { /* ... */ }
  transaction() { /* ... */ }
  migration() { /* ... */ }
  backup() { /* ... */ }
  restore() { /* ... */ }
  // ... 50 more methods
}

// ✅ Good: Split responsibilities
class DatabaseFacade {
  constructor() {
    this.query = new QueryFacade();
    this.transaction = new TransactionFacade();
    this.migration = new MigrationFacade();
  }
}
```

❌ **Tight Coupling to Subsystem**
- Problem: Facade tightly coupled to specific subsystem implementation
- Solution: Use interfaces/abstractions

```typescript
// ❌ Bad: Tightly coupled
class Facade {
  private db = new MySQLDatabase(); // Can't change database
}

// ✅ Good: Use abstraction
interface Database {
  query(sql: string): any[];
}

class Facade {
  constructor(private db: Database) {} // Can use any database
}
```

### Best Practices

✅ **Single Responsibility**
- Each facade should have one clear purpose
- Focus on one subsystem or one use case

✅ **Keep It Simple**
- Facade should make things simpler, not more complex
- If facade is complex, the subsystem might need refactoring

✅ **Document Well**
- Clearly document what the facade does
- Explain what subsystem operations it performs

✅ **Allow Direct Access**
- Don't prevent advanced users from accessing subsystem directly
- Facade is a convenience, not a restriction

✅ **Use Dependency Injection**
- Inject subsystem dependencies for testability
- Makes it easier to mock in tests

```typescript
// ✅ Good: Dependency injection
class PaymentFacade {
  constructor(
    private validator: PaymentValidator,
    private gateway: PaymentGateway,
    private logger: Logger
  ) {}
}

// Easy to test
const mockValidator = new MockPaymentValidator();
const mockGateway = new MockPaymentGateway();
const mockLogger = new MockLogger();
const facade = new PaymentFacade(mockValidator, mockGateway, mockLogger);
```

✅ **Layer Facades**
- Create facades at different levels of abstraction
- Higher-level facades can use lower-level facades

```typescript
// Lower-level facade
class DatabaseFacade {
  query(sql: string): any[] { /* ... */ }
}

// Higher-level facade
class UserServiceFacade {
  constructor(private db: DatabaseFacade) {}
  
  getUser(id: number): User {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`)[0];
  }
}
```

---

## 🧪 Testing Facades

### Unit Testing

```typescript
// Mock subsystem classes
class MockPaymentValidator {
  validateAmount = jest.fn();
  validateCard = jest.fn();
}

class MockPaymentGateway {
  processPayment = jest.fn();
}

class MockLogger {
  log = jest.fn();
}

describe('PaymentFacade', () => {
  let facade: PaymentFacade;
  let mockValidator: MockPaymentValidator;
  let mockGateway: MockPaymentGateway;
  let mockLogger: MockLogger;
  
  beforeEach(() => {
    mockValidator = new MockPaymentValidator();
    mockGateway = new MockPaymentGateway();
    mockLogger = new MockLogger();
    
    facade = new PaymentFacade(
      mockValidator,
      mockGateway,
      mockLogger
    );
  });
  
  it('should process payment successfully', () => {
    mockValidator.validateAmount.mockReturnValue(true);
    mockValidator.validateCard.mockReturnValue(true);
    mockGateway.processPayment.mockReturnValue('TXN-123');
    
    const result = facade.processPayment('1234567890123456', 100, '123');
    
    expect(result).toBe('TXN-123');
    expect(mockValidator.validateAmount).toHaveBeenCalledWith(100);
    expect(mockValidator.validateCard).toHaveBeenCalledWith('1234567890123456');
    expect(mockGateway.processPayment).toHaveBeenCalled();
  });
  
  it('should throw error if validation fails', () => {
    mockValidator.validateAmount.mockImplementation(() => {
      throw new Error('Invalid amount');
    });
    
    expect(() => {
      facade.processPayment('1234567890123456', -100, '123');
    }).toThrow('Invalid amount');
  });
});
```

### Integration Testing

```typescript
describe('PaymentFacade Integration', () => {
  it('should process real payment end-to-end', async () => {
    const facade = new PaymentFacade(
      new PaymentValidator(),
      new PaymentGateway(),
      new Logger()
    );
    
    const transactionId = facade.processPayment(
      '1234567890123456',
      100,
      '123'
    );
    
    expect(transactionId).toBeDefined();
    expect(transactionId).toMatch(/^TXN-/);
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Simplifies Complex Subsystems**
- Provides a single, easy-to-use interface
- Reduces learning curve for clients

✅ **Decouples Clients from Subsystem**
- Clients don't need to know subsystem internals
- Changes to subsystem don't affect clients (if facade interface stays same)

✅ **Promotes Layered Architecture**
- Creates clear boundaries between layers
- Makes system easier to understand

✅ **Reduces Dependencies**
- Clients depend on facade, not multiple subsystem classes
- Easier to maintain and test

✅ **Provides Convenience Methods**
- Combines common operations into single methods
- Reduces boilerplate code

### Disadvantages

❌ **Can Become a God Object**
- If not careful, facade can grow too large
- Violates Single Responsibility Principle

❌ **Hides Important Details**
- May hide functionality that advanced users need
- Can make debugging more difficult

❌ **Adds Another Layer**
- Extra indirection can impact performance
- More code to maintain

❌ **Can Become Tightly Coupled**
- If facade is too specific to implementation
- Hard to change subsystem without changing facade

---

## 🔗 Related Patterns

### Facade and Adapter
- **Facade** simplifies a subsystem's interface
- **Adapter** makes incompatible interfaces compatible
- Can be used together: Facade can use Adapters internally

### Facade and Mediator
- **Facade** simplifies interface to subsystem
- **Mediator** coordinates communication between objects
- Facade is unidirectional (client → facade → subsystem)
- Mediator is bidirectional (objects ↔ mediator ↔ objects)

### Facade and Proxy
- **Facade** provides simplified interface
- **Proxy** provides controlled access
- Both add a layer, but for different purposes

### Facade and Abstract Factory
- **Facade** simplifies subsystem usage
- **Abstract Factory** creates families of objects
- Facade can use Abstract Factory to create subsystem objects

---

## 🎓 Summary

### Key Takeaways

1. **Purpose**: Facade provides a simplified interface to a complex subsystem
2. **Structure**: Facade delegates client requests to appropriate subsystem objects
3. **Use When**: You want to simplify a complex subsystem or decouple clients from subsystem
4. **Benefits**: Simplicity, decoupling, easier maintenance
5. **Watch Out**: Don't create god objects, allow direct access when needed

### When to Choose Facade

Choose Facade when:
- ✅ You have a complex subsystem with many interdependent classes
- ✅ You want to provide a simple, unified interface
- ✅ You want to decouple clients from subsystem implementation
- ✅ You want to layer your architecture

Avoid Facade when:
- ❌ The subsystem is already simple
- ❌ You need fine-grained control over subsystem
- ❌ Performance is critical and you need direct access
- ❌ You need to expose all subsystem functionality

### Next Steps

- Practice implementing Facade in your projects
- Identify complex subsystems that could benefit from Facade
- Compare Facade with Adapter, Mediator, and Proxy patterns
- Explore real-world examples in popular libraries and frameworks

---

## 📚 Additional Resources

### Design Patterns References
- **Gang of Four (GoF)**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Head First Design Patterns**: Chapter on Facade Pattern

### Real-World Examples
- jQuery: DOM manipulation facade
- Axios/Fetch: HTTP request facade
- ORMs: Database operation facades
- Framework APIs: React, Vue, Angular component APIs

### Practice Exercises

1. **Create a Media Player Facade**
   - Subsystem: Audio decoder, video decoder, subtitle renderer, playlist manager
   - Facade: Simple `play()`, `pause()`, `stop()` methods

2. **Create an E-commerce Facade**
   - Subsystem: Inventory, pricing, shipping, payment, notification
   - Facade: Simple `purchase()` method

3. **Create a Logging Facade**
   - Subsystem: File writer, console writer, remote logger, formatter
   - Facade: Simple `log()`, `error()`, `warn()` methods

---

**Happy Learning! 🚀**
