# Interpreter Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Interpreter pattern definition and intent
- [ ] Learn when to use Interpreter vs other behavioral patterns
- [ ] Master the AbstractExpression-TerminalExpression-NonTerminalExpression relationship
- [ ] Recognize real-world applications (query languages, rule engines, DSLs, parsers)
- [ ] Understand Interpreter vs Visitor pattern differences
- [ ] Practice implementing Interpreter in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (AST traversal, expression trees, rule engines)
- [ ] Understand when to avoid Interpreter and use alternatives

---

## 🎯 Definition

**Interpreter Pattern** is a behavioral design pattern that defines a representation for a grammar along with an interpreter that uses the representation to interpret sentences in the language.

**Intent (GoF):**
- Define a representation for a grammar of a given language
- Define an interpreter that uses this representation to interpret sentences in the language
- Map a domain to a language, the language to a grammar, and the grammar to a hierarchical object-oriented design
- Also known as: **Expression Pattern**, **Grammar Pattern**

**Key Principle:**
> "Represent grammar as objects" - The interpreter pattern represents grammar rules as classes, where each rule becomes a class. Sentences in the language are represented as abstract syntax trees (AST), and the interpreter traverses these trees to evaluate expressions.

---

## 🏗️ Structure

### UML Diagram Concept

```
AbstractExpression
├── interpret(context: Context): any
└── (abstract method)

TerminalExpression extends AbstractExpression
├── data: any
└── interpret(context: Context): any
    └── return processed data

NonTerminalExpression extends AbstractExpression
├── expressions: AbstractExpression[]
├── add(expression: AbstractExpression): void
└── interpret(context: Context): any
    └── for each expression
        └── expression.interpret(context)

Context
├── variables: Map<string, any>
├── getVariable(name: string): any
└── setVariable(name: string, value: any): void

Client
├── buildAST(expression: string): AbstractExpression
└── interpret(ast: AbstractExpression, context: Context): any
```

### Participants

1. **AbstractExpression** - Declares an abstract `interpret` operation that is common to all nodes in the abstract syntax tree
2. **TerminalExpression** - Implements an `interpret` operation associated with terminal symbols in the grammar
3. **NonTerminalExpression** - Implements an `interpret` operation for non-terminal symbols in the grammar, typically contains other expressions
4. **Context** - Contains information that's global to the interpreter (variable values, etc.)
5. **Client** - Builds (or is given) an abstract syntax tree representing a particular sentence in the language, then invokes the interpret operation

### Key Concepts

**Grammar Representation:**
- Grammar rules map to classes
- Terminal symbols become terminal expressions
- Non-terminal symbols become non-terminal expressions
- Sentences become abstract syntax trees

**Abstract Syntax Tree (AST):**
- Hierarchical representation of expressions
- Terminal nodes are leaf nodes
- Non-terminal nodes contain child expressions
- Tree structure matches grammar structure

**Recursive Evaluation:**
- Expressions interpret themselves recursively
- Terminal expressions return values
- Non-terminal expressions combine child results
- Context provides shared state

**Separation of Concerns:**
- Grammar definition separate from interpretation
- Easy to add new grammar rules
- Easy to modify interpretation logic
- Clear structure for complex grammars

**Language Design:**
- Define domain-specific language (DSL)
- Map business rules to grammar
- Create readable expression syntax
- Enable flexible rule configuration

---

## 💡 When to Use

### Use Interpreter When:

✅ **You have a simple grammar to represent**
- Example: Mathematical expressions, query languages
- Example: Rule engines, configuration languages
- Example: Simple scripting languages
- Example: Template engines

✅ **You need to interpret sentences in a language**
- Example: SQL query parsing
- Example: Regular expression matching
- Example: Command parsing
- Example: Configuration file parsing

✅ **The grammar is stable and unlikely to change frequently**
- Example: Well-defined domain rules
- Example: Standard query syntax
- Example: Established DSLs
- Example: Stable business rules

✅ **Performance is not critical**
- Example: Configuration parsing
- Example: Rule evaluation (not high-frequency)
- Example: Query interpretation
- Example: Template processing

✅ **You want to represent grammar rules as classes**
- Example: Object-oriented grammar representation
- Example: Extensible rule system
- Example: Type-safe expression trees
- Example: Maintainable language implementation

### Don't Use When:

❌ **Grammar is complex** - Consider parser generators (ANTLR, Yacc)
❌ **Performance is critical** - Interpreter pattern can be slow
❌ **Grammar changes frequently** - Hard to maintain class hierarchy
❌ **You need efficient parsing** - Use dedicated parsers
❌ **Language is too large** - Interpreter becomes unwieldy

---

## 🔨 Implementation Examples

### Example 1: Basic Arithmetic Expression Interpreter

