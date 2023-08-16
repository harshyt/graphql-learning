import { getJobs, getJob, getJobsByCompany } from './db/jobs.js'
import { getCompany } from './db/companies.js'
import { GraphQLError } from 'graphql'

export const resolvers = {
    Query: {
        jobs: () => getJobs(),
        job: async (_root, { id }) => { 
            const job = await getJob(id)
            if(!job)
                throw notFoundError('No Job found with id:' + id)
            return job
        },
        company: async (_root, { id }) => {
            const company = await getCompany(id)
            if(!company)
                throw notFoundError('No Company found with id:' + id)
            return company
        }
    },
    Company: {
        jobs: (company) => getJobsByCompany(company.id)
    },
    Job: {
        date: (job) => job.createdAt.slice(0, 'yyyy-mm-dd'.length),
        company: (job) => getCompany(job.companyId)
    }
}

function notFoundError(error){
    return new GraphQLError(error)
}