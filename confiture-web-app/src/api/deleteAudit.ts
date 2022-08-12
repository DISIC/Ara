import ky from "ky";

export async function deleteAudit(uniqueId: string): Promise<void> {
  await ky.delete(`/api/audits/${uniqueId}`);
}