```typescript
// Context - Stores variables and state
class Context {
  private variables: Map<string, number> = new Map();

  setVariable(name: string, value: number): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): number {
    return this.variables.get(name) || 0;
  }
}

// Abstract Expression
abstract class Expression {
  abstract interpret(context: Context): number;
}

// Terminal Expression - Number
class NumberExpression extends Expression {
  private value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  interpret(context: Context): number {
    return this.value;
  }
}

// Terminal Expression - Variable
class VariableExpression extends Expression {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  interpret(context: Context): number {
    return context.getVariable(this.name);
  }
}

// Non-Terminal Expression - Addition
class AddExpression extends Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: Context): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

// Non-Terminal Expression - Subtraction
class SubtractExpression extends Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: Context): number {
    return this.left.interpret(context) - this.right.interpret(context);
  }
}

// Non-Terminal Expression - Multiplication
class MultiplyExpression extends Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: Context): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }
}

// Non-Terminal Expression - Division
class DivideExpression extends Expression {
  private left: Expression;
  private right: Expression;

  constructor(left: Expression, right: Expression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: Context): number {
    const rightValue = this.right.interpret(context);
    if (rightValue === 0) {
      throw new Error('Division by zero');
    }
    return this.left.interpret(context) / rightValue;
  }
}

// Simple Parser (for demonstration)
class ExpressionParser {
  static parse(expression: string): Expression {
    // Remove whitespace
    expression = expression.replace(/\s/g, '');
    
    // Simple recursive descent parser
    return this.parseExpression(expression);
  }

  private static parseExpression(expr: string): Expression {
    // Handle parentheses
    if (expr.startsWith('(') && expr.endsWith(')')) {
      return this.parseExpression(expr.slice(1, -1));
    }

    // Find operator with lowest precedence (rightmost)
    const operators = [
      { op: '+', class: AddExpression },
      { op: '-', class: SubtractExpression },
      { op: '*', class: MultiplyExpression },
      { op: '/', class: DivideExpression }
    ];

    let depth = 0;
    for (let i = expr.length - 1; i >= 0; i--) {
      if (expr[i] === ')') depth++;
      if (expr[i] === '(') depth--;
      
      if (depth === 0) {
        for (const { op, class: OpClass } of operators) {
          if (expr[i] === op) {
            const left = this.parseExpression(expr.slice(0, i));
            const right = this.parseExpression(expr.slice(i + 1));
            return new OpClass(left, right);
          }
        }
      }
    }

    // No operator found, must be number or variable
    if (/^\d+$/.test(expr)) {
      return new NumberExpression(parseInt(expr));
    }
    
    return new VariableExpression(expr);
  }
}

// Usage
const context = new Context();
context.setVariable('x', 10);
context.setVariable('y', 5);

console.log('=== Arithmetic Expression Interpreter ===\n');

// Expression: 10 + 5
const expr1 = new AddExpression(
  new NumberExpression(10),
  new NumberExpression(5)
);
console.log(`10 + 5 = ${expr1.interpret(context)}`);

// Expression: x * y
const expr2 = new MultiplyExpression(
  new VariableExpression('x'),
  new VariableExpression('y')
);
console.log(`x * y = ${expr2.interpret(context)}`);

// Expression: (x + y) * 2
const expr3 = new MultiplyExpression(
  new AddExpression(
    new VariableExpression('x'),
    new VariableExpression('y')
  ),
  new NumberExpression(2)
);
console.log(`(x + y) * 2 = ${expr3.interpret(context)}`);

// Using parser
const expr4 = ExpressionParser.parse('(x + y) * 2');
console.log(`Parsed: (x + y) * 2 = ${expr4.interpret(context)}`);
```

### Example 2: Boolean Expression Interpreter

