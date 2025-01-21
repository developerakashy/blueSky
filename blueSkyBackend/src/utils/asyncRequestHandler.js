const asyncHandler = (handelRequest) => {

    return (req, res, next) => {
        Promise.resolve(handelRequest(req, res, next)).catch(e => next(e))
    }
}

export { asyncHandler }
