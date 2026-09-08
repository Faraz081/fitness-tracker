export function success(res, data, status = 200) {
    res.status(status).json({ success: true, data });
}
export function fail(res, status, message, code) {
    res.status(status).json({ success: false, error: { message, code } });
}
