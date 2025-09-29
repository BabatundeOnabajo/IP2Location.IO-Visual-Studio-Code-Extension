import * as vscode from 'vscode';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'https://api.ip2location.io/';

interface IP2LocationResponse {
    ip: string;
    country_code?: string;
    country_name?: string;
    region_name?: string;
    city_name?: string;
    latitude?: number;
    longitude?: number;
    zip_code?: string;
    time_zone?: string;
    asn?: string;
    as?: string;
    is_proxy?: boolean;
    message?: string;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('IP2Location extension is now active!');

    // Register commands
    let lookupCommand = vscode.commands.registerCommand('ip2location.lookup', async () => {
        await lookupIP(context);
    });

    let lookupSelectionCommand = vscode.commands.registerCommand('ip2location.lookupSelection', async () => {
        await lookupSelectedIP(context);
    });

    let setApiKeyCommand = vscode.commands.registerCommand('ip2location.setApiKey', async () => {
        await setApiKey(context);
    });

    context.subscriptions.push(lookupCommand, lookupSelectionCommand, setApiKeyCommand);

    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ip2location.lookup';
    statusBarItem.text = '$(globe) IP Lookup';
    statusBarItem.tooltip = 'Click to lookup IP address';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

async function setApiKey(context: vscode.ExtensionContext) {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your IP2Location.IO API key',
        placeHolder: 'Your API key',
        password: true,
        ignoreFocusOut: true
    });

    if (apiKey) {
        await context.secrets.store('ip2location.apiKey', apiKey);
        vscode.window.showInformationMessage('IP2Location API key saved successfully!');
    }
}

async function getApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    // First try to get from secrets (secure storage)
    let apiKey = await context.secrets.get('ip2location.apiKey');
    
    // Fallback to settings (less secure but easier for some users)
    if (!apiKey) {
        const config = vscode.workspace.getConfiguration('ip2location');
        apiKey = config.get<string>('apiKey');
    }

    return apiKey;
}

async function lookupIP(context: vscode.ExtensionContext) {
    const ip = await vscode.window.showInputBox({
        prompt: 'Enter IP address to lookup',
        placeHolder: 'e.g., 8.8.8.8',
        validateInput: (value) => {
            if (!value) {
                return 'Please enter an IP address';
            }
            // Basic IP validation
            const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            if (!ipRegex.test(value) && value !== 'self') {
                return 'Please enter a valid IP address';
            }
            return null;
        }
    });

    if (ip) {
        await performLookup(ip, context);
    }
}

async function lookupSelectedIP(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor!');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection).trim();

    if (!selectedText) {
        vscode.window.showErrorMessage('Please select an IP address!');
        return;
    }

    await performLookup(selectedText, context);
}

async function performLookup(ip: string, context: vscode.ExtensionContext) {
    const apiKey = await getApiKey(context);
    
    if (!apiKey) {
        const choice = await vscode.window.showErrorMessage(
            'No API key found. Please set your IP2Location.IO API key.',
            'Set API Key',
            'Get Free API Key'
        );
        
        if (choice === 'Set API Key') {
            await setApiKey(context);
        } else if (choice === 'Get Free API Key') {
            vscode.env.openExternal(vscode.Uri.parse('https://www.ip2location.io/sign-up'));
        }
        return;
    }

    // Show progress
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Looking up IP: ${ip}`,
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ increment: 0 });

            // Get configured fields
            const config = vscode.workspace.getConfiguration('ip2location');
            const fields = config.get<string[]>('defaultFields') || [];

            // Make API request
            const url = ip === 'self' 
                ? `${API_BASE_URL}?key=${apiKey}`
                : `${API_BASE_URL}?key=${apiKey}&ip=${ip}`;

            const response = await axios.get<IP2LocationResponse>(url);
            const data = response.data;

            progress.report({ increment: 100 });

            if (data.message) {
                vscode.window.showErrorMessage(`IP2Location Error: ${data.message}`);
                return;
            }

            // Create and show webview with results
            showResultsWebview(data, context);

            // Also show quick pick for easy copying
            const quickPickItems = Object.entries(data)
                .filter(([key, value]) => fields.includes(key) && value !== undefined)
                .map(([key, value]) => ({
                    label: `${formatFieldName(key)}`,
                    description: String(value),
                    value: String(value)
                }));

            const selected = await vscode.window.showQuickPick(quickPickItems, {
                placeHolder: 'Select a field to copy to clipboard',
                canPickMany: false
            });

            if (selected) {
                await vscode.env.clipboard.writeText(selected.value);
                vscode.window.showInformationMessage(`Copied ${selected.label} to clipboard!`);
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to lookup IP: ${error.message}`);
        }
    });
}

function showResultsWebview(data: IP2LocationResponse, context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'ip2locationResults',
        `IP Location: ${data.ip}`,
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    panel.webview.html = getWebviewContent(data);
}

function getWebviewContent(data: IP2LocationResponse): string {
    const mapUrl = data.latitude && data.longitude 
        ? `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`
        : null;

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IP Location Results</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 20px;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
            }
            h1 {
                color: var(--vscode-foreground);
                border-bottom: 2px solid var(--vscode-panel-border);
                padding-bottom: 10px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 10px;
                margin-top: 20px;
            }
            .label {
                font-weight: bold;
                color: var(--vscode-foreground);
            }
            .value {
                color: var(--vscode-editor-foreground);
                user-select: text;
            }
            .proxy-warning {
                background-color: var(--vscode-inputValidation-errorBackground);
                color: var(--vscode-inputValidation-errorForeground);
                padding: 10px;
                border-radius: 4px;
                margin-top: 20px;
            }
            .map-link {
                display: inline-block;
                margin-top: 20px;
                padding: 8px 16px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                text-decoration: none;
                border-radius: 4px;
            }
            .map-link:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>IP Location Information</h1>
            <div class="info-grid">
                <div class="label">IP Address:</div>
                <div class="value">${data.ip || 'N/A'}</div>
                
                <div class="label">Country:</div>
                <div class="value">${data.country_name || 'N/A'} (${data.country_code || 'N/A'})</div>
                
                <div class="label">Region:</div>
                <div class="value">${data.region_name || 'N/A'}</div>
                
                <div class="label">City:</div>
                <div class="value">${data.city_name || 'N/A'}</div>
                
                <div class="label">Coordinates:</div>
                <div class="value">${data.latitude || 'N/A'}, ${data.longitude || 'N/A'}</div>
                
                <div class="label">ZIP Code:</div>
                <div class="value">${data.zip_code || 'N/A'}</div>
                
                <div class="label">Time Zone:</div>
                <div class="value">${data.time_zone || 'N/A'}</div>
                
                <div class="label">ASN:</div>
                <div class="value">${data.asn || 'N/A'}</div>
                
                <div class="label">ISP:</div>
                <div class="value">${data.as || 'N/A'}</div>
            </div>
            
            ${data.is_proxy ? '<div class="proxy-warning">⚠️ This IP is detected as a proxy!</div>' : ''}
            
            ${mapUrl ? `<a href="${mapUrl}" class="map-link">View on Google Maps</a>` : ''}
        </div>
    </body>
    </html>`;
}

function formatFieldName(fieldName: string): string {
    return fieldName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function deactivate() {}
