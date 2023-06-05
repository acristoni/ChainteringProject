
import connectWallet from "@/utils/userInteractions/connectWallet";
import checkNetwork from "@/utils/userInteractions/checkNetwork"

const handleConnectButton = async(setIsLoading: (value: boolean) => void,router: any) => {
    setIsLoading(true)
    const isOnMumbai = await checkNetwork().catch(error => {
        console.error('Ocorreu um erro:', error);
        setIsLoading(false)
    });
    
    if (isOnMumbai) {
        const responseConnection = await connectWallet()
        if (typeof responseConnection === 'string') {
            if (responseConnection === "registeredUser") {
                if (router.asPath === '/dashboard') {
                    router.reload()
                } else {
                    router.push('/dashboard')
                }
                setIsLoading(false)
            }
            if (responseConnection === "choseRole") {
                router.push('/chooserole');
                setIsLoading(false)
            }
        }
    }
}    

export default handleConnectButton
