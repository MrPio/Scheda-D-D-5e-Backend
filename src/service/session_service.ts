import { AugmentedRequest } from "../api";
import {Response as Res} from 'express';
import { RepositoryFactory } from "../repository/repository_factory";

export async function getAllSessionsService(req: AugmentedRequest, res: Res) {
    new RepositoryFactory().sessionRepository().getAll();
}

export async function createSessionService(req: AugmentedRequest, res: Res) {
    // TODO
}

export async function getSessionInfoService(req: AugmentedRequest, res: Res) {
    // TODO
}

export async function deleteSessionService(req: AugmentedRequest, res: Res) {
    // TODO
}

export async function startSessionService(req: AugmentedRequest, res: Res) {
    // TODO
}

export async function pauseSessionService(req: AugmentedRequest, res: Res) {
    // TODO
}

export async function continueSessionService(req: AugmentedRequest, res: Res) {
    // TODO
}

export async function stopSessionService(req: AugmentedRequest, res: Res) {
    // TODO
}