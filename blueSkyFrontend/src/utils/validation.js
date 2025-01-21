const isNameValid = (name) => {
    const nameRegex = /^[a-zA-Z\s]{1,50}$/
    return nameRegex.test(name)
}

const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
    return passwordRegex.test(password)
}

const isUsernameValid = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,15}$/
    return usernameRegex.test(username)
}

const isDobValid = (dob) => {
    const userDob = new Date(dob)
    const today = new Date()

    const age = today.getFullYear() - userDob.getFullYear()
    const monthDiff = userDob.getMonth() - today.getMonth()

    if(monthDiff < 0 || (monthDiff === 0 && userDob.getDate() < today.getDate())){
        return age > 13
    }

    return age - 1 > 13
}

export {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isDobValid,
    isUsernameValid
}
