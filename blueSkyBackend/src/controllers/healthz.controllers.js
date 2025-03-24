import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncRequestHandler.js";

const healthz = asyncHandler(async (req, res) => {
    try {
        res.status(200).json(new ApiResponse(200, 'Healthz route', 'Route health OK'))
    } catch (error) {
        throw new ApiError(400, error?.message || 'Health not good')
    }
})

export {
    healthz
}
