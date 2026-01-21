https://en.wikipedia.org/wiki/Multiplexing

## Related Summaries & Subjects
- [Network Protocols](../lessons-of-the-day/) - Multiplexing is fundamental to how network protocols share communication channels
- [Cellular Networks](../lessons-of-the-day/) - Cellular networks use various multiplexing techniques (TDMA, CDMA, OFDMA) to serve multiple users
- [Fiber Optic Communications](../lessons-of-the-day/) - Wavelength Division Multiplexing (WDM) enables high-capacity fiber optic networks

# Multiplexing - Summary

---

## 📚 Basic Summary

### What is Multiplexing?

**Multiplexing** is a technique that allows multiple signals or data streams to be transmitted simultaneously over a single communication channel or physical medium. It combines multiple input signals into one composite signal for transmission, then separates them at the receiving end.

**Simple Analogy:**
- Like a highway with multiple lanes - many cars (signals) travel on the same road (channel) at the same time
- Like a radio station broadcasting multiple programs on different frequencies - one radio tower (channel) carries many stations (signals)
- Like a postal service sorting mail - multiple letters (data) travel in the same truck (channel) but are delivered to different addresses

### Key Concepts

**1. Purpose:**
- Efficient use of communication channels
- Share expensive infrastructure
- Increase bandwidth utilization
- Reduce costs

**2. Basic Process:**
- **Multiplexing (MUX):** Combine multiple signals into one
- **Transmission:** Send composite signal over channel
- **Demultiplexing (DEMUX):** Separate signals at receiving end

**3. Types of Multiplexing:**
- **Space-Division Multiplexing (SDM)** - Separate physical channels
- **Frequency-Division Multiplexing (FDM)** - Different frequencies
- **Time-Division Multiplexing (TDM)** - Different time slots
- **Wavelength-Division Multiplexing (WDM)** - Different wavelengths (light)
- **Polarization-Division Multiplexing** - Different polarizations
- **Code-Division Multiplexing (CDM)** - Different codes
- **Statistical Multiplexing** - Dynamic allocation

### Real-World Examples

**1. Cable TV:**
- Multiple TV channels transmitted on one cable
- Each channel uses different frequency
- TV tuner selects desired frequency

**2. Internet (Ethernet):**
- Multiple devices share same network cable
- Time division or statistical multiplexing
- Network switch routes data to correct device

**3. Cellular Networks:**
- Multiple phone calls on same frequency band
- Time division (TDMA) or code division (CDMA)
- Base station manages multiple connections

**4. Fiber Optic Networks:**
- Multiple data streams on one fiber
- Wavelength division multiplexing (WDM)
- Different colors of light carry different data

### Why It Matters

- **Efficient Resource Use**: Share expensive communication infrastructure among many users
- **Cost Reduction**: Lower per-user costs by sharing physical medium
- **Scalability**: Support more users without proportional infrastructure increase
- **Foundation of Modern Communications**: Powers internet, TV, phone, and cellular networks
- **Bandwidth Optimization**: Maximize utilization of available bandwidth

---

## 🔬 Extended Summary

### History & Development

**1870s: Telegraphy Origins**
- Multiplexing originated in telegraphy in the 1870s
- Early methods allowed multiple telegraph signals on one wire
- Foundation for modern multiplexing techniques

**1910: Telephone Carrier Multiplexing**
- George Owen Squier credited with development of telephone carrier multiplexing
- Enabled multiple telephone calls on single wire
- Revolutionized telephone communications

**Modern Era:**
- Digital multiplexing (TDM) developed for digital communications
- WDM developed for fiber optic networks
- Statistical multiplexing for packet-switched networks
- Now widely applied in all forms of communications

### Space-Division Multiplexing (SDM)

**Definition:** Uses separate physical channels or conductors for each signal.

**Wired Communication:**
- Separate point-to-point electrical conductors
- Example: Stereo audio cable (left/right channels on separate wires)
- Multi-pair telephone cable
- Switched star networks (telephone access networks)
- Switched Ethernet networks
- Mesh networks

**Wireless Communication:**
- Multiple antenna elements forming phased array
- MIMO (Multiple-Input Multiple-Output)
- SIMO (Single-Input Multiple-Output)
- MISO (Multiple-Input Single-Output)
- Different antennas provide different multi-path signatures
- Digital signal processing separates signals

**Example:**
- IEEE 802.11g router with k antennas = k multiplexed channels
- Each channel: 54 Mbit/s peak bit rate
- Total capacity: k × 54 Mbit/s

