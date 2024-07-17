import { WithUID } from '../db/firestore';

export class CachedToken implements WithUID {
  public uid?: string;

  constructor(
    public userUID: string,
    public token: string,
    public iat?: number,
    public exp?: number,
    public username?: string,
  ) { this.uid = token; }
}