```typescript
// Context for boolean expressions
class BooleanContext {
  private variables: Map<string, boolean> = new Map();

  setVariable(name: string, value: boolean): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): boolean {
    return this.variables.get(name) || false;
  }
}

// Abstract Expression
abstract class BooleanExpression {
  abstract interpret(context: BooleanContext): boolean;
}

// Terminal Expression - Boolean Literal
class BooleanLiteral extends BooleanExpression {
  private value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }

  interpret(context: BooleanContext): boolean {
    return this.value;
  }
}

// Terminal Expression - Variable
class BooleanVariable extends BooleanExpression {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  interpret(context: BooleanContext): boolean {
    return context.getVariable(this.name);
  }
}

// Non-Terminal Expression - AND
class AndExpression extends BooleanExpression {
  private left: BooleanExpression;
  private right: BooleanExpression;

  constructor(left: BooleanExpression, right: BooleanExpression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: BooleanContext): boolean {
    return this.left.interpret(context) && this.right.interpret(context);
  }
}

// Non-Terminal Expression - OR
class OrExpression extends BooleanExpression {
  private left: BooleanExpression;
  private right: BooleanExpression;

  constructor(left: BooleanExpression, right: BooleanExpression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: BooleanContext): boolean {
    return this.left.interpret(context) || this.right.interpret(context);
  }
}

// Non-Terminal Expression - NOT
class NotExpression extends BooleanExpression {
  private expression: BooleanExpression;

  constructor(expression: BooleanExpression) {
    super();
    this.expression = expression;
  }

  interpret(context: BooleanContext): boolean {
    return !this.expression.interpret(context);
  }
}

// Usage
const context = new BooleanContext();
context.setVariable('isLoggedIn', true);
context.setVariable('hasPermission', false);
context.setVariable('isAdmin', true);

console.log('=== Boolean Expression Interpreter ===\n');

// Expression: isLoggedIn AND hasPermission
const expr1 = new AndExpression(
  new BooleanVariable('isLoggedIn'),
  new BooleanVariable('hasPermission')
);
console.log(`isLoggedIn AND hasPermission: ${expr1.interpret(context)}`);

// Expression: isLoggedIn OR isAdmin
const expr2 = new OrExpression(
  new BooleanVariable('isLoggedIn'),
  new BooleanVariable('isAdmin')
);
console.log(`isLoggedIn OR isAdmin: ${expr2.interpret(context)}`);

// Expression: NOT hasPermission
const expr3 = new NotExpression(
  new BooleanVariable('hasPermission')
);
console.log(`NOT hasPermission: ${expr3.interpret(context)}`);

// Complex: (isLoggedIn AND hasPermission) OR isAdmin
const expr4 = new OrExpression(
  new AndExpression(
    new BooleanVariable('isLoggedIn'),
    new BooleanVariable('hasPermission')
  ),
  new BooleanVariable('isAdmin')
);
console.log(`(isLoggedIn AND hasPermission) OR isAdmin: ${expr4.interpret(context)}`);
```

### Example 3: SQL-Like Query Interpreter

```typescript
// Context for query execution
class QueryContext {
  private data: any[] = [];
  private currentRow: any = null;

  setData(data: any[]): void {
    this.data = data;
  }

  getData(): any[] {
    return this.data;
  }

  setCurrentRow(row: any): void {
    this.currentRow = row;
  }

  getCurrentRow(): any {
    return this.currentRow;
  }
}

// Abstract Expression
abstract class QueryExpression {
  abstract interpret(context: QueryContext): any[];
}

// Terminal Expression - All Rows
class AllRowsExpression extends QueryExpression {
  interpret(context: QueryContext): any[] {
    return context.getData();
  }
}

// Terminal Expression - Column Selector
class ColumnExpression extends QueryExpression {
  private columnName: string;

  constructor(columnName: string) {
    super();
    this.columnName = columnName;
  }

  interpret(context: QueryContext): any[] {
    const rows = context.getData();
    return rows.map(row => row[this.columnName]);
  }
}

// Non-Terminal Expression - WHERE Clause
class WhereExpression extends QueryExpression {
  private source: QueryExpression;
  private condition: ConditionExpression;

  constructor(source: QueryExpression, condition: ConditionExpression) {
    super();
    this.source = source;
    this.condition = condition;
  }

  interpret(context: QueryContext): any[] {
    const rows = this.source.interpret(context);
    return rows.filter(row => {
      context.setCurrentRow(row);
      return this.condition.interpret(context);
    });
  }
}

// Condition Expression
abstract class ConditionExpression {
  abstract interpret(context: QueryContext): boolean;
}

// Terminal Condition - Equals
class EqualsCondition extends ConditionExpression {
  private column: string;
  private value: any;

  constructor(column: string, value: any) {
    super();
    this.column = column;
    this.value = value;
  }

  interpret(context: QueryContext): boolean {
    const row = context.getCurrentRow();
    return row[this.column] === this.value;
  }
}

// Terminal Condition - Greater Than
class GreaterThanCondition extends ConditionExpression {
  private column: string;
  private value: number;

  constructor(column: string, value: number) {
    super();
    this.column = column;
    this.value = value;
  }

  interpret(context: QueryContext): boolean {
    const row = context.getCurrentRow();
    return row[this.column] > this.value;
  }
}

// Non-Terminal Condition - AND
class AndCondition extends ConditionExpression {
  private left: ConditionExpression;
  private right: ConditionExpression;

  constructor(left: ConditionExpression, right: ConditionExpression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: QueryContext): boolean {
    return this.left.interpret(context) && this.right.interpret(context);
  }
}

// Usage
const context = new QueryContext();
const data = [
  { id: 1, name: 'Alice', age: 30, salary: 50000 },
  { id: 2, name: 'Bob', age: 25, salary: 60000 },
  { id: 3, name: 'Charlie', age: 35, salary: 55000 },
  { id: 4, name: 'Diana', age: 28, salary: 70000 }
];
context.setData(data);

console.log('=== SQL-Like Query Interpreter ===\n');

// Query: SELECT name WHERE age > 25
const query1 = new ColumnExpression('name');
const where1 = new WhereExpression(
  new AllRowsExpression(),
  new GreaterThanCondition('age', 25)
);
const result1 = where1.interpret(context).map(row => row.name);
console.log('SELECT name WHERE age > 25:', result1);

// Query: SELECT * WHERE age > 25 AND salary > 55000
const where2 = new WhereExpression(
  new AllRowsExpression(),
  new AndCondition(
    new GreaterThanCondition('age', 25),
    new GreaterThanCondition('salary', 55000)
  )
);
const result2 = where2.interpret(context);
console.log('SELECT * WHERE age > 25 AND salary > 55000:', result2);

// Query: SELECT name WHERE id = 2
const where3 = new WhereExpression(
  new AllRowsExpression(),
  new EqualsCondition('id', 2)
);
const result3 = where3.interpret(context).map(row => row.name);
console.log('SELECT name WHERE id = 2:', result3);
```