**Applications:**
- Stereo audio systems
- Multi-pair telephone cables
- MIMO wireless systems
- Phased array antennas

### Frequency-Division Multiplexing (FDM)

**How It Works:**
- Each signal assigned different frequency range
- Signals combined into one composite signal
- Transmitted simultaneously
- Receiver filters to extract desired frequency

**Characteristics:**
- ✅ Inherently analog technology
- ✅ Signals are electrical signals
- ✅ Continuous transmission
- ✅ Each signal has distinct frequency range
- ✅ Simple to implement
- ❌ Wastes bandwidth if signal not active
- ❌ Requires guard bands between frequencies

**Example:**
```
Signal 1: 0-4 kHz   (Voice channel 1)
Signal 2: 4-8 kHz   (Voice channel 2)
Signal 3: 8-12 kHz  (Voice channel 3)
Composite: 0-12 kHz (All channels together)
```

**Applications:**
- Traditional radio and television broadcasting (terrestrial, mobile, satellite)
- Cable television (multiple channels on one cable)
- Analog telephone carrier systems
- Satellite communications

**How It Works:**
- Each input signal spectrum shifted to distinct frequency range
- Signals combined into composite signal
- Receivers tune to appropriate frequency (channel) to access desired signal
- Only one cable reaches customer, but service provider sends multiple channels simultaneously

**WDM Variant:**
- Wavelength-Division Multiplexing (WDM) is variant used in optical communications
- Uses different wavelengths (colors) of light instead of frequencies
- Same principle, different medium (light vs electrical)

### Time-Division Multiplexing (TDM)

**How It Works:**
- Signals take turns using channel
- Each signal gets time slot
- Rapid switching between signals
- Appears simultaneous to users

**Characteristics:**
- ✅ Digital signals
- ✅ Efficient bandwidth use
- ✅ Synchronized timing required
- ✅ Fixed or variable time slots
- ✅ Circuit mode (constant bandwidth)
- ❌ Requires synchronization
- ❌ Wastes slots if signal inactive (synchronous TDM)

**Types:**

**A. Synchronous TDM:**
- Fixed time slots
- Each signal gets same slot size
- Predictable timing
- Wastes slots if signal inactive

**B. Statistical TDM (STDM):**
- Dynamic time slot allocation
- Only active signals get slots
- More efficient
- Requires addressing

**Example:**
```
Time Slot 1: Signal A data
Time Slot 2: Signal B data
Time Slot 3: Signal C data
Time Slot 4: Signal A data (next)
...repeats
```

**Applications:**
- Digital telephone systems (T1/E1)
- ISDN
- SONET/SDH
- Digital TV broadcasting

### Polarization-Division Multiplexing

**Definition:** Uses different polarizations (horizontal/vertical or clockwise/counterclockwise) to separate signals.

**How It Works:**
- Each signal uses different polarization
- Signals transmitted simultaneously
- Receiver uses polarization to separate signals
- Used in wireless and optical communications

**Applications:**
- Wireless communications (alternating polarization)
- Satellite communications
- Optical fiber communications
- MIMO systems

### Orbital Angular Momentum Multiplexing

**Definition:** Uses orbital angular momentum of electromagnetic waves to multiplex signals.

**How It Works:**
- Different signals use different orbital angular momentum modes
- Advanced multiplexing technique
- Research and experimental applications
- Potential for very high capacity

**Applications:**
- Experimental optical communications
- Research applications
- Future high-capacity systems

### Wavelength-Division Multiplexing (WDM)

**How It Works:**
- Multiple light signals on one fiber
- Each signal uses different wavelength (color)
- Combined into one fiber
- Separated by wavelength at receiver

**Characteristics:**
- ✅ Very high capacity
- ✅ Optical fiber technology
- ✅ Multiple wavelengths simultaneously
- ✅ Long-distance transmission
- ❌ Requires optical equipment

**Types:**

**A. Dense WDM (DWDM):**
- Many wavelengths (40-160+)
- Close spacing (0.8 nm or less)
- Very high capacity
- Long-haul networks

**B. Coarse WDM (CWDM):**
- Fewer wavelengths (8-18)
- Wider spacing (20 nm)
- Lower cost
- Metro networks

**Example:**
```
Wavelength 1 (1310 nm): Data stream 1
Wavelength 2 (1550 nm): Data stream 2
Wavelength 3 (1490 nm): Data stream 3
All transmitted on same fiber simultaneously
```

