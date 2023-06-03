import { useEffect, useState, useRef } from "react";
import { VStack, useMediaQuery, Text } from "@chakra-ui/react";
import Header from "../components/Header"
import getContractByPartie from "@/services/getContractByPartie";
import DeployNewContract from "@/components/DeployNewContract";
import MainTextDashboard from "@/components/MainTextDashboard";
import AllContracts from "@/components/AllContracts";
import { ContractParties as IContractParties } from "../../interfaces/ContractParties.interface"

export default function Dashboard() {
  const [contractsAddresses, setContractAddresses] = useState<string[]>([])
  const [mainText, setMainText] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  
  useEffect(()=>{
    if (typeof window !== 'undefined') {
      const role = sessionStorage.getItem("@ROLE")
      if (role) setUserRole(role)
    }
  },[])

  useEffect(()=>{
    const wallet = sessionStorage.getItem("@WALLET")
    if (userRole && userRole.length && wallet) {
      const getContracts = async() => {
        const responseContracts = await getContractByPartie(userRole.toLowerCase(), wallet)
        if (responseContracts && responseContracts.success) {
          const arrayContractAddresses: string[] = []
          responseContracts.data.forEach((contract: IContractParties) => {
            arrayContractAddresses.push(contract.contractAddress)
          })
          setContractAddresses(arrayContractAddresses)
          if (responseContracts.data.length) {
            switch (userRole) {
              case 'SHIPOWNER':
                setMainText("These are the charter contracts for the vessels owned by your company.")
                break;
              case 'CHARTERER':
                setMainText("These are the charter contracts for the vessels your company is chartering.")
                break;
              case 'ARBITER':
                setMainText("These are the charter party contracts in which you have been appointed as the arbitrator.")
                break;
              default:
                break;
            }
          } else {
            setMainText("It appears that you don't have a contract in our system. I invite you to start your first contract with us.")
          }
        } else {
          alert("We were unable to retrieve your contracts. Please try again later or contact us for assistance.")
        }        
      }
      getContracts()
    }
  },[userRole])
  
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
        w="90%"
        h="100%"
        minH="100vh"
        maxW="800px"
        align="center"
      >
        <MainTextDashboard mainText={mainText}/>
        {
          contractsAddresses && contractsAddresses.length ?
          <AllContracts contractsAddresses={contractsAddresses}/> :
          <DeployNewContract />          
        }
      </VStack>
    </VStack>
  )
}
