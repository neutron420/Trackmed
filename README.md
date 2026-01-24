<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrackMed - Project Overview</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f7f6;
        }
        header {
            background-color: #2c3e50;
            color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { margin: 0; font-size: 2.5em; }
        h2 {
            color: #2980b9;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        h3 { color: #16a085; }
        ul { padding-left: 20px; }
        li { margin-bottom: 10px; }
        code {
            background-color: #f8f9fa;
            padding: 2px 5px;
            border-radius: 4px;
            font-family: 'Courier New', Courier, monospace;
            border: 1px solid #ddd;
        }
        pre {
            background-color: #2d3436;
            color: #dfe6e9;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 0.9em;
        }
        hr { border: 0; height: 1px; background: #eee; margin: 20px 0; }
        .tech-tag {
            display: inline-block;
            background: #e1f5fe;
            color: #01579b;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            margin-right: 5px;
        }
    </style>
</head>
<body>

<header>
    <h1>TrackMed</h1>
    <p>Decentralized Medicine Tracking & Anti-Counterfeiting System</p>
</header>

<div class="container">
    <h2>Project Overview</h2>
    <p>
        TrackMed is a sophisticated supply chain solution designed to combat counterfeit pharmaceuticals using the Solana blockchain. The system creates a bridge between physical medical batches and immutable digital records, ensuring transparency from production to the end-user.
    </p>

    <h2>System Architecture</h2>
    <p>The project follows a hybrid architectural model to optimize for both security and operational efficiency:</p>
    
    <h3>Blockchain Layer (Solana)</h3>
    <ul>
        <li>Stores immutable proof of manufacturing including batch hashes, wallet addresses, and production/expiry dates.</li>
        <li>Enforces manufacturer verification through an on-chain registry before any batch can be registered.</li>
        <li>Manages real-time status updates (e.g., Valid or Recalled).</li>
    </ul>

    <h3>Database Layer (PostgreSQL)</h3>
    <ul>
        <li>Manages relational business data such as detailed medicine compositions, manufacturer textual profiles, and user accounts.</li>
        <li>Logs scan history with geographic data to identify potential fraud patterns.</li>
        <li>Maps physical QR codes to their corresponding blockchain records.</li>
    </ul>

    <h2>Core Services</h2>
    <ul>
        <li><strong>Admin Backend:</strong> Built with Node.js and Express to manage administrative functions, manufacturer registration, and batch verification.</li>
        <li><strong>User Backend:</strong> Handles consumer interactions, including QR code scanning and profile management.</li>
        <li><strong>WebSocket Server:</strong> Provides real-time communication for live fraud alerts and system notifications.</li>
        <li><strong>Frontend Apps:</strong> Responsive Next.js dashboards for both administrators and manufacturers.</li>
    </ul>

    <h2>Technical Stack</h2>
    <div>
        <span class="tech-tag">Solana</span>
        <span class="tech-tag">Anchor Framework</span>
        <span class="tech-tag">Rust</span>
        <span class="tech-tag">Node.js</span>
        <span class="tech-tag">TypeScript</span>
        <span class="tech-tag">Next.js</span>
        <span class="tech-tag">PostgreSQL</span>
        <span class="tech-tag">Docker</span>
    </div>

    <h2>Development Setup</h2>
    
    <h3>Deployment with Docker</h3>
    <p>The environment is orchestrated using Docker Compose, which manages the database, Redis, and all backend services:</p>
    <pre><code>docker-compose up -d</code></pre>

    <h3>Smart Contract Build</h3>
    <p>Navigate to the Solana program directory to build the contract and generate the required IDL for the backend:</p>
    <pre><code>anchor build
anchor idl parse -f programs/solana_test_project/src/lib.rs -o admin-be/src/idl/solana_test_project.json</code></pre>

    <hr>
    <p style="text-align: center; color: #7f8c8d; font-size: 0.9em;">
        TrackMed - Securing the Pharmaceutical Supply Chain
    </p>
</div>

</body>
</html>
