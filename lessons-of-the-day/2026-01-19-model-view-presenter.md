# Model-View-Presenter (MVP) - Deep Dive

## 📋 Learning Objectives

- [ ] Understand MVP pattern definition and principles
- [ ] Learn MVP components (Model, View, Presenter)
- [ ] Master the interaction flow and responsibilities
- [ ] Recognize MVP variations (Passive View, Supervising Controller)
- [ ] Understand MVP vs MVC vs MVVM comparisons
- [ ] Learn when to use MVP pattern
- [ ] Understand testing benefits of MVP
- [ ] Learn best practices for MVP implementation

---

## 🎯 Definition

**Model-View-Presenter (MVP)** is an architectural pattern that separates an application into three main components: Model (data and business logic), View (user interface), and Presenter (mediator between Model and View). The Presenter handles all user interactions and updates the View, while the View is passive and delegates all logic to the Presenter.

**Origin:**
- Derived from Model-View-Controller (MVC)
- Developed by Taligent in the 1990s
- Popularized for desktop applications
- Now widely used in web and mobile development
- Particularly strong for testability

**Key Principles:**
- **Separation of Concerns** - Clear boundaries between components
- **View Passivity** - View is passive, Presenter is active
- **Testability** - Easy to test Presenter in isolation
- **Dependency Direction** - View depends on Presenter, Presenter depends on Model
- **No Direct View-Model Communication** - All communication through Presenter

**Key Principle:**
> "In MVP, the View is passive and only displays data. The Presenter handles all user interactions and business logic. The View never directly accesses the Model - all communication goes through the Presenter. This makes the Presenter highly testable since it can be tested without the View."

---

## 🏗️ MVP Components

### Model

**Responsibilities:**
- Business logic and data
- Data validation rules
- Data access operations
- Domain entities
- Business rules enforcement

**Characteristics:**
- Independent of View and Presenter
- Contains application logic
- Can be reused across different Presenters
- No knowledge of UI

**Example:**
```typescript
// Model: User domain entity
export class User {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public createdAt: Date
  ) {}

  validate(): boolean {
    return this.email.includes('@') && this.name.length > 0;
  }

  updateEmail(newEmail: string): void {
    if (newEmail.includes('@')) {
      this.email = newEmail;
    }
  }
}

// Model: User repository
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Database access logic
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Database access logic
    return null;
  }

  async save(user: User): Promise<void> {
    // Database save logic
  }

  async delete(id: string): Promise<void> {
    // Database delete logic
  }
}
```

### View

**Responsibilities:**
- Display data to user
- Capture user input
- Delegate all logic to Presenter
- Implement UI interface defined by Presenter

**Characteristics:**
- **Passive** - Doesn't contain business logic
- **Thin** - Minimal code, mostly UI
- **Interface-Based** - Implements IView interface
- **Presenter-Dependent** - Depends on Presenter

**Example:**
```typescript
// View Interface
export interface IUserView {
  setUserName(name: string): void;
  setUserEmail(email: string): void;
  setErrorMessage(message: string): void;
  clearError(): void;
  showLoading(show: boolean): void;
  getUserName(): string;
  getUserEmail(): string;
}

// View Implementation (Web)
export class UserView implements IUserView {
  private nameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private errorDiv: HTMLElement;
  private loadingDiv: HTMLElement;
  private presenter: UserPresenter;

  constructor(container: HTMLElement) {
    this.nameInput = container.querySelector('#name') as HTMLInputElement;
    this.emailInput = container.querySelector('#email') as HTMLInputElement;
    this.errorDiv = container.querySelector('#error') as HTMLElement;
    this.loadingDiv = container.querySelector('#loading') as HTMLElement;

    // View creates Presenter and passes itself
    this.presenter = new UserPresenter(this);

    // Wire up events - delegate to Presenter
    const saveButton = container.querySelector('#save');
    saveButton?.addEventListener('click', () => {
      this.presenter.onSaveClicked();
    });
  }

  setUserName(name: string): void {
    this.nameInput.value = name;
  }

  setUserEmail(email: string): void {
    this.emailInput.value = email;
  }

  setErrorMessage(message: string): void {
    this.errorDiv.textContent = message;
    this.errorDiv.style.display = 'block';
  }

  clearError(): void {
    this.errorDiv.style.display = 'none';
  }

  showLoading(show: boolean): void {
    this.loadingDiv.style.display = show ? 'block' : 'none';
  }

  getUserName(): string {
    return this.nameInput.value;
  }

  getUserEmail(): string {
    return this.emailInput.value;
  }
}
```

