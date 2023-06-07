import { useEffect, useState, useRef } from "react"
import checkContractStatus from "@/utils/contractInteractions/checkContractStatus"
import { VStack, Spinner } from "@chakra-ui/react"
import { ContractStatus } from "@/interfaces/ContractStatus.interface"
import ContractInfo from "./components/ContractInfo"
import TruflationInfo from "./components/TruflationInfo"
import MaticInfo from "./components/MaticInfo"
import StartManagement from "./components/StartManagement"
import OpsReport from "./components/OpsReport"
import BadWeatherReport from "./components/BadWeatherReport"
import Disputes from "./components/Disputes"
import FuelSupplyReport from "./components/FuelSupplyReport"

interface Props {
    contractAddress: string
}

export default function Contract({ contractAddress }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [ contractStatus, setContractStatus] = useState<ContractStatus>({
        isSetUp: false,
        isStarted: false,
        IMOnumber: 0,
        roleUser: '',
        truflationContract: '',
        maticContract: '',
        totalAmountDueToPay: 0,
        oilTotalConsuption: 0
    })

    useEffect(()=>{
        if (contractAddress && typeof window !== 'undefined') {
            const role = sessionStorage.getItem("@ROLE")
            if (role) {
                const getContractStatus = async() => {
                    const responseStatus = await checkContractStatus(contractAddress)
                    if (responseStatus &&
                        responseStatus !== true) {
                        setContractStatus({
                            isSetUp: responseStatus.isSetUp,
                            isStarted: responseStatus.isStarted,
                            IMOnumber: responseStatus.IMOnumber,
                            roleUser: role,
                            truflationContract: responseStatus.truflationContract,
                            maticContract: responseStatus.maticContract,
                            totalAmountDueToPay: responseStatus.totalAmountDueToPay,
                            oilTotalConsuption: responseStatus.oilTotalConsuption
                        })
                    } else {
                        alert("There was an issue while attempting to process your request. Please try again later or contact us.")
                    }
                    setIsLoading(false)
                }
                getContractStatus()
            }
        }
    },[contractAddress])

    return (
        <VStack
            p={4}
            m={4}
            w="100%"
            rounded="md"
            boxShadow="xl"
        >
            {
                isLoading ?
                <Spinner
                    thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='blue.500'
                    size='xl'
                /> :
                <>
                    <ContractInfo contractAddress={contractAddress} contractStatus={contractStatus} />
                    <TruflationInfo contractStatus={contractStatus} />
                    <MaticInfo contractStatus={contractStatus} />
                    <BadWeatherReport contractAddress={contractAddress} contractStatus={contractStatus} />
                    <FuelSupplyReport contractAddress={contractAddress} contractStatus={contractStatus} />
                    <OpsReport contractAddress={contractAddress} contractStatus={contractStatus} />
                    <Disputes contractAddress={contractAddress} contractStatus={contractStatus} />
                    <StartManagement contractAddress={contractAddress} contractStatus={contractStatus} />            
                </>
            }
        </VStack>
    )
}