**Applications:**
- Fiber optic networks
- Internet backbone
- Long-distance telecommunications
- Data centers

### Code-Division Multiplexing (CDM)

**How It Works:**
- Digital bit streams transferred over analog channel
- Uses spread spectrum techniques:
  - **Frequency-Hopping Spread Spectrum (FHSS)** - Signal hops between frequencies
  - **Direct-Sequence Spread Spectrum (DSSS)** - Signal spread across frequency band
- Each signal encoded with unique code
- All signals transmitted simultaneously
- Same frequency, same time
- Receiver uses code to extract signal

**Characteristics:**
- ✅ All signals share same frequency
- ✅ Spread spectrum technology
- ✅ Resistant to interference
- ✅ Secure (code acts as key)
- ✅ Can transfer digital over analog channel
- ❌ Complex implementation

**Example:**
```
Signal A: Code 1 (spread spectrum)
Signal B: Code 2 (spread spectrum)
Signal C: Code 3 (spread spectrum)
All transmitted at same time, same frequency
Receiver uses code to extract desired signal
```

**Applications:**
- CDMA cellular networks
- GPS systems
- Wireless LAN (some variants)
- Military communications

### Statistical Multiplexing

**Definition:** Variable bit rate digital bit streams transferred efficiently over fixed bandwidth channel.

**How It Works:**
- Asynchronous mode time-domain multiplexing
- Form of time-division multiplexing
- Dynamic bandwidth allocation
- Only active signals get bandwidth
- More efficient than fixed allocation
- Requires addressing/routing

**Characteristics:**
- ✅ Efficient bandwidth use
- ✅ Handles variable traffic
- ✅ Packet-based (packet switching)
- ✅ Variable bandwidth allocation
- ✅ Requires buffering
- ❌ Variable delay possible
- ❌ Requires addressing in packets

**Related Techniques:**
- **Packet Switching** - Statistical multiplexing foundation
- **Dynamic TDMA** - Dynamic time slot allocation
- **OFDMA** - Orthogonal Frequency-Division Multiple Access
- **SC-FDM** - Single-Carrier Frequency-Division Multiplex

**Applications:**
- Internet (IP networks)
- Ethernet
- Packet-switched networks
- Modern data networks
- Statistical time-division multiplexing (STDM)

### Multiple Access Methods

**Definition:** Techniques that allow multiple users to share communication channel.

**Related to Multiplexing:**
- Multiplexing: Combining signals for transmission
- Multiple Access: Allowing multiple users to access channel
- Similar techniques, different perspective

**Common Methods:**
- **TDMA** (Time Division Multiple Access) - Users share time slots
- **FDMA** (Frequency Division Multiple Access) - Users share frequency bands
- **CDMA** (Code Division Multiple Access) - Users share codes
- **OFDMA** (Orthogonal Frequency Division Multiple Access) - Users share subcarriers
- **SDMA** (Space Division Multiple Access) - Users share spatial channels

### Inverse Multiplexing

**Definition:** Opposite of multiplexing - breaks one data stream into several streams.

**How It Works:**
- One data stream split into multiple streams
- Streams transferred simultaneously over several channels
- Original data stream recreated at receiving end

**Purpose:**
- Use multiple low-speed channels for high-speed data
- Aggregate bandwidth from multiple channels
- Cost-effective alternative to single high-speed channel

**Applications:**
- Bonding multiple DSL lines
- Aggregating multiple T1 lines
- Using multiple network connections

### I/O Multiplexing (Computing)

**Definition:** In computing, refers to processing multiple input/output events from single event loop.

**How It Works:**
- Single process handles multiple I/O operations
- System calls: `poll()`, `select()` (Unix)
- Event loop monitors multiple file descriptors
- Efficient handling of multiple connections

**Applications:**
- Network servers (handle multiple clients)
- Event-driven programming
- Asynchronous I/O
- High-performance network applications

**Example:**
```typescript
// I/O Multiplexing in Node.js
const server = net.createServer();
server.on('connection', (socket) => {
  // Handle multiple connections simultaneously
});
// Single event loop handles all connections
```

---

## 🔍 Technical Details

### Multiplexer (MUX)

**Function:**
- Combines multiple input signals
- Creates composite signal
- Transmits over single channel

**Types:**
- **Analog MUX:** Combines analog signals (FDM)
- **Digital MUX:** Combines digital signals (TDM)
- **Optical MUX:** Combines light signals (WDM)

### Demultiplexer (DEMUX)

