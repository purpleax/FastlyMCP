#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
// Fastly NGWAF API Client
class FastlyNGWAFClient {
    api;
    email = null;
    token = null;
    constructor(email, token) {
        this.api = axios.create({
            baseURL: 'https://dashboard.signalsciences.net/api/v0',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Claude-MCP-FastlyNGWAF/1.0',
            },
        });
        // Set credentials if provided
        if (email && token) {
            this.setCredentials(email, token);
        }
    }
    setCredentials(email, token) {
        this.email = email;
        this.token = token;
        this.api.defaults.headers.common['x-api-user'] = email;
        this.api.defaults.headers.common['x-api-token'] = token;
        return { success: true, authenticated: true };
    }
    // Test API connection and validate credentials
    async testConnection() {
        try {
            const response = await this.api.get('/corps');
            return {
                success: true,
                authenticated: true,
                corporationsCount: response.data.data?.length || 0,
                email: this.email
            };
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Invalid email or API token. Please check your credentials.');
            }
            throw new Error(`API connection failed: ${error.response?.data?.message || error.message}`);
        }
    }
    // Corps Management
    async listCorps() {
        const response = await this.api.get('/corps');
        return response.data;
    }
    async getCorp(corpName) {
        const response = await this.api.get(`/corps/${corpName}`);
        return response.data;
    }
    async getCorpOverview(corpName, from, until) {
        const params = new URLSearchParams();
        if (from)
            params.append('from', from);
        if (until)
            params.append('until', until);
        const response = await this.api.get(`/corps/${corpName}/reports/attacks?${params.toString()}`);
        return response.data;
    }
    // Sites Management
    async listSites(corpName, q, page, limit) {
        const params = new URLSearchParams();
        if (q)
            params.append('q', q);
        if (page)
            params.append('page', page.toString());
        if (limit)
            params.append('limit', limit.toString());
        const response = await this.api.get(`/corps/${corpName}/sites?${params.toString()}`);
        return response.data;
    }
    async getSite(corpName, siteName) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}`);
        return response.data;
    }
    async createSite(corpName, siteData) {
        const response = await this.api.post(`/corps/${corpName}/sites`, siteData);
        return response.data;
    }
    async updateSite(corpName, siteName, siteData) {
        const response = await this.api.patch(`/corps/${corpName}/sites/${siteName}`, siteData);
        return response.data;
    }
    async deleteSite(corpName, siteName) {
        await this.api.delete(`/corps/${corpName}/sites/${siteName}`);
        return { success: true };
    }
    // Rules Management
    async listCorpRules(corpName, type, page, limit) {
        const params = new URLSearchParams();
        if (type)
            params.append('type', type);
        if (page)
            params.append('page', page.toString());
        if (limit)
            params.append('limit', limit.toString());
        const response = await this.api.get(`/corps/${corpName}/rules?${params.toString()}`);
        return response.data;
    }
    async listSiteRules(corpName, siteName, type, page, limit) {
        const params = new URLSearchParams();
        if (type)
            params.append('type', type);
        if (page)
            params.append('page', page.toString());
        if (limit)
            params.append('limit', limit.toString());
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/rules?${params.toString()}`);
        return response.data;
    }
    async createCorpRule(corpName, ruleData) {
        const response = await this.api.post(`/corps/${corpName}/rules`, ruleData);
        return response.data;
    }
    async createSiteRule(corpName, siteName, ruleData) {
        const response = await this.api.post(`/corps/${corpName}/sites/${siteName}/rules`, ruleData);
        return response.data;
    }
    async updateCorpRule(corpName, ruleId, ruleData) {
        const response = await this.api.put(`/corps/${corpName}/rules/${ruleId}`, ruleData);
        return response.data;
    }
    async updateSiteRule(corpName, siteName, ruleId, ruleData) {
        const response = await this.api.put(`/corps/${corpName}/sites/${siteName}/rules/${ruleId}`, ruleData);
        return response.data;
    }
    async deleteCorpRule(corpName, ruleId) {
        await this.api.delete(`/corps/${corpName}/rules/${ruleId}`);
        return { success: true };
    }
    async deleteSiteRule(corpName, siteName, ruleId) {
        await this.api.delete(`/corps/${corpName}/sites/${siteName}/rules/${ruleId}`);
        return { success: true };
    }
    // Lists Management
    async listCorpLists(corpName) {
        const response = await this.api.get(`/corps/${corpName}/lists`);
        return response.data;
    }
    async listSiteLists(corpName, siteName) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/lists`);
        return response.data;
    }
    async createCorpList(corpName, listData) {
        const response = await this.api.post(`/corps/${corpName}/lists`, listData);
        return response.data;
    }
    async createSiteList(corpName, siteName, listData) {
        const response = await this.api.post(`/corps/${corpName}/sites/${siteName}/lists`, listData);
        return response.data;
    }
    async updateCorpList(corpName, listId, updateData) {
        const response = await this.api.patch(`/corps/${corpName}/lists/${listId}`, updateData);
        return response.data;
    }
    async updateSiteList(corpName, siteName, listId, updateData) {
        const response = await this.api.patch(`/corps/${corpName}/sites/${siteName}/lists/${listId}`, updateData);
        return response.data;
    }
    async deleteCorpList(corpName, listId) {
        await this.api.delete(`/corps/${corpName}/lists/${listId}`);
        return { success: true };
    }
    async deleteSiteList(corpName, siteName, listId) {
        await this.api.delete(`/corps/${corpName}/sites/${siteName}/lists/${listId}`);
        return { success: true };
    }
    // Events and Requests
    async searchRequests(corpName, siteName, query, page, limit) {
        const params = new URLSearchParams();
        if (query)
            params.append('q', query);
        if (page)
            params.append('page', page.toString());
        if (limit)
            params.append('limit', limit.toString());
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/requests?${params.toString()}`);
        return response.data;
    }
    async getRequest(corpName, siteName, requestId) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/requests/${requestId}`);
        return response.data;
    }
    async listEvents(corpName, siteName, from, until, action, tag, ip) {
        const params = new URLSearchParams();
        if (from)
            params.append('from', from.toString());
        if (until)
            params.append('until', until.toString());
        if (action)
            params.append('action', action);
        if (tag)
            params.append('tag', tag);
        if (ip)
            params.append('ip', ip);
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/events?${params.toString()}`);
        return response.data;
    }
    async getEvent(corpName, siteName, eventId) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/events/${eventId}`);
        return response.data;
    }
    async expireEvent(corpName, siteName, eventId) {
        const response = await this.api.post(`/corps/${corpName}/sites/${siteName}/events/${eventId}/expire`);
        return response.data;
    }
    // IP Management
    async getSuspiciousIPs(corpName, siteName, limit) {
        const params = new URLSearchParams();
        if (limit)
            params.append('limit', limit.toString());
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/suspiciousIPs?${params.toString()}`);
        return response.data;
    }
    async getWhitelist(corpName, siteName) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/whitelist`);
        return response.data;
    }
    async addToWhitelist(corpName, siteName, ipData) {
        const response = await this.api.put(`/corps/${corpName}/sites/${siteName}/whitelist`, ipData);
        return response.data;
    }
    async removeFromWhitelist(corpName, siteName, entryId) {
        await this.api.delete(`/corps/${corpName}/sites/${siteName}/whitelist/${entryId}`);
        return { success: true };
    }
    async getBlacklist(corpName, siteName) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/blacklist`);
        return response.data;
    }
    async addToBlacklist(corpName, siteName, ipData) {
        const response = await this.api.put(`/corps/${corpName}/sites/${siteName}/blacklist`, ipData);
        return response.data;
    }
    async removeFromBlacklist(corpName, siteName, entryId) {
        await this.api.delete(`/corps/${corpName}/sites/${siteName}/blacklist/${entryId}`);
        return { success: true };
    }
    // Alerts Management
    async listAlerts(corpName, siteName) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/alerts`);
        return response.data;
    }
    async createAlert(corpName, siteName, alertData) {
        const response = await this.api.post(`/corps/${corpName}/sites/${siteName}/alerts`, alertData);
        return response.data;
    }
    async updateAlert(corpName, siteName, alertId, alertData) {
        const response = await this.api.patch(`/corps/${corpName}/sites/${siteName}/alerts/${alertId}`, alertData);
        return response.data;
    }
    async deleteAlert(corpName, siteName, alertId) {
        await this.api.delete(`/corps/${corpName}/sites/${siteName}/alerts/${alertId}`);
        return { success: true };
    }
    // Integrations
    async listCorpIntegrations(corpName) {
        const response = await this.api.get(`/corps/${corpName}/integrations`);
        return response.data;
    }
    async listSiteIntegrations(corpName, siteName) {
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/integrations`);
        return response.data;
    }
    async createCorpIntegration(corpName, integrationData) {
        const response = await this.api.post(`/corps/${corpName}/integrations`, integrationData);
        return response.data;
    }
    async createSiteIntegration(corpName, siteName, integrationData) {
        const response = await this.api.post(`/corps/${corpName}/sites/${siteName}/integrations`, integrationData);
        return response.data;
    }
    // Analytics
    async getTopAttacks(corpName, siteName, from, until, groupBy, limit) {
        const params = new URLSearchParams();
        if (from)
            params.append('from', from.toString());
        if (until)
            params.append('until', until.toString());
        if (groupBy)
            params.append('groupBy', groupBy);
        if (limit)
            params.append('limit', limit.toString());
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/top/attacks?${params.toString()}`);
        return response.data;
    }
    async getTimeseriesRequests(corpName, siteName, from, until, tags, rollup) {
        const params = new URLSearchParams();
        params.append('from', from.toString());
        params.append('until', until.toString());
        if (tags)
            params.append('tags', tags);
        if (rollup)
            params.append('rollup', rollup.toString());
        const response = await this.api.get(`/corps/${corpName}/sites/${siteName}/timeseries/requests?${params.toString()}`);
        return response.data;
    }
    // CloudWAF Management
    async listCloudWAFInstances(corpName) {
        const response = await this.api.get(`/corps/${corpName}/cloudwafInstances`);
        return response.data;
    }
    async createCloudWAFInstance(corpName, instanceData) {
        const response = await this.api.post(`/corps/${corpName}/cloudwafInstances`, instanceData);
        return response.data;
    }
    async getCloudWAFInstance(corpName, deploymentId) {
        const response = await this.api.get(`/corps/${corpName}/cloudwafInstances/${deploymentId}`);
        return response.data;
    }
    async updateCloudWAFInstance(corpName, deploymentId, instanceData) {
        const response = await this.api.put(`/corps/${corpName}/cloudwafInstances/${deploymentId}`, instanceData);
        return response.data;
    }
    async deleteCloudWAFInstance(corpName, deploymentId) {
        await this.api.delete(`/corps/${corpName}/cloudwafInstances/${deploymentId}`);
        return { success: true };
    }
    // User Management
    async listCorpUsers(corpName) {
        const response = await this.api.get(`/corps/${corpName}/users`);
        return response.data;
    }
    async getCorpUser(corpName, userEmail) {
        const response = await this.api.get(`/corps/${corpName}/users/${userEmail}`);
        return response.data;
    }
    async updateCorpUser(corpName, userEmail, userData) {
        const response = await this.api.patch(`/corps/${corpName}/users/${userEmail}`, userData);
        return response.data;
    }
    async inviteCorpUser(corpName, userEmail, userData) {
        const response = await this.api.post(`/corps/${corpName}/users/${userEmail}/invite`, userData);
        return response.data;
    }
    async deleteCorpUser(corpName, userEmail) {
        await this.api.delete(`/corps/${corpName}/users/${userEmail}`);
        return { success: true };
    }
}
// MCP Server Setup
const server = new Server({
    name: 'fastly-ngwaf-server',
    version: '0.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
let client;
let context = {};
// Initialize from environment variables if available
const initializeFromEnv = async () => {
    const email = process.env.FASTLY_NGWAF_EMAIL;
    const token = process.env.FASTLY_NGWAF_TOKEN;
    const defaultCorpName = process.env.FASTLY_NGWAF_DEFAULT_CORP;
    const defaultSiteName = process.env.FASTLY_NGWAF_DEFAULT_SITE;
    if (email && token) {
        try {
            client = new FastlyNGWAFClient(email, token);
            const connectionTest = await client.testConnection();
            // Set default context if provided
            if (defaultCorpName) {
                context.defaultCorpName = defaultCorpName;
            }
            if (defaultSiteName) {
                context.defaultSiteName = defaultSiteName;
            }
            console.error(`Fastly NGWAF: Auto-authenticated as ${email} (${connectionTest.corporationsCount} corps available)`);
            if (context.defaultCorpName) {
                console.error(`Default context: Corp=${context.defaultCorpName}, Site=${context.defaultSiteName || 'not set'}`);
            }
        }
        catch (error) {
            console.error(`Auto-authentication failed: ${error.message}`);
        }
    }
};
// Helper function to resolve corp and site names
function resolveContext(args) {
    const corpName = args.corpName || context.defaultCorpName;
    const siteName = args.siteName || context.defaultSiteName;
    if (!corpName) {
        throw new Error('Corporation name is required. Please set context or provide corpName parameter.');
    }
    return { corpName, siteName };
}
// Tool definitions
const tools = [
    {
        name: 'set_credentials',
        description: 'Set Fastly NGWAF API credentials (email and access token)',
        inputSchema: {
            type: 'object',
            properties: {
                email: { type: 'string', description: 'Your Fastly NGWAF email address' },
                token: { type: 'string', description: 'Your Fastly NGWAF API access token' },
            },
            required: ['email', 'token'],
        },
    },
    {
        name: 'test_connection',
        description: 'Test the API connection and validate credentials',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'set_context',
        description: 'Set the default corporation and site context for subsequent operations',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Default corporation name' },
                siteName: { type: 'string', description: 'Default site name' },
            },
            required: ['corpName'],
        },
    },
    {
        name: 'get_context',
        description: 'Get the current context (corp and site names)',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'discover_environment',
        description: 'Discover available corporations and sites for the authenticated user',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Specific corporation to explore (optional)' },
            },
        },
    },
    {
        name: 'list_corps',
        description: 'List all corporations accessible to the authenticated user',
        inputSchema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_corp_overview',
        description: 'Get attack overview for a corporation',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                from: { type: 'string', description: 'Start date (e.g., "-7d")' },
                until: { type: 'string', description: 'End date (e.g., "-1d")' },
            },
        },
    },
    {
        name: 'list_sites',
        description: 'List sites in a corporation',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                query: { type: 'string', description: 'Search query to filter sites' },
                page: { type: 'number', description: 'Page number' },
                limit: { type: 'number', description: 'Results per page' },
            },
        },
    },
    {
        name: 'get_site',
        description: 'Get details of a specific site',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
            },
        },
    },
    {
        name: 'create_site',
        description: 'Create a new site in a corporation',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name' },
                displayName: { type: 'string', description: 'Display name' },
                agentLevel: { type: 'string', enum: ['block', 'log', 'off'], description: 'Agent action level' },
                blockDurationSeconds: { type: 'number', description: 'Block duration in seconds' },
                blockHTTPCode: { type: 'number', description: 'HTTP response code for blocked requests' },
                blockRedirectURL: { type: 'string', description: 'Redirect URL for blocked requests' },
            },
            required: ['siteName'],
        },
    },
    {
        name: 'update_site',
        description: 'Update site configuration',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                displayName: { type: 'string', description: 'Display name' },
                agentLevel: { type: 'string', enum: ['block', 'log', 'off'], description: 'Agent action level' },
                blockDurationSeconds: { type: 'number', description: 'Block duration in seconds' },
                blockHTTPCode: { type: 'number', description: 'HTTP response code for blocked requests' },
                blockRedirectURL: { type: 'string', description: 'Redirect URL for blocked requests' },
            },
        },
    },
    {
        name: 'delete_site',
        description: 'Delete a site',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
            },
        },
    },
    {
        name: 'list_corp_rules',
        description: 'List rules at corporation level',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                type: { type: 'string', enum: ['request', 'signal'], description: 'Rule type' },
                page: { type: 'number', description: 'Page number' },
                limit: { type: 'number', description: 'Results per page' },
            },
        },
    },
    {
        name: 'list_site_rules',
        description: 'List rules for a specific site',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                type: { type: 'string', enum: ['request', 'signal', 'rateLimit'], description: 'Rule type' },
                page: { type: 'number', description: 'Page number' },
                limit: { type: 'number', description: 'Results per page' },
            },
        },
    },
    {
        name: 'create_corp_rule',
        description: 'Create a corporation-level rule',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                type: { type: 'string', enum: ['request', 'signal'], description: 'Rule type' },
                enabled: { type: 'boolean', description: 'Whether rule is enabled' },
                groupOperator: { type: 'string', enum: ['all', 'any'], description: 'Condition group operator' },
                conditions: { type: 'array', description: 'Rule conditions' },
                actions: { type: 'array', description: 'Rule actions' },
                reason: { type: 'string', description: 'Description of the rule' },
                signal: { type: 'string', description: 'Signal ID for exclusion rules' },
                corpScope: { type: 'string', enum: ['global', 'specificSites'], description: 'Rule scope' },
                siteNames: { type: 'array', items: { type: 'string' }, description: 'Site names for specific scope' },
            },
            required: ['type', 'groupOperator', 'conditions', 'actions'],
        },
    },
    {
        name: 'create_site_rule',
        description: 'Create a site-level rule',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                type: { type: 'string', enum: ['request', 'signal', 'rateLimit'], description: 'Rule type' },
                enabled: { type: 'boolean', description: 'Whether rule is enabled' },
                groupOperator: { type: 'string', enum: ['all', 'any'], description: 'Condition group operator' },
                conditions: { type: 'array', description: 'Rule conditions' },
                actions: { type: 'array', description: 'Rule actions' },
                reason: { type: 'string', description: 'Description of the rule' },
                signal: { type: 'string', description: 'Signal ID for exclusion/rate limit rules' },
                thresholdCount: { type: 'number', description: 'Threshold count for rate limit rules' },
                thresholdInterval: { type: 'number', description: 'Threshold interval for rate limit rules' },
                blockDurationSeconds: { type: 'number', description: 'Block duration for rate limit rules' },
            },
            required: ['type', 'groupOperator', 'conditions', 'actions'],
        },
    },
    {
        name: 'delete_corp_rule',
        description: 'Delete a corporation-level rule',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                ruleId: { type: 'string', description: 'Rule ID to delete' },
            },
            required: ['ruleId'],
        },
    },
    {
        name: 'delete_site_rule',
        description: 'Delete a site-level rule',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                ruleId: { type: 'string', description: 'Rule ID to delete' },
            },
            required: ['ruleId'],
        },
    },
    {
        name: 'search_requests',
        description: 'Search requests with advanced filtering',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                query: { type: 'string', description: 'Search query (e.g., "tag:SQLI")' },
                page: { type: 'number', description: 'Page number' },
                limit: { type: 'number', description: 'Results per page' },
            },
        },
    },
    {
        name: 'list_events',
        description: 'List security events (attacks, blocks, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                from: { type: 'number', description: 'Unix timestamp start' },
                until: { type: 'number', description: 'Unix timestamp end' },
                action: { type: 'string', enum: ['flagged', 'info'], description: 'Filter by action' },
                tag: { type: 'string', description: 'Filter by tag' },
                ip: { type: 'string', description: 'Filter by IP address' },
            },
        },
    },
    {
        name: 'expire_event',
        description: 'Manually expire an event (unblock IP)',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                eventId: { type: 'string', description: 'Event ID' },
            },
            required: ['eventId'],
        },
    },
    {
        name: 'get_suspicious_ips',
        description: 'Get list of suspicious IP addresses',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                limit: { type: 'number', description: 'Maximum number of IPs to return' },
            },
        },
    },
    {
        name: 'manage_whitelist',
        description: 'Manage IP whitelist (allowlist)',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                action: { type: 'string', enum: ['list', 'add', 'remove'], description: 'Action to perform' },
                ip: { type: 'string', description: 'IP address (for add action)' },
                note: { type: 'string', description: 'Note for IP (for add action)' },
                expires: { type: 'string', description: 'Expiration date (RFC3339 format)' },
                entryId: { type: 'string', description: 'Entry ID (for remove action)' },
            },
            required: ['action'],
        },
    },
    {
        name: 'manage_blacklist',
        description: 'Manage IP blacklist (blocklist)',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                action: { type: 'string', enum: ['list', 'add', 'remove'], description: 'Action to perform' },
                ip: { type: 'string', description: 'IP address (for add action)' },
                note: { type: 'string', description: 'Note for IP (for add action)' },
                expires: { type: 'string', description: 'Expiration date (RFC3339 format)' },
                entryId: { type: 'string', description: 'Entry ID (for remove action)' },
            },
            required: ['action'],
        },
    },
    {
        name: 'manage_lists',
        description: 'Manage custom lists (IP, country, string, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (optional for corp-level lists, uses context default if not provided)' },
                action: { type: 'string', enum: ['list', 'create', 'update', 'delete'], description: 'Action to perform' },
                listId: { type: 'string', description: 'List ID (for update/delete actions)' },
                name: { type: 'string', description: 'List name (for create action)' },
                type: { type: 'string', enum: ['ip', 'country', 'string', 'wildcard', 'signal'], description: 'List type' },
                description: { type: 'string', description: 'List description' },
                entries: { type: 'array', items: { type: 'string' }, description: 'List entries' },
                additions: { type: 'array', items: { type: 'string' }, description: 'Entries to add (for update)' },
                deletions: { type: 'array', items: { type: 'string' }, description: 'Entries to remove (for update)' },
            },
            required: ['action'],
        },
    },
    {
        name: 'manage_alerts',
        description: 'Manage alerts for monitoring attack patterns',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                action: { type: 'string', enum: ['list', 'create', 'update', 'delete'], description: 'Action to perform' },
                alertId: { type: 'string', description: 'Alert ID (for update/delete actions)' },
                tagName: { type: 'string', description: 'Tag name to monitor' },
                longName: { type: 'string', description: 'Alert description' },
                interval: { type: 'number', enum: [1, 10, 60], description: 'Time interval in minutes' },
                threshold: { type: 'number', description: 'Threshold count' },
                enabled: { type: 'boolean', description: 'Whether alert is enabled' },
                action_type: { type: 'string', enum: ['info', 'flagged'], description: 'Action when triggered' },
            },
            required: ['action'],
        },
    },
    {
        name: 'get_analytics',
        description: 'Get analytics data (top attacks, timeseries, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                siteName: { type: 'string', description: 'Site name (uses context default if not provided)' },
                type: { type: 'string', enum: ['top_attacks', 'timeseries'], description: 'Analytics type' },
                from: { type: 'number', description: 'Unix timestamp start' },
                until: { type: 'number', description: 'Unix timestamp end' },
                groupBy: { type: 'string', enum: ['remoteCountryCode', 'remoteIP', 'path', 'userAgent'], description: 'Group by field (for top attacks)' },
                tags: { type: 'string', description: 'Filter by tags (for timeseries)' },
                rollup: { type: 'number', description: 'Rollup interval in seconds (for timeseries)' },
                limit: { type: 'number', description: 'Maximum results' },
            },
            required: ['type'],
        },
    },
    {
        name: 'manage_cloudwaf',
        description: 'Manage CloudWAF instances',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                action: { type: 'string', enum: ['list', 'create', 'get', 'update', 'delete'], description: 'Action to perform' },
                deploymentId: { type: 'string', description: 'Deployment ID (for get/update/delete)' },
                name: { type: 'string', description: 'Instance name' },
                description: { type: 'string', description: 'Instance description' },
                region: { type: 'string', description: 'AWS region' },
                tlsMinVersion: { type: 'string', enum: ['1.0', '1.2'], description: 'Minimum TLS version' },
                siteName: { type: 'string', description: 'Site name for configuration' },
                domains: { type: 'array', items: { type: 'string' }, description: 'Domains to protect' },
                origin: { type: 'string', description: 'Origin server URL' },
            },
            required: ['action'],
        },
    },
    {
        name: 'manage_users',
        description: 'Manage corporation users',
        inputSchema: {
            type: 'object',
            properties: {
                corpName: { type: 'string', description: 'Corporation name (uses context default if not provided)' },
                action: { type: 'string', enum: ['list', 'get', 'update', 'invite', 'delete'], description: 'Action to perform' },
                userEmail: { type: 'string', description: 'User email address' },
                role: { type: 'string', enum: ['owner', 'admin', 'user', 'observer'], description: 'User role' },
                memberships: { type: 'array', description: 'Site memberships' },
            },
            required: ['action'],
        },
    },
];
// Request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    // Ensure args exists and is an object
    if (!args || typeof args !== 'object') {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Invalid arguments provided.',
                },
            ],
            isError: true,
        };
    }
    // Type assertion for args
    const typedArgs = args;
    if (!client && name !== 'set_credentials') {
        return {
            content: [
                {
                    type: 'text',
                    text: 'Please set your credentials first using the set_credentials tool.',
                },
            ],
            isError: true,
        };
    }
    try {
        let result;
        switch (name) {
            case 'set_credentials':
                client = new FastlyNGWAFClient();
                result = client.setCredentials(typedArgs.email, typedArgs.token);
                // Test the connection to validate the credentials
                try {
                    const connectionTest = await client.testConnection();
                    result.message = `Credentials set and validated successfully. Access to ${connectionTest.corporationsCount} corporations.`;
                    result.email = connectionTest.email;
                }
                catch (error) {
                    result.success = false;
                    result.error = error.message;
                }
                break;
            case 'test_connection':
                if (!client) {
                    throw new Error('Please set credentials first using the set_credentials tool.');
                }
                result = await client.testConnection();
                break;
            case 'set_context':
                context.defaultCorpName = typedArgs.corpName;
                context.defaultSiteName = typedArgs.siteName;
                result = {
                    success: true,
                    context: {
                        defaultCorpName: context.defaultCorpName,
                        defaultSiteName: context.defaultSiteName,
                    },
                };
                break;
            case 'get_context':
                result = {
                    context: {
                        defaultCorpName: context.defaultCorpName,
                        defaultSiteName: context.defaultSiteName,
                    },
                };
                break;
            case 'discover_environment':
                if (typedArgs.corpName) {
                    const { corpName } = resolveContext(typedArgs);
                    const sites = await client.listSites(corpName);
                    result = { corporation: corpName, sites };
                }
                else {
                    const corps = await client.listCorps();
                    result = { corporations: corps };
                }
                break;
            case 'list_corps':
                result = await client.listCorps();
                break;
            case 'get_corp_overview':
                const { corpName: corpForOverview } = resolveContext(typedArgs);
                result = await client.getCorpOverview(corpForOverview, typedArgs.from, typedArgs.until);
                break;
            case 'list_sites':
                const { corpName: corpForSites } = resolveContext(typedArgs);
                result = await client.listSites(corpForSites, typedArgs.query, typedArgs.page, typedArgs.limit);
                break;
            case 'get_site':
                const { corpName: corpForSite, siteName: siteForGet } = resolveContext(typedArgs);
                if (!siteForGet) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.getSite(corpForSite, siteForGet);
                break;
            case 'create_site':
                const { corpName: corpForCreate } = resolveContext(typedArgs);
                const siteData = {
                    name: typedArgs.siteName,
                    displayName: typedArgs.displayName,
                    agentLevel: typedArgs.agentLevel,
                    blockDurationSeconds: typedArgs.blockDurationSeconds,
                    blockHTTPCode: typedArgs.blockHTTPCode,
                    blockRedirectURL: typedArgs.blockRedirectURL,
                };
                result = await client.createSite(corpForCreate, siteData);
                break;
            case 'update_site':
                const { corpName: corpForUpdate, siteName: siteForUpdate } = resolveContext(typedArgs);
                if (!siteForUpdate) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                const updateData = {
                    displayName: typedArgs.displayName,
                    agentLevel: typedArgs.agentLevel,
                    blockDurationSeconds: typedArgs.blockDurationSeconds,
                    blockHTTPCode: typedArgs.blockHTTPCode,
                    blockRedirectURL: typedArgs.blockRedirectURL,
                };
                result = await client.updateSite(corpForUpdate, siteForUpdate, updateData);
                break;
            case 'delete_site':
                const { corpName: corpForDelete, siteName: siteForDelete } = resolveContext(typedArgs);
                if (!siteForDelete) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.deleteSite(corpForDelete, siteForDelete);
                break;
            case 'list_corp_rules':
                const { corpName: corpForCorpRules } = resolveContext(typedArgs);
                result = await client.listCorpRules(corpForCorpRules, typedArgs.type, typedArgs.page, typedArgs.limit);
                break;
            case 'list_site_rules':
                const { corpName: corpForSiteRules, siteName: siteForRules } = resolveContext(typedArgs);
                if (!siteForRules) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.listSiteRules(corpForSiteRules, siteForRules, typedArgs.type, typedArgs.page, typedArgs.limit);
                break;
            case 'create_corp_rule':
                const { corpName: corpForCorpRule } = resolveContext(typedArgs);
                const corpRuleData = {
                    type: typedArgs.type,
                    enabled: typedArgs.enabled,
                    groupOperator: typedArgs.groupOperator,
                    conditions: typedArgs.conditions,
                    actions: typedArgs.actions,
                    reason: typedArgs.reason,
                    signal: typedArgs.signal,
                    corpScope: typedArgs.corpScope,
                    siteNames: typedArgs.siteNames,
                };
                result = await client.createCorpRule(corpForCorpRule, corpRuleData);
                break;
            case 'create_site_rule':
                const { corpName: corpForSiteRule, siteName: siteForRule } = resolveContext(typedArgs);
                if (!siteForRule) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                const siteRuleData = {
                    type: typedArgs.type,
                    enabled: typedArgs.enabled,
                    groupOperator: typedArgs.groupOperator,
                    conditions: typedArgs.conditions,
                    actions: typedArgs.actions,
                    reason: typedArgs.reason,
                    signal: typedArgs.signal,
                    thresholdCount: typedArgs.thresholdCount,
                    thresholdInterval: typedArgs.thresholdInterval,
                    blockDurationSeconds: typedArgs.blockDurationSeconds,
                };
                result = await client.createSiteRule(corpForSiteRule, siteForRule, siteRuleData);
                break;
            case 'delete_corp_rule':
                const { corpName: corpForDeleteRule } = resolveContext(typedArgs);
                result = await client.deleteCorpRule(corpForDeleteRule, typedArgs.ruleId);
                break;
            case 'delete_site_rule':
                const { corpName: corpForDeleteSiteRule, siteName: siteForDeleteRule } = resolveContext(typedArgs);
                if (!siteForDeleteRule) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.deleteSiteRule(corpForDeleteSiteRule, siteForDeleteRule, typedArgs.ruleId);
                break;
            case 'search_requests':
                const { corpName: corpForSearch, siteName: siteForSearch } = resolveContext(typedArgs);
                if (!siteForSearch) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.searchRequests(corpForSearch, siteForSearch, typedArgs.query, typedArgs.page, typedArgs.limit);
                break;
            case 'list_events':
                const { corpName: corpForEvents, siteName: siteForEvents } = resolveContext(typedArgs);
                if (!siteForEvents) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.listEvents(corpForEvents, siteForEvents, typedArgs.from, typedArgs.until, typedArgs.action, typedArgs.tag, typedArgs.ip);
                break;
            case 'expire_event':
                const { corpName: corpForExpire, siteName: siteForExpire } = resolveContext(typedArgs);
                if (!siteForExpire) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.expireEvent(corpForExpire, siteForExpire, typedArgs.eventId);
                break;
            case 'get_suspicious_ips':
                const { corpName: corpForSuspicious, siteName: siteForSuspicious } = resolveContext(typedArgs);
                if (!siteForSuspicious) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                result = await client.getSuspiciousIPs(corpForSuspicious, siteForSuspicious, typedArgs.limit);
                break;
            case 'manage_whitelist':
                const { corpName: corpForWhitelist, siteName: siteForWhitelist } = resolveContext(typedArgs);
                if (!siteForWhitelist) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                if (typedArgs.action === 'list') {
                    result = await client.getWhitelist(corpForWhitelist, siteForWhitelist);
                }
                else if (typedArgs.action === 'add') {
                    const ipData = { source: typedArgs.ip, note: typedArgs.note, expires: typedArgs.expires };
                    result = await client.addToWhitelist(corpForWhitelist, siteForWhitelist, ipData);
                }
                else if (typedArgs.action === 'remove') {
                    result = await client.removeFromWhitelist(corpForWhitelist, siteForWhitelist, typedArgs.entryId);
                }
                break;
            case 'manage_blacklist':
                const { corpName: corpForBlacklist, siteName: siteForBlacklist } = resolveContext(typedArgs);
                if (!siteForBlacklist) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                if (typedArgs.action === 'list') {
                    result = await client.getBlacklist(corpForBlacklist, siteForBlacklist);
                }
                else if (typedArgs.action === 'add') {
                    const ipData = { source: typedArgs.ip, note: typedArgs.note, expires: typedArgs.expires };
                    result = await client.addToBlacklist(corpForBlacklist, siteForBlacklist, ipData);
                }
                else if (typedArgs.action === 'remove') {
                    result = await client.removeFromBlacklist(corpForBlacklist, siteForBlacklist, typedArgs.entryId);
                }
                break;
            case 'manage_lists':
                const { corpName: corpForLists, siteName: siteForLists } = resolveContext(typedArgs);
                if (typedArgs.action === 'list') {
                    result = siteForLists
                        ? await client.listSiteLists(corpForLists, siteForLists)
                        : await client.listCorpLists(corpForLists);
                }
                else if (typedArgs.action === 'create') {
                    const listData = {
                        name: typedArgs.name,
                        type: typedArgs.type,
                        description: typedArgs.description,
                        entries: typedArgs.entries,
                    };
                    result = siteForLists
                        ? await client.createSiteList(corpForLists, siteForLists, listData)
                        : await client.createCorpList(corpForLists, listData);
                }
                else if (typedArgs.action === 'update') {
                    const updateData = {
                        description: typedArgs.description,
                        entries: {
                            additions: typedArgs.additions,
                            deletions: typedArgs.deletions,
                        },
                    };
                    result = siteForLists
                        ? await client.updateSiteList(corpForLists, siteForLists, typedArgs.listId, updateData)
                        : await client.updateCorpList(corpForLists, typedArgs.listId, updateData);
                }
                else if (typedArgs.action === 'delete') {
                    result = siteForLists
                        ? await client.deleteSiteList(corpForLists, siteForLists, typedArgs.listId)
                        : await client.deleteCorpList(corpForLists, typedArgs.listId);
                }
                break;
            case 'manage_alerts':
                const { corpName: corpForAlerts, siteName: siteForAlerts } = resolveContext(typedArgs);
                if (!siteForAlerts) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                if (typedArgs.action === 'list') {
                    result = await client.listAlerts(corpForAlerts, siteForAlerts);
                }
                else if (typedArgs.action === 'create') {
                    const alertData = {
                        tagName: typedArgs.tagName,
                        longName: typedArgs.longName,
                        interval: typedArgs.interval,
                        threshold: typedArgs.threshold,
                        enabled: typedArgs.enabled,
                        action: typedArgs.action_type,
                    };
                    result = await client.createAlert(corpForAlerts, siteForAlerts, alertData);
                }
                else if (typedArgs.action === 'update') {
                    const alertData = {
                        tagName: typedArgs.tagName,
                        longName: typedArgs.longName,
                        interval: typedArgs.interval,
                        threshold: typedArgs.threshold,
                        enabled: typedArgs.enabled,
                        action: typedArgs.action_type,
                    };
                    result = await client.updateAlert(corpForAlerts, siteForAlerts, typedArgs.alertId, alertData);
                }
                else if (typedArgs.action === 'delete') {
                    result = await client.deleteAlert(corpForAlerts, siteForAlerts, typedArgs.alertId);
                }
                break;
            case 'get_analytics':
                const { corpName: corpForAnalytics, siteName: siteForAnalytics } = resolveContext(typedArgs);
                if (!siteForAnalytics) {
                    throw new Error('Site name is required. Please set context or provide siteName parameter.');
                }
                if (typedArgs.type === 'top_attacks') {
                    result = await client.getTopAttacks(corpForAnalytics, siteForAnalytics, typedArgs.from, typedArgs.until, typedArgs.groupBy, typedArgs.limit);
                }
                else if (typedArgs.type === 'timeseries') {
                    result = await client.getTimeseriesRequests(corpForAnalytics, siteForAnalytics, typedArgs.from, typedArgs.until, typedArgs.tags, typedArgs.rollup);
                }
                break;
            case 'manage_cloudwaf':
                const { corpName: corpForCloudWAF } = resolveContext(typedArgs);
                if (typedArgs.action === 'list') {
                    result = await client.listCloudWAFInstances(corpForCloudWAF);
                }
                else if (typedArgs.action === 'create') {
                    const instanceData = {
                        name: typedArgs.name,
                        description: typedArgs.description,
                        region: typedArgs.region,
                        tlsMinVersion: typedArgs.tlsMinVersion,
                        workspaceConfigs: [{
                                siteName: typedArgs.siteName,
                                instanceLocation: "direct",
                                listenerProtocols: ["https"],
                                routes: [{
                                        domains: typedArgs.domains,
                                        origin: typedArgs.origin,
                                        passHostHeader: false,
                                        connectionPooling: true,
                                        trustProxyHeaders: false,
                                    }],
                            }],
                    };
                    result = await client.createCloudWAFInstance(corpForCloudWAF, instanceData);
                }
                else if (typedArgs.action === 'get') {
                    result = await client.getCloudWAFInstance(corpForCloudWAF, typedArgs.deploymentId);
                }
                else if (typedArgs.action === 'update') {
                    const instanceData = {
                        name: typedArgs.name,
                        description: typedArgs.description,
                        region: typedArgs.region,
                        tlsMinVersion: typedArgs.tlsMinVersion,
                    };
                    result = await client.updateCloudWAFInstance(corpForCloudWAF, typedArgs.deploymentId, instanceData);
                }
                else if (typedArgs.action === 'delete') {
                    result = await client.deleteCloudWAFInstance(corpForCloudWAF, typedArgs.deploymentId);
                }
                break;
            case 'manage_users':
                const { corpName: corpForUsers } = resolveContext(typedArgs);
                if (typedArgs.action === 'list') {
                    result = await client.listCorpUsers(corpForUsers);
                }
                else if (typedArgs.action === 'get') {
                    result = await client.getCorpUser(corpForUsers, typedArgs.userEmail);
                }
                else if (typedArgs.action === 'update') {
                    const userData = {
                        role: typedArgs.role,
                        memberships: typedArgs.memberships,
                    };
                    result = await client.updateCorpUser(corpForUsers, typedArgs.userEmail, userData);
                }
                else if (typedArgs.action === 'invite') {
                    const userData = {
                        role: typedArgs.role,
                        memberships: typedArgs.memberships,
                    };
                    result = await client.inviteCorpUser(corpForUsers, typedArgs.userEmail, userData);
                }
                else if (typedArgs.action === 'delete') {
                    result = await client.deleteCorpUser(corpForUsers, typedArgs.userEmail);
                }
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    // Initialize from environment variables
    await initializeFromEnv();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Fastly NGWAF MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});