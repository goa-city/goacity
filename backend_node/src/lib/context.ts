import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
    cityId: number | undefined;
    adminId: number | undefined;
    memberId: number | undefined;
    isSuperAdmin: boolean | undefined;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getCityId = (): number | undefined => {
    return requestContext.getStore()?.cityId;
};
