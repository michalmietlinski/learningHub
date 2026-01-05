https://en.wikipedia.org/wiki/Internet_Information_Services

## Related Summaries & Subjects
- [Forward Secrecy](../summaries/2026-01-04-forward-secrecy.md) - HTTPS/TLS security features used by IIS
- [ICMPv6](../lessons-of-the-day/2025-12-22-icmpv6.md) - Network protocols and communication

# Internet Information Services (IIS) - Summary

## What is IIS?

**Internet Information Services (IIS)** is Microsoft's web server software that runs on Windows. Think of it as the "restaurant" that serves web pages, files, and applications to people browsing the internet - but instead of food, it serves HTML pages, images, and data over HTTP/HTTPS.

## Basic Summary

### Core Purpose

IIS is a **web server** - software that:
- Listens for incoming web requests (when someone visits your website)
- Serves web pages, files, and applications
- Handles protocols like HTTP, HTTPS, FTP, SMTP
- Runs on Windows Server and Windows desktop editions

### Key Features

**Protocol Support:**
- **HTTP/HTTPS**: Web pages and secure connections
- **HTTP/2, HTTP/3**: Modern, faster web protocols
- **FTP/FTPS**: File transfers
- **SMTP**: Email sending
- **NNTP**: Newsgroups

**Built for Windows:**
- Integrated with Windows authentication
- Uses Windows security model
- Supports .NET Framework applications
- Native Windows performance optimizations

### Evolution Highlights

**Early Versions (IIS 1.0-5.0):**
- Started as free add-on for Windows NT 3.51 (1995)
- Included Active Server Pages (ASP) for dynamic content
- Limited to 10 simultaneous connections on client Windows

**Modern Versions (IIS 7.0+):**
- Complete rewrite with modular architecture
- Reduced attack surface (only install what you need)
- Better performance and security
- PowerShell management
- Support for HTTP/2, HTTP/3, HSTS

**Current Version (IIS 10.0):**
- HTTP/2 and HTTP/3 support
- Container support (Windows containers)
- Enhanced security features
- REST management API

### Why It Matters

- **Windows Ecosystem**: Primary web server for Windows-based hosting
- **Enterprise Integration**: Works seamlessly with Active Directory, SQL Server, .NET
- **Security**: Regular updates, modular design reduces vulnerabilities
- **Performance**: Optimized for Windows Server, handles high traffic loads
- **Developer-Friendly**: Supports ASP.NET, PHP, Node.js, and more

### Real-World Usage

- Hosting corporate websites and intranets
- Running ASP.NET web applications
- Serving as reverse proxy or load balancer
- Hosting REST APIs and web services
- File sharing via FTP/FTPS

## Extended Summary

### Architecture & Design

**Modular Architecture (IIS 7.0+):**
- **Core Server**: Minimal base installation
- **Modules**: Install only needed features (ASP.NET, PHP, compression, etc.)
- **Benefits**: Smaller attack surface, better performance, easier maintenance
- **Configuration**: XML-based, hierarchical (server → site → application → directory)

**Worker Process Model (IIS 6.0+):**
- **Application Pools**: Isolated processes for different websites/applications
- **Process Isolation**: One app crashing doesn't affect others
- **Security**: Each pool runs with specific user account and permissions
- **Reliability**: Automatic process recycling and health monitoring

**HTTP.SYS (HTTP Protocol Stack):**
- Kernel-mode HTTP listener introduced in IIS 6.0
- Handles HTTP requests at OS level before IIS
- Provides connection management, caching, request queuing
- Enables features like URL rewriting and SSL termination

### Security Features

**Authentication Methods:**
- **Windows Authentication**: Integrated with Active Directory
- **Basic Authentication**: Username/password (usually over HTTPS)
- **Digest Authentication**: More secure than Basic
- **Anonymous Authentication**: Public access
- **Certificate Authentication**: Client certificates for mutual TLS

**Security Hardening:**
- **Modular Installation**: Only install needed components
- **Request Filtering**: Block malicious requests, limit file uploads
- **IP Restrictions**: Allow/deny specific IP addresses
- **SSL/TLS Configuration**: Support for TLS 1.2, 1.3, HSTS
- **Security Headers**: X-Frame-Options, Content-Security-Policy, etc.

**Common Security Practices:**
- Disable unnecessary features and modules
- Use HTTPS for all sensitive traffic
- Keep Windows and IIS updated
- Run application pools with least privilege accounts
- Enable request filtering and logging

### Application Support

