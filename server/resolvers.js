import { getJobs, getJob, getJobsByCompany, createJob, deleteJob, updateJob } from './db/jobs.js'
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
    },
    Mutation: {
        createJob: (_root, { input }, { user }) => {
            if(!user)
                throw unauthorizedError('Request unauthenticated')
            const { title, description } = input
            const companyId = user.companyId
            return createJob({ companyId, title, description })
        },
        deleteJob: async (_root, { id }, { user }) =>  {
            if(!user)
                throw unauthorizedError('Request unauthenticated')
            const isDeleted = await deleteJob(id, user.companyId)
            if(!isDeleted)
                return notFoundError('Job not found with this ID:' + id + ' and company ID:' + user.companyId)
            return isDeleted
        },
        updateJob: async (_root, { input }, { user }) => {
            if(!user){
                throw unauthorizedError('Request unauthenticated')
            }
            const { id, title, description } = input
            const isUpdated = await updateJob({ id, title, description, companyId: user.companyId })
            if(!isUpdated)
                return notFoundError('Job not found with this ID:' + id + ' and company ID:' + user.companyId)
            return isUpdated
        }
    }
}

function notFoundError(error){
    return new GraphQLError(error, {
        extensions: { code: 'NOT_FOUND'}
    })
}
function unauthorizedError(error){
    return new GraphQLError(error, {
        extensions: { code: 'UNAUTHORIZED_USER'}
    })
}