**Function:**
- Receives composite signal
- Separates into individual signals
- Routes to correct output

**Types:**
- **Analog DEMUX:** Filters by frequency (FDM)
- **Digital DEMUX:** Routes by time slot (TDM)
- **Optical DEMUX:** Separates by wavelength (WDM)

### Multiplexing Hierarchy

**Telecommunications:**
- **DS0:** 64 kbps (single voice channel)
- **DS1 (T1):** 1.544 Mbps (24 DS0 channels)
- **DS3 (T3):** 44.736 Mbps (28 T1 channels)
- **OC-1:** 51.84 Mbps (SONET)
- **OC-48:** 2.488 Gbps (48 × OC-1)

### Application Areas

**1. Telegraphy:**
- Early application of multiplexing
- Multiple telegraph signals on one wire
- Foundation of multiplexing technology

**2. Telephony:**
- Multiple telephone calls on one wire
- Carrier multiplexing (FDM)
- Digital multiplexing (TDM) for digital telephony
- T1/E1 lines, ISDN

**3. Video Processing:**
- Multiple video channels
- Digital TV broadcasting
- Video streaming
- Cable TV systems

**4. Digital Broadcasting:**
- Digital TV (DVB, ATSC)
- Digital radio (DAB, HD Radio)
- Multiple channels on one frequency
- Efficient spectrum use

**5. Analog Broadcasting:**
- AM/FM radio (FDM)
- Analog TV (FDM)
- Multiple stations on different frequencies
- Traditional broadcasting

---

## 💡 When to Use Each Type

### Use FDM When:
- ✅ Analog signals
- ✅ Continuous transmission needed
- ✅ Simple implementation
- ✅ Radio/TV broadcasting
- Example: AM/FM radio, cable TV

### Use TDM When:
- ✅ Digital signals
- ✅ Predictable traffic
- ✅ Synchronized systems
- ✅ Telephone networks
- Example: T1/E1 lines, ISDN

### Use WDM When:
- ✅ Fiber optic networks
- ✅ Very high capacity needed
- ✅ Long-distance transmission
- ✅ Multiple data streams
- Example: Internet backbone, data centers

### Use CDM When:
- ✅ Wireless communications
- ✅ Interference resistance needed
- ✅ Security important
- ✅ Multiple users same frequency
- Example: CDMA cellular, GPS

### Use Statistical Multiplexing When:
- ✅ Packet-switched networks
- ✅ Variable traffic
- ✅ Efficient bandwidth use
- ✅ Internet protocols
- Example: Ethernet, IP networks

---

## 🌍 Real-World Applications

### 1. Internet Backbone

**Technology:** WDM on fiber optic cables
- Multiple wavelengths on one fiber
- Each wavelength carries multiple TDM channels
- Very high capacity (terabits per second)
- Long-distance transmission

### 2. Cable Internet

**Technology:** FDM
- Different frequencies for different services
- TV channels, internet, phone on same cable
- Frequency division separates services

### 3. Cellular Networks

**Technology:** TDM (TDMA) or CDM (CDMA)
- Multiple users share same frequency
- Time slots or codes separate users
- Base station manages multiplexing

### 4. Satellite Communications

**Technology:** FDM or TDM
- Multiple channels on one transponder
- Frequency or time division
- Efficient use of satellite capacity

### 5. Ethernet Networks

**Technology:** Statistical multiplexing
- Multiple devices share network
- Packets dynamically allocated
- Switch/router manages multiplexing

---

## ⚠️ Challenges and Limitations

### 1. Bandwidth Limitations

**Issue:**
- Total bandwidth is limited
- More signals = less bandwidth per signal
- Need to balance capacity and quality

**Solution:**
- Efficient multiplexing techniques
- Compression
- Better modulation

### 2. Synchronization (TDM)

**Issue:**
- Requires precise timing
- Clock synchronization needed
- Timing errors cause data loss

**Solution:**
- Synchronization protocols
- Clock recovery
- Buffer management

### 3. Crosstalk (FDM)

**Issue:**
- Signals interfere with each other
- Frequency leakage
- Filter quality important

**Solution:**
- Guard bands between frequencies
- High-quality filters
- Proper frequency spacing

### 4. Complexity

**Issue:**
- More complex than single channel
- Requires multiplexing equipment
- Higher cost

**Solution:**
- Standardized protocols
- Integrated circuits
- Cost-effective solutions

---

## ✅ Best Practices

### 1. Choose Right Type

