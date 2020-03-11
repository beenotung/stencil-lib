import { VNode } from '@stencil/core/internal/stencil-core';
export type ChildType = VNode | number | string;

type OneOrList<T> = T[] | T;
type ChildrenTypeSync = OneOrList<undefined | ChildType>;
export type ChildrenType = ChildrenTypeSync | Promise<ChildrenTypeSync>;
