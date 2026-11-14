import { queryOptions } from '@tanstack/react-query';
import { getAccount, getStaffData } from './paalam.functions';
export const accountOptions = queryOptions({queryKey:['paalam-account'], queryFn:()=>getAccount(), staleTime:30000});
export const staffOptions = queryOptions({queryKey:['paalam-staff'], queryFn:()=>getStaffData(), staleTime:30000});