### Example 4: Rule Engine Interpreter

```typescript
// Context for rule evaluation
class RuleContext {
  private facts: Map<string, any> = new Map();

  setFact(name: string, value: any): void {
    this.facts.set(name, value);
  }

  getFact(name: string): any {
    return this.facts.get(name);
  }

  hasFact(name: string): boolean {
    return this.facts.has(name);
  }
}

// Abstract Expression
abstract class RuleExpression {
  abstract interpret(context: RuleContext): boolean;
}

// Terminal Expression - Fact Check
class FactExpression extends RuleExpression {
  private factName: string;

  constructor(factName: string) {
    super();
    this.factName = factName;
  }

  interpret(context: RuleContext): boolean {
    return context.hasFact(this.factName) && context.getFact(this.factName) === true;
  }
}

// Terminal Expression - Comparison
class ComparisonExpression extends RuleExpression {
  private factName: string;
  private operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  private value: any;

  constructor(factName: string, operator: string, value: any) {
    super();
    this.factName = factName;
    this.operator = operator as any;
    this.value = value;
  }

  interpret(context: RuleContext): boolean {
    if (!context.hasFact(this.factName)) {
      return false;
    }

    const factValue = context.getFact(this.factName);

    switch (this.operator) {
      case '==': return factValue == this.value;
      case '!=': return factValue != this.value;
      case '>': return factValue > this.value;
      case '<': return factValue < this.value;
      case '>=': return factValue >= this.value;
      case '<=': return factValue <= this.value;
      default: return false;
    }
  }
}

// Non-Terminal Expression - AND Rule
class AndRule extends RuleExpression {
  private rules: RuleExpression[];

  constructor(...rules: RuleExpression[]) {
    super();
    this.rules = rules;
  }

  interpret(context: RuleContext): boolean {
    return this.rules.every(rule => rule.interpret(context));
  }
}

// Non-Terminal Expression - OR Rule
class OrRule extends RuleExpression {
  private rules: RuleExpression[];

  constructor(...rules: RuleExpression[]) {
    super();
    this.rules = rules;
  }

  interpret(context: RuleContext): boolean {
    return this.rules.some(rule => rule.interpret(context));
  }
}

// Non-Terminal Expression - NOT Rule
class NotRule extends RuleExpression {
  private rule: RuleExpression;

  constructor(rule: RuleExpression) {
    super();
    this.rule = rule;
  }

  interpret(context: RuleContext): boolean {
    return !this.rule.interpret(context);
  }
}

// Rule Action
class Rule {
  private condition: RuleExpression;
  private action: () => void;
  private name: string;

  constructor(name: string, condition: RuleExpression, action: () => void) {
    this.name = name;
    this.condition = condition;
    this.action = action;
  }

  evaluate(context: RuleContext): boolean {
    if (this.condition.interpret(context)) {
      console.log(`Rule "${this.name}" triggered`);
      this.action();
      return true;
    }
    return false;
  }
}

// Rule Engine
class RuleEngine {
  private rules: Rule[] = [];

  addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  evaluate(context: RuleContext): void {
    this.rules.forEach(rule => rule.evaluate(context));
  }
}

// Usage
const context = new RuleContext();
context.setFact('age', 25);
context.setFact('hasLicense', true);
context.setFact('creditScore', 750);
context.setFact('hasJob', true);

console.log('=== Rule Engine Interpreter ===\n');

// Rule: Can rent car if age >= 21 AND hasLicense
const canRentCarRule = new Rule(
  'Can Rent Car',
  new AndRule(
    new ComparisonExpression('age', '>=', 21),
    new FactExpression('hasLicense')
  ),
  () => console.log('  → Action: Allow car rental')
);

// Rule: Can get loan if creditScore >= 700 OR (hasJob AND age >= 18)
const canGetLoanRule = new Rule(
  'Can Get Loan',
  new OrRule(
    new ComparisonExpression('creditScore', '>=', 700),
    new AndRule(
      new FactExpression('hasJob'),
      new ComparisonExpression('age', '>=', 18)
    )
  ),
  () => console.log('  → Action: Approve loan application')
);

// Rule: Cannot rent if NOT hasLicense
const cannotRentRule = new Rule(
  'Cannot Rent',
  new NotRule(new FactExpression('hasLicense')),
  () => console.log('  → Action: Deny car rental')
);

const engine = new RuleEngine();
engine.addRule(canRentCarRule);
engine.addRule(canGetLoanRule);
engine.addRule(cannotRentRule);

console.log('Evaluating rules with context:');
console.log('  age: 25, hasLicense: true, creditScore: 750, hasJob: true\n');
engine.evaluate(context);
```

