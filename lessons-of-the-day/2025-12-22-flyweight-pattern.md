# Flyweight Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Flyweight pattern definition and intent
- [ ] Learn when to use Flyweight vs other structural patterns
- [ ] Master separating intrinsic and extrinsic state
- [ ] Recognize real-world applications
- [ ] Understand Flyweight Factory pattern
- [ ] Practice implementing Flyweight in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Flyweight Pattern** is a structural design pattern that lets you fit more objects into the available amount of RAM by sharing common parts of state between multiple objects instead of keeping all of the data in each object.

**Intent (GoF):**
- Use sharing to support large numbers of fine-grained objects efficiently
- Reduce memory usage by sharing intrinsic state
- Separate intrinsic (shared) state from extrinsic (context-specific) state
- Also known as: **Cache Pattern**

**Key Principle:**
> "Share what's common, store what's unique" - The flyweight pattern separates intrinsic state (shared, immutable) from extrinsic state (context-specific, passed in) to minimize memory usage when dealing with many similar objects.

---

## 🏗️ Structure

### UML Diagram Concept

```
Flyweight (Interface)
├── operation(extrinsicState: ExtrinsicState): void

ConcreteFlyweight implements Flyweight
├── intrinsicState: IntrinsicState (shared)
└── operation(extrinsicState: ExtrinsicState): void

UnsharedConcreteFlyweight implements Flyweight
├── allState: State (not shared)
└── operation(extrinsicState: ExtrinsicState): void

FlyweightFactory
├── flyweights: Map<Key, Flyweight>
├── getFlyweight(key: Key): Flyweight
└── getFlyweightCount(): number

Client
├── extrinsicState: ExtrinsicState
└── uses FlyweightFactory to get Flyweights
```

### Participants

1. **Flyweight** - Declares an interface through which flyweights can receive and act on extrinsic state
2. **ConcreteFlyweight** - Implements the Flyweight interface and stores intrinsic state (shared)
3. **UnsharedConcreteFlyweight** - Not all Flyweight subclasses need to be shared (optional)
4. **FlyweightFactory** - Creates and manages flyweight objects, ensures proper sharing
5. **Client** - Maintains references to flyweights and computes or stores extrinsic state

### Key Concepts

