// client/src/lib/api.js

export const fetchAdminOverviewStats = async () => {
  const res = await fetch('/api/admin/overview');
  if (!res.ok) throw new Error('Failed to fetch admin overview stats');
  return res.json();
};

export const fetchProjectsSummary = async () => {
  const res = await fetch('/api/projects/summary');
  if (!res.ok) throw new Error('Failed to fetch project summary');
  return res.json();
};

export const fetchRevisionRequests = async () => {
  const res = await fetch('/api/revisions');
  if (!res.ok) throw new Error('Failed to fetch revision requests');
  return res.json();
};