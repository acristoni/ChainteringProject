import Button from "../Button";
import Contract from "../Contract"
import { Text, VStack } from "@chakra-ui/react"



interface Props {
    contractsAddresses: string[];
    setIsDeploingNewContract: (value: boolean) => void
}

export default function AllContracts({ contractsAddresses, setIsDeploingNewContract }: Props) {
    return (
        <VStack pb={6} w="100%">
            {
                contractsAddresses.length &&
                contractsAddresses.map(contractAddress => 
                    <Contract 
                        key={contractAddress}
                        contractAddress={contractAddress}
                    />    
                )
            }
            <Button onClick={()=>setIsDeploingNewContract(true)}>
                <Text>Deploy New Contract</Text>
            </Button>
        </VStack>
    )
}