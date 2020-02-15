import React, { useContext, useState, useEffect } from 'react'
import OrgsProvider from '../../contexts/OrgsProvider.jsx'
// import _ from 'lodash'



const Card = () => {

    const userOrganizations = useContext(OrgsProvider.contexto)
    console.log(userOrganizations)
    let count = 0

    const iterateOrganizations = () => {
        Object.entries(userOrganizations).map(([key, value]) => console.log(userOrganizations[key].login))
    }

    // TODO: Instead of going to the repo URL, render link to component information about the organization 
    return (
        <div>
            <div className='card' style={{ width: '18rem' }}>
                <div className='card-header'>
                    Organizations:
                </div>
                <ul className='list-group list-group-flush' key={count++}>
                    {
                        Object.entries(userOrganizations).map(([key, value]) => {
                            return (
                                <li className='list-group-item' key={userOrganizations[key].login}>
                                    <a target='_blank' href={userOrganizations[key].url}>
                                        <img style={{ width: '2rem', marginRight: '5px' }} src={userOrganizations[key].avatar_url} />
                                        {userOrganizations[key].login}
                                    </a>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
            <div style={{ marginBottom: 20 }} />
        </div>
    )
}


export default Card