### Example 5: Template Engine Interpreter

```typescript
// Context for template rendering
class TemplateContext {
  private variables: Map<string, any> = new Map();

  setVariable(name: string, value: any): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): any {
    return this.variables.get(name);
  }

  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }
}

// Abstract Expression
abstract class TemplateExpression {
  abstract interpret(context: TemplateContext): string;
}

// Terminal Expression - Text Literal
class TextExpression extends TemplateExpression {
  private text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  interpret(context: TemplateContext): string {
    return this.text;
  }
}

// Terminal Expression - Variable
class VariableExpression extends TemplateExpression {
  private name: string;
  private defaultValue?: string;

  constructor(name: string, defaultValue?: string) {
    super();
    this.name = name;
    this.defaultValue = defaultValue;
  }

  interpret(context: TemplateContext): string {
    if (context.hasVariable(this.name)) {
      return String(context.getVariable(this.name));
    }
    return this.defaultValue || '';
  }
}

// Non-Terminal Expression - Conditional
class ConditionalExpression extends TemplateExpression {
  private condition: TemplateExpression;
  private trueBranch: TemplateExpression;
  private falseBranch?: TemplateExpression;

  constructor(
    condition: TemplateExpression,
    trueBranch: TemplateExpression,
    falseBranch?: TemplateExpression
  ) {
    super();
    this.condition = condition;
    this.trueBranch = trueBranch;
    this.falseBranch = falseBranch;
  }

  interpret(context: TemplateContext): string {
    const conditionValue = this.condition.interpret(context);
    if (conditionValue && conditionValue !== 'false' && conditionValue !== '0') {
      return this.trueBranch.interpret(context);
    }
    return this.falseBranch ? this.falseBranch.interpret(context) : '';
  }
}

// Non-Terminal Expression - Loop
class LoopExpression extends TemplateExpression {
  private variableName: string;
  private itemsExpression: TemplateExpression;
  private body: TemplateExpression;

  constructor(
    variableName: string,
    itemsExpression: TemplateExpression,
    body: TemplateExpression
  ) {
    super();
    this.variableName = variableName;
    this.itemsExpression = itemsExpression;
    this.body = body;
  }

  interpret(context: TemplateContext): string {
    const items = this.itemsExpression.interpret(context);
    // Simple parsing - assume comma-separated or array
    let itemsArray: any[];
    
    try {
      itemsArray = JSON.parse(items);
    } catch {
      itemsArray = items.split(',').map(s => s.trim());
    }

    return itemsArray.map(item => {
      const loopContext = new TemplateContext();
      // Copy parent context
      context.variables.forEach((value, key) => {
        loopContext.setVariable(key, value);
      });
      loopContext.setVariable(this.variableName, item);
      return this.body.interpret(loopContext);
    }).join('');
  }
}

// Non-Terminal Expression - Sequence
class SequenceExpression extends TemplateExpression {
  private expressions: TemplateExpression[];

  constructor(...expressions: TemplateExpression[]) {
    super();
    this.expressions = expressions;
  }

  interpret(context: TemplateContext): string {
    return this.expressions.map(expr => expr.interpret(context)).join('');
  }
}

// Simple Template Parser
class TemplateParser {
  static parse(template: string): TemplateExpression {
    const expressions: TemplateExpression[] = [];
    let i = 0;

    while (i < template.length) {
      if (template[i] === '{' && template[i + 1] === '{') {
        // Parse expression
        const endIndex = template.indexOf('}}', i);
        if (endIndex === -1) break;

        const exprStr = template.slice(i + 2, endIndex).trim();
        expressions.push(this.parseExpression(exprStr));
        i = endIndex + 2;
      } else {
        // Parse text
        const textEnd = template.indexOf('{{', i);
        const text = textEnd === -1 
          ? template.slice(i) 
          : template.slice(i, textEnd);
        if (text) {
          expressions.push(new TextExpression(text));
        }
        i = textEnd === -1 ? template.length : textEnd;
      }
    }

    return new SequenceExpression(...expressions);
  }

  private static parseExpression(expr: string): TemplateExpression {
    // Simple variable: {{ name }}
    if (!expr.includes(' ')) {
      return new VariableExpression(expr);
    }

    // Conditional: {{ if condition }}...{{ else }}...{{ endif }}
    // Loop: {{ for item in items }}...{{ endfor }}
    // For simplicity, return variable expression
    return new VariableExpression(expr);
  }
}

// Usage
const context = new TemplateContext();
context.setVariable('name', 'Alice');
context.setVariable('age', 30);
context.setVariable('items', JSON.stringify(['apple', 'banana', 'cherry']));

console.log('=== Template Engine Interpreter ===\n');

// Simple template
const template1 = new SequenceExpression(
  new TextExpression('Hello, '),
  new VariableExpression('name'),
  new TextExpression('! You are '),
  new VariableExpression('age'),
  new TextExpression(' years old.')
);
console.log('Template 1:', template1.interpret(context));

// Conditional template
const template2 = new SequenceExpression(
  new TextExpression('Hello, '),
  new VariableExpression('name'),
  new ConditionalExpression(
    new VariableExpression('age'),
    new TextExpression(' (adult)'),
    new TextExpression(' (minor)')
  )
);
context.setVariable('age', 17);
console.log('Template 2 (age=17):', template2.interpret(context));
context.setVariable('age', 25);
console.log('Template 2 (age=25):', template2.interpret(context));

// Loop template
const loopBody = new SequenceExpression(
  new TextExpression('  - '),
  new VariableExpression('item'),
  new TextExpression('\n')
);
const template3 = new SequenceExpression(
  new TextExpression('Items:\n'),
  new LoopExpression('item', new VariableExpression('items'), loopBody)
);
console.log('Template 3:');
console.log(template3.interpret(context));
```

