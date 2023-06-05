import { useState } from "react";
import { Avatar, HStack } from "@chakra-ui/react";
import { useRouter } from 'next/router';
import ButtonHeader from "./ButtonHeader";
import handleConnectButton from "@/utils/userInteractions/handleConnectButton"

export default function AvatarConnectWallet() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter();
    
    return (
        <HStack>
            <ButtonHeader 
                title="ConnectWallet" 
                onClick={()=>handleConnectButton(setIsLoading, router)} 
                isLoading={isLoading}
            />
        </HStack>
    )
} 
