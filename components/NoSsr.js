import dynamic from "next/dynamic"

export const ClientRendered = dynamic(() => Promise.resolve(({ children }) => (
    <>
        {children}
    </>
)), { ssr: false });

