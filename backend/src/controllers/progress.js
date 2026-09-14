import * as progressService from '../services/progressService.js';
import { success } from '../utils/response.js';

const ownerOf = (req) => req.userId ?? '';

export async function getProgressHandler(req, res, next) {
    try {
        const data = await progressService.getProgress(ownerOf(req));
        success(res, data);
    }
    catch (err) {
        next(err);
    }
}

export async function addWeightHandler(req, res, next) {
    try {
        const weight = await progressService.addWeight(ownerOf(req), req.body);
        success(res, weight);
    }
    catch (err) {
        next(err);
    }
}

export async function updateWeightHandler(req, res, next) {
    try {
        const weight = await progressService.updateWeight(ownerOf(req), req.params.id, req.body);
        success(res, weight);
    }
    catch (err) {
        next(err);
    }
}

export async function deleteWeightHandler(req, res, next) {
    try {
        const deleted = await progressService.deleteWeight(ownerOf(req), req.params.id);
        success(res, deleted);
    }
    catch (err) {
        next(err);
    }
}

export async function addMeasurementHandler(req, res, next) {
    try {
        const measurement = await progressService.addMeasurement(ownerOf(req), req.body);
        success(res, measurement);
    }
    catch (err) {
        next(err);
    }
}

export async function updateMeasurementHandler(req, res, next) {
    try {
        const measurement = await progressService.updateMeasurement(ownerOf(req), req.params.id, req.body);
        success(res, measurement);
    }
    catch (err) {
        next(err);
    }
}

export async function deleteMeasurementHandler(req, res, next) {
    try {
        const deleted = await progressService.deleteMeasurement(ownerOf(req), req.params.id);
        success(res, deleted);
    }
    catch (err) {
        next(err);
    }
}