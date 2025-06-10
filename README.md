# Fastly NGWAF MCP Server

A comprehensive Model Context Protocol (MCP) server that provides seamless integration with the Fastly NGWAF (Next-Gen Web Application Firewall) API. This server enables AI assistants like Claude to manage web application security through natural language interactions.

<a href="https://glama.ai/mcp/servers/@purpleax/FastlyMCP">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@purpleax/FastlyMCP/badge" alt="Fastly NGWAF Server MCP server" />
</a>

## Features

🛡️ **Complete WAF Management**
- Create, read, update, and delete security rules
- Manage IP allow/block lists
- Configure rate limiting and alerts
- Monitor security events and analytics

🏢 **Multi-tenancy Support**
- Corporation and site-level management
- Context-aware operations
- Bulk operations across multiple sites

🤖 **AI-Friendly Interface**
- Natural language rule creation
- Intelligent threat pattern detection
- Automated security policy suggestions

## Installation

### Prerequisites
- Node.js 18+ 
- Fastly NGWAF account with API access
- MCP-compatible AI assistant (Claude Desktop, etc.)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/FastlyMCP.git
cd FastlyMCP
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables (optional)**
```bash
# Create .env file
FASTLY_NGWAF_EMAIL=your-email@example.com
FASTLY_NGWAF_TOKEN=your-api-token
FASTLY_NGWAF_DEFAULT_CORP=your-corp-name
FASTLY_NGWAF_DEFAULT_SITE=your-site-name
```

4. **Start the server**
```bash
npm start
```

## Configuration

### Claude Desktop Integration

Add this to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fastly-ngwaf": {
      "command": "node",
      "args": ["path/to/FastlyMCP/server.js"],
      "env": {
        "FASTLY_NGWAF_EMAIL": "your-email@example.com",
        "FASTLY_NGWAF_TOKEN": "your-api-token"
      }
    }
  }
}
```


### AI-Powered Interactions

**Natural Language**: *"Create a rule to block SQL injection attacks on my website"*

**AI Response**: The assistant will automatically:
1. Detect the intent (create security rule)
2. Identify the threat type (SQL injection) 
3. Generate appropriate rule conditions
4. Apply the rule to your configured site


## Available Tools

### Authentication & Setup
- `set_credentials` - Configure API credentials
- `test_connection` - Validate API connectivity
- `set_context` - Set default corp/site context
- `discover_environment` - Explore available resources

### Rule Management
- `list_corp_rules` / `list_site_rules` - List security rules
- `create_corp_rule` / `create_site_rule` - Create new rules
- `delete_corp_rule` / `delete_site_rule` - Remove rules

### Security Monitoring
- `list_events` - View security events
- `search_requests` - Search request logs  
- `get_suspicious_ips` - Identify threat sources
- `expire_event` - Manually unblock IPs

### IP List Management
- `manage_whitelist` - Allow/block IP addresses
- `manage_blacklist` - Block malicious IPs
- `manage_lists` - Custom IP/country/string lists

### Analytics & Reporting
- `get_analytics` - Security metrics and trends
- `get_corp_overview` - High-level attack summary
- `manage_alerts` - Configure monitoring alerts

### Advanced Features
- `manage_cloudwaf` - CloudWAF instance management
- `manage_users` - User access control

## Common Use Cases

### 🚨 Incident Response
*"An IP address 1.2.3.4 is attacking my site, block it immediately"*
- AI automatically identifies the threat
- Adds IP to blacklist with appropriate duration
- Confirms blocking is active

### 🛡️ Proactive Security
*"Set up protection against the latest OWASP top 10 vulnerabilities"*  
- Creates comprehensive rule sets
- Configures appropriate thresholds
- Sets up monitoring alerts

### 📊 Security Analytics
*"Show me attack trends from the past month and suggest improvements"*
- Analyzes historical attack data
- Identifies patterns and threat sources
- Recommends rule optimizations

### 🔧 Bulk Management
*"Apply the same security rules from site A to sites B, C, and D"*
- Exports existing rule configurations
- Adapts rules for different sites
- Bulk applies with verification

## API Reference

The server exposes the complete Fastly NGWAF API through intuitive MCP tools. Each tool maps to specific API endpoints while handling authentication, context resolution, and error management automatically.



### Rate Limiting
The server respects Fastly API rate limits and implements appropriate retry logic.

## Development

### Project Structure
```
FastlyMCP/
├── server.js          # Main MCP server implementation
├── package.json       # Dependencies and scripts  
├── README.md          # This documentation
└── .env.example       # Environment variable template
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing
```bash
# Test API connectivity
npm start
# In another terminal/AI session:
# test_connection()
```

## Troubleshooting

### Common Issues

**Authentication Failed**
- Verify email and API token are correct
- Ensure token has appropriate permissions
- Check Fastly account status

**Context Errors**
- Set default corporation: `set_context({ corpName: "your-corp" })`
- Verify corp/site names exist: `discover_environment()`

**Permission Denied**
- Check user role has necessary permissions
- Verify site access in Fastly dashboard

### Debug Mode
Enable verbose logging by setting environment variable:
```bash
DEBUG=fastly-ngwaf npm start
```

## Security Considerations

- Store API credentials securely (environment variables or secure credential managers)
- Use principle of least privilege for API tokens  
- Regularly rotate API credentials
- Monitor for unauthorized API usage
- Keep dependencies updated

## License

MIT License - see LICENSE file for details.

## Support

- 📚 [Fastly NGWAF Documentation](https://docs.fastly.com/products/web-application-firewall)
- 🐛 [Report Issues](https://github.com/yourusername/FastlyMCP/issues)
- 💬 [Discussions](https://github.com/yourusername/FastlyMCP/discussions)

## Changelog

### v1.0.0
- Initial release with complete NGWAF API coverage
- MCP server implementation
- Rule management (CRUD operations)
- IP list management
- Analytics and monitoring
- CloudWAF support
- User management features