### Presenter

**Responsibilities:**
- Handle all user interactions
- Coordinate between Model and View
- Update View based on Model state
- Handle business logic
- Manage application flow

**Characteristics:**
- **Active** - Contains all interaction logic
- **View-Dependent** - Depends on View interface
- **Model-Dependent** - Depends on Model
- **Testable** - Can be tested without View

**Example:**
```typescript
// Presenter
export class UserPresenter {
  private view: IUserView;
  private userRepository: IUserRepository;
  private currentUser: User | null = null;

  constructor(view: IUserView, userRepository?: IUserRepository) {
    this.view = view;
    this.userRepository = userRepository || new UserRepository();
  }

  async loadUser(userId: string): Promise<void> {
    try {
      this.view.showLoading(true);
      this.view.clearError();

      const user = await this.userRepository.findById(userId);
      
      if (user) {
        this.currentUser = user;
        this.view.setUserName(user.name);
        this.view.setUserEmail(user.email);
      } else {
        this.view.setErrorMessage('User not found');
      }
    } catch (error) {
      this.view.setErrorMessage('Failed to load user');
    } finally {
      this.view.showLoading(false);
    }
  }

  async onSaveClicked(): Promise<void> {
    try {
      this.view.clearError();

      const name = this.view.getUserName();
      const email = this.view.getUserEmail();

      // Validation logic in Presenter
      if (!name || name.trim().length === 0) {
        this.view.setErrorMessage('Name is required');
        return;
      }

      if (!email || !email.includes('@')) {
        this.view.setErrorMessage('Valid email is required');
        return;
      }

      // Update model
      if (this.currentUser) {
        this.currentUser.name = name;
        this.currentUser.updateEmail(email);
        
        if (!this.currentUser.validate()) {
          this.view.setErrorMessage('Invalid user data');
          return;
        }

        this.view.showLoading(true);
        await this.userRepository.save(this.currentUser);
        this.view.setErrorMessage('User saved successfully');
      }
    } catch (error) {
      this.view.setErrorMessage('Failed to save user');
    } finally {
      this.view.showLoading(false);
    }
  }
}
```

---

## 🔄 Interaction Flow

### Basic Flow

```
1. User interacts with View (clicks button, enters text)
2. View delegates to Presenter (calls presenter method)
3. Presenter handles interaction:
   - Validates input
   - Calls Model methods
   - Processes business logic
4. Presenter updates View (calls view methods)
5. View displays updated data
```

### Detailed Flow Example

**Scenario: User clicks "Save" button**

```
1. User clicks "Save" button in View
   ↓
2. View event handler calls: presenter.onSaveClicked()
   ↓
3. Presenter.onSaveClicked():
   - Gets data from View: view.getUserName(), view.getUserEmail()
   - Validates data
   - Updates Model: user.updateEmail(), user.validate()
   - Saves to repository: repository.save(user)
   - Updates View: view.setErrorMessage('Saved!')
   ↓
4. View displays success message
```

### Data Flow

**View → Presenter:**
- User input (getUserName(), getUserEmail())
- User actions (onSaveClicked(), onDeleteClicked())

**Presenter → View:**
- Display data (setUserName(), setUserEmail())
- Show errors (setErrorMessage())
- Show loading (showLoading())
- Clear UI (clearError())

**Presenter → Model:**
- Business operations (user.validate(), user.updateEmail())
- Data access (repository.findById(), repository.save())

**Model → Presenter:**
- Data results (User objects, validation results)
- Operation results (success/failure)

---

## 🎨 MVP Variations

### 1. Passive View

**Definition:**
- View is completely passive
- View has no logic at all
- Presenter updates View directly
- View only displays what Presenter tells it

**Characteristics:**
- Maximum testability
- View is very thin
- All logic in Presenter
- Presenter has more responsibility

**Example:**
```typescript
// Passive View - No logic, just display
export class PassiveUserView implements IUserView {
  setUserName(name: string): void {
    // Just set value, no validation
    this.nameInput.value = name;
  }

  getUserName(): string {
    // Just return value, no processing
    return this.nameInput.value;
  }
}

// Presenter does all validation
export class PassiveUserPresenter {
  onSaveClicked(): void {
    const name = this.view.getUserName();
    
    // All validation in Presenter
    if (!name || name.trim().length === 0) {
      this.view.setErrorMessage('Name required');
      return;
    }
    
    // All business logic in Presenter
    // ...
  }
}
```

