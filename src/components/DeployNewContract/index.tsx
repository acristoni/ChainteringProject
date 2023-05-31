import { Box } from "@chakra-ui/react";
import { useState } from "react";
import DeployTruflation from "../DeployTruflation";
import DeployPriceMatic from "../DeployPriceMatic";
import DeployCharter from "../DeployCharter";
import SetUpCharter from "../SetUpCharter";
import ConnectTruflation from "../ConnectTruflation";
import DepositLinkTruflation from "../DepositLinkTruflation";
import ConnectMaticPrice from "../ConnectMaticPrice";
import DepositLinkMatic from "../DepositLinkMatic";
import FinishNewContract from "../FinishNewContract";

export default function DeployNewContract() {
    const [step, setStep] = useState<number>(1) //1-truflation contract, 2-price matic dolar, 3-ship charter contract, 4-setup contract

    return (
        <Box>
            {
                step === 1 ?
                <DeployTruflation setStep={setStep}/> :
                step === 2 ?
                <DeployPriceMatic setStep={setStep}/> :
                step === 3 ?
                <DeployCharter setStep={setStep}/> :
                step === 4 ?
                <SetUpCharter setStep={setStep}/> :
                step === 5 ?
                <ConnectTruflation setStep={setStep} /> :
                step === 6 ?
                <DepositLinkTruflation setStep={setStep} /> :
                step === 7 ? 
                <ConnectMaticPrice setStep={setStep} /> :
                step === 8 ?
                <DepositLinkMatic setStep={setStep} /> :
                step === 9 &&
                <FinishNewContract />
            }
        </Box>
    )
}