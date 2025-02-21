const formatTime = (createdAt) => {
        const past = new Date(createdAt)

        return past.toLocaleString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})
}

export default formatTime
