https://en.wikipedia.org/wiki/Load_balancing_(computing)

## Related Summaries & Subjects
- [Internet Information Services](../summaries/2026-01-04-internet-information-services.md) - IIS includes load balancing features (ARR, Web Farm Framework)
- [Event-Driven Architecture](../lessons-of-the-day/2026-01-07-event-driven-architecture.md) - Scalable architectures that benefit from load balancing
- [Microservices Architecture](../lessons-of-the-day/2025-12-13-patterns-architectures.md) - Distributed systems that require load balancing

# Load Balancing - Summary

## What is Load Balancing?

**Load balancing** is the process of distributing incoming requests or tasks across multiple servers or computing resources to optimize performance, prevent overload, and ensure high availability. Think of it like a restaurant host who seats customers at different tables to ensure no single waiter gets overwhelmed - instead of one server handling all requests, the load is spread evenly across multiple servers.

## Basic Summary

### Core Problem It Solves

**Without Load Balancing:**
- One server handles all requests → becomes overwhelmed
- Single point of failure → if server crashes, everything goes down
- Uneven resource usage → some servers idle while others are overloaded
- Poor user experience → slow response times, timeouts

**With Load Balancing:**
- Requests distributed across multiple servers → better performance
- High availability → if one server fails, others continue serving
- Efficient resource usage → all servers utilized evenly
- Better user experience → faster responses, no single bottleneck

### How It Works (Simple Version)

1. **Load Balancer** sits between clients and servers
2. **Receives requests** from clients (web browsers, apps, etc.)
3. **Decides which server** should handle each request
4. **Forwards request** to chosen server
5. **Returns response** from server back to client
6. **Monitors server health** and removes failed servers from rotation

### Common Algorithms

**Round-Robin:**
- Distributes requests sequentially: Server 1, Server 2, Server 3, then back to Server 1
- Simple and fair, but doesn't consider server load

**Least Connections:**
- Sends new requests to server with fewest active connections
- Better for long-lived connections (like database connections)

**Weighted Round-Robin:**
- Like round-robin, but stronger servers get more requests
- Useful when servers have different capabilities

**IP Hash:**
- Uses client's IP address to determine which server handles request
- Ensures same client always goes to same server (session persistence)

**Least Response Time:**
- Sends requests to server with fastest response time
- Adapts to current server performance

### Real-World Analogy

Imagine a busy coffee shop:
- **Without load balancing**: One barista handles all orders → long lines, frustrated customers
- **With load balancing**: A manager (load balancer) directs customers to available baristas → faster service, happy customers, and if one barista gets sick, others can handle the work

### Why It Matters

- **Scalability**: Handle more traffic by adding more servers
- **Reliability**: System keeps running even if servers fail
- **Performance**: Faster response times by distributing load
- **Cost Efficiency**: Better utilization of resources
- **User Experience**: Consistent, fast service even under high load

### Common Use Cases

- **Web Applications**: Distributing HTTP/HTTPS requests across web servers
- **API Services**: Balancing API calls across multiple backend servers
- **Database Clusters**: Distributing database queries across replicas
- **Content Delivery**: Routing requests to nearest or fastest CDN edge server
- **Microservices**: Distributing requests across service instances

## Extended Summary

### Static vs Dynamic Algorithms

**Static Load Balancing:**
- Decisions made **before** system runs
- Doesn't consider current server state or load
- **Advantages**: Simple, predictable, no overhead
- **Disadvantages**: Can't adapt to changing conditions
- **Examples**: Round-robin, weighted round-robin, IP hash
- **Use When**: Tasks are uniform, system load is predictable

**Dynamic Load Balancing:**
- Decisions made **during** runtime
- Considers current server load, response times, available resources
- **Advantages**: Adapts to real-time conditions, more efficient
- **Disadvantages**: Requires monitoring overhead, more complex
- **Examples**: Least connections, least response time, CPU-based routing
- **Use When**: Tasks vary in size, system load is unpredictable

### Load Balancing Approaches

**1. Client-Side Load Balancing:**
- Client application chooses which server to connect to
- **Round-Robin DNS**: DNS returns multiple IP addresses, client picks one
- **Client Library**: Application code contains logic to select server
- **Advantages**: No single point of failure, simple setup
- **Disadvantages**: Less control, clients may make poor choices

**2. Server-Side Load Balancing:**
- Dedicated load balancer (hardware or software) distributes requests
- **Hardware Load Balancers**: Physical devices (F5, Citrix)
- **Software Load Balancers**: Nginx, HAProxy, AWS ELB, Azure Load Balancer
- **Advantages**: Centralized control, advanced features, better monitoring
- **Disadvantages**: Single point of failure (unless redundant), additional cost

**3. DNS-Based Load Balancing:**
- DNS server returns different IP addresses for same domain name
- **Round-Robin DNS**: Rotates through server IPs
- **Geographic DNS**: Returns IP based on client location
- **Advantages**: Simple, no additional infrastructure
- **Disadvantages**: Limited control, DNS caching issues, no health checks

### Load Balancer Features

**Health Checking:**
- Monitors server health (ping, HTTP checks, custom probes)
- Automatically removes unhealthy servers from rotation
- Re-adds servers when they recover
- **Types**: Active (proactive checks) vs Passive (monitor responses)

