import { WithUID } from '../db/firestore';

export class CachedToken implements WithUID {
  public uid?: string;

  constructor(
    public token: string,
    public iat: number,
    public exp: number,
    public username: string,
    public userUID: string,
  ) { this.uid = token; }
}