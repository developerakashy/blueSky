import axios from "axios"

const buildQueryString = (params) => {
    const query = new URLSearchParams()

    if(params.page) query.append('page', params.page)
    if(params.limit) query.append('limit', params.limit)
    if(params.sortBy) query.append('sortBy', params.sortBy)
    if(params.sortType) query.append('sortType', params.sortType)
    if(params.userId) query.append('userId', params.userId)
    if(params.query) query.append('query', params.query)


    return query.toString()
}

export const fetchPosts = async (query) => {
    try {
        const params = {
            limit: 10,
            page: 1,
            sortBy: 'createdAt',
            sortType: 'hightolow',
            ...query
        }

        const searchString = buildQueryString(params)
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/post/?${searchString}`, {withCredentials: true})
        console.log(response.data.data)

        return response.data.data

    } catch (error) {
        console.log(error)
        throw error
    }
}
