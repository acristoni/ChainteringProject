import { VStack } from "@chakra-ui/react";
import Header from "../components/Header"

export default function Home() {
  return (
    <VStack 
      w="100%"
      h="100%"
      minH="100vh"
    >
      <Header/>
     
    </VStack>
  )
}
