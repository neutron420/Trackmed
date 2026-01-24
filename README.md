<div align="center">

# TrackMed

<br/>

<div>
  <img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana">
  <img src="https://img.shields.io/badge/Anchor-563D7C?style=for-the-badge&logo=anchor&logoColor=white" alt="Anchor">
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
</div>

<br/>

**A blockchain-based pharmaceutical supply chain tracking system built on Solana, providing transparency, security, and traceability for medical products from manufacturer to end consumer.**

<p>
  <a href="#about-the-project">About</a> •
  <a href="#key-features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

</div>

## About The Project

TrackMed is a decentralized pharmaceutical supply chain management platform designed to combat counterfeit drugs and ensure product authenticity throughout the distribution network. Built on Solana blockchain, the system creates an immutable record of each pharmaceutical product's journey from manufacturing through distribution to the final consumer, providing complete transparency and accountability for all stakeholders.

### Built With

This project leverages Solana blockchain technology and a modern full-stack architecture for high-performance supply chain tracking.

* **Blockchain:** [Solana](https://solana.com/)
* **Smart Contract Framework:** [Anchor](https://www.anchor-lang.com/)
* **Smart Contract Language:** [Rust](https://www.rust-lang.org/)
* **Frontend/Backend:** [TypeScript](https://www.typescriptlang.org/), [Node.js](https://nodejs.org/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **Infrastructure:** [Docker](https://www.docker.com/), [Nginx](https://nginx.org/)
* **Package Manager:** [Yarn](https://yarnpkg.com/)
* **Code Formatting:** [Prettier](https://prettier.io/)

## Key Features

* **Immutable Record Keeping:** All transactions recorded on Solana blockchain for permanent traceability
* **Product Provenance Tracking:** Complete journey tracking from manufacturer to consumer
* **Authenticity Verification:** Prevent counterfeit drugs from entering the supply chain
* **Multi-Party Support:** Manage manufacturers, distributors, retailers, and regulatory oversight
* **Real-Time Visibility:** Track product location and status throughout the supply chain
* **High Performance:** Built on Solana for fast transactions and minimal fees
* **Decentralized Architecture:** No single point of failure or control

## Getting Started

To get a local copy up and running for development, follow these simple steps.

### Prerequisites

You will need Node.js (version 16 or higher), Rust and Cargo, Solana CLI, Anchor Framework, and Docker with Docker Compose installed on your system.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/neutron420/Trackmed.git
    cd Trackmed
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project by copying `.env.docker`.
    ```bash
    cp .env.docker .env
    ```
    Configure your environment variables for:
    * Solana network configuration
    * Database connection string
    * API endpoints
    * Other service configurations

4.  **Build Solana programs:**
    ```bash
    anchor build
    ```

5.  **Run tests:**
    ```bash
    anchor test
    ```

6.  **Run with Docker (Development):**
    ```bash
    docker-compose up
    ```

7.  **Run with Docker (Production):**
    ```bash
    docker-compose -f docker-compose.prod.yml up
    ```

## Project Structure

```
trackmed/
├── apps/              # Frontend applications
├── programs/          # Solana smart contracts (Anchor/Rust)
├── services/          # Backend services
├── packages/idl/      # Interface Definition Language files
├── migrations/        # Database migrations
├── tests/             # Test suites
└── infra/nginx/       # Infrastructure configuration
```

## Supply Chain Participants

* **Regulator/Administrator:** Registers and approves participants, issues licenses, oversees compliance
* **Manufacturer:** Records new medicine batches on-chain, provides product details
* **Distributor/Wholesaler:** Receives and validates products, distributes to retailers
* **Retailer/Pharmacy:** Receives products, verifies integrity, sells to consumers
* **Consumer:** Verifies product authenticity and views complete product history

## Smart Contract Functions

The Solana program includes core instructions for supply chain management:

* `initialize_manufacturer` - Register a new manufacturer
* `create_product` - Add new product to the blockchain
* `transfer_product` - Transfer product ownership between parties
* `update_product_status` - Update product condition and status
* `verify_product` - Check product authenticity and history

## Deployment

### Deploy Solana Program

1. Configure your Solana cluster in `Anchor.toml`
2. Build the program:
   ```bash
   anchor build
   ```
3. Deploy to devnet/mainnet:
   ```bash
   anchor deploy
   ```

### Deploy Application

Use the production Docker Compose configuration:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Resources

* [Solana Documentation](https://docs.solana.com/)
* [Anchor Framework Documentation](https://www.anchor-lang.com/)
* [Pharmaceutical Supply Chain Best Practices](https://www.fda.gov/drugs/drug-supply-chain-integrity)

Project Link: [https://github.com/neutron420/Trackmed](https://github.com/neutron420/Trackmed)