### 2. Supervising Controller (Supervising Presenter)

**Definition:**
- View can contain some presentation logic
- View handles simple data binding
- Presenter supervises and handles complex logic
- Balance between Passive View and MVC

**Characteristics:**
- View has some logic
- Presenter handles complex cases
- More flexible
- Less testable than Passive View

**Example:**
```typescript
// Supervising View - Some presentation logic
export class SupervisingUserView implements IUserView {
  setUserName(name: string): void {
    // View can do simple formatting
    this.nameInput.value = name.trim();
  }

  getUserName(): string {
    // View can do simple processing
    return this.nameInput.value.trim();
  }
}

// Presenter handles complex logic
export class SupervisingUserPresenter {
  onSaveClicked(): void {
    const name = this.view.getUserName(); // Already trimmed by View
    
    // Presenter handles complex validation
    if (name.length < 3) {
      this.view.setErrorMessage('Name too short');
      return;
    }
    
    // Complex business logic in Presenter
    // ...
  }
}
```

---

## 🔀 MVP vs MVC vs MVVM

### The Core Difference: View Activity and Communication

**The fundamental question:** Who controls the View and how does data flow?

**MVP (Model-View-Presenter):**
- **View is COMPLETELY PASSIVE** - Like a display screen that only shows what it's told
- View implements an interface (IView) with methods like `setEmail()`, `showError()`
- **Presenter is ACTIVE** - It controls everything, explicitly calls View methods
- **No direct View-Model communication** - Everything goes through Presenter
- Example: `presenter.onSave()` → `view.setEmail(email)` → View displays

**MVC (Model-View-Controller):**
- **View is MORE ACTIVE** - It can observe the Model directly
- View subscribes to Model changes (Observer pattern)
- **Controller coordinates** but doesn't control View updates
- **View-Model can communicate directly** - View observes Model, Model notifies View
- Example: `controller.updateModel()` → `model.notify()` → View updates itself

**MVVM (Model-View-ViewModel):**
- **View is PASSIVE but REACTIVE** - It binds to ViewModel properties
- View uses declarative binding (e.g., `{{email}}` or `[(ngModel)]="email"`)
- **Framework handles synchronization** - No manual method calls
- **ViewModel exposes data** - View binds to it, framework syncs automatically
- Example: `viewModel.email = "new@email.com"` → Framework automatically updates View

### Visual Comparison

```
MVP Flow:
User → View → Presenter → Model
                ↓
            Presenter explicitly calls view.setEmail()
            View just displays (passive)

MVC Flow:
User → View → Controller → Model
                          ↓
                    Model.notify() → View updates itself
                    (View observes Model - more active)

MVVM Flow:
User → View (binding) → ViewModel → Model
                        ↓
                    Framework automatically syncs
                    View binds to ViewModel.email
                    (View is passive, framework is active)
```

### MVP vs MVC

| Aspect | MVP | MVC |
|--------|-----|-----|
| **View Activity** | **Completely passive** - Only displays what Presenter tells it | **More active** - Can observe Model, updates itself |
| **View-Model Communication** | **None** - All through Presenter | **Direct** - View observes Model (Observer pattern) |
| **Who Updates View** | **Presenter** - Explicitly calls `view.setEmail()` | **View itself** - Reacts to Model notifications |
| **Controller/Presenter Role** | **Active controller** - Handles all logic and View updates | **Coordinator** - Routes, delegates, but View updates itself |
| **Testability** | **High** - Presenter testable, View is just interface | **Medium** - View-Model coupling makes testing harder |
| **View Creation** | View creates Presenter | Controller creates View |
| **Code Example** | `presenter.updateView(); view.setEmail(email);` | `model.notify(); view.onModelChanged();` |

**Key Insight:** In MVP, the Presenter is like a puppeteer controlling the View. In MVC, the View is more like an observer that watches the Model and updates itself.

### MVP vs MVVM

| Aspect | MVP | MVVM |
|--------|-----|------|
| **View Activity** | **Passive** - Implements interface, displays only | **Passive but Reactive** - Binds to ViewModel properties |
| **Update Mechanism** | **Manual** - Presenter calls `view.setEmail(email)` | **Automatic** - Framework syncs when `viewModel.email` changes |
| **Synchronization** | **Explicit** - You write `view.setX()` for every update | **Declarative** - You bind `{{email}}` and framework handles it |
| **Code Amount** | **More code** - Manual View updates | **Less code** - Framework handles binding |
| **Control** | **Full control** - You decide exactly when View updates | **Less control** - Framework decides when to sync |
| **Framework Dependency** | **None** - Works everywhere | **Required** - Needs data binding framework |
| **Testability** | **High** - Test Presenter calls to View interface | **High** - Test ViewModel properties and commands |
| **Code Example** | `presenter.onSave() { view.setEmail(email); }` | `viewModel.email = email; // View auto-updates` |

