import { VStack } from "@chakra-ui/react";
import Header from "../components/Header"
import MainBanner from "@/components/MainBanner";
import Banner from "@/components/Banner";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <VStack 
      w="100%"
      h="100%"
      minH="100vh"
    >
      <Header/>
      <MainBanner />
      <Banner 
        text="Accurate and transparent contract information: Our dApp integrates with reliable oracle to provide real-time data, including oil barrel prices and the Matic token exchange rate in USD. This ensures that the charterer's payments to the shipowner are adjusted accurately, guaranteeing transparency and fairness."
        imgSrc="/images/chart.png"
        imgAlt="Chart Line"
        reverse
      />
      <Banner 
        text="Weather insights for special contract conditions: By synchronizing with weather forecasts, our dApp allows for the inclusion of special contract clauses based on weather conditions. In situations where weather may impact the voyage, the contract automatically adjusts to protect the interests of both parties."
        imgSrc="/images/cloud.png"
        imgAlt="Cloud"
      />
      <Banner 
        text="Precise distance calculations: Our dApp employs the Haversine formula to accurately calculate the distance between the vessel's departure and arrival points. This reliable calculation method ensures precise payment calculations and other essential considerations."
        imgSrc="/images/pi.png"
        imgAlt="Pi"
        reverse
      />
      <Banner 
        text="Transparent dispute resolution: In the rare event of a dispute between parties, our contracts are equipped with a panel of expert arbitrators who will impartially resolve any disagreements. This feature provides an added layer of security and fairness to the chartering process."
        imgSrc="/images/scale.png"
        imgAlt="Scale"
      />
      <Banner 
        text="Transparency, security, and efficiency at its core: Our dApp offers unparalleled transparency by eliminating unnecessary intermediaries from the chartering process. You can trust the security provided by blockchain technology, as it safeguards your data and transactions against tampering. Experience an efficient and streamlined chartering process through our smart contracts."
        imgSrc="/images/network.png"
        imgAlt="Network"
        reverse
      />
      <Banner 
        text="User-friendly interface for all: We've designed our dApp to be user-friendly and accessible to everyone, regardless of their blockchain experience. Our intuitive interface ensures that anyone can participate in vessel chartering with ease and convenience."
        imgSrc="/images/easy.png"
        imgAlt="Easy"
      />
      <CallToAction />
    </VStack>
  )
}
