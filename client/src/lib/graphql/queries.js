import { ApolloClient, ApolloLink, InMemoryCache, concat, createHttpLink, gql } from '@apollo/client'
import { getAccessToken } from '../auth'

// below links are used to chain link to graphql request.
// we can add custom headers using this way in Apollo Client
// operation is the query we are executing ex: Jobs
const httpLink = createHttpLink({ uri: 'http://localhost:9000/graphql' })
const headerLink = new ApolloLink((operation, forward) => {
    const accessToken = getAccessToken()
        if(accessToken)
            operation.setContext({
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
        return forward(operation)
})
const apolloClient = new ApolloClient({
    link: concat(headerLink, httpLink),
    cache: new InMemoryCache()
})

export async function getJobs() {
    const query = gql`
        query Jobs {
            jobs {
                id
                date
                title
                company {
                    id
                    name
                }
            }
        }
    `
    const { data } = await apolloClient.query({ query })
    return data.jobs
}

export async function getJob(id) {
    const query = gql`
        query JobById($id: ID!) {
            job(id: $id) {
                id
                date
                title
                company {
                    id
                    name
                }
                description
            }
        }
    `
    const { data } = await apolloClient.query({ query, variables: { id } })
    return data.job
}

export async function getCompany(id) {
    const query = gql`
        query companyById($id: ID!) {
            company(id: $id) {
                id
                name
                description
                jobs {
                    id
                    date
                    title
                }
            }
        }
    `
    const { data } = await apolloClient.query({ query, variables: { id } })
    return data.company
}


export async function createJob({ title, description }) {
    const mutation = gql`
        mutation CreateJob($input: CreateJobInput!) {
            job: createJob(input: $input) {
                id
            }
        }
    `
    const accessToken = getAccessToken()
    const { data } = await apolloClient.mutate({ 
        mutation, 
        variables: {
            input: {
                title,
                description
            }
        }
        // this is also a way to send headers
        // context: {
        //     headers: { 'Authorization': `Bearer ${accessToken}` }
        // } 
    })
    return data.job
}