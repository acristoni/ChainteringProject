# Chaintering
*Blockchain-Powered Vessel Charter Contracts*

Experience the future of vessel chartering with our dApp, leveraging the power of blockchain technology. Say goodbye to traditional contracts and embrace the transparency and security of smart contracts.

[![Project Presentation](https://img.youtube.com/vi/SJy-NbGv1bg/0.jpg)](https://www.youtube.com/watch?v=SJy-NbGv1bg "Project Presentation")

## Accurate and transparent contract information

Our dApp integrates with a reliable oracle to provide real-time data, including oil barrel prices and the Matic token exchange rate in USD. This ensures that the charterer's payments to the shipowner are adjusted accurately, guaranteeing transparency and fairness.

## Weather insights for special contract conditions

By synchronizing with weather forecasts, our dApp allows for the inclusion of special contract clauses based on weather conditions. In situations where weather may impact the voyage, the contract automatically adjusts to protect the interests of both parties.

## Precise distance calculations

Our dApp employs the Haversine formula to accurately calculate the distance between the vessel's departure and arrival points. This reliable calculation method ensures precise payment calculations and other essential considerations.

## Transparent dispute resolution

In the rare event of a dispute between parties, our contracts are equipped with a panel of expert arbitrators who will impartially resolve any disagreements. This feature provides an added layer of security and fairness to the chartering process.

## Transparency, security, and efficiency at its core

Our dApp offers unparalleled transparency by eliminating unnecessary intermediaries from the chartering process. You can trust the security provided by blockchain technology, as it safeguards your data and transactions against tampering. Experience an efficient and streamlined chartering process through our smart contracts.

## User-friendly interface for all

We've designed our dApp to be user-friendly and accessible to everyone, regardless of their blockchain experience. Our intuitive interface ensures that anyone can participate in vessel chartering with ease and convenience.

# Project Installation Instructions

This project features a smart contract written in Solidity and utilizes the Hardhat framework for testing and scripts. Follow the steps below to run the project locally:

1. Install Dependencies:
 ```
 npm install
 ```
2. Compile Smart Contracts:

```
npx hardhat compile
```
3. Run Contract Tests (Optional):
   - The main smart contract, `shipChartering.sol`, has been thoroughly tested to ensure its functionality and reliability.
   - If you would like to run the contract tests, execute the following command in your terminal:
     ```
     npx hardhat test
     ```
   - Running the tests will verify that the smart contract functions as expected and help ensure the integrity of the application.
   - The test suite covers various scenarios and edge cases to validate the contract's behavior under different conditions.
   - Reviewing the test results will give you confidence in the reliability and correctness of the contract implementation.

4. Configure Environment Variables:
- Rename the `.env.example` file in the project's root directory to `.env`.
- Open the `.env` file and fill in the necessary configuration values.
  - To set up the project, you will need to configure an account on MongoDB Atlas and a node provider (e.g., Alchemy).

5. Deployed Application:
- If you prefer to skip the local setup, you can access the deployed application [here](https://chaintering-project.vercel.app/).

6. Run Next.js Application Locally:
- Development Mode:
  ```
  npm run dev
  ```
- Production Mode:
  - Build the application first:
    ```
    npm run build
    ```
  - Start the application:
    ```
    npm run start
    ```

Please note that the above instructions assume you have Node.js and npm installed on your system. Adjust the commands accordingly if you are using a different package manager.

Make sure to follow the steps carefully to set up the project locally and start the Next.js application. Enjoy exploring the Ship Chartering project!
