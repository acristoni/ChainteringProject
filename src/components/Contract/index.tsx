import { useEffect, useState, useRef } from "react"
import checkContractSetUp from "@/utils/checkContractSetUp"
import { VStack, Text, HStack } from "@chakra-ui/react"
import Button from "../Button"
import checkContractStarted from "@/utils/checkContractStarted"

interface Props {
    contractAddress: string
}

export default function Contract({ contractAddress }: Props) {
    const role = useRef(sessionStorage.getItem("@ROLE"))
    const [isContractStarted, setIsContractStarted] = useState<boolean>(false)
    const [vesselId, setVesselId] = useState<number>(0)

    useEffect(()=>{
        if (contractAddress) {
            const contractSetUp = async() => {
                const responseCheckContractSetUp = await checkContractSetUp(contractAddress)
                setVesselId(responseCheckContractSetUp.IMOnumber)
            }
            contractSetUp()

            const contractStarted = async() => {
                const responseCheckContractStarted = await checkContractStarted(contractAddress)
                setIsContractStarted(responseCheckContractStarted)
            }
            contractStarted()
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
            <Text as='b' style={{margin: 0}}>Contract Address:</Text>
            <Text style={{margin: 0}}>{contractAddress}</Text>
            <Text as='b' style={{margin: 0, marginTop: 4}}>Vessel IMO number:</Text>
            <Text style={{margin: 0}} textAlign="center">{vesselId}</Text>
            {
                !isContractStarted && 
                role.current === "CHARTERER" ?
                <HStack
                    w="100%"
                    justify="end"
                >
                    <Button 
                        onClick={()=>console.log(contractAddress)}
                    >
                        <Text>Start Contract</Text>
                    </Button>
                </HStack> : 
                !isContractStarted && 
                <Text as="b" color="red.700">
                    Contract has not commenced yet, only the charterer can initiate the charter period of the vessel.
                </Text>
            }
        </VStack>
    )
}