**Key Insight:** MVP is like manually updating a display - you explicitly tell it what to show. MVVM is like connecting a display to a data source - it automatically shows whatever the source contains.

### MVP vs MVVM

| Aspect | MVP | MVVM |
|--------|-----|------|
| **View** | Passive, implements interface | Binds to ViewModel properties |
| **Presenter/ViewModel** | Handles interactions | Exposes data and commands |
| **Data Binding** | Manual (Presenter calls View) | Automatic (two-way binding) |
| **View Updates** | Presenter updates View | ViewModel notifies View |
| **Testability** | High | High |
| **Framework Support** | Works everywhere | Needs binding framework |

**Key Differences:**
- **MVP**: Manual View updates, explicit control
- **MVVM**: Automatic binding, declarative
- **MVP**: More control, more code
- **MVVM**: Less code, framework-dependent

### When to Choose Each

**Choose MVP When:**
- ✅ Need maximum testability
- ✅ Working without binding framework
- ✅ Want explicit control over View updates
- ✅ Building desktop applications
- ✅ Need clear separation of concerns

**Choose MVC When:**
- ✅ View needs to observe Model changes
- ✅ Using framework with MVC support
- ✅ Want flexible View-Model communication
- ✅ Building web applications with MVC frameworks

**Choose MVVM When:**
- ✅ Using binding framework (WPF, Angular, Vue)
- ✅ Want declarative data binding
- ✅ Building modern web/mobile apps
- ✅ Want less boilerplate code

---

## 💡 MVP Benefits

### 1. Testability

**Why Testable:**
- Presenter can be tested without View
- View interface can be mocked
- Model can be mocked
- Business logic isolated in Presenter

**Example:**
```typescript
// Test Presenter without real View
describe('UserPresenter', () => {
  it('should validate email', () => {
    const mockView: IUserView = {
      getUserEmail: () => 'invalid-email',
      setErrorMessage: jest.fn(),
      // ... other methods
    };

    const presenter = new UserPresenter(mockView);
    presenter.onSaveClicked();

    expect(mockView.setErrorMessage).toHaveBeenCalledWith('Valid email is required');
  });
});
```

### 2. Separation of Concerns

**Clear Boundaries:**
- Model: Business logic
- View: UI display
- Presenter: Coordination

**Benefits:**
- Easy to understand
- Easy to maintain
- Easy to modify
- Clear responsibilities

### 3. Reusability

**Model Reusability:**
- Same Model with different Presenters
- Same Model with different Views
- Business logic independent of UI

**Presenter Reusability:**
- Same Presenter with different Views
- Web View, Mobile View, Desktop View
- Same logic, different UI

### 4. Maintainability

**Easy to Change:**
- Change View without affecting Presenter
- Change Presenter without affecting View
- Change Model without affecting UI
- Isolated changes

---

## ⚠️ MVP Challenges

### 1. Boilerplate Code

**Problem:**
- Need to define View interface
- Need to implement all View methods
- Manual View updates
- More code than MVVM

**Solution:**
- Use code generation
- Create base classes
- Use TypeScript interfaces
- Accept trade-off for testability

### 2. Presenter Complexity

**Problem:**
- Presenter can become large
- Handles all interactions
- Can become god object

**Solution:**
- Split into multiple Presenters
- Use composition
- Delegate to services
- Keep Presenters focused

### 3. View Interface Size

**Problem:**
- View interface can become large
- Many methods to define
- Maintenance overhead

**Solution:**
- Group related methods
- Use nested interfaces
- Keep interfaces focused
- Document well

---

## ✅ Best Practices

### 1. View Interface Design

✅ **Do:**
- Keep interfaces focused
- Group related methods
- Use clear method names
- Document interface contracts

❌ **Don't:**
- Create god interfaces
- Mix concerns in interface
- Use vague method names
- Skip documentation

### 2. Presenter Design

✅ **Do:**
- Keep Presenters focused
- Delegate to services
- Handle one use case
- Test Presenters thoroughly