**Native Technologies:**
- **ASP.NET**: Microsoft's web framework (full integration)
- **Classic ASP**: Legacy scripting (deprecated in newer versions)
- **Static Files**: HTML, CSS, JavaScript, images

**Third-Party Support:**
- **PHP**: Via FastCGI module
- **Node.js**: Via iisnode or reverse proxy
- **Python**: Via FastCGI or WSGI
- **Other Languages**: Via CGI, FastCGI, or reverse proxy

**Application Hosting Models:**
- **In-Process**: Application runs inside IIS worker process
- **Out-of-Process**: Separate process (better isolation)
- **Containerized**: Run in Windows containers (IIS 10.0+)

### Performance & Scalability

**Performance Features:**
- **Output Caching**: Cache frequently requested content
- **Compression**: Gzip and Brotli compression (IIS 10.0+)
- **HTTP/2**: Multiplexing, header compression, server push
- **HTTP/3**: QUIC protocol for faster connections
- **NUMA Awareness**: Optimized for multi-processor systems

**Scalability Options:**
- **Load Balancing**: Multiple IIS servers behind load balancer
- **Application Request Routing (ARR)**: Reverse proxy and load balancing
- **Web Farm Framework**: Synchronize configuration across servers
- **Connection Limits**: Configurable concurrent connection limits

### Management & Administration

**Management Tools:**
- **IIS Manager**: GUI tool for configuration
- **PowerShell**: Command-line management (IIS 7.0+)
- **REST API**: Programmatic management (IIS 10.0+)
- **Web-based Management**: Browser-based GUI (IIS 10.0+)
- **Command Line**: `appcmd.exe` utility

**Configuration:**
- **applicationHost.config**: Server-level settings
- **web.config**: Site/application-level settings
- **Hierarchical**: Child configs inherit and override parent settings
- **Deployment**: XCopy deployment, Web Deploy, MSDeploy

### Version History & Compatibility

**Major Versions:**
- **IIS 1.0-3.0**: Early versions, basic features
- **IIS 4.0**: MMC management, application pools introduced
- **IIS 5.0-5.1**: Windows 2000/XP, WebDAV support
- **IIS 6.0**: Windows Server 2003, major security improvements
- **IIS 7.0-7.5**: Complete rewrite, modular architecture
- **IIS 8.0-8.5**: Windows Server 2012/R2, SNI, enhanced logging
- **IIS 10.0**: Windows Server 2016+, HTTP/2, containers, REST API

**Windows Version Compatibility:**
- Server editions: Full IIS with unlimited connections
- Client editions (Windows 10/11): Limited IIS, mainly for development
- Some features (like unlimited connections) require Server editions

### Common Use Cases

**Web Hosting:**
- Corporate websites and intranets
- E-commerce platforms
- Content management systems (SharePoint, etc.)

**Application Hosting:**
- ASP.NET web applications
- REST APIs and web services
- Microservices (in containers)

**Infrastructure:**
- Reverse proxy for other services
- Load balancing
- SSL termination
- File sharing (FTP/FTPS)

### Comparison with Other Web Servers

**vs. Apache:**
- IIS: Windows-native, .NET integration, Windows authentication
- Apache: Cross-platform, open-source, more modules available

**vs. Nginx:**
- IIS: Full application hosting, Windows integration
- Nginx: Often used as reverse proxy, high performance, lightweight

**vs. Other Windows Web Servers:**
- IIS is the standard Microsoft solution
- Alternatives exist (like Kestrel for .NET Core) but IIS remains dominant

### Limitations & Considerations

**Licensing:**
- Included with Windows Server licenses
- Client Windows versions have connection limits
- Some advanced features require specific Windows editions

**Platform Lock-in:**
- Windows-only (though can proxy to Linux services)
- Requires Windows Server for production use
- Tied to Microsoft ecosystem

**Resource Usage:**
- Can be resource-intensive compared to lightweight servers
- Requires Windows Server licensing costs
- More complex than simple static file servers

## Key Takeaway

IIS is Microsoft's enterprise-grade web server that powers millions of Windows-based websites and applications. Its deep Windows integration, .NET support, and modern features (HTTP/2, HTTP/3, containers) make it the go-to choice for Windows hosting, while its modular architecture and security features provide flexibility and protection for production environments.

## Related Subjects

- **HTTPS/TLS Configuration**: Understanding SSL certificates, TLS protocols, and secure web server configuration
- **Web Application Architecture**: How web servers fit into overall application architecture, load balancing, and scalability patterns

