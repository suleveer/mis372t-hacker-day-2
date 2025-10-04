import {createContext, useContext, useState} from 'react'

const NameContext = createContext();

export const NameContextProvider = ({children}) => {
    const [name, setName] = useState("");
    
    const updateName = newName => setName(newName)

    return(
        <NameContext.Provider value = {{name, updateName}}>
            {children}
        </NameContext.Provider>
    );
}

export const useName = () => useContext(NameContext)