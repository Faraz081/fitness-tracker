import * as profileService from '../services/profileService.js';
import { success } from '../utils/response.js';
export async function getProfileHandler(req, res) {
    const profile = await profileService.getProfile(req.userId ?? '');
    success(res, profile);
}
export async function updateProfileHandler(req, res) {
    const profile = await profileService.updateProfile(req.userId ?? '', req.body);
    success(res, profile);
}