❌ **Don't:**
- Create god Presenters
- Put business logic in Presenter
- Mix concerns
- Skip testing

### 3. Model Design

✅ **Do:**
- Keep Models independent
- Put business logic in Model
- Use repositories for data access
- Validate in Model

❌ **Don't:**
- Put UI logic in Model
- Access View from Model
- Mix data access with business logic
- Skip validation

### 4. Testing

✅ **Do:**
- Test Presenters in isolation
- Mock View interfaces
- Mock Model dependencies
- Test all interaction paths

❌ **Don't:**
- Test with real Views
- Skip Presenter tests
- Test implementation details
- Ignore edge cases

---

## 🌍 Real-World Applications

### 1. Desktop Applications

**Windows Forms (C#):**
- MVP pattern common
- Passive View variation
- High testability
- Clear separation

**Example:**
```csharp
public interface IUserView {
    void SetUserName(string name);
    void SetUserEmail(string email);
    string GetUserName();
    string GetUserEmail();
}

public class UserPresenter {
    private IUserView view;
    private IUserRepository repository;

    public UserPresenter(IUserView view, IUserRepository repository) {
        this.view = view;
        this.repository = repository;
    }

    public async void OnSaveClicked() {
        var name = view.GetUserName();
        var email = view.GetUserEmail();
        // Handle save logic
    }
}
```

### 2. Web Applications

**React with MVP:**
- React components as Views
- Presenter handles logic
- High testability
- Clear separation

**Example:**
```typescript
// React View Component
export const UserView: React.FC<{ presenter: UserPresenter }> = ({ presenter }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    presenter.setView({
      setUserName: setName,
      setUserEmail: setEmail,
      getUserName: () => name,
      getUserEmail: () => email,
    });
  }, [presenter, name, email]);

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={() => presenter.onSaveClicked()}>Save</button>
    </div>
  );
};
```

### 3. Mobile Applications

**Android MVP:**
- Activities/Fragments as Views
- Presenters handle logic
- High testability
- Popular pattern

**Example:**
```java
public interface UserView {
    void showUserName(String name);
    void showUserEmail(String email);
    void showError(String message);
}

public class UserPresenter {
    private UserView view;
    private UserRepository repository;

    public void onSaveClicked(String name, String email) {
        // Handle save logic
        if (name.isEmpty()) {
            view.showError("Name required");
            return;
        }
        // Save user
    }
}
```

---

## 📊 MVP Architecture Diagram

```
┌─────────────┐
│    View     │
│  (Passive)  │
│             │
│ - Display   │
│ - Input     │
│ - Events    │
└──────┬──────┘
       │
       │ Implements
       │ IView interface
       │
       ▼
┌─────────────┐
│  Presenter  │
│  (Active)   │
│             │
│ - Logic     │
│ - Control   │
│ - Updates   │
└──────┬──────┘
       │
       │ Uses
       │
       ▼
┌─────────────┐
│    Model    │
│             │
│ - Data      │
│ - Business  │
│ - Rules     │
└─────────────┘

Flow:
View → Presenter → Model
Model → Presenter → View
(No direct View ↔ Model)
```

---

## 🎓 Summary

### Key Takeaways

1. **MVP** separates application into Model, View, Presenter
2. **View is Passive** - Only displays data, delegates to Presenter
3. **Presenter is Active** - Handles all interactions and logic
4. **No Direct View-Model Communication** - All through Presenter
5. **High Testability** - Presenter can be tested without View
6. **Two Variations** - Passive View and Supervising Controller
7. **Clear Separation** - Each component has clear responsibilities
8. **Manual Updates** - Presenter explicitly updates View

### Best Practices Summary

- Keep View interfaces focused
- Test Presenters thoroughly
- Keep Presenters focused on one use case
- Put business logic in Model
- Use Passive View for maximum testability
- Document View interfaces well

### Next Steps

After understanding MVP, consider:
- **MVVM Pattern** - Automatic data binding alternative
- **MVC Pattern** - Observer-based alternative
- **Testing Patterns** - How to test MVP applications
- **Dependency Injection** - Managing MVP dependencies

---

## 📚 Additional Resources

**Original Concept:**
- Taligent - Originators of MVP pattern
- Derived from MVC pattern

**Related Patterns:**
- Model-View-Controller (MVC)
- Model-View-ViewModel (MVVM)
- Presentation Model
- Supervising Controller

**Frameworks:**
- Android MVP libraries
- Windows Forms MVP
- Web MVP implementations

---

