import React, { createContext, useState, useEffect } from 'react'
const context = createContext(null)

const UserProvider = ({ children }) => {
    const [user, setUser] = useState([])

    useEffect(() => {
        fetch('/gitprofile')
            .then((res) => res.json())
            .then((res) => setUser(res))
            .catch((err) => {
                console.error(err)
            })
    }, [])

    return <context.Provider value={user}>{children}</context.Provider>
}

UserProvider.context = context
export default UserProvider