✅ **Do:**
- Match multiplexing type to application
- Consider signal type (analog/digital)
- Consider bandwidth requirements
- Consider distance

❌ **Don't:**
- Use wrong type for application
- Over-engineer simple needs
- Ignore signal characteristics

### 2. Efficient Allocation

✅ **Do:**
- Use statistical multiplexing for variable traffic
- Allocate bandwidth efficiently
- Monitor and adjust allocation
- Use compression when possible

❌ **Don't:**
- Waste bandwidth
- Over-allocate resources
- Ignore traffic patterns

### 3. Quality Management

✅ **Do:**
- Monitor signal quality
- Use error correction
- Maintain synchronization
- Test regularly

❌ **Don't:**
- Ignore quality degradation
- Skip error checking
- Neglect maintenance

---

## 🔀 Multiplexing vs Other Concepts

### Multiplexing vs Switching

**Multiplexing:**
- Combines signals for transmission
- Shares single channel
- Point-to-point or broadcast
- Physical layer concept

**Switching:**
- Routes signals to destinations
- Connects multiple channels
- Point-to-point connections
- Network layer concept

**Key Difference:** Multiplexing combines, switching routes.

### Multiplexing vs Modulation

**Multiplexing:**
- Combines multiple signals
- Shares channel
- Multiple signals simultaneously

**Modulation:**
- Encodes signal on carrier
- Single signal
- Transmits signal

**Key Difference:** Multiplexing combines signals, modulation encodes signal.

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Efficiency**
- Better bandwidth utilization
- Share expensive infrastructure
- Reduce costs
- Support more users

✅ **Scalability**
- Add more signals easily
- Flexible capacity
- Grow with demand
- Standardized approach

✅ **Cost Savings**
- Share physical medium
- Reduce infrastructure
- Lower per-user cost
- Economies of scale

### Trade-offs

❌ **Complexity**
- More complex than single channel
- Requires multiplexing equipment
- Synchronization needed
- Higher initial cost

❌ **Quality Considerations**
- Signal quality may degrade
- Crosstalk possible
- Timing issues
- Need for error correction

---

## 🎓 Summary

### Key Takeaways

1. **Multiplexing** combines multiple signals for transmission over one channel
2. **FDM** uses different frequencies for each signal
3. **TDM** uses different time slots for each signal
4. **WDM** uses different wavelengths (colors) for each signal
5. **CDM** uses different codes for each signal
6. **Statistical Multiplexing** dynamically allocates bandwidth
7. **Efficiency** - Better use of communication channels
8. **Applications** - Internet, TV, phone, cellular networks

### Common Uses

- **Internet:** WDM on fiber, statistical multiplexing on Ethernet
- **TV/Radio:** FDM for multiple channels
- **Telephone:** TDM for multiple calls
- **Cellular:** TDM or CDM for multiple users
- **Satellite:** FDM or TDM for multiple channels

### Next Steps

After understanding Multiplexing, consider:
- **Network Protocols** - How multiplexing is used in protocols
- **Fiber Optic Technology** - WDM deep dive
- **Cellular Networks** - TDMA, CDMA, OFDMA
- **Network Architecture** - How networks use multiplexing

---

## 🎯 Key Takeaways

**For Beginners:**
- Multiplexing allows multiple signals to share one communication channel
- Different types: FDM (frequencies), TDM (time slots), WDM (wavelengths), CDM (codes)
- Makes communication more efficient and cost-effective
- Used everywhere: internet, TV, phone, cellular networks
- Multiplexer (MUX) combines signals, Demultiplexer (DEMUX) separates them

**For Experienced Developers:**
- Multiplexing divides channel capacity into logical channels
- Statistical multiplexing is foundation of packet-switched networks
- WDM enables terabit-capacity fiber optic networks
- MIMO uses space-division multiplexing for wireless
- I/O multiplexing (poll/select) enables efficient event-driven servers
- Inverse multiplexing aggregates multiple channels for higher bandwidth
- Choose multiplexing type based on signal type, traffic pattern, and requirements

---

## 🔗 Related Subjects

- **Network Protocols**: Understanding how TCP/IP and other protocols use multiplexing
- **Cellular Network Technologies**: TDMA, CDMA, OFDMA multiplexing in mobile networks
- **Fiber Optic Communications**: WDM technology for high-capacity optical networks
- **Channel Access Methods**: How multiple access relates to multiplexing

---

*Summary created: 2026-01-18*

*Source: [Wikipedia - Multiplexing](https://en.wikipedia.org/wiki/Multiplexing)*

---

