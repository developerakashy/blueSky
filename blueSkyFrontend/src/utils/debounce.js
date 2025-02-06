const debounce = (func, delay) => {
    let timeoutId

    const debouncedFunction =  (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
    }

    debouncedFunction.cancel = () => {
        clearTimeout(timeoutId)
    }

    return debouncedFunction
}



export default debounce