### Example 6: Command Pattern Interpreter

```typescript
// Context for command execution
class CommandContext {
  private environment: Map<string, any> = new Map();
  private output: string[] = [];

  setEnv(key: string, value: any): void {
    this.environment.set(key, value);
  }

  getEnv(key: string): any {
    return this.environment.get(key);
  }

  appendOutput(text: string): void {
    this.output.push(text);
  }

  getOutput(): string {
    return this.output.join('\n');
  }

  clearOutput(): void {
    this.output = [];
  }
}

// Abstract Expression
abstract class CommandExpression {
  abstract interpret(context: CommandContext): void;
}

// Terminal Expression - Echo Command
class EchoCommand extends CommandExpression {
  private message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }

  interpret(context: CommandContext): void {
    context.appendOutput(this.message);
  }
}

// Terminal Expression - Set Command
class SetCommand extends CommandExpression {
  private variable: string;
  private value: string;

  constructor(variable: string, value: string) {
    super();
    this.variable = variable;
    this.value = value;
  }

  interpret(context: CommandContext): void {
    context.setEnv(this.variable, this.value);
  }
}

// Terminal Expression - Get Command
class GetCommand extends CommandExpression {
  private variable: string;

  constructor(variable: string) {
    super();
    this.variable = variable;
  }

  interpret(context: CommandContext): void {
    const value = context.getEnv(this.variable);
    context.appendOutput(value || '');
  }
}

// Non-Terminal Expression - Command Sequence
class CommandSequence extends CommandExpression {
  private commands: CommandExpression[];

  constructor(...commands: CommandExpression[]) {
    super();
    this.commands = commands;
  }

  interpret(context: CommandContext): void {
    this.commands.forEach(cmd => cmd.interpret(context));
  }
}

// Non-Terminal Expression - Pipe (output of one command to next)
class PipeCommand extends CommandExpression {
  private left: CommandExpression;
  private right: CommandExpression;

  constructor(left: CommandExpression, right: CommandExpression) {
    super();
    this.left = left;
    this.right = right;
  }

  interpret(context: CommandContext): void {
    // Execute left command
    this.left.interpret(context);
    // Right command would use left's output (simplified)
    this.right.interpret(context);
  }
}

// Usage
const context = new CommandContext();

console.log('=== Command Pattern Interpreter ===\n');

// Command: echo "Hello World"
const cmd1 = new EchoCommand('Hello World');
cmd1.interpret(context);
console.log('Output:', context.getOutput());
context.clearOutput();

// Command: set name "Alice" && echo "Hello, $name"
const cmd2 = new CommandSequence(
  new SetCommand('name', 'Alice'),
  new EchoCommand('Hello, Alice')
);
cmd2.interpret(context);
console.log('Output:', context.getOutput());
context.clearOutput();

// Command: set x 10 && set y 20 && echo "Sum: $x + $y"
const cmd3 = new CommandSequence(
  new SetCommand('x', '10'),
  new SetCommand('y', '20'),
  new EchoCommand('Sum: 10 + 20')
);
cmd3.interpret(context);
console.log('Output:', context.getOutput());
```

