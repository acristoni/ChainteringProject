import Contract from "../Contract"



interface Props {
    contractsAddresses: string[]
}

export default function AllContracts({ contractsAddresses }: Props) {
    return (
        <>
            {
                contractsAddresses.length &&
                contractsAddresses.map(contractAddress => 
                    <Contract 
                        key={contractAddress}
                        contractAddress={contractAddress}
                    />    
                )
            }
        </>
    )
}