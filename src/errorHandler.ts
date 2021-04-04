import express from "express";

enum Errors {
    NOT_FOUND = "error 404 Not Found",
    SERVER_ERROR = "error 500 Internal Server Error",
    SCRAPE_ERROR = "Scraper failed",
}

interface ApiError {
    errorType: Errors;
    errorMessage: string;
    status: number;
    detailedError?: string;
}

function errorRes(errorType: Errors, errorMessage: string, status: number, detailedError?: string): ApiError {
    if (detailedError) {
        return { errorType, errorMessage, status, detailedError };
    }
    return { errorType, errorMessage, status };
}

export function errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(err.message);
    switch (err.message) {
        case Errors.NOT_FOUND:
            return res.status(404).send(errorRes(err.message, err.message, 404, req.body.detailedMessage));
        case Errors.SERVER_ERROR:
            return res.status(500).send(errorRes(err.message, err.message, 500, req.body.detailedMessage));
        case Errors.SCRAPE_ERROR:
            return res.status(409).send(errorRes(err.message, err.message, 409, req.body.detailedMessage));
        default:
            return res.status(500).send(errorRes(Errors.SERVER_ERROR, err.message, 500, req.body.detailedMessage));
    }
}

export function asyncError(mwFunction: any) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        Promise.resolve(mwFunction(req, res, next)).catch(next);
    };
}