---

## 🔄 Pattern Variations

### Variation 1: Visitor-Based Interpreter

```typescript
// Use Visitor pattern to separate interpretation from AST structure
interface ExpressionVisitor {
  visitNumber(expr: NumberExpression): any;
  visitVariable(expr: VariableExpression): any;
  visitAdd(expr: AddExpression): any;
}

class Expression {
  abstract accept(visitor: ExpressionVisitor): any;
}

class EvaluatorVisitor implements ExpressionVisitor {
  private context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  visitNumber(expr: NumberExpression): number {
    return expr.getValue();
  }

  visitVariable(expr: VariableExpression): any {
    return this.context.getVariable(expr.getName());
  }

  visitAdd(expr: AddExpression): number {
    return expr.getLeft().accept(this) + expr.getRight().accept(this);
  }
}
```

### Variation 2: Flyweight for Terminal Expressions

```typescript
// Use Flyweight pattern for frequently used terminal expressions
class ExpressionFactory {
  private static numberCache: Map<number, NumberExpression> = new Map();
  private static variableCache: Map<string, VariableExpression> = new Map();

  static createNumber(value: number): NumberExpression {
    if (!this.numberCache.has(value)) {
      this.numberCache.set(value, new NumberExpression(value));
    }
    return this.numberCache.get(value)!;
  }

  static createVariable(name: string): VariableExpression {
    if (!this.variableCache.has(name)) {
      this.variableCache.set(name, new VariableExpression(name));
    }
    return this.variableCache.get(name)!;
  }
}
```

### Variation 3: Composite-Based Interpreter

```typescript
// Use Composite pattern more explicitly
interface ExpressionComponent {
  interpret(context: Context): any;
}

class CompositeExpression implements ExpressionComponent {
  private children: ExpressionComponent[] = [];

  add(component: ExpressionComponent): void {
    this.children.push(component);
  }

  interpret(context: Context): any {
    return this.children.map(child => child.interpret(context));
  }
}
```

---

## 🔀 Pattern Comparisons

### Interpreter vs Visitor

**Similarities:**
- Both traverse tree structures
- Both separate operations from structure
- Both use polymorphism

**Differences:**

| Aspect | Interpreter | Visitor |
|--------|-------------|---------|
| **Purpose** | Interpret language | Add operations to structure |
| **Structure** | Grammar-based AST | Object structure |
| **Operations** | Built into expressions | External visitor classes |
| **Extensibility** | Add new expressions | Add new operations |

**When to use Interpreter:**
- Need to interpret a language
- Grammar is well-defined
- Want grammar rules as classes

**When to use Visitor:**
- Need multiple operations on structure
- Structure is stable
- Operations change frequently

### Interpreter vs Strategy

**Similarities:**
- Both use polymorphism
- Both encapsulate algorithms

**Differences:**

| Aspect | Interpreter | Strategy |
|--------|-------------|----------|
| **Purpose** | Interpret language | Encapsulate algorithm |
| **Structure** | Tree of expressions | Single algorithm object |
| **Complexity** | Grammar-based | Algorithm-based |

### Interpreter vs Composite

**Similarities:**
- Both use tree structures
- Both use recursive composition

**Differences:**

| Aspect | Interpreter | Composite |
|--------|-------------|-----------|
| **Purpose** | Language interpretation | Object composition |
| **Operations** | Interpretation | Uniform interface |
| **Context** | Language context | No context needed |

---

## 🎯 Real-World Applications

### 1. Query Languages (SQL, GraphQL)

```typescript
// SQL query interpretation
class SQLInterpreter {
  interpret(query: string): QueryResult {
    const ast = this.parse(query);
    return ast.interpret(this.context);
  }
}
```

### 2. Regular Expressions

```typescript
// Regex pattern interpretation
class RegexInterpreter {
  interpret(pattern: string, text: string): boolean {
    const ast = this.parse(pattern);
    return ast.interpret({ text });
  }
}
```

### 3. Configuration Files

```typescript
// Config file interpretation
class ConfigInterpreter {
  interpret(config: string): Config {
    const ast = this.parse(config);
    return ast.interpret(this.context);
  }
}
```

### 4. Rule Engines

```typescript
// Business rule interpretation
class RuleInterpreter {
  interpret(rule: string): boolean {
    const ast = this.parse(rule);
    return ast.interpret(this.context);
  }
}
```

### 5. Template Engines

```typescript
// Template interpretation
class TemplateInterpreter {
  interpret(template: string, data: any): string {
    const ast = this.parse(template);
    return ast.interpret({ data });
  }
}
```

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