**Session Persistence (Sticky Sessions):**
- Ensures same client always goes to same server
- **Why Needed**: Some applications store session data on server
- **Methods**: Cookie-based, IP-based, SSL session ID
- **Trade-off**: Can create uneven load distribution

**SSL/TLS Termination:**
- Load balancer handles SSL encryption/decryption
- Reduces CPU load on backend servers
- Enables centralized certificate management
- **Consideration**: Traffic between balancer and servers may be unencrypted (unless re-encrypted)

**Content-Based Routing:**
- Routes requests based on URL path, headers, or content
- **Example**: `/api/*` goes to API servers, `/static/*` goes to static file servers
- Enables specialized server pools for different request types

**Connection Draining (Graceful Shutdown):**
- Stops sending new requests to server being removed
- Allows existing connections to complete
- Prevents user errors during server maintenance

### Load Balancing Levels

**Layer 4 (Transport Layer) Load Balancing:**
- Works with TCP/UDP protocols
- Routes based on IP address and port
- **Advantages**: Fast, simple, works with any protocol
- **Disadvantages**: Can't inspect application content
- **Use For**: High throughput, simple routing needs

**Layer 7 (Application Layer) Load Balancing:**
- Works with HTTP/HTTPS protocols
- Can inspect request content (URL, headers, cookies)
- **Advantages**: Content-aware routing, SSL termination, advanced features
- **Disadvantages**: More CPU intensive, protocol-specific
- **Use For**: Web applications, API routing, content-based decisions

### High Availability & Failover

**Active-Passive (Failover):**
- One active load balancer, one standby
- Standby takes over if active fails
- **Advantages**: Simple, guaranteed capacity
- **Disadvantages**: Wasted resources (standby idle)

**Active-Active:**
- Multiple load balancers share the load
- All active simultaneously
- **Advantages**: Better resource utilization, higher capacity
- **Disadvantages**: More complex configuration

**Server Health Monitoring:**
- **Health Checks**: Regular probes to verify server availability
- **Automatic Removal**: Unhealthy servers removed from pool
- **Automatic Recovery**: Servers re-added when healthy
- **Graceful Degradation**: System continues with fewer servers

### Advanced Techniques

**Geographic Load Balancing:**
- Routes requests to nearest data center or server
- Reduces latency by serving from closest location
- **DNS-Based**: Different IPs for different regions
- **Anycast**: Same IP address, routes to nearest location

**Adaptive Load Balancing:**
- Machine learning algorithms predict best server
- Considers historical performance, current load, predicted load
- Continuously learns and adapts

**Power of Two Choices:**
- Randomly selects two servers, picks the better one
- Simple but effective algorithm
- Used by Nginx, HAProxy
- **Advantage**: Good balance between simplicity and performance

### Load Balancing in Different Contexts

**Web Services:**
- HTTP/HTTPS request distribution
- Web server load balancing (Apache, Nginx, IIS)
- Application server load balancing (Tomcat, Node.js clusters)

**Database Load Balancing:**
- Read replica distribution
- Write operations typically go to primary
- Read operations distributed across replicas
- **Challenge**: Maintaining data consistency

**Microservices:**
- Service discovery integration (Consul, Eureka, Kubernetes)
- Automatic load balancing as services scale
- Health checks and circuit breakers

**Container Orchestration:**
- Kubernetes: Built-in load balancing via Services
- Docker Swarm: Automatic load balancing
- Service mesh: Advanced load balancing with Istio, Linkerd

### Performance Considerations

**Latency:**
- Load balancer adds small latency (usually <1ms)
- Layer 7 balancers add more latency than Layer 4
- Geographic distribution can reduce latency

**Throughput:**
- Hardware balancers: Very high throughput (millions of requests/second)
- Software balancers: High throughput (hundreds of thousands/second)
- Can become bottleneck if not properly sized

**Scalability:**
- Horizontal scaling: Add more servers behind balancer
- Vertical scaling: Increase balancer capacity
- Auto-scaling: Automatically add/remove servers based on load

### Common Challenges

**Session Management:**
- Problem: User sessions stored on specific server
- Solutions: Sticky sessions, shared session store, stateless design

**Uneven Load Distribution:**
- Problem: Some algorithms create hotspots
- Solutions: Better algorithms, health-aware routing, capacity planning

**Configuration Complexity:**
- Problem: Managing multiple servers and rules
- Solutions: Infrastructure as Code, centralized configuration, automation

**Monitoring & Debugging:**
- Problem: Hard to trace requests across servers
- Solutions: Request IDs, distributed tracing, comprehensive logging

## Key Takeaway

Load balancing is essential for building scalable, reliable, and performant systems. By distributing work across multiple resources, it prevents bottlenecks, ensures high availability, and enables systems to handle growth. Whether using simple round-robin or sophisticated adaptive algorithms, effective load balancing is a cornerstone of modern distributed computing.

## Related Subjects

- **High Availability & Failover**: Understanding redundancy, failover mechanisms, and disaster recovery strategies
- **Distributed Systems**: How load balancing fits into larger distributed system architectures, consistency, and coordination

