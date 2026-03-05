/** Get gym filter for queries. If admin has no gym (legacy), returns {}. */
export function gymFilter(admin) {
  const gymId = admin?.gym?._id ?? admin?.gym;
  if (gymId) return { gym: gymId };
  return {};
}

/** Get gym filter from gymId. Use for req.gymId from authGym. */
export function gymFilterFromId(gymId) {
  return gymId ? { gym: gymId } : {};
}
