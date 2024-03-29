import React, { createContext, useState, useEffect } from 'react'
const context = createContext(null)

const OrgsProvider = ({ children }) => {
  const [orgs, setOrgs] = useState([])

  useEffect(() => {
    fetch('/gitprofile/orgs')
      .then((res) => {
        return res.json()
      })
      .then((res) => setOrgs(res))
      .catch((err) => {
        console.error(err)
      })
  }, [])

  return <context.Provider value={orgs}>{children}</context.Provider>
}

OrgsProvider.context = context
export default OrgsProvider
