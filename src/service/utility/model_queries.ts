import { EntityTurn } from '../../model/entity_turn';
import { Session } from '../../model/session';

/**
   * Helper function to find an `EntityTurn` by entityUID in the session.
   * @param session The Session object containing entityTurns.
   * @param entityUID The entityUID to search for.
   * @returns The `EntityTurn` object if found, otherwise undefined.
   */
export function findEntityTurn(session: Session, entityUID: string): EntityTurn | undefined {
  return session.entityTurns.find(turn => turn.entityUID === entityUID);
}

// TODO: Helper fun to find an Entity form entityID