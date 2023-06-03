import { useEffect, useState, useRef } from "react"
import checkContractStatus from "@/utils/checkContractStatus"
import { VStack, Text, HStack, Spinner } from "@chakra-ui/react"
import Button from "../Button"
import { ContractStatus } from "@/interfaces/ContractStatus.interface"
import ContractInfo from "./components/ContractInfo"
import TruflationInfo from "./components/TruflationInfo"
import MaticInfo from "./components/MaticInfo"
import StartManagement from "./components/StartManagement"
import OpsReport from "./components/OpsReport"

interface Props {
    contractAddress: string
}

export default function Contract({ contractAddress }: Props) {
    const role = useRef(sessionStorage.getItem("@ROLE"))
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [contractStatus, setContractStatus] = useState<ContractStatus>({
        isSetUp: false,
        isStated: false,
        IMOnumber: 0,
        roleUser: '',
        truflationContract: '',
        maticContract: '',
        totalAmountDueToPay: 0
    })

    useEffect(()=>{
        if (contractAddress) {
            const getContractStatus = async() => {
                const responseStatus = await checkContractStatus(contractAddress)
                if (role.current)  {
                    setContractStatus({
                        isSetUp: responseStatus.isSetUp,
                        isStated: responseStatus.isStated,
                        IMOnumber: responseStatus.IMOnumber,
                        roleUser: role.current,
                        truflationContract: responseStatus.truflationContract,
                        maticContract: responseStatus.maticContract,
                        totalAmountDueToPay: responseStatus.totalAmountDueToPay
                    })
                    setIsLoading(false)
                }
            }
            getContractStatus()
        }
    },[contractAddress])

    return (
        <VStack
            p={4}
            m={4}
            w="100%"
            border="1px dashed brown"
            rounded="md"
            boxShadow="base"
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
                    <OpsReport contractAddress={contractAddress} contractStatus={contractStatus} />
                    <StartManagement contractAddress={contractAddress} contractStatus={contractStatus} />            
                </>
            }
        </VStack>
    )
}