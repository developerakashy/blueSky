const formatDate = (createdAt) => {
    const past = new Date(createdAt)

    const month = past.toLocaleString('Default', {month: 'short'})
    const date = past.getDate()
    const year = past.getFullYear()

    return `${month} ${date}, ${year}`
}


export default formatDate
