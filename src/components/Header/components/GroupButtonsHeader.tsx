import { 
    useMediaQuery,
    Flex } from "@chakra-ui/react"
import ButtonHeader from './ButtonHeader'

export default function GroupButtonsHeader() {
    const [isMobile] = useMediaQuery('(max-width: 900px)')

    return (
        <Flex 
            w={isMobile ? "auto" : "520px"}
            h={isMobile ? "40px" : "auto"}
            flexDirection={isMobile ? "column" : "row"}
            justify="space-between"
            align={isMobile ? "end" : "center"}
        >
            <ButtonHeader 
                isLoading={false}
                title="Documentation" 
                onClick={async () => console.log('eita lasqueira')}
            />
        </Flex>
    )
}