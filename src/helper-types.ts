import { ChildType } from '@stencil/core/dist/declarations';

type OneOrList<T> = T[] | T;
type ChildrenTypeSync = OneOrList<undefined | ChildType>;
export type ChildrenType = ChildrenTypeSync | Promise<ChildrenTypeSync>;
