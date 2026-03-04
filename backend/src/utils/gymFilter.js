/** Get gym filter for queries. If admin has no gym (legacy), returns {}. */
export function gymFilter(admin) {
  if (admin?.gym) return { gym: admin.gym };
  return {};
}
