const formatTimeLine = (createdAt) => {
    const now = new Date()
    const past = new Date(createdAt)

    const seconds = Math.floor((now - past) / 1000)
    if(seconds < 60) return `${seconds}s`

    const minutes = Math.floor((seconds) / 60)
    if(minutes < 60) return `${minutes}m`

    const hours = Math.floor((minutes) / 60)
    if(hours < 24) return `${hours}h`

    const days = Math.floor((hours) / 24)
    if(days === 1) return `Yesterday`

    const month = past.toLocaleString('default', { month: 'short' });
    const date = past.getDate()
    const year = past.getFullYear()

    return year === now.getFullYear() ? `${month} ${date}` : `${month} ${date}, ${year}`


}

export default formatTimeLine
