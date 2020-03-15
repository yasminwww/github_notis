import React, { Fragment, useEffect, useContext, useState } from 'react'
import axios from 'axios'
import CardOfEvents from './cardOfEvents.js'
import CardOfRepos from './cardOfRepos.js'
import Settings from './settings.js'
import OrgsProvider from '../../contexts/OrgsProvider.jsx'


const Content = ({ avatar }) => {
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [githubUrl, setGithubUrl] = useState(null)
  const [apiUrl, setApiUrl] = useState(null)
  const [settings, setSettings] = useState(null)
  const [webhook, setWebhook] = useState(null)
  const [webhooks, setWebhooks] = useState(null)
  const [event, setEvent] = useState(null)
  const [repo, setRepo] = useState(null)
  const userOrganizations = useContext(OrgsProvider.context)


  const cleanValue = () => {
    if (
      event !== null ||
      repo !== null ||
      settings !== null ||
      webhook !== null
    ) {
      setSettings(null)
      setWebhook(null)
      setWebhooks(null)
      setEvent(null)
      setRepo(null)
    }
  }


  if (selectedOrg) {
    var { events_url, repos_url, hooks_url } = selectedOrg
  }


  const handleNavOption = (type) => {
    switch (type) {
      case 'events':
        setGithubUrl(events_url)
        setApiUrl('events')
        break
      case 'repos':
        setGithubUrl(repos_url)
        setApiUrl('repos')
        break
      case 'hook':
        // TODO: change here: add a function to fire of "createWebhook"
        // setGithubUrl(hooks_url)
        // TODOD: this function is not needed here:
        // setApiUrl('webhook')

        // 1. Get hooks and render
        fetchWebhooks()
        break
      case 'settings':
        fetchSettings()
        break
      default:
        return null
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      const url = `gitprofile/${apiUrl}`
      const propertyData = await axios.post(url, {
        data: {
          githubUrl: githubUrl,
          orgname: selectedOrg
            ? selectedOrg.login
            : null
        },
        headers: {
          'Content-Type': 'application/json'
        },
      })
      apiUrl === 'events' ?
        await setEvent(propertyData.data) :
        await setRepo(propertyData.data)
    }
    fetchData()
  }, [githubUrl])


  const fetchSettings = async () => {
    const url = '/gitprofile/settings'
    const settingsData = await axios.post(url, {
      data: {
        org: selectedOrg.login
      },
      headers: {
        'Content-Type': 'application/json'
      },
    }).catch(err => console.log('fetchSettings: ', err))
    await setSettings(settingsData.data)
  }

  const fetchWebhooks = async () => {
    const url = '/gitprofile/webhook'
    const webhooks = await axios.get(url)
      .catch(err => console.log('fetchWebhook: ', err))
    console.log('webhook: ', webhooks.data.webhooks)
    await setWebhooks(webhooks.data.webhooks)
  }


  // TODO. clean up this mess
  return (
    <Fragment>
      <div
        className='card'>
        <img
          alt='profile avatar'
          style={{ width: '18rem' }}
          src={avatar}
        />
        <div className='card-header'>
          Organizations:
        </div>
        <ul
          className='list-group list-group-flush'
          key='orgs-list'
        >
          {
            Object.keys(userOrganizations).map(key => {
              return (
                <li
                  onClick={cleanValue}
                  className='list-group-item'
                  key={userOrganizations[key].login}
                >
                  <a
                    href='#orgs'
                    className='card-link'
                    key={userOrganizations[key].login}
                    onClick={() => setSelectedOrg(userOrganizations[key])}
                  >
                    <img
                      alt='organization avatar'
                      style={{ width: '2rem', marginRight: '5px' }}
                      src={userOrganizations[key].avatar_url}
                    />
                    {userOrganizations[key].login}
                  </a >
                </li>
              )
            })
          }
        </ul>
      </div>
      <div className='child'>
        <>
          {
            selectedOrg &&
            <div className='flex-container'>
              <ul className='navbar navbar-expand-sm'>
                <li className='navbar-nav'>
                  <div
                    className='nav-link'
                    style={{ color: '#17a2b8' }}>
                    {
                      selectedOrg &&
                      selectedOrg.login
                    }

                  </div>
                  <a
                    className='nav-link btn btn-link'
                    onClick={() => handleNavOption('events')}

                  >
                    Events
						      </a>
                  <a
                    className='nav-link btn btn-link'
                    onClick={() => handleNavOption('repos')}
                  >
                    Repos
						      </a>
                  <a
                    href='#hook'
                    className='nav-link btn btn-link'
                    onClick={() => handleNavOption('hook')}
                  >
                    Webhooks
						      </a>
                  <a
                    href='#settings'
                    className='nav-link btn btn-link'
                    onClick={() => handleNavOption('settings')}
                  >
                    Settings
						      </a>
                </li>
              </ul>
              <div>
                {
                  apiUrl === 'events' && event &&
                  <CardOfEvents events={event} />
                }
                {
                  apiUrl === 'repos' && repo &&
                  <CardOfRepos repos={repo} />
                }
                {
                  webhooks &&
                  <SlackWebhook webhooksList={webhooks} />
                }
                {
                  settings &&
                  <Settings org={selectedOrg.login} settingsArray={settings} />
                }

              </div>
            </div>
          }
        </>
      </div>
    </Fragment>
  )
}

const SlackWebhook = ({ webhooksList }) => {
  console.log('SlackWebhook: ', (webhooksList))
  if (webhooksList) {
    return (
      <div>
        If you are unsure on how to create a Slack webhook key, check out the docs
        <a target='_blank'
          href='https://slack.com/intl/en-se/help/articles/115005265063-Incoming-Webhooks-for-Slack'
          rel='noopener noreferrer'>
          here
        </a>.
      ....psst, it's super easy.
      </div>

    )
  }
}



export default Content