import { useEffect, useState } from "react";
import { VStack, useMediaQuery, Text } from "@chakra-ui/react";
import Header from "../components/Header"
import getContractByPartie from "@/services/getContractByPartie";
import DeployNewContract from "@/components/DeployNewContract";

export default function Dashboard() {
  const [isMobile] = useMediaQuery('(max-width: 900px)')
  const [contractsAddresses, setContractAddresses] = useState<string[]>([])

  useEffect(()=>{
    const role = sessionStorage.getItem("@ROLE")
    const wallet = sessionStorage.getItem("@WALLET")
    if (role && wallet) {
      const getContracts = async() => {
        const responseContracts = await getContractByPartie(role.toLowerCase(), wallet)
        if (responseContracts && responseContracts.success) {
          setContractAddresses(responseContracts.data)
        } else {
          alert("We were unable to retrieve your contracts. Please try again later or contact us for assistance.")
        }        
      }
      getContracts()
    }
  },[])
  
  return (
    <VStack 
      w="100%"
      h="100%"
      minH="100vh"
      fontFamily="EB Garamond"
    >
      <Header/>
      <VStack 
        pt={["5vh", "7vh", "10vh", "10vh", "10vh"]}
        w="100%"
        h="100%"
        minH="100vh"
        align="center"
      >
        {
          contractsAddresses && contractsAddresses.length ?
          <></> :
          <>
            <Text 
              as='b'
              fontSize={['xl','xl','2xl','2xl','2xl']}
              style={{
                margin: '50px'
              }}
              padding={5}
              rounded="md"
              boxShadow="base"
              background="blue.800"
              color="white"
            >
                It appears that you don&apos;t have a contract in our system. I invite you to start your first contract with us.
            </Text>
            <DeployNewContract />
          </>
        }
      </VStack>
    </VStack>
  )
}