**Intrinsic State:**
- Stored in the Flyweight object
- Shared across multiple contexts
- Immutable (doesn't change)
- Example: Character glyph, tree type, texture

**Extrinsic State:**
- Depends on context
- Passed to Flyweight methods
- Not stored in Flyweight
- Example: Position, color, size

**Flyweight Factory:**
- Creates and manages flyweight instances
- Ensures flyweights are shared properly
- Returns existing flyweight if available
- Creates new flyweight only when needed

**Sharing:**
- Multiple objects reference the same flyweight instance
- Reduces memory usage significantly
- Works best when many objects share common state

---

## 💡 When to Use

### Use Flyweight When:

✅ **You need to create a large number of similar objects**
- Example: Rendering thousands of trees in a game, displaying text with many characters

✅ **Storage costs are high due to object quantity**
- Example: Each object uses significant memory, and you have millions of instances

✅ **Most object state can be made extrinsic**
- Example: Only a small part of state is unique per object

✅ **Groups of objects can be replaced with relatively few shared objects**
- Example: Many tree objects share the same texture/model

✅ **The application doesn't depend on object identity**
- Example: Objects are interchangeable, identity doesn't matter

### Don't Use When:

❌ **The number of distinct flyweight objects is large** - Factory overhead may outweigh benefits
❌ **Extrinsic state requires significant computation** - Passing it repeatedly may be expensive
❌ **Object identity is important** - Flyweights are shared, so identity is lost
❌ **The application needs mutable shared state** - Flyweight state should be immutable

---

## 🔨 Implementation Examples

### Example 1: Basic Flyweight Pattern (Text Editor - Characters)

```typescript
// Intrinsic State (shared)
interface CharacterProperties {
  char: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
}

// Extrinsic State (context-specific)
interface CharacterPosition {
  x: number;
  y: number;
  color: string;
}

// Flyweight Interface
interface Character {
  display(position: CharacterPosition): void;
  getChar(): string;
}

// Concrete Flyweight
class CharacterFlyweight implements Character {
  constructor(private properties: CharacterProperties) {}
  
  display(position: CharacterPosition): void {
    console.log(
      `Displaying '${this.properties.char}' at (${position.x}, ${position.y}) ` +
      `with color ${position.color}, font: ${this.properties.fontFamily} ${this.properties.fontSize}px`
    );
  }
  
  getChar(): string {
    return this.properties.char;
  }
  
  getProperties(): CharacterProperties {
    return { ...this.properties };
  }
}

// Flyweight Factory
class CharacterFactory {
  private flyweights: Map<string, CharacterFlyweight> = new Map();
  
  getFlyweight(properties: CharacterProperties): CharacterFlyweight {
    const key = this.getKey(properties);
    
    if (!this.flyweights.has(key)) {
      this.flyweights.set(key, new CharacterFlyweight(properties));
      console.log(`Creating new flyweight for: ${key}`);
    } else {
      console.log(`Reusing existing flyweight for: ${key}`);
    }
    
    return this.flyweights.get(key)!;
  }
  
  private getKey(properties: CharacterProperties): string {
    return `${properties.char}-${properties.fontFamily}-${properties.fontSize}-${properties.fontWeight}`;
  }
  
  getFlyweightCount(): number {
    return this.flyweights.size;
  }
  
  listFlyweights(): void {
    console.log(`\nTotal flyweights: ${this.flyweightCount()}`);
    this.flyweights.forEach((flyweight, key) => {
      console.log(`  - ${key}`);
    });
  }
}

// Client - Document with many characters
class Document {
  private characters: Array<{ flyweight: Character; position: CharacterPosition }> = [];
  private factory: CharacterFactory;
  
  constructor(factory: CharacterFactory) {
    this.factory = factory;
  }
  
  addCharacter(char: string, position: CharacterPosition, fontFamily: string = 'Arial', fontSize: number = 12, fontWeight: string = 'normal'): void {
    const properties: CharacterProperties = { char, fontFamily, fontSize, fontWeight };
    const flyweight = this.factory.getFlyweight(properties);
    this.characters.push({ flyweight, position });
  }
  
  render(): void {
    console.log('\n=== Rendering Document ===');
    this.characters.forEach(({ flyweight, position }) => {
      flyweight.display(position);
    });
  }
  
  getCharacterCount(): number {
    return this.characters.length;
  }
}

// Usage
const factory = new CharacterFactory();
const document = new Document(factory);

// Add many characters - many will share the same flyweight
document.addCharacter('H', { x: 0, y: 0, color: 'black' }, 'Arial', 12, 'normal');
document.addCharacter('e', { x: 10, y: 0, color: 'black' }, 'Arial', 12, 'normal');
document.addCharacter('l', { x: 20, y: 0, color: 'black' }, 'Arial', 12, 'normal');
document.addCharacter('l', { x: 30, y: 0, color: 'blue' }, 'Arial', 12, 'normal'); // Same char, different color
document.addCharacter('o', { x: 40, y: 0, color: 'black' }, 'Arial', 12, 'normal');
document.addCharacter('!', { x: 50, y: 0, color: 'red' }, 'Arial', 16, 'bold'); // Different size and weight

document.render();

console.log(`\nTotal characters in document: ${document.getCharacterCount()}`);
factory.listFlyweights();
console.log(`\nMemory saved: Instead of ${document.getCharacterCount()} objects, we only have ${factory.getFlyweightCount()} flyweight objects!`);
```

### Example 2: Game Trees (Forest Rendering)

```typescript
// Intrinsic State (shared)
interface TreeType {
  name: string;
  color: string;
  texture: string;
  mesh: string; // 3D model reference
}

// Extrinsic State (context-specific)
interface TreePosition {
  x: number;
  y: number;
  z: number;
  scale: number;
}

// Flyweight Interface
interface Tree {
  render(position: TreePosition): void;
  getType(): TreeType;
}

// Concrete Flyweight
class TreeFlyweight implements Tree {
  constructor(private type: TreeType) {}
  
  render(position: TreePosition): void {
    console.log(
      `Rendering ${this.type.name} at (${position.x}, ${position.y}, ${position.z}) ` +
      `with scale ${position.scale}, using texture: ${this.type.texture}`
    );
    // In real game: render mesh with texture at position
  }
  
  getType(): TreeType {
    return { ...this.type };
  }
}

// Flyweight Factory
class TreeFactory {
  private treeTypes: Map<string, TreeFlyweight> = new Map();
  
  getTreeType(name: string, color: string, texture: string, mesh: string): TreeFlyweight {
    const key = `${name}-${color}-${texture}`;
    
    if (!this.treeTypes.has(key)) {
      const type: TreeType = { name, color, texture, mesh };
      this.treeTypes.set(key, new TreeFlyweight(type));
      console.log(`Creating new tree type: ${key}`);
    }
    
    return this.treeTypes.get(key)!;
  }
  
  getTreeTypeCount(): number {
    return this.treeTypes.size;
  }
}

// Forest - contains many trees
class Forest {
  private trees: Array<{ tree: Tree; position: TreePosition }> = [];
  private factory: TreeFactory;
  
  constructor(factory: TreeFactory) {
    this.factory = factory;
  }
  
  plantTree(x: number, y: number, z: number, treeType: string, color: string, texture: string, mesh: string, scale: number = 1.0): void {
    const tree = this.factory.getTreeType(treeType, color, texture, mesh);
    const position: TreePosition = { x, y, z, scale };
    this.trees.push({ tree, position });
  }
  
  render(): void {
    console.log('\n=== Rendering Forest ===');
    this.trees.forEach(({ tree, position }) => {
      tree.render(position);
    });
  }
  
  getTreeCount(): number {
    return this.trees.length;
  }
}

// Usage
const treeFactory = new TreeFactory();
const forest = new Forest(treeFactory);

// Plant thousands of trees - but only a few types
for (let i = 0; i < 1000; i++) {
  const x = Math.random() * 1000;
  const y = 0;
  const z = Math.random() * 1000;
  
  // Only 3 different tree types
  const typeIndex = Math.floor(Math.random() * 3);
  if (typeIndex === 0) {
    forest.plantTree(x, y, z, 'Oak', 'green', 'oak_texture.png', 'oak_mesh.obj');
  } else if (typeIndex === 1) {
    forest.plantTree(x, y, z, 'Pine', 'dark-green', 'pine_texture.png', 'pine_mesh.obj');
  } else {
    forest.plantTree(x, y, z, 'Birch', 'light-green', 'birch_texture.png', 'birch_mesh.obj');
  }
}

console.log(`Total trees planted: ${forest.getTreeCount()}`);
console.log(`Unique tree types (flyweights): ${treeFactory.getTreeTypeCount()}`);
console.log(`Memory saved: ${forest.getTreeCount()} - ${treeFactory.getTreeTypeCount()} = ${forest.getTreeCount() - treeFactory.getTreeTypeCount()} objects saved!`);

// Render a few trees as example
forest.plantTree(10, 0, 10, 'Oak', 'green', 'oak_texture.png', 'oak_mesh.obj', 1.2);
forest.plantTree(20, 0, 20, 'Oak', 'green', 'oak_texture.png', 'oak_mesh.obj', 0.8);
forest.plantTree(30, 0, 30, 'Pine', 'dark-green', 'pine_texture.png', 'pine_mesh.obj', 1.5);
forest.render();
```

### Example 3: Icon System

```typescript
// Intrinsic State
interface IconProperties {
  name: string;
  svgPath: string;
  defaultSize: number;
}

// Extrinsic State
interface IconContext {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

// Flyweight Interface
interface Icon {
  render(context: IconContext): void;
  getName(): string;
}

// Concrete Flyweight
class IconFlyweight implements Icon {
  constructor(private properties: IconProperties) {}
  
  render(context: IconContext): void {
    console.log(
      `Rendering icon '${this.properties.name}' at (${context.x}, ${context.y}) ` +
      `size: ${context.size}px, color: ${context.color}, rotation: ${context.rotation}°`
    );
    // In real app: render SVG path with transformations
  }
  
  getName(): string {
    return this.properties.name;
  }
  
  getProperties(): IconProperties {
    return { ...this.properties };
  }
}

// Flyweight Factory
class IconFactory {
  private icons: Map<string, IconFlyweight> = new Map();
  
  getIcon(name: string, svgPath: string, defaultSize: number = 24): IconFlyweight {
    if (!this.icons.has(name)) {
      const properties: IconProperties = { name, svgPath, defaultSize };
      this.icons.set(name, new IconFlyweight(properties));
      console.log(`Creating icon flyweight: ${name}`);
    }
    
    return this.icons.get(name)!;
  }
  
  getIconCount(): number {
    return this.icons.size;
  }
  
  listIcons(): void {
    console.log(`\nTotal icon flyweights: ${this.getIconCount()}`);
    this.icons.forEach((icon, name) => {
      console.log(`  - ${name}`);
    });
  }
}

// UI Component using icons
class Button {
  constructor(
    private label: string,
    private icon: Icon,
    private context: IconContext
  ) {}
  
  render(): void {
    console.log(`\nButton: "${this.label}"`);
    this.icon.render(this.context);
  }
  
  setPosition(x: number, y: number): void {
    this.context.x = x;
    this.context.y = y;
  }
  
  setColor(color: string): void {
    this.context.color = color;
  }
}

// Usage
const iconFactory = new IconFactory();

// Create icon flyweights
const homeIcon = iconFactory.getIcon('home', 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z');
const searchIcon = iconFactory.getIcon('search', 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');
const userIcon = iconFactory.getIcon('user', 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z');

// Create many buttons using the same icons
const buttons: Button[] = [];

// Home buttons in different places
buttons.push(new Button('Home', homeIcon, { x: 10, y: 10, size: 24, color: 'blue', rotation: 0 }));
buttons.push(new Button('Home', homeIcon, { x: 50, y: 10, size: 32, color: 'green', rotation: 0 }));
buttons.push(new Button('Home', homeIcon, { x: 100, y: 10, size: 20, color: 'red', rotation: 45 }));

// Search buttons
buttons.push(new Button('Search', searchIcon, { x: 10, y: 50, size: 24, color: 'black', rotation: 0 }));
buttons.push(new Button('Search', searchIcon, { x: 50, y: 50, size: 28, color: 'purple', rotation: 0 }));

// User buttons
buttons.push(new Button('Profile', userIcon, { x: 10, y: 90, size: 24, color: 'gray', rotation: 0 }));
buttons.push(new Button('Account', userIcon, { x: 50, y: 90, size: 30, color: 'orange', rotation: 0 }));

// Render all buttons
console.log('=== Rendering Buttons ===');
buttons.forEach(button => button.render());

console.log(`\nTotal buttons: ${buttons.length}`);
iconFactory.listIcons();
console.log(`\nMemory saved: ${buttons.length} buttons use only ${iconFactory.getIconCount()} icon flyweights!`);
```

### Example 4: Particle System

```typescript
// Intrinsic State
interface ParticleType {
  name: string;
  texture: string;
  defaultLifetime: number;
  physicsProperties: {
    mass: number;
    drag: number;
  };
}

// Extrinsic State
interface ParticleState {
  x: number;
  y: number;
  z: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  age: number;
  scale: number;
  alpha: number;
}

// Flyweight Interface
interface Particle {
  update(state: ParticleState, deltaTime: number): ParticleState;
  render(state: ParticleState): void;
  getType(): ParticleType;
}

// Concrete Flyweight
class ParticleFlyweight implements Particle {
  constructor(private type: ParticleType) {}
  
  update(state: ParticleState, deltaTime: number): ParticleState {
    // Update physics based on type's properties
    const drag = this.type.physicsProperties.drag;
    
    return {
      ...state,
      x: state.x + state.velocityX * deltaTime,
      y: state.y + state.velocityY * deltaTime,
      z: state.z + state.velocityZ * deltaTime,
      velocityX: state.velocityX * (1 - drag * deltaTime),
      velocityY: state.velocityY * (1 - drag * deltaTime),
      velocityZ: state.velocityZ * (1 - drag * deltaTime),
      age: state.age + deltaTime,
      alpha: Math.max(0, 1 - (state.age / this.type.defaultLifetime))
    };
  }
  
  render(state: ParticleState): void {
    if (state.alpha > 0) {
      console.log(
        `Rendering ${this.type.name} particle at (${state.x.toFixed(2)}, ${state.y.toFixed(2)}, ${state.z.toFixed(2)}) ` +
        `scale: ${state.scale.toFixed(2)}, alpha: ${state.alpha.toFixed(2)}, age: ${state.age.toFixed(2)}s`
      );
    }
  }
  
  getType(): ParticleType {
    return { ...this.type };
  }
  
  isAlive(state: ParticleState): boolean {
    return state.age < this.type.defaultLifetime;
  }
}

// Flyweight Factory
class ParticleFactory {
  private particleTypes: Map<string, ParticleFlyweight> = new Map();
  
  getParticleType(
    name: string,
    texture: string,
    lifetime: number,
    mass: number,
    drag: number
  ): ParticleFlyweight {
    if (!this.particleTypes.has(name)) {
      const type: ParticleType = {
        name,
        texture,
        defaultLifetime: lifetime,
        physicsProperties: { mass, drag }
      };
      this.particleTypes.set(name, new ParticleFlyweight(type));
      console.log(`Creating particle type: ${name}`);
    }
    
    return this.particleTypes.get(name)!;
  }
  
  getParticleTypeCount(): number {
    return this.particleTypes.size;
  }
}

// Particle System
class ParticleSystem {
  private particles: Array<{ particle: Particle; state: ParticleState }> = [];
  private factory: ParticleFactory;
  
  constructor(factory: ParticleFactory) {
    this.factory = factory;
  }
  
  emit(
    x: number, y: number, z: number,
    particleType: string,
    texture: string,
    lifetime: number,
    mass: number,
    drag: number,
    velocityX: number = 0,
    velocityY: number = 0,
    velocityZ: number = 0,
    scale: number = 1.0
  ): void {
    const particle = this.factory.getParticleType(particleType, texture, lifetime, mass, drag);
    const state: ParticleState = {
      x, y, z,
      velocityX, velocityY, velocityZ,
      age: 0,
      scale,
      alpha: 1.0
    };
    this.particles.push({ particle, state });
  }
  
  update(deltaTime: number): void {
    this.particles = this.particles
      .map(({ particle, state }) => {
        const newState = particle.update(state, deltaTime);
        return { particle, state: newState };
      })
      .filter(({ particle, state }) => {
        return (particle as ParticleFlyweight).isAlive(state);
      });
  }
  
  render(): void {
    this.particles.forEach(({ particle, state }) => {
      particle.render(state);
    });
  }
  
  getParticleCount(): number {
    return this.particles.length;
  }
}

// Usage
const particleFactory = new ParticleFactory();
const system = new ParticleSystem(particleFactory);

// Emit many particles of only a few types
for (let i = 0; i < 100; i++) {
  const typeIndex = Math.floor(Math.random() * 3);
  
  if (typeIndex === 0) {
    // Fire particles
    system.emit(
      Math.random() * 100, Math.random() * 100, 0,
      'Fire', 'fire_texture.png', 2.0, 0.1, 0.5,
      (Math.random() - 0.5) * 10, Math.random() * 20, 0,
      Math.random() * 0.5 + 0.5
    );
  } else if (typeIndex === 1) {
    // Smoke particles
    system.emit(
      Math.random() * 100, Math.random() * 100, 0,
      'Smoke', 'smoke_texture.png', 5.0, 0.05, 0.3,
      (Math.random() - 0.5) * 5, Math.random() * 10, 0,
      Math.random() * 1.0 + 0.5
    );
  } else {
    // Spark particles
    system.emit(
      Math.random() * 100, Math.random() * 100, 0,
      'Spark', 'spark_texture.png', 1.0, 0.2, 0.8,
      (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 0,
      Math.random() * 0.3 + 0.2
    );
  }
}

console.log(`Initial particles: ${system.getParticleCount()}`);
console.log(`Particle types (flyweights): ${particleFactory.getParticleTypeCount()}`);

// Simulate
console.log('\n=== Simulation ===');
for (let i = 0; i < 5; i++) {
  system.update(0.1);
  console.log(`Frame ${i + 1}: ${system.getParticleCount()} particles alive`);
  if (system.getParticleCount() > 0 && system.getParticleCount() <= 5) {
    system.render();
  }
}
```

### Example 5: Web Browser Cache (Image/Resource Sharing)

```typescript
// Intrinsic State
interface ImageResource {
  url: string;
  width: number;
  height: number;
  format: string;
  data: string; // Base64 or reference to loaded image
}

// Extrinsic State
interface ImageContext {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  filter: string;
}

// Flyweight Interface
interface Image {
  render(context: ImageContext): void;
  getResource(): ImageResource;
}

// Concrete Flyweight
class ImageFlyweight implements Image {
  constructor(private resource: ImageResource) {}
  
  render(context: ImageContext): void {
    console.log(
      `Rendering image from ${this.resource.url} ` +
      `at (${context.x}, ${context.y}) ` +
      `size: ${context.width}x${context.height} ` +
      `opacity: ${context.opacity}, rotation: ${context.rotation}°, filter: ${context.filter}`
    );
    // In real browser: render image with CSS transforms and filters
  }
  
  getResource(): ImageResource {
    return { ...this.resource };
  }
  
  getUrl(): string {
    return this.resource.url;
  }
}

// Flyweight Factory (Browser Cache)
class ImageCache {
  private images: Map<string, ImageFlyweight> = new Map();
  private loadCount: number = 0;
  
  async getImage(url: string): Promise<ImageFlyweight> {
    if (this.images.has(url)) {
      console.log(`Cache HIT: ${url}`);
      return this.images.get(url)!;
    }
    
    console.log(`Cache MISS: Loading ${url}`);
    this.loadCount++;
    
    // Simulate loading image
    const resource: ImageResource = {
      url,
      width: 800, // Would be loaded from actual image
      height: 600,
      format: 'jpeg',
      data: `data:image/jpeg;base64,...` // Simulated
    };
    
    const image = new ImageFlyweight(resource);
    this.images.set(url, image);
    return image;
  }
  
  getCacheSize(): number {
    return this.images.size;
  }
  
  getLoadCount(): number {
    return this.loadCount;
  }
  
  clearCache(): void {
    this.images.clear();
    console.log('Cache cleared');
  }
  
  getCacheStats(): void {
    console.log(`\n=== Cache Statistics ===`);
    console.log(`Total images loaded: ${this.loadCount}`);
    console.log(`Images in cache: ${this.getCacheSize()}`);
    console.log(`Cache hits: ${this.loadCount - this.getCacheSize()}`);
  }
}

// HTML Element using images
class ImageElement {
  constructor(
    private image: Image,
    private context: ImageContext
  ) {}
  
  render(): void {
    this.image.render(this.context);
  }
  
  setPosition(x: number, y: number): void {
    this.context.x = x;
    this.context.y = y;
  }
  
  setSize(width: number, height: number): void {
    this.context.width = width;
    this.context.height = height;
  }
  
  setOpacity(opacity: number): void {
    this.context.opacity = opacity;
  }
  
  setFilter(filter: string): void {
    this.context.filter = filter;
  }
}

// Usage
const cache = new ImageCache();

async function createPage() {
  const elements: ImageElement[] = [];
  
  // Load images (some will be reused)
  const logo = await cache.getImage('https://example.com/logo.png');
  const banner = await cache.getImage('https://example.com/banner.jpg');
  const icon = await cache.getImage('https://example.com/icon.png');
  
  // Create many elements using same images
  // Logo appears in header
  elements.push(new ImageElement(logo, { x: 10, y: 10, width: 200, height: 50, opacity: 1.0, rotation: 0, filter: 'none' }));
  
  // Logo appears in footer (same image, different context)
  elements.push(new ImageElement(logo, { x: 10, y: 750, width: 150, height: 37, opacity: 0.8, rotation: 0, filter: 'grayscale(50%)' }));
  
  // Banner appears multiple times
  elements.push(new ImageElement(banner, { x: 0, y: 0, width: 1920, height: 400, opacity: 1.0, rotation: 0, filter: 'none' }));
  elements.push(new ImageElement(banner, { x: 0, y: 400, width: 960, height: 200, opacity: 0.5, rotation: 0, filter: 'blur(2px)' }));
  
  // Icons appear many times
  for (let i = 0; i < 20; i++) {
    elements.push(new ImageElement(
      icon,
      {
        x: (i % 5) * 50,
        y: Math.floor(i / 5) * 50,
        width: 32,
        height: 32,
        opacity: 1.0,
        rotation: i * 15,
        filter: 'none'
      }
    ));
  }
  
  // Render all elements
  console.log('\n=== Rendering Page ===');
  elements.forEach((element, index) => {
    if (index < 5) { // Show first 5 as example
      element.render();
    }
  });
  
  console.log(`\nTotal image elements: ${elements.length}`);
  cache.getCacheStats();
  console.log(`\nMemory saved: ${elements.length} elements use only ${cache.getCacheSize()} image resources!`);
}

createPage();
```

### Example 6: Font System (Character Glyphs)

```typescript
// Intrinsic State
interface GlyphProperties {
  character: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
}

// Extrinsic State
interface GlyphContext {
  x: number;
  y: number;
  color: string;
  backgroundColor: string;
  underline: boolean;
  strikethrough: boolean;
}

// Flyweight Interface
interface Glyph {
  render(context: GlyphContext): void;
  getWidth(): number;
  getHeight(): number;
  getCharacter(): string;
}

// Concrete Flyweight
class GlyphFlyweight implements Glyph {
  private width: number;
  private height: number;
  
  constructor(private properties: GlyphProperties) {
    // Calculate dimensions based on character and font
    this.width = this.calculateWidth();
    this.height = this.calculateHeight();
  }
  
  private calculateWidth(): number {
    // Simplified: in reality, would use font metrics
    const baseWidth = this.properties.fontSize * 0.6;
    if (this.properties.character === ' ') return baseWidth * 0.5;
    if (this.properties.character === 'i' || this.properties.character === 'l') return baseWidth * 0.3;
    if (this.properties.character === 'm' || this.properties.character === 'w') return baseWidth * 1.2;
    return baseWidth;
  }
  
  private calculateHeight(): number {
    return this.properties.fontSize * 1.2;
  }
  
  render(context: GlyphContext): void {
    let output = `'${this.properties.character}'`;
    if (context.backgroundColor) {
      output += ` [bg:${context.backgroundColor}]`;
    }
    output += ` at (${context.x}, ${context.y})`;
    output += ` color:${context.color}`;
    if (context.underline) output += ' [underline]';
    if (context.strikethrough) output += ' [strikethrough]';
    output += ` font:${this.properties.fontFamily} ${this.properties.fontSize}px`;
    
    console.log(output);
  }
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
  
  getCharacter(): string {
    return this.properties.character;
  }
  
  getProperties(): GlyphProperties {
    return { ...this.properties };
  }
}

// Flyweight Factory
class GlyphFactory {
  private glyphs: Map<string, GlyphFlyweight> = new Map();
  
  getGlyph(character: string, fontFamily: string, fontSize: number, fontWeight: string = 'normal', fontStyle: string = 'normal'): GlyphFlyweight {
    const key = `${character}-${fontFamily}-${fontSize}-${fontWeight}-${fontStyle}`;
    
    if (!this.glyphs.has(key)) {
      const properties: GlyphProperties = { character, fontFamily, fontSize, fontWeight, fontStyle };
      this.glyphs.set(key, new GlyphFlyweight(properties));
    }
    
    return this.glyphs.get(key)!;
  }
  
  getGlyphCount(): number {
    return this.glyphs.size;
  }
  
  getMemoryUsage(): number {
    // Estimate: each glyph flyweight uses ~200 bytes
    return this.getGlyphCount() * 200;
  }
}

// Text Renderer
class TextRenderer {
  private glyphs: Array<{ glyph: Glyph; context: GlyphContext }> = [];
  private factory: GlyphFactory;
  private currentX: number = 0;
  private currentY: number = 0;
  
  constructor(factory: GlyphFactory) {
    this.factory = factory;
  }
  
  addText(
    text: string,
    fontFamily: string = 'Arial',
    fontSize: number = 12,
    fontWeight: string = 'normal',
    fontStyle: string = 'normal',
    color: string = 'black',
    backgroundColor: string = '',
    underline: boolean = false,
    strikethrough: boolean = false
  ): void {
    for (const char of text) {
      const glyph = this.factory.getGlyph(char, fontFamily, fontSize, fontWeight, fontStyle);
      const context: GlyphContext = {
        x: this.currentX,
        y: this.currentY,
        color,
        backgroundColor,
        underline,
        strikethrough
      };
      
      this.glyphs.push({ glyph, context });
      this.currentX += glyph.getWidth();
    }
  }
  
  newLine(): void {
    this.currentX = 0;
    this.currentY += 20; // Line height
  }
  
  render(): void {
    console.log('\n=== Rendering Text ===');
    this.glyphs.forEach(({ glyph, context }) => {
      glyph.render(context);
    });
  }
  
  getGlyphCount(): number {
    return this.glyphs.length;
  }
  
  getMemoryUsage(): number {
    // Each glyph reference + context uses ~100 bytes
    return this.getGlyphCount() * 100;
  }
}

// Usage
const glyphFactory = new GlyphFactory();
const renderer = new TextRenderer(glyphFactory);

// Render a document with many characters
renderer.addText('Hello, ', 'Arial', 12, 'normal', 'normal', 'black');
renderer.addText('World!', 'Arial', 12, 'bold', 'normal', 'blue');
renderer.newLine();
renderer.addText('This is a ', 'Times New Roman', 14, 'normal', 'normal', 'black');
renderer.addText('long document', 'Times New Roman', 14, 'italic', 'normal', 'red', '', true);
renderer.addText(' with many characters.', 'Times New Roman', 14, 'normal', 'normal', 'black');
renderer.newLine();
renderer.addText('The same characters are reused!', 'Courier New', 10, 'normal', 'normal', 'green', 'yellow');

renderer.render();

console.log(`\n=== Memory Analysis ===`);
console.log(`Total glyph instances in document: ${renderer.getGlyphCount()}`);
console.log(`Unique glyph flyweights: ${glyphFactory.getGlyphCount()}`);
console.log(`Memory used by flyweights: ${glyphFactory.getMemoryUsage()} bytes`);
console.log(`Memory used by document: ${renderer.getMemoryUsage()} bytes`);
console.log(`Total memory: ${glyphFactory.getMemoryUsage() + renderer.getMemoryUsage()} bytes`);

// Without flyweight, each character would need full properties
const estimatedWithoutFlyweight = renderer.getGlyphCount() * 500; // ~500 bytes per character
console.log(`\nEstimated without flyweight: ${estimatedWithoutFlyweight} bytes`);
console.log(`Memory saved: ${estimatedWithoutFlyweight - (glyphFactory.getMemoryUsage() + renderer.getMemoryUsage())} bytes`);
console.log(`Savings: ${((1 - (glyphFactory.getMemoryUsage() + renderer.getMemoryUsage()) / estimatedWithoutFlyweight) * 100).toFixed(1)}%`);
```

---

## 🔄 Flyweight vs Other Patterns

### Flyweight vs Singleton

| Aspect | Flyweight | Singleton |
|--------|-----------|-----------|
| **Purpose** | Share state across many objects | Ensure single instance |
| **Quantity** | Many flyweight instances | One singleton instance |
| **State** | Intrinsic (shared) + Extrinsic (context) | Single shared state |
| **When** | Many similar objects | Need exactly one instance |

**Example:**
- **Flyweight**: Many tree objects sharing texture
- **Singleton**: Database connection (only one needed)

### Flyweight vs Prototype

| Aspect | Flyweight | Prototype |
|--------|-----------|-----------|
| **Purpose** | Share common state | Clone existing objects |
| **Focus** | Memory optimization | Object creation |
| **State** | Separates intrinsic/extrinsic | Copies all state |
| **When** | Many objects with shared state | Need to clone objects |

**Example:**
- **Flyweight**: Characters sharing font properties
- **Prototype**: Cloning a configured object

### Flyweight vs Object Pool

| Aspect | Flyweight | Object Pool |
|--------|-----------|-------------|
| **Purpose** | Share immutable state | Reuse expensive objects |
| **State** | Immutable intrinsic state | Mutable pooled objects |
| **Lifecycle** | Long-lived, shared | Borrowed and returned |
| **When** | Many objects with shared data | Expensive object creation |

**Example:**
- **Flyweight**: Tree types (immutable, shared)
- **Object Pool**: Database connections (mutable, borrowed)

### Flyweight vs Composite

| Aspect | Flyweight | Composite |
|--------|-----------|-----------|
| **Purpose** | Share state to save memory | Build tree structures |
| **Focus** | Memory optimization | Structure organization |
| **When** | Many similar objects | Need hierarchies |
| **Can Combine** | Yes - use Flyweight in Composite leaves |

**Example:**
- **Flyweight**: Many leaf nodes sharing properties
- **Composite**: Tree structure of components
- **Combined**: Composite tree where leaves are flyweights

---

## 🎨 Real-World Applications

### 1. Text Editors and Word Processors

```typescript
// Characters share font properties (intrinsic)
// Each character has position, color (extrinsic)
// Thousands of characters, but only ~100 unique glyph flyweights
```

### 2. Game Development

```typescript
// Trees, particles, enemies share textures/models (intrinsic)
// Each instance has position, rotation (extrinsic)
// Thousands of game objects, but few unique types
```

### 3. Web Browsers

```typescript
// Images, fonts, styles cached and shared
// Multiple DOM elements reference same resources
// Reduces memory and network requests
```

### 4. GUI Frameworks

```typescript
// Icons, fonts, styles shared across components
// Each component has position, size (extrinsic)
// Many UI elements, but few unique resources
```

### 5. Database Connection Pooling (Conceptual)

```typescript
// Connection configuration shared (intrinsic)
// Each query has parameters (extrinsic)
// Many queries, but few connection types
```

### 6. Compiler Symbol Tables

```typescript
// Variable names, types shared (intrinsic)
// Each reference has scope, line number (extrinsic)
// Many references, but few unique symbols
```

---

## ⚠️ Common Pitfalls and Best Practices

### Pitfalls

❌ **Storing Extrinsic State in Flyweight**
- Problem: Defeats the purpose of flyweight pattern
- Solution: Always pass extrinsic state as parameters

```typescript
// ❌ Bad: Storing extrinsic state
class BadFlyweight {
  private x: number; // Extrinsic!
  private y: number; // Extrinsic!
  private color: string; // Extrinsic!
  
  render() {
    // Uses extrinsic state stored in flyweight
  }
}

// ✅ Good: Passing extrinsic state
class GoodFlyweight {
  private texture: string; // Intrinsic only
  
  render(context: RenderContext) {
    // Uses context (extrinsic) passed as parameter
  }
}
```

❌ **Mutable Intrinsic State**
- Problem: Changes affect all flyweight instances
- Solution: Keep intrinsic state immutable

```typescript
// ❌ Bad: Mutable intrinsic state
class BadFlyweight {
  private color: string; // Mutable!
  
  setColor(color: string) {
    this.color = color; // Affects all instances!
  }
}

// ✅ Good: Immutable intrinsic state
class GoodFlyweight {
  private readonly color: string; // Immutable
  
  constructor(color: string) {
    this.color = color; // Set once, never changes
  }
}
```

❌ **Too Many Unique Flyweights**
- Problem: Factory overhead exceeds memory savings
- Solution: Ensure significant sharing occurs

```typescript
// ❌ Bad: Each object gets unique flyweight
for (let i = 0; i < 1000; i++) {
  factory.getFlyweight(`unique-${i}`); // No sharing!
}

// ✅ Good: Many objects share few flyweights
const types = ['TypeA', 'TypeB', 'TypeC'];
for (let i = 0; i < 1000; i++) {
  factory.getFlyweight(types[i % 3]); // Significant sharing!
}
```

❌ **Expensive Extrinsic State Computation**
- Problem: Computing extrinsic state repeatedly is costly
- Solution: Cache computed extrinsic state or reconsider design

```typescript
// ❌ Bad: Expensive computation in render
class BadFlyweight {
  render(context: Context) {
    const expensive = this.computeExpensive(context); // Called every render!
    // Use expensive...
  }
}

// ✅ Good: Cache or precompute
class GoodFlyweight {
  render(context: Context, precomputed: PrecomputedData) {
    // Use precomputed data
  }
}
```

### Best Practices

✅ **Separate Intrinsic and Extrinsic State Clearly**
- Intrinsic: Shared, immutable, stored in flyweight
- Extrinsic: Context-specific, passed as parameters

✅ **Use Flyweight Factory**
- Centralize flyweight creation
- Ensure proper sharing
- Track flyweight usage

```typescript
// ✅ Good: Factory pattern
class FlyweightFactory {
  private flyweights = new Map<string, Flyweight>();
  
  getFlyweight(key: string): Flyweight {
    if (!this.flyweights.has(key)) {
      this.flyweights.set(key, new ConcreteFlyweight(key));
    }
    return this.flyweights.get(key)!;
  }
}
```

✅ **Immutable Intrinsic State**
- Make intrinsic state readonly/immutable
- Prevents accidental changes
- Ensures safe sharing

```typescript
// ✅ Good: Immutable state
class Flyweight {
  private readonly type: string;
  private readonly texture: string;
  
  constructor(type: string, texture: string) {
    this.type = type;
    this.texture = texture;
  }
}
```

✅ **Measure Memory Savings**
- Track flyweight count vs total objects
- Monitor memory usage
- Verify pattern is beneficial

```typescript
// ✅ Good: Tracking
class Factory {
  getStats() {
    return {
      flyweightCount: this.flyweights.size,
      totalObjects: this.totalObjects,
      savings: this.totalObjects - this.flyweights.size
    };
  }
}
```

✅ **Consider Thread Safety**
- In multi-threaded environments, ensure factory is thread-safe
- Use synchronization if needed
- Consider concurrent collections

```typescript
// ✅ Good: Thread-safe factory (conceptual)
class ThreadSafeFactory {
  private flyweights = new ConcurrentMap<string, Flyweight>();
  
  getFlyweight(key: string): Flyweight {
    return this.flyweights.computeIfAbsent(key, k => new Flyweight(k));
  }
}
```

✅ **Document State Separation**
- Clearly document what's intrinsic vs extrinsic
- Make it obvious in code
- Use naming conventions

```typescript
// ✅ Good: Clear documentation
interface IntrinsicState {
  // Shared, immutable state
  type: string;
  texture: string;
}

interface ExtrinsicState {
  // Context-specific state
  x: number;
  y: number;
  rotation: number;
}
```

---

## 🧪 Testing Flyweight

### Unit Testing

```typescript
describe('Flyweight Pattern', () => {
  describe('Flyweight Factory', () => {
    it('should create flyweight on first request', () => {
      const factory = new CharacterFactory();
      const flyweight = factory.getFlyweight({ char: 'A', fontFamily: 'Arial', fontSize: 12, fontWeight: 'normal' });
      
      expect(flyweight).toBeDefined();
      expect(factory.getFlyweightCount()).toBe(1);
    });
    
    it('should reuse existing flyweight', () => {
      const factory = new CharacterFactory();
      const props = { char: 'A', fontFamily: 'Arial', fontSize: 12, fontWeight: 'normal' };
      
      const flyweight1 = factory.getFlyweight(props);
      const flyweight2 = factory.getFlyweight(props);
      
      expect(flyweight1).toBe(flyweight2); // Same instance
      expect(factory.getFlyweightCount()).toBe(1);
    });
    
    it('should create different flyweights for different properties', () => {
      const factory = new CharacterFactory();
      
      factory.getFlyweight({ char: 'A', fontFamily: 'Arial', fontSize: 12, fontWeight: 'normal' });
      factory.getFlyweight({ char: 'B', fontFamily: 'Arial', fontSize: 12, fontWeight: 'normal' });
      factory.getFlyweight({ char: 'A', fontFamily: 'Times', fontSize: 12, fontWeight: 'normal' });
      
      expect(factory.getFlyweightCount()).toBe(3);
    });
  });
  
  describe('Flyweight', () => {
    it('should store intrinsic state', () => {
      const factory = new CharacterFactory();
      const flyweight = factory.getFlyweight({
        char: 'A',
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'normal'
      });
      
      expect(flyweight.getChar()).toBe('A');
    });
    
    it('should accept extrinsic state as parameter', () => {
      const factory = new CharacterFactory();
      const flyweight = factory.getFlyweight({
        char: 'A',
        fontFamily: 'Arial',
        fontSize: 12,
        fontWeight: 'normal'
      });
      
      const context = { x: 10, y: 20, color: 'red' };
      expect(() => flyweight.display(context)).not.toThrow();
    });
  });
  
  describe('Memory Efficiency', () => {
    it('should share flyweights across many objects', () => {
      const factory = new CharacterFactory();
      const document = new Document(factory);
      
      // Add 1000 characters, but only 26 unique (A-Z)
      for (let i = 0; i < 1000; i++) {
        const char = String.fromCharCode(65 + (i % 26)); // A-Z
        document.addCharacter(char, { x: i * 10, y: 0, color: 'black' });
      }
      
      expect(document.getCharacterCount()).toBe(1000);
      expect(factory.getFlyweightCount()).toBe(26); // Only 26 unique flyweights
    });
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Memory Savings**
- Significantly reduces memory usage
- Shares common state across many objects
- Essential for applications with many similar objects

✅ **Performance**
- Reduces object creation overhead
- Fewer objects to manage
- Can improve cache locality

✅ **Scalability**
- Allows handling more objects than would otherwise fit in memory
- Critical for games, editors, and graphics applications

✅ **Separation of Concerns**
- Clearly separates shared state from context-specific state
- Makes code more maintainable

### Disadvantages

❌ **Complexity**
- Adds complexity to codebase
- Requires careful design of state separation
- Can be harder to understand

❌ **Runtime Overhead**
- Factory lookup overhead (though usually minimal)
- Passing extrinsic state repeatedly
- May not be worth it if sharing is minimal

❌ **Identity Loss**
- Shared flyweights lose object identity
- Can't distinguish between objects using same flyweight
- May complicate debugging

❌ **Limited Applicability**
- Only useful when many objects share state
- Requires significant sharing to be beneficial
- Not suitable for all scenarios

---

## 🔗 Related Patterns

### Flyweight and Factory

- **Flyweight** shares state
- **Factory** creates flyweights
- Often used together: Factory creates and manages flyweights

### Flyweight and Composite

- **Flyweight** shares state
- **Composite** builds tree structures
- Use Flyweight for leaf nodes in Composite to save memory

### Flyweight and State

- **Flyweight** shares immutable state
- **State** manages mutable state
- Can use Flyweight for state objects if they're shared

### Flyweight and Strategy

- **Flyweight** shares algorithms/strategies
- **Strategy** encapsulates algorithms
- Strategies can be flyweights if shared

### Flyweight and Prototype

- **Flyweight** shares state
- **Prototype** clones objects
- Can combine: prototype creates, flyweight shares

---

## 🎓 Summary

### Key Takeaways

1. **Purpose**: Flyweight reduces memory by sharing intrinsic state across many objects
2. **State Separation**: Intrinsic (shared, immutable) vs Extrinsic (context-specific, passed in)
3. **Use When**: Many similar objects, high memory usage, most state can be extrinsic
4. **Benefits**: Memory savings, performance, scalability
5. **Watch Out**: Complexity, identity loss, limited applicability

### When to Choose Flyweight

Choose Flyweight when:
- ✅ You need to create a large number of similar objects
- ✅ Storage costs are high due to object quantity
- ✅ Most object state can be made extrinsic
- ✅ Groups of objects can be replaced with few shared objects
- ✅ The application doesn't depend on object identity

Avoid Flyweight when:
- ❌ The number of distinct flyweights is large (overhead > savings)
- ❌ Extrinsic state requires significant computation
- ❌ Object identity is important
- ❌ The application needs mutable shared state

### Next Steps

- Practice implementing Flyweight in your projects
- Identify opportunities for state sharing
- Measure memory savings
- Explore real-world examples (text editors, games, browsers)
- Compare Flyweight with other structural patterns
- Experiment with combining Flyweight and other patterns

---

## 📚 Additional Resources

### Design Patterns References

- **Gang of Four (GoF)**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Head First Design Patterns**: Chapter on Flyweight Pattern

### Real-World Examples

- Text editors and word processors (character glyphs)
- Game engines (trees, particles, enemies)
- Web browsers (image/resource caching)
- GUI frameworks (icons, fonts, styles)
- Compilers (symbol tables)

### Practice Exercises

1. **Create a Text Renderer with Flyweight**
   - Implement character flyweights
   - Separate font properties (intrinsic) from position/color (extrinsic)
   - Render a document with thousands of characters
   - Measure memory savings

2. **Build a Game Particle System**
   - Create particle type flyweights
   - Share texture and physics properties (intrinsic)
   - Store position and velocity (extrinsic)
   - Simulate thousands of particles

3. **Implement an Icon System**
   - Create icon flyweights
   - Share SVG paths (intrinsic)
   - Store position, size, color (extrinsic)
   - Render many icons efficiently

---

**Happy Learning! 🚀**



