import { VStack, useMediaQuery, Text } from "@chakra-ui/react";
import Header from "../components/Header"
import CardRole from "@/components/CardRole";

export default function Choserole() {
  const [isMobile] = useMediaQuery('(max-width: 900px)')
  
  return (
    <VStack 
      w="100%"
      h="100%"
      minH="100vh"
    >
      <Header/>
      <VStack 
        pt={isMobile ? "25%" : "8vh"}
        w="100%"
        h="100%"
        minH="100vh"
        justify="space-evenly"
        align="center"
      >
        <Text 
          as='b'
          fontFamily="EB Garamond"
          fontSize="3xl"
        >Choose Your Role</Text>
        <CardRole title={"SHIPOWNER"} role={"SHIPOWNER"} />
        <CardRole title={"CHARTERER"} role={"CHARTERER"} />
        <CardRole title={"ARBITER"} role={"ARBITER"} />
      </VStack>
    </VStack>
  )
}