❌ **Overusing for Complex Grammars**
```typescript
// BAD: Using Interpreter for complex language
class ComplexLanguageInterpreter {
  // Too many classes, hard to maintain
}

// GOOD: Use parser generator (ANTLR, Yacc)
// Or use Interpreter only for simple DSLs
```

❌ **Poor Performance**
```typescript
// BAD: Recreating AST on every interpretation
class BadInterpreter {
  interpret(expression: string): any {
    const ast = this.parse(expression); // Parse every time
    return ast.interpret(this.context);
  }
}

// GOOD: Cache parsed ASTs
class GoodInterpreter {
  private astCache: Map<string, Expression> = new Map();
  
  interpret(expression: string): any {
    if (!this.astCache.has(expression)) {
      this.astCache.set(expression, this.parse(expression));
    }
    return this.astCache.get(expression)!.interpret(this.context);
  }
}
```

❌ **Not Handling Errors**
```typescript
// BAD: No error handling
class BadInterpreter {
  interpret(context: Context): number {
    return this.left.interpret(context) / this.right.interpret(context);
  }
}

// GOOD: Handle errors
class GoodInterpreter {
  interpret(context: Context): number {
    const right = this.right.interpret(context);
    if (right === 0) {
      throw new Error('Division by zero');
    }
    return this.left.interpret(context) / right;
  }
}
```

### Best Practices

✅ **Cache Parsed ASTs**
```typescript
class CachedInterpreter {
  private cache: Map<string, Expression> = new Map();
  // Cache parsed expressions
}
```

✅ **Use Parser Generators for Complex Grammars**
```typescript
// Use ANTLR, Yacc, or similar for complex languages
// Use Interpreter only for simple DSLs
```

✅ **Separate Parsing from Interpretation**
```typescript
class Parser {
  parse(expression: string): Expression { }
}

class Interpreter {
  interpret(ast: Expression, context: Context): any { }
}
```

✅ **Handle Errors Gracefully**
```typescript
class SafeInterpreter {
  interpret(context: Context): any {
    try {
      return this.expression.interpret(context);
    } catch (error) {
      // Handle gracefully
      return defaultValue;
    }
  }
}
```

✅ **Use Visitor for Multiple Operations**
```typescript
// If you need multiple operations (evaluate, optimize, serialize)
// Consider Visitor pattern instead of adding methods to expressions
```

---

## 🚀 Modern Variations and Extensions

### 1. Expression Trees (LINQ-style)

```typescript
// Expression tree representation
class ExpressionTree {
  private root: Expression;

  compile(): Function {
    // Compile to native code
    return this.generateCode(this.root);
  }

  private generateCode(expr: Expression): Function {
    // Generate optimized code
  }
}
```

### 2. Lazy Evaluation

```typescript
// Lazy expression evaluation
class LazyExpression extends Expression {
  private evaluator: () => any;

  constructor(evaluator: () => any) {
    super();
    this.evaluator = evaluator;
  }

  interpret(context: Context): any {
    return this.evaluator(); // Evaluate only when needed
  }
}
```

### 3. Memoization

```typescript
// Memoize interpretation results
class MemoizedExpression extends Expression {
  private cache: Map<string, any> = new Map();

  interpret(context: Context): any {
    const key = this.getCacheKey(context);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const result = this.evaluate(context);
    this.cache.set(key, result);
    return result;
  }
}
```

---

## 📚 Summary

### Key Takeaways

1. **Interpreter Pattern** represents grammar as classes and interprets sentences
2. **AST Structure** - Expressions form abstract syntax trees
3. **Recursive Evaluation** - Expressions interpret themselves recursively
4. **Context** - Provides shared state for interpretation
5. **Simple Grammars** - Best for simple, stable grammars

### When to Use

✅ Use when:
- Grammar is simple and stable
- Need to interpret sentences in a language
- Want grammar rules as classes
- Performance is not critical
- Building a DSL or rule engine

❌ Don't use when:
- Grammar is complex (use parser generators)
- Performance is critical
- Grammar changes frequently
- Language is too large

### Pattern Relationships

- **Similar to Composite**: Both use tree structures
- **Can use with**: Visitor (for multiple operations), Flyweight (for terminal expressions)
- **Alternative to**: Parser generators for simple cases

### Next Steps

After mastering Interpreter Pattern, consider:
- **Visitor Pattern** - For multiple operations on AST
- **Parser Generators** - For complex grammars (ANTLR, Yacc)
- **Expression Trees** - For compile-time optimization
- **Domain-Specific Languages** - Advanced interpreter usage

---

## 🔗 Related Patterns

- **Composite**: Composes objects into tree structures
- **Visitor**: Defines operations on object structure
- **Strategy**: Encapsulates algorithms
- **Flyweight**: Shares terminal expressions

---

## 📖 References

- **Gang of Four**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Refactoring Guru**: Interpreter Pattern
- **Source Making**: Interpreter Design Pattern





