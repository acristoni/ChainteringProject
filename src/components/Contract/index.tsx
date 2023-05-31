import { VStack, Text } from "@chakra-ui/react"

interface Props {
    contractAddress: string
}

export default function Contract({ contractAddress }: Props) {
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
        </VStack>
    )
}