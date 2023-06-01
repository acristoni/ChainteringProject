import Button from "@/components/Button";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import { HStack, Text } from "@chakra-ui/react";

interface Props {
    contractAddress: string;
    contractStatus: ContractStatus
}

export default function StartManagement({ contractAddress, contractStatus }: Props) {
    return (
        <>
            {
                !contractStatus.isStated && 
                contractStatus.roleUser === "CHARTERER" ?
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
                !contractStatus.isStated && 
                <Text as="b" color="red.700">
                    Contract has not commenced yet, only the charterer can initiate the charter period of the vessel.
                </Text>
            }
        </>
    )
}