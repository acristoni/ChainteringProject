import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { ContractStatus } from "@/interfaces/ContractStatus.interface";
import {Text, 
        Modal,
        ModalOverlay,
        ModalContent,
        ModalHeader,
        ModalFooter,
        ModalBody,
        Spinner,
        ModalCloseButton,
        useDisclosure, 
        VStack} from "@chakra-ui/react"
import requestLatestMaticPrice from "@/utils/contractInteractions/requestLatestMaticPrice";
import convertAmountDueToMatic from "@/utils/contractInteractions/convertAmountDueToMatic";
import formatNumber from "@/utils/convertFunctions/formatNumberToDecimal";
import paymentContract from "@/utils/contractInteractions/paymentContract";

interface Props {
    contractAddress: string;
}

export default function ContractPayment ({ contractAddress }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isMaticPriceUpdated, setIsMaicPriceUpdated] = useState<boolean>(false)
    const [mainText, setMainText] = useState<string>("")
    const {isOpen, onOpen, onClose} = useDisclosure()
    const [amounToPayInMatic, setAmountToPayInMatic] = useState(0)
    const [error, setError] = useState<boolean>(false)

    useEffect(()=>{
        setAmountToPayInMatic(0)
    },[])

    const handlePayButton = async() => {
        setError(false)
        setIsLoading(true)
        setMainText("We are working to updating the Matic price in US Dollars, as per the most recent quote, in your contract.")
        onOpen()
        const responseMaticPrice = await requestLatestMaticPrice(contractAddress)
        if (responseMaticPrice 
            && responseMaticPrice !== true
            && responseMaticPrice.hash 
            && responseMaticPrice.hash.length) {
                setError(false)
                setIsMaicPriceUpdated(true)
        } else {
            setMainText("There was an issue while attempting to process your request. Please try again later or contact us.")
            setError(true)
            setIsLoading(false)
        }      
    }

    useEffect(()=>{
        if (isMaticPriceUpdated) {
            setMainText("We are working on converting the amount due from US Dollars to Matic, as per the most recent quote.")
            const convertAmountDue = async() => {
                const responseConvertAmountDue = await convertAmountDueToMatic(contractAddress)
                if (responseConvertAmountDue 
                    && responseConvertAmountDue !== true) {
                        setError(false)
                        setMainText(`The amount to be paid is MATIC ${formatNumber(responseConvertAmountDue)}, would you like to proceed with the payment? Make sure you have the required amount in your account to make the payment.`)
                        setAmountToPayInMatic(responseConvertAmountDue)
                } else {
                    setError(true)
                    setMainText("There was an issue while attempting to process your request. Please try again later or contact us.")
                }     
                setIsLoading(false)
                setIsMaicPriceUpdated(false)
            }
            convertAmountDue()
        }
    },[isMaticPriceUpdated])

    const handlePayment = async() => {
        setIsLoading(true)
        const responsePayment = await paymentContract(contractAddress, amounToPayInMatic)
        if (responsePayment 
            && responsePayment !== true
            && responsePayment.hash 
            && responsePayment.hash.length) {
            setError(false)
            setMainText("You have successfully paid the amount due")
        } else {
            setError(true)
            setMainText("There was a problem during payment, please try again later or contact us. Make sure you have the required amount in your account to make the payment.")
        }    
        setIsLoading(false)
    }

    return (
        <>
            <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader fontFamily="EB Garamond">Payment of the amount due</ModalHeader>
                <ModalCloseButton />
                <ModalBody fontFamily="EB Garamond">
                    <VStack
                        align='center'
                    >
                        <Text as="b" color={error ? 'red' : 'black'}>{mainText}</Text>
                        {
                            isLoading &&
                            <Spinner
                                thickness='4px'
                                speed='0.65s'
                                emptyColor='gray.200'
                                color='blue.500'
                                size='xl'
                            />
                        }
                    </VStack>
                </ModalBody>
                {
                    !isLoading &&
                    <ModalFooter fontFamily="EB Garamond">
                        {
                            amounToPayInMatic ?
                            <Button onClick={handlePayment}>
                                <Text>Pay</Text>
                            </Button> :
                            <Button onClick={onClose}>
                                <Text>Ok</Text>
                            </Button>
                        }
                    </ModalFooter>
                }
                </ModalContent>
            </Modal>
            <Button onClick={handlePayButton}>
                <Text>Pay</Text>
            </Button>
        </>
    )
}