const formatDate = (createdAt, monthType='short') => {
    const past = new Date(createdAt)

    const month = past.toLocaleString('Default', {month: monthType})
    const date = past.getDate()
    const year = past.getFullYear()

    return `${month} ${date}, ${year}`
}


export default formatDate
