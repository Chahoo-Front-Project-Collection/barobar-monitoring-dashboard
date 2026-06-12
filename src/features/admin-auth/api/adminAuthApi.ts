import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { requestJson, type RequestJsonOptions } from "@/shared/api";

export type AdminUser = {
  username: string;
};

export type AdminLoginInput = {
  username: string;
  password: string;
};

export const adminAuthQueryKeys = {
  me: ["admin-auth", "me"] as const,
};

export function fetchAdminMe(options?: RequestJsonOptions) {
  return requestJson<AdminUser>("/api/admin/me", options);
}

export function loginAdmin(input: AdminLoginInput, options?: RequestJsonOptions) {
  return requestJson<AdminUser>("/api/admin/login", {
    ...options,
    body: input,
    method: "POST",
  });
}

export function logoutAdmin(options?: RequestJsonOptions) {
  return requestJson<{ success: boolean }>("/api/admin/logout", {
    ...options,
    method: "POST",
  });
}

export function adminMeQueryOptions() {
  return queryOptions({
    queryKey: adminAuthQueryKeys.me,
    queryFn: () => fetchAdminMe(),
    retry: false,
  });
}

export function useAdminMe() {
  return useQuery(adminMeQueryOptions());
}

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminLoginInput) => loginAdmin(input),
    onSuccess: (adminUser) => {
      queryClient.setQueryData(adminAuthQueryKeys.me, adminUser);
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutAdmin(),
    onSettled: () => {
      queryClient.removeQueries({ queryKey: adminAuthQueryKeys.me });
    },